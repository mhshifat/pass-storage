import { AddMemberFormPayload } from "@/lib/types";
import { Prisma, PrismaClient } from "@prisma/client";
import { DefaultArgs } from "@prisma/client/runtime/library";

const selectable = {
  user_id: true,
  org_id: true,
  created_at: true,
  updated_at: true,
  id: true,
}

export class MemberRepo {
  constructor(
    private _prisma: PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>
  ) {
    this._prisma = _prisma;
  }

  async count({ orgId }: { orgId: string }) {
    const total = await this._prisma.member.count({
      where: {
        org_id: orgId,
      },
    });
    return total;
  }

  async find({ orgId, perPage, page }: { orgId: string, perPage: number, page: number }) {
    const items = await this._prisma.member.findMany({
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

  async create({ orgId, ...body }: AddMemberFormPayload & { orgId: string }, db?: Omit<PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>, "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends">) {
    return (db || this._prisma).member.create({
      data: {
        user_id: body.userId,
        org_id: orgId,
      },
      select: selectable
    })
  }

  async update(id: string, { orgId, ...body }: AddMemberFormPayload & { orgId: string }) {
    const record = await this._prisma.member.findUnique({
      where: { id, org_id: orgId },
    });
    if (!record) throw new Error("Organization not found::404::404");
    return this._prisma.member.update({
      where: { id },
      data: {
        user_id: body.userId,
        org_id: orgId,
      },
      select: selectable
    })
  }

  async delete(query: { orgId: string, id: string }) {
    const record = await this._prisma.member.findUnique({
      where: { id: query.id, org_id: query.orgId },
    });
    if (!record) throw new Error("Organization not found::404::404");
    return this._prisma.member.delete({
      where: { id: query.id, org_id: query.orgId },
      select: selectable
    })
  }

  async findById(id: string) {
    return this._prisma.member.findUnique({
      where: {
        id,
      },
      select: selectable
    })
  }

  async findOne(query: { id?: string, orgId?: string }) {
    return this._prisma.member.findUnique({
      where: {
        id: query.id,
        org_id: query.orgId,
      },
      select: selectable
    })
  }
}
