"use client"

import { useTranslation } from "react-i18next"
import { trpc } from "@/trpc/client"
import { SecurityAlerts, SecurityAlertsSkeleton } from "@/modules/dashboard/client"

export function DashboardAlerts() {
  const { t } = useTranslation()
  const { data: alerts, isLoading } = trpc.dashboard.securityAlerts.useQuery()

  if (isLoading) {
    return <SecurityAlertsSkeleton />
  }

  return <SecurityAlerts alerts={alerts || []} />
}


