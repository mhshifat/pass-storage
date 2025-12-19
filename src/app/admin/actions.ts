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

/**
 * @deprecated Use getCurrentUser from @/lib/current-user instead
 * This function is kept for backward compatibility
 */
export async function getUserData() {
  try {
    const trpc = await serverTrpc();
    const { user, session, shouldVerifyMfa } = await trpc.auth.getCurrentUser();
    
    if (shouldVerifyMfa === true) {
      redirect("/mfa-verify");
    }

    return {
      ...user,
      ...session,
      mfaSecret: undefined, // Hide MFA secret
    }
  } catch (error: unknown) {
    // Re-throw redirect errors
    if (isRedirectError(error)) {
      throw error
    }

    // If not authenticated or user not found, redirect to login
    redirect("/login")
  }
}
