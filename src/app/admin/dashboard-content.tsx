"use client"

import { useTranslation } from "react-i18next"
import {
  StatsCardsSkeleton,
  RecentActivitiesSkeleton,
  SecurityAlertsSkeleton,
  SystemHealthSkeleton,
} from "@/modules/dashboard/client"
import { DashboardStats } from "./dashboard-stats"
import { DashboardActivities } from "./dashboard-activities"
import { DashboardAlerts } from "./dashboard-alerts"
import { DashboardHealth } from "./dashboard-health"

export function DashboardContent() {
  const { t } = useTranslation()

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t("dashboard.title")}</h1>
        <p className="text-muted-foreground mt-1">
          {t("dashboard.description")}
        </p>
      </div>

      {/* Stats Grid */}
      <DashboardStats />

      <div className="grid gap-6 lg:grid-cols-2">
        <DashboardActivities />
        <DashboardAlerts />
      </div>

      <DashboardHealth />
    </div>
  )
}


