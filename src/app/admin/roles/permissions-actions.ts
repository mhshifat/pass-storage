"use server"

import { serverTrpc } from "@/trpc/server-caller"
import { TRPCError } from "@trpc/server"
import { revalidatePath } from "next/cache"

export async function updateRolePermissionsAction(
  roleId: string,
  permissionIds: string[]
) {
  try {
    const trpc = await serverTrpc()
    await trpc.roles.updatePermissions({
      roleId,
      permissionIds,
    })

    revalidatePath("/admin/roles")
    return { success: true }
  } catch (error: unknown) {
    if (error instanceof TRPCError) {
      return { error: error.message }
    }

    const message = error instanceof Error ? error.message : "Failed to update permissions"
    return { error: message }
  }
}

