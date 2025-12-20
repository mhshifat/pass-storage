"use client"

import { trpc } from "@/trpc/client"
import { SecurityAlerts, SecurityAlertsSkeleton } from "@/modules/dashboard/client"

export function DashboardAlerts() {
  const { data: alerts, isLoading } = trpc.dashboard.securityAlerts.useQuery()

  if (isLoading) {
    return <SecurityAlertsSkeleton />
  }

  return <SecurityAlerts alerts={alerts || []} />
}


