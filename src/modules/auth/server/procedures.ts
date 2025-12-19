import prisma from "@/lib/prisma";
import { baseProcedure, createTRPCRouter } from "@/trpc/init";
import z from "zod";
import { hashPassword, verifyPassword } from "@/lib/auth";
import { createSession, destroySession, getSession } from "@/lib/session";
import { TRPCError } from "@trpc/server";
import { decrypt, encrypt } from "@/lib/crypto";

/**
 * Ensure system roles and permissions exist in the database
 */
async function ensureSystemRolesExist() {
  // Check if permissions exist, if not create them
  const permissionCount = await prisma.permission.count();
  
  if (permissionCount === 0) {
    const defaultPermissions = [
      { key: "user.create", name: "Create Users", description: "Create new user accounts", category: "User Management" },
      { key: "user.edit", name: "Edit Users", description: "Modify user information", category: "User Management" },
      { key: "user.delete", name: "Delete Users", description: "Remove user accounts", category: "User Management" },
      { key: "user.view", name: "View Users", description: "View user information", category: "User Management" },
      { key: "password.create", name: "Create Passwords", description: "Create new password entries", category: "Password Management" },
      { key: "password.edit", name: "Edit Passwords", description: "Modify password entries", category: "Password Management" },
      { key: "password.delete", name: "Delete Passwords", description: "Remove password entries", category: "Password Management" },
      { key: "password.view", name: "View Passwords", description: "View password entries", category: "Password Management" },
      { key: "password.share", name: "Share Passwords", description: "Share passwords with others", category: "Password Management" },
      { key: "team.create", name: "Create Teams", description: "Create new teams", category: "Team Management" },
      { key: "team.edit", name: "Edit Teams", description: "Modify team settings", category: "Team Management" },
      { key: "team.delete", name: "Delete Teams", description: "Remove teams", category: "Team Management" },
      { key: "team.view", name: "View Teams", description: "View team information", category: "Team Management" },
      { key: "settings.view", name: "View Settings", description: "View system settings", category: "System Settings" },
      { key: "settings.edit", name: "Edit Settings", description: "Modify system settings", category: "System Settings" },
      { key: "audit.view", name: "View Audit Logs", description: "Access audit logs", category: "System Settings" },
      { key: "role.manage", name: "Manage Roles", description: "Create and edit roles", category: "System Settings" },
    ];

    await prisma.permission.createMany({
      data: defaultPermissions,
      skipDuplicates: true,
    });
  }

  // Always ensure all system roles exist with their permissions
  // This ensures all 5 system roles are created, not just the one being assigned
  await ensureAllSystemRoles();
}

/**
 * Ensure all system roles exist with their permissions
 */
async function ensureAllSystemRoles() {
  // Get all permissions
  const allPermissions = await prisma.permission.findMany();
  const permissionMap = new Map(allPermissions.map((p) => [p.key, p.id]));

  // Define all system roles with their permissions
  const systemRoles = [
    {
      name: "SUPER_ADMIN",
      description: "Super Administrator with ultimate system control - can manage roles and system settings",
      permissions: [
        "user.create", "user.edit", "user.delete", "user.view",
        "password.create", "password.edit", "password.delete", "password.view", "password.share",
        "team.create", "team.edit", "team.delete", "team.view",
        "settings.view", "settings.edit", "audit.view", "role.manage",
      ],
    },
    {
      name: "ADMIN",
      description: "Administrator with elevated permissions - can manage users and content, but cannot manage roles or edit system settings",
      permissions: [
        "user.create", "user.edit", "user.delete", "user.view",
        "password.create", "password.edit", "password.delete", "password.view", "password.share",
        "team.create", "team.edit", "team.delete", "team.view",
        "settings.view", "audit.view",
      ],
    },
    {
      name: "MANAGER",
      description: "Manager with management permissions",
      permissions: [
        "user.view", "user.edit",
        "password.create", "password.edit", "password.delete", "password.view", "password.share",
        "team.create", "team.edit", "team.delete", "team.view",
        "settings.view", "audit.view",
      ],
    },
    {
      name: "USER",
      description: "Standard user with basic permissions",
      permissions: [
        "user.view",
        "password.create", "password.edit", "password.delete", "password.view", "password.share",
        "team.view",
      ],
    },
    {
      name: "AUDITOR",
      description: "Auditor with read-only access to audit logs",
      permissions: [
        "user.view",
        "password.view",
        "team.view",
        "settings.view",
        "audit.view",
      ],
    },
  ];

  // Create or update each system role
  for (const roleData of systemRoles) {
    const { permissions, ...roleInfo } = roleData;

    // Create or update the role
    const role = await prisma.role.upsert({
      where: { name: roleInfo.name },
      update: {
        description: roleInfo.description,
        isSystem: true,
      },
      create: {
        name: roleInfo.name,
        description: roleInfo.description,
        isSystem: true,
        createdById: null,
      },
    });

    // Get permission IDs for this role
    const permissionIds = permissions
      .map((key) => permissionMap.get(key))
      .filter((id): id is string => id !== undefined);

    // Delete existing permissions for this role (to ensure correct permissions)
    await prisma.rolePermission.deleteMany({
      where: { roleId: role.id },
    });

    // Assign permissions
    if (permissionIds.length > 0) {
      await prisma.rolePermission.createMany({
        data: permissionIds.map((permissionId) => ({
          roleId: role.id,
          permissionId,
        })),
        skipDuplicates: true,
      });
    }
  }
}

/**
 * Create a system role with appropriate permissions
 */
async function createSystemRoleWithPermissions(roleName: string, isFirstUser: boolean) {
  // Get all permissions
  const allPermissions = await prisma.permission.findMany();
  const permissionMap = new Map(allPermissions.map((p) => [p.key, p.id]));

  // Define role permissions based on role name
  let rolePermissions: string[] = [];
  
  if (roleName === "SUPER_ADMIN" || (roleName === "ADMIN" && isFirstUser)) {
    // First user gets all permissions (SUPER_ADMIN level)
    rolePermissions = [
      "user.create", "user.edit", "user.delete", "user.view",
      "password.create", "password.edit", "password.delete", "password.view", "password.share",
      "team.create", "team.edit", "team.delete", "team.view",
      "settings.view", "settings.edit", "audit.view", "role.manage",
    ];
  } else if (roleName === "ADMIN") {
    rolePermissions = [
      "user.create", "user.edit", "user.delete", "user.view",
      "password.create", "password.edit", "password.delete", "password.view", "password.share",
      "team.create", "team.edit", "team.delete", "team.view",
      "settings.view", "audit.view",
    ];
  } else if (roleName === "USER") {
    rolePermissions = [
      "user.view",
      "password.create", "password.edit", "password.delete", "password.view", "password.share",
      "team.view",
    ];
  }

  // Create or update the role
  const role = await prisma.role.upsert({
    where: { name: roleName },
    update: {
      description: isFirstUser 
        ? "Super Administrator with ultimate system control - can manage roles and system settings"
        : roleName === "ADMIN"
        ? "Administrator with elevated permissions"
        : "Standard user with basic permissions",
      isSystem: true, // Ensure it stays as system role
    },
    create: {
      name: roleName,
      description: isFirstUser 
        ? "Super Administrator with ultimate system control - can manage roles and system settings"
        : roleName === "ADMIN"
        ? "Administrator with elevated permissions"
        : "Standard user with basic permissions",
      isSystem: true,
      createdById: null,
    },
  });

  // Delete existing permissions for this role (to ensure correct permissions are set)
  await prisma.rolePermission.deleteMany({
    where: { roleId: role.id },
  });

  // Assign permissions
  const permissionIds = rolePermissions
    .map((key) => permissionMap.get(key))
    .filter((id): id is string => id !== undefined);

  if (permissionIds.length > 0) {
    await prisma.rolePermission.createMany({
      data: permissionIds.map((permissionId) => ({
        roleId: role.id,
        permissionId,
      })),
      skipDuplicates: true,
    });
  }
}

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

            // Check if this is the first user
            const userCount = await prisma.user.count();
            const isFirstUser = userCount === 0;
            
            // Determine role: first user gets SUPER_ADMIN, others get USER
            const role = isFirstUser ? "SUPER_ADMIN" : "USER";

            // Ensure ALL system roles and permissions exist (auto-seed if needed)
            // This creates all 5 system roles (SUPER_ADMIN, ADMIN, MANAGER, USER, AUDITOR)
            await ensureSystemRolesExist();

            // Verify the assigned role exists and has permissions (should exist after ensureSystemRolesExist)
            const roleExists = await prisma.role.findUnique({
                where: { name: role },
                include: {
                    permissions: true,
                },
            });

            // If the role still doesn't exist or has no permissions, create it
            // This is a fallback in case ensureSystemRolesExist didn't create it
            if (!roleExists || roleExists.permissions.length === 0) {
                await createSystemRoleWithPermissions(role, isFirstUser);
            }

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

            if (user.mfaEnabled && user.mfaSecret === null) {
                // MFA is enabled, require verification
                await createSession(user.id, user.email, { mfaVerified: false });
                return { success: true, mfaSetupRequired: true };
            } else if (user.mfaEnabled) {
                // MFA is enabled, require verification
                await createSession(user.id, user.email, { mfaVerified: false });
                return { success: true, mfaRequired: true };
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

            const userRes = await prisma.user.findUnique({
                where: { id: session.userId },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                    mfaEnabled: true,
                    mfaSecret: true,
                    createdById: true,
                },
            });

            if (!userRes) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "User not found",
                });
            }

            const { mfaSecret, ...rest } = userRes;

            return {
                user: rest,
                session,
                shouldVerifyMfa: rest.mfaEnabled && !session.mfaVerified && mfaSecret !== null,
            };
        }),
    getCurrentUserPermissions: baseProcedure
        .query(async ({ ctx }) => {
            const { permissions } = ctx;
            return { permissions };
        }),
    generateMfaQr: baseProcedure
        .query(async () => {
            const session = await getSession()
            if (!session) {
                throw new TRPCError({
                    code: "UNAUTHORIZED",
                    message: "Not authenticated",
                });
            }
            const authenticator = await import("otplib").then(mod => mod.authenticator)
            const qrcode = await import("qrcode").then(mod => mod.default)
            // Generate a new MFA secret
            const user = await prisma.user.findUnique({ where: { id: session.userId } })
            if (user && user.mfaEnabled && user.mfaSecret) {
                return { qr: null }
            }
            const secret = authenticator.generateSecret()
            const otpAuth = authenticator.keyuri(session.email, "Password Storage", secret)
            const qr = await qrcode.toDataURL(otpAuth)
            // Encrypt and save the secret temporarily in the DB (not enabled until verified)
            const encryptedSecret = encrypt(secret);
            await prisma.user.update({
                where: { id: session.userId },
                data: { mfaSecret: encryptedSecret },
            });
            return { qr }
        }),
    setupMfa: baseProcedure
        .input(z.object({
            code: z.string().min(6).max(6),
        }))
        .mutation(async ({ input }) => {
            const session = await getSession()
            if (!session) {
                throw new TRPCError({
                    code: "UNAUTHORIZED",
                    message: "Not authenticated",
                });
            }
            const user = await prisma.user.findUnique({ where: { id: session.userId } })
            if (!user || !user.mfaSecret) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "No MFA secret found",
                });
            }
            const decryptedSecret = decrypt(user.mfaSecret)
            const authenticator = await import("otplib").then(mod => mod.authenticator)
            const isValid = authenticator.check(input.code, decryptedSecret)
            if (!isValid) {
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: "Invalid MFA code",
                });
            }
            await prisma.user.update({
                where: { id: session.userId },
                data: { mfaEnabled: true },
            });
            await createSession(user.id, user.email, { mfaVerified: true });
            return { success: true };
        }),
    verifyMfa: baseProcedure
        .input(z.object({
            code: z.string().min(6).max(6),
        }))
        .mutation(async ({ input }) => {
            const session = await getSession()
            if (!session) {
                throw new TRPCError({
                    code: "UNAUTHORIZED",
                    message: "Not authenticated",
                });
            }
            const user = await prisma.user.findUnique({ where: { id: session.userId } })
            if (!user || !user.mfaSecret) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "No MFA secret found",
                });
            }
            const decryptedSecret = decrypt(user.mfaSecret);
            const authenticator = await import("otplib").then(mod => mod.authenticator);
            const isValid = authenticator.check(input.code, decryptedSecret)
            if (!isValid) {
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: "Invalid MFA code",
                });
            }
            await createSession(user.id, user.email, { mfaVerified: true });
            return { success: true };
        }),
});
