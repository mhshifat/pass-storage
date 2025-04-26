import { AddTeamFormPayload, TeamDto, TeamsApiRequestData } from "@/lib/types";
import { TeamRepo } from "./repo";
import { Prisma, PrismaClient } from "@prisma/client";
import { DefaultArgs } from "@prisma/client/runtime/library";

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

  async create({encryptedVaultKey, vaultKeyIv, salt, userId, ...body}: AddTeamFormPayload & { orgId: string, userId: string }) {
    const data = await this._repo.transaction(async (tx) => {
      const team = await this._repo.create(body, tx);
      await this._repo.createVaultKey({
        teamId: team.id,
        userId: userId,
        encryptedVaultKey,
        salt,
        vaultKeyIv
      }, tx);
      return team;
    })
    return data as TeamDto;
  }

  async createVaultKey({encryptedVaultKey, vaultKeyIv, salt, userId, teamId}: Required<Pick<AddTeamFormPayload, "encryptedVaultKey" | "vaultKeyIv" | "salt">> & { userId: string, teamId: string }, db: Omit<PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>, "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends">) {
    return this._repo.createVaultKey({
      teamId: teamId,
      userId: userId,
      encryptedVaultKey,
      salt,
      vaultKeyIv
    }, db);
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
