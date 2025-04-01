import { ApiUtils } from "@/lib/api-utils";
import { APIResponse, SignInDto, UserDto } from "@/lib/types";
import { signInFormSchema, signUpFormSchema } from "@/lib/validations";
import { Hono } from "hono";
import { authService } from "../bootstrap";
import { getUserById } from "../helpers";

const authApi = new Hono()
  .post(
    "",
    async (ctx) => {
      const apiUtils = new ApiUtils(ctx.req);
      const body = await ctx.req.json()
      return apiUtils
        .validate(signUpFormSchema, body)
        .execute(async () => {
          await authService.register(body);
          return ctx.json<APIResponse<object>>({
            success: true,
            data: {}
          })
        })
    }
  )
  .post(
    "/me",
    async (ctx) => {
      const apiUtils = new ApiUtils(ctx.req);
      const body = await ctx.req.json()
      return apiUtils
        .validate(signInFormSchema, body)
        .execute(async () => {
          const data = await authService.login(body);
          return ctx.json<APIResponse<SignInDto>>({
            success: true,
            data
          })
        })
    }
  )
  .get(
    "/me",
    async (ctx) => {
      const apiUtils = new ApiUtils(ctx.req, {
        auth: true,
        db: { getUserById }
      });
      return apiUtils
        .execute(async ({ user }) => {
          return ctx.json<APIResponse<UserDto | null>>({
            success: true,
            data: user
          })
        })
    }
  );

export default authApi;
