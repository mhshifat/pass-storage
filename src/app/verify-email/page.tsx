import { Suspense } from "react"
import { VerifyEmailPage } from "@/modules/auth/client/verify-email-page"

function VerifyEmailPageContent() {
  return <VerifyEmailPage />
}

export default function VerifyEmailPageRoute() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    }>
      <VerifyEmailPageContent />
    </Suspense>
  )
}

