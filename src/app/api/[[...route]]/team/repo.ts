import { AddTeamFormPayload } from "@/lib/types";
import { Prisma, PrismaClient } from "@prisma/client";
import { DefaultArgs } from "@prisma/client/runtime/library";

const selectable = {
  name: true,
  description: true,
  created_at: true,
  updated_at: true,
  id: true,
}

export class TeamRepo {
  constructor(
    private _prisma: PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>
  ) {
    this._prisma = _prisma;
  }

  async count({ orgId }: { orgId: string }) {
    const total = await this._prisma.team.count({
      where: {
        org_id: orgId,
      },
    });
    return total;
  }

  async find({ orgId, perPage, page }: { orgId: string, perPage: number, page: number }, includes?: string[]) {
    const items = await this._prisma.team.findMany({
      where: {
        org_id: orgId,
      },
      select: {
        ...selectable,
        ...includes?.reduce<Record<string, boolean>>((acc, val) => {
          acc[val] = true;
          return acc;
        }, {}) || {},
        ...includes?.includes("members")?{
          members: {
            select: {
              id: true,
              member: {
                select: {
                  user: {
                    select: {
                      email: true
                    }
                  }
                }
              }
            }
          }
        }:{}
      },
      skip: (perPage * page) - perPage,
      take: perPage,
      orderBy: {
        created_at: "desc"
      }
    });
    return items;
  }

  async create({ orgId, ...body }: Omit<AddTeamFormPayload, "encryptedVaultKey" | "vaultKeyIv" | "salt"> & { orgId: string }, db: Omit<PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>, "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends">) {
    return (db || this._prisma).team.create({
      data: {
        ...body,
        org_id: orgId,
      },
      select: selectable
    })
  }

  async createVaultKey(body: Pick<AddTeamFormPayload, "encryptedVaultKey" | "vaultKeyIv" | "salt"> & { teamId: string; userId: string }, db: Omit<PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>, "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends">) {
    return (db || this._prisma).teamVaultKey.create({
      data: {
        encrypted_vault_key: body.encryptedVaultKey!,
        vault_key_iv: body.vaultKeyIv!,
        salt: body.salt!,
        team_id: body.teamId,
        user_id: body.userId,
      },
      select: {
        id: true
      }
    })
  }

  async update(id: string, { orgId, ...body }: AddTeamFormPayload & { orgId: string }) {
    const record = await this._prisma.team.findUnique({
      where: { id, org_id: orgId },
    });
    if (!record) throw new Error("Organization not found::404");
    return this._prisma.team.update({
      where: { id },
      data: {
        ...body,
        org_id: orgId,
      },
      select: selectable
    })
  }

  async delete(query: { orgId: string, id: string }) {
    const record = await this._prisma.team.findUnique({
      where: { id: query.id, org_id: query.orgId },
    });
    if (!record) throw new Error("Organization not found::404");
    return this._prisma.team.delete({
      where: { id: query.id, org_id: query.orgId },
      select: selectable
    })
  }

  async findById(id: string) {
    return this._prisma.team.findUnique({
      where: {
        id,
      },
      select: selectable
    })
  }

  async findOne(query: { id?: string, orgId?: string }) {
    return this._prisma.team.findUnique({
      where: {
        id: query.id,
        org_id: query.orgId,
      },
      select: selectable
    })
  }

  async transaction(callback: (arg0: Omit<PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>, "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends">) => Promise<unknown>) {
    return this._prisma.$transaction((tx) => callback(tx))
  }
}
