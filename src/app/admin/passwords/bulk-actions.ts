"use server"

import { revalidatePath } from "next/cache"
import { serverTrpc } from "@/trpc/server-caller"
import { TRPCError } from "@trpc/server"

export interface BulkDeleteOptions {
  passwordIds: string[]
}

export interface BulkMoveOptions {
  passwordIds: string[]
  folderId: string | null
}

export interface BulkTagOptions {
  passwordIds: string[]
  tagIds: string[]
}

export interface BulkShareOptions {
  passwordIds: string[]
  teamId: string
  expiresAt?: string
}

export interface BulkUnshareOptions {
  passwordIds: string[]
  teamId?: string
}

export interface BulkStrengthOptions {
  passwordIds: string[]
  strength: "WEAK" | "MEDIUM" | "STRONG"
}

export async function bulkDeletePasswordsAction(
  options: BulkDeleteOptions
): Promise<{ success: boolean; deleted: number }> {
  try {
    const trpc = await serverTrpc()
    const result = await trpc.passwords.bulkDelete(options)
    revalidatePath("/admin/passwords")
    return result
  } catch (error: unknown) {
    if (error instanceof TRPCError) {
      throw new Error(error.message)
    }
    throw new Error("Failed to delete passwords")
  }
}

export async function bulkMovePasswordsAction(
  options: BulkMoveOptions
): Promise<{ success: boolean; updated: number }> {
  try {
    const trpc = await serverTrpc()
    const result = await trpc.passwords.bulkMoveToFolder(options)
    revalidatePath("/admin/passwords")
    return result
  } catch (error: unknown) {
    if (error instanceof TRPCError) {
      throw new Error(error.message)
    }
    throw new Error("Failed to move passwords")
  }
}

export async function bulkAssignTagsAction(
  options: BulkTagOptions
): Promise<{ success: boolean; updated: number }> {
  try {
    const trpc = await serverTrpc()
    const result = await trpc.passwords.bulkAssignTags(options)
    revalidatePath("/admin/passwords")
    return result
  } catch (error: unknown) {
    if (error instanceof TRPCError) {
      throw new Error(error.message)
    }
    throw new Error("Failed to assign tags")
  }
}

export async function bulkRemoveTagsAction(
  options: BulkTagOptions
): Promise<{ success: boolean; removed: number }> {
  try {
    const trpc = await serverTrpc()
    const result = await trpc.passwords.bulkRemoveTags({
      passwordIds: options.passwordIds,
      tagIds: options.tagIds,
    })
    revalidatePath("/admin/passwords")
    return result
  } catch (error: unknown) {
    if (error instanceof TRPCError) {
      throw new Error(error.message)
    }
    throw new Error("Failed to remove tags")
  }
}

export async function bulkSharePasswordsAction(
  options: BulkShareOptions
): Promise<{ success: boolean; shared: number }> {
  try {
    const trpc = await serverTrpc()
    const result = await trpc.passwords.bulkShare(options)
    revalidatePath("/admin/passwords")
    return result
  } catch (error: unknown) {
    if (error instanceof TRPCError) {
      throw new Error(error.message)
    }
    throw new Error("Failed to share passwords")
  }
}

export async function bulkUnsharePasswordsAction(
  options: BulkUnshareOptions
): Promise<{ success: boolean; unshared: number }> {
  try {
    const trpc = await serverTrpc()
    const result = await trpc.passwords.bulkUnshare(options)
    revalidatePath("/admin/passwords")
    return result
  } catch (error: unknown) {
    if (error instanceof TRPCError) {
      throw new Error(error.message)
    }
    throw new Error("Failed to unshare passwords")
  }
}

export async function bulkUpdateStrengthAction(
  options: BulkStrengthOptions
): Promise<{ success: boolean; updated: number }> {
  try {
    const trpc = await serverTrpc()
    const result = await trpc.passwords.bulkUpdateStrength(options)
    revalidatePath("/admin/passwords")
    return result
  } catch (error: unknown) {
    if (error instanceof TRPCError) {
      throw new Error(error.message)
    }
    throw new Error("Failed to update password strength")
  }
}
