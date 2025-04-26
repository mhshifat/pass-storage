import { inviteMemberFormSchema, inviteDeleteRequestSchema, invitationsApiRequestSchema, acceptInviteFormSchema } from "@/lib/validations";
import { Hono } from "hono";
import { invitationService, organizationService } from "../bootstrap";
import { ApiUtils } from "@/lib/api-utils";
import { APIResponse } from "@/lib/types";
import { getUserById } from "../helpers";

const invitationApi = new Hono()
  .get(
    "",
    async (ctx) => {
      const apiUtils = new ApiUtils(ctx.req, {
        auth: true,
        db: { getUserById }
      });
      const query = await ctx.req.query();
      return apiUtils
        .validate(invitationsApiRequestSchema, {
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
          const result = await invitationService.findWithPaginate({
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
        .validate(inviteMemberFormSchema, body)
        .execute(async ({ user }) => {
          const org = await organizationService.findByQuery({
            id: body.orgId,
            userId: user!.id,
          });
          if (!org) throw new Error("Organization not found::404::404");
          if (user?.email === body.email) throw new Error("Can't send invitation the existing members::403");
          const member = await organizationService.findMemberByQuery({
            orgId: body.orgId,
            email: body.email
          });
          console.log(member);
          if (member) throw new Error("Can't send invitation the existing members::403");
          const existingInvitation = await invitationService.findByEmail(body.email);
          if (existingInvitation) throw new Error("Already sent an invitation::409");
          const invitation = await invitationService.create({
            ...body,
            orgId: body!.orgId
          });
          return ctx.json<APIResponse<object>>({
            success: true,
            data: invitation
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
        .validate(inviteDeleteRequestSchema, {
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

          const team = await invitationService.delete({
            id,
            orgId: query!.orgId
          });
          return ctx.json<APIResponse<object>>({
            success: true,
            data: team
          })
        })
    }
  )
  .post(
    "/accept",
    async (ctx) => {
      const apiUtils = new ApiUtils(ctx.req, {
        auth: true,
        db: { getUserById }
      });
      const body = await ctx.req.json();
      return apiUtils
        .validate(acceptInviteFormSchema, body)
        .execute(async ({ user }) => {
          await invitationService.accept({
            userId: user!.id,
            invitationId: body.code
          });
          return ctx.json<APIResponse<object>>({
            success: true,
            data: {}
          })
        })
    }
  );

export default invitationApi;
