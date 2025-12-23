"use client"

import * as React from "react"
import { useTranslation } from "react-i18next"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Activity, Play, Pause } from "lucide-react"
import { trpc } from "@/trpc/client"
import { format } from "date-fns"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"

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

export function AuditLogStreaming() {
  const { t } = useTranslation()
  const [isStreaming, setIsStreaming] = React.useState(false)
  const [pollInterval, setPollInterval] = React.useState(5) // seconds
  const [logs, setLogs] = React.useState<AuditLog[]>([])
  const [lastTimestamp, setLastTimestamp] = React.useState<Date | null>(null)

  const { data: recentLogsData, refetch } = trpc.auditLogs.getRecentLogs.useQuery(
    {
      since: lastTimestamp || undefined,
      limit: 50,
    },
    {
      enabled: isStreaming,
      refetchInterval: isStreaming ? pollInterval * 1000 : false,
    }
  )

  React.useEffect(() => {
    if (recentLogsData) {
      // Add new logs to the beginning of the list
      const newLogs = recentLogsData.logs.filter(
        (log) => !logs.some((existingLog) => existingLog.id === log.id)
      )
      if (newLogs.length > 0) {
        setLogs((prev) => [...newLogs, ...prev].slice(0, 100)) // Keep last 100 logs
        setLastTimestamp(recentLogsData.latestTimestamp)
      }
    }
  }, [recentLogsData])

  const handleToggleStreaming = () => {
    if (!isStreaming) {
      // Start streaming - get initial logs
      refetch().then((result) => {
        if (result.data) {
          setLogs(result.data.logs)
          setLastTimestamp(result.data.latestTimestamp)
        }
      })
    }
    setIsStreaming(!isStreaming)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "success":
        return "bg-green-500"
      case "failed":
        return "bg-red-500"
      case "warning":
        return "bg-yellow-500"
      case "blocked":
        return "bg-red-700"
      default:
        return "bg-gray-500"
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              {t("audit.streaming.title")}
            </CardTitle>
            <CardDescription>
              {t("audit.streaming.description")}
            </CardDescription>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Label htmlFor="poll-interval" className="text-sm">
                {t("audit.streaming.pollInterval")}
              </Label>
              <select
                id="poll-interval"
                value={pollInterval}
                onChange={(e) => setPollInterval(Number(e.target.value))}
                className="px-2 py-1 border rounded-md text-sm"
                disabled={isStreaming}
              >
                <option value="1">1 {t("audit.streaming.seconds")}</option>
                <option value="5">5 {t("audit.streaming.seconds")}</option>
                <option value="10">10 {t("audit.streaming.seconds")}</option>
                <option value="30">30 {t("audit.streaming.seconds")}</option>
                <option value="60">60 {t("audit.streaming.seconds")}</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                id="streaming"
                checked={isStreaming}
                onCheckedChange={handleToggleStreaming}
              />
              <Label htmlFor="streaming" className="cursor-pointer">
                {isStreaming ? (
                  <>
                    <Pause className="inline h-4 w-4 mr-1" />
                    {t("audit.streaming.pause")}
                  </>
                ) : (
                  <>
                    <Play className="inline h-4 w-4 mr-1" />
                    {t("audit.streaming.start")}
                  </>
                )}
              </Label>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[600px]">
          <div className="space-y-2">
            {logs.length > 0 ? (
              logs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-center gap-4 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                >
                  <div
                    className={`w-2 h-2 rounded-full ${getStatusColor(log.status)}`}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{log.user}</span>
                      <Badge variant="outline" className="text-xs">
                        {log.action}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {log.resource}
                      </Badge>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {format(new Date(log.timestamp), "PPp")} • {log.ipAddress}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                {isStreaming
                  ? t("audit.streaming.waitingForLogs")
                  : t("audit.streaming.notStarted")}
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
