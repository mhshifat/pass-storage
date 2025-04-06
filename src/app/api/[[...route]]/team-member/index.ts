import { teamMemberCreateFormSchema, teamMemberDeleteRequestSchema, teamMemberUpdateRequestSchema } from "@/lib/validations";
import { Hono } from "hono";
import { teamMemberService, organizationService } from "../bootstrap";
import { ApiUtils } from "@/lib/api-utils";
import { APIResponse } from "@/lib/types";
import { getUserById } from "../helpers";

const teamMemberApi = new Hono()
  .post(
    "",
    async (ctx) => {
      const apiUtils = new ApiUtils(ctx.req, {
        auth: true,
        db: { getUserById }
      });
      const body = await ctx.req.json()
      return apiUtils
        .validate(teamMemberCreateFormSchema, body)
        .execute(async ({ user }) => {
          const org = await organizationService.findByQuery({
            id: body.orgId,
            userId: user!.id,
          });
          if (!org) throw new Error("Organization not found::404");
          const existingMember = await teamMemberService.findByMemberId(body.memberId);
          if (existingMember) throw new Error("Member already exists::409");
          const teamMember = await teamMemberService.create({
            ...body,
            orgId: body!.orgId
          });
          return ctx.json<APIResponse<object>>({
            success: true,
            data: teamMember
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
        .validate(teamMemberUpdateRequestSchema, {
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
          const team = await teamMemberService.update(id, {
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
        .validate(teamMemberDeleteRequestSchema, {
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

          const team = await teamMemberService.delete({
            id,
            teamId: query!.teamId
          });
          return ctx.json<APIResponse<object>>({
            success: true,
            data: team
          })
        })
    }
  );

export default teamMemberApi;
