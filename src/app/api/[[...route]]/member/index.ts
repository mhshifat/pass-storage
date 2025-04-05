import { addMemberFormSchema, memberDeleteRequestSchema, memberUpdateRequestSchema, membersApiRequestSchema } from "@/lib/validations";
import { Hono } from "hono";
import { memberService, organizationService, userService } from "../bootstrap";
import { ApiUtils } from "@/lib/api-utils";
import { APIResponse } from "@/lib/types";
import { getUserById } from "../helpers";

const memberApi = new Hono()
  .get(
    "",
    async (ctx) => {
      const apiUtils = new ApiUtils(ctx.req, {
        auth: true,
        db: { getUserById }
      });
      const query = await ctx.req.query();
      return apiUtils
        .validate(membersApiRequestSchema, {
          query: {
            page: +(query?.page || 1),
            orgId: query?.orgId,
          }
        })
        .execute(async ({ user }) => {
          const org = await organizationService.findByQuery({
            id: query.orgId,
            userId: user!.id,
          });
          if (!org) throw new Error("Organization not found");
          const result = await memberService.findWithPaginate({
            orgId: org!.id,
            page: +(query?.page || 1)
          });
          const userIds = result?.data?.map(item => item.user_id);
          const users = await userService.findByIds(userIds, ["credential"]);
          return ctx.json<APIResponse<object>>({
            success: true,
            data: {
              data: result.data.map(item => ({
                ...item,
                email: users.find(u => u.id === item.user_id)?.credential?.email
              }))
            }
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
        .validate(addMemberFormSchema, body)
        .execute(async ({ user }) => {
          const org = await organizationService.findByQuery({
            id: body.orgId,
            userId: user!.id,
          });
          if (!org) throw new Error("Organization not found");
          const team = await memberService.create({
            ...body,
            orgId: body!.orgId
          });
          return ctx.json<APIResponse<object>>({
            success: true,
            data: team
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
        .validate(memberUpdateRequestSchema, {
          params: {
            id
          },
          body: body
        })
        .execute(async ({ user }) => {
          const org = await organizationService.findByQuery({
            id: body.orgId,
            userId: user!.id,
          });
          if (!org) throw new Error("Organization not found");
          const team = await memberService.update(id, {
            ...body,
            orgId: body!.orgId
          });
          return ctx.json<APIResponse<object>>({
            success: true,
            data: team
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
      const query = ctx.req.query();
      const id = ctx.req.param('id')
      return apiUtils
        .validate(memberDeleteRequestSchema, {
          query: {
            orgId: query.orgId
          },
          params: {
            id
          },
        })
        .execute(async ({ user }) => {
          const org = await organizationService.findByQuery({
            id: query.orgId,
            userId: user!.id,
          });
          if (!org) throw new Error("Organization not found");

          const team = await memberService.delete({
            id,
            orgId: query!.orgId
          });
          return ctx.json<APIResponse<object>>({
            success: true,
            data: team
          })
        })
    }
  );

export default memberApi;
