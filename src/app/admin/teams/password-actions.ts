"use server"

import { serverTrpc } from "@/trpc/server-caller"
import { TRPCError } from "@trpc/server"
import { revalidatePath } from "next/cache"

export async function sharePasswordWithTeamAction(
  passwordId: string,
  teamId: string,
  expiresAt?: string
) {
  try {
    const trpc = await serverTrpc()
    await trpc.teams.sharePasswordWithTeam({
      passwordId,
      teamId,
      expiresAt,
    })

    revalidatePath("/admin/teams")
    return { success: true }
  } catch (error: unknown) {
    if (error instanceof TRPCError) {
      return { error: error.message }
    }

    const message = error instanceof Error ? error.message : "Failed to share password with team"
    return { error: message }
  }
}

export async function updateTeamPasswordShareAction(
  shareId: string,
  expiresAt?: string | null
) {
  try {
    const trpc = await serverTrpc()
    await trpc.teams.updateTeamPasswordShare({
      shareId,
      expiresAt,
    })

    revalidatePath("/admin/teams")
    return { success: true }
  } catch (error: unknown) {
    if (error instanceof TRPCError) {
      return { error: error.message }
    }

    const message = error instanceof Error ? error.message : "Failed to update password share"
    return { error: message }
  }
}

export async function removeTeamPasswordShareAction(shareId: string) {
  try {
    const trpc = await serverTrpc()
    await trpc.teams.removeTeamPasswordShare({
      shareId,
    })

    revalidatePath("/admin/teams")
    return { success: true }
  } catch (error: unknown) {
    if (error instanceof TRPCError) {
      return { error: error.message }
    }

    const message = error instanceof Error ? error.message : "Failed to remove password share"
    return { error: message }
  }
}

