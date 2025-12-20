"use client"

import { useTranslation } from "react-i18next"
import { trpc } from "@/trpc/client"
import { RecentActivities, RecentActivitiesSkeleton } from "@/modules/dashboard/client"

export function DashboardActivities() {
  const { t } = useTranslation()
  const { data: activities, isLoading } = trpc.dashboard.recentActivities.useQuery()

  if (isLoading) {
    return <RecentActivitiesSkeleton />
  }

  return <RecentActivities activities={activities || []} />
}


