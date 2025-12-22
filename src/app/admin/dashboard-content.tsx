"use client"

import { useTranslation } from "react-i18next"
import { DashboardStats } from "./dashboard-stats"
import { DashboardActivities } from "./dashboard-activities"
import { DashboardAlerts } from "./dashboard-alerts"
import { DashboardHealth } from "./dashboard-health"
import { GettingStartedChecklist, StartTourButton } from "@/modules/onboarding/client"

export function DashboardContent() {
  const { t } = useTranslation()

  return (
    <div className="p-6 space-y-6" id="tour-dashboard">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t("dashboard.title")}</h1>
          <p className="text-muted-foreground mt-1">
            {t("dashboard.description")}
          </p>
        </div>
        <StartTourButton />
      </div>

      {/* Getting Started Checklist */}
      <GettingStartedChecklist />

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


