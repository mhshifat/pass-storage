"use server"

import { serverTrpc } from "@/trpc/server-caller"
import { TRPCError } from "@trpc/server"
import { revalidatePath } from "next/cache"

type FieldErrors = {
  [key: string]: string
}

export async function createTeamAction(
  prevState: { error?: string; fieldErrors?: FieldErrors; success?: boolean } | null,
  formData: FormData
) {
  const name = formData.get("name") as string
  const description = formData.get("description") as string

  try {
    const trpc = await serverTrpc()
    await trpc.teams.create({
      name,
      description: description || undefined,
    })

    revalidatePath("/admin/teams")
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

    const message = error instanceof Error ? error.message : "Failed to create team"
    return { error: message }
  }
}

export async function updateTeamAction(
  teamId: string,
  prevState: { error?: string; fieldErrors?: FieldErrors; success?: boolean } | null,
  formData: FormData
) {
  const name = formData.get("name") as string
  const description = formData.get("description") as string

  try {
    const trpc = await serverTrpc()
    await trpc.teams.update({
      id: teamId,
      name,
      description: description || undefined,
    })

    revalidatePath("/admin/teams")
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

    const message = error instanceof Error ? error.message : "Failed to update team"
    return { error: message }
  }
}

export async function deleteTeamAction(teamId: string) {
  try {
    const trpc = await serverTrpc()
    await trpc.teams.delete({ id: teamId })

    revalidatePath("/admin/teams")
    return { success: true }
  } catch (error: unknown) {
    if (error instanceof TRPCError) {
      return { error: error.message }
    }

    const message = error instanceof Error ? error.message : "Failed to delete team"
    return { error: message }
  }
}

