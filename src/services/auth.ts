import { IHttp, http } from "@/lib/http";
import { ISession, IUser, SignInDto, SignInFormPayload, SignUpDto, SignUpFormPayloadWithEncryptedData, UserDto } from "@/lib/types";

class AuthApiService {
  private _http: IHttp;

  constructor(http: IHttp) {
    this._http = http;
  }

  async getMe() {
    const res = await this._http.get<UserDto>("/auth/me", {});
    if (!res.success) throw new Error(res.message);
    return this.transformUserDtoToUser(res.data);
  }

  private transformUserDtoToUser(data: UserDto): IUser {
    return {
      id: data.id,
      email: data.email,
      salt: data.salt,
      vaultKeyIv: data.vault_key_iv,
      encryptedVaultKey: data.encrypted_vault_key,
    }
  }

  async signUp(values: SignUpFormPayloadWithEncryptedData) {
    const res = await this._http.post<SignUpDto>("/auth", values);
    if (!res.success) throw new Error(res.message);
    return null;
  }

  async signIn(values: SignInFormPayload) {
    const res = await this._http.post<SignInDto>("/auth/me", values);
    if (!res.success) throw new Error(res.message);
    return this.transformSignInDtoToSession(res.data);
  }

  private transformSignInDtoToSession(data: SignInDto): ISession {
    return {
      accessToken: data.access_token,
      user: {
        id: data.user.id,
        email: data.user.email,
        salt: data.user.salt,
        vaultKeyIv: data.user.vault_key_iv,
        encryptedVaultKey: data.user.encrypted_vault_key,
      }
    }
  }
}

export const authApiService = new AuthApiService(http);
