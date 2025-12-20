import { Suspense } from "react"
import { caller } from "@/trpc/server"
import {
  StatsCards,
  RecentActivities,
  SecurityAlerts,
  SystemHealth,
  StatsCardsSkeleton,
  RecentActivitiesSkeleton,
  SecurityAlertsSkeleton,
  SystemHealthSkeleton,
} from "@/modules/dashboard/client"

async function DashboardStats() {
  const stats = await caller.dashboard.stats()

  const statsData = [
    {
      name: "Total Users",
      value: stats.users.total.toLocaleString(),
      change: stats.users.change,
      changeType: stats.users.changeType,
      icon: "Users",
    },
    {
      name: "Active Passwords",
      value: stats.passwords.total.toLocaleString(),
      change: stats.passwords.change,
      changeType: stats.passwords.changeType,
      icon: "Lock",
    },
    {
      name: "Teams",
      value: stats.teams.total.toLocaleString(),
      change: stats.teams.change,
      changeType: stats.teams.changeType,
      icon: "Shield",
    },
    {
      name: "Security Events",
      value: stats.securityEvents.total.toLocaleString(),
      change: stats.securityEvents.change,
      changeType: stats.securityEvents.changeType,
      icon: "AlertTriangle",
    },
  ]

  return <StatsCards stats={statsData} />
}

async function DashboardActivities() {
  const activities = await caller.dashboard.recentActivities()
  return <RecentActivities activities={activities} />
}

async function DashboardAlerts() {
  const alerts = await caller.dashboard.securityAlerts()
  return <SecurityAlerts alerts={alerts} />
}

async function DashboardHealth() {
  const metrics = await caller.dashboard.healthMetrics()
  return <SystemHealth metrics={metrics} />
}

export default function AdminDashboard() {
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Overview of your password management system
        </p>
      </div>

      {/* Stats Grid */}
      <Suspense fallback={<StatsCardsSkeleton />}>
        <DashboardStats />
      </Suspense>

      <div className="grid gap-6 lg:grid-cols-2">
        <Suspense fallback={<RecentActivitiesSkeleton />}>
          <DashboardActivities />
        </Suspense>
        <Suspense fallback={<SecurityAlertsSkeleton />}>
          <DashboardAlerts />
        </Suspense>
      </div>

      <Suspense fallback={<SystemHealthSkeleton />}>
        <DashboardHealth />
      </Suspense>
    </div>
  )
}
