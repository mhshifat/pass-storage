import { AddTokenFormPayload } from "@/lib/types";
import { Prisma, PrismaClient } from "@prisma/client";
import { DefaultArgs } from "@prisma/client/runtime/library";

const selectable = {
  created_at: true,
  entry: true,
  iv: true,
  updated_at: true,
  user_id: true,
  team_id: true,
  id: true,
  Team: {
    select: {
      name: true
    }
  }
}

export class TokenRepo {
  constructor(
    private _prisma: PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>
  ) {
    this._prisma = _prisma;
  }

  async count({ userId, teamIds }: { userId: string, teamIds: string[] }) {
    const total = await this._prisma.token.count({
      where: {
        OR: [
          {
            user_id: userId,
          },
          {
            team_id: { in: teamIds }
          }
        ]
      },
    });
    return total;
  }

  async find({ userId, perPage, page, teamIds }: { userId: string, perPage: number, page: number, teamIds: string[] }) {
    const items = await this._prisma.token.findMany({
      where: {
        OR: [
          {
            user_id: userId,
          },
          {
            team_id: { in: teamIds }
          }
        ]
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

  async create({ userId, ...body }: AddTokenFormPayload & { userId: string }) {
    return this._prisma.token.create({
      data: {
        ...body,
        user_id: userId,
      },
      select: selectable
    })
  }

  async update(id: string, { userId, teamId, ...body }: Partial<AddTokenFormPayload> & { userId: string }) {
    const record = await this._prisma.token.findUnique({
      where: { id, user_id: userId },
    });
    if (!record) throw new Error("Token not found::404");
    return this._prisma.token.update({
      where: { id },
      data: {
        ...body,
        user_id: userId,
        ...teamId? {
          team_id: teamId,
        }: {
          team_id: {
            set: null
          }
        },
      },
      select: selectable
    })
  }

  async delete(query: { userId: string, id: string }) {
    const record = await this._prisma.token.findUnique({
      where: { id: query.id, user_id: query.userId },
    });
    if (!record) throw new Error("Token not found::404");
    return this._prisma.token.delete({
      where: { id: query.id, user_id: query.userId },
      select: selectable
    })
  }

  async findById(id: string) {
    return this._prisma.token.findUnique({
      where: {
        id,
      },
      select: selectable
    })
  }
}
