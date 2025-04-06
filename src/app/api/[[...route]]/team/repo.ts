import { AddTeamFormPayload } from "@/lib/types";
import { Prisma, PrismaClient } from "@prisma/client";
import { DefaultArgs } from "@prisma/client/runtime/library";

const selectable = {
  name: true,
  description: true,
  created_at: true,
  updated_at: true,
  id: true,
}

export class TeamRepo {
  constructor(
    private _prisma: PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>
  ) {
    this._prisma = _prisma;
  }

  async count({ orgId }: { orgId: string }) {
    const total = await this._prisma.team.count({
      where: {
        org_id: orgId,
      },
    });
    return total;
  }

  async find({ orgId, perPage, page }: { orgId: string, perPage: number, page: number }, includes?: string[]) {
    const items = await this._prisma.team.findMany({
      where: {
        org_id: orgId,
      },
      select: {
        ...selectable,
        ...includes?.reduce<Record<string, boolean>>((acc, val) => {
          acc[val] = true;
          return acc;
        }, {}) || {},
        ...includes?.includes("members")?{
          members: {
            select: {
              id: true,
              member: {
                select: {
                  user: {
                    select: {
                      credential: {
                        select: {
                          email: true
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }:{}
      },
      skip: (perPage * page) - perPage,
      take: perPage,
      orderBy: {
        created_at: "desc"
      }
    });
    return items;
  }

  async create({ orgId, ...body }: AddTeamFormPayload & { orgId: string }) {
    return this._prisma.team.create({
      data: {
        ...body,
        org_id: orgId,
      },
      select: selectable
    })
  }

  async update(id: string, { orgId, ...body }: AddTeamFormPayload & { orgId: string }) {
    const record = await this._prisma.team.findUnique({
      where: { id, org_id: orgId },
    });
    if (!record) throw new Error("Organization not found::404::404");
    return this._prisma.team.update({
      where: { id },
      data: {
        ...body,
        org_id: orgId,
      },
      select: selectable
    })
  }

  async delete(query: { orgId: string, id: string }) {
    const record = await this._prisma.team.findUnique({
      where: { id: query.id, org_id: query.orgId },
    });
    if (!record) throw new Error("Organization not found::404::404");
    return this._prisma.team.delete({
      where: { id: query.id, org_id: query.orgId },
      select: selectable
    })
  }

  async findById(id: string) {
    return this._prisma.team.findUnique({
      where: {
        id,
      },
      select: selectable
    })
  }

  async findOne(query: { id?: string, orgId?: string }) {
    return this._prisma.team.findUnique({
      where: {
        id: query.id,
        org_id: query.orgId,
      },
      select: selectable
    })
  }
}
