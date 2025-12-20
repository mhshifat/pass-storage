"use client"

import { useTranslation } from "react-i18next"

export function SecuritySettingsPageHeader() {
  const { t } = useTranslation()
  
  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight">{t("settings.security.title")}</h1>
      <p className="text-muted-foreground mt-1">{t("settings.security.description")}</p>
    </div>
  )
}
