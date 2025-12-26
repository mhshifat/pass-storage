import { Suspense } from "react"
import { ResetPasswordPage } from "@/modules/auth/client/reset-password-page"

function ResetPasswordPageContent() {
  return <ResetPasswordPage />
}

export default function ResetPasswordPageRoute() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    }>
      <ResetPasswordPageContent />
    </Suspense>
  )
}
