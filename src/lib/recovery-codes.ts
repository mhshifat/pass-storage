import { randomBytes } from "crypto"
import { hashPassword, verifyPassword } from "./auth"

/**
 * Generate a recovery code
 * Returns formatted code: XXXX-XXXX-XXXX (12 characters, 3 groups of 4)
 * The raw code (without dashes) should be used for hashing
 */
export function generateRecoveryCode(): string {
  const bytes = randomBytes(6)
  const code = bytes.toString("hex").toUpperCase()
  // Format as XXXX-XXXX-XXXX for display
  return `${code.slice(0, 4)}-${code.slice(4, 8)}-${code.slice(8, 12)}`
}

/**
 * Generate multiple recovery codes
 */
export function generateRecoveryCodes(count: number): string[] {
  const codes: string[] = []
  for (let i = 0; i < count; i++) {
    codes.push(generateRecoveryCode())
  }
  return codes
}

/**
 * Hash a recovery code for storage
 */
export async function hashRecoveryCode(code: string): Promise<string> {
  return hashPassword(code)
}

/**
 * Verify a recovery code against a hash
 */
export async function verifyRecoveryCode(code: string, hash: string): Promise<boolean> {
  return verifyPassword(code, hash)
}
