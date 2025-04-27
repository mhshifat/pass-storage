import { HonoRequest } from "hono";
import { ZodSchema } from "zod";
import { decodeToken, verifyToken } from "./server-only";
import { IAuthJwt, UserDto, VaultKeyDto } from "./types";
import { getUserById } from "@/app/api/[[...route]]/helpers";

type ValidatorRequestData = {
  query?: Record<string, unknown>;
  params?: Record<string, unknown>;
  body?: Record<string, unknown>;
} | Record<string, unknown>;

const requests = new Map();

export class ApiUtils {
  private _validators: ZodSchema | null = null;
  private _validatorRequestData: ValidatorRequestData = {};

  constructor(
    private _req: HonoRequest,
    private _config?: { auth?: boolean; db: { getUserById(id: string): ReturnType<typeof getUserById> } }
  ) {
    this._req = _req;
    this._config = _config;
  }

  execute = async (fn: (args: { user: UserDto & { vault_keys: VaultKeyDto[], teams: { id: string }[] } | null }) => Promise<Response>) => {
    try {
      await this.handleRateLimiting();
      const initRes = await this.init();
      if (this._validators) {
        const isValid = await this.handleValidation();
        if (typeof isValid !== "boolean") return isValid;
      }
      return await fn({
        user: initRes?.user ? {
          id: initRes.user.id,
          email: initRes.user.email,
          encrypted_vault_key: initRes.user.encrypted_vault_key,
          vault_key_iv: initRes.user.vault_key_iv,
          salt: initRes.user.salt,
          teams: initRes.user.teams || [],
          vault_keys: initRes.user.vault_keys || [],
        } : null
      });
    } catch (err) {
      console.log(err);
      const [message, statusCode] = (err instanceof Error ? (err?.message || "") : "Something went wrong").split("::");
      return new Response(JSON.stringify({
        success: false,
        message
      }), { status: statusCode ? +statusCode : 500 });
    }
  }

  validate = <T extends ZodSchema>(
    schema: T,
    data: ValidatorRequestData
  ) => {
    this._validators = schema;
    this._validatorRequestData = data;
    return this;
  }

  private async init() {
    if (!this._config || !this._config?.auth) return;
    const token = this._req.header("Authorization")?.replace("Bearer", "");
    if (!token) throw new Error("Invalid token::401");
    const { uid } = decodeToken<IAuthJwt>(token);
    if (!uid) throw new Error("Invalid token::401");
    const user = await this._config.db.getUserById(uid);
    if (!user || !user?.password) throw new Error("Invalid token::401");
    const tokenVerifiedRes = verifyToken<IAuthJwt>(token, user.password);
    if (!tokenVerifiedRes) throw new Error("Invalid token::401");
    delete (user as unknown as { password?: string }).password;
    return { user };
  }

  private async handleRateLimiting () {
    const ip = this._req.header("CF-Connecting-IP") || "127.0.0.1";
    const now = Date.now();
    const windowMs = 60 * 1000; // 1 minute
    const maxRequests = 5;

    if (!requests.has(ip)) {
      requests.set(ip, []);
    }

    const timestamps = requests.get(ip).filter((t: number) => now - t < windowMs);
    timestamps.push(now);

    if (timestamps.length > maxRequests) return new Response(JSON.stringify({
      success: false,
      message: "Rate limit exceeded"
    }), { status: 429 });

    requests.set(ip, timestamps);
  }

  private handleValidation = async () => {
    try {
      await this._validators!.parseAsync(this._validatorRequestData);
      return true;
    } catch (err) {
      if (typeof err === "object") {
        return new Response(JSON.stringify({
          success: false,
          message: "Invalid fields",
          errors: (err as { errors: unknown[] })?.errors
        }), { status: 422 })
      }
      console.log(err);
      return new Response(JSON.stringify({
        success: false,
        message: "Something went wrong",
      }), { status: 500 })
    }
  }
}
