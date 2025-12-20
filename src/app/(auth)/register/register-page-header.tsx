"use client"

import { useTranslation } from "react-i18next"
import { AuthCard } from "@/modules/auth/client/auth-card"

export function RegisterPageHeader({ children }: { children: React.ReactNode }) {
  const { t } = useTranslation()

  return (
    <AuthCard
      title={t("auth.createAccount")}
      description={t("auth.registerDescription")}
    >
      {children}
    </AuthCard>
  )
}
