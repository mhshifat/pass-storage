"use server"

import prisma from "@/lib/prisma"
import { decrypt } from "@/lib/crypto"

export interface PasswordPolicyConfig {
  minLength: number
  requireUppercase: boolean
  requireLowercase: boolean
  requireNumbers: boolean
  requireSpecial: boolean
  expirationDays: number | null
  preventReuseCount: number
  requireChangeOnFirstLogin: boolean
  requireChangeAfterDays: number | null
  isActive: boolean
}

export interface PasswordValidationResult {
  isValid: boolean
  errors: string[]
}

export interface PasswordExpirationCheck {
  isExpired: boolean
  expiresAt: Date | null
  daysUntilExpiration: number | null
}

export interface PasswordHistoryCheck {
  canReuse: boolean
  reason?: string
}

/**
 * Get password policy for a company
 */
export async function getPasswordPolicy(companyId: string | null): Promise<PasswordPolicyConfig | null> {
  if (!companyId) return null

  const policy = await prisma.passwordPolicy.findUnique({
    where: { companyId },
  })

  if (!policy || !policy.isActive) {
    // Return default policy if none exists
    return {
      minLength: 12,
      requireUppercase: true,
      requireLowercase: true,
      requireNumbers: true,
      requireSpecial: true,
      expirationDays: null,
      preventReuseCount: 0,
      requireChangeOnFirstLogin: false,
      requireChangeAfterDays: null,
      isActive: true,
    }
  }

  return {
    minLength: policy.minLength,
    requireUppercase: policy.requireUppercase,
    requireLowercase: policy.requireLowercase,
    requireNumbers: policy.requireNumbers,
    requireSpecial: policy.requireSpecial,
    expirationDays: policy.expirationDays,
    preventReuseCount: policy.preventReuseCount,
    requireChangeOnFirstLogin: policy.requireChangeOnFirstLogin,
    requireChangeAfterDays: policy.requireChangeAfterDays,
    isActive: policy.isActive,
  }
}

/**
 * Validate a password against the password policy
 */
export async function validatePasswordAgainstPolicy(
  password: string,
  companyId: string | null
): Promise<PasswordValidationResult> {
  const errors: string[] = []
  const policy = await getPasswordPolicy(companyId)

  if (!policy) {
    return { isValid: true, errors: [] }
  }

  // Validate minimum length
  if (password.length < policy.minLength) {
    errors.push(`Password must be at least ${policy.minLength} characters long`)
  }

  // Validate uppercase requirement
  if (policy.requireUppercase && !/[A-Z]/.test(password)) {
    errors.push("Password must contain at least one uppercase letter (A-Z)")
  }

  // Validate lowercase requirement
  if (policy.requireLowercase && !/[a-z]/.test(password)) {
    errors.push("Password must contain at least one lowercase letter (a-z)")
  }

  // Validate numbers requirement
  if (policy.requireNumbers && !/[0-9]/.test(password)) {
    errors.push("Password must contain at least one number (0-9)")
  }

  // Validate special characters requirement
  if (policy.requireSpecial && !/[^A-Za-z0-9]/.test(password)) {
    errors.push("Password must contain at least one special character (!@#$%...)")
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

/**
 * Check if a password can be reused (not in history)
 */
export async function checkPasswordHistory(
  password: string,
  passwordId: string,
  companyId: string | null
): Promise<PasswordHistoryCheck> {
  const policy = await getPasswordPolicy(companyId)

  if (!policy || policy.preventReuseCount === 0) {
    return { canReuse: true }
  }

  // Get recent password history
  const history = await prisma.passwordHistory.findMany({
    where: {
      passwordId,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: policy.preventReuseCount,
  })

  // Decrypt and compare passwords
  for (const entry of history) {
    try {
      const decryptedPassword = await decrypt(entry.password)
      if (decryptedPassword === password) {
        return {
          canReuse: false,
          reason: `This password was used recently. You cannot reuse your last ${policy.preventReuseCount} password(s).`,
        }
      }
    } catch (error) {
      // Skip if decryption fails
      continue
    }
  }

  return { canReuse: true }
}

/**
 * Check if a user's password has expired
 */
export async function checkPasswordExpiration(
  userId: string,
  companyId: string | null
): Promise<PasswordExpirationCheck> {
  const policy = await getPasswordPolicy(companyId)

  if (!policy || !policy.expirationDays) {
    return {
      isExpired: false,
      expiresAt: null,
      daysUntilExpiration: null,
    }
  }

  // Note: This function is for user account passwords, not vault passwords
  // For vault passwords, expiration is checked differently
  // Get user's password change date (from audit logs or user creation)
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { createdAt: true, updatedAt: true },
  })

  // For user passwords, we use updatedAt as the change date
  // In a real implementation, you'd track user password changes separately
  const changeDate = user?.updatedAt || user?.createdAt || new Date()
  const expirationDate = new Date(changeDate)
  expirationDate.setDate(expirationDate.getDate() + policy.expirationDays)

  const now = new Date()
  const daysUntilExpiration = Math.ceil(
    (expirationDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  )

  return {
    isExpired: now > expirationDate,
    expiresAt: expirationDate,
    daysUntilExpiration: daysUntilExpiration > 0 ? daysUntilExpiration : 0,
  }
}

/**
 * Check if a user needs to change their password
 */
export async function checkPasswordChangeRequirement(
  userId: string,
  companyId: string | null
): Promise<{ requiresChange: boolean; reason?: string }> {
  const policy = await getPasswordPolicy(companyId)

  if (!policy) {
    return { requiresChange: false }
  }

  // Note: This function is for vault passwords, not user account passwords
  // Check if change is required on first login (for vault passwords)
  if (policy.requireChangeOnFirstLogin) {
    // For vault passwords, check if password has been changed since creation
    // This would be checked per password entry, not per user
    // This is a placeholder - actual implementation would check specific password entry
  }

  // Check if change is required after X days (for vault passwords)
  if (policy.requireChangeAfterDays) {
    // This would be checked per password entry when accessed
    // Placeholder - actual implementation would check specific password entry's last change date
  }

  return { requiresChange: false }
}

