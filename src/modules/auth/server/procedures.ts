import prisma from "@/lib/prisma";
import { baseProcedure, createTRPCRouter, protectedProcedure } from "@/trpc/init";
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
                companyName: z.string().min(2, "Company name must be at least 2 characters").regex(/^[a-z0-9-]+$/, "Company name can only contain lowercase letters, numbers, and hyphens"),
            })
        )
        .mutation(async ({ input, ctx }) => {
            // Registration should only happen on main domain (no subdomain)
            if (ctx.subdomain) {
                throw new TRPCError({
                    code: "FORBIDDEN",
                    message: "Registration is only available on the main domain",
                });
            }

            // Validate and normalize subdomain from company name
            const subdomain = input.companyName.toLowerCase().trim().replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "")
            
            if (subdomain.length < 2) {
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: "Company name must contain at least 2 valid characters",
                });
            }

            // Check if company/subdomain already exists
            const existingCompany = await prisma.company.findUnique({
                where: { subdomain },
            });

            if (existingCompany) {
                throw new TRPCError({
                    code: "CONFLICT",
                    message: "A company with this name already exists. Please choose a different name.",
                });
            }

            // Check if user already exists globally (email should be unique per company, but we check globally for registration)
            // Note: After migration, email+companyId will be unique, but during registration we check globally
            const existingUser = await prisma.user.findFirst({
                where: { email: input.email },
            });

            if (existingUser) {
                throw new TRPCError({
                    code: "CONFLICT",
                    message: "User with this email already exists",
                });
            }

            // Validate password against security policies
            const { validatePassword } = await import("@/lib/password-validation");
            const validation = await validatePassword(input.password);
            if (!validation.isValid) {
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: validation.errors.join(". "),
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

            // Create company first
            const company = await prisma.company.create({
                data: {
                    name: input.companyName,
                    subdomain,
                },
            });

            // Create user associated with company
            const user = await prisma.user.create({
                data: {
                    name: input.name,
                    email: input.email,
                    password: hashedPassword,
                    role,
                    companyId: company.id,
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
                company: {
                    id: company.id,
                    name: company.name,
                    subdomain: company.subdomain,
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
        .mutation(async ({ input, ctx }) => {
            // Get login security settings
            const securitySettings = await prisma.settings.findMany({
                where: {
                    key: {
                        in: [
                            "security.login.max_attempts",
                            "security.login.lockout_duration_minutes",
                        ],
                    },
                },
            })

            const config: Record<string, unknown> = {}
            securitySettings.forEach((setting) => {
                config[setting.key] = setting.value
            })

            const maxAttempts = (config["security.login.max_attempts"] as number) ?? 5
            const lockoutDurationMinutes = (config["security.login.lockout_duration_minutes"] as number) ?? 15

            // Get subdomain from context (set by middleware)
            const subdomain = ctx.subdomain

            // Login must be on a subdomain (not main domain)
            if (!subdomain) {
                throw new TRPCError({
                    code: "FORBIDDEN",
                    message: "Login is only available on company subdomains",
                })
            }

            // Find company by subdomain
            const company = await prisma.company.findUnique({
                where: { subdomain },
            })

            if (!company) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "Company not found for this subdomain",
                })
            }

            // Find user in this company
            const user = await prisma.user.findFirst({
                where: { 
                    email: input.email,
                    companyId: company.id,
                },
            })

            if (!user) {
                throw new TRPCError({
                    code: "UNAUTHORIZED",
                    message: "Invalid email or password",
                })
            }

            // Check for account lockout
            const lockoutThreshold = new Date(Date.now() - lockoutDurationMinutes * 60 * 1000)
            const recentFailedAttempts = await prisma.auditLog.count({
                where: {
                    userId: user.id,
                    action: "LOGIN_FAILED",
                    createdAt: {
                        gte: lockoutThreshold,
                    },
                },
            })

            if (recentFailedAttempts >= maxAttempts) {
                throw new TRPCError({
                    code: "FORBIDDEN",
                    message: `Account locked due to too many failed login attempts. Please try again in ${lockoutDurationMinutes} minutes.`,
                })
            }

            // Check if user has a password (might be null for OAuth users)
            if (!user.password) {
                // Log failed attempt
                await prisma.auditLog.create({
                    data: {
                        userId: user.id,
                        action: "LOGIN_FAILED",
                        resource: "User",
                        resourceId: user.id,
                        status: "FAILED",
                        details: "No password set for user",
                    },
                })
                throw new TRPCError({
                    code: "UNAUTHORIZED",
                    message: "Invalid email or password",
                })
            }

            // Verify password
            const isValid = await verifyPassword(input.password, user.password)

            if (!isValid) {
                // Log failed attempt
                await prisma.auditLog.create({
                    data: {
                        userId: user.id,
                        action: "LOGIN_FAILED",
                        resource: "User",
                        resourceId: user.id,
                        status: "FAILED",
                        details: "Invalid password",
                    },
                })
                throw new TRPCError({
                    code: "UNAUTHORIZED",
                    message: "Invalid email or password",
                })
            }

            // Check if MFA is enabled and what method is configured
            if (user.mfaEnabled) {
                const hasMfaMethod = 
                    (user.mfaMethod === "TOTP" && user.mfaSecret !== null) ||
                    (user.mfaMethod === "SMS" && user.phoneNumber !== null) ||
                    (user.mfaMethod === "EMAIL" && user.email !== null) ||
                    (user.mfaMethod === "WEBAUTHN" && (await prisma.mfaCredential.count({ where: { userId: user.id } })) > 0);

                if (!hasMfaMethod) {
                    // MFA is enabled but not configured, require setup
                    await createSession(user.id, user.email, { mfaVerified: false, mfaSetupRequired: true });
                    return { success: true, mfaSetupRequired: true };
                } else {
                    // MFA is enabled and configured, require verification
                    await createSession(user.id, user.email, { mfaVerified: false, mfaRequired: true });
                    return { success: true, mfaRequired: true };
                }
            }

            // Update last login time
            await prisma.user.update({
                where: { id: user.id },
                data: { lastLoginAt: new Date() },
            });

            // Create audit log for successful login
            const { createAuditLog } = await import("@/lib/audit-log")
            await createAuditLog({
                action: "LOGIN_SUCCESS",
                resource: "User",
                resourceId: user.id,
                userId: user.id,
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
                    image: true,
                    role: true,
                    mfaEnabled: true,
                    mfaSecret: true,
                    mfaMethod: true,
                    phoneNumber: true,
                    createdById: true,
                    _count: {
                        select: {
                            mfaCredentials: true,
                        },
                    },
                },
            });

            if (!userRes) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "User not found",
                });
            }

            const { mfaSecret, _count, ...rest } = userRes;

            // Determine if MFA verification is needed
            const hasMfaMethod = 
                (rest.mfaEnabled && rest.mfaMethod === "TOTP" && mfaSecret !== null) ||
                (rest.mfaEnabled && rest.mfaMethod === "SMS" && rest.phoneNumber !== null) ||
                (rest.mfaEnabled && rest.mfaMethod === "EMAIL" && rest.email !== null) ||
                (rest.mfaEnabled && rest.mfaMethod === "WEBAUTHN" && _count.mfaCredentials > 0);

            // Determine if MFA setup is required (MFA enabled but not configured)
            const mfaSetupRequired = rest.mfaEnabled && !hasMfaMethod;

            return {
                user: rest,
                session,
                shouldVerifyMfa: rest.mfaEnabled && !session.mfaVerified && hasMfaMethod,
                mfaSetupRequired,
                mfaMethod: rest.mfaMethod,
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
            
            let secret: string

            // Only return null if MFA is already fully enabled and configured
            // If MFA is not enabled yet (setup in progress), regenerate QR even if secret exists
            if (user && user.mfaEnabled && user.mfaSecret) {
                secret = decrypt(user.mfaSecret)
            } else {
                secret = authenticator.generateSecret()
            }
            
            const otpAuth = authenticator.keyuri(session.email, "Password Storage", secret)
            const qr = await qrcode.toDataURL(otpAuth)
            return { qr }
        }),
    setupMfa: baseProcedure
        .input(z.object({
            code: z.string().min(6).max(6),
            method: z.enum(["TOTP", "SMS", "EMAIL", "WEBAUTHN"]).optional(),
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
            if (!user) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "User not found",
                });
            }

            const method = input.method || user.mfaMethod || "TOTP"

            // Check if credentials are configured for the selected method
            if (method === "SMS") {
                const { checkSmsCredentials } = await import("@/lib/sms")
                const credentialsCheck = await checkSmsCredentials()
                if (!credentialsCheck.configured) {
                    throw new TRPCError({
                        code: "BAD_REQUEST",
                        message: credentialsCheck.error || "SMS credentials are not configured. Please configure them in Settings → MFA Credentials before enabling SMS MFA.",
                    });
                }
                if (!user.phoneNumber) {
                    throw new TRPCError({
                        code: "BAD_REQUEST",
                        message: "Phone number is required for SMS MFA. Please add a phone number to your account.",
                    });
                }
            } else if (method === "WEBAUTHN") {
                const { checkWebAuthnCredentials } = await import("@/lib/webauthn")
                const credentialsCheck = await checkWebAuthnCredentials()
                if (!credentialsCheck.configured) {
                    throw new TRPCError({
                        code: "BAD_REQUEST",
                        message: credentialsCheck.error || "WebAuthn credentials are not configured. Please configure them in Settings → MFA Credentials before enabling WebAuthn MFA.",
                    });
                }
            }

            // Verify based on method
            if (method === "TOTP") {
                if (!user.mfaSecret) {
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
            } else if (method === "SMS") {
                const { verifyMfaCode } = await import("@/lib/mfa-codes")
                const isValid = verifyMfaCode(user.id, "SMS", input.code)
                if (!isValid) {
                    throw new TRPCError({
                        code: "BAD_REQUEST",
                        message: "Invalid or expired SMS code",
                    });
                }
            } else if (method === "EMAIL") {
                const { verifyMfaCode } = await import("@/lib/mfa-codes")
                const isValid = verifyMfaCode(user.id, "EMAIL", input.code)
                if (!isValid) {
                    throw new TRPCError({
                        code: "BAD_REQUEST",
                        message: "Invalid or expired email code",
                    });
                }
            } else if (method === "WEBAUTHN") {
                // WebAuthn setup is handled separately via verifyWebAuthnRegistration
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: "WebAuthn setup is handled separately",
                });
            }

            // Enable MFA and set method
            await prisma.user.update({
                where: { id: session.userId },
                data: { 
                    mfaEnabled: true,
                    mfaMethod: method,
                },
            });

            // Create audit log
            const { createAuditLog } = await import("@/lib/audit-log")
            await createAuditLog({
                action: "MFA_SETUP",
                resource: "User",
                resourceId: session.userId,
                details: { method },
                userId: session.userId,
            });
            await createSession(user.id, user.email, { mfaVerified: true });
            return { success: true };
        }),
    verifyMfa: baseProcedure
        .input(z.object({
            code: z.string().min(6).max(6).optional(),
            method: z.enum(["TOTP", "SMS", "EMAIL", "WEBAUTHN"]).optional(),
        }))
        .mutation(async ({ input }) => {
            const session = await getSession()
            if (!session) {
                throw new TRPCError({
                    code: "UNAUTHORIZED",
                    message: "Not authenticated",
                });
            }
            const user = await prisma.user.findUnique({ 
                where: { id: session.userId },
                include: { mfaCredentials: true },
            })
            if (!user) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "User not found",
                });
            }

            const method = input.method || user.mfaMethod || "TOTP"

            // Verify based on method
            if (method === "TOTP") {
                if (!user.mfaSecret || !input.code) {
                    throw new TRPCError({
                        code: "BAD_REQUEST",
                        message: "TOTP code is required",
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
            } else if (method === "SMS") {
                // Check if SMS credentials are configured
                const { checkSmsCredentials } = await import("@/lib/sms")
                const credentialsCheck = await checkSmsCredentials()
                if (!credentialsCheck.configured) {
                    throw new TRPCError({
                        code: "BAD_REQUEST",
                        message: credentialsCheck.error || "SMS credentials are not configured. Please configure them in Settings → MFA Credentials.",
                    });
                }
                if (!input.code) {
                    throw new TRPCError({
                        code: "BAD_REQUEST",
                        message: "SMS code is required",
                    });
                }
                const { verifyMfaCode } = await import("@/lib/mfa-codes")
                const isValid = verifyMfaCode(user.id, "SMS", input.code)
                if (!isValid) {
                    throw new TRPCError({
                        code: "BAD_REQUEST",
                        message: "Invalid or expired SMS code",
                    });
                }
            } else if (method === "EMAIL") {
                if (!input.code) {
                    throw new TRPCError({
                        code: "BAD_REQUEST",
                        message: "Email code is required",
                    });
                }
                const { verifyMfaCode } = await import("@/lib/mfa-codes")
                const isValid = verifyMfaCode(user.id, "EMAIL", input.code)
                if (!isValid) {
                    throw new TRPCError({
                        code: "BAD_REQUEST",
                        message: "Invalid or expired email code",
                    });
                }
            } else if (method === "WEBAUTHN") {
                // Check if WebAuthn credentials are configured
                const { checkWebAuthnCredentials } = await import("@/lib/webauthn")
                const credentialsCheck = await checkWebAuthnCredentials()
                if (!credentialsCheck.configured) {
                    throw new TRPCError({
                        code: "BAD_REQUEST",
                        message: credentialsCheck.error || "WebAuthn credentials are not configured. Please configure them in Settings → MFA Credentials.",
                    });
                }
                // WebAuthn verification is handled separately via verifyWebAuthnAuthentication
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: "WebAuthn verification is handled separately",
                });
            }

            // Create audit logs
            const { createAuditLog } = await import("@/lib/audit-log")
            await Promise.all([
                createAuditLog({
                    action: "MFA_VERIFIED",
                    resource: "User",
                    resourceId: user.id,
                    details: { method },
                    userId: user.id,
                }),
                createAuditLog({
                    action: "LOGIN_SUCCESS",
                    resource: "User",
                    resourceId: user.id,
                    details: { mfaMethod: method },
                    userId: user.id,
                }),
            ])

            await createSession(user.id, user.email, { mfaVerified: true });
            return { success: true };
        }),

    // SMS MFA
    sendSmsMfaCode: baseProcedure
        .mutation(async () => {
            const session = await getSession()
            if (!session) {
                throw new TRPCError({
                    code: "UNAUTHORIZED",
                    message: "Not authenticated",
                });
            }
            const user = await prisma.user.findUnique({ where: { id: session.userId } })
            if (!user || !user.phoneNumber) {
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: "Phone number not set. Please add a phone number to your account.",
                });
            }

            // Check if SMS credentials are configured
            const { checkSmsCredentials } = await import("@/lib/sms")
            const credentialsCheck = await checkSmsCredentials()
            if (!credentialsCheck.configured) {
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: credentialsCheck.error || "SMS credentials are not configured. Please configure them in Settings → MFA Credentials.",
                });
            }

            const { generateMfaCode, storeMfaCode } = await import("@/lib/mfa-codes")
            const { sendSmsCode } = await import("@/lib/sms")
            
            const code = generateMfaCode()
            storeMfaCode(user.id, "SMS", code)
            
            const result = await sendSmsCode(user.phoneNumber, code)
            if (!result.success) {
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: result.error || "Failed to send SMS code",
                });
            }

            return { success: true };
        }),

    verifySmsMfa: baseProcedure
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
            if (!user) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "User not found",
                });
            }

            const { verifyMfaCode } = await import("@/lib/mfa-codes")
            const isValid = verifyMfaCode(user.id, "SMS", input.code)
            
            if (!isValid) {
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: "Invalid or expired SMS code",
                });
            }

            // Create audit logs
            const { createAuditLog } = await import("@/lib/audit-log")
            await Promise.all([
                createAuditLog({
                    action: "MFA_VERIFIED",
                    resource: "User",
                    resourceId: user.id,
                    details: { method: "SMS" },
                    userId: user.id,
                }),
                createAuditLog({
                    action: "LOGIN_SUCCESS",
                    resource: "User",
                    resourceId: user.id,
                    details: { mfaMethod: "SMS" },
                    userId: user.id,
                }),
            ])

            await createSession(user.id, user.email, { mfaVerified: true });
            return { success: true };
        }),

    // Email MFA
    sendEmailMfaCode: baseProcedure
        .mutation(async () => {
            const session = await getSession()
            if (!session) {
                throw new TRPCError({
                    code: "UNAUTHORIZED",
                    message: "Not authenticated",
                });
            }
            const user = await prisma.user.findUnique({ where: { id: session.userId } })
            if (!user || !user.email) {
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: "Email not found",
                });
            }

            const { generateMfaCode, storeMfaCode } = await import("@/lib/mfa-codes")
            const { sendEmail } = await import("@/lib/mailer")
            
            const code = generateMfaCode()
            storeMfaCode(user.id, "EMAIL", code)
            
            const result = await sendEmail({
                to: user.email,
                subject: "Your Password Storage Verification Code",
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                        <h2 style="color: #333;">Verification Code</h2>
                        <p>Your verification code is:</p>
                        <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0; text-align: center;">
                            <h1 style="color: #333; font-size: 32px; letter-spacing: 4px; margin: 0;">${code}</h1>
                        </div>
                        <p style="color: #666; font-size: 14px;">This code will expire in 10 minutes.</p>
                        <p style="color: #999; font-size: 12px; margin-top: 20px;">
                            If you didn't request this code, please ignore this email.
                        </p>
                    </div>
                `,
                text: `Your Password Storage verification code is: ${code}. This code will expire in 10 minutes.`,
            })

            if (!result.success) {
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: result.error || "Failed to send email code",
                });
            }

            return { success: true };
        }),

    verifyEmailMfa: baseProcedure
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
            if (!user) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "User not found",
                });
            }

            const { verifyMfaCode } = await import("@/lib/mfa-codes")
            const isValid = verifyMfaCode(user.id, "EMAIL", input.code)
            
            if (!isValid) {
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: "Invalid or expired email code",
                });
            }

            // Create audit logs
            const { createAuditLog } = await import("@/lib/audit-log")
            await Promise.all([
                createAuditLog({
                    action: "MFA_VERIFIED",
                    resource: "User",
                    resourceId: user.id,
                    details: { method: "EMAIL" },
                    userId: user.id,
                }),
                createAuditLog({
                    action: "LOGIN_SUCCESS",
                    resource: "User",
                    resourceId: user.id,
                    details: { mfaMethod: "EMAIL" },
                    userId: user.id,
                }),
            ])

            await createSession(user.id, user.email, { mfaVerified: true });
            return { success: true };
        }),

    // WebAuthn MFA
    generateWebAuthnRegistration: baseProcedure
        .query(async () => {
            const session = await getSession()
            if (!session) {
                throw new TRPCError({
                    code: "UNAUTHORIZED",
                    message: "Not authenticated",
                });
            }
            const user = await prisma.user.findUnique({
                where: { id: session.userId },
                include: { mfaCredentials: true },
            })
            if (!user) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "User not found",
                });
            }

            // Check if WebAuthn credentials are configured
            const { checkWebAuthnCredentials } = await import("@/lib/webauthn")
            const credentialsCheck = await checkWebAuthnCredentials()
            if (!credentialsCheck.configured) {
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: credentialsCheck.error || "WebAuthn credentials are not configured. Please configure them in Settings → MFA Credentials.",
                });
            }

            const { generateWebAuthnRegistrationOptions } = await import("@/lib/webauthn")
            
            const existingCredentials = user.mfaCredentials.map((cred) => ({
                credentialID: cred.credentialId,
                publicKey: cred.publicKey,
                counter: Number(cred.counter),
                deviceType: cred.deviceType,
                backedUp: cred.backedUp,
                transports: cred.transports ? JSON.parse(cred.transports) : undefined,
            }))

            const { options, challenge } = await generateWebAuthnRegistrationOptions(
                user.id,
                user.email,
                user.name,
                existingCredentials
            )

            // Store challenge temporarily (in production, use Redis)
            const challengeStore = (global as unknown as { webauthnChallenges: Map<string, string> }).webauthnChallenges || new Map()
            challengeStore.set(session.userId, challenge)
            ;(global as unknown as { webauthnChallenges: Map<string, string> }).webauthnChallenges = challengeStore

            return { options };
        }),

    verifyWebAuthnRegistration: baseProcedure
        .input(z.object({
            response: z.any(),
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
            if (!user) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "User not found",
                });
            }

            const challengeStore = (global as unknown as { webauthnChallenges: Map<string, string> }).webauthnChallenges || new Map()
            const expectedChallenge = challengeStore.get(session.userId)
            challengeStore.delete(session.userId)

            if (!expectedChallenge) {
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: "Registration challenge not found or expired",
                });
            }

            const { verifyWebAuthnRegistration } = await import("@/lib/webauthn")
            const result = await verifyWebAuthnRegistration(input.response, expectedChallenge)

            if (!result.verified || !result.credential) {
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: result.error || "WebAuthn registration verification failed",
                });
            }

            // Save credential to database
            await prisma.mfaCredential.create({
                data: {
                    userId: user.id,
                    credentialId: result.credential.credentialID,
                    publicKey: result.credential.publicKey,
                    counter: BigInt(result.credential.counter),
                    deviceType: result.credential.deviceType,
                    backedUp: result.credential.backedUp,
                    transports: result.credential.transports ? JSON.stringify(result.credential.transports) : null,
                },
            })

            return { success: true };
        }),

    generateWebAuthnAuthentication: baseProcedure
        .query(async () => {
            const session = await getSession()
            if (!session) {
                throw new TRPCError({
                    code: "UNAUTHORIZED",
                    message: "Not authenticated",
                });
            }
            const user = await prisma.user.findUnique({
                where: { id: session.userId },
                include: { mfaCredentials: true },
            })
            if (!user) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "User not found",
                });
            }

            if (user.mfaCredentials.length === 0) {
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: "No WebAuthn credentials found",
                });
            }

            // Check if WebAuthn credentials are configured
            const { checkWebAuthnCredentials } = await import("@/lib/webauthn")
            const credentialsCheck = await checkWebAuthnCredentials()
            if (!credentialsCheck.configured) {
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: credentialsCheck.error || "WebAuthn credentials are not configured. Please configure them in Settings → MFA Credentials.",
                });
            }

            const { generateWebAuthnAuthenticationOptions } = await import("@/lib/webauthn")
            
            const credentials = user.mfaCredentials.map((cred) => ({
                credentialID: cred.credentialId,
                publicKey: cred.publicKey,
                counter: Number(cred.counter),
                deviceType: cred.deviceType,
                backedUp: cred.backedUp,
                transports: cred.transports ? JSON.parse(cred.transports) : undefined,
            }))

            const { options, challenge } = await generateWebAuthnAuthenticationOptions(credentials)

            // Store challenge temporarily
            const challengeStore = (global as unknown as { webauthnChallenges: Map<string, string> }).webauthnChallenges || new Map()
            challengeStore.set(session.userId, challenge)
            ;(global as unknown as { webauthnChallenges: Map<string, string> }).webauthnChallenges = challengeStore

            return { options };
        }),

    verifyWebAuthnAuthentication: baseProcedure
        .input(z.object({
            response: z.any(),
        }))
        .mutation(async ({ input }) => {
            const session = await getSession()
            if (!session) {
                throw new TRPCError({
                    code: "UNAUTHORIZED",
                    message: "Not authenticated",
                });
            }
            const user = await prisma.user.findUnique({
                where: { id: session.userId },
                include: { mfaCredentials: true },
            })
            if (!user) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "User not found",
                });
            }

            const challengeStore = (global as unknown as { webauthnChallenges: Map<string, string> }).webauthnChallenges || new Map()
            const expectedChallenge = challengeStore.get(session.userId)
            challengeStore.delete(session.userId)

            if (!expectedChallenge) {
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: "Authentication challenge not found or expired",
                });
            }

            // Find the credential being used
            // The response.id is already base64url encoded
            const credentialId = input.response.id
            const credential = user.mfaCredentials.find((c) => c.credentialId === credentialId)

            if (!credential) {
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: "Credential not found",
                });
            }

            const { verifyWebAuthnAuthentication } = await import("@/lib/webauthn")
            const credentialData = {
                credentialID: credential.credentialId,
                publicKey: credential.publicKey,
                counter: Number(credential.counter),
                deviceType: credential.deviceType,
                backedUp: credential.backedUp,
                transports: credential.transports ? JSON.parse(credential.transports) : undefined,
            }

            const result = await verifyWebAuthnAuthentication(
                input.response,
                expectedChallenge,
                credentialData
            )

            if (!result.verified) {
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: result.error || "WebAuthn authentication verification failed",
                });
            }

            // Update counter
            if (result.newCounter !== undefined) {
                await prisma.mfaCredential.update({
                    where: { id: credential.id },
                    data: {
                        counter: BigInt(result.newCounter),
                        lastUsedAt: new Date(),
                    },
                })
            }

            // Create audit logs
            const { createAuditLog } = await import("@/lib/audit-log")
            await Promise.all([
                createAuditLog({
                    action: "MFA_VERIFIED",
                    resource: "User",
                    resourceId: user.id,
                    details: { method: "WEBAUTHN" },
                    userId: user.id,
                }),
                createAuditLog({
                    action: "LOGIN_SUCCESS",
                    resource: "User",
                    resourceId: user.id,
                    details: { mfaMethod: "WEBAUTHN" },
                    userId: user.id,
                }),
            ])

            await createSession(user.id, user.email, { mfaVerified: true });
            return { success: true };
        }),

    // Recovery Codes
    generateRecoveryCodes: baseProcedure
        .mutation(async () => {
            const session = await getSession()
            if (!session) {
                throw new TRPCError({
                    code: "UNAUTHORIZED",
                    message: "Not authenticated",
                });
            }
            const user = await prisma.user.findUnique({ where: { id: session.userId } })
            if (!user) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "User not found",
                });
            }

            // Check if recovery codes are enabled
            const recoveryCodesEnabled = await prisma.settings.findUnique({
                where: { key: "mfa.recovery_codes_enabled" },
            })
            if (!recoveryCodesEnabled || recoveryCodesEnabled.value !== true) {
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: "Recovery codes are not enabled",
                });
            }

            // Get count from settings
            const recoveryCodesCountSetting = await prisma.settings.findUnique({
                where: { key: "mfa.recovery_codes_count" },
            })
            const count = (recoveryCodesCountSetting?.value as number) || 10

            // Generate new codes
            const { generateRecoveryCodes, hashRecoveryCode } = await import("@/lib/recovery-codes")
            const codes = generateRecoveryCodes(count)

            // Delete old unused codes
            await prisma.recoveryCode.deleteMany({
                where: {
                    userId: user.id,
                    used: false,
                },
            })

            // Hash and store new codes (hash without dashes for consistency)
            // Codes are displayed with dashes but stored/hashed without dashes
            const hashedCodes = await Promise.all(
                codes.map((formattedCode) => {
                    const rawCode = formattedCode.replace(/-/g, "").toUpperCase()
                    return hashRecoveryCode(rawCode)
                })
            )

            await Promise.all(
                hashedCodes.map((hash) =>
                    prisma.recoveryCode.create({
                        data: {
                            userId: user.id,
                            codeHash: hash,
                        },
                    })
                )
            )

            // Return plain codes only once (user should save them)
            return { codes };
        }),

    verifyRecoveryCode: baseProcedure
        .input(z.object({
            code: z.string().min(1),
        }))
        .mutation(async ({ input }) => {
            const session = await getSession()
            if (!session) {
                throw new TRPCError({
                    code: "UNAUTHORIZED",
                    message: "Not authenticated",
                });
            }
            const user = await prisma.user.findUnique({
                where: { id: session.userId },
                include: { recoveryCodes: true },
            })
            if (!user) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "User not found",
                });
            }

            // Find unused recovery code
            const unusedCodes = user.recoveryCodes.filter((rc) => !rc.used)
            const { verifyRecoveryCode } = await import("@/lib/recovery-codes")

            // Remove dashes from input code for verification
            const normalizedCode = input.code.replace(/-/g, "").toUpperCase()

            for (const recoveryCode of unusedCodes) {
                const isValid = await verifyRecoveryCode(normalizedCode, recoveryCode.codeHash)
                if (isValid) {
                    // Mark as used
                    await prisma.recoveryCode.update({
                        where: { id: recoveryCode.id },
                        data: {
                            used: true,
                            usedAt: new Date(),
                        },
                    })

                    // Create audit logs
                    const { createAuditLog } = await import("@/lib/audit-log")
                    await Promise.all([
                        createAuditLog({
                            action: "MFA_VERIFIED",
                            resource: "User",
                            resourceId: user.id,
                            details: { method: "RECOVERY_CODE" },
                            userId: user.id,
                        }),
                        createAuditLog({
                            action: "LOGIN_SUCCESS",
                            resource: "User",
                            resourceId: user.id,
                            details: { mfaMethod: "RECOVERY_CODE" },
                            userId: user.id,
                        }),
                    ])

                    await createSession(user.id, user.email, { mfaVerified: true });
                    return { success: true };
                }
            }

            throw new TRPCError({
                code: "BAD_REQUEST",
                message: "Invalid or already used recovery code",
            });
        }),

    listRecoveryCodes: baseProcedure
        .query(async () => {
            const session = await getSession()
            if (!session) {
                throw new TRPCError({
                    code: "UNAUTHORIZED",
                    message: "Not authenticated",
                });
            }
            const recoveryCodes = await prisma.recoveryCode.findMany({
                where: {
                    userId: session.userId,
                },
                select: {
                    id: true,
                    used: true,
                    usedAt: true,
                    createdAt: true,
                },
                orderBy: {
                    createdAt: "desc",
                },
            })

            const unusedCount = recoveryCodes.filter((rc) => !rc.used).length
            const totalCount = recoveryCodes.length

            return {
                codes: recoveryCodes,
                unusedCount,
                totalCount,
            };
        }),

    // Admin MFA Reset
    resetUserMfa: protectedProcedure("user.edit")
        .input(z.object({
            userId: z.string(),
        }))
        .mutation(async ({ input, ctx }) => {
            // Check if admin MFA reset is enabled (default to true if setting doesn't exist)
            const adminResetSetting = await prisma.settings.findUnique({
                where: { key: "mfa.admin_reset_enabled" },
            })
            const adminResetEnabled = adminResetSetting ? (adminResetSetting.value === true) : true // Default to true if not set
            if (!adminResetEnabled) {
                throw new TRPCError({
                    code: "FORBIDDEN",
                    message: "Admin MFA reset is not enabled",
                });
            }

            const user = await prisma.user.findUnique({
                where: { id: input.userId },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    createdById: true,
                },
            })

            if (!user) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "User not found",
                });
            }

            // Prevent users from resetting their creator's MFA (SUPER_ADMIN can reset anyone)
            if (ctx.userRole !== "SUPER_ADMIN" && user.createdById === ctx.userId) {
                throw new TRPCError({
                    code: "FORBIDDEN",
                    message: "You cannot reset the MFA of the user who created your account",
                });
            }

            // Disable MFA and clear MFA data
            await Promise.all([
                prisma.user.update({
                    where: { id: input.userId },
                    data: {
                        mfaEnabled: false,
                        mfaSecret: null,
                        mfaMethod: null,
                    },
                }),
                prisma.mfaCredential.deleteMany({
                    where: { userId: input.userId },
                }),
                prisma.recoveryCode.deleteMany({
                    where: { userId: input.userId },
                }),
            ])

            // Create audit log
            await prisma.auditLog.create({
                data: {
                    action: "MFA_RESET",
                    resource: "User",
                    userId: input.userId,
                    resourceId: input.userId,
                    details: `MFA reset by admin ${ctx.userId}`,
                    status: "SUCCESS",
                },
            })

            return { success: true };
        }),
    findCompanyBySubdomain: baseProcedure
        .input(
            z.object({
                companyName: z.string().min(1, "Company name is required"),
            })
        )
        .query(async ({ input }) => {
            // Normalize company name to subdomain format
            const subdomain = input.companyName.toLowerCase().trim().replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "")
            
            if (subdomain.length < 2) {
                return null
            }

            // Find company by subdomain
            const company = await prisma.company.findUnique({
                where: { subdomain },
                select: {
                    id: true,
                    name: true,
                    subdomain: true,
                },
            })

            if (!company) {
                return null
            }

            return {
                id: company.id,
                name: company.name,
                subdomain: company.subdomain,
            }
        }),
});
