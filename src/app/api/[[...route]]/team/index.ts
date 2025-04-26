import { teamCreateFormSchema, teamDeleteRequestSchema, teamUpdateRequestSchema, teamsApiRequestSchema } from "@/lib/validations";
import { Hono } from "hono";
import { teamService, organizationService } from "../bootstrap";
import { ApiUtils } from "@/lib/api-utils";
import { APIResponse } from "@/lib/types";
import { getUserById } from "../helpers";

const teamApi = new Hono()
  .get(
    "",
    async (ctx) => {
      const apiUtils = new ApiUtils(ctx.req, {
        auth: true,
        db: { getUserById }
      });
      const query = await ctx.req.query();
      return apiUtils
        .validate(teamsApiRequestSchema, {
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
          if (!org) throw new Error("Organization not found::404");
          const result = await teamService.findWithPaginate({
            orgId: org!.id,
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
        .validate(teamCreateFormSchema, body)
        .execute(async ({ user }) => {
          const org = await organizationService.findByQuery({
            id: body.orgId,
            userId: user!.id,
          });
          if (!org) throw new Error("Organization not found::404");
          const team = await teamService.create({
            ...body,
            orgId: body!.orgId,
            userId: user!.id,
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
        .validate(teamUpdateRequestSchema, {
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
          if (!org) throw new Error("Organization not found::404");
          const team = await teamService.update(id, {
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
        .validate(teamDeleteRequestSchema, {
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
          if (!org) throw new Error("Organization not found::404");

          const team = await teamService.delete({
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

export default teamApi;
