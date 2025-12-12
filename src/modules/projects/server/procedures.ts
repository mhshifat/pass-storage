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
    upsertTableGroups: baseProcedure
        .input(
            z.object({
                projectId: z.number().positive(),
                groups: z.array(
                    z.object({
                        name: z.string().min(2, "Name must be at least 2 characters").max(50, "Name must be at most 50 characters"),
                        columns: z.array(z.string()).min(1, "At least one column must be selected"),
                    })
                )
            })
        )
        .mutation(async ({ input }) => {
            const groups = input.groups;
            const chunkSize = 250;

            for (let i = 0; i < groups.length; i += chunkSize) {
                const chunk = groups.slice(i, i + chunkSize);

                await prisma.$transaction(
                    chunk.map(group =>
                        prisma.projectTableGroup.upsert({
                            where: {
                                projectId_name: {
                                    name: group.name,
                                    projectId: input.projectId,
                                },
                            },
                            update: {
                                columns: group.columns,
                            },
                            create: {
                                projectId: input.projectId,
                                name: group.name,
                                columns: group.columns,
                            },
                        })
                    )
                );
            }
        }),
    mergeTableGroups: baseProcedure
        .input(
            z.object({
                projectId: z.number().positive(),
                mergedGroupName: z.string().min(2, "Merged group name must be at least 2 characters").max(50, "Merged group name must be at most 50 characters"),
                selectedGroupIds: z.array(z.number().positive()).min(2, "At least two groups must be selected for merging"),
            })
        )
        .mutation(async ({ input }) => {
            const mergedGroup = await prisma.projectTableMergeGroup.create({
                data: {
                    name: input.mergedGroupName,
                    projectId: input.projectId,
                    tableGroups: {
                        createMany: {
                            data: input.selectedGroupIds.map(groupId => ({
                                tableGroupId: groupId,
                            })),
                        }
                    }
                }
            });

            return mergedGroup;
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
        }),
    findManyGroupsByProjectId: baseProcedure
        .input(
            z.object({
                page: z.number().positive(),
                perPage: z.number().positive(),
                projectId: z.number().positive(),
            })
        )
        .query(async ({ input }) => {
            const page = input.page;
            const perPage = input.perPage;
            const skip = (page - 1) * perPage;

            const [totalItemsCount, items] = await Promise.all([
                prisma.projectTableGroup.count({
                    where: {
                        projectId: input.projectId,
                    }
                }),
                prisma.projectTableGroup.findMany({
                    where: {
                        projectId: input.projectId,
                    },
                    orderBy: {
                        created_at: "desc"
                    },
                    select: {
                        id: true,
                        name: true,
                        columns: true,
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
        }),
    findManyMergeGroupsByProjectId: baseProcedure
        .input(
            z.object({
                page: z.number().positive(),
                perPage: z.number().positive(),
                projectId: z.number().positive(),
            })
        )
        .query(async ({ input }) => {
            const page = input.page;
            const perPage = input.perPage;
            const skip = (page - 1) * perPage;

            const [totalItemsCount, items] = await Promise.all([
                prisma.projectTableMergeGroup.count({
                    where: {
                        projectId: input.projectId,
                    }
                }),
                prisma.projectTableMergeGroup.findMany({
                    where: {
                        projectId: input.projectId,
                    },
                    orderBy: {
                        created_at: "desc"
                    },
                    select: {
                        id: true,
                        name: true,
                        tableGroups: true,
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
        }),
    findById: baseProcedure
        .input(
            z.object({
                id: z.number().positive(),
            })
        )
        .query(async ({ input }) => {
            const [item] = await Promise.all([
                prisma.project.findUnique({
                    where: {  id: input.id },
                    include: {
                        connection: true,
                    }
                })
            ])


            return item;
        })
});
