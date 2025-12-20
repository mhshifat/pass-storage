"use server"

import { serverTrpc } from "@/trpc/server-caller"
import { TRPCError } from "@trpc/server"
import { revalidatePath } from "next/cache"

type FieldErrors = {
  [key: string]: string
}

export async function createUserAction(
  prevState: { error?: string; fieldErrors?: FieldErrors; success?: boolean } | null,
  formData: FormData
) {
  const name = formData.get("name") as string
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const role = (formData.get("role") as string) || "USER"
  const mfaEnabled = formData.get("mfaEnabled") === "true"
  const isActive = formData.get("isActive") === "true"

  try {
    const trpc = await serverTrpc()
    await trpc.users.create({
      name,
      email,
      password,
      role,
      mfaEnabled,
      isActive,
    })

    revalidatePath("/admin/users")
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

    const message = error instanceof Error ? error.message : "Failed to create user"
    return { error: message }
  }
}

export async function updateUserAction(
  userId: string,
  prevState: { error?: string; fieldErrors?: FieldErrors; success?: boolean } | null,
  formData: FormData
) {
  const name = formData.get("name") as string
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const role = formData.get("role") as string
  const mfaEnabled = formData.get("mfaEnabled") === "true"
  const isActive = formData.get("isActive") === "true"

  try {
    const trpc = await serverTrpc()
    await trpc.users.update({
      id: userId,
      name,
      email,
      password: password || undefined,
      role,
      mfaEnabled,
      isActive,
    })

    revalidatePath("/admin/users")
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

    const message = error instanceof Error ? error.message : "Failed to update user"
    return { error: message }
  }
}

export async function deleteUserAction(userId: string) {
  try {
    const trpc = await serverTrpc()
    await trpc.users.delete({ id: userId })

    revalidatePath("/admin/users")
    return { success: true }
  } catch (error: unknown) {
    if (error instanceof TRPCError) {
      return { error: error.message }
    }

    const message = error instanceof Error ? error.message : "Failed to delete user"
    return { error: message }
  }
}

export async function resetPasswordAction(userId: string, newPassword: string) {
  try {
    const trpc = await serverTrpc()
    await trpc.users.resetPassword({ id: userId, newPassword })

    revalidatePath("/admin/users")
    return { success: true }
  } catch (error: unknown) {
    if (error instanceof TRPCError) {
      return { error: error.message }
    }

    const message = error instanceof Error ? error.message : "Failed to reset password"
    return { error: message }
  }
}
