import prisma from "@/lib/prisma"
import { createTRPCRouter, protectedProcedure } from "@/trpc/init"
import z from "zod"
import { TRPCError } from "@trpc/server"

export const foldersRouter = createTRPCRouter({
  list: protectedProcedure("password.view")
    .query(async ({ ctx }) => {
      // Get user's company
      let companyId: string | null = null
      if (ctx.subdomain) {
        const company = await prisma.company.findUnique({
          where: { subdomain: ctx.subdomain },
          select: { id: true },
        })
        if (company) {
          companyId = company.id
        }
      } else if (ctx.userId) {
        const user = await prisma.user.findUnique({
          where: { id: ctx.userId },
          select: { companyId: true },
        })
        if (user?.companyId) {
          companyId = user.companyId
        }
      }

      // Get folders that have passwords belonging to the company
      const where: any = {}
      if (companyId) {
        where.passwords = {
          some: {
            owner: {
              companyId: companyId,
            },
          },
        }
      }

      const folders = await prisma.folder.findMany({
        where,
        select: {
          id: true,
          name: true,
          description: true,
          icon: true,
          color: true,
          parentId: true,
          createdAt: true,
        },
        orderBy: {
          name: "asc",
        },
      })

      return { folders }
    }),

  create: protectedProcedure("password.create")
    .input(
      z.object({
        name: z.string().min(1, "Folder name is required"),
        description: z.string().optional(),
        parentId: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Get user's company
      let companyId: string | null = null
      if (ctx.subdomain) {
        const company = await prisma.company.findUnique({
          where: { subdomain: ctx.subdomain },
          select: { id: true },
        })
        if (company) {
          companyId = company.id
        }
      } else if (ctx.userId) {
        const user = await prisma.user.findUnique({
          where: { id: ctx.userId },
          select: { companyId: true },
        })
        if (user?.companyId) {
          companyId = user.companyId
        }
      }

      // Check if folder with same name already exists in the same company (at same level if parentId provided)
      const where: any = {
        name: input.name,
        parentId: input.parentId || null,
      }
      
      if (companyId) {
        where.passwords = {
          some: {
            owner: {
              companyId: companyId,
            },
          },
        }
      }

      const existingFolder = await prisma.folder.findFirst({
        where,
      })

      if (existingFolder) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "A folder with this name already exists",
        })
      }

      // Validate parent exists if parentId provided and belongs to same company
      if (input.parentId) {
        const parentWhere: any = { id: input.parentId }
        if (companyId) {
          parentWhere.passwords = {
            some: {
              owner: {
                companyId: companyId,
              },
            },
          }
        }

        const parent = await prisma.folder.findFirst({
          where: parentWhere,
        })

        if (!parent) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Parent folder not found",
          })
        }
      }

      // Create folder
      const folder = await prisma.folder.create({
        data: {
          name: input.name,
          description: input.description || null,
          parentId: input.parentId || null,
        },
        select: {
          id: true,
          name: true,
          description: true,
          icon: true,
          color: true,
          parentId: true,
          createdAt: true,
        },
      })

      return {
        success: true,
        folder,
      }
    }),
})


