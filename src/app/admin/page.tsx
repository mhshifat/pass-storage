"use client"

import { Users, Lock, Shield, AlertTriangle } from "lucide-react"
import { StatsCards, RecentActivities, SecurityAlerts, SystemHealth } from "@/modules/dashboard/client"

const stats = [
  {
    name: "Total Users",
    value: "1,247",
    change: "+12%",
    changeType: "positive" as const,
    icon: Users,
  },
  {
    name: "Active Passwords",
    value: "4,891",
    change: "+8%",
    changeType: "positive" as const,
    icon: Lock,
  },
  {
    name: "Groups",
    value: "34",
    change: "+2",
    changeType: "positive" as const,
    icon: Shield,
  },
  {
    name: "Security Events",
    value: "23",
    change: "-15%",
    changeType: "negative" as const,
    icon: AlertTriangle,
  },
]

const recentActivities = [
  {
    user: "John Doe",
    action: "Created new password",
    resource: "AWS Production",
    time: "2 minutes ago",
    avatar: "/avatars/01.png",
  },
  {
    user: "Jane Smith",
    action: "Shared password",
    resource: "Database Credentials",
    time: "15 minutes ago",
    avatar: "/avatars/02.png",
  },
  {
    user: "Mike Johnson",
    action: "Updated password",
    resource: "Email Account",
    time: "1 hour ago",
    avatar: "/avatars/03.png",
  },
  {
    user: "Sarah Williams",
    action: "Deleted password",
    resource: "Old API Key",
    time: "2 hours ago",
    avatar: "/avatars/04.png",
  },
  {
    user: "Tom Brown",
    action: "Added user to group",
    resource: "DevOps Team",
    time: "3 hours ago",
    avatar: "/avatars/05.png",
  },
]

const securityAlerts = [
  {
    type: "warning" as const,
    message: "3 passwords will expire in the next 7 days",
    time: "Today",
  },
  {
    type: "info" as const,
    message: "System backup completed successfully",
    time: "Yesterday",
  },
  {
    type: "warning" as const,
    message: "Unusual login activity detected for user@example.com",
    time: "2 days ago",
  },
]

const healthMetrics = [
  {
    label: "Password Strength",
    status: "Good",
    percentage: 75,
    description: "75% of passwords meet security requirements",
    color: "bg-green-600",
  },
  {
    label: "MFA Adoption",
    status: "Excellent",
    percentage: 92,
    description: "92% of users have MFA enabled",
    color: "bg-green-600",
  },
  {
    label: "Active Sessions",
    status: "Normal",
    percentage: 60,
    description: "348 active sessions currently",
    color: "bg-blue-600",
  },
]

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
      <StatsCards stats={stats} />

      <div className="grid gap-6 lg:grid-cols-2">
        <RecentActivities activities={recentActivities} />
        <SecurityAlerts alerts={securityAlerts} />
      </div>

      <SystemHealth metrics={healthMetrics} />
    </div>
  )
}
