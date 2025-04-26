import { InviteMemberFormPayload, InvitationsApiRequestData, IInvitation } from "@/lib/types";
import { InvitationRepo } from "./repo";
import { memberService, teamService } from "../bootstrap";

export class InvitationService {
  constructor(
    private _repo: InvitationRepo
  ) {
    this._repo = _repo;
  }

  async findWithPaginate({ orgId, page }: InvitationsApiRequestData["query"] & { orgId: string }) {
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

  async create(body: InviteMemberFormPayload & { orgId: string }) {
    return this._repo.create(body);
  }

  async update(id: string, body: InviteMemberFormPayload & { orgId: string }) {
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

  async findByEmail(email: string) {
    return this._repo.findOne({ email });
  }

  async accept(args: { userId: string, invitationId: string, salt: string, vaultKeyIv: string, encryptedVaultKey: string }) {
    const invitation = await this._repo.findById(args.invitationId, ["org_id", "team_id"]) as unknown as IInvitation & { org_id: string, team_id: string };
    if (!invitation) throw new Error("Invitation not found::404");

    await this._repo.transaction(async (tx) => {
      await teamService.createVaultKey({
        salt: args.salt,
        vaultKeyIv: args.vaultKeyIv,
        encryptedVaultKey: args.encryptedVaultKey,
        userId: args.userId,
        teamId: invitation.team_id
      }, tx)
      await memberService.create({
        orgId: invitation.org_id,
        userId: args.userId
      }, tx);
      await this._repo.delete({
        orgId: invitation.org_id,
        id: args.invitationId
      }, tx);
    })
  }
}
