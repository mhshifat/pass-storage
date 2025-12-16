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
import { Search, Activity } from "lucide-react"

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

export function AuditLogsTable({ logs, actionTypes, onViewDetails }: AuditLogsTableProps) {
  const [searchQuery, setSearchQuery] = React.useState("")
  const [selectedAction, setSelectedAction] = React.useState("All Actions")

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.resource.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.ipAddress.includes(searchQuery)

    const matchesAction = selectedAction === "All Actions" || log.action === selectedAction

    return matchesSearch && matchesAction
  })

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
              <SelectTrigger className="w-[200px]">
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
          </div>
        </div>
      </CardHeader>
      <CardContent>
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
            {filteredLogs.map((log) => (
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
      </CardContent>
    </Card>
  )
}
