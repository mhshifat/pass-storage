import crypto from "crypto"
import prisma from "@/lib/prisma"
import { sendEmail } from "./mailer"

/**
 * Generate a secure random token for email verification
 */
export function generateVerificationToken(): string {
  return crypto.randomBytes(32).toString("hex")
}

/**
 * Create an email verification token for a user
 */
export async function createVerificationToken(userId: string, email: string): Promise<string> {
  // Delete any existing tokens for this user
  await prisma.emailVerificationToken.deleteMany({
    where: { userId },
  })

  // Create new token (expires in 24 hours)
  const token = generateVerificationToken()
  const expiresAt = new Date()
  expiresAt.setHours(expiresAt.getHours() + 24)

  await prisma.emailVerificationToken.create({
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
 * Verify an email verification token
 */
export async function verifyToken(token: string): Promise<{ valid: boolean; userId?: string; email?: string }> {
  const verificationToken = await prisma.emailVerificationToken.findUnique({
    where: { token },
    include: { user: true },
  })

  if (!verificationToken) {
    return { valid: false }
  }

  // Check if token is expired
  if (verificationToken.expiresAt < new Date()) {
    // Delete expired token
    await prisma.emailVerificationToken.delete({
      where: { token },
    })
    return { valid: false }
  }

  // Check if email matches user's current email
  if (verificationToken.email !== verificationToken.user.email) {
    return { valid: false }
  }

  return {
    valid: true,
    userId: verificationToken.userId,
    email: verificationToken.email,
  }
}

/**
 * Send verification email to user
 */
export async function sendVerificationEmail(
  userId: string,
  email: string,
  token: string,
  baseUrl?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Get base URL from environment or use default
    const appUrl = baseUrl || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
    const verificationUrl = `${appUrl}/verify-email?token=${token}`

    const emailResult = await sendEmail({
      to: email,
      subject: "Verify your email address",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0;">Verify Your Email</h1>
          </div>
          <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
            <p style="font-size: 16px; margin-bottom: 20px;">Hello,</p>
            <p style="font-size: 16px; margin-bottom: 20px;">
              Thank you for registering with PassStorage! Please verify your email address by clicking the button below:
            </p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationUrl}" 
                 style="display: inline-block; background: #667eea; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">
                Verify Email Address
              </a>
            </div>
            <p style="font-size: 14px; color: #666; margin-top: 30px;">
              Or copy and paste this link into your browser:
            </p>
            <p style="font-size: 12px; color: #999; word-break: break-all; background: #fff; padding: 10px; border-radius: 4px; border: 1px solid #e5e7eb;">
              ${verificationUrl}
            </p>
            <p style="font-size: 14px; color: #666; margin-top: 30px;">
              This link will expire in 24 hours. If you didn't create an account, you can safely ignore this email.
            </p>
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
            <p style="font-size: 12px; color: #999; text-align: center; margin: 0;">
              © ${new Date().getFullYear()} PassStorage. All rights reserved.
            </p>
          </div>
        </body>
        </html>
      `,
      text: `
        Verify Your Email
        
        Thank you for registering with PassStorage! Please verify your email address by visiting the following link:
        
        ${verificationUrl}
        
        This link will expire in 24 hours. If you didn't create an account, you can safely ignore this email.
        
        © ${new Date().getFullYear()} PassStorage. All rights reserved.
      `,
    })

    return emailResult
  } catch (error) {
    console.error("Failed to send verification email:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to send verification email",
    }
  }
}

/**
 * Clean up expired verification tokens
 */
export async function cleanupExpiredTokens(): Promise<void> {
  await prisma.emailVerificationToken.deleteMany({
    where: {
      expiresAt: {
        lt: new Date(),
      },
    },
  })
}
