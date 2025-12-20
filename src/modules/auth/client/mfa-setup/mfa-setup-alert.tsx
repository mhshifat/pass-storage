"use client"

import { useTranslation } from "react-i18next"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

export function MfaSetupAlert({ error, success }: { error: string | null; success: boolean }) {
  const { t } = useTranslation()
  
  if (error)
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  if (success)
    return (
      <Alert>
        <AlertDescription>{t("mfa.setupComplete")}</AlertDescription>
      </Alert>
    )
  return null
}
