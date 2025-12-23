"use client"

import * as React from "react"
import { useTranslation } from "react-i18next"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Search, Activity, Group, X } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { AuditLogsPagination } from "./audit-logs-pagination"

interface AuditLog {
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

interface AuditLogsTableProps {
  logs: AuditLog[]
  actionTypes: string[]
  onViewDetails: (log: AuditLog) => void
  pagination: {
    page: number
    pageSize: number
    total: number
    totalPages: number
  }
  onPageChange: (page: number) => void
  search: string
  onSearchChange: (search: string) => void
  selectedAction: string
  onActionChange: (action: string | undefined) => void
  selectedStatus: "SUCCESS" | "FAILED" | "WARNING" | "BLOCKED" | undefined
  onStatusChange: (status: "SUCCESS" | "FAILED" | "WARNING" | "BLOCKED" | undefined) => void
}

type GroupByOption = "none" | "action" | "user" | "status" | "date"

export function AuditLogsTable({
  logs,
  actionTypes,
  onViewDetails,
  pagination,
  onPageChange,
  search,
  onSearchChange,
  selectedAction,
  onActionChange,
  selectedStatus,
  onStatusChange,
}: AuditLogsTableProps) {
  const { t } = useTranslation()
  const [groupBy, setGroupBy] = React.useState<GroupByOption>("none")
  const [debouncedSearch, setDebouncedSearch] = React.useState(search)

  // Debounce search
  React.useEffect(() => {
    const timer = setTimeout(() => {
      onSearchChange(debouncedSearch)
      onPageChange(1) // Reset to first page on search
    }, 300)

    return () => clearTimeout(timer)
  }, [debouncedSearch, onSearchChange, onPageChange])

  // Group logs (client-side grouping for display only)
  const groupedLogs = React.useMemo(() => {
    if (groupBy === "none") {
      return { "": logs }
    }

    const groups: Record<string, typeof logs> = {}

    logs.forEach((log) => {
      let key = ""
      switch (groupBy) {
        case "action":
          key = log.action
          break
        case "user":
          key = log.user
          break
        case "status":
          key = log.status
          break
        case "date":
          const date = new Date(log.timestamp)
          key = date.toISOString().split("T")[0]
          break
      }

      if (!groups[key]) {
        groups[key] = []
      }
      groups[key].push(log)
    })

    const sortedGroups: Record<string, typeof logs> = {}
    Object.keys(groups)
      .sort()
      .forEach((key) => {
        sortedGroups[key] = groups[key]
      })

    return sortedGroups
  }, [logs, groupBy])

  const statusOptions = React.useMemo(() => [
    { label: t("audit.allStatuses"), value: undefined },
    { label: t("audit.success"), value: "SUCCESS" as const },
    { label: t("audit.failed"), value: "FAILED" as const },
    { label: t("audit.warning"), value: "WARNING" as const },
    { label: t("audit.blocked"), value: "BLOCKED" as const },
  ], [t])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "success":
        return <Badge className="bg-green-100 text-green-800 border-green-200">{t("audit.success")}</Badge>
      case "failed":
        return <Badge className="bg-red-100 text-red-800 border-red-200">{t("audit.failed")}</Badge>
      case "warning":
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">{t("audit.warning")}</Badge>
      case "blocked":
        return <Badge className="bg-gray-100 text-gray-800 border-gray-200">{t("audit.blocked")}</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    // Use browser's locale for date formatting
    return date.toLocaleString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const hasActiveFilters = selectedAction !== "" || selectedStatus !== undefined || search

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-4 md:flex-row md:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t("audit.searchPlaceholder")}
              className="pl-8"
              value={debouncedSearch}
              onChange={(e) => setDebouncedSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            <Select value={selectedAction} onValueChange={onActionChange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder={t("audit.filterByAction")} />
              </SelectTrigger>
              <SelectContent>
                {actionTypes.map((action) => (
                  <SelectItem key={action} value={action}>
                    {action}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={selectedStatus || t("audit.allStatuses")}
              onValueChange={(value) => {
                onStatusChange(value === t("audit.allStatuses") ? undefined : value as "SUCCESS" | "FAILED" | "WARNING" | "BLOCKED")
                onPageChange(1)
              }}
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder={t("audit.filterByStatus")} />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((status) => (
                  <SelectItem key={status.label} value={status.value || t("audit.allStatuses")}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Group className="h-4 w-4" />
                  {t("audit.groupBy")}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>{t("audit.groupBy")}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setGroupBy("none")}>
                  {t("audit.groupByNone")} {groupBy === "none" && "✓"}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setGroupBy("action")}>
                  {t("audit.groupByAction")} {groupBy === "action" && "✓"}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setGroupBy("user")}>
                  {t("audit.groupByUser")} {groupBy === "user" && "✓"}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setGroupBy("status")}>
                  {t("audit.groupByStatus")} {groupBy === "status" && "✓"}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setGroupBy("date")}>
                  {t("audit.groupByDate")} {groupBy === "date" && "✓"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setDebouncedSearch("")
                  onSearchChange("")
                  onActionChange("")
                  onStatusChange(undefined)
                  onPageChange(1)
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {Object.keys(groupedLogs).length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            {t("audit.noLogsMatchingFilters")}
          </div>
        ) : (
          <>
            {Object.entries(groupedLogs).map(([groupKey, groupLogs]) => (
              <div key={groupKey} className={groupBy !== "none" ? "mb-6" : ""}>
                {groupBy !== "none" && (
                  <div className="mb-3 pb-2 border-b">
                    <h3 className="font-semibold text-sm">
                      {groupBy === "date"
                        ? new Date(groupKey).toLocaleDateString(undefined, {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })
                        : groupKey}
                      <span className="ml-2 text-muted-foreground font-normal">
                        ({t("audit.eventsCount", { count: groupLogs.length })})
                      </span>
                    </h3>
                  </div>
                )}
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t("audit.user")}</TableHead>
                      <TableHead>{t("audit.action")}</TableHead>
                      <TableHead>{t("audit.resource")}</TableHead>
                      <TableHead>{t("audit.ipAddress")}</TableHead>
                      <TableHead>{t("audit.time")}</TableHead>
                      <TableHead>{t("audit.status")}</TableHead>
                      <TableHead className="text-right">{t("audit.details")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {groupLogs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={log.avatar || undefined} alt={log.user} />
                              <AvatarFallback>
                                {log.user
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")
                                  .toUpperCase()
                                  .slice(0, 2)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium text-sm">
                                {log.user === "Unknown" ? t("audit.unknown") : log.user}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {log.userEmail === "N/A" ? t("audit.notAvailable") : log.userEmail}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Activity className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-medium">{log.action}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">{log.resource}</span>
                        </TableCell>
                        <TableCell>
                          <code className="text-xs bg-muted px-2 py-1 rounded">
                            {log.ipAddress === "N/A" ? t("audit.notAvailable") : log.ipAddress}
                          </code>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatTimestamp(log.timestamp)}
                        </TableCell>
                        <TableCell>{getStatusBadge(log.status)}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" onClick={() => onViewDetails(log)}>
                            {t("audit.view")}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ))}
            <div className="mt-6">
              <AuditLogsPagination
                currentPage={pagination.page}
                totalPages={pagination.totalPages}
                total={pagination.total}
                pageSize={pagination.pageSize}
                onPageChange={onPageChange}
              />
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
