"use server"

import { revalidatePath } from "next/cache"
import { serverTrpc } from "@/trpc/server-caller"
import { TRPCError } from "@trpc/server"

export async function createRotationPolicyAction(data: {
  name: string
  description?: string
  rotationDays: number
  reminderDays: number
  autoRotate?: boolean
  requireApproval?: boolean
  isActive?: boolean
}) {
  try {
    const trpc = await serverTrpc()
    const result = await trpc.passwordRotation.createPolicy(data)
    revalidatePath("/admin/passwords/rotation")
    return { success: true, policy: result }
  } catch (error: unknown) {
    if (error instanceof TRPCError) {
      return { success: false, error: error.message }
    }
    return { success: false, error: "Failed to create rotation policy" }
  }
}

export async function updateRotationPolicyAction(
  id: string,
  data: {
    name?: string
    description?: string
    rotationDays?: number
    reminderDays?: number
    autoRotate?: boolean
    requireApproval?: boolean
    isActive?: boolean
  }
) {
  try {
    const trpc = await serverTrpc()
    const result = await trpc.passwordRotation.updatePolicy({ id, ...data })
    revalidatePath("/admin/passwords/rotation")
    return { success: true, policy: result }
  } catch (error: unknown) {
    if (error instanceof TRPCError) {
      return { success: false, error: error.message }
    }
    return { success: false, error: "Failed to update rotation policy" }
  }
}

export async function deleteRotationPolicyAction(id: string) {
  try {
    const trpc = await serverTrpc()
    await trpc.passwordRotation.deletePolicy({ id })
    revalidatePath("/admin/passwords/rotation")
    return { success: true }
  } catch (error: unknown) {
    if (error instanceof TRPCError) {
      return { success: false, error: error.message }
    }
    return { success: false, error: "Failed to delete rotation policy" }
  }
}

export async function assignPolicyToPasswordAction(passwordId: string, policyId: string | null) {
  try {
    const trpc = await serverTrpc()
    const result = await trpc.passwordRotation.assignPolicy({ passwordId, policyId })
    revalidatePath("/admin/passwords")
    return { success: true, password: result }
  } catch (error: unknown) {
    if (error instanceof TRPCError) {
      return { success: false, error: error.message }
    }
    return { success: false, error: "Failed to assign policy" }
  }
}

export async function scheduleRotationAction(passwordId: string, scheduledFor: string, notes?: string) {
  try {
    const trpc = await serverTrpc()
    const result = await trpc.passwordRotation.scheduleRotation({ passwordId, scheduledFor, notes })
    revalidatePath("/admin/passwords/rotation")
    return { success: true, rotation: result }
  } catch (error: unknown) {
    if (error instanceof TRPCError) {
      return { success: false, error: error.message }
    }
    return { success: false, error: "Failed to schedule rotation" }
  }
}

export async function completeRotationAction(rotationId: string, newPassword: string, notes?: string) {
  try {
    const trpc = await serverTrpc()
    const result = await trpc.passwordRotation.completeRotation({ rotationId, newPassword, notes })
    revalidatePath("/admin/passwords/rotation")
    revalidatePath("/admin/passwords")
    return { success: true, rotation: result }
  } catch (error: unknown) {
    if (error instanceof TRPCError) {
      return { success: false, error: error.message }
    }
    return { success: false, error: "Failed to complete rotation" }
  }
}

export async function cancelRotationAction(rotationId: string) {
  try {
    const trpc = await serverTrpc()
    const result = await trpc.passwordRotation.cancelRotation({ rotationId })
    revalidatePath("/admin/passwords/rotation")
    return { success: true, rotation: result }
  } catch (error: unknown) {
    if (error instanceof TRPCError) {
      return { success: false, error: error.message }
    }
    return { success: false, error: "Failed to cancel rotation" }
  }
}

export async function autoRotatePasswordAction(passwordId: string, notes?: string) {
  try {
    const trpc = await serverTrpc()
    const result = await trpc.passwordRotation.autoRotatePassword({ passwordId, notes })
    revalidatePath("/admin/passwords/rotation")
    revalidatePath("/admin/passwords")
    return { success: true, rotation: result.rotation, newPassword: result.newPassword }
  } catch (error: unknown) {
    if (error instanceof TRPCError) {
      return { success: false, error: error.message }
    }
    return { success: false, error: "Failed to auto-rotate password" }
  }
}

