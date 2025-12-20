import prisma from "@/lib/prisma"
import { createTRPCRouter, protectedProcedure } from "@/trpc/init"
import z from "zod"
import { hashPassword } from "@/lib/auth"
import { TRPCError } from "@trpc/server"
import { Prisma } from '@/app/generated';

export const usersRouter = createTRPCRouter({
  create: protectedProcedure("user.create")
    .input(
      z.object({
        name: z.string().min(2, "Name must be at least 2 characters"),
        email: z.string().email("Invalid email address"),
        password: z.string().min(8, "Password must be at least 8 characters"),
        role: z.string().min(1, "Role is required").default("USER"),
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

      // Validate password against security policies
      const { validatePassword } = await import("@/lib/password-validation")
      const validation = await validatePassword(input.password)
      if (!validation.isValid) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: validation.errors.join(". "),
        })
      }

      // Hash password
      const hashedPassword = await hashPassword(input.password)

      // Get current userId from context
      const createdById = ctx.userId;

      // Validate role - check if it's a valid system role or a custom role
      const validSystemRoles = ["SUPER_ADMIN", "ADMIN", "MANAGER", "USER", "AUDITOR"]
      let roleValue = input.role.toUpperCase()
      
      // Prevent assigning SUPER_ADMIN - it can only be assigned during sign up
      if (roleValue === "SUPER_ADMIN") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "SUPER_ADMIN role cannot be assigned. It can only be assigned during sign up.",
        })
      }
      
      if (!validSystemRoles.includes(roleValue)) {
        // Check if it's a custom role
        const customRole = await prisma.role.findFirst({
          where: { name: input.role },
        })
        if (!customRole) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: `Invalid role: ${input.role}. Role must be a system role or a custom role you created.`,
          })
        }
        // Use the custom role name as-is
        roleValue = input.role
      }

      // Create user
      const user = await prisma.user.create({
        data: {
          name: input.name,
          email: input.email,
          password: hashedPassword,
          role: roleValue,
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

      // Create audit log
      const { createAuditLog } = await import("@/lib/audit-log")
      await createAuditLog({
        action: "USER_CREATED",
        resource: "User",
        resourceId: user.id,
        details: { name: user.name, email: user.email, role: user.role },
        userId: ctx.userId,
      })

      return {
        success: true,
        user,
      }
    }),

  update: protectedProcedure("user.edit")
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(2).optional(),
        email: z.string().email().optional(),
        password: z.string().min(8).optional(),
        role: z.string().min(1).optional(),
        mfaEnabled: z.boolean().optional(),
        isActive: z.boolean().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { id, password, ...data } = input

      // Check if user exists
      const existingUser = await prisma.user.findUnique({
        where: { id },
        select: {
          id: true,
          email: true, // Include email to check if it's being changed
          createdById: true,
        },
      })

      if (!existingUser) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        })
      }

      // Prevent users from modifying their creator (SUPER_ADMIN can modify anyone)
      if (ctx.userRole !== "SUPER_ADMIN" && existingUser.createdById === ctx.userId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You cannot modify the user who created your account",
        })
      }

      // If email is being updated, check for conflicts (only if email actually changed)
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
        // Validate password against security policies
        const { validatePassword } = await import("@/lib/password-validation")
        const validation = await validatePassword(password)
        if (!validation.isValid) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: validation.errors.join(". "),
          })
        }
        updateData.password = await hashPassword(password)
      }

      // Handle role update if provided
      if (data.role) {
        const validSystemRoles = ["SUPER_ADMIN", "ADMIN", "MANAGER", "USER", "AUDITOR"]
        let roleValue = data.role.toUpperCase()
        
        // Prevent assigning SUPER_ADMIN - it can only be assigned during sign up
        if (roleValue === "SUPER_ADMIN") {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "SUPER_ADMIN role cannot be assigned. It can only be assigned during sign up.",
          })
        }
        
        if (!validSystemRoles.includes(roleValue)) {
          // Check if it's a custom role
          const customRole = await prisma.role.findFirst({
            where: { name: data.role },
          })
          if (!customRole) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: `Invalid role: ${data.role}. Role must be a system role or a custom role you created.`,
            })
          }
          // Use the custom role name as-is
          roleValue = data.role
        }
        updateData.role = roleValue
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

      // Create audit log
      const { createAuditLog } = await import("@/lib/audit-log")
      const changedFields = Object.keys(data).filter(key => data[key as keyof typeof data] !== undefined)
      await createAuditLog({
        action: "USER_UPDATED",
        resource: "User",
        resourceId: user.id,
        details: { changedFields, email: user.email },
        userId: ctx.userId,
      })

      return {
        success: true,
        user,
      }
    }),

  delete: protectedProcedure("user.delete")
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      // Check if user exists
      const existingUser = await prisma.user.findUnique({
        where: { id: input.id },
        select: {
          id: true,
          createdById: true,
        },
      })

      if (!existingUser) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        })
      }

      // Prevent users from deleting their creator (SUPER_ADMIN can delete anyone)
      if (ctx.userRole !== "SUPER_ADMIN" && existingUser.createdById === ctx.userId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You cannot delete the user who created your account",
        })
      }

      // Create audit log before deletion
      const { createAuditLog } = await import("@/lib/audit-log")
      await createAuditLog({
        action: "USER_DELETED",
        resource: "User",
        resourceId: input.id,
        userId: ctx.userId,
      })

      // Delete user
      await prisma.user.delete({
        where: { id: input.id },
      })

      return {
        success: true,
      }
    }),

  resetPassword: protectedProcedure("user.edit")
    .input(z.object({ 
      id: z.string(),
      currentPassword: z.string().min(1, "Current password is required"),
      newPassword: z.string().min(8, "Password must be at least 8 characters")
    }))
    .mutation(async ({ input, ctx }) => {
      // Check if user exists
      const existingUser = await prisma.user.findUnique({
        where: { id: input.id },
        select: {
          id: true,
          password: true,
          createdById: true,
        },
      })

      if (!existingUser) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        })
      }

      // Prevent users from resetting their creator's password (SUPER_ADMIN can reset anyone's password)
      if (ctx.userRole !== "SUPER_ADMIN" && existingUser.createdById === ctx.userId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You cannot reset the password of the user who created your account",
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

      // Validate new password against security policies
      const { validatePassword } = await import("@/lib/password-validation")
      const validation = await validatePassword(input.newPassword)
      if (!validation.isValid) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: validation.errors.join(". "),
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

  list: protectedProcedure("user.view")
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

      // Build where clause - show all users (not just created by current user)
      // Users with user.view permission should see all users
      const whereClause: Prisma.UserWhereInput = {};
      if (input?.excludeUserId) {
        whereClause.id = { not: input.excludeUserId };
      }

      // Check if user has edit permission to see sensitive information
      const hasEditPermission = ctx.permissions.includes("user.edit");
      // Check if current user is SUPER_ADMIN (can see everything and perform all actions)
      const isSuperAdmin = ctx.userRole === "SUPER_ADMIN";

      const [users, total] = await Promise.all([
        prisma.user.findMany({
          where: whereClause,
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            createdById: true, // Include to check if user can modify this user
            // Only include sensitive fields if user has edit permission
            ...(hasEditPermission ? {
            mfaEnabled: true,
              lastLoginAt: true,
            } : {}),
            isActive: true,
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

      // Filter out sensitive fields for creator users if not SUPER_ADMIN
      // SUPER_ADMIN can see everything, but other roles cannot see sensitive info about their creator
      const filteredUsers = users.map((user) => {
        // If current user is SUPER_ADMIN, return all fields as-is
        if (isSuperAdmin) {
          return user;
        }
        
        // If this user is the creator of the current user, remove sensitive fields
        if (user.createdById === ctx.userId && hasEditPermission) {
          return {
            ...user,
            mfaEnabled: undefined,
            lastLoginAt: undefined,
          };
        }
        
        return user;
      });

      return {
        users: filteredUsers,
        // Include flag to indicate if sensitive fields are included
        includeSensitiveFields: hasEditPermission,
        // Include flag to indicate if current user is SUPER_ADMIN
        isSuperAdmin,
        pagination: {
          page,
          pageSize,
          total,
          totalPages: Math.ceil(total / pageSize),
        },
      }
    }),

  sendEmail: protectedProcedure("user.edit")
    .input(
      z.object({
        userId: z.string(),
        subject: z.string().min(1, "Subject is required"),
        message: z.string().min(1, "Message is required"),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Get user email
      const user = await prisma.user.findUnique({
        where: { id: input.userId },
        select: { 
          id: true,
          email: true, 
          name: true,
          createdById: true,
        },
      })

      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        })
      }

      // Prevent users from sending emails to their creator (SUPER_ADMIN can send emails to anyone)
      if (ctx.userRole !== "SUPER_ADMIN" && user.createdById === ctx.userId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You cannot send emails to the user who created your account",
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

  stats: protectedProcedure("user.view")
    .input(z.object({ excludeUserId: z.string().optional() }).optional())
    .query(async ({ input }) => {
      const excludeUserId = input?.excludeUserId;
      const where = excludeUserId ? { id: { not: excludeUserId } } : {};
      const [total, active, mfa, admins] = await Promise.all([
        prisma.user.count({ where }),
        prisma.user.count({ where: { ...where, isActive: true } }),
        prisma.user.count({ where: { ...where, mfaEnabled: true } }),
        prisma.user.count({ where: { ...where, role: { in: ["ADMIN", "admin"] } } }),
      ])
      return {
        total,
        active,
        mfa,
        admins,
      }
    }),
})
