import { AddOrganizationFormPayload, OrganizationsApiRequestData } from "@/lib/types";
import { OrganizationRepo } from "./repo";
import { Prisma } from "@prisma/client";

export class OrganizationService {
  constructor(
    private _repo: OrganizationRepo
  ) {
    this._repo = _repo;
  }

  async findWithPaginate({ userId, page }: OrganizationsApiRequestData["query"] & { userId: string }, includes?: string[]) {
    const perPage = 10;
    const total = await this._repo.count({ userId });
    const result = await this._repo.find({ userId, perPage, page }, includes);
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

  async findByQuery(query: { id: string, userId: string }) {
    return this._repo.findOne(query);
  }

  async findMemberByQuery({ email, orgId }: { email: string, orgId: string }) {
    const members = await this._repo.rawQuery(Prisma.sql`
      SELECT m.*
      FROM credentials c
      JOIN users u ON u.id = c.user_id
      JOIN members m ON m.user_id = u.id
      WHERE c.email = ${email} AND m.org_id = ${orgId}
    `) as unknown[];

    return members?.[0];
  }
}
