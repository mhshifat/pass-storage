"use client"

import * as React from "react"
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
import { Search, Activity, Filter, Group, X } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

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
}

type GroupByOption = "none" | "action" | "user" | "status" | "date"

export function AuditLogsTable({ logs, actionTypes, onViewDetails }: AuditLogsTableProps) {
  const [searchQuery, setSearchQuery] = React.useState("")
  const [selectedAction, setSelectedAction] = React.useState("All Actions")
  const [selectedStatus, setSelectedStatus] = React.useState<string>("All Statuses")
  const [groupBy, setGroupBy] = React.useState<GroupByOption>("none")

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.resource.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.ipAddress.includes(searchQuery)

    const matchesAction = selectedAction === "All Actions" || log.action === selectedAction
    const matchesStatus = selectedStatus === "All Statuses" || log.status === selectedStatus.toLowerCase()

    return matchesSearch && matchesAction && matchesStatus
  })

  // Group logs
  const groupedLogs = React.useMemo(() => {
    if (groupBy === "none") {
      return { "": filteredLogs }
    }

    const groups: Record<string, typeof filteredLogs> = {}

    filteredLogs.forEach((log) => {
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
          // Group by date (YYYY-MM-DD)
          const date = new Date(log.timestamp)
          key = date.toISOString().split("T")[0]
          break
      }

      if (!groups[key]) {
        groups[key] = []
      }
      groups[key].push(log)
    })

    // Sort groups
    const sortedGroups: Record<string, typeof filteredLogs> = {}
    Object.keys(groups)
      .sort()
      .forEach((key) => {
        sortedGroups[key] = groups[key]
      })

    return sortedGroups
  }, [filteredLogs, groupBy])

  const statusOptions = ["All Statuses", "Success", "Failed", "Warning", "Blocked"]

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "success":
        return <Badge className="bg-green-100 text-green-800 border-green-200">Success</Badge>
      case "failed":
        return <Badge className="bg-red-100 text-red-800 border-red-200">Failed</Badge>
      case "warning":
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Warning</Badge>
      case "blocked":
        return <Badge className="bg-gray-100 text-gray-800 border-gray-200">Blocked</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-4 md:flex-row md:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by user, action, resource, or IP..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Select value={selectedAction} onValueChange={setSelectedAction}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by action" />
              </SelectTrigger>
              <SelectContent>
                {actionTypes.map((action) => (
                  <SelectItem key={action} value={action}>
                    {action}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Group className="h-4 w-4" />
                  Group By
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Group By</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setGroupBy("none")}>
                  None {groupBy === "none" && "✓"}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setGroupBy("action")}>
                  Action {groupBy === "action" && "✓"}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setGroupBy("user")}>
                  User {groupBy === "user" && "✓"}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setGroupBy("status")}>
                  Status {groupBy === "status" && "✓"}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setGroupBy("date")}>
                  Date {groupBy === "date" && "✓"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            {(selectedAction !== "All Actions" || selectedStatus !== "All Statuses" || searchQuery) && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setSearchQuery("")
                  setSelectedAction("All Actions")
                  setSelectedStatus("All Statuses")
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
            No logs found matching your filters
          </div>
        ) : (
          Object.entries(groupedLogs).map(([groupKey, groupLogs]) => (
            <div key={groupKey} className={groupBy !== "none" ? "mb-6" : ""}>
              {groupBy !== "none" && (
                <div className="mb-3 pb-2 border-b">
                  <h3 className="font-semibold text-sm">
                    {groupBy === "date"
                      ? new Date(groupKey).toLocaleDateString("en-US", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })
                      : groupKey}
                    <span className="ml-2 text-muted-foreground font-normal">
                      ({groupLogs.length} {groupLogs.length === 1 ? "event" : "events"})
                    </span>
                  </h3>
                </div>
              )}
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Resource</TableHead>
                    <TableHead>IP Address</TableHead>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Details</TableHead>
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
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium text-sm">{log.user}</div>
                            <div className="text-xs text-muted-foreground">{log.userEmail}</div>
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
                        <code className="text-xs bg-muted px-2 py-1 rounded">{log.ipAddress}</code>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{log.timestamp}</TableCell>
                      <TableCell>{getStatusBadge(log.status)}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" onClick={() => onViewDetails(log)}>
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}
