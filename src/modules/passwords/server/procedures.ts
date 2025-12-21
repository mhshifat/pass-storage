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
        filter: z.enum(["weak", "expiring"]).optional(),
      }).optional()
    )
    .query(async ({ input = {}, ctx }) => {
      const { page = 1, pageSize = 10, search, filter } = input

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

      // Build filter conditions for password-level filters (strength, password expiration)
      const passwordFilterConditions: {
        strength?: "WEAK" | "MEDIUM" | "STRONG"
        expiresAt?: { not: null; gte: Date; lte: Date }
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
      }

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
            createdAt: true,
            updatedAt: true,
            ownerId: true,
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
        details: { name: password.name, hasTotp: password.hasTotp },
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

      // Create audit log
      const { createAuditLog } = await import("@/lib/audit-log")
      await createAuditLog({
        action: "PASSWORD_UPDATED",
        resource: "Password",
        resourceId: password.id,
        details: { name: password.name },
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
          createdAt: true,
          updatedAt: true,
          ownerId: true, // Include ownerId to determine ownership
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
        lastModified: password.updatedAt.toISOString().split("T")[0],
        expiresIn: password.expiresAt
          ? Math.ceil((password.expiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
          : null,
        createdAt: password.createdAt,
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

      return {
        total,
        strong: strongCount,
        medium: mediumCount,
        weak: weakCount,
        expiringSoon,
        strongPercentage,
        recentCount,
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
})

