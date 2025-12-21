import prisma from "@/lib/prisma"
import { encrypt } from "./crypto"

interface PasswordData {
  name: string
  username: string
  password: string // Encrypted
  url?: string | null
  notes?: string | null
  folderId?: string | null
  strength: "STRONG" | "MEDIUM" | "WEAK"
  hasTotp: boolean
  totpSecret?: string | null // Encrypted
  expiresAt?: Date | null
}

/**
 * Save password history before updating
 */
export async function savePasswordHistory(
  passwordId: string,
  currentData: PasswordData,
  changedBy: string,
  changeType: "CREATE" | "UPDATE" | "RESTORE" = "UPDATE"
) {
  await prisma.passwordHistory.create({
    data: {
      passwordId,
      name: currentData.name,
      username: currentData.username,
      password: currentData.password, // Already encrypted
      url: currentData.url || null,
      notes: currentData.notes || null,
      folderId: currentData.folderId || null,
      strength: currentData.strength,
      hasTotp: currentData.hasTotp,
      totpSecret: currentData.totpSecret || null, // Already encrypted
      expiresAt: currentData.expiresAt || null,
      changedBy,
      changeType,
    },
  })
}

/**
 * Get current password data for history
 */
export async function getCurrentPasswordData(passwordId: string): Promise<PasswordData | null> {
  const password = await prisma.password.findUnique({
    where: { id: passwordId },
    select: {
      name: true,
      username: true,
      password: true,
      url: true,
      notes: true,
      folderId: true,
      strength: true,
      hasTotp: true,
      totpSecret: true,
      expiresAt: true,
    },
  })

  if (!password) return null

  return {
    name: password.name,
    username: password.username,
    password: password.password,
    url: password.url,
    notes: password.notes,
    folderId: password.folderId,
    strength: password.strength,
    hasTotp: password.hasTotp,
    totpSecret: password.totpSecret,
    expiresAt: password.expiresAt,
  }
}
