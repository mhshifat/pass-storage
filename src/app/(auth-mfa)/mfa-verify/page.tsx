import { Suspense } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { MfaVerifyForm } from "@/modules/auth/client/mfa-verify/mfa-verify-form"
import { MfaVerifyPageHeader } from "./mfa-verify-page-header"

export default async function MfaVerifyPage() {
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
