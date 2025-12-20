"use client"

import { useTranslation } from "react-i18next"

export function MfaCredentialsPageHeader() {
  const { t } = useTranslation()
  
  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight">{t("settings.mfaCredentials")}</h1>
      <p className="text-muted-foreground mt-1">{t("settings.mfaCredentialsDescription")}</p>
    </div>
  )
}
