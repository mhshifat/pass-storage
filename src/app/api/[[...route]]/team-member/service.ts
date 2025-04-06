import { AddTeamMemberFormPayload, TeamMembersApiRequestData } from "@/lib/types";
import { TeamMemberRepo } from "./repo";
import { Prisma } from "@prisma/client";

export class TeamMemberService {
  constructor(
    private _repo: TeamMemberRepo
  ) {
    this._repo = _repo;
  }

  async findWithPaginate({ teamId, page }: TeamMembersApiRequestData["query"] & { teamId: string }) {
    const perPage = 10;
    const total = await this._repo.count({ teamId });
    const result = await this._repo.find({ teamId, perPage, page });
    return {
      page,
      total,
      perPage,
      data: result
    };
  }

  async create(body: AddTeamMemberFormPayload & { teamId: string }) {
    return this._repo.create(body);
  }

  async update(id: string, body: AddTeamMemberFormPayload & { teamId: string }) {
    return this._repo.update(id, body);
  }

  async delete(query: { teamId: string, id: string }) {
    return this._repo.delete(query);
  }

  async findById(id: string) {
    return this._repo.findById(id);
  }

  async findByQuery(query: { id: string, teamId: string }) {
    return this._repo.findOne(query);
  }

  async findByMemberId(id: string) {
    const members = await this._repo.rawQuery(Prisma.sql`
      SELECT  tm.*
      FROM  team_members tm
      WHERE tm.member_id = ${id}
    `) as unknown as unknown[];

    return members[0];
  }
}
