"use server"

import { serverTrpc } from "@/trpc/server-caller"
import { TRPCError } from "@trpc/server"
import { revalidatePath } from "next/cache"

export async function addTeamMemberAction(teamId: string, userId: string, role: "MANAGER" | "MEMBER") {
  try {
    const trpc = await serverTrpc()
    await trpc.teams.addMember({
      teamId,
      userId,
      role,
    })

    revalidatePath("/admin/teams")
    return { success: true }
  } catch (error: unknown) {
    if (error instanceof TRPCError) {
      return { error: error.message }
    }

    const message = error instanceof Error ? error.message : "Failed to add team member"
    return { error: message }
  }
}

export async function removeTeamMemberAction(teamId: string, userId: string) {
  try {
    const trpc = await serverTrpc()
    await trpc.teams.removeMember({
      teamId,
      userId,
    })

    revalidatePath("/admin/teams")
    return { success: true }
  } catch (error: unknown) {
    if (error instanceof TRPCError) {
      return { error: error.message }
    }

    const message = error instanceof Error ? error.message : "Failed to remove team member"
    return { error: message }
  }
}

export async function updateTeamMemberRoleAction(
  teamId: string,
  userId: string,
  role: "MANAGER" | "MEMBER"
) {
  try {
    const trpc = await serverTrpc()
    await trpc.teams.updateMemberRole({
      teamId,
      userId,
      role,
    })

    revalidatePath("/admin/teams")
    return { success: true }
  } catch (error: unknown) {
    if (error instanceof TRPCError) {
      return { error: error.message }
    }

    const message = error instanceof Error ? error.message : "Failed to update member role"
    return { error: message }
  }
}

