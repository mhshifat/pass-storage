import prisma from "@/lib/prisma"
import { baseProcedure, createTRPCRouter } from "@/trpc/init"
import z from "zod"
import { TRPCError } from "@trpc/server"

export const settingsRouter = createTRPCRouter({
  getEmailConfig: baseProcedure.query(async () => {
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
    settings.forEach((setting) => {
      config[setting.key] = setting.value
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

  updateEmailConfig: baseProcedure
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
      await Promise.all(
        Object.entries(input).map(async ([key, value]) => {
            if (typeof value === "undefined") return // skip undefined values
            await prisma.settings.upsert({
            where: { key },
            update: { value },
            create: { key, value },
            })
        })
    )

      // Reset email transporter cache
      const { resetEmailTransporter } = await import("@/lib/mailer")
      resetEmailTransporter()

      return { success: true }
    }),

  testEmailConfig: baseProcedure
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
})
