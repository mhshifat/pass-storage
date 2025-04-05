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
    const result = await this._repo.find({ orgId, perPage, page });
    return {
      page,
      total,
      perPage,
      data: result
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
