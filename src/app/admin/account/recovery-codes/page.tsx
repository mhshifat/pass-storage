"use client"

import { useTranslation } from "react-i18next"
import { RecoveryCodesManager } from "@/modules/auth/client/recovery-codes/recovery-codes-manager"

export default function RecoveryCodesPage() {
  const { t } = useTranslation()

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t("mfa.recoveryCodes")}</h1>
        <p className="text-muted-foreground mt-1">
          {t("mfa.recoveryCodesDescription")}
        </p>
      </div>

      <RecoveryCodesManager />
    </div>
  )
}
