import { Suspense } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { MfaVerifyForm } from "@/modules/auth/client/mfa-verify/mfa-verify-form"

export default async function MfaVerifyPage() {
  return (
    <div className="flex justify-center items-center min-h-screen">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Verify Multi-Factor Authentication</CardTitle>
          <CardDescription>
            Enter the 6-digit code from your authenticator app to continue.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense>
            <MfaVerifyForm />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  )
}
