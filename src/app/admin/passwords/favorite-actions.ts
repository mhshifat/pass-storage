"use server"

import { revalidatePath } from "next/cache"
import { serverTrpc } from "@/trpc/server-caller"
import { TRPCError } from "@trpc/server"

export async function toggleFavoriteAction(passwordId: string) {
  try {
    const trpc = await serverTrpc()
    const result = await trpc.passwords.toggleFavorite({ passwordId })
    revalidatePath("/admin/passwords")
    revalidatePath("/admin/passwords/favorites")
    return result
  } catch (error: unknown) {
    if (error instanceof TRPCError) {
      return { success: false, error: error.message }
    }
    return { success: false, error: "Failed to toggle favorite" }
  }
}
