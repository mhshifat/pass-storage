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
})

