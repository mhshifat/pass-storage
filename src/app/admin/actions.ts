"use server"

import { redirect } from "next/navigation"
import { serverTrpc } from "@/trpc/server-caller"
import { isRedirectError } from "next/dist/client/components/redirect-error"

export async function logoutAction() {
  try {
    const trpc = await serverTrpc()
    await trpc.auth.logout()
    redirect("/login")
  } catch (error: unknown) {
    // Re-throw redirect errors
    if (isRedirectError(error)) {
      throw error
    }
    
    // For logout, we still redirect even on error
    redirect("/login")
  }
}

export async function getUserData() {
  try {
    const trpc = await serverTrpc()
    return await trpc.auth.getCurrentUser()
  } catch (error: unknown) {
    // If not authenticated or user not found, redirect to login
    redirect("/login")
  }
}
