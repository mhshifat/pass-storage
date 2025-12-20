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
import { DashboardContent } from "./dashboard-content"

export default function AdminDashboard() {
  return <DashboardContent />
}
