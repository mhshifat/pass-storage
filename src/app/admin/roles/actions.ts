"use server"

import { serverTrpc } from "@/trpc/server-caller"
import { TRPCError } from "@trpc/server"
import { revalidatePath } from "next/cache"

type FieldErrors = {
  [key: string]: string
}

export async function createRoleAction(
  prevState: { error?: string; fieldErrors?: FieldErrors; success?: boolean } | null,
  formData: FormData
) {
  const name = formData.get("role-name") as string
  const description = formData.get("role-description") as string

  try {
    const trpc = await serverTrpc()
    await trpc.roles.create({
      name,
      description: description || undefined,
    })

    revalidatePath("/admin/roles")
    return { success: true }
  } catch (error: unknown) {
    // Handle tRPC errors
    if (error instanceof TRPCError) {
      // Check if it's a validation error
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
          // If parsing fails, return the message as a root error
          return { error: error.message }
        }
      }

      // For other tRPC errors, return the message
      return { error: error.message }
    }

    const message = error instanceof Error ? error.message : "Failed to create role"
    return { error: message }
  }
}

export async function updateRoleAction(
  roleId: string,
  prevState: { error?: string; fieldErrors?: FieldErrors; success?: boolean } | null,
  formData: FormData
) {
  const name = formData.get("role-name") as string
  const description = formData.get("role-description") as string

  try {
    const trpc = await serverTrpc()
    await trpc.roles.update({
      id: roleId,
      name,
      // Always pass description (even if empty string) so we can clear it
      description: description,
    })

    revalidatePath("/admin/roles")
    return { success: true }
  } catch (error: unknown) {
    // Handle tRPC errors
    if (error instanceof TRPCError) {
      // Check if it's a validation error
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
          // If parsing fails, return the message as a root error
          return { error: error.message }
        }
      }

      // For other tRPC errors, return the message
      return { error: error.message }
    }

    const message = error instanceof Error ? error.message : "Failed to update role"
    return { error: message }
  }
}

export async function deleteRoleAction(roleId: string) {
  try {
    const trpc = await serverTrpc()
    await trpc.roles.delete({ id: roleId })

    revalidatePath("/admin/roles")
    return { success: true }
  } catch (error: unknown) {
    if (error instanceof TRPCError) {
      return { error: error.message }
    }

    const message = error instanceof Error ? error.message : "Failed to delete role"
    return { error: message }
  }
}

