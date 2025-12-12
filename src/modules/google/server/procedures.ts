import { getSheetData, getSheetNames, getSheetTabs } from "@/lib/google-sheets";
import prisma from "@/lib/prisma";
import { baseProcedure, createTRPCRouter } from "@/trpc/init";
import z from "zod";

export const googlesRouter = createTRPCRouter({
    getSheetsMutation: baseProcedure
        .input(
            z.object({
                connectionId: z.number()
            })
        )
        .mutation(async ({ input }) => {
            const connection = await prisma.connection.findUnique({
                where: { id: input.connectionId },
                select: {
                    metadata: true
                }
            });
            if (!connection) throw new Error("Connection not found");

            const refreshToken: string | null = (typeof connection.metadata === "object" && "refresh_token" in connection.metadata!) ? (connection?.metadata?.refresh_token as string | null) : null;

            if (!refreshToken) throw new Error("Refresh token not found");

            const sheets = await getSheetNames(refreshToken);

            return sheets;
        }),
    getSheetTabsMutation: baseProcedure
        .input(
            z.object({
                connectionId: z.number(),
                sheetId: z.string()
            })
        )
        .mutation(async ({ input }) => {
            const connection = await prisma.connection.findUnique({
                where: { id: input.connectionId },
                select: {
                    metadata: true
                }
            });
            if (!connection) throw new Error("Connection not found");

            const refreshToken: string | null = (typeof connection.metadata === "object" && "refresh_token" in connection.metadata!) ? (connection?.metadata?.refresh_token as string | null) : null;

            if (!refreshToken) throw new Error("Refresh token not found");

            const sheets = await getSheetTabs(refreshToken, input.sheetId);

            return sheets;
        }),
    getSheetData: baseProcedure
        .input(
            z.object({
                connectionId: z.number(),
                sheetId: z.string(),
                sheetName: z.string(),
            })
        )
        .query(async ({ input }) => {
            const connection = await prisma.connection.findUnique({
                where: { id: input.connectionId },
                select: {
                    metadata: true
                }
            });
            if (!connection) throw new Error("Connection not found");

            const refreshToken: string | null = (typeof connection.metadata === "object" && "refresh_token" in connection.metadata!) ? (connection?.metadata?.refresh_token as string | null) : null;

            if (!refreshToken) throw new Error("Refresh token not found");

            const data = await getSheetData(refreshToken, input.sheetId, input.sheetName);
            return data;
        }),
});