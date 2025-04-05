import { InviteMemberFormPayload } from "@/lib/types";
import { Prisma, PrismaClient } from "@prisma/client";
import { DefaultArgs, Sql } from "@prisma/client/runtime/library";

const selectable = {
  email: true,
  created_at: true,
  updated_at: true,
  id: true,
}

export class InvitationRepo {
  constructor(
    private _prisma: PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>
  ) {
    this._prisma = _prisma;
  }

  async count({ orgId }: { orgId: string }) {
    const total = await this._prisma.invitation.count({
      where: {
        org_id: orgId,
      },
    });
    return total;
  }

  async find({ orgId, perPage, page }: { orgId: string, perPage: number, page: number }) {
    const items = await this._prisma.invitation.findMany({
      where: {
        org_id: orgId,
      },
      select: selectable,
      skip: (perPage * page) - perPage,
      take: perPage,
      orderBy: {
        created_at: "desc"
      }
    });
    return items;
  }

  async create({ orgId, ...body }: InviteMemberFormPayload & { orgId: string }) {
    return this._prisma.invitation.create({
      data: {
        ...body,
        org_id: orgId,
      },
      select: selectable
    })
  }

  async update(id: string, { orgId, ...body }: InviteMemberFormPayload & { orgId: string }) {
    const record = await this._prisma.invitation.findUnique({
      where: { id, org_id: orgId },
    });
    if (!record) throw new Error("Organization not found::404");
    return this._prisma.invitation.update({
      where: { id },
      data: {
        ...body,
        org_id: orgId,
      },
      select: selectable
    })
  }

  async delete(query: { orgId: string, id: string }) {
    const record = await this._prisma.invitation.findUnique({
      where: { id: query.id, org_id: query.orgId },
    });
    if (!record) throw new Error("Organization not found::404");
    return this._prisma.invitation.delete({
      where: { id: query.id, org_id: query.orgId },
      select: selectable
    })
  }

  async findById(id: string, includes?: string[]) {
    return this._prisma.invitation.findUnique({
      where: {
        id,
      },
      select: {
        ...selectable,
        ...includes?.reduce<Record<string, boolean>>((acc, val) => {
          acc[val] = true;
          return acc;
        }, {}) || {}
      }
    })
  }

  async findOne(query: { id?: string, orgId?: string, email?: string }) {
    return this._prisma.invitation.findUnique({
      where: {
        id: query.id,
        org_id: query.orgId,
        email: query.email,
      },
      select: selectable
    })
  }

  async rawQuery(query: Sql) {
    return this._prisma.$queryRaw(query)
  }
}
