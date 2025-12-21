"use server"

import { revalidatePath } from "next/cache"
import { serverTrpc } from "@/trpc/server-caller"
import { TRPCError } from "@trpc/server"

export async function createTagAction(data: {
  name: string
  color?: string | null
  icon?: string | null
}) {
  try {
    const trpc = await serverTrpc()
    const result = await trpc.passwords.createTag(data)
    revalidatePath("/admin/passwords/tags")
    revalidatePath("/admin/passwords")
    return { success: true, tag: result }
  } catch (error: unknown) {
    if (error instanceof TRPCError) {
      return { success: false, error: error.message }
    }
    return { success: false, error: "Failed to create tag" }
  }
}

export async function updateTagAction(
  id: string,
  data: {
    name?: string
    color?: string | null
    icon?: string | null
  }
) {
  try {
    const trpc = await serverTrpc()
    const result = await trpc.passwords.updateTag({ id, ...data })
    revalidatePath("/admin/passwords/tags")
    revalidatePath("/admin/passwords")
    return { success: true, tag: result }
  } catch (error: unknown) {
    if (error instanceof TRPCError) {
      return { success: false, error: error.message }
    }
    return { success: false, error: "Failed to update tag" }
  }
}

export async function deleteTagAction(id: string) {
  try {
    const trpc = await serverTrpc()
    await trpc.passwords.deleteTag({ id })
    revalidatePath("/admin/passwords/tags")
    revalidatePath("/admin/passwords")
    return { success: true }
  } catch (error: unknown) {
    if (error instanceof TRPCError) {
      return { success: false, error: error.message }
    }
    return { success: false, error: "Failed to delete tag" }
  }
}
