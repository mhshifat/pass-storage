import { randomInt } from "crypto"

/**
 * Generate a 6-digit verification code
 */
export function generateMfaCode(): string {
  return randomInt(100000, 999999).toString()
}

/**
 * Store MFA code temporarily (in-memory for now, could use Redis in production)
 * Format: userId:method:code -> { code, expiresAt }
 */
const mfaCodeStore = new Map<string, { code: string; expiresAt: Date }>()

const CODE_EXPIRY_MINUTES = 10

export function storeMfaCode(userId: string, method: "SMS" | "EMAIL", code: string): void {
  const key = `${userId}:${method}`
  const expiresAt = new Date(Date.now() + CODE_EXPIRY_MINUTES * 60 * 1000)
  mfaCodeStore.set(key, { code, expiresAt })

  // Clean up expired codes periodically
  setTimeout(() => {
    mfaCodeStore.delete(key)
  }, CODE_EXPIRY_MINUTES * 60 * 1000)
}

export function verifyMfaCode(userId: string, method: "SMS" | "EMAIL", code: string): boolean {
  const key = `${userId}:${method}`
  const stored = mfaCodeStore.get(key)

  if (!stored) {
    return false
  }

  if (new Date() > stored.expiresAt) {
    mfaCodeStore.delete(key)
    return false
  }

  if (stored.code !== code) {
    return false
  }

  // Code is valid, remove it (one-time use)
  mfaCodeStore.delete(key)
  return true
}

export function clearMfaCode(userId: string, method: "SMS" | "EMAIL"): void {
  const key = `${userId}:${method}`
  mfaCodeStore.delete(key)
}
