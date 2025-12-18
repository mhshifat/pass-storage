import prisma from "@/lib/prisma"
import { createTRPCRouter, protectedProcedure } from "@/trpc/init"
import z from "zod"
import { TRPCError } from "@trpc/server"

export const rolesRouter = createTRPCRouter({
  create: protectedProcedure("role.manage")
    .input(
      z.object({
        name: z.string().min(2, "Name must be at least 2 characters"),
        description: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Check if role already exists
      const existingRole = await prisma.role.findFirst({
        where: { name: input.name },
      })

      if (existingRole) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Role with this name already exists",
        })
      }

      // Get current userId from context
      const createdById = ctx.userId

      // Create role
      const role = await prisma.role.create({
        data: {
          name: input.name,
          description: input.description || null,
          isSystem: false,
          createdById,
        },
        select: {
          id: true,
          name: true,
          description: true,
          isSystem: true,
          createdAt: true,
          updatedAt: true,
        },
      })

      return {
        success: true,
        role,
      }
    }),

  update: protectedProcedure("role.manage")
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(2, "Name must be at least 2 characters").optional(),
        description: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { id, ...data } = input

      // Check if role exists
      const existingRole = await prisma.role.findUnique({
        where: { id },
      })

      if (!existingRole) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Role not found",
        })
      }

      // Check if role is system role (cannot edit system roles)
      if (existingRole.isSystem) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Cannot edit system roles",
        })
      }

      // If name is being updated, check for conflicts
      if (data.name && data.name !== existingRole.name) {
        const nameTaken = await prisma.role.findFirst({
          where: { name: data.name },
        })

        if (nameTaken) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "Role with this name already exists",
          })
        }
      }

      // Update role
      const role = await prisma.role.update({
        where: { id },
        data: {
          ...(data.name && { name: data.name }),
          // If description is provided (even as empty string), set it to null if empty, otherwise use the value
          ...(data.description !== undefined && { 
            description: data.description.trim() === "" ? null : data.description.trim() 
          }),
        },
        select: {
          id: true,
          name: true,
          description: true,
          isSystem: true,
          createdAt: true,
          updatedAt: true,
        },
      })

      return {
        success: true,
        role,
      }
    }),

  delete: protectedProcedure("role.manage")
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      // Check if role exists
      const existingRole = await prisma.role.findUnique({
        where: { id: input.id },
      })

      if (!existingRole) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Role not found",
        })
      }

      // Check if role is system role (cannot delete system roles)
      if (existingRole.isSystem) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Cannot delete system roles",
        })
      }

      // Check if role has any users assigned (by checking if any users have this role name)
      // Note: This is a basic check - in a real system, you might want to check RolePermission relationships
      const roleNameUpper = existingRole.name.toUpperCase().replace(/\s+/g, '_')
      const validRoles: Array<'SUPER_ADMIN' | 'ADMIN' | 'MANAGER' | 'USER' | 'AUDITOR'> = ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'USER', 'AUDITOR']
      if (validRoles.includes(roleNameUpper as 'SUPER_ADMIN' | 'ADMIN' | 'MANAGER' | 'USER' | 'AUDITOR')) {
        const userCount = await prisma.user.count({
          where: {
            role: roleNameUpper as 'SUPER_ADMIN' | 'ADMIN' | 'MANAGER' | 'USER' | 'AUDITOR',
          },
        })
        if (userCount > 0) {
          throw new TRPCError({
            code: "CONFLICT",
            message: `Cannot delete role. ${userCount} user(s) are assigned to this role.`,
          })
        }
      }

      // Delete role (this will cascade delete RolePermission records)
      await prisma.role.delete({
        where: { id: input.id },
      })

      return {
        success: true,
      }
    }),

  getAssignableRoles: protectedProcedure("user.create")
    .input(z.object({}).optional())
    .query(async ({ ctx }) => {
      // Get current userId from context
      const createdById = ctx.userId

      // Get system roles from database
      const systemRoles = await prisma.role.findMany({
        where: {
          isSystem: true,
        },
        select: {
          name: true,
          description: true,
        },
        orderBy: {
          name: "asc",
        },
      })

      // Get custom roles created by current user
      const customRoles = await prisma.role.findMany({
        where: {
          isSystem: false,
          createdById,
        },
        select: {
          name: true,
          description: true,
        },
        orderBy: {
          name: "asc",
        },
      })

      // Helper function to format display name (convert SUPER_ADMIN to "Super Admin")
      const formatDisplayName = (name: string): string => {
        return name
          .split("_")
          .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
          .join(" ")
      }

      return {
        roles: [
          // Filter out SUPER_ADMIN - it can only be assigned during sign up
          ...systemRoles
            .filter((role) => role.name !== "SUPER_ADMIN")
            .map((role) => ({
              name: role.name,
              displayName: formatDisplayName(role.name),
              isSystem: true,
              description: role.description,
            })),
          ...customRoles.map((role) => ({
            name: role.name,
            displayName: role.name,
            isSystem: false,
            description: role.description,
          })),
        ],
      }
    }),

  stats: protectedProcedure("role.manage")
    .input(z.object({}).optional())
    .query(async ({ ctx }) => {
      // Get current userId from context
      const createdById = ctx.userId

      const [total, system, custom, permissions] = await Promise.all([
        prisma.role.count({
          where: {
            OR: [
              { isSystem: true },
              { createdById },
            ],
          },
        }),
        prisma.role.count({
          where: { isSystem: true },
        }),
        prisma.role.count({
          where: {
            isSystem: false,
            createdById,
          },
        }),
        prisma.permission.count(),
      ])

      return {
        total,
        system,
        custom,
        permissions,
      }
    }),

  list: protectedProcedure("role.manage")
    .input(
      z
        .object({
          page: z.number().min(1).default(1),
          pageSize: z.number().min(1).max(100).default(100),
        })
        .optional()
    )
    .query(async ({ input, ctx }) => {
      const page = input?.page ?? 1
      const pageSize = input?.pageSize ?? 100
      const skip = (page - 1) * pageSize

      // Get current userId from context
      const createdById = ctx.userId

      const [roles, total] = await Promise.all([
        prisma.role.findMany({
          where: {
            OR: [
              { isSystem: true },
              { createdById },
            ],
          },
          select: {
            id: true,
            name: true,
            description: true,
            isSystem: true,
            createdAt: true,
            updatedAt: true,
          },
          orderBy: {
            createdAt: "desc",
          },
          skip,
          take: pageSize,
        }),
        prisma.role.count({
          where: {
            OR: [
              { isSystem: true },
              { createdById },
            ],
          },
        }),
      ])

      // Count users for each role
      // Since User.role is now a string, we can match both system and custom roles
      const rolesWithUserCount = await Promise.all(
        roles.map(async (role) => {
          // Count users with this role name (works for both system and custom roles)
          const userCount = await prisma.user.count({
            where: {
              role: role.name, // Match exact role name
            },
          })
          
          return {
            ...role,
            users: userCount,
            createdAt: role.createdAt.toISOString(),
          }
        })
      )

      return {
        roles: rolesWithUserCount,
        pagination: {
          page,
          pageSize,
          total,
          totalPages: Math.ceil(total / pageSize),
        },
      }
    }),

  getPermissions: protectedProcedure("role.manage")
    .input(z.object({ roleId: z.string() }))
    .query(async ({ input }) => {
      const rolePermissions = await prisma.rolePermission.findMany({
        where: { roleId: input.roleId },
        select: {
          permissionId: true,
        },
      })

      return {
        permissionIds: rolePermissions.map((rp: { permissionId: string }) => rp.permissionId),
      }
    }),

  updatePermissions: protectedProcedure("role.manage")
    .input(
      z.object({
        roleId: z.string(),
        permissionIds: z.array(z.string()),
      })
    )
    .mutation(async ({ input }) => {
      // Delete existing permissions
      await prisma.rolePermission.deleteMany({
        where: { roleId: input.roleId },
      })

      // Create new permissions
      if (input.permissionIds.length > 0) {
        await prisma.rolePermission.createMany({
          data: input.permissionIds.map((permissionId) => ({
            roleId: input.roleId,
            permissionId,
          })),
        })
      }

      return {
        success: true,
      }
    }),

  getAllPermissions: protectedProcedure("role.manage").query(async () => {
    const permissions = await prisma.permission.findMany({
      orderBy: [
        { category: "asc" },
        { name: "asc" },
      ],
    })

    // If no permissions exist, initialize them
    if (permissions.length === 0) {
      const defaultPermissions = [
        // User Management
        { key: "user.create", name: "Create Users", description: "Create new user accounts", category: "User Management" },
        { key: "user.edit", name: "Edit Users", description: "Modify user information", category: "User Management" },
        { key: "user.delete", name: "Delete Users", description: "Remove user accounts", category: "User Management" },
        { key: "user.view", name: "View Users", description: "View user information", category: "User Management" },
        // Password Management
        { key: "password.create", name: "Create Passwords", description: "Create new password entries", category: "Password Management" },
        { key: "password.edit", name: "Edit Passwords", description: "Modify password entries", category: "Password Management" },
        { key: "password.delete", name: "Delete Passwords", description: "Remove password entries", category: "Password Management" },
        { key: "password.view", name: "View Passwords", description: "View password entries", category: "Password Management" },
        { key: "password.share", name: "Share Passwords", description: "Share passwords with others", category: "Password Management" },
        // Group Management
        { key: "group.create", name: "Create Groups", description: "Create new groups", category: "Group Management" },
        { key: "group.edit", name: "Edit Groups", description: "Modify group settings", category: "Group Management" },
        { key: "group.delete", name: "Delete Groups", description: "Remove groups", category: "Group Management" },
        { key: "group.view", name: "View Groups", description: "View group information", category: "Group Management" },
        // System Settings
        { key: "settings.view", name: "View Settings", description: "View system settings", category: "System Settings" },
        { key: "settings.edit", name: "Edit Settings", description: "Modify system settings", category: "System Settings" },
        { key: "audit.view", name: "View Audit Logs", description: "Access audit logs", category: "System Settings" },
        { key: "role.manage", name: "Manage Roles", description: "Create and edit roles", category: "System Settings" },
      ]

      // Create permissions in database (skip duplicates)
      await prisma.permission.createMany({
        data: defaultPermissions,
        skipDuplicates: true,
      })

      // Fetch them again
      const createdPermissions = await prisma.permission.findMany({
        orderBy: [
          { category: "asc" },
          { name: "asc" },
        ],
      })

      // Group by category
      const grouped = createdPermissions.reduce(
        (acc: Record<string, Array<{ id: string; key: string; name: string; description: string }>>, permission: { id: string; key: string; name: string; description: string | null; category: string }) => {
          if (!acc[permission.category]) {
            acc[permission.category] = []
          }
          acc[permission.category].push({
            id: permission.id,
            key: permission.key,
            name: permission.name,
            description: permission.description || "",
          })
          return acc
        },
        {} as Record<string, Array<{ id: string; key: string; name: string; description: string }>>
      )

      return Object.entries(grouped).map(([category, items]) => ({
        category,
        items,
      }))
    }

    // Group by category
    const grouped = permissions.reduce(
      (acc: Record<string, Array<{ id: string; key: string; name: string; description: string }>>, permission: { id: string; key: string; name: string; description: string | null; category: string }) => {
        if (!acc[permission.category]) {
          acc[permission.category] = []
        }
        acc[permission.category].push({
          id: permission.id,
          key: permission.key,
          name: permission.name,
          description: permission.description || "",
        })
        return acc
      },
      {} as Record<string, Array<{ id: string; key: string; name: string; description: string }>>
    )

    return Object.entries(grouped).map(([category, items]) => ({
      category,
      items,
    }))
  }),
})

