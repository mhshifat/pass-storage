"use client"

import * as React from "react"
import { useTranslation } from "react-i18next"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AuditLogsTable, LogDetailsDialog, AuditLogsEmptyState } from "@/modules/audit-logs/client"
import { trpc } from "@/trpc/client"

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

export function AuditLogsContent() {
  const { t } = useTranslation()
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = React.useState(false)
  const [selectedLog, setSelectedLog] = React.useState<AuditLog | null>(null)
  const [page, setPage] = React.useState(1)
  const [search, setSearch] = React.useState("")
  const [action, setAction] = React.useState<string>(t("audit.allActions"))
  const [status, setStatus] = React.useState<"SUCCESS" | "FAILED" | "WARNING" | "BLOCKED" | undefined>(undefined)

  const { data: statsData } = trpc.auditLogs.stats.useQuery({ days: 30 })
  const { data: actionTypesData } = trpc.auditLogs.getActionTypes.useQuery()
  const { data: logsData, isLoading } = trpc.auditLogs.list.useQuery({
    page,
    pageSize: 20,
    search: search || undefined,
    action: action === t("audit.allActions") ? undefined : action,
    status,
  })

  const handleViewDetails = (log: AuditLog) => {
    setSelectedLog(log)
    setIsDetailsDialogOpen(true)
  }

  const handleExport = () => {
    // TODO: Implement export functionality
    console.log("Export logs")
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t("audit.title")}</h1>
          <p className="text-muted-foreground mt-1">
            {t("audit.description")}
          </p>
        </div>
        <Button onClick={handleExport}>
          <Download className="mr-2 h-4 w-4" />
          {t("audit.exportLogs")}
        </Button>
      </div>

      {/* Stats Cards */}
      {statsData && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">{t("audit.totalEvents")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statsData.totalEvents.value.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                {statsData.totalEvents.labelKey 
                  ? t(statsData.totalEvents.labelKey, statsData.totalEvents.labelParams || {})
                  : statsData.totalEvents.label}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">{t("audit.failedLogins")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statsData.failedLogins.value.toLocaleString()}</div>
              <p className={`text-xs ${statsData.failedLogins.changeType === "negative" ? "text-red-600" : "text-green-600"}`}>
                {t("audit.fromLastPeriod", { change: statsData.failedLogins.change })}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">{t("audit.passwordChanges")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statsData.passwordChanges.value.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                {statsData.passwordChanges.labelKey 
                  ? t(statsData.passwordChanges.labelKey, statsData.passwordChanges.labelParams || {})
                  : statsData.passwordChanges.label}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">{t("audit.securityAlerts")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statsData.securityAlerts.value.toLocaleString()}</div>
              <p className={`text-xs ${statsData.securityAlerts.changeType === "negative" ? "text-red-600" : "text-green-600"}`}>
                {t("audit.fromLastPeriod", { change: statsData.securityAlerts.change })}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Table */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-muted-foreground">{t("audit.loading")}</div>
        </div>
      ) : logsData && logsData.logs.length > 0 ? (
        <AuditLogsTable
          logs={logsData.logs}
          actionTypes={actionTypesData || []}
          onViewDetails={handleViewDetails}
          pagination={logsData.pagination}
          onPageChange={setPage}
          search={search}
          onSearchChange={setSearch}
          selectedAction={action}
          onActionChange={(value) => {
            setAction(value)
            setPage(1)
          }}
          selectedStatus={status}
          onStatusChange={setStatus}
        />
      ) : (
        <AuditLogsEmptyState />
      )}

      <LogDetailsDialog
        open={isDetailsDialogOpen}
        onOpenChange={setIsDetailsDialogOpen}
        log={selectedLog}
      />
    </div>
  )
}
