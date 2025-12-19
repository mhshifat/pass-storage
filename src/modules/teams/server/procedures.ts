import prisma from "@/lib/prisma"
import { createTRPCRouter, protectedProcedure } from "@/trpc/init"
import z from "zod"
import { TRPCError } from "@trpc/server"

export const teamsRouter = createTRPCRouter({
  create: protectedProcedure("team.create")
    .input(
      z.object({
        name: z.string().min(2, "Name must be at least 2 characters"),
        description: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      // Check if team already exists
      const existingTeam = await prisma.team.findFirst({
        where: { name: input.name },
      })

      if (existingTeam) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Team with this name already exists",
        })
      }

      // Create team
      const team = await prisma.team.create({
        data: {
          name: input.name,
          description: input.description || null,
        },
        select: {
          id: true,
          name: true,
          description: true,
          createdAt: true,
          updatedAt: true,
          members: {
            select: {
              id: true,
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
              role: true,
            },
          },
        },
      })

      return {
        success: true,
        team,
      }
    }),

  list: protectedProcedure("team.view")
    .input(
      z.object({
        page: z.number().min(1).default(1),
        pageSize: z.number().min(1).max(100).default(10),
        search: z.string().optional(),
      }).optional()
    )
    .query(async ({ input = {} }) => {
      const { page = 1, pageSize = 10, search } = input

      const where = search
        ? {
            OR: [
              { name: { contains: search, mode: "insensitive" as const } },
              { description: { contains: search, mode: "insensitive" as const } },
            ],
          }
        : {}

      const [teams, total] = await Promise.all([
        prisma.team.findMany({
          where,
          select: {
            id: true,
            name: true,
            description: true,
            createdAt: true,
            updatedAt: true,
            members: {
              select: {
                id: true,
                user: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                  },
                },
                role: true,
              },
            },
            sharedPasswords: {
              select: {
                id: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
          skip: (page - 1) * pageSize,
          take: pageSize,
        }),
        prisma.team.count({ where }),
      ])

      // Transform teams to include member count and password count
      const transformedTeams = teams.map((team) => ({
        id: team.id,
        name: team.name,
        description: team.description,
        members: team.members.length,
        passwords: team.sharedPasswords.length,
        createdAt: team.createdAt.toISOString(),
        manager: team.members.find((m) => m.role === "MANAGER")?.user.name || "—",
      }))

      return {
        teams: transformedTeams,
        pagination: {
          page,
          pageSize,
          total,
          totalPages: Math.ceil(total / pageSize),
        },
      }
    }),

  update: protectedProcedure("team.edit")
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(2).optional(),
        description: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { id, ...data } = input

      // Check if team exists
      const existingTeam = await prisma.team.findUnique({
        where: { id },
      })

      if (!existingTeam) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Team not found",
        })
      }

      // Check if name is being changed and if new name already exists
      if (data.name && data.name !== existingTeam.name) {
        const nameExists = await prisma.team.findFirst({
          where: { name: data.name },
        })

        if (nameExists) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "Team with this name already exists",
          })
        }
      }

      // Update team
      const team = await prisma.team.update({
        where: { id },
        data: {
          ...data,
          description: data.description !== undefined ? (data.description || null) : undefined,
        },
        select: {
          id: true,
          name: true,
          description: true,
          createdAt: true,
          updatedAt: true,
        },
      })

      return {
        success: true,
        team,
      }
    }),

  delete: protectedProcedure("team.delete")
    .input(
      z.object({
        id: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      // Check if team exists
      const existingTeam = await prisma.team.findUnique({
        where: { id: input.id },
        include: {
          members: true,
        },
      })

      if (!existingTeam) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Team not found",
        })
      }

      // Delete team (cascade will handle members and shared passwords)
      await prisma.team.delete({
        where: { id: input.id },
      })

      return {
        success: true,
      }
    }),

  getById: protectedProcedure("team.view")
    .input(
      z.object({
        id: z.string(),
      })
    )
    .query(async ({ input }) => {
      const team = await prisma.team.findUnique({
        where: { id: input.id },
        select: {
          id: true,
          name: true,
          description: true,
          createdAt: true,
          updatedAt: true,
          members: {
            select: {
              id: true,
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  image: true,
                },
              },
              role: true,
              createdAt: true,
            },
            orderBy: {
              createdAt: "desc",
            },
          },
          sharedPasswords: {
            select: {
              id: true,
              password: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      })

      if (!team) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Team not found",
        })
      }

      return { team }
    }),

  stats: protectedProcedure("team.view")
    .query(async () => {
      const [total, totalMembers, totalPasswords] = await Promise.all([
        prisma.team.count(),
        prisma.teamMember.count(),
        prisma.passwordShare.count({
          where: {
            teamId: { not: null },
          },
        }),
      ])

      // Calculate average team size
      const teamsWithMembers = await prisma.team.findMany({
        select: {
          members: {
            select: {
              id: true,
            },
          },
        },
      })

      const avgTeamSize =
        teamsWithMembers.length > 0
          ? Math.round(
              teamsWithMembers.reduce((sum, team) => sum + team.members.length, 0) /
                teamsWithMembers.length
            )
          : 0

      return {
        total,
        totalMembers,
        totalPasswords,
        avgTeamSize,
      }
    }),

  addMember: protectedProcedure("team.edit")
    .input(
      z.object({
        teamId: z.string(),
        userId: z.string(),
        role: z.enum(["MANAGER", "MEMBER"]).default("MEMBER"),
      })
    )
    .mutation(async ({ input }) => {
      // Check if team exists
      const team = await prisma.team.findUnique({
        where: { id: input.teamId },
      })

      if (!team) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Team not found",
        })
      }

      // Check if user exists
      const user = await prisma.user.findUnique({
        where: { id: input.userId },
      })

      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        })
      }

      // Check if user is already a member
      const existingMember = await prisma.teamMember.findUnique({
        where: {
          teamId_userId: {
            teamId: input.teamId,
            userId: input.userId,
          },
        },
      })

      if (existingMember) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "User is already a member of this team",
        })
      }

      // Add member
      const member = await prisma.teamMember.create({
        data: {
          teamId: input.teamId,
          userId: input.userId,
          role: input.role,
        },
        select: {
          id: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
          role: true,
          createdAt: true,
        },
      })

      return {
        success: true,
        member,
      }
    }),

  removeMember: protectedProcedure("team.edit")
    .input(
      z.object({
        teamId: z.string(),
        userId: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      // Check if member exists
      const member = await prisma.teamMember.findUnique({
        where: {
          teamId_userId: {
            teamId: input.teamId,
            userId: input.userId,
          },
        },
      })

      if (!member) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Member not found",
        })
      }

      // Remove member
      await prisma.teamMember.delete({
        where: {
          teamId_userId: {
            teamId: input.teamId,
            userId: input.userId,
          },
        },
      })

      return {
        success: true,
      }
    }),

  updateMemberRole: protectedProcedure("team.edit")
    .input(
      z.object({
        teamId: z.string(),
        userId: z.string(),
        role: z.enum(["MANAGER", "MEMBER"]),
      })
    )
    .mutation(async ({ input }) => {
      // Check if member exists
      const member = await prisma.teamMember.findUnique({
        where: {
          teamId_userId: {
            teamId: input.teamId,
            userId: input.userId,
          },
        },
      })

      if (!member) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Member not found",
        })
      }

      // Update member role
      const updatedMember = await prisma.teamMember.update({
        where: {
          teamId_userId: {
            teamId: input.teamId,
            userId: input.userId,
          },
        },
        data: {
          role: input.role,
        },
        select: {
          id: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
          role: true,
          createdAt: true,
        },
      })

      return {
        success: true,
        member: updatedMember,
      }
    }),

  getAvailableUsers: protectedProcedure("team.edit")
    .input(
      z.object({
        teamId: z.string(),
        search: z.string().optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      // Get current team members
      const teamMembers = await prisma.teamMember.findMany({
        where: { teamId: input.teamId },
        select: { userId: true },
      })

      const memberUserIds = teamMembers.map((m) => m.userId)

      // Exclude current logged-in user and team members
      const excludedUserIds = [...memberUserIds]
      if (ctx.userId) {
        excludedUserIds.push(ctx.userId)
      }

      // Get all users except those already in the team and the current logged-in user
      const where = {
        id: { notIn: excludedUserIds },
        isActive: true,
        ...(input.search
          ? {
              OR: [
                { name: { contains: input.search, mode: "insensitive" as const } },
                { email: { contains: input.search, mode: "insensitive" as const } },
              ],
            }
          : {}),
      }

      const users = await prisma.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
        orderBy: {
          name: "asc",
        },
        take: 50, // Limit results
      })

      return { users }
    }),
})

