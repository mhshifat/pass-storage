"use server"

import { redirect } from "next/navigation"
import { serverTrpc } from "@/trpc/server-caller"
import { isRedirectError } from "next/dist/client/components/redirect-error"
import { TRPCError } from "@trpc/server"

type FieldErrors = {
  [key: string]: string
}

export async function registerAction(
  prevState: { error?: string; fieldErrors?: FieldErrors } | null,
  formData: FormData
) {
  const name = formData.get("name") as string
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  try {
    const trpc = await serverTrpc()
    await trpc.auth.register({ name, email, password })
    redirect("/admin")
  } catch (error: unknown) {
    // Re-throw redirect errors
    if (isRedirectError(error)) {
      throw error
    }
    
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
    
    const message = error instanceof Error ? error.message : "Registration failed"
    return { error: message }
  }
}
