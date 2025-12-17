import prisma from "@/lib/prisma"
import { baseProcedure, createTRPCRouter } from "@/trpc/init"
import z from "zod"
import { hashPassword } from "@/lib/auth"
import { TRPCError } from "@trpc/server"
import { Prisma } from '@/app/generated';

export const usersRouter = createTRPCRouter({
  create: baseProcedure
    .input(
      z.object({
        name: z.string().min(2, "Name must be at least 2 characters"),
        email: z.string().email("Invalid email address"),
        password: z.string().min(8, "Password must be at least 8 characters"),
        role: z.enum(["USER", "ADMIN", "MANAGER"]).default("USER"),
        mfaEnabled: z.boolean().default(false),
        isActive: z.boolean().default(true),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email: input.email },
      })

      if (existingUser) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "User with this email already exists",
        })
      }

      // Hash password
      const hashedPassword = await hashPassword(input.password)

      // Get current userId from context
      const createdById = ctx.userId;

      // Create user
      const user = await prisma.user.create({
        data: {
          name: input.name,
          email: input.email,
          password: hashedPassword,
          role: input.role,
          mfaEnabled: input.mfaEnabled,
          isActive: input.isActive,
          createdById,
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          mfaEnabled: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
        },
      })

      return {
        success: true,
        user,
      }
    }),

  update: baseProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(2).optional(),
        email: z.string().email().optional(),
        password: z.string().min(8).optional(),
        role: z.enum(["USER", "ADMIN", "MANAGER"]).optional(),
        mfaEnabled: z.boolean().optional(),
        isActive: z.boolean().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { id, password, ...data } = input

      // Check if user exists
      const existingUser = await prisma.user.findUnique({
        where: { id },
      })

      if (!existingUser) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        })
      }

      // If email is being updated, check for conflicts
      if (data.email && data.email !== existingUser.email) {
        const emailTaken = await prisma.user.findUnique({
          where: { email: data.email },
        })

        if (emailTaken) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "Email already in use",
          })
        }
      }

      // Hash password if provided
      const updateData: Record<string, unknown> = { ...data }
      if (password) {
        updateData.password = await hashPassword(password)
      }

      // Update user
      const user = await prisma.user.update({
        where: { id },
        data: updateData,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          mfaEnabled: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
        },
      })

      return {
        success: true,
        user,
      }
    }),

  delete: baseProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      // Check if user exists
      const existingUser = await prisma.user.findUnique({
        where: { id: input.id },
      })

      if (!existingUser) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        })
      }

      // Delete user
      await prisma.user.delete({
        where: { id: input.id },
      })

      return {
        success: true,
      }
    }),

  resetPassword: baseProcedure
    .input(z.object({ 
      id: z.string(),
      currentPassword: z.string().min(1, "Current password is required"),
      newPassword: z.string().min(8, "Password must be at least 8 characters")
    }))
    .mutation(async ({ input }) => {
      // Check if user exists
      const existingUser = await prisma.user.findUnique({
        where: { id: input.id },
      })

      if (!existingUser) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        })
      }

      // Verify current password
      if (!existingUser.password) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "User does not have a password set",
        })
      }

      const { verifyPassword } = await import("@/lib/auth")
      const isCurrentPasswordValid = await verifyPassword(input.currentPassword, existingUser.password)

      if (!isCurrentPasswordValid) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Current password is incorrect",
        })
      }

      // Check if new password is same as current
      const isSamePassword = await verifyPassword(input.newPassword, existingUser.password)

      if (isSamePassword) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "New password must be different from current password",
        })
      }

      // Hash the new password
      const hashedPassword = await hashPassword(input.newPassword)

      // Update user password
      await prisma.user.update({
        where: { id: input.id },
        data: { password: hashedPassword },
      })

      return {
        success: true,
      }
    }),

  list: baseProcedure
    .input(
      z
        .object({
          page: z.number().min(1).default(1),
          pageSize: z.number().min(1).max(100).default(10),
          excludeUserId: z.string().optional(),
        })
        .optional()
    )
    .query(async ({ input, ctx }) => {
      const page = input?.page ?? 1
      const pageSize = input?.pageSize ?? 10
      const skip = (page - 1) * pageSize


      // Get current userId from context
      const createdById = ctx.userId;
      const whereClause: Prisma.UserWhereInput = {
        createdById
      };
      if (input?.excludeUserId) {
        whereClause.id = { not: input.excludeUserId };
      }

      const [users, total] = await Promise.all([
        prisma.user.findMany({
          where: whereClause,
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            mfaEnabled: true,
            isActive: true,
            lastLoginAt: true,
            createdAt: true,
            updatedAt: true,
          },
          orderBy: {
            createdAt: "desc",
          },
          skip,
          take: pageSize,
        }),
        prisma.user.count({ where: whereClause }),
      ])

      return {
        users,
        pagination: {
          page,
          pageSize,
          total,
          totalPages: Math.ceil(total / pageSize),
        },
      }
    }),

  sendEmail: baseProcedure
    .input(
      z.object({
        userId: z.string(),
        subject: z.string().min(1, "Subject is required"),
        message: z.string().min(1, "Message is required"),
      })
    )
    .mutation(async ({ input }) => {
      // Get user email
      const user = await prisma.user.findUnique({
        where: { id: input.userId },
        select: { email: true, name: true },
      })

      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        })
      }

      // Send email using nodemailer
      const { sendEmail } = await import("@/lib/mailer")
      const emailResult = await sendEmail({
        to: user.email,
        subject: input.subject,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">${input.subject}</h2>
            <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
              <p style="color: #555; white-space: pre-wrap;">${input.message}</p>
            </div>
            <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
            <p style="color: #999; font-size: 12px;">
              This email was sent from Password Storage application.
            </p>
          </div>
        `,
        text: input.message,
      })

      if (!emailResult.success) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: emailResult.error || "Failed to send email",
        })
      }

      // Create audit log for email sent
      await prisma.auditLog.create({
        data: {
          action: "EMAIL_SENT",
          resource: "User",
          userId: input.userId,
          resourceId: null,
          details: `Email sent to ${user.email}: ${input.subject}`,
        },
      })

      return { success: true }
    }),

  stats: baseProcedure
    .input(z.object({ excludeUserId: z.string().optional() }).optional())
    .query(async ({ input }) => {
      const excludeUserId = input?.excludeUserId;
      const where = excludeUserId ? { id: { not: excludeUserId } } : {};
      const [total, active, mfa, admins] = await Promise.all([
        prisma.user.count({ where }),
        prisma.user.count({ where: { ...where, isActive: true } }),
        prisma.user.count({ where: { ...where, mfaEnabled: true } }),
        prisma.user.count({ where: { ...where, role: "ADMIN" } }),
      ])
      return {
        total,
        active,
        mfa,
        admins,
      }
    }),
})
