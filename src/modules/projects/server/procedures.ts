import prisma from "@/lib/prisma";
import { baseProcedure, createTRPCRouter } from "@/trpc/init";
import z from "zod";

export const projectsRouter = createTRPCRouter({
    create: baseProcedure
        .input(
            z.object({
                name: z.string().min(2, "Project name must be at least 2 characters long"),
                description: z.string().optional(),
                datasource: z.enum(['EXCEL']),
                connectionId: z.number().optional(),
                sheetId: z.string().optional(),
                sheetTabName: z.string().optional(),
            })
        )
        .mutation(async ({ input }) => {
            const project = await prisma.project.create({
                data: {
                    name: input.name,
                    description: input.description,
                    datasource: input.datasource,
                    connectionId: input.connectionId,
                    metadata: {
                        sheetId: input.sheetId,
                        sheetTabName: input.sheetTabName,
                    }
                }
            });

            return project;
        }),
    findMany: baseProcedure
        .input(
            z.object({
                page: z.number().positive(),
                perPage: z.number().positive(),
            })
        )
        .query(async ({ input }) => {
            const page = input.page;
            const perPage = input.perPage;
            const skip = (page - 1) * perPage;

            const [totalItemsCount, items] = await Promise.all([
                prisma.project.count({
                    where: {}
                }),
                prisma.project.findMany({
                    where: {},
                    orderBy: {
                        created_at: "desc"
                    },
                    select: {
                        id: true,
                        name: true,
                        description: true,
                    },
                    take: perPage,
                    skip
                })
            ])

            const totalPages = Math.ceil(totalItemsCount / perPage);

            return {
                items,
                pageInfo: {
                    page,
                    perPage,
                    total: totalItemsCount,
                    totalPages,
                    hasNextPage: page < totalPages,
                    hasPrevPage: page > 1,
                }
            }
        })
});