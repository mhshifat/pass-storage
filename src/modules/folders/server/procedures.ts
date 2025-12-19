import prisma from "@/lib/prisma"
import { createTRPCRouter, protectedProcedure } from "@/trpc/init"
import z from "zod"
import { TRPCError } from "@trpc/server"

export const foldersRouter = createTRPCRouter({
  list: protectedProcedure("password.view")
    .query(async ({ ctx }) => {
      // Get all folders (for now, we'll support flat structure)
      // Later can be enhanced to support hierarchy
      const folders = await prisma.folder.findMany({
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
    .mutation(async ({ input }) => {
      // Check if folder with same name already exists (at same level if parentId provided)
      const existingFolder = await prisma.folder.findFirst({
        where: {
          name: input.name,
          parentId: input.parentId || null,
        },
      })

      if (existingFolder) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "A folder with this name already exists",
        })
      }

      // Validate parent exists if parentId provided
      if (input.parentId) {
        const parent = await prisma.folder.findUnique({
          where: { id: input.parentId },
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


