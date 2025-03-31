import { generateToken, hashString, verifyHash } from "@/lib/server-only";
import { SignInDto, SignInFormPayload, SignUpFormPayload } from "@/lib/types";
import { UserService } from "../user/service";

export class AuthService {
  constructor(
    private _userSrv: UserService,
  ) {
    this._userSrv = _userSrv;
  }

  async register(body: SignUpFormPayload) {
    const user = await this._userSrv.findByEmail(body.email);
    if (user) throw new Error("User already exists::409");
    const hashPass = await hashString(body.password);
    return this._userSrv.create({
      ...body,
      password: hashPass
    })
  }

  async login(body: SignInFormPayload): Promise<SignInDto> {
    const user = await this._userSrv.findByEmail(body.email, ["credential"]);
    if (!user || !user.credential?.password) throw new Error("User not found::404");
    const isPassValid = await verifyHash(user.credential.password, body.password);
    if (!isPassValid) throw new Error("Invalid credentials::400");
    const accessToken = generateToken({ uid: user.id }, user.credential.password);
    return {
      access_token: accessToken,
      user: {
        id: user.id,
        email: user.credential.email
      }
    }
  }
}
