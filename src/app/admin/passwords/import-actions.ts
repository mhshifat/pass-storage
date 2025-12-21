"use server"

import { revalidatePath } from "next/cache"
import { serverTrpc } from "@/trpc/server-caller"
import { TRPCError } from "@trpc/server"

export interface ImportPreviewResult {
  passwords: Array<{
    name: string
    username: string
    password: string
    url?: string | null
    notes?: string | null
    folderId?: string | null
    totpSecret?: string | null
    errors?: string[]
    warnings?: string[]
  }>
  errors: string[]
  warnings: string[]
  totalRows: number
  validRows: number
  invalidRows: number
}

export interface ImportCommitResult {
  success: boolean
  created: number
  errors: number
  createdIds: string[]
  errorMessages: string[]
}

export async function previewImportAction(
  content: string,
  format?: "csv" | "json" | "1password" | "lastpass" | "bitwarden" | "keepass"
): Promise<ImportPreviewResult> {
  try {
    const trpc = await serverTrpc()
    const result = await trpc.passwords.importPreview({
      content,
      format,
    })

    return result
  } catch (error: unknown) {
    if (error instanceof TRPCError) {
      throw new Error(error.message)
    }
    throw new Error("Failed to preview import")
  }
}

export async function commitImportAction(
  passwords: Array<{
    name: string
    username: string
    password: string
    url?: string | null
    notes?: string | null
    folderId?: string | null
    totpSecret?: string | null
  }>,
  skipInvalid: boolean = true
): Promise<ImportCommitResult> {
  try {
    const trpc = await serverTrpc()
    const result = await trpc.passwords.importCommit({
      passwords,
      skipInvalid,
    })

    revalidatePath("/admin/passwords")
    return result
  } catch (error: unknown) {
    if (error instanceof TRPCError) {
      throw new Error(error.message)
    }
    throw new Error("Failed to commit import")
  }
}
