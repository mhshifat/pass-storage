"use client"

import { useTranslation } from "react-i18next"
import { Card, CardContent } from "@/components/ui/card"

export function AuditLogsEmptyState() {
  const { t } = useTranslation()
  
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-16">
        <svg
          width="200"
          height="200"
          viewBox="0 0 200 200"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="mb-4"
        >
          <circle cx="100" cy="100" r="80" className="fill-muted" />
          <rect x="60" y="70" width="80" height="60" rx="4" className="fill-muted-foreground/20" />
          <rect x="70" y="80" width="60" height="8" rx="2" className="fill-muted-foreground/40" />
          <rect x="70" y="95" width="45" height="8" rx="2" className="fill-muted-foreground/40" />
          <rect x="70" y="110" width="50" height="8" rx="2" className="fill-muted-foreground/40" />
          <circle cx="85" cy="125" r="3" className="fill-muted-foreground/40" />
          <circle cx="95" cy="125" r="3" className="fill-muted-foreground/40" />
          <circle cx="105" cy="125" r="3" className="fill-muted-foreground/40" />
          <path
            d="M50 50 L30 70 L50 90"
            className="stroke-muted-foreground/40"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
          <path
            d="M150 50 L170 70 L150 90"
            className="stroke-muted-foreground/40"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        </svg>
        <h3 className="text-lg font-semibold mb-2">{t("audit.noLogs")}</h3>
        <p className="text-muted-foreground text-center max-w-md">
          {t("audit.noLogsDescription")}
        </p>
      </CardContent>
    </Card>
  )
}
