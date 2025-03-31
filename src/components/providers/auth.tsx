import { IUser, SignInFormPayload, SignUpFormPayload } from "@/lib/types";
import { PropsWithChildren, createContext, useCallback, useContext, useEffect, useState } from "react";
import useSignUpMutation from "../hooks/use-sign-up-mutation";
import { useRouter } from "next/navigation";
import { ROUTE_PATHS } from "@/lib/constants";
import useSignInMutation from "../hooks/use-sign-in-mutation";
import { storage } from "@/lib/storage";
import useMeQuery from "../hooks/use-me-query";

interface AuthContextState {
  loading: boolean;
  user: IUser | null;
  onRegister: (payload: SignUpFormPayload) => Promise<void>;
  onLogin: (payload: SignInFormPayload) => Promise<void>;
  onLogout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextState | null>(null);

export default function AuthProvider({ children }: PropsWithChildren) {
  const { data: session, isLoading } = useMeQuery();
  const [user, setUser] = useState<IUser | null>(null);
  const [initializing, setInitializing] = useState(true);

  const signUp = useSignUpMutation();
  const signIn = useSignInMutation();
  const router = useRouter();

  const onRegister = useCallback(async (payload: SignUpFormPayload) => {
    await signUp.mutateAsync(payload);
    setInitializing(false);
    router.push(ROUTE_PATHS.SIGN_IN);
  }, [signUp, router]);

  const onLogin = useCallback(async (payload: SignInFormPayload) => {
    const data = await signIn.mutateAsync(payload);
    await storage.setAuthToken(data.accessToken);
    setUser(data.user);
    setInitializing(false);
    router.push(ROUTE_PATHS.DASHBOARD);
  }, [signIn, router]);

  const onLogout = useCallback(async () => {
    setInitializing(true);
    await storage.removeAuthToken();
    setUser(null);
    setInitializing(false);
    router.push(ROUTE_PATHS.HOME);
  }, [router]);

  const loading = initializing || isLoading || signUp.isPending || signIn.isPending || false;

  useEffect(() => {
    if (isLoading && !session) return;
    setUser(session || null);
    setInitializing(false);
  }, [session, isLoading])

  return (
    <AuthContext.Provider value={{
      loading,
      onRegister,
      onLogin,
      onLogout,
      user,
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
