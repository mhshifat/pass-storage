"use server"

import { serverTrpc } from "@/trpc/server-caller"
import { TRPCError } from "@trpc/server"

export interface ExportOptions {
  format: "csv" | "json" | "bitwarden" | "lastpass" | "encrypted"
  folderId?: string
  tagIds?: string[]
  dateFrom?: string
  dateTo?: string
  includeShared?: boolean
  encryptionKey?: string
}

export interface ExportResult {
  content: string
  mimeType: string
  fileExtension: string
  count: number
}

export async function exportPasswordsAction(
  options: ExportOptions
): Promise<ExportResult> {
  try {
    const trpc = await serverTrpc()
    const result = await trpc.passwords.export(options)

    return result
  } catch (error: unknown) {
    if (error instanceof TRPCError) {
      throw new Error(error.message)
    }
    throw new Error("Failed to export passwords")
  }
}

export async function getExportFiltersAction() {
  try {
    const trpc = await serverTrpc()
    const result = await trpc.passwords.getExportFilters()

    return result
  } catch (error: unknown) {
    if (error instanceof TRPCError) {
      throw new Error(error.message)
    }
    throw new Error("Failed to get export filters")
  }
}
