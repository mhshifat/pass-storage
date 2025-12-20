"use client"

import { useTranslation } from "react-i18next"
import Image from "next/image"

export function MfaSetupQr({ qr }: { qr: string | null }) {
  const { t } = useTranslation()
  
  if (!qr) return null
  return (
        <div>
            <Image width={228} height={228} src={qr} alt={t("mfa.qrCodeAlt")} className="mx-auto mb-4" />
        </div>
    )
}
