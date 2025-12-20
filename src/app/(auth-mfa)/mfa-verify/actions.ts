"use server"

import { revalidatePath } from "next/cache"
import { serverTrpc } from "@/trpc/server-caller"

export async function verifyMfaAction(_prevState: unknown, formData: FormData) {
  const code = formData.get("code") as string
  const useRecoveryCode = formData.get("useRecoveryCode") === "true"
  
  try {
    const trpc = await serverTrpc();
    
    if (useRecoveryCode) {
      await trpc.auth.verifyRecoveryCode({ code });
    } else {
      await trpc.auth.verifyMfa({ code });
    }
    
    revalidatePath("/admin")
    return { success: true }
  } catch (err) {
    const message = err instanceof Error ? err.message : "MFA verification failed";
    return { success: false, error: message }
  }
}
