import { SignUpFormPayloadWithEncryptedData } from "@/lib/types";
import { Prisma, PrismaClient } from "@prisma/client";
import { DefaultArgs, Sql } from "@prisma/client/runtime/library";

export class UserRepo {
  constructor(
    private _prisma: PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>
  ) {
    this._prisma = _prisma;
  }

  async create(body: SignUpFormPayloadWithEncryptedData) {
    return this._prisma.user.create({
      data: {
        email: body.email,
        credential: {
          create: {
            password: body.password,
            provider: "email",
            salt: body.salt,
            vault_key_iv: body.vaultKeyIv,
            encrypted_vault_key: body.encryptedVaultKey,
          }
        }
      }
    })
  }

  async findByEmail(email: string, includes?: string[]) {
    return this._prisma.user.findFirst({
      where: {
        email
      },
      select: {
        id: true,
        email: true,
        ...includes?.includes("credential") ? {
          credential: true
        } : {}
      }
    })
  }

  async findById(id: string, includes?: string[]) {
    return this._prisma.user.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
        email: true,
        vault_keys: {
          select: {
            id: true,
            salt: true,
            encrypted_vault_key: true,
            vault_key_iv: true,
            team_id: true,
          }
        },
        ...includes?.includes("credential") ? {
          credential: true
        } : {},
        ...includes?.includes("teams") ? {
          members: {
            select: {
              teams: {
                select: {
                  team: {
                    select: {
                      id: true,
                      vault_keys: true
                    }
                  }
                }
              }
            }
          }
        } : {}
      }
    })
  }

  async find(query: { ids?: string[] }, includes?: string[]) {
    return this._prisma.user.findMany({
      where: {
        id: {
          ...query.ids?.length ? {
            in: query.ids
          } : {}
        },
      },
      select: {
        id: true,
        email: true,
        ...includes?.includes("credential") ? {
          credential: true
        } : {}
      }
    })
  }

  async rawQuery(query: Sql) {
    return this._prisma.$queryRaw(query)
  }
}
