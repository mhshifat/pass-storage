import prisma from "@/lib/prisma";
import { baseProcedure, createTRPCRouter } from "@/trpc/init";
import z from "zod";
import { hashPassword, verifyPassword } from "@/lib/auth";
import { createSession, destroySession, getSession } from "@/lib/session";
import { TRPCError } from "@trpc/server";

export const authRouter = createTRPCRouter({
    register: baseProcedure
        .input(
            z.object({
                name: z.string().min(2, "Name must be at least 2 characters"),
                email: z.string().email("Invalid email address"),
                password: z.string().min(8, "Password must be at least 8 characters"),
            })
        )
        .mutation(async ({ input }) => {
            // Check if user already exists
            const existingUser = await prisma.user.findUnique({
                where: { email: input.email },
            });

            if (existingUser) {
                throw new TRPCError({
                    code: "CONFLICT",
                    message: "User with this email already exists",
                });
            }

            // Hash password
            const hashedPassword = await hashPassword(input.password);

            // Create user (first user is admin)
            const userCount = await prisma.user.count();
            const role = userCount === 0 ? "ADMIN" : "USER";

            const user = await prisma.user.create({
                data: {
                    name: input.name,
                    email: input.email,
                    password: hashedPassword,
                    role,
                },
            });

            // Create session
            await createSession(user.id, user.email);

            return {
                success: true,
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                },
            };
        }),
    login: baseProcedure
        .input(
            z.object({
                email: z.string().email("Invalid email address"),
                password: z.string().min(1, "Password is required"),
            })
        )
        .mutation(async ({ input }) => {
            // Find user
            const user = await prisma.user.findUnique({
                where: { email: input.email },
            });

            if (!user) {
                throw new TRPCError({
                    code: "UNAUTHORIZED",
                    message: "Invalid email or password",
                });
            }

            // Check if user has a password (might be null for OAuth users)
            if (!user.password) {
                throw new TRPCError({
                    code: "UNAUTHORIZED",
                    message: "Invalid email or password",
                });
            }

            // Verify password
            const isValid = await verifyPassword(input.password, user.password);

            if (!isValid) {
                throw new TRPCError({
                    code: "UNAUTHORIZED",
                    message: "Invalid email or password",
                });
            }

            // Update last login time
            await prisma.user.update({
                where: { id: user.id },
                data: { lastLoginAt: new Date() },
            });

            // Create session
            await createSession(user.id, user.email);

            return {
                success: true,
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                },
            };
        }),
    logout: baseProcedure
        .mutation(async () => {
            await destroySession();
            return { success: true };
        }),
    getCurrentUser: baseProcedure
        .query(async () => {
            const session = await getSession();
            
            if (!session) {
                throw new TRPCError({
                    code: "UNAUTHORIZED",
                    message: "Not authenticated",
                });
            }

            const user = await prisma.user.findUnique({
                where: { id: session.userId },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                },
            });

            if (!user) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "User not found",
                });
            }

            return user;
        }),
});
