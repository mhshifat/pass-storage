"use client"

import * as React from "react"
import { useTranslation } from "react-i18next"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { trpc } from "@/trpc/client"
import { Loader2, Shield, CheckCircle2, XCircle, AlertTriangle } from "lucide-react"

export function SecurityPosture() {
  const { t } = useTranslation()
  const { data, isLoading } = trpc.insights.securityPosture.useQuery({})

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t("insights.securityPosture.title")}</CardTitle>
          <CardDescription>
            {t("insights.securityPosture.description")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!data) {
    return null
  }

  const getStatusIcon = () => {
    switch (data.status) {
      case "excellent":
        return <CheckCircle2 className="h-5 w-5 text-green-600" />
      case "good":
        return <Shield className="h-5 w-5 text-blue-600" />
      case "fair":
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />
      case "poor":
        return <XCircle className="h-5 w-5 text-red-600" />
      default:
        return <Shield className="h-5 w-5" />
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {getStatusIcon()}
          {t("insights.securityPosture.title")}
        </CardTitle>
        <CardDescription>
          {t("insights.securityPosture.description")}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Score Display */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">
              {t("insights.securityPosture.overallScore")}
            </span>
            <Badge variant="secondary" className="text-lg font-bold">
              {data.score}/100
            </Badge>
          </div>
          <Progress value={data.score} className="h-3" />
          <p className="text-xs text-muted-foreground">
            {t(`insights.securityPosture.status.${data.status}`)}
          </p>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* User Security */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold">
              {t("insights.securityPosture.userSecurity")}
            </h4>
            <div className="space-y-3">
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    {t("insights.securityPosture.totalUsers")}
                  </span>
                  <span className="text-sm font-medium">
                    {data.metrics.users.total}
                  </span>
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    {t("insights.securityPosture.usersWithMFA")}
                  </span>
                  <span className="text-sm font-medium">
                    {data.metrics.users.withMFA} (
                    {Math.round(data.metrics.users.mfaAdoptionRate)}%)
                  </span>
                </div>
                <Progress
                  value={data.metrics.users.mfaAdoptionRate}
                  className="h-2"
                />
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    {t("insights.securityPosture.activeUsers")}
                  </span>
                  <span className="text-sm font-medium">
                    {data.metrics.users.active}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Authentication */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold">
              {t("insights.securityPosture.authentication")}
            </h4>
            <div className="space-y-3">
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    {t("insights.securityPosture.successfulLogins")}
                  </span>
                  <span className="text-sm font-medium text-green-600">
                    {data.metrics.authentication.successfulLogins}
                  </span>
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    {t("insights.securityPosture.failedLogins")}
                  </span>
                  <span className="text-sm font-medium text-red-600">
                    {data.metrics.authentication.failedLogins}
                  </span>
                </div>
                <Progress
                  value={100 - data.metrics.authentication.failureRate}
                  className="h-2"
                />
                <p className="text-xs text-muted-foreground">
                  {t("insights.securityPosture.failureRate", {
                    rate: Math.round(data.metrics.authentication.failureRate),
                  })}
                </p>
              </div>
            </div>
          </div>

          {/* Threats */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold">
              {t("insights.securityPosture.threats")}
            </h4>
            <div className="space-y-3">
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    {t("insights.securityPosture.totalThreats")}
                  </span>
                  <span className="text-sm font-medium">
                    {data.metrics.threats.total}
                  </span>
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    {t("insights.securityPosture.resolvedThreats")}
                  </span>
                  <span className="text-sm font-medium text-green-600">
                    {data.metrics.threats.resolved}
                  </span>
                </div>
                <Progress
                  value={data.metrics.threats.resolutionRate}
                  className="h-2"
                />
                <p className="text-xs text-muted-foreground">
                  {t("insights.securityPosture.resolutionRate", {
                    rate: Math.round(data.metrics.threats.resolutionRate),
                  })}
                </p>
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    {t("insights.securityPosture.unresolvedThreats")}
                  </span>
                  <span className="text-sm font-medium text-red-600">
                    {data.metrics.threats.unresolved}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Breaches */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold">
              {t("insights.securityPosture.breaches")}
            </h4>
            <div className="space-y-3">
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    {t("insights.securityPosture.totalBreaches")}
                  </span>
                  <span className="text-sm font-medium">
                    {data.metrics.breaches.total}
                  </span>
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    {t("insights.securityPosture.resolvedBreaches")}
                  </span>
                  <span className="text-sm font-medium text-green-600">
                    {data.metrics.breaches.resolved}
                  </span>
                </div>
                <Progress
                  value={data.metrics.breaches.resolutionRate}
                  className="h-2"
                />
              </div>
              {data.metrics.suspiciousActivity.suspiciousIPs > 0 && (
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      {t("insights.securityPosture.suspiciousIPs")}
                    </span>
                    <span className="text-sm font-medium text-orange-600">
                      {data.metrics.suspiciousActivity.suspiciousIPs}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

