"use server"

import { revalidatePath } from "next/cache"
import { serverTrpc } from "@/trpc/server-caller"

export async function verifyMfaAction(_prevState: unknown, formData: FormData) {
  const code = formData.get("code") as string
  try {
    const trpc = await serverTrpc();
    await trpc.auth.verifyMfa({ code });
    revalidatePath("/admin")
    return { success: true }
  } catch (err) {
    const message = err instanceof Error ? err.message : "MFA verification failed";
    return { success: false, error: message }
  }
}
