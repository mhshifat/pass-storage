"use server"

import { serverTrpc } from "@/trpc/server-caller"
import { TRPCError } from "@trpc/server"
import { revalidatePath } from "next/cache"

export async function sharePasswordWithTeamAction(
  passwordId: string,
  prevState: { error?: string; success?: boolean } | null,
  formData: FormData
) {
  const teamId = formData.get("teamId") as string
  const expiresAt = formData.get("expiresAt") as string

  try {
    const trpc = await serverTrpc()
    await trpc.teams.sharePasswordWithTeam({
      passwordId,
      teamId,
      expiresAt: expiresAt || undefined,
    })

    revalidatePath("/admin/passwords")
    return { success: true }
  } catch (error: unknown) {
    if (error instanceof TRPCError) {
      return { error: error.message }
    }

    const message = error instanceof Error ? error.message : "Failed to share password with team"
    return { error: message }
  }
}

