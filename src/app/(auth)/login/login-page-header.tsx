"use client"

import { useTranslation } from "react-i18next"
import { AuthCard } from "@/modules/auth/client/auth-card"

export function LoginPageHeader({ children }: { children: React.ReactNode }) {
  const { t } = useTranslation()

  return (
    <AuthCard
      title={t("auth.welcomeBack")}
      description={t("auth.loginDescription")}
    >
      {children}
    </AuthCard>
  )
}
