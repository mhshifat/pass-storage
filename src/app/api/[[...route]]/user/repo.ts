import { SignUpFormPayload } from "@/lib/types";
import { Prisma, PrismaClient } from "@prisma/client";
import { DefaultArgs } from "@prisma/client/runtime/library";

export class UserRepo {
  constructor(
    private _prisma: PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>
  ) {
    this._prisma = _prisma;
  }

  async create(body: SignUpFormPayload) {
    return this._prisma.user.create({
      data: {
        credential: {
          create: {
            email: body.email,
            password: body.password,
            provider: "email"
          }
        }
      }
    })
  }

  async findByEmail(email: string, includes?: string[]) {
    return this._prisma.user.findFirst({
      where: {
        credential: {
          email
        }
      },
      select: {
        id: true,
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
        ...includes?.includes("credential") ? {
          credential: true
        } : {}
      }
    })
  }
}
