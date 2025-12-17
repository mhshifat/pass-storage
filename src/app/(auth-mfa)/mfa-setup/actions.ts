"use server"

import { serverTrpc } from "@/trpc/server-caller"
import { revalidatePath } from "next/cache";

export async function setupMfaAction(_prevState: unknown, formData: FormData) {
  const code = formData.get("code") as string
  try {
    const trpc = await serverTrpc()
    await trpc.auth.setupMfa({ code });
    revalidatePath("/admin");
    return { success: true }
  } catch (err) {
    const message = err instanceof Error ? err.message : "MFA setup failed";
    return { success: false, error: message }
  }
}
