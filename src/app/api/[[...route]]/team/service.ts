import { AddTeamFormPayload, TeamsApiRequestData } from "@/lib/types";
import { TeamRepo } from "./repo";

export class TeamService {
  constructor(
    private _repo: TeamRepo
  ) {
    this._repo = _repo;
  }

  async findWithPaginate({ orgId, page }: TeamsApiRequestData["query"] & { orgId: string }) {
    const perPage = 10;
    const total = await this._repo.count({ orgId });
    const result = await this._repo.find({ orgId, perPage, page }, ["members"]);
    return {
      page,
      total,
      perPage,
      data: result.map(r => ({
        ...r,
        members: r.members.map((item) => ({
          id: item.id,
          email: (item as unknown as { member: { user: { email: string } } }).member.user.email
        }))
      }))
    };
  }

  async create(body: AddTeamFormPayload & { orgId: string }) {
    return this._repo.create(body);
  }

  async update(id: string, body: AddTeamFormPayload & { orgId: string }) {
    return this._repo.update(id, body);
  }

  async delete(query: { orgId: string, id: string }) {
    return this._repo.delete(query);
  }

  async findById(id: string) {
    return this._repo.findById(id);
  }

  async findByQuery(query: { id: string, orgId: string }) {
    return this._repo.findOne(query);
  }
}
