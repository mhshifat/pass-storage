"use server"

import { revalidatePath } from "next/cache"
import { serverTrpc } from "@/trpc/server-caller"
import { TRPCError } from "@trpc/server"

export async function checkPasswordBreachAction(passwordId: string) {
  try {
    const trpc = await serverTrpc()
    return await trpc.passwords.checkPasswordBreach({ passwordId })
  } catch (error: unknown) {
    if (error instanceof TRPCError) {
      throw new Error(error.message)
    }
    throw new Error("Failed to check password breach")
  }
}

export async function checkAllPasswordsBreachAction() {
  try {
    const trpc = await serverTrpc()
    const result = await trpc.passwords.checkAllPasswordsBreach()
    revalidatePath("/admin/passwords")
    revalidatePath("/admin/passwords/breaches")
    return result
  } catch (error: unknown) {
    if (error instanceof TRPCError) {
      throw new Error(error.message)
    }
    throw new Error("Failed to check all passwords for breaches")
  }
}

export async function resolveBreachAction(breachId: string) {
  try {
    const trpc = await serverTrpc()
    const result = await trpc.passwords.resolveBreach({ breachId })
    revalidatePath("/admin/passwords/breaches")
    return result
  } catch (error: unknown) {
    if (error instanceof TRPCError) {
      throw new Error(error.message)
    }
    throw new Error("Failed to resolve breach")
  }
}
