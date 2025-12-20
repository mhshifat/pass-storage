import { Suspense } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { MfaSetupQr } from "@/modules/auth/client/mfa-setup/mfa-setup-qr"
import { MfaSetupForm } from "@/modules/auth/client/mfa-setup/mfa-setup-form"
import { serverTrpc } from "@/trpc/server-caller"
import { redirect } from "next/navigation"
import { MfaSetupPageHeader } from "./mfa-setup-page-header"

export default async function MfaSetupPage() {
  const trpc = await serverTrpc();
  const user = await trpc.auth.getCurrentUser(); 
  const { qr } = await trpc.auth.generateMfaQr();
  
  if (user?.shouldVerifyMfa === true) {
    return redirect("/mfa-verify");
  }

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
