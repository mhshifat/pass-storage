import { organizationCreateFormSchema, organizationDeleteRequestSchema, organizationUpdateRequestSchema, organizationsApiRequestSchema } from "@/lib/validations";
import { Hono } from "hono";
import { organizationService } from "../bootstrap";
import { ApiUtils } from "@/lib/api-utils";
import { APIResponse } from "@/lib/types";
import { getUserById } from "../helpers";

const organizationApi = new Hono()
  .get(
    "",
    async (ctx) => {
      const apiUtils = new ApiUtils(ctx.req, {
        auth: true,
        db: { getUserById }
      });
      const query = await ctx.req.query();
      return apiUtils
        .validate(organizationsApiRequestSchema, {
          query: {
            page: +(query?.page || 1)
          }
        })
        .execute(async ({ user }) => {
          const result = await organizationService.findWithPaginate({
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
        .validate(organizationCreateFormSchema, body)
        .execute(async ({ user }) => {
          const organization = await organizationService.create({
            ...body,
            userId: user!.id
          });
          return ctx.json<APIResponse<object>>({
            success: true,
            data: organization
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
        .validate(organizationUpdateRequestSchema, {
          params: {
            id
          },
          body: body
        })
        .execute(async ({ user }) => {
          const organization = await organizationService.update(id, {
            ...body,
            userId: user!.id
          });
          return ctx.json<APIResponse<object>>({
            success: true,
            data: organization
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
        .validate(organizationDeleteRequestSchema, {
          params: {
            id
          },
        })
        .execute(async ({ user }) => {
          const organization = await organizationService.delete({
            id,
            userId: user!.id
          });
          return ctx.json<APIResponse<object>>({
            success: true,
            data: organization
          })
        })
    }
  );

export default organizationApi;
