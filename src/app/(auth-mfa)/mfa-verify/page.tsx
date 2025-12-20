import { Suspense } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { MfaVerifyForm } from "@/modules/auth/client/mfa-verify/mfa-verify-form"
import { MfaVerifyPageHeader } from "./mfa-verify-page-header"
import { serverTrpc } from "@/trpc/server-caller"
import { redirect } from "next/navigation"

export default async function MfaVerifyPage() {
  const trpc = await serverTrpc();
  const userData = await trpc.auth.getCurrentUser();
  
  // Redirect to admin only if MFA is already verified (not required)
  // Allow access if MFA verification is needed OR if MFA is enabled but not yet verified
  if (userData?.session?.mfaVerified === true) {
    return redirect("/admin");
  }
  
  // If MFA is not enabled at all, redirect to admin
  if (!userData?.user?.mfaEnabled) {
    return redirect("/admin");
  }

  return (
    <div className="flex justify-center items-center">
      <Card className="w-full max-w-sm backdrop-blur-sm bg-card/95 border-border/50 shadow-xl">
        <MfaVerifyPageHeader />
        <CardContent>
          <Suspense>
            <MfaVerifyForm />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  )
}
