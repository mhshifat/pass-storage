import { AddOrganizationFormPayload } from "@/lib/types";
import { Prisma, PrismaClient } from "@prisma/client";
import { DefaultArgs, Sql } from "@prisma/client/runtime/library";

const selectable = {
  name: true,
  description: true,
  created_at: true,
  updated_at: true,
  user_id: true,
  id: true,
}

export class OrganizationRepo {
  constructor(
    private _prisma: PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>
  ) {
    this._prisma = _prisma;
  }

  async count({ userId }: { userId: string }) {
    const total = await this._prisma.organization.count({
      where: {
        OR: [
          { user_id: userId },
          {
            members: {
              some: {
                user_id: userId,
              },
            },
          },
        ],
      },
    });
    return total;
  }

  async find({ userId, perPage, page }: { userId: string, perPage: number, page: number }) {
    const items = await this._prisma.organization.findMany({
      where: {
        OR: [
          { user_id: userId },
          {
            members: {
              some: {
                user_id: userId,
              },
            },
          },
        ],
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

  async create({ userId, ...body }: AddOrganizationFormPayload & { userId: string }) {
    return this._prisma.organization.create({
      data: {
        ...body,
        user_id: userId,
      },
      select: selectable
    })
  }

  async update(id: string, { userId, ...body }: AddOrganizationFormPayload & { userId: string }) {
    const record = await this._prisma.organization.findUnique({
      where: { id, user_id: userId },
    });
    if (!record) throw new Error("Organization not found::404::404");
    return this._prisma.organization.update({
      where: { id },
      data: {
        ...body,
        user_id: userId,
      },
      select: selectable
    })
  }

  async delete(query: { userId: string, id: string }) {
    const record = await this._prisma.organization.findUnique({
      where: { id: query.id, user_id: query.userId },
    });
    if (!record) throw new Error("Organization not found::404::404");
    return this._prisma.organization.delete({
      where: { id: query.id, user_id: query.userId },
      select: selectable
    })
  }

  async findById(id: string) {
    return this._prisma.organization.findUnique({
      where: {
        id,
      },
      select: selectable
    })
  }

  async findOne(query: { id?: string, userId?: string }) {
    return this._prisma.organization.findFirst({
      where: {
        OR: [
          {
            id: query.id,
            user_id: query.userId,
          },
          {
            id: query.id,
            members: {
              some: {
                user_id: query.userId,
              }
            }
          }
        ]
      },
      select: selectable
    })
  }

  async rawQuery(query: Sql) {
    return this._prisma.$queryRaw(query)
  }
}
