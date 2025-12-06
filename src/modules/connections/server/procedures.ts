import prisma from "@/lib/prisma";
import { baseProcedure, createTRPCRouter } from "@/trpc/init";
import z from "zod";

export const connectionsRouter = createTRPCRouter({
    connect: baseProcedure
        .input(
            z.object({
                name: z.string().min(2, "Connection name must be at least 2 characters long"),
                type: z.enum(["EXCEL"]),
                description: z.string().optional(),
            })
        )
        .mutation(async ({ input }) => {
            const result = await prisma.$transaction(async (tx) => {
                const connection = await tx.connection.create({
                    data: {
                        name: input.name,
                        description: input.description || "",
                        type: input.type
                    },
                    select: {
                        id: true
                    }
                });

                let connectionUrl = "";

                if (input.type === "EXCEL") {
                    const params = new URLSearchParams({
                        client_id: process.env.GOOGLE_CLIENT_ID!,
                        redirect_uri: process.env.GOOGLE_REDIRECT_URI!,
                        response_type: "code",
                        access_type: "offline",
                        scope: [
                            "https://www.googleapis.com/auth/spreadsheets.readonly",
                            "https://www.googleapis.com/auth/drive.readonly"
                        ].join(" "),
                        prompt: "consent",
                        state: JSON.stringify({
                            connectionId: connection.id
                        })
                    });
                    connectionUrl = "https://accounts.google.com/o/oauth2/v2/auth?" + params.toString();
                }

                return {
                    url: connectionUrl
                }
            });

            return result;
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
                prisma.connection.count({
                    where: {}
                }),
                prisma.connection.findMany({
                    where: {},
                    orderBy: {
                        created_at: "desc"
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