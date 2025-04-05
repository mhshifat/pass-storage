import { AddMemberFormPayload, MembersApiRequestData } from "@/lib/types";
import { MemberRepo } from "./repo";

export class MemberService {
  constructor(
    private _repo: MemberRepo
  ) {
    this._repo = _repo;
  }

  async findWithPaginate({ orgId, page }: MembersApiRequestData["query"] & { orgId: string }) {
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

  async create(body: AddMemberFormPayload & { orgId: string }) {
    return this._repo.create(body);
  }

  async update(id: string, body: AddMemberFormPayload & { orgId: string }) {
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
