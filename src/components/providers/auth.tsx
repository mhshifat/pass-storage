import { IUser, SignInFormPayload, SignUpFormPayload } from "@/lib/types";
import { PropsWithChildren, createContext, useCallback, useContext, useEffect, useState } from "react";
import useSignUpMutation from "../hooks/use-sign-up-mutation";
import CryptoJS from 'crypto-js';
import { useRouter, useSearchParams } from "next/navigation";
import { ROUTE_PATHS } from "@/lib/constants";
import useSignInMutation from "../hooks/use-sign-in-mutation";
import { storage } from "@/lib/storage";
import useMeQuery from "../hooks/use-me-query";
import { decryptVaultKey, encryptVaultKey, generateVaultKey, getDecryptedPassword, getOrCreateDeviceKey } from "@/lib/encryption";

interface AuthContextState {
  loading: boolean;
  user: IUser | null;
  vaultKey: string | null;
  onRegister: (payload: SignUpFormPayload) => Promise<void>;
  onLogin: (payload: SignInFormPayload) => Promise<void>;
  onLogout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextState | null>(null);

export default function AuthProvider({ children }: PropsWithChildren) {
  const { data: session, isLoading } = useMeQuery();
  const [user, setUser] = useState<IUser | null>(null);
  const [initializing, setInitializing] = useState(true);
  const [vaultKey, setVaultKey] = useState<string | null>(null);

  const signUp = useSignUpMutation();
  const signIn = useSignInMutation();
  const router = useRouter();
  const searchParams = useSearchParams();

  const from = searchParams.get("from");

  const onRegister = useCallback(async (payload: SignUpFormPayload) => {
    const vaultKey = generateVaultKey();
    const { encryptedVaultKey, salt, iv } = encryptVaultKey(vaultKey, payload.password);
    const encryptedData = {
      salt: salt,
      vaultKeyIv: iv,
      encryptedVaultKey: encryptedVaultKey,
    }
    await signUp.mutateAsync({
      ...payload,
      ...encryptedData
    });
    setInitializing(false);
    router.push(`${ROUTE_PATHS.SIGN_IN}?from=${from}`);
  }, [signUp, router, from]);

  const onLogin = useCallback(async (payload: SignInFormPayload) => {
    const data = await signIn.mutateAsync(payload);
    await storage.setAuthToken(data.accessToken);
    const deviceKey = getOrCreateDeviceKey();
    const encrypted = CryptoJS.AES.encrypt(payload.password, deviceKey).toString();
    await storage.setVaultIdentifier(encrypted);
    const vaultKey = await decryptVaultKey(data.user.encryptedVaultKey, payload.password, data.user.salt, data.user.vaultKeyIv);
    setVaultKey(vaultKey);
    if (from) router.replace(decodeURIComponent(from));
    else router.push(ROUTE_PATHS.DASHBOARD);
  }, [signIn, router, from]);

  const onLogout = useCallback(async () => {
    setInitializing(true);
    await storage.removeAuthToken();
    setUser(null);
    setInitializing(false);
    router.push(ROUTE_PATHS.HOME);
  }, [router]);

  const loading = initializing || isLoading || signUp.isPending || signIn.isPending || false;

  useEffect(() => {
    (async () => {
      if (isLoading && !session) return;
      const encrypted = await storage.getVaultIdentifier();
      const savedPassword = getDecryptedPassword(encrypted as string);
      if (savedPassword && user) {
        const decryptedVaultKey = decryptVaultKey(
          user.encryptedVaultKey,
          savedPassword,
          user.salt,
          user.vaultKeyIv
        );
        setVaultKey(decryptedVaultKey);
      }
      setUser(session || null);
      setInitializing(false);
    })()
  }, [session, isLoading, user])

  return (
    <AuthContext.Provider value={{
      loading,
      onRegister,
      onLogin,
      onLogout,
      user,
      vaultKey
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const res = useContext(AuthContext);
  if (!res) throw new Error(`Component needs to be wrapped with AuthProvider`);
  return res;
}
