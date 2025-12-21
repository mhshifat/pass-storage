"use server"

import { serverTrpc } from "@/trpc/server-caller"
import { TRPCError } from "@trpc/server"
import { revalidatePath } from "next/cache"

type FieldErrors = {
  [key: string]: string
}

export async function createPasswordAction(
  prevState: { error?: string; fieldErrors?: FieldErrors; success?: boolean } | null,
  formData: FormData
) {
  const name = formData.get("name") as string
  const username = formData.get("username") as string
  const password = formData.get("password") as string
  const url = formData.get("url") as string
  const folderId = formData.get("folderId") as string
  const notes = formData.get("notes") as string
  const totpSecret = formData.get("totpSecret") as string
  const tagIds = formData.getAll("tagIds") as string[]

  try {
    const trpc = await serverTrpc()
    await trpc.passwords.create({
      name,
      username,
      password,
      url: url || null,
      folderId: folderId || null,
      notes: notes || null,
      totpSecret: totpSecret || null,
      tagIds: tagIds.length > 0 ? tagIds : undefined,
    })

    revalidatePath("/admin/passwords")
    return { success: true }
  } catch (error: unknown) {
    if (error instanceof TRPCError) {
      if (error.code === "BAD_REQUEST") {
        try {
          const zodErrors = JSON.parse(error.message)
          const fieldErrors: FieldErrors = {}

          for (const err of zodErrors) {
            if (err.path && err.path.length > 0) {
              const fieldName = err.path[0]
              fieldErrors[fieldName] = err.message
            }
          }

          if (Object.keys(fieldErrors).length > 0) {
            return { fieldErrors }
          }
        } catch {
          return { error: error.message }
        }
      }

      return { error: error.message }
    }

    const message = error instanceof Error ? error.message : "Failed to create password"
    return { error: message }
  }
}

export async function updatePasswordAction(
  prevState: { error?: string; fieldErrors?: FieldErrors; success?: boolean } | null,
  formData: FormData
) {
  const passwordId = formData.get("passwordId") as string
  const name = formData.get("name") as string
  const username = formData.get("username") as string
  const password = formData.get("password") as string
  const url = formData.get("url") as string
  const folderId = formData.get("folderId") as string
  const notes = formData.get("notes") as string
  const totpSecret = formData.get("totpSecret") as string
  const tagIds = formData.getAll("tagIds") as string[]

  try {
    const trpc = await serverTrpc()
    await trpc.passwords.update({
      id: passwordId,
      name,
      username,
      password,
      url: url || null,
      folderId: folderId || null,
      notes: notes || null,
      totpSecret: totpSecret || null,
      tagIds: tagIds.length > 0 ? tagIds : [],
    })

    revalidatePath("/admin/passwords")
    return { success: true }
  } catch (error: unknown) {
    if (error instanceof TRPCError) {
      if (error.code === "BAD_REQUEST") {
        try {
          const zodErrors = JSON.parse(error.message)
          const fieldErrors: FieldErrors = {}

          for (const err of zodErrors) {
            if (err.path && err.path.length > 0) {
              const fieldName = err.path[0]
              fieldErrors[fieldName] = err.message
            }
          }

          if (Object.keys(fieldErrors).length > 0) {
            return { fieldErrors }
          }
        } catch {
          return { error: error.message }
        }
      }

      return { error: error.message }
    }

    const message = error instanceof Error ? error.message : "Failed to update password"
    return { error: message }
  }
}

export async function deletePasswordAction(passwordId: string) {
  try {
    const trpc = await serverTrpc()
    await trpc.passwords.delete({ id: passwordId })

    revalidatePath("/admin/passwords")
    return { success: true }
  } catch (error: unknown) {
    if (error instanceof TRPCError) {
      return { error: error.message }
    }

    const message = error instanceof Error ? error.message : "Failed to delete password"
    return { error: message }
  }
}

