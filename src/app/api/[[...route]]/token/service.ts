import { AddTokenFormPayload, TokensApiRequestData } from "@/lib/types";
import { TokenRepo } from "./repo";

export class TokenService {
  constructor(
    private _repo: TokenRepo
  ) {
    this._repo = _repo;
  }

  async findWithPaginate({ userId, page, teamIds }: TokensApiRequestData["query"] & { teamIds: string[], userId: string }) {
    const perPage = 10;
    const total = await this._repo.count({ userId, teamIds });
    const result = await this._repo.find({ userId, perPage, page, teamIds });
    return {
      page,
      total,
      perPage,
      data: result
    };
  }

  async create(body: AddTokenFormPayload & { userId: string }) {
    return this._repo.create(body);
  }

  async update(id: string, body: AddTokenFormPayload & { userId: string }) {
    return this._repo.update(id, body);
  }

  async delete(query: { userId: string, id: string }) {
    return this._repo.delete(query);
  }

  async share(query: { userId: string, id: string, teamId: string, entry: string, iv: string }) {
    return this._repo.update(query.id, {
      teamId: query.teamId,
      userId: query.userId,
      entry: query.entry,
      iv: query.iv,
    });
  }

  async findById(id: string) {
    return this._repo.findById(id);
  }
}
