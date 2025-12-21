"use server"

import { revalidatePath } from "next/cache"
import { serverTrpc } from "@/trpc/server-caller"
import { TRPCError } from "@trpc/server"

export interface DuplicateResolutionOptions {
  action: "delete" | "merge"
  passwordIds: string[]
  keepPasswordId?: string
}

export async function findDuplicatesAction(threshold?: number) {
  try {
    const trpc = await serverTrpc()
    return await trpc.passwords.findDuplicates({ threshold })
  } catch (error: unknown) {
    if (error instanceof TRPCError) {
      throw new Error(error.message)
    }
    throw new Error("Failed to find duplicates")
  }
}

export async function findReusedAction() {
  try {
    const trpc = await serverTrpc()
    return await trpc.passwords.findReused()
  } catch (error: unknown) {
    if (error instanceof TRPCError) {
      throw new Error(error.message)
    }
    throw new Error("Failed to find reused passwords")
  }
}

export async function findSimilarAction(threshold?: number) {
  try {
    const trpc = await serverTrpc()
    return await trpc.passwords.findSimilar({ threshold })
  } catch (error: unknown) {
    if (error instanceof TRPCError) {
      throw new Error(error.message)
    }
    throw new Error("Failed to find similar passwords")
  }
}

export async function bulkResolveDuplicatesAction(
  options: DuplicateResolutionOptions
): Promise<{ success: boolean; deleted?: number; merged?: number; keptPasswordId?: string }> {
  try {
    const trpc = await serverTrpc()
    const result = await trpc.passwords.bulkResolveDuplicates(options)
    revalidatePath("/admin/passwords")
    return result
  } catch (error: unknown) {
    if (error instanceof TRPCError) {
      throw new Error(error.message)
    }
    throw new Error("Failed to resolve duplicates")
  }
}
