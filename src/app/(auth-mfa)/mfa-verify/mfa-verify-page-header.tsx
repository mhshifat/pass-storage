"use client"

import { useTranslation } from "react-i18next"
import { CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

export function MfaVerifyPageHeader() {
  const { t } = useTranslation()

  return (
    <CardHeader>
      <CardTitle>{t("mfa.verifyTitle")}</CardTitle>
      <CardDescription>
        {t("mfa.verifyDescription")}
      </CardDescription>
    </CardHeader>
  )
}
