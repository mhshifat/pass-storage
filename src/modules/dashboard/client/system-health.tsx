"use client"

import { useTranslation } from "react-i18next"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface HealthMetric {
  labelKey: string
  statusKey: string
  percentage: number
  descriptionKey: string
  descriptionParams?: Record<string, number>
  color: string
}

interface SystemHealthProps {
  metrics: HealthMetric[]
}

const EmptyHealthIllustration = () => (
  <svg
    width="120"
    height="120"
    viewBox="0 0 120 120"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="mx-auto"
  >
    <circle cx="60" cy="60" r="50" fill="#F3F4F6" />
    <rect x="35" y="45" width="50" height="30" rx="4" fill="#E5E7EB" />
    <rect x="40" y="50" width="40" height="4" rx="2" fill="#9CA3AF" />
    <rect x="40" y="58" width="30" height="4" rx="2" fill="#D1D5DB" />
    <rect x="40" y="66" width="35" height="4" rx="2" fill="#D1D5DB" />
    <circle cx="50" cy="40" r="3" fill="#9CA3AF" />
    <circle cx="70" cy="40" r="3" fill="#9CA3AF" />
    <path
      d="M45 85C45 82.7909 46.7909 81 49 81H71C73.2091 81 75 82.7909 75 85V90H45V85Z"
      fill="#D1D5DB"
    />
  </svg>
)

export function SystemHealth({ metrics }: SystemHealthProps) {
  const { t } = useTranslation()
  const hasData = metrics && metrics.length > 0

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("dashboard.systemHealth")}</CardTitle>
        <CardDescription>
          {t("dashboard.systemHealthDescription")}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!hasData ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <EmptyHealthIllustration />
            <h3 className="text-sm font-semibold mt-4 mb-1">{t("dashboard.noHealthData")}</h3>
            <p className="text-xs text-muted-foreground max-w-xs">
              {t("dashboard.noHealthDataDescription")}
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-3">
            {metrics.map((metric, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{t(metric.labelKey)}</span>
                  <Badge variant="secondary">{t(`dashboard.status.${metric.statusKey}`)}</Badge>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <div className={`h-full ${metric.color} w-[${metric.percentage}%]`} style={{ width: `${metric.percentage}%` }} />
                </div>
                <p className="text-xs text-muted-foreground">
                  {t(metric.descriptionKey, {
                    ...metric.descriptionParams,
                    count: metric.descriptionParams?.count || 0,
                  })}
                </p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
