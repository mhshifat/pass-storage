"use client"

import { useTranslation } from "react-i18next"
import { CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

export function MfaSetupPageHeader() {
  const { t } = useTranslation()

  return (
    <CardHeader>
      <CardTitle>{t("mfa.setupTitle")}</CardTitle>
      <CardDescription>
        {t("mfa.setupDescription")}
      </CardDescription>
    </CardHeader>
  )
}
