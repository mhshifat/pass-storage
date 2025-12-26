import crypto from "crypto"
import prisma from "@/lib/prisma"
import { sendEmail } from "./mailer"
import { hashPassword } from "./auth"

/**
 * Generate a secure random token for password reset
 */
export function generatePasswordResetToken(): string {
  return crypto.randomBytes(32).toString("hex")
}

/**
 * Create a password reset token for a user
 */
export async function createPasswordResetToken(userId: string, email: string): Promise<string> {
  // Delete any existing unused tokens for this user
  await prisma.passwordResetToken.deleteMany({
    where: { 
      userId,
      used: false,
    },
  })

  // Create new token (expires in 1 hour)
  const token = generatePasswordResetToken()
  const expiresAt = new Date()
  expiresAt.setHours(expiresAt.getHours() + 1)

  await prisma.passwordResetToken.create({
    data: {
      token,
      userId,
      email,
      expiresAt,
    },
  })

  return token
}

/**
 * Verify a password reset token
 */
export async function verifyPasswordResetToken(token: string): Promise<{ valid: boolean; userId?: string; email?: string }> {
  const resetToken = await prisma.passwordResetToken.findUnique({
    where: { token },
    include: { user: true },
  })

  if (!resetToken) {
    return { valid: false }
  }

  // Check if token is expired
  if (resetToken.expiresAt < new Date()) {
    // Delete expired token
    await prisma.passwordResetToken.delete({
      where: { token },
    })
    return { valid: false }
  }

  // Check if token is already used
  if (resetToken.used) {
    return { valid: false }
  }

  // Check if email matches user's current email or recovery email
  const isValidEmail = 
    resetToken.email === resetToken.user.email ||
    resetToken.email === resetToken.user.recoveryEmail

  if (!isValidEmail) {
    return { valid: false }
  }

  return {
    valid: true,
    userId: resetToken.userId,
    email: resetToken.email,
  }
}

/**
 * Mark a password reset token as used
 */
export async function markPasswordResetTokenAsUsed(token: string): Promise<void> {
  await prisma.passwordResetToken.update({
    where: { token },
    data: {
      used: true,
      usedAt: new Date(),
    },
  })
}

/**
 * Send password reset email to user
 */
export async function sendPasswordResetEmail(
  userId: string,
  email: string,
  token: string,
  baseUrl?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Get base URL from environment or use default
    const appUrl = baseUrl || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
    const resetUrl = `${appUrl}/reset-password?token=${token}`

    const emailResult = await sendEmail({
      to: email,
      subject: "Reset your password",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0;">Reset Your Password</h1>
          </div>
          <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
            <p style="font-size: 16px; margin-bottom: 20px;">Hello,</p>
            <p style="font-size: 16px; margin-bottom: 20px;">
              We received a request to reset your password. Click the button below to reset it:
            </p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" 
                 style="display: inline-block; background: #667eea; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">
                Reset Password
              </a>
            </div>
            <p style="font-size: 14px; color: #666; margin-top: 30px;">
              Or copy and paste this link into your browser:
            </p>
            <p style="font-size: 12px; color: #999; word-break: break-all; background: #fff; padding: 10px; border-radius: 4px; border: 1px solid #e5e7eb;">
              ${resetUrl}
            </p>
            <p style="font-size: 14px; color: #666; margin-top: 30px;">
              This link will expire in 1 hour. If you didn't request a password reset, you can safely ignore this email.
            </p>
            <p style="font-size: 14px; color: #dc2626; margin-top: 20px; font-weight: bold;">
              ⚠️ Security Notice: If you didn't request this password reset, please contact support immediately.
            </p>
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
            <p style="font-size: 12px; color: #999; text-align: center; margin: 0;">
              © ${new Date().getFullYear()} PassBangla. All rights reserved.
            </p>
          </div>
        </body>
        </html>
      `,
      text: `
        Reset Your Password
        
        We received a request to reset your password. Visit the following link to reset it:
        
        ${resetUrl}
        
        This link will expire in 1 hour. If you didn't request a password reset, you can safely ignore this email.
        
        ⚠️ Security Notice: If you didn't request this password reset, please contact support immediately.
        
        © ${new Date().getFullYear()} PassBangla. All rights reserved.
      `,
    })

    return emailResult
  } catch (error) {
    console.error("Failed to send password reset email:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to send password reset email",
    }
  }
}

/**
 * Clean up expired password reset tokens
 */
export async function cleanupExpiredPasswordResetTokens(): Promise<void> {
  await prisma.passwordResetToken.deleteMany({
    where: {
      OR: [
        { expiresAt: { lt: new Date() } },
        { used: true, usedAt: { lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } }, // Delete used tokens older than 7 days
      ],
    },
  })
}
