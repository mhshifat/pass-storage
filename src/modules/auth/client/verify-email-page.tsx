"use client"

import * as React from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { useTranslation } from "react-i18next"
import { trpc } from "@/trpc/client"
import { AuthCard } from "./auth-card"
import { Button } from "@/components/ui/button"
import { CheckCircle2, XCircle, Loader2, Mail } from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"

export function VerifyEmailPage() {
  const { t } = useTranslation()
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get("token")
  const [verificationStatus, setVerificationStatus] = React.useState<"pending" | "success" | "error">("pending")

  const verifyMutation = trpc.auth.verifyEmail.useMutation({
    onSuccess: () => {
      setVerificationStatus("success")
      toast.success(t("auth.emailVerification.success"))
      // Redirect to login after 3 seconds
      setTimeout(() => {
        router.push("/login")
      }, 3000)
    },
    onError: (error) => {
      setVerificationStatus("error")
      toast.error(error.message || t("auth.emailVerification.error"))
    },
  })

  React.useEffect(() => {
    if (token) {
      verifyMutation.mutate({ token })
    } else {
      setVerificationStatus("error")
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token])

  return (
    <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-background via-background to-muted p-4">
      <AuthCard className="w-full">
        <div className="space-y-6 text-center px-5">
          {verificationStatus === "pending" && (
            <>
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">{t("auth.emailVerification.verifying")}</h1>
                <p className="mt-2 text-muted-foreground">
                  {t("auth.emailVerification.verifyingDescription")}
                </p>
              </div>
            </>
          )}

          {verificationStatus === "success" && (
            <>
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
                <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">{t("auth.emailVerification.successTitle")}</h1>
                <p className="mt-2 text-muted-foreground">
                  {t("auth.emailVerification.successDescription")}
                </p>
              </div>
              <div className="pt-4">
                <Button asChild className="w-full">
                  <Link href="/login">{t("auth.login")}</Link>
                </Button>
              </div>
            </>
          )}

          {verificationStatus === "error" && (
            <>
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
                <XCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">{t("auth.emailVerification.errorTitle")}</h1>
                <p className="mt-2 text-muted-foreground">
                  {t("auth.emailVerification.errorDescription")}
                </p>
              </div>
              <div className="space-y-2 pt-4">
                <Button asChild variant="outline" className="w-full">
                  <Link href="/login">{t("auth.login")}</Link>
                </Button>
                <Button asChild variant="ghost" className="w-full">
                  <Link href="/register">{t("auth.register")}</Link>
                </Button>
              </div>
            </>
          )}
        </div>
      </AuthCard>
    </div>
  )
}
