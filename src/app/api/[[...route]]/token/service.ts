import { AddTokenFormPayload, TokensApiRequestData } from "@/lib/types";
import { TokenRepo } from "./repo";

export class TokenService {
  constructor(
    private _repo: TokenRepo
  ) {
    this._repo = _repo;
  }

  async findWithPaginate({ userId, page }: TokensApiRequestData["query"] & { userId: string }) {
    const perPage = 10;
    const total = await this._repo.count({ userId });
    const result = await this._repo.find({ userId, perPage, page });
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

  async findById(id: string) {
    return this._repo.findById(id);
  }
}
