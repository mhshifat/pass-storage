import prisma from "@/lib/prisma"
import { createTRPCRouter, protectedProcedure } from "@/trpc/init"
import z from "zod"
import { encrypt, decrypt } from "@/lib/crypto"
import { TRPCError } from "@trpc/server"

export const passwordsRouter = createTRPCRouter({
  list: protectedProcedure("password.view")
    .input(
      z.object({
        page: z.number().min(1).default(1),
        pageSize: z.number().min(1).max(100).default(10),
        search: z.string().optional(),
        filter: z.enum(["weak", "expiring", "favorites"]).optional(),
        tagIds: z.array(z.string()).optional(),
      }).optional()
    )
    .query(async ({ input = {}, ctx }) => {
      const { page = 1, pageSize = 10, search, filter, tagIds } = input

      // Get teams where the user is a member
      const userTeams = await prisma.teamMember.findMany({
        where: {
          userId: ctx.userId,
        },
        select: {
          teamId: true,
        },
      })

      const teamIds = userTeams.map((tm) => tm.teamId)

      // Build search conditions
      const searchConditions = search
        ? {
            OR: [
              { name: { contains: search, mode: "insensitive" as const } },
              { username: { contains: search, mode: "insensitive" as const } },
              { url: { contains: search, mode: "insensitive" as const } },
            ],
          }
        : {}

      // Build filter conditions for password-level filters (strength, password expiration, favorites)
      const passwordFilterConditions: {
        strength?: "WEAK" | "MEDIUM" | "STRONG"
        expiresAt?: { not: null; gte: Date; lte: Date }
        isFavorite?: boolean
      } = {}
      if (filter === "weak") {
        passwordFilterConditions.strength = "WEAK"
      } else if (filter === "expiring") {
        const now = new Date()
        const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
        passwordFilterConditions.expiresAt = {
          not: null,
          gte: now,
          lte: sevenDaysFromNow,
        }
      } else if (filter === "favorites") {
        passwordFilterConditions.isFavorite = true
      }

      // Build tag filter conditions
      const tagFilterConditions = tagIds && tagIds.length > 0
        ? {
            tags: {
              some: {
                tagId: { in: tagIds },
              },
            },
          }
        : {}

      // Build share filter conditions for expiring filter
      const now = new Date()
      const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)

      // Query passwords that are either:
      // 1. Owned by the user, OR
      // 2. Shared with teams where the user is a member (not expired)
      const where = {
        OR: [
          // Passwords owned by the user
          {
            ownerId: ctx.userId,
            ...searchConditions,
            ...passwordFilterConditions,
            ...tagFilterConditions,
          },
          // For owned passwords: also check if any share is expiring (when filter is "expiring")
          ...(filter === "expiring"
            ? [
                {
                  ownerId: ctx.userId,
                  sharedWith: {
                    some: {
                      expiresAt: {
                        not: null,
                        gte: now,
                        lte: sevenDaysFromNow,
                      },
                    },
                  },
                  ...searchConditions,
                },
              ]
            : []),
          // Passwords shared with teams the user is a member of
          ...(teamIds.length > 0
            ? [
                // For expiring filter: check share expiration for shared passwords
                ...(filter === "expiring"
                  ? [
                      {
                        sharedWith: {
                          some: {
                            teamId: { in: teamIds },
                            expiresAt: {
                              not: null,
                              gte: now,
                              lte: sevenDaysFromNow,
                            },
                          },
                        },
                        ...searchConditions,
                      },
                    ]
                  : [
                      // For other filters or no filter: check normal share conditions
                      // Shared passwords with no expiration
                      {
                        sharedWith: {
                          some: {
                            teamId: { in: teamIds },
                            expiresAt: null,
                          },
                        },
                        ...searchConditions,
                        ...passwordFilterConditions,
                      },
                      // Shared passwords that haven't expired
                      {
                        sharedWith: {
                          some: {
                            teamId: { in: teamIds },
                            expiresAt: { gt: new Date() },
                          },
                        },
                        ...searchConditions,
                        ...passwordFilterConditions,
                        ...tagFilterConditions,
                      },
                    ]),
              ]
            : []),
        ],
      }

      const [passwords, total] = await Promise.all([
        prisma.password.findMany({
          where,
          select: {
            id: true,
            name: true,
            username: true,
            url: true,
            folderId: true,
            strength: true,
            hasTotp: true,
            expiresAt: true,
            isFavorite: true,
            createdAt: true,
            updatedAt: true,
            ownerId: true,
            folder: {
              select: {
                id: true,
                name: true,
              },
            },
            tags: {
              select: {
                tag: {
                  select: {
                    id: true,
                    name: true,
                    color: true,
                    icon: true,
                  },
                },
              },
            },
            sharedWith: {
            select: {
              id: true,
              teamId: true,
              expiresAt: true,
              team: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
          },
          orderBy: {
            createdAt: "desc",
          },
          skip: (page - 1) * pageSize,
          take: pageSize,
        }),
        prisma.password.count({ where }),
      ])

      const totalPages = Math.ceil(total / pageSize)

      return {
        passwords: passwords.map((pwd) => ({
          id: pwd.id,
          name: pwd.name,
          username: pwd.username,
          url: pwd.url,
          folder: pwd.folder?.name || null,
          folderId: pwd.folderId,
          strength: pwd.strength.toLowerCase() as "strong" | "medium" | "weak",
          hasTotp: pwd.hasTotp,
          shared: pwd.sharedWith.length > 0,
          sharedWith: pwd.sharedWith.map((share) => ({
            shareId: share.id,
            teamId: share.teamId,
            teamName: share.team?.name || "",
            expiresAt: share.expiresAt,
          })),
          isOwner: pwd.ownerId === ctx.userId,
          isFavorite: pwd.isFavorite,
          tags: pwd.tags.map((pt) => ({
            id: pt.tag.id,
            name: pt.tag.name,
            color: pt.tag.color,
            icon: pt.tag.icon,
          })),
          lastModified: pwd.updatedAt.toISOString().split("T")[0],
          expiresIn: pwd.expiresAt
            ? Math.ceil((pwd.expiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
            : null,
          createdAt: pwd.createdAt,
        })),
        pagination: {
          page,
          pageSize,
          total,
          totalPages,
        },
      }
    }),

  create: protectedProcedure("password.create")
    .input(
      z.object({
        name: z.string().min(1, "Name is required"),
        username: z.string().min(1, "Username is required"),
        password: z.string().min(1, "Password is required"),
        url: z
          .string()
          .refine((val) => !val || val === "" || z.string().url().safeParse(val).success, {
            message: "Must be a valid URL",
          })
          .optional()
          .nullable(),
        folderId: z.string().optional().nullable(),
        notes: z.string().optional().nullable(),
        totpSecret: z.string().optional().nullable(),
        tagIds: z.array(z.string()).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Encrypt the password
      const encryptedPassword = await encrypt(input.password)

      // Encrypt TOTP secret if provided
      let encryptedTotpSecret: string | null = null
      if (input.totpSecret) {
        encryptedTotpSecret = await encrypt(input.totpSecret)
      }

      // Calculate password strength (simple implementation)
      // You can enhance this with a proper strength checker
      let strength: "STRONG" | "MEDIUM" | "WEAK" = "MEDIUM"
      if (input.password.length >= 16 && /[A-Z]/.test(input.password) && /[a-z]/.test(input.password) && /[0-9]/.test(input.password) && /[^A-Za-z0-9]/.test(input.password)) {
        strength = "STRONG"
      } else if (input.password.length < 8) {
        strength = "WEAK"
      }

      // Create password
      const password = await prisma.password.create({
        data: {
          name: input.name,
          username: input.username,
          password: encryptedPassword,
          url: input.url || null,
          folderId: input.folderId || null,
          notes: input.notes || null,
          strength,
          hasTotp: !!input.totpSecret,
          totpSecret: encryptedTotpSecret,
          ownerId: ctx.userId,
        },
        select: {
          id: true,
          name: true,
          username: true,
          url: true,
          folderId: true,
          strength: true,
          hasTotp: true,
          createdAt: true,
        },
      })

      // Assign tags if provided
      if (input.tagIds && input.tagIds.length > 0) {
        // Verify tags exist
        const tags = await prisma.tag.findMany({
          where: {
            id: { in: input.tagIds },
          },
        })

        if (tags.length !== input.tagIds.length) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "One or more tags not found",
          })
        }

        // Create password-tag relationships
        await prisma.passwordTag.createMany({
          data: input.tagIds.map((tagId) => ({
            passwordId: password.id,
            tagId,
          })),
          skipDuplicates: true,
        })
      }

      // Save password history (initial version)
      const { savePasswordHistory } = await import("@/lib/password-history")
      await savePasswordHistory(
        password.id,
        {
          name: input.name,
          username: input.username,
          password: encryptedPassword,
          url: input.url || null,
          notes: input.notes || null,
          folderId: input.folderId || null,
          strength,
          hasTotp: !!input.totpSecret,
          totpSecret: encryptedTotpSecret,
          expiresAt: null,
        },
        ctx.userId,
        "CREATE"
      )

      // Create audit log
      const { createAuditLog } = await import("@/lib/audit-log")
      await createAuditLog({
        action: "PASSWORD_CREATED",
        resource: "Password",
        resourceId: password.id,
        details: { name: password.name, hasTotp: password.hasTotp, tagIds: input.tagIds },
        userId: ctx.userId,
      })

      return { password }
    }),

  update: protectedProcedure("password.edit")
    .input(
      z.object({
        id: z.string().min(1, "Password ID is required"),
        name: z.string().min(1, "Name is required"),
        username: z.string().min(1, "Username is required"),
        password: z.string().min(1, "Password is required"),
        url: z
          .string()
          .refine((val) => !val || val === "" || z.string().url().safeParse(val).success, {
            message: "Must be a valid URL",
          })
          .optional()
          .nullable(),
        folderId: z.string().optional().nullable(),
        notes: z.string().optional().nullable(),
        totpSecret: z.string().optional().nullable(),
        tagIds: z.array(z.string()).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Check if password exists and user owns it, get current data for history
      const existingPassword = await prisma.password.findFirst({
        where: {
          id: input.id,
          ownerId: ctx.userId,
        },
        select: {
          id: true,
          ownerId: true,
          name: true,
          username: true,
          password: true,
          url: true,
          notes: true,
          folderId: true,
          strength: true,
          hasTotp: true,
          totpSecret: true,
          expiresAt: true,
        },
      })

      if (!existingPassword) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Password not found",
        })
      }

      // Save current state to history before updating
      const { savePasswordHistory } = await import("@/lib/password-history")
      await savePasswordHistory(
        input.id,
        {
          name: existingPassword.name,
          username: existingPassword.username,
          password: existingPassword.password,
          url: existingPassword.url,
          notes: existingPassword.notes,
          folderId: existingPassword.folderId,
          strength: existingPassword.strength,
          hasTotp: existingPassword.hasTotp,
          totpSecret: existingPassword.totpSecret,
          expiresAt: existingPassword.expiresAt,
        },
        ctx.userId,
        "UPDATE"
      )

      // Encrypt the password
      const encryptedPassword = await encrypt(input.password)

      // Encrypt TOTP secret if provided
      let encryptedTotpSecret: string | null = null
      if (input.totpSecret) {
        encryptedTotpSecret = await encrypt(input.totpSecret)
      }

      // Calculate password strength
      let strength: "STRONG" | "MEDIUM" | "WEAK" = "MEDIUM"
      if (input.password.length >= 16 && /[A-Z]/.test(input.password) && /[a-z]/.test(input.password) && /[0-9]/.test(input.password) && /[^A-Za-z0-9]/.test(input.password)) {
        strength = "STRONG"
      } else if (input.password.length < 8) {
        strength = "WEAK"
      }

      // Update password
      const password = await prisma.password.update({
        where: { id: input.id },
        data: {
          name: input.name,
          username: input.username,
          password: encryptedPassword,
          url: input.url || null,
          folderId: input.folderId || null,
          notes: input.notes || null,
          strength,
          hasTotp: !!input.totpSecret,
          totpSecret: encryptedTotpSecret,
        },
        select: {
          id: true,
          name: true,
          username: true,
          url: true,
          folderId: true,
          strength: true,
          hasTotp: true,
          updatedAt: true,
        },
      })

      // Update tags if provided
      if (input.tagIds !== undefined) {
        // Get current tags
        const currentTags = await prisma.passwordTag.findMany({
          where: { passwordId: input.id },
          select: { tagId: true },
        })
        const currentTagIds = currentTags.map((pt) => pt.tagId)

        // Verify new tags exist
        if (input.tagIds.length > 0) {
          const tags = await prisma.tag.findMany({
            where: {
              id: { in: input.tagIds },
            },
          })

          if (tags.length !== input.tagIds.length) {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: "One or more tags not found",
            })
          }
        }

        // Find tags to add and remove
        const tagsToAdd = input.tagIds.filter((tagId) => !currentTagIds.includes(tagId))
        const tagsToRemove = currentTagIds.filter((tagId) => !input.tagIds.includes(tagId))

        // Add new tags
        if (tagsToAdd.length > 0) {
          await prisma.passwordTag.createMany({
            data: tagsToAdd.map((tagId) => ({
              passwordId: input.id,
              tagId,
            })),
            skipDuplicates: true,
          })
        }

        // Remove tags
        if (tagsToRemove.length > 0) {
          await prisma.passwordTag.deleteMany({
            where: {
              passwordId: input.id,
              tagId: { in: tagsToRemove },
            },
          })
        }
      }

      // Create audit log
      const { createAuditLog } = await import("@/lib/audit-log")
      await createAuditLog({
        action: "PASSWORD_UPDATED",
        resource: "Password",
        resourceId: password.id,
        details: { name: password.name, tagIds: input.tagIds },
        userId: ctx.userId,
      })

      return { password }
    }),

  getById: protectedProcedure("password.view")
    .input(
      z.object({
        id: z.string().min(1, "Password ID is required"),
      })
    )
    .query(async ({ input, ctx }) => {
      // Get teams where the user is a member
      const userTeams = await prisma.teamMember.findMany({
        where: {
          userId: ctx.userId,
        },
        select: {
          teamId: true,
        },
      })

      const teamIds = userTeams.map((tm) => tm.teamId)

      // Find password that is either owned by user or shared with user's teams
      const password = await prisma.password.findFirst({
        where: {
          id: input.id,
          OR: [
            // Password owned by user
            { ownerId: ctx.userId },
            // Password shared with teams user is a member of (not expired)
            ...(teamIds.length > 0
              ? [
                  // Shared with no expiration
                  {
                    sharedWith: {
                      some: {
                        teamId: { in: teamIds },
                        expiresAt: null,
                      },
                    },
                  },
                  // Shared but not expired
                  {
                    sharedWith: {
                      some: {
                        teamId: { in: teamIds },
                        expiresAt: { gt: new Date() },
                      },
                    },
                  },
                ]
              : []),
          ],
        },
          select: {
            id: true,
            name: true,
            username: true,
            password: true, // Encrypted
            url: true,
            notes: true,
            folderId: true,
            strength: true,
            hasTotp: true,
            totpSecret: true, // Encrypted
            expiresAt: true,
            isFavorite: true,
            createdAt: true,
            updatedAt: true,
            ownerId: true, // Include ownerId to determine ownership
          folder: {
            select: {
              id: true,
              name: true,
            },
          },
          tags: {
            select: {
              id: true,
              tag: {
                select: {
                  id: true,
                  name: true,
                  color: true,
                  icon: true,
                },
              },
            },
          },
          sharedWith: {
            select: {
              id: true,
              teamId: true,
              expiresAt: true,
              team: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
          rotationPolicyId: true,
          rotationPolicy: {
            select: {
              id: true,
              name: true,
              rotationDays: true,
              reminderDays: true,
              autoRotate: true,
              requireApproval: true,
              isActive: true,
            },
          },
        },
      })

      if (!password) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Password not found",
        })
      }

      // Decrypt password
      const decryptedPassword = decrypt(password.password)
      
      // Decrypt TOTP secret if exists
      let decryptedTotpSecret: string | null = null
      if (password.totpSecret) {
        decryptedTotpSecret = decrypt(password.totpSecret)
      }

      // Check if user owns the password
      const isOwner = password.ownerId === ctx.userId

      return {
        id: password.id,
        name: password.name,
        username: password.username,
        password: decryptedPassword,
        url: password.url,
        notes: password.notes,
        folder: password.folder?.name || null,
        folderId: password.folderId,
        strength: password.strength.toLowerCase() as "strong" | "medium" | "weak",
        hasTotp: password.hasTotp,
        totpSecret: decryptedTotpSecret,
        shared: password.sharedWith.length > 0,
        sharedWith: password.sharedWith.map((share) => ({
          shareId: share.id,
          teamId: share.teamId,
          teamName: share.team?.name || "",
          expiresAt: share.expiresAt,
        })),
        isOwner,
        isFavorite: password.isFavorite,
        tags: password.tags.map((pt) => ({
          id: pt.tag.id,
          name: pt.tag.name,
          color: pt.tag.color,
          icon: pt.tag.icon,
        })),
        lastModified: password.updatedAt.toISOString().split("T")[0],
        expiresIn: password.expiresAt
          ? Math.ceil((password.expiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
          : null,
        createdAt: password.createdAt,
        rotationPolicyId: password.rotationPolicyId,
        rotationPolicy: password.rotationPolicy,
      }
    }),

  getPasswordShares: protectedProcedure("password.view")
    .input(
      z.object({
        passwordId: z.string().min(1, "Password ID is required"),
      })
    )
    .query(async ({ input, ctx }) => {
      // Check if password exists and user owns it
      const password = await prisma.password.findFirst({
        where: {
          id: input.passwordId,
          ownerId: ctx.userId,
        },
        select: {
          id: true,
        },
      })

      if (!password) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Password not found or you don't have permission to view shares",
        })
      }

      // Get all shares for this password
      const shares = await prisma.passwordShare.findMany({
        where: {
          passwordId: input.passwordId,
          teamId: { not: null }, // Only team shares
        },
        select: {
          id: true,
          teamId: true,
          createdAt: true,
          expiresAt: true,
          team: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      })

      return {
        shares: shares.map((share) => ({
          id: share.id,
          teamId: share.teamId,
          teamName: share.team?.name || "",
          createdAt: share.createdAt.toISOString(),
          expiresAt: share.expiresAt?.toISOString() || null,
        })),
      }
    }),

  generateTotp: protectedProcedure("password.view")
    .input(
      z.object({
        id: z.string().min(1, "Password ID is required"),
      })
    )
    .query(async ({ input, ctx }) => {
      // Get teams where the user is a member
      const userTeams = await prisma.teamMember.findMany({
        where: {
          userId: ctx.userId,
        },
        select: {
          teamId: true,
        },
      })

      const teamIds = userTeams.map((tm) => tm.teamId)

      // Find password that is either owned by user or shared with user's teams
      const password = await prisma.password.findFirst({
        where: {
          id: input.id,
          OR: [
            // Password owned by user
            { ownerId: ctx.userId },
            // Password shared with teams user is a member of (not expired)
            ...(teamIds.length > 0
              ? [
                  // Shared with no expiration
                  {
                    sharedWith: {
                      some: {
                        teamId: { in: teamIds },
                        expiresAt: null,
                      },
                    },
                  },
                  // Shared but not expired
                  {
                    sharedWith: {
                      some: {
                        teamId: { in: teamIds },
                        expiresAt: { gt: new Date() },
                      },
                    },
                  },
                ]
              : []),
          ],
        },
        select: {
          id: true,
          hasTotp: true,
          totpSecret: true, // Encrypted
        },
      })

      if (!password) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Password not found",
        })
      }

      if (!password.hasTotp || !password.totpSecret) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "TOTP is not enabled for this password",
        })
      }

      // Decrypt TOTP secret
      const decryptedTotpSecret = decrypt(password.totpSecret)

      // Generate TOTP code using otplib
      const { authenticator } = await import("otplib")
      const totpCode = authenticator.generate(decryptedTotpSecret)

      return { totpCode }
    }),

  getPassword: protectedProcedure("password.view")
    .input(
      z.object({
        id: z.string().min(1, "Password ID is required"),
      })
    )
    .query(async ({ input, ctx }) => {
      // Get teams where the user is a member
      const userTeams = await prisma.teamMember.findMany({
        where: {
          userId: ctx.userId,
        },
        select: {
          teamId: true,
        },
      })

      const teamIds = userTeams.map((tm) => tm.teamId)

      // Find password that is either owned by user or shared with user's teams
      const password = await prisma.password.findFirst({
        where: {
          id: input.id,
          OR: [
            // Password owned by user
            { ownerId: ctx.userId },
            // Password shared with teams user is a member of (not expired)
            ...(teamIds.length > 0
              ? [
                  // Shared with no expiration
                  {
                    sharedWith: {
                      some: {
                        teamId: { in: teamIds },
                        expiresAt: null,
                      },
                    },
                  },
                  // Shared but not expired
                  {
                    sharedWith: {
                      some: {
                        teamId: { in: teamIds },
                        expiresAt: { gt: new Date() },
                      },
                    },
                  },
                ]
              : []),
          ],
        },
        select: {
          id: true,
          password: true, // Encrypted
        },
      })

      if (!password) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Password not found",
        })
      }

      // Create audit log for password view
      const { createAuditLog } = await import("@/lib/audit-log")
      await createAuditLog({
        action: "PASSWORD_VIEWED",
        resource: "Password",
        resourceId: password.id,
        userId: ctx.userId,
      })

      // Decrypt password
      const decryptedPassword = decrypt(password.password)

      return { password: decryptedPassword }
    }),

  delete: protectedProcedure("password.delete")
    .input(
      z.object({
        id: z.string().min(1, "Password ID is required"),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Check if password exists and user owns it
      const existingPassword = await prisma.password.findFirst({
        where: {
          id: input.id,
          ownerId: ctx.userId,
        },
      })

      if (!existingPassword) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Password not found",
        })
      }

      // Create audit log before deletion
      const { createAuditLog } = await import("@/lib/audit-log")
      await createAuditLog({
        action: "PASSWORD_DELETED",
        resource: "Password",
        resourceId: input.id,
        details: { name: existingPassword.name },
        userId: ctx.userId,
      })

      // Delete the password (cascade will handle related records)
      await prisma.password.delete({
        where: {
          id: input.id,
        },
      })

      return { success: true }
    }),

  stats: protectedProcedure("password.view")
    .query(async ({ ctx }) => {
      // Get teams where the user is a member
      const userTeams = await prisma.teamMember.findMany({
        where: {
          userId: ctx.userId,
        },
        select: {
          teamId: true,
        },
      })
      const teamIds = userTeams.map((tm) => tm.teamId)

      // Build where clause for passwords accessible to user
      const where = {
        OR: [
          // Passwords owned by the user
          { ownerId: ctx.userId },
          // Passwords shared with teams the user is a member of (not expired)
          ...(teamIds.length > 0
            ? [
                // Shared with no expiration
                {
                  sharedWith: {
                    some: {
                      teamId: { in: teamIds },
                      expiresAt: null,
                    },
                  },
                },
                // Shared but not expired
                {
                  sharedWith: {
                    some: {
                      teamId: { in: teamIds },
                      expiresAt: { gt: new Date() },
                    },
                  },
                },
              ]
            : []),
        ],
      }

      // Get all accessible passwords for counting, including share expiration info
      // We need to get all shares to check expiration, so we'll fetch them separately
      const allPasswords = await prisma.password.findMany({
        where,
        select: {
          id: true,
          strength: true,
          expiresAt: true, // Password's own expiration
          isFavorite: true,
          createdAt: true,
          ownerId: true,
        },
      })

      // Get all shares for these passwords to check expiration
      const passwordIds = allPasswords.map((p) => p.id)
      const allShares = await prisma.passwordShare.findMany({
        where: {
          passwordId: { in: passwordIds },
          OR: [
            // Shares for teams the user is in
            ...(teamIds.length > 0 ? [{ teamId: { in: teamIds } }] : []),
            // All shares for passwords the user owns (to check all share expirations)
            {
              password: {
                ownerId: ctx.userId,
              },
            },
          ],
        },
        select: {
          passwordId: true,
          expiresAt: true,
          teamId: true,
        },
      })

      // Map shares to passwords
      const sharesByPasswordId = new Map<string, typeof allShares>()
      for (const share of allShares) {
        if (!sharesByPasswordId.has(share.passwordId)) {
          sharesByPasswordId.set(share.passwordId, [])
        }
        sharesByPasswordId.get(share.passwordId)!.push(share)
      }

      const total = allPasswords.length

      // Count by strength
      const strongCount = allPasswords.filter((p) => p.strength === "STRONG").length
      const weakCount = allPasswords.filter((p) => p.strength === "WEAK").length
      const mediumCount = allPasswords.filter((p) => p.strength === "MEDIUM").length

      // Count expiring soon (within 7 days)
      // Check both password expiration and share expiration
      const now = new Date()
      const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
      const expiringSoon = allPasswords.filter((p) => {
        // Check password's own expiration (for passwords the user owns)
        if (p.ownerId === ctx.userId && p.expiresAt && p.expiresAt > now && p.expiresAt <= sevenDaysFromNow) {
          return true
        }
        
        // Check share expiration
        // Get shares for this password that the user has access to
        const shares = sharesByPasswordId.get(p.id) || []
        
        // Check if any share expires within 7 days
        // For owned passwords: check all shares
        // For shared passwords: check shares for teams the user is in
        return shares.some((share) => {
          if (!share.expiresAt) return false
          
          const expiresAt = new Date(share.expiresAt)
          const isExpiringSoon = expiresAt > now && expiresAt <= sevenDaysFromNow
          
          if (!isExpiringSoon) return false
          
          // If user owns the password, include all shares
          if (p.ownerId === ctx.userId) return true
          
          // If user doesn't own it, only include shares for teams they're in
          return share.teamId !== null && teamIds.includes(share.teamId)
        })
      }).length

      // Calculate percentage of strong passwords
      const strongPercentage = total > 0 ? Math.round((strongCount / total) * 100) : 0

      // Count passwords created in the last 30 days
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
      const recentCount = allPasswords.filter((p) => p.createdAt >= thirtyDaysAgo).length

      // Count favorite passwords (only owned by user)
      const favoritesCount = allPasswords.filter((p) => p.isFavorite && p.ownerId === ctx.userId).length

      return {
        total,
        strong: strongCount,
        medium: mediumCount,
        weak: weakCount,
        expiringSoon,
        strongPercentage,
        recentCount,
        favorites: favoritesCount,
      }
    }),

  importPreview: protectedProcedure("password.create")
    .input(
      z.object({
        content: z.string().min(1, "File content is required"),
        format: z.enum(["csv", "json", "1password", "lastpass", "bitwarden", "keepass"]).optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      const { parsePasswordFile } = await import("@/lib/password-import/parsers")
      const result = parsePasswordFile(input.content, input.format)

      return {
        passwords: result.passwords,
        errors: result.errors,
        warnings: result.warnings,
        totalRows: result.totalRows,
        validRows: result.validRows,
        invalidRows: result.invalidRows,
      }
    }),

  importCommit: protectedProcedure("password.create")
    .input(
      z.object({
        passwords: z.array(
          z.object({
            name: z.string().min(1),
            username: z.string().min(1),
            password: z.string().min(1),
            url: z.string().optional().nullable(),
            notes: z.string().optional().nullable(),
            folderId: z.string().optional().nullable(),
            totpSecret: z.string().optional().nullable(),
          })
        ),
        skipInvalid: z.boolean().default(true),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { createAuditLog } = await import("@/lib/audit-log")
      const created: string[] = []
      const errors: string[] = []

      for (let i = 0; i < input.passwords.length; i++) {
        const item = input.passwords[i]

        try {
          // Validate required fields
          if (!item.name || !item.username || !item.password) {
            if (!input.skipInvalid) {
              errors.push(`Row ${i + 1}: Missing required fields`)
            }
            continue
          }

          // Encrypt the password
          const encryptedPassword = await encrypt(item.password)

          // Encrypt TOTP secret if provided
          let encryptedTotpSecret: string | null = null
          if (item.totpSecret) {
            encryptedTotpSecret = await encrypt(item.totpSecret)
          }

          // Calculate password strength
          let strength: "STRONG" | "MEDIUM" | "WEAK" = "MEDIUM"
          if (item.password.length >= 16 && /[A-Z]/.test(item.password) && /[a-z]/.test(item.password) && /[0-9]/.test(item.password) && /[^A-Za-z0-9]/.test(item.password)) {
            strength = "STRONG"
          } else if (item.password.length < 8) {
            strength = "WEAK"
          }

          // Create password
          const password = await prisma.password.create({
            data: {
              name: item.name,
              username: item.username,
              password: encryptedPassword,
              url: item.url || null,
              folderId: item.folderId || null,
              notes: item.notes || null,
              strength,
              hasTotp: !!item.totpSecret,
              totpSecret: encryptedTotpSecret,
              ownerId: ctx.userId,
            },
            select: {
              id: true,
              name: true,
            },
          })

          created.push(password.id)

          // Create audit log
          await createAuditLog({
            action: "PASSWORD_CREATED",
            resource: "Password",
            resourceId: password.id,
            details: { name: password.name, imported: true },
            userId: ctx.userId,
          })
        } catch (error) {
          errors.push(`Row ${i + 1}: ${error instanceof Error ? error.message : "Unknown error"}`)
        }
      }

      return {
        success: true,
        created: created.length,
        errors: errors.length,
        createdIds: created,
        errorMessages: errors,
      }
    }),

  export: protectedProcedure("password.view")
    .input(
      z.object({
        format: z.enum(["csv", "json", "bitwarden", "lastpass", "encrypted"]).default("csv"),
        folderId: z.string().optional(),
        tagIds: z.array(z.string()).optional(),
        dateFrom: z.string().optional(), // ISO date string
        dateTo: z.string().optional(), // ISO date string
        includeShared: z.boolean().default(false),
        encryptionKey: z.string().optional(), // For encrypted exports
      })
    )
    .query(async ({ input, ctx }) => {
      // Get teams where the user is a member
      const userTeams = await prisma.teamMember.findMany({
        where: {
          userId: ctx.userId,
        },
        select: {
          teamId: true,
        },
      })
      const teamIds = userTeams.map((tm) => tm.teamId)

      // Build where clause for passwords accessible to user
      const passwordWhere: any = {
        OR: [
          { ownerId: ctx.userId },
          ...(input.includeShared && teamIds.length > 0
            ? [
                {
                  sharedWith: {
                    some: {
                      teamId: { in: teamIds },
                      OR: [
                        { expiresAt: null },
                        { expiresAt: { gt: new Date() } },
                      ],
                    },
                  },
                },
              ]
            : []),
        ],
      }

      // Apply folder filter
      if (input.folderId) {
        passwordWhere.folderId = input.folderId
      }

      // Apply tag filter
      if (input.tagIds && input.tagIds.length > 0) {
        passwordWhere.tags = {
          some: {
            tagId: { in: input.tagIds },
          },
        }
      }

      // Apply date range filter
      if (input.dateFrom || input.dateTo) {
        passwordWhere.createdAt = {}
        if (input.dateFrom) {
          passwordWhere.createdAt.gte = new Date(input.dateFrom)
        }
        if (input.dateTo) {
          passwordWhere.createdAt.lte = new Date(input.dateTo)
        }
      }

      // Fetch passwords with related data
      const passwords = await prisma.password.findMany({
        where: passwordWhere,
        include: {
          folder: {
            select: {
              name: true,
            },
          },
          tags: {
            include: {
              tag: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      })

      // Decrypt passwords and format for export
      const exportPasswords = await Promise.all(
        passwords.map(async (pwd) => {
          const decryptedPassword = await decrypt(pwd.password)
          
          return {
            name: pwd.name,
            username: pwd.username,
            password: decryptedPassword,
            url: pwd.url || null,
            notes: pwd.notes || null,
            folder: pwd.folder?.name || null,
            tags: pwd.tags.map((pt) => pt.tag.name),
            strength: pwd.strength,
            hasTotp: pwd.hasTotp,
            expiresAt: pwd.expiresAt?.toISOString() || null,
            createdAt: pwd.createdAt.toISOString(),
            updatedAt: pwd.updatedAt.toISOString(),
          }
        })
      )

      // Generate export based on format
      const { 
        exportToCSV, 
        exportToJSON, 
        exportToBitwardenJSON, 
        exportToLastPassCSV,
        exportToEncrypted 
      } = await import("@/lib/password-export/exporters")

      let content: string
      let mimeType: string
      let fileExtension: string

      switch (input.format) {
        case "csv":
          content = exportToCSV(exportPasswords, true)
          mimeType = "text/csv"
          fileExtension = "csv"
          break
        case "json":
          content = exportToJSON(exportPasswords, true)
          mimeType = "application/json"
          fileExtension = "json"
          break
        case "bitwarden":
          content = exportToBitwardenJSON(exportPasswords)
          mimeType = "application/json"
          fileExtension = "json"
          break
        case "lastpass":
          content = exportToLastPassCSV(exportPasswords)
          mimeType = "text/csv"
          fileExtension = "csv"
          break
        case "encrypted":
          if (!input.encryptionKey) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: "Encryption key is required for encrypted exports",
            })
          }
          content = await exportToEncrypted(exportPasswords, input.encryptionKey)
          mimeType = "application/json"
          fileExtension = "json"
          break
        default:
          content = exportToCSV(exportPasswords, true)
          mimeType = "text/csv"
          fileExtension = "csv"
      }

      // Create audit log
      const { createAuditLog } = await import("@/lib/audit-log")
      await createAuditLog({
        action: "PASSWORD_EXPORTED",
        resource: "Password",
        details: {
          format: input.format,
          count: exportPasswords.length,
          folderId: input.folderId,
          tagIds: input.tagIds,
          dateFrom: input.dateFrom,
          dateTo: input.dateTo,
        },
        userId: ctx.userId,
      })

      return {
        content,
        mimeType,
        fileExtension,
        count: exportPasswords.length,
      }
    }),

  getExportFilters: protectedProcedure("password.view")
    .query(async ({ ctx }) => {
      // Get folders accessible to user
      const folders = await prisma.folder.findMany({
        select: {
          id: true,
          name: true,
        },
        orderBy: {
          name: "asc",
        },
      })

      // Get tags (if tags are used)
      const tags = await prisma.tag.findMany({
        select: {
          id: true,
          name: true,
          color: true,
          icon: true,
        },
        orderBy: {
          name: "asc",
        },
      })

      return {
        folders,
        tags,
      }
    }),

  bulkDelete: protectedProcedure("password.delete")
    .input(
      z.object({
        passwordIds: z.array(z.string()).min(1, "At least one password ID is required"),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Verify user owns all passwords or has permission to delete shared passwords
      const passwords = await prisma.password.findMany({
        where: {
          id: { in: input.passwordIds },
        },
        select: {
          id: true,
          ownerId: true,
          name: true,
        },
      })

      // Check ownership - user can only delete their own passwords
      const unauthorized = passwords.filter((p) => p.ownerId !== ctx.userId)
      if (unauthorized.length > 0) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: `You don't have permission to delete ${unauthorized.length} password(s)`,
        })
      }

      // Delete passwords
      const { createAuditLog } = await import("@/lib/audit-log")
      const deleted = await prisma.password.deleteMany({
        where: {
          id: { in: input.passwordIds },
          ownerId: ctx.userId, // Double-check ownership
        },
      })

      // Create audit log for each deleted password
      for (const password of passwords) {
        await createAuditLog({
          action: "PASSWORD_DELETED",
          resource: "Password",
          resourceId: password.id,
          details: { name: password.name, bulk: true },
          userId: ctx.userId,
        })
      }

      return {
        success: true,
        deleted: deleted.count,
      }
    }),

  bulkMoveToFolder: protectedProcedure("password.edit")
    .input(
      z.object({
        passwordIds: z.array(z.string()).min(1, "At least one password ID is required"),
        folderId: z.string().nullable(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Verify user owns all passwords
      const passwords = await prisma.password.findMany({
        where: {
          id: { in: input.passwordIds },
        },
        select: {
          id: true,
          ownerId: true,
          name: true,
        },
      })

      const unauthorized = passwords.filter((p) => p.ownerId !== ctx.userId)
      if (unauthorized.length > 0) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: `You don't have permission to move ${unauthorized.length} password(s)`,
        })
      }

      // Verify folder exists if folderId is provided
      if (input.folderId) {
        const folder = await prisma.folder.findUnique({
          where: { id: input.folderId },
        })
        if (!folder) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Folder not found",
          })
        }
      }

      // Update passwords
      const updated = await prisma.password.updateMany({
        where: {
          id: { in: input.passwordIds },
          ownerId: ctx.userId,
        },
        data: {
          folderId: input.folderId || null,
        },
      })

      // Create audit log
      const { createAuditLog } = await import("@/lib/audit-log")
      for (const password of passwords) {
        await createAuditLog({
          action: "PASSWORD_UPDATED",
          resource: "Password",
          resourceId: password.id,
          details: { name: password.name, folderId: input.folderId, bulk: true },
          userId: ctx.userId,
        })
      }

      return {
        success: true,
        updated: updated.count,
      }
    }),

  bulkAssignTags: protectedProcedure("password.edit")
    .input(
      z.object({
        passwordIds: z.array(z.string()).min(1, "At least one password ID is required"),
        tagIds: z.array(z.string()).min(1, "At least one tag ID is required"),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Verify user owns all passwords
      const passwords = await prisma.password.findMany({
        where: {
          id: { in: input.passwordIds },
        },
        select: {
          id: true,
          ownerId: true,
        },
      })

      const unauthorized = passwords.filter((p) => p.ownerId !== ctx.userId)
      if (unauthorized.length > 0) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: `You don't have permission to modify ${unauthorized.length} password(s)`,
        })
      }

      // Verify tags exist
      const tags = await prisma.tag.findMany({
        where: {
          id: { in: input.tagIds },
        },
      })

      if (tags.length !== input.tagIds.length) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "One or more tags not found",
        })
      }

      // Assign tags to all passwords (using upsert to avoid duplicates)
      const { createAuditLog } = await import("@/lib/audit-log")
      
      for (const passwordId of input.passwordIds) {
        for (const tagId of input.tagIds) {
          await prisma.passwordTag.upsert({
            where: {
              passwordId_tagId: {
                passwordId,
                tagId,
              },
            },
            update: {},
            create: {
              passwordId,
              tagId,
            },
          })
        }

        // Create audit log
        await createAuditLog({
          action: "PASSWORD_UPDATED",
          resource: "Password",
          resourceId: passwordId,
          details: { tagIds: input.tagIds, bulk: true },
          userId: ctx.userId,
        })
      }

      return {
        success: true,
        updated: input.passwordIds.length,
      }
    }),

  bulkRemoveTags: protectedProcedure("password.edit")
    .input(
      z.object({
        passwordIds: z.array(z.string()).min(1, "At least one password ID is required"),
        tagIds: z.array(z.string()).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Verify user owns all passwords
      const passwords = await prisma.password.findMany({
        where: {
          id: { in: input.passwordIds },
        },
        select: {
          id: true,
          ownerId: true,
        },
      })

      const unauthorized = passwords.filter((p) => p.ownerId !== ctx.userId)
      if (unauthorized.length > 0) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: `You don't have permission to modify ${unauthorized.length} password(s)`,
        })
      }

      // Remove tags
      const where: any = {
        passwordId: { in: input.passwordIds },
      }

      if (input.tagIds && input.tagIds.length > 0) {
        where.tagId = { in: input.tagIds }
      }

      const deleted = await prisma.passwordTag.deleteMany({
        where,
      })

      // Create audit log
      const { createAuditLog } = await import("@/lib/audit-log")
      for (const password of passwords) {
        await createAuditLog({
          action: "PASSWORD_UPDATED",
          resource: "Password",
          resourceId: password.id,
          details: { removedTagIds: input.tagIds, bulk: true },
          userId: ctx.userId,
        })
      }

      return {
        success: true,
        removed: deleted.count,
      }
    }),

  bulkShare: protectedProcedure("password.edit")
    .input(
      z.object({
        passwordIds: z.array(z.string()).min(1, "At least one password ID is required"),
        teamId: z.string(),
        expiresAt: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Verify user owns all passwords
      const passwords = await prisma.password.findMany({
        where: {
          id: { in: input.passwordIds },
        },
        select: {
          id: true,
          ownerId: true,
          name: true,
        },
      })

      const unauthorized = passwords.filter((p) => p.ownerId !== ctx.userId)
      if (unauthorized.length > 0) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: `You don't have permission to share ${unauthorized.length} password(s)`,
        })
      }

      // Verify team exists
      const team = await prisma.team.findUnique({
        where: { id: input.teamId },
      })

      if (!team) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Team not found",
        })
      }

      // Share passwords with team
      const expiresAt = input.expiresAt ? new Date(input.expiresAt) : null
      const { createAuditLog } = await import("@/lib/audit-log")

      for (const passwordId of input.passwordIds) {
        // Check if already shared with this team
        const existingShare = await prisma.passwordShare.findFirst({
          where: {
            passwordId,
            teamId: input.teamId,
          },
        })

        if (!existingShare) {
          await prisma.passwordShare.create({
            data: {
              passwordId,
              teamId: input.teamId,
              expiresAt,
            },
          })

          // Create audit log
          await createAuditLog({
            action: "PASSWORD_SHARED",
            resource: "Password",
            resourceId: passwordId,
            details: { teamId: input.teamId, expiresAt, bulk: true },
            userId: ctx.userId,
          })
        }
      }

      return {
        success: true,
        shared: input.passwordIds.length,
      }
    }),

  bulkUnshare: protectedProcedure("password.edit")
    .input(
      z.object({
        passwordIds: z.array(z.string()).min(1, "At least one password ID is required"),
        teamId: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Verify user owns all passwords
      const passwords = await prisma.password.findMany({
        where: {
          id: { in: input.passwordIds },
        },
        select: {
          id: true,
          ownerId: true,
        },
      })

      const unauthorized = passwords.filter((p) => p.ownerId !== ctx.userId)
      if (unauthorized.length > 0) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: `You don't have permission to unshare ${unauthorized.length} password(s)`,
        })
      }

      // Unshare passwords
      const where: any = {
        passwordId: { in: input.passwordIds },
      }

      if (input.teamId) {
        where.teamId = input.teamId
      }

      const deleted = await prisma.passwordShare.deleteMany({
        where,
      })

      // Create audit log
      const { createAuditLog } = await import("@/lib/audit-log")
      for (const password of passwords) {
        await createAuditLog({
          action: "PASSWORD_UNSHARED",
          resource: "Password",
          resourceId: password.id,
          details: { teamId: input.teamId, bulk: true },
          userId: ctx.userId,
        })
      }

      return {
        success: true,
        unshared: deleted.count,
      }
    }),

  bulkUpdateStrength: protectedProcedure("password.edit")
    .input(
      z.object({
        passwordIds: z.array(z.string()).min(1, "At least one password ID is required"),
        strength: z.enum(["WEAK", "MEDIUM", "STRONG"]),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Verify user owns all passwords
      const passwords = await prisma.password.findMany({
        where: {
          id: { in: input.passwordIds },
        },
        select: {
          id: true,
          ownerId: true,
        },
      })

      const unauthorized = passwords.filter((p) => p.ownerId !== ctx.userId)
      if (unauthorized.length > 0) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: `You don't have permission to update ${unauthorized.length} password(s)`,
        })
      }

      // Update password strength
      const updated = await prisma.password.updateMany({
        where: {
          id: { in: input.passwordIds },
          ownerId: ctx.userId,
        },
        data: {
          strength: input.strength,
        },
      })

      // Create audit log
      const { createAuditLog } = await import("@/lib/audit-log")
      for (const password of passwords) {
        await createAuditLog({
          action: "PASSWORD_UPDATED",
          resource: "Password",
          resourceId: password.id,
          details: { strength: input.strength, bulk: true },
          userId: ctx.userId,
        })
      }

      return {
        success: true,
        updated: updated.count,
      }
    }),

  getHistory: protectedProcedure("password.view")
    .input(
      z.object({
        passwordId: z.string(),
      })
    )
    .query(async ({ input, ctx }) => {
      // Verify ownership
      const password = await prisma.password.findUnique({
        where: { id: input.passwordId },
        select: { ownerId: true },
      })

      if (!password || password.ownerId !== ctx.userId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have permission to view this password's history",
        })
      }

      // Get history
      const history = await prisma.passwordHistory.findMany({
        where: { passwordId: input.passwordId },
        include: {
          changedByUser: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      })

      return {
        history: history.map((h) => ({
          id: h.id,
          name: h.name,
          username: h.username,
          url: h.url,
          notes: h.notes,
          folderId: h.folderId,
          strength: h.strength,
          hasTotp: h.hasTotp,
          expiresAt: h.expiresAt,
          changeType: h.changeType,
          changedBy: h.changedByUser
            ? {
                id: h.changedByUser.id,
                name: h.changedByUser.name,
                email: h.changedByUser.email,
              }
            : null,
          createdAt: h.createdAt,
        })),
      }
    }),

  restoreVersion: protectedProcedure("password.edit")
    .input(
      z.object({
        passwordId: z.string(),
        historyId: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Verify ownership
      const password = await prisma.password.findUnique({
        where: { id: input.passwordId },
        select: { ownerId: true },
      })

      if (!password || password.ownerId !== ctx.userId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have permission to restore this password",
        })
      }

      // Get history version
      const historyVersion = await prisma.passwordHistory.findUnique({
        where: { id: input.historyId },
      })

      if (!historyVersion || historyVersion.passwordId !== input.passwordId) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "History version not found",
        })
      }

      // Get current password data for history
      const { getCurrentPasswordData, savePasswordHistory } = await import("@/lib/password-history")
      const currentData = await getCurrentPasswordData(input.passwordId)

      if (currentData) {
        // Save current state to history before restoring
        await savePasswordHistory(input.passwordId, currentData, ctx.userId, "UPDATE")
      }

      // Restore from history
      const updated = await prisma.password.update({
        where: { id: input.passwordId },
        data: {
          name: historyVersion.name,
          username: historyVersion.username,
          password: historyVersion.password, // Already encrypted
          url: historyVersion.url,
          notes: historyVersion.notes,
          folderId: historyVersion.folderId,
          strength: historyVersion.strength,
          hasTotp: historyVersion.hasTotp,
          totpSecret: historyVersion.totpSecret, // Already encrypted
          expiresAt: historyVersion.expiresAt,
        },
        select: {
          id: true,
          name: true,
          username: true,
          updatedAt: true,
        },
      })

      // Save restored version to history
      await savePasswordHistory(
        input.passwordId,
        {
          name: historyVersion.name,
          username: historyVersion.username,
          password: historyVersion.password,
          url: historyVersion.url,
          notes: historyVersion.notes,
          folderId: historyVersion.folderId,
          strength: historyVersion.strength,
          hasTotp: historyVersion.hasTotp,
          totpSecret: historyVersion.totpSecret,
          expiresAt: historyVersion.expiresAt,
        },
        ctx.userId,
        "RESTORE"
      )

      // Create audit log
      const { createAuditLog } = await import("@/lib/audit-log")
      await createAuditLog({
        action: "PASSWORD_RESTORED",
        resource: "Password",
        resourceId: input.passwordId,
        details: { historyId: input.historyId, name: updated.name },
        userId: ctx.userId,
      })

      return {
        success: true,
        password: updated,
      }
    }),

  compareVersions: protectedProcedure("password.view")
    .input(
      z.object({
        passwordId: z.string(),
        historyId1: z.string().optional(),
        historyId2: z.string().optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      // Verify ownership
      const password = await prisma.password.findUnique({
        where: { id: input.passwordId },
        select: { ownerId: true },
      })

      if (!password || password.ownerId !== ctx.userId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have permission to view this password",
        })
      }

      // Get current password data
      const currentPassword = await prisma.password.findUnique({
        where: { id: input.passwordId },
        select: {
          id: true,
          name: true,
          username: true,
          url: true,
          notes: true,
          folderId: true,
          strength: true,
          hasTotp: true,
          expiresAt: true,
          updatedAt: true,
        },
      })

      if (!currentPassword) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Password not found",
        })
      }

      // Get history versions if provided
      let version1 = null
      let version2 = null

      if (input.historyId1) {
        const h1 = await prisma.passwordHistory.findUnique({
          where: { id: input.historyId1 },
          include: {
            changedByUser: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        })
        if (h1 && h1.passwordId === input.passwordId) {
          version1 = {
            id: h1.id,
            name: h1.name,
            username: h1.username,
            url: h1.url,
            notes: h1.notes,
            folderId: h1.folderId,
            strength: h1.strength,
            hasTotp: h1.hasTotp,
            expiresAt: h1.expiresAt,
            changeType: h1.changeType,
            changedBy: h1.changedByUser
              ? {
                  id: h1.changedByUser.id,
                  name: h1.changedByUser.name,
                  email: h1.changedByUser.email,
                }
              : null,
            createdAt: h1.createdAt,
          }
        }
      } else {
        // Use current version as version1
        version1 = {
          id: "current",
          name: currentPassword.name,
          username: currentPassword.username,
          url: currentPassword.url,
          notes: currentPassword.notes,
          folderId: currentPassword.folderId,
          strength: currentPassword.strength,
          hasTotp: currentPassword.hasTotp,
          expiresAt: currentPassword.expiresAt,
          changeType: "CURRENT",
          changedBy: null,
          createdAt: currentPassword.updatedAt,
        }
      }

      if (input.historyId2) {
        const h2 = await prisma.passwordHistory.findUnique({
          where: { id: input.historyId2 },
          include: {
            changedByUser: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        })
        if (h2 && h2.passwordId === input.passwordId) {
          version2 = {
            id: h2.id,
            name: h2.name,
            username: h2.username,
            url: h2.url,
            notes: h2.notes,
            folderId: h2.folderId,
            strength: h2.strength,
            hasTotp: h2.hasTotp,
            expiresAt: h2.expiresAt,
            changeType: h2.changeType,
            changedBy: h2.changedByUser
              ? {
                  id: h2.changedByUser.id,
                  name: h2.changedByUser.name,
                  email: h2.changedByUser.email,
                }
              : null,
            createdAt: h2.createdAt,
          }
        }
      }

      return {
        version1,
        version2,
        current: {
          id: "current",
          name: currentPassword.name,
          username: currentPassword.username,
          url: currentPassword.url,
          notes: currentPassword.notes,
          folderId: currentPassword.folderId,
          strength: currentPassword.strength,
          hasTotp: currentPassword.hasTotp,
          expiresAt: currentPassword.expiresAt,
          updatedAt: currentPassword.updatedAt,
        },
      }
    }),

  findDuplicates: protectedProcedure("password.view")
    .input(
      z.object({
        threshold: z.number().min(0).max(1).default(0.8).optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      // Get all passwords owned by the current user
      // This ensures we only detect duplicates in passwords the user owns
      const passwords = await prisma.password.findMany({
        where: {
          ownerId: ctx.userId,
        },
        select: {
          id: true,
          name: true,
          username: true,
          password: true,
          url: true,
          ownerId: true,
          owner: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      })

      // Decrypt and group passwords by their decrypted value
      const passwordGroups = new Map<string, Array<typeof passwords[0] & { decryptedPassword: string }>>()

      for (const pwd of passwords) {
        try {
          const decrypted = decrypt(pwd.password)
          // Normalize whitespace for comparison
          const normalized = decrypted.trim()
          if (!passwordGroups.has(normalized)) {
            passwordGroups.set(normalized, [])
          }
          passwordGroups.get(normalized)!.push({ ...pwd, decryptedPassword: normalized })
        } catch (error) {
          // Skip passwords that can't be decrypted
          console.error(`Failed to decrypt password ${pwd.id}:`, error)
          continue
        }
      }

      // Filter to only groups with duplicates (2+ passwords)
      const duplicates: Array<{
        password: string
        count: number
        entries: Array<{
          id: string
          name: string
          username: string
          url: string | null
          ownerId: string
          owner: { id: string; name: string; email: string }
        }>
      }> = []

      for (const [decryptedPassword, entries] of passwordGroups.entries()) {
        if (entries.length > 1) {
          duplicates.push({
            password: decryptedPassword,
            count: entries.length,
            entries: entries.map((e) => ({
              id: e.id,
              name: e.name,
              username: e.username,
              url: e.url,
              ownerId: e.ownerId,
              owner: e.owner,
            })),
          })
        }
      }

      return {
        duplicates,
        totalDuplicates: duplicates.reduce((sum, d) => sum + d.count, 0),
        uniqueDuplicatedPasswords: duplicates.length,
      }
    }),

  findReused: protectedProcedure("password.view")
    .query(async ({ ctx }) => {
      // Get all passwords owned by the current user
      const passwords = await prisma.password.findMany({
        where: {
          ownerId: ctx.userId,
        },
        select: {
          id: true,
          name: true,
          username: true,
          password: true,
          url: true,
          ownerId: true,
          owner: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      })

      // Group by decrypted password value
      const passwordMap = new Map<string, Array<typeof passwords[0] & { decryptedPassword: string }>>()

      for (const pwd of passwords) {
        try {
          const decrypted = decrypt(pwd.password)
          if (!passwordMap.has(decrypted)) {
            passwordMap.set(decrypted, [])
          }
          passwordMap.get(decrypted)!.push({ ...pwd, decryptedPassword: decrypted })
        } catch (error) {
          continue
        }
      }

      // Find passwords used in multiple entries (reused)
      const reused: Array<{
        password: string
        count: number
        entries: Array<{
          id: string
          name: string
          username: string
          url: string | null
          ownerId: string
          owner: { id: string; name: string; email: string }
        }>
      }> = []

      for (const [decryptedPassword, entries] of passwordMap.entries()) {
        if (entries.length > 1) {
          reused.push({
            password: decryptedPassword,
            count: entries.length,
            entries: entries.map((e) => ({
              id: e.id,
              name: e.name,
              username: e.username,
              url: e.url,
              ownerId: e.ownerId,
              owner: e.owner,
            })),
          })
        }
      }

      return {
        reused,
        totalReused: reused.reduce((sum, r) => sum + r.count, 0),
        uniqueReusedPasswords: reused.length,
      }
    }),

  findSimilar: protectedProcedure("password.view")
    .input(
      z.object({
        threshold: z.number().min(0).max(1).default(0.8).optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      const { calculateSimilarity, arePasswordsSimilar } = await import("@/lib/password-similarity")
      const threshold = input.threshold ?? 0.8

      // Get all passwords owned by the current user
      const passwords = await prisma.password.findMany({
        where: {
          ownerId: ctx.userId,
        },
        select: {
          id: true,
          name: true,
          username: true,
          password: true,
          url: true,
          ownerId: true,
          owner: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      })

      // Decrypt all passwords
      const decryptedPasswords = passwords
        .map((pwd) => {
          try {
            return {
              ...pwd,
              decryptedPassword: decrypt(pwd.password),
            }
          } catch (error) {
            return null
          }
        })
        .filter((p): p is NonNullable<typeof p> => p !== null)

      // Find similar passwords
      const similarGroups: Array<{
        entries: Array<{
          id: string
          name: string
          username: string
          url: string | null
          ownerId: string
          owner: { id: string; name: string; email: string }
          password: string
        }>
        similarity: number
      }> = []

      const processed = new Set<string>()

      for (let i = 0; i < decryptedPasswords.length; i++) {
        if (processed.has(decryptedPasswords[i].id)) continue

        const group = [decryptedPasswords[i]]
        processed.add(decryptedPasswords[i].id)

        for (let j = i + 1; j < decryptedPasswords.length; j++) {
          if (processed.has(decryptedPasswords[j].id)) continue

          if (arePasswordsSimilar(decryptedPasswords[i].decryptedPassword, decryptedPasswords[j].decryptedPassword, threshold)) {
            group.push(decryptedPasswords[j])
            processed.add(decryptedPasswords[j].id)
          }
        }

        if (group.length > 1) {
          // Calculate average similarity
          let totalSimilarity = 0
          let comparisons = 0
          for (let k = 0; k < group.length; k++) {
            for (let l = k + 1; l < group.length; l++) {
              totalSimilarity += calculateSimilarity(group[k].decryptedPassword, group[l].decryptedPassword)
              comparisons++
            }
          }
          const avgSimilarity = comparisons > 0 ? totalSimilarity / comparisons : 0

          similarGroups.push({
            entries: group.map((e) => ({
              id: e.id,
              name: e.name,
              username: e.username,
              url: e.url,
              ownerId: e.ownerId,
              owner: e.owner,
              password: e.decryptedPassword,
            })),
            similarity: avgSimilarity,
          })
        }
      }

      return {
        similarGroups,
        totalSimilar: similarGroups.reduce((sum, g) => sum + g.entries.length, 0),
        uniqueSimilarGroups: similarGroups.length,
      }
    }),

  bulkResolveDuplicates: protectedProcedure("password.edit")
    .input(
      z.object({
        action: z.enum(["delete", "merge"]),
        passwordIds: z.array(z.string()).min(1),
        keepPasswordId: z.string().optional(), // For merge action
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Verify user owns all passwords
      const passwords = await prisma.password.findMany({
        where: {
          id: { in: input.passwordIds },
        },
        select: {
          id: true,
          ownerId: true,
        },
      })

      const unauthorized = passwords.filter((p) => p.ownerId !== ctx.userId)
      if (unauthorized.length > 0) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: `You don't have permission to modify ${unauthorized.length} password(s)`,
        })
      }

      const { createAuditLog } = await import("@/lib/audit-log")

      if (input.action === "delete") {
        // Delete all specified passwords
        const deleted = await prisma.password.deleteMany({
          where: {
            id: { in: input.passwordIds },
            ownerId: ctx.userId,
          },
        })

        // Create audit log
        await createAuditLog({
          action: "PASSWORD_BULK_DELETE",
          resource: "Password",
          resourceId: input.passwordIds[0],
          details: {
            count: deleted.count,
            passwordIds: input.passwordIds,
            reason: "duplicate_resolution",
          },
          userId: ctx.userId,
        })

        return {
          success: true,
          deleted: deleted.count,
        }
      } else if (input.action === "merge" && input.keepPasswordId) {
        // Merge: keep one password, delete others
        if (!input.passwordIds.includes(input.keepPasswordId)) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "keepPasswordId must be in passwordIds array",
          })
        }

        const passwordsToDelete = input.passwordIds.filter((id) => id !== input.keepPasswordId)

        if (passwordsToDelete.length === 0) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "No passwords to delete for merge",
          })
        }

        const deleted = await prisma.password.deleteMany({
          where: {
            id: { in: passwordsToDelete },
            ownerId: ctx.userId,
          },
        })

        // Create audit log
        await createAuditLog({
          action: "PASSWORD_BULK_MERGE",
          resource: "Password",
          resourceId: input.keepPasswordId,
          details: {
            mergedCount: deleted.count,
            keptPasswordId: input.keepPasswordId,
            deletedPasswordIds: passwordsToDelete,
            reason: "duplicate_resolution",
          },
          userId: ctx.userId,
        })

        return {
          success: true,
          merged: deleted.count,
          keptPasswordId: input.keepPasswordId,
        }
      } else {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invalid action or missing keepPasswordId for merge",
        })
      }
    }),

  checkPasswordBreach: protectedProcedure("password.view")
    .input(
      z.object({
        passwordId: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Verify ownership
      const password = await prisma.password.findUnique({
        where: { id: input.passwordId },
        select: { id: true, password: true, ownerId: true, name: true },
      })

      if (!password || password.ownerId !== ctx.userId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have permission to check this password",
        })
      }

      // Decrypt password
      const decryptedPassword = decrypt(password.password)

      // Check breach using Have I Been Pwned API
      const { checkPasswordBreach } = await import("@/lib/breach-detection")
      const breachResult = await checkPasswordBreach(decryptedPassword)

      // Save breach record
      const breach = await prisma.passwordBreach.create({
        data: {
          passwordId: input.passwordId,
          isBreached: breachResult.isBreached,
          breachCount: breachResult.breachCount,
          hashPrefix: breachResult.hashPrefix,
          checkedBy: ctx.userId,
        },
      })

      // Create audit log
      const { createAuditLog } = await import("@/lib/audit-log")
      await createAuditLog({
        action: breachResult.isBreached ? "PASSWORD_BREACH_DETECTED" : "PASSWORD_BREACH_CHECKED",
        resource: "Password",
        resourceId: input.passwordId,
        details: {
          isBreached: breachResult.isBreached,
          breachCount: breachResult.breachCount,
          passwordName: password.name,
        },
        userId: ctx.userId,
      })

      return {
        success: true,
        isBreached: breachResult.isBreached,
        breachCount: breachResult.breachCount,
        breachId: breach.id,
      }
    }),

  checkAllPasswordsBreach: protectedProcedure("password.view")
    .mutation(async ({ ctx }) => {
      // Get all passwords owned by the user
      const passwords = await prisma.password.findMany({
        where: {
          ownerId: ctx.userId,
        },
        select: {
          id: true,
          password: true,
          name: true,
        },
      })

      const { checkMultiplePasswords } = await import("@/lib/breach-detection")
      const { createAuditLog } = await import("@/lib/audit-log")

      const results = []
      let breachedCount = 0

      // Decrypt and check each password
      for (const pwd of passwords) {
        try {
          const decryptedPassword = decrypt(pwd.password)
          const breachResult = await checkMultiplePasswords([decryptedPassword])
          
          if (breachResult.length > 0) {
            const result = breachResult[0]
            
            // Save breach record
            const breach = await prisma.passwordBreach.create({
              data: {
                passwordId: pwd.id,
                isBreached: result.isBreached,
                breachCount: result.breachCount,
                hashPrefix: result.hashPrefix,
                checkedBy: ctx.userId,
              },
            })

            if (result.isBreached) {
              breachedCount++
            }

            results.push({
              passwordId: pwd.id,
              passwordName: pwd.name,
              isBreached: result.isBreached,
              breachCount: result.breachCount,
              breachId: breach.id,
            })

            // Create audit log
            await createAuditLog({
              action: result.isBreached ? "PASSWORD_BREACH_DETECTED" : "PASSWORD_BREACH_CHECKED",
              resource: "Password",
              resourceId: pwd.id,
              details: {
                isBreached: result.isBreached,
                breachCount: result.breachCount,
                passwordName: pwd.name,
                bulkCheck: true,
              },
              userId: ctx.userId,
            })
          }
        } catch (error) {
          // Skip passwords that can't be decrypted
          console.error(`Failed to check password ${pwd.id}:`, error)
          continue
        }
      }

      return {
        success: true,
        checked: passwords.length,
        breached: breachedCount,
        results,
      }
    }),

  getBreachHistory: protectedProcedure("password.view")
    .input(
      z.object({
        passwordId: z.string().optional(),
        includeResolved: z.boolean().default(false),
      })
    )
    .query(async ({ input, ctx }) => {
      // Build where clause
      const where: any = {
        password: {
          ownerId: ctx.userId,
        },
      }

      if (input.passwordId) {
        where.passwordId = input.passwordId
      }

      if (!input.includeResolved) {
        where.resolved = false
      }

      // Get breach history
      const breaches = await prisma.passwordBreach.findMany({
        where,
        include: {
          password: {
            select: {
              id: true,
              name: true,
              username: true,
              url: true,
            },
          },
          checkedByUser: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          resolvedByUser: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: {
          checkedAt: "desc",
        },
      })

      return {
        breaches,
        total: breaches.length,
        breached: breaches.filter((b) => b.isBreached && !b.resolved).length,
      }
    }),

  resolveBreach: protectedProcedure("password.edit")
    .input(
      z.object({
        breachId: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Get breach record
      const breach = await prisma.passwordBreach.findUnique({
        where: { id: input.breachId },
        include: {
          password: {
            select: {
              id: true,
              ownerId: true,
              name: true,
            },
          },
        },
      })

      if (!breach) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Breach record not found",
        })
      }

      // Verify ownership
      if (breach.password.ownerId !== ctx.userId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have permission to resolve this breach",
        })
      }

      // Mark as resolved
      const updated = await prisma.passwordBreach.update({
        where: { id: input.breachId },
        data: {
          resolved: true,
          resolvedAt: new Date(),
          resolvedBy: ctx.userId,
        },
      })

      // Create audit log
      const { createAuditLog } = await import("@/lib/audit-log")
      await createAuditLog({
        action: "PASSWORD_BREACH_RESOLVED",
        resource: "Password",
        resourceId: breach.passwordId,
        details: {
          breachId: input.breachId,
          passwordName: breach.password.name,
        },
        userId: ctx.userId,
      })

      return {
        success: true,
        breach: updated,
      }
    }),

  toggleFavorite: protectedProcedure("password.edit")
    .input(
      z.object({
        passwordId: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Verify password ownership
      const password = await prisma.password.findFirst({
        where: {
          id: input.passwordId,
          ownerId: ctx.userId,
        },
        select: {
          id: true,
          name: true,
          isFavorite: true,
        },
      })

      if (!password) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Password not found",
        })
      }

      // Toggle favorite status
      const updated = await prisma.password.update({
        where: { id: input.passwordId },
        data: {
          isFavorite: !password.isFavorite,
        },
        select: {
          id: true,
          isFavorite: true,
        },
      })

      // Create audit log
      const { createAuditLog } = await import("@/lib/audit-log")
      await createAuditLog({
        action: updated.isFavorite ? "PASSWORD_FAVORITED" : "PASSWORD_UNFAVORITED",
        resource: "Password",
        resourceId: input.passwordId,
        details: {
          passwordName: password.name,
        },
        userId: ctx.userId,
      })

      return {
        success: true,
        isFavorite: updated.isFavorite,
      }
    }),

  getFavorites: protectedProcedure("password.view")
    .input(
      z.object({
        page: z.number().min(1).default(1),
        pageSize: z.number().min(1).max(100).default(20),
        search: z.string().optional(),
      }).optional()
    )
    .query(async ({ input = {}, ctx }) => {
      const { page = 1, pageSize = 20, search } = input

      // Build search conditions
      const searchConditions = search
        ? {
            OR: [
              { name: { contains: search, mode: "insensitive" as const } },
              { username: { contains: search, mode: "insensitive" as const } },
              { url: { contains: search, mode: "insensitive" as const } },
            ],
          }
        : {}

      // Query only passwords owned by the user that are favorited
      const where = {
        ownerId: ctx.userId,
        isFavorite: true,
        ...searchConditions,
      }

      const [passwords, total] = await Promise.all([
        prisma.password.findMany({
          where,
          select: {
            id: true,
            name: true,
            username: true,
            url: true,
            folderId: true,
            strength: true,
            hasTotp: true,
            expiresAt: true,
            createdAt: true,
            updatedAt: true,
            ownerId: true,
            isFavorite: true,
            folder: {
              select: {
                id: true,
                name: true,
              },
            },
            sharedWith: {
              select: {
                id: true,
                teamId: true,
                expiresAt: true,
                team: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
          orderBy: {
            updatedAt: "desc",
          },
          skip: (page - 1) * pageSize,
          take: pageSize,
        }),
        prisma.password.count({ where }),
      ])

      const totalPages = Math.ceil(total / pageSize)

      return {
        passwords: passwords.map((pwd) => ({
          id: pwd.id,
          name: pwd.name,
          username: pwd.username,
          url: pwd.url,
          folder: pwd.folder?.name || null,
          folderId: pwd.folderId,
          strength: pwd.strength.toLowerCase() as "strong" | "medium" | "weak",
          hasTotp: pwd.hasTotp,
          shared: pwd.sharedWith.length > 0,
          sharedWith: pwd.sharedWith.map((share) => ({
            shareId: share.id,
            teamId: share.teamId,
            teamName: share.team?.name || "",
            expiresAt: share.expiresAt,
          })),
          isOwner: true,
          isFavorite: pwd.isFavorite,
          lastModified: pwd.updatedAt.toISOString().split("T")[0],
          expiresIn: pwd.expiresAt
            ? Math.ceil((pwd.expiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
            : null,
          createdAt: pwd.createdAt,
        })),
        pagination: {
          page,
          pageSize,
          total,
          totalPages,
        },
      }
    }),

  // Tag Autocomplete
  tagAutocomplete: protectedProcedure("password.view")
    .input(
      z.object({
        query: z.string().min(1),
        limit: z.number().min(1).max(20).default(10),
      })
    )
    .query(async ({ input, ctx }) => {
      const tags = await prisma.tag.findMany({
        where: {
          name: {
            contains: input.query,
            mode: "insensitive",
          },
        },
        select: {
          id: true,
          name: true,
          color: true,
          icon: true,
          _count: {
            select: {
              passwords: true,
            },
          },
        },
        orderBy: [
          {
            _count: {
              passwords: "desc",
            },
          },
          {
            name: "asc",
          },
        ],
        take: input.limit,
      })

      return tags.map((tag) => ({
        id: tag.id,
        name: tag.name,
        color: tag.color,
        icon: tag.icon,
        usageCount: tag._count.passwords,
      }))
    }),

  // Tag Suggestions (based on password context)
  tagSuggestions: protectedProcedure("password.view")
    .input(
      z.object({
        passwordId: z.string().optional(),
        limit: z.number().min(1).max(20).default(10),
      }).optional()
    )
    .query(async ({ input = {}, ctx }) => {
      const { passwordId, limit = 10 } = input

      // Get user's passwords to analyze tag patterns
      const userPasswords = await prisma.password.findMany({
        where: {
          ownerId: ctx.userId,
        },
        include: {
          tags: {
            include: {
              tag: true,
            },
          },
        },
        take: 100, // Analyze recent passwords
        orderBy: {
          updatedAt: "desc",
        },
      })

      // Count tag frequencies
      const tagFrequency = new Map<string, { tag: any; count: number }>()
      
      for (const password of userPasswords) {
        for (const passwordTag of password.tags) {
          const tagId = passwordTag.tag.id
          const existing = tagFrequency.get(tagId)
          if (existing) {
            existing.count++
          } else {
            tagFrequency.set(tagId, {
              tag: passwordTag.tag,
              count: 1,
            })
          }
        }
      }

      // If passwordId is provided, exclude tags already on that password
      let existingTagIds: string[] = []
      if (passwordId) {
        const password = await prisma.password.findFirst({
          where: {
            id: passwordId,
            ownerId: ctx.userId,
          },
          include: {
            tags: {
              select: {
                tagId: true,
              },
            },
          },
        })
        if (password) {
          existingTagIds = password.tags.map((pt) => pt.tagId)
        }
      }

      // Sort by frequency and return top suggestions
      const suggestions = Array.from(tagFrequency.values())
        .filter((item) => !existingTagIds.includes(item.tag.id))
        .sort((a, b) => b.count - a.count)
        .slice(0, limit)
        .map((item) => ({
          id: item.tag.id,
          name: item.tag.name,
          color: item.tag.color,
          icon: item.tag.icon,
          usageCount: item.count,
        }))

      return suggestions
    }),

  // Tag Analytics (most used tags)
  tagAnalytics: protectedProcedure("password.view")
    .input(
      z.object({
        limit: z.number().min(1).max(50).default(10),
      }).optional()
    )
    .query(async ({ input = {}, ctx }) => {
      const { limit = 10 } = input

      // Get all tags
      const allTags = await prisma.tag.findMany({
        select: {
          id: true,
          name: true,
          color: true,
          icon: true,
        },
      })

      // Get user's password IDs
      const userPasswordIds = await prisma.password.findMany({
        where: {
          ownerId: ctx.userId,
        },
        select: {
          id: true,
        },
      })

      const passwordIds = userPasswordIds.map((p) => p.id)

      // Count tag usage for user's passwords
      const tagUsageCounts = await prisma.passwordTag.groupBy({
        by: ["tagId"],
        where: {
          passwordId: {
            in: passwordIds,
          },
        },
        _count: {
          id: true,
        },
      })

      // Create a map of tagId to usage count
      const usageMap = new Map(
        tagUsageCounts.map((item) => [item.tagId, item._count.id])
      )

      // Combine tags with their usage counts
      const tagsWithUsage = allTags
        .map((tag) => ({
          ...tag,
          usageCount: usageMap.get(tag.id) || 0,
        }))
        .filter((tag) => tag.usageCount > 0) // Only include tags that are used
        .sort((a, b) => b.usageCount - a.usageCount)
        .slice(0, limit)

      const totalPasswords = passwordIds.length

      return tagsWithUsage.map((tag) => ({
        id: tag.id,
        name: tag.name,
        color: tag.color,
        icon: tag.icon,
        usageCount: tag.usageCount,
        usagePercentage: totalPasswords > 0
          ? Math.round((tag.usageCount / totalPasswords) * 100)
          : 0,
      }))
    }),

  // Tag Management
  createTag: protectedProcedure("password.edit")
    .input(
      z.object({
        name: z.string().min(1, "Tag name is required"),
        color: z.string().optional().nullable(),
        icon: z.string().optional().nullable(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Check if tag with same name already exists
      const existingTag = await prisma.tag.findUnique({
        where: { name: input.name },
      })

      if (existingTag) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Tag with this name already exists",
        })
      }

      const tag = await prisma.tag.create({
        data: {
          name: input.name,
          color: input.color || null,
          icon: input.icon || null,
        },
      })

      // Create audit log
      const { createAuditLog } = await import("@/lib/audit-log")
      await createAuditLog({
        action: "TAG_CREATED",
        resource: "Tag",
        resourceId: tag.id,
        details: {
          name: tag.name,
          color: tag.color,
          icon: tag.icon,
        },
        userId: ctx.userId,
      })

      return tag
    }),

  updateTag: protectedProcedure("password.edit")
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1, "Tag name is required").optional(),
        color: z.string().optional().nullable(),
        icon: z.string().optional().nullable(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { id, ...updateData } = input

      // Check if tag exists
      const existingTag = await prisma.tag.findUnique({
        where: { id },
      })

      if (!existingTag) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Tag not found",
        })
      }

      // If name is being updated, check for conflicts
      if (updateData.name && updateData.name !== existingTag.name) {
        const nameConflict = await prisma.tag.findUnique({
          where: { name: updateData.name },
        })

        if (nameConflict) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "Tag with this name already exists",
          })
        }
      }

      const tag = await prisma.tag.update({
        where: { id },
        data: {
          ...(updateData.name && { name: updateData.name }),
          color: updateData.color !== undefined ? updateData.color : existingTag.color,
          icon: updateData.icon !== undefined ? updateData.icon : existingTag.icon,
        },
      })

      // Create audit log
      const { createAuditLog } = await import("@/lib/audit-log")
      await createAuditLog({
        action: "TAG_UPDATED",
        resource: "Tag",
        resourceId: tag.id,
        details: {
          name: tag.name,
          color: tag.color,
          icon: tag.icon,
        },
        userId: ctx.userId,
      })

      return tag
    }),

  deleteTag: protectedProcedure("password.edit")
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      // Check if tag exists
      const tag = await prisma.tag.findUnique({
        where: { id: input.id },
        include: {
          _count: {
            select: {
              passwords: true,
            },
          },
        },
      })

      if (!tag) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Tag not found",
        })
      }

      // Delete tag (cascade will remove PasswordTag relations)
      await prisma.tag.delete({
        where: { id: input.id },
      })

      // Create audit log
      const { createAuditLog } = await import("@/lib/audit-log")
      await createAuditLog({
        action: "TAG_DELETED",
        resource: "Tag",
        resourceId: input.id,
        details: {
          name: tag.name,
          passwordCount: tag._count.passwords,
        },
        userId: ctx.userId,
      })

      return { success: true }
    }),
})

