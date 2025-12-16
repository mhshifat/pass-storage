"use server"

import { revalidatePath } from "next/cache"
import { serverTrpc } from "@/trpc/server-caller"

export async function sendEmailAction(
  _prevState: unknown,
  formData: FormData
): Promise<{
  success?: boolean
  error?: string
}> {
  try {
    const userId = formData.get("userId") as string
    const subject = formData.get("subject") as string
    const message = formData.get("message") as string

    if (!userId || !subject || !message) {
      return { error: "Missing required fields" }
    }

    const caller = await serverTrpc()
    await caller.users.sendEmail({
      userId,
      subject,
      message,
    })

    revalidatePath("/admin/users")
    return { success: true }
  } catch (error) {
    console.error("Failed to send email:", error)
    return {
      error: error instanceof Error ? error.message : "Failed to send email",
    }
  }
}
