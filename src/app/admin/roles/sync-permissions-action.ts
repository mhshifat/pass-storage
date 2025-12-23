"use server"

import { revalidatePath } from "next/cache"
import { serverTrpc } from "@/trpc/server-caller"

export async function syncPermissionsAction(): Promise<{
  success?: boolean
  error?: string
}> {
  try {
    const caller = await serverTrpc()
    await caller.settings.syncPermissions()

    revalidatePath("/admin/roles")
    return { success: true }
  } catch (error) {
    console.error("Failed to sync permissions:", error)
    return {
      error: error instanceof Error ? error.message : "Failed to sync permissions",
    }
  }
}



