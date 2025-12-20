"use client"

import { useTranslation } from "react-i18next"
import { trpc } from "@/trpc/client"
import { SystemHealth, SystemHealthSkeleton } from "@/modules/dashboard/client"

export function DashboardHealth() {
  const { t } = useTranslation()
  const { data: metrics, isLoading } = trpc.dashboard.healthMetrics.useQuery()

  if (isLoading) {
    return <SystemHealthSkeleton />
  }

  return <SystemHealth metrics={metrics || []} />
}


