import { tokenCreateFormSchema, tokenDeleteRequestSchema, tokenUpdateRequestSchema, tokensApiRequestSchema } from "@/lib/validations";
import { Hono } from "hono";
import { tokenService } from "../bootstrap";
import { ApiUtils } from "@/lib/api-utils";
import { APIResponse } from "@/lib/types";
import { getUserById } from "../helpers";

const tokenApi = new Hono()
  .get(
    "",
    async (ctx) => {
      const apiUtils = new ApiUtils(ctx.req, {
        auth: true,
        db: { getUserById }
      });
      const query = await ctx.req.query();
      return apiUtils
        .validate(tokensApiRequestSchema, {
          query: {
            page: +(query?.page || 1)
          }
        })
        .execute(async ({ user }) => {
          const result = await tokenService.findWithPaginate({
            userId: user!.id,
            page: +(query?.page || 1)
          });
          return ctx.json<APIResponse<object>>({
            success: true,
            data: result
          })
        })
    }
  )
  .post(
    "",
    async (ctx) => {
      const apiUtils = new ApiUtils(ctx.req, {
        auth: true,
        db: { getUserById }
      });
      const body = await ctx.req.json()
      return apiUtils
        .validate(tokenCreateFormSchema, body)
        .execute(async ({ user }) => {
          const token = await tokenService.create({
            ...body,
            userId: user!.id
          });
          return ctx.json<APIResponse<object>>({
            success: true,
            data: token
          })
        })
    }
  )
  .put(
    "/:id",
    async (ctx) => {
      const apiUtils = new ApiUtils(ctx.req, {
        auth: true,
        db: { getUserById }
      });
      const id = ctx.req.param('id')
      const body = await ctx.req.json()
      return apiUtils
        .validate(tokenUpdateRequestSchema, {
          params: {
            id
          },
          body: body
        })
        .execute(async ({ user }) => {
          const token = await tokenService.update(id, {
            ...body,
            userId: user!.id
          });
          return ctx.json<APIResponse<object>>({
            success: true,
            data: token
          })
        })
    }
  )
  .delete(
    "/:id",
    async (ctx) => {
      const apiUtils = new ApiUtils(ctx.req, {
        auth: true,
        db: { getUserById }
      });
      const id = ctx.req.param('id')
      return apiUtils
        .validate(tokenDeleteRequestSchema, {
          params: {
            id
          },
        })
        .execute(async ({ user }) => {
          const token = await tokenService.delete({
            id,
            userId: user!.id
          });
          return ctx.json<APIResponse<object>>({
            success: true,
            data: token
          })
        })
    }
  );

export default tokenApi;
