import { AddOrganizationFormPayload, OrganizationsApiRequestData } from "@/lib/types";
import { OrganizationRepo } from "./repo";

export class OrganizationService {
  constructor(
    private _repo: OrganizationRepo
  ) {
    this._repo = _repo;
  }

  async findWithPaginate({ userId, page }: OrganizationsApiRequestData["query"] & { userId: string }) {
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

  async create(body: AddOrganizationFormPayload & { userId: string }) {
    return this._repo.create(body);
  }

  async update(id: string, body: AddOrganizationFormPayload & { userId: string }) {
    return this._repo.update(id, body);
  }

  async delete(query: { userId: string, id: string }) {
    return this._repo.delete(query);
  }

  async findById(id: string) {
    return this._repo.findById(id);
  }
}
