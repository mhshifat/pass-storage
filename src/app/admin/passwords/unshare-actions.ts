"use server"

import { serverTrpc } from "@/trpc/server-caller"
import { TRPCError } from "@trpc/server"
import { revalidatePath } from "next/cache"

export async function removePasswordShareAction(shareId: string) {
  try {
    const trpc = await serverTrpc()
    await trpc.teams.removeTeamPasswordShare({
      shareId,
    })

    revalidatePath("/admin/passwords")
    return { success: true }
  } catch (error: unknown) {
    if (error instanceof TRPCError) {
      return { error: error.message }
    }

    const message = error instanceof Error ? error.message : "Failed to remove password share"
    return { error: message }
  }
}

