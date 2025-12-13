import prisma from "@/lib/prisma";
import { baseProcedure, createTRPCRouter } from "@/trpc/init";

export const dashboardRouter = createTRPCRouter({
    getStats: baseProcedure
        .query(async () => {
            const [
                totalProjects,
                totalConnections,
                totalTableGroups,
                totalMergeGroups,
                recentProjects,
                recentConnections,
            ] = await Promise.all([
                prisma.project.count(),
                prisma.connection.count(),
                prisma.projectTableGroup.count(),
                prisma.projectTableMergeGroup.count(),
                prisma.project.findMany({
                    take: 5,
                    orderBy: { created_at: 'desc' },
                    select: {
                        id: true,
                        name: true,
                        created_at: true,
                        datasource: true,
                    }
                }),
                prisma.connection.findMany({
                    take: 5,
                    orderBy: { created_at: 'desc' },
                    select: {
                        id: true,
                        name: true,
                        created_at: true,
                        type: true,
                    }
                }),
            ]);

            // Get projects with their table group counts
            const projectsWithGroups = await prisma.project.findMany({
                select: {
                    id: true,
                    name: true,
                    _count: {
                        select: {
                            tableGroups: true,
                            mergeGroups: true,
                        }
                    }
                },
                orderBy: {
                    created_at: 'desc'
                },
                take: 10,
            });

            return {
                overview: {
                    totalProjects,
                    totalConnections,
                    totalTableGroups,
                    totalMergeGroups,
                },
                recentActivity: {
                    projects: recentProjects,
                    connections: recentConnections,
                },
                projectsWithGroups,
            };
        }),
});
