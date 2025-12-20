
import prisma from "@/lib/prisma"
import { baseProcedure, createTRPCRouter, protectedProcedure } from "@/trpc/init"
import z from "zod"
import { TRPCError } from "@trpc/server"
import { encrypt, decrypt } from "@/lib/crypto"

export const settingsRouter = createTRPCRouter({
  getEmailConfig: protectedProcedure("settings.view").query(async () => {
    const settings = await prisma.settings.findMany({
      where: {
        key: {
          in: [
            "smtp_host",
            "smtp_port",
            "smtp_secure",
            "smtp_user",
            "smtp_password",
            "smtp_from_email",
            "smtp_from_name",
          ],
        },
      },
    })

    const config: Record<string, unknown> = {}

    const decryptKeys = [
      "smtp_host",
      "smtp_port",
      "smtp_secure",
      "smtp_user",
      "smtp_password",
      "smtp_from_email",
      "smtp_from_name",
    ]
    settings.forEach((setting) => {
      if (decryptKeys.includes(setting.key)) {
        config[setting.key] = setting.value ? decrypt(setting.value as string) : ""
      } else {
        config[setting.key] = setting.value
      }
    })

    return {
      smtp_host: (config.smtp_host as string) || "",
      smtp_port: (config.smtp_port as string) || "587",
      smtp_secure: (config.smtp_secure as boolean) || false,
      smtp_user: (config.smtp_user as string) || "",
      smtp_password: (config.smtp_password as string) || "",
      smtp_from_email: (config.smtp_from_email as string) || "",
      smtp_from_name: (config.smtp_from_name as string) || "PassStorage",
    }
  }),

  updateEmailConfig: protectedProcedure("settings.edit")
    .input(
      z.object({
        smtp_host: z.string(),
        smtp_port: z.string(),
        smtp_secure: z.boolean(),
        smtp_user: z.string().optional(),
        smtp_password: z.string().optional(),
        smtp_from_email: z.string().email(),
        smtp_from_name: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      // Update or create each setting

      const encryptKeys = [
        "smtp_host",
        "smtp_port",
        "smtp_secure",
        "smtp_user",
        "smtp_password",
        "smtp_from_email",
        "smtp_from_name",
      ]
      await Promise.all(
        Object.entries(input).map(async ([key, value]) => {
          if (typeof value === "undefined") return // skip undefined values
          let toSave = value
          if (encryptKeys.includes(key) && value) {
            toSave = encrypt(value as string)
          }
          await prisma.settings.upsert({
            where: { key },
            update: { value: toSave },
            create: { key, value: toSave },
          })
        })
      )

      // Reset email transporter cache
      const { resetEmailTransporter } = await import("@/lib/mailer")
      resetEmailTransporter()

      return { success: true }
    }),

  testEmailConfig: protectedProcedure("settings.edit")
    .input(
      z.object({
        testEmail: z.string().email(),
      })
    )
    .mutation(async ({ input }) => {
      const { testEmailConfig, sendEmail } = await import("@/lib/mailer")

      // First verify the configuration
      const testResult = await testEmailConfig()
      if (!testResult.success) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: testResult.error || "Email configuration is invalid",
        })
      }

      // Send a test email
      const emailResult = await sendEmail({
        to: input.testEmail,
        subject: "Test Email from PassStorage",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">Email Configuration Test</h2>
            <div style="background-color: #f0f9ff; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #3b82f6;">
              <p style="color: #1e40af; margin: 0;">
                ✓ Your email configuration is working correctly!
              </p>
            </div>
            <p style="color: #555;">
              This is a test email sent from your PassStorage application to verify that your SMTP settings are configured correctly.
            </p>
            <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
            <p style="color: #999; font-size: 12px;">
              Sent at: ${new Date().toLocaleString()}
            </p>
          </div>
        `,
        text: "Email configuration test successful! Your SMTP settings are working correctly.",
      })

      if (!emailResult.success) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: emailResult.error || "Failed to send test email",
        })
      }

      return { success: true }
    }),

  getGeneralSettings: protectedProcedure("settings.view").query(async () => {
    const settings = await prisma.settings.findMany({
      where: {
        key: {
          in: [
            "app.name",
            "app.maintenance_mode",
          ],
        },
      },
    })

    const config: Record<string, unknown> = {}
    settings.forEach((setting) => {
      config[setting.key] = setting.value
    })

    return {
      appName: (config["app.name"] as string) || "PassStorage",
      maintenanceMode: (config["app.maintenance_mode"] as boolean) || false,
    }
  }),

  updateGeneralSettings: protectedProcedure("settings.edit")
    .input(
      z.object({
        appName: z.string().min(1, "Application name is required"),
        maintenanceMode: z.boolean(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Update or create each setting
      await Promise.all([
        prisma.settings.upsert({
          where: { key: "app.name" },
          update: { value: input.appName },
          create: { key: "app.name", value: input.appName },
        }),
        prisma.settings.upsert({
          where: { key: "app.maintenance_mode" },
          update: { value: input.maintenanceMode },
          create: { key: "app.maintenance_mode", value: input.maintenanceMode },
        }),
      ])

      // Create audit log
      const { createAuditLog } = await import("@/lib/audit-log")
      await createAuditLog({
        action: "SETTINGS_UPDATED",
        resource: "Settings",
        details: { category: "general", appName: input.appName, maintenanceMode: input.maintenanceMode },
        userId: ctx.userId,
      })

      return { success: true }
    }),

  getSecuritySettings: protectedProcedure("settings.view").query(async () => {
    const settings = await prisma.settings.findMany({
      where: {
        key: {
          in: [
            "security.password.min_length",
            "security.password.require_uppercase",
            "security.password.require_lowercase",
            "security.password.require_numbers",
            "security.password.require_special",
            "security.password.expiry_days",
            "security.session.timeout_minutes",
            "security.session.max_concurrent",
            "security.session.require_reauth",
            "security.login.max_attempts",
            "security.login.lockout_duration_minutes",
          ],
        },
      },
    })

    const config: Record<string, unknown> = {}
    settings.forEach((setting) => {
      config[setting.key] = setting.value
    })

    return {
      // Password Policies
      passwordMinLength: (config["security.password.min_length"] as number) ?? 12,
      passwordRequireUppercase: (config["security.password.require_uppercase"] as boolean) ?? true,
      passwordRequireLowercase: (config["security.password.require_lowercase"] as boolean) ?? true,
      passwordRequireNumbers: (config["security.password.require_numbers"] as boolean) ?? true,
      passwordRequireSpecial: (config["security.password.require_special"] as boolean) ?? true,
      passwordExpiryDays: (config["security.password.expiry_days"] as number) ?? 90,
      // Session Management
      sessionTimeoutMinutes: (config["security.session.timeout_minutes"] as number) ?? 30,
      sessionMaxConcurrent: (config["security.session.max_concurrent"] as number) ?? 3,
      sessionRequireReauth: (config["security.session.require_reauth"] as boolean) ?? true,
      // Login Security
      loginMaxAttempts: (config["security.login.max_attempts"] as number) ?? 5,
      loginLockoutDurationMinutes: (config["security.login.lockout_duration_minutes"] as number) ?? 15,
    }
  }),

  updateSecuritySettings: protectedProcedure("settings.edit")
    .input(
      z.object({
        // Password Policies
        passwordMinLength: z.number().min(4).max(128),
        passwordRequireUppercase: z.boolean(),
        passwordRequireLowercase: z.boolean(),
        passwordRequireNumbers: z.boolean(),
        passwordRequireSpecial: z.boolean(),
        passwordExpiryDays: z.number().min(0).max(3650), // 0 = never, max 10 years
        // Session Management
        sessionTimeoutMinutes: z.number().min(1).max(1440), // 1 minute to 24 hours
        sessionMaxConcurrent: z.number().min(1).max(100),
        sessionRequireReauth: z.boolean(),
        // Login Security
        loginMaxAttempts: z.number().min(1).max(20),
        loginLockoutDurationMinutes: z.number().min(1).max(1440), // 1 minute to 24 hours
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Update or create each setting
      await Promise.all([
        // Password Policies
        prisma.settings.upsert({
          where: { key: "security.password.min_length" },
          update: { value: input.passwordMinLength },
          create: { key: "security.password.min_length", value: input.passwordMinLength },
        }),
        prisma.settings.upsert({
          where: { key: "security.password.require_uppercase" },
          update: { value: input.passwordRequireUppercase },
          create: { key: "security.password.require_uppercase", value: input.passwordRequireUppercase },
        }),
        prisma.settings.upsert({
          where: { key: "security.password.require_lowercase" },
          update: { value: input.passwordRequireLowercase },
          create: { key: "security.password.require_lowercase", value: input.passwordRequireLowercase },
        }),
        prisma.settings.upsert({
          where: { key: "security.password.require_numbers" },
          update: { value: input.passwordRequireNumbers },
          create: { key: "security.password.require_numbers", value: input.passwordRequireNumbers },
        }),
        prisma.settings.upsert({
          where: { key: "security.password.require_special" },
          update: { value: input.passwordRequireSpecial },
          create: { key: "security.password.require_special", value: input.passwordRequireSpecial },
        }),
        prisma.settings.upsert({
          where: { key: "security.password.expiry_days" },
          update: { value: input.passwordExpiryDays },
          create: { key: "security.password.expiry_days", value: input.passwordExpiryDays },
        }),
        // Session Management
        prisma.settings.upsert({
          where: { key: "security.session.timeout_minutes" },
          update: { value: input.sessionTimeoutMinutes },
          create: { key: "security.session.timeout_minutes", value: input.sessionTimeoutMinutes },
        }),
        prisma.settings.upsert({
          where: { key: "security.session.max_concurrent" },
          update: { value: input.sessionMaxConcurrent },
          create: { key: "security.session.max_concurrent", value: input.sessionMaxConcurrent },
        }),
        prisma.settings.upsert({
          where: { key: "security.session.require_reauth" },
          update: { value: input.sessionRequireReauth },
          create: { key: "security.session.require_reauth", value: input.sessionRequireReauth },
        }),
        // Login Security
        prisma.settings.upsert({
          where: { key: "security.login.max_attempts" },
          update: { value: input.loginMaxAttempts },
          create: { key: "security.login.max_attempts", value: input.loginMaxAttempts },
        }),
        prisma.settings.upsert({
          where: { key: "security.login.lockout_duration_minutes" },
          update: { value: input.loginLockoutDurationMinutes },
          create: { key: "security.login.lockout_duration_minutes", value: input.loginLockoutDurationMinutes },
        }),
      ])

      // Create audit log
      const { createAuditLog } = await import("@/lib/audit-log")
      await createAuditLog({
        action: "SETTINGS_UPDATED",
        resource: "Settings",
        details: { category: "security" },
        userId: ctx.userId,
      })

      return { success: true }
    }),

  getMfaSettings: protectedProcedure("settings.view").query(async () => {
    const settings = await prisma.settings.findMany({
      where: {
        key: {
          in: [
            "mfa.enforce_all_users",
            "mfa.enforce_admins",
            "mfa.methods.totp",
            "mfa.methods.sms",
            "mfa.methods.email",
            "mfa.methods.hardware",
            "mfa.grace_period_days",
            "mfa.recovery_codes_enabled",
            "mfa.recovery_codes_count",
            "mfa.admin_reset_enabled",
          ],
        },
      },
    })

    const config: Record<string, unknown> = {}
    settings.forEach((setting) => {
      config[setting.key] = setting.value
    })

    return {
      enforceAllUsers: (config["mfa.enforce_all_users"] as boolean) ?? false,
      enforceAdmins: (config["mfa.enforce_admins"] as boolean) ?? false,
      methodTotp: (config["mfa.methods.totp"] as boolean) ?? true,
      methodSms: (config["mfa.methods.sms"] as boolean) ?? false,
      methodEmail: (config["mfa.methods.email"] as boolean) ?? false,
      methodHardware: (config["mfa.methods.hardware"] as boolean) ?? false,
      gracePeriodDays: (config["mfa.grace_period_days"] as number) ?? 7,
      recoveryCodesEnabled: (config["mfa.recovery_codes_enabled"] as boolean) ?? true,
      recoveryCodesCount: (config["mfa.recovery_codes_count"] as number) ?? 10,
      adminResetEnabled: (config["mfa.admin_reset_enabled"] as boolean) ?? true,
    }
  }),

  updateMfaSettings: protectedProcedure("settings.edit")
    .input(
      z.object({
        enforceAllUsers: z.boolean(),
        enforceAdmins: z.boolean(),
        methodTotp: z.boolean(),
        methodSms: z.boolean(),
        methodEmail: z.boolean(),
        methodHardware: z.boolean(),
        gracePeriodDays: z.number().min(0).max(365), // 0 to 1 year
        recoveryCodesEnabled: z.boolean(),
        recoveryCodesCount: z.number().min(1).max(50),
        adminResetEnabled: z.boolean(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Validate credentials before enabling methods
      if (input.methodSms) {
        const smsSettings = await prisma.settings.findMany({
          where: {
            key: {
              in: ["mfa.sms.account_sid", "mfa.sms.auth_token", "mfa.sms.phone_number"],
            },
          },
        })

        const smsConfig: Record<string, string> = {}
        smsSettings.forEach((setting) => {
          smsConfig[setting.key] = setting.value as string
        })

        if (!smsConfig["mfa.sms.account_sid"] || !smsConfig["mfa.sms.auth_token"] || !smsConfig["mfa.sms.phone_number"]) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "SMS credentials are not configured. Please configure them in Settings → MFA Credentials before enabling SMS MFA.",
          })
        }
      }

      if (input.methodHardware) {
        const webauthnSettings = await prisma.settings.findMany({
          where: {
            key: {
              in: ["mfa.webauthn.rp_id", "mfa.webauthn.rp_name", "mfa.webauthn.origin"],
            },
          },
        })

        const webauthnConfig: Record<string, string> = {}
        webauthnSettings.forEach((setting) => {
          webauthnConfig[setting.key] = setting.value as string
        })

        if (!webauthnConfig["mfa.webauthn.rp_id"] || !webauthnConfig["mfa.webauthn.rp_name"] || !webauthnConfig["mfa.webauthn.origin"]) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "WebAuthn credentials are not configured. Please configure them in Settings → MFA Credentials before enabling Hardware Security Keys MFA.",
          })
        }
      }

      // Update or create each setting
      await Promise.all([
        prisma.settings.upsert({
          where: { key: "mfa.enforce_all_users" },
          update: { value: input.enforceAllUsers },
          create: { key: "mfa.enforce_all_users", value: input.enforceAllUsers },
        }),
        prisma.settings.upsert({
          where: { key: "mfa.enforce_admins" },
          update: { value: input.enforceAdmins },
          create: { key: "mfa.enforce_admins", value: input.enforceAdmins },
        }),
        prisma.settings.upsert({
          where: { key: "mfa.methods.totp" },
          update: { value: input.methodTotp },
          create: { key: "mfa.methods.totp", value: input.methodTotp },
        }),
        prisma.settings.upsert({
          where: { key: "mfa.methods.sms" },
          update: { value: input.methodSms },
          create: { key: "mfa.methods.sms", value: input.methodSms },
        }),
        prisma.settings.upsert({
          where: { key: "mfa.methods.email" },
          update: { value: input.methodEmail },
          create: { key: "mfa.methods.email", value: input.methodEmail },
        }),
        prisma.settings.upsert({
          where: { key: "mfa.methods.hardware" },
          update: { value: input.methodHardware },
          create: { key: "mfa.methods.hardware", value: input.methodHardware },
        }),
        prisma.settings.upsert({
          where: { key: "mfa.grace_period_days" },
          update: { value: input.gracePeriodDays },
          create: { key: "mfa.grace_period_days", value: input.gracePeriodDays },
        }),
        prisma.settings.upsert({
          where: { key: "mfa.recovery_codes_enabled" },
          update: { value: input.recoveryCodesEnabled },
          create: { key: "mfa.recovery_codes_enabled", value: input.recoveryCodesEnabled },
        }),
        prisma.settings.upsert({
          where: { key: "mfa.recovery_codes_count" },
          update: { value: input.recoveryCodesCount },
          create: { key: "mfa.recovery_codes_count", value: input.recoveryCodesCount },
        }),
        prisma.settings.upsert({
          where: { key: "mfa.admin_reset_enabled" },
          update: { value: input.adminResetEnabled },
          create: { key: "mfa.admin_reset_enabled", value: input.adminResetEnabled },
        }),
      ])

      // Create audit log
      const { createAuditLog } = await import("@/lib/audit-log")
      await createAuditLog({
        action: "SETTINGS_UPDATED",
        resource: "Settings",
        details: { category: "mfa" },
        userId: ctx.userId,
      })

      return { success: true }
    }),

  getMfaCredentials: protectedProcedure("settings.view").query(async () => {
    const settings = await prisma.settings.findMany({
      where: {
        key: {
          in: [
            "mfa.sms.account_sid",
            "mfa.sms.auth_token",
            "mfa.sms.phone_number",
            "mfa.webauthn.rp_id",
            "mfa.webauthn.rp_name",
            "mfa.webauthn.origin",
          ],
        },
      },
    })

    const config: Record<string, unknown> = {}
    settings.forEach((setting) => {
      config[setting.key] = setting.value
    })

    // Decrypt sensitive SMS credentials
    const decryptKeys = ["mfa.sms.account_sid", "mfa.sms.auth_token", "mfa.sms.phone_number"]
    decryptKeys.forEach((key) => {
      if (config[key]) {
        config[key] = decrypt(config[key] as string)
      }
    })

    return {
      smsAccountSid: (config["mfa.sms.account_sid"] as string) || "",
      smsAuthToken: (config["mfa.sms.auth_token"] as string) || "",
      smsPhoneNumber: (config["mfa.sms.phone_number"] as string) || "",
      webauthnRpId: (config["mfa.webauthn.rp_id"] as string) || "",
      webauthnRpName: (config["mfa.webauthn.rp_name"] as string) || "",
      webauthnOrigin: (config["mfa.webauthn.origin"] as string) || "",
    }
  }),

  updateMfaCredentials: protectedProcedure("settings.edit")
    .input(
      z.object({
        smsAccountSid: z.string().optional(),
        smsAuthToken: z.string().optional(),
        smsPhoneNumber: z.string().optional(),
        webauthnRpId: z.string().optional(),
        webauthnRpName: z.string().optional(),
        webauthnOrigin: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      // Encrypt sensitive SMS credentials
      const encryptKeys = ["smsAccountSid", "smsAuthToken", "smsPhoneNumber"]
      const encryptedData: Record<string, string> = {}
      
      encryptKeys.forEach((key) => {
        const value = input[key as keyof typeof input]
        if (value !== undefined && value !== "") {
          encryptedData[key] = encrypt(value as string)
        }
      })

      // Update or create each setting
      await Promise.all([
        input.smsAccountSid !== undefined &&
          prisma.settings.upsert({
            where: { key: "mfa.sms.account_sid" },
            update: { value: encryptedData.smsAccountSid || input.smsAccountSid },
            create: { key: "mfa.sms.account_sid", value: encryptedData.smsAccountSid || input.smsAccountSid },
          }),
        input.smsAuthToken !== undefined &&
          prisma.settings.upsert({
            where: { key: "mfa.sms.auth_token" },
            update: { value: encryptedData.smsAuthToken || input.smsAuthToken },
            create: { key: "mfa.sms.auth_token", value: encryptedData.smsAuthToken || input.smsAuthToken },
          }),
        input.smsPhoneNumber !== undefined &&
          prisma.settings.upsert({
            where: { key: "mfa.sms.phone_number" },
            update: { value: encryptedData.smsPhoneNumber || input.smsPhoneNumber },
            create: { key: "mfa.sms.phone_number", value: encryptedData.smsPhoneNumber || input.smsPhoneNumber },
          }),
        input.webauthnRpId !== undefined &&
          prisma.settings.upsert({
            where: { key: "mfa.webauthn.rp_id" },
            update: { value: input.webauthnRpId },
            create: { key: "mfa.webauthn.rp_id", value: input.webauthnRpId },
          }),
        input.webauthnRpName !== undefined &&
          prisma.settings.upsert({
            where: { key: "mfa.webauthn.rp_name" },
            update: { value: input.webauthnRpName },
            create: { key: "mfa.webauthn.rp_name", value: input.webauthnRpName },
          }),
        input.webauthnOrigin !== undefined &&
          prisma.settings.upsert({
            where: { key: "mfa.webauthn.origin" },
            update: { value: input.webauthnOrigin },
            create: { key: "mfa.webauthn.origin", value: input.webauthnOrigin },
          }),
      ].filter(Boolean))

      // Clear caches when credentials are updated
      const { clearSmsCredentialsCache } = await import("@/lib/sms")
      const { clearWebAuthnCredentialsCache } = await import("@/lib/webauthn")
      clearSmsCredentialsCache()
      clearWebAuthnCredentialsCache()

      return { success: true }
    }),

  checkMfaCredentialsStatus: protectedProcedure("settings.view").query(async () => {
    // Check SMS credentials
    const smsSettings = await prisma.settings.findMany({
      where: {
        key: {
          in: ["mfa.sms.account_sid", "mfa.sms.auth_token", "mfa.sms.phone_number"],
        },
      },
    })

    const smsConfig: Record<string, string> = {}
    smsSettings.forEach((setting) => {
      smsConfig[setting.key] = setting.value as string
    })

    const smsConfigured = 
      smsConfig["mfa.sms.account_sid"] && 
      smsConfig["mfa.sms.auth_token"] && 
      smsConfig["mfa.sms.phone_number"]

    // Check WebAuthn credentials
    const webauthnSettings = await prisma.settings.findMany({
      where: {
        key: {
          in: ["mfa.webauthn.rp_id", "mfa.webauthn.rp_name", "mfa.webauthn.origin"],
        },
      },
    })

    const webauthnConfig: Record<string, string> = {}
    webauthnSettings.forEach((setting) => {
      webauthnConfig[setting.key] = setting.value as string
    })

    const webauthnConfigured = 
      webauthnConfig["mfa.webauthn.rp_id"] && 
      webauthnConfig["mfa.webauthn.rp_name"] && 
      webauthnConfig["mfa.webauthn.origin"]

    return {
      smsConfigured: !!smsConfigured,
      webauthnConfigured: !!webauthnConfigured,
    }
  }),
})
