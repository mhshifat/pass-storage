"use client"

import * as React from "react"
import { useState } from "react"
import { useTranslation } from "react-i18next"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { trpc } from "@/trpc/client"
import { Loader2, ChevronLeft, ChevronRight, LogIn } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { parseUserAgent } from "@/lib/device-parser"

export function LoginHistory() {
  const { t } = useTranslation()
  const [page, setPage] = useState(1)
  const pageSize = 20

  const { data, isLoading, error } = trpc.users.getLoginHistory.useQuery({
    page,
    pageSize,
  })

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t("sessions.loginHistory")}</CardTitle>
          <CardDescription>{t("sessions.loginHistoryDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t("sessions.loginHistory")}</CardTitle>
          <CardDescription>{t("sessions.loginHistoryDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center text-destructive">
            <p>{error.message}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const logs = data?.logs || []
  const pagination = data?.pagination

  if (logs.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t("sessions.loginHistory")}</CardTitle>
          <CardDescription>{t("sessions.loginHistoryDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <LogIn className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">{t("sessions.noLoginHistory")}</h3>
            <p className="text-sm text-muted-foreground">
              {t("sessions.noLoginHistoryDescription")}
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("sessions.loginHistory")}</CardTitle>
        <CardDescription>{t("sessions.loginHistoryDescription")}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {logs.map((log) => {
            const deviceInfo = parseUserAgent(log.userAgent)

            return (
              <div
                key={log.id}
                className="flex items-start gap-4 p-4 rounded-lg border hover:bg-muted/50 transition-colors"
              >
                <div className="mt-1">
                  <LogIn className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="flex-1 space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">
                      {t("sessions.successfulLogin")}
                    </span>
                    <Badge variant={log.status === "SUCCESS" ? "default" : "destructive"} className="text-xs">
                      {log.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {deviceInfo.deviceName}
                    {deviceInfo.browser && ` • ${deviceInfo.browser}`}
                    {deviceInfo.os && ` • ${deviceInfo.os}`}
                  </p>
                  {log.ipAddress && (
                    <p className="text-xs text-muted-foreground">
                      {t("sessions.ipAddress")}: {log.ipAddress}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}
                  </p>
                </div>
              </div>
            )
          })}
        </div>

        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between mt-6">
            <p className="text-sm text-muted-foreground">
              {t("sessions.showing", {
                from: (pagination.page - 1) * pagination.pageSize + 1,
                to: Math.min(pagination.page * pagination.pageSize, pagination.total),
                total: pagination.total,
              })}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                disabled={page === pagination.totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

