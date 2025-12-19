"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AuditLogsTable, LogDetailsDialog } from "@/modules/audit-logs/client"

type AuditLog = {
  id: string
  user: string
  userEmail: string
  action: string
  resource: string
  ipAddress: string
  timestamp: string
  status: "success" | "failed" | "warning" | "blocked"
  avatar: string | null
  details?: Record<string, unknown>
}

const auditLogs: AuditLog[] = [
  {
    id: "1",
    user: "John Doe",
    userEmail: "john.doe@company.com",
    action: "Created Password",
    resource: "AWS Production Credentials",
    ipAddress: "192.168.1.100",
    timestamp: "2024-12-15 14:32:15",
    status: "success" as const,
    avatar: "/avatars/01.png" as string | null,
    details: {
      passwordName: "AWS Production Credentials",
      folder: "Infrastructure",
      sharedWith: ["DevOps Team"],
    },
  },
  {
    id: "2",
    user: "Jane Smith",
    userEmail: "jane.smith@company.com",
    action: "Shared Password",
    resource: "Database Admin",
    ipAddress: "192.168.1.105",
    timestamp: "2024-12-15 14:25:42",
    status: "success" as const,
    avatar: "/avatars/02.png" as string | null,
    details: {
      passwordName: "Database Admin",
      sharedWith: ["Mike Johnson", "Sarah Williams"],
    },
  },
  {
    id: "3",
    user: "Mike Johnson",
    userEmail: "mike.johnson@company.com",
    action: "Failed Login",
    resource: "Login Attempt",
    ipAddress: "203.0.113.42",
    timestamp: "2024-12-15 14:15:28",
    status: "failed" as const,
    avatar: "/avatars/03.png" as string | null,
    details: {
      reason: "Invalid password",
      attemptCount: 3,
    },
  },
  {
    id: "4",
    user: "Sarah Williams",
    userEmail: "sarah.williams@company.com",
    action: "Updated Password",
    resource: "API Keys - Production",
    ipAddress: "192.168.1.120",
    timestamp: "2024-12-15 13:45:10",
    status: "success" as const,
    avatar: "/avatars/04.png" as string | null,
    details: {
      passwordName: "API Keys - Production",
      changeType: "Password rotation",
    },
  },
  {
    id: "5",
    user: "Tom Brown",
    userEmail: "tom.brown@company.com",
    action: "Added User to Team",
    resource: "DevOps Team",
    ipAddress: "192.168.1.110",
    timestamp: "2024-12-15 13:20:05",
    status: "success" as const,
    avatar: "/avatars/05.png" as string | null,
    details: {
      teamName: "DevOps Team",
      addedUser: "Alice Cooper",
    },
  },
  {
    id: "6",
    user: "Admin User",
    userEmail: "admin@company.com",
    action: "Changed Security Settings",
    resource: "MFA Configuration",
    ipAddress: "192.168.1.1",
    timestamp: "2024-12-15 12:30:00",
    status: "success" as const,
    avatar: "/avatars/06.png" as string | null,
    details: {
      setting: "Enforce MFA for all users",
      oldValue: "false",
      newValue: "true",
    },
  },
  {
    id: "7",
    user: "Jane Smith",
    userEmail: "jane.smith@company.com",
    action: "Deleted Password",
    resource: "Old API Key",
    ipAddress: "192.168.1.105",
    timestamp: "2024-12-15 11:15:33",
    status: "warning" as const,
    avatar: "/avatars/02.png" as string | null,
    details: {
      passwordName: "Old API Key",
      reason: "No longer needed",
    },
  },
  {
    id: "8",
    user: "Unknown",
    userEmail: "attacker@external.com",
    action: "Blocked Login Attempt",
    resource: "Suspicious Activity",
    ipAddress: "45.33.21.96",
    timestamp: "2024-12-15 10:45:18",
    status: "blocked" as const,
    avatar: null,
    details: {
      reason: "IP address on blocklist",
      blockedAt: "Firewall level",
    },
  },
]

const actionTypes = [
  "All Actions",
  "Created Password",
  "Updated Password",
  "Deleted Password",
  "Shared Password",
  "Failed Login",
  "Added User to Team",
  "Changed Security Settings",
  "Blocked Login Attempt",
]

export default function AuditLogsPage() {
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = React.useState(false)
  const [selectedLog, setSelectedLog] = React.useState<AuditLog | null>(null)

  const handleViewDetails = (log: AuditLog) => {
    setSelectedLog(log)
    setIsDetailsDialogOpen(true)
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Audit Logs</h1>
          <p className="text-muted-foreground mt-1">
            Track all system activities and security events
          </p>
        </div>
        <Button>
          <Download className="mr-2 h-4 w-4" />
          Export Logs
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Events</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12,847</div>
            <p className="text-xs text-muted-foreground">Last 30 days</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Failed Logins</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">127</div>
            <p className="text-xs text-red-600">+12% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Password Changes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,234</div>
            <p className="text-xs text-muted-foreground">Last 30 days</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Security Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">23</div>
            <p className="text-xs text-muted-foreground">Requires attention</p>
          </CardContent>
        </Card>
      </div>

      <AuditLogsTable logs={auditLogs} actionTypes={actionTypes} onViewDetails={handleViewDetails} />

      <LogDetailsDialog
        open={isDetailsDialogOpen}
        onOpenChange={setIsDetailsDialogOpen}
        log={selectedLog}
      />
    </div>
  )
}
