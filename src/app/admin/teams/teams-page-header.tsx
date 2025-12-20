"use client"

import { useTranslation } from "react-i18next"

export function TeamsPageHeader() {
  const { t } = useTranslation()

  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight">{t("teams.title")}</h1>
      <p className="text-muted-foreground mt-1">
        {t("teams.description")}
      </p>
    </div>
  )
}


