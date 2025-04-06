import { AddTeamMemberFormPayload } from "@/lib/types";
import { Prisma, PrismaClient } from "@prisma/client";
import { DefaultArgs, Sql } from "@prisma/client/runtime/library";

const selectable = {
  member_id: true,
  team_id: true,
  created_at: true,
  updated_at: true,
  id: true,
}

export class TeamMemberRepo {
  constructor(
    private _prisma: PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>
  ) {
    this._prisma = _prisma;
  }

  async count({ teamId }: { teamId: string }) {
    const total = await this._prisma.teamMember.count({
      where: {
        team_id: teamId,
      },
    });
    return total;
  }

  async find({ teamId, perPage, page }: { teamId: string, perPage: number, page: number }) {
    const items = await this._prisma.teamMember.findMany({
      where: {
        team_id: teamId,
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

  async create({ teamId, ...body }: AddTeamMemberFormPayload & { teamId: string }) {
    return this._prisma.teamMember.create({
      data: {
        member_id: body.memberId,
        team_id: teamId,
      },
      select: selectable
    })
  }

  async update(id: string, { teamId, ...body }: AddTeamMemberFormPayload & { teamId: string }) {
    const record = await this._prisma.teamMember.findUnique({
      where: { id, team_id: teamId },
    });
    if (!record) throw new Error("Organization not found::404::404");
    return this._prisma.teamMember.update({
      where: { id },
      data: {
        member_id: body.memberId,
        team_id: teamId,
      },
      select: selectable
    })
  }

  async delete(query: { teamId: string, id: string }) {
    const record = await this._prisma.teamMember.findUnique({
      where: { id: query.id, team_id: query.teamId },
    });
    if (!record) throw new Error("Organization not found::404::404");
    return this._prisma.teamMember.delete({
      where: { id: query.id, team_id: query.teamId },
      select: selectable
    })
  }

  async findById(id: string) {
    return this._prisma.teamMember.findUnique({
      where: {
        id,
      },
      select: selectable
    })
  }

  async findOne(query: { id?: string, teamId?: string }) {
    return this._prisma.teamMember.findUnique({
      where: {
        id: query.id,
        team_id: query.teamId,
      },
      select: selectable
    })
  }

  async rawQuery(query: Sql) {
    return this._prisma.$queryRaw(query)
  }
}
