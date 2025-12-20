import { Suspense } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { MfaSetupQr } from "@/modules/auth/client/mfa-setup/mfa-setup-qr"
import { MfaSetupForm } from "@/modules/auth/client/mfa-setup/mfa-setup-form"
import { serverTrpc } from "@/trpc/server-caller"
import { redirect } from "next/navigation"
import { MfaSetupPageHeader } from "./mfa-setup-page-header"

export default async function MfaSetupPage() {
  const trpc = await serverTrpc();
  const userData = await trpc.auth.getCurrentUser(); 
  
  // If user needs to verify MFA (has MFA enabled and configured), redirect to verify
  if (userData?.shouldVerifyMfa === true) {
    return redirect("/mfa-verify");
  }

  // If MFA setup is not required (user doesn't have MFA enabled or already configured), redirect to admin
  if (!userData?.mfaSetupRequired) {
    return redirect("/admin");
  }

  // User has MFA enabled but not configured - allow setup
  const { qr } = await trpc.auth.generateMfaQr();

  return (
    <div className="flex justify-center items-center">
      <Card className="w-full max-w-sm backdrop-blur-sm bg-card/95 border-border/50 shadow-xl">
        <MfaSetupPageHeader />
        <CardContent>
          <MfaSetupQr qr={qr} />
          <Suspense>
            <MfaSetupForm />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  )
}
