"use client"

import * as React from "react"
import { useTranslation } from "react-i18next"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { trpc } from "@/trpc/client"
import { Loader2, TrendingUp } from "lucide-react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"

export function TrendAnalysis() {
  const { t } = useTranslation()
  const [metric, setMetric] = React.useState<
    "passwords" | "users" | "logins" | "security_events" | "collaboration"
  >("passwords")
  const [period, setPeriod] = React.useState<"7d" | "30d" | "90d" | "1y">("30d")

  const { data, isLoading } = trpc.insights.trends.useQuery({
    metric,
    period,
  })

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t("insights.trends.title")}</CardTitle>
          <CardDescription>
            {t("insights.trends.description")}
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

  // Format data for chart
  const chartData = data.data.map((item) => ({
    date: new Date(item.date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
    value: item.value,
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          {t("insights.trends.title")}
        </CardTitle>
        <CardDescription>
          {t("insights.trends.description")}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Controls */}
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="text-xs text-muted-foreground mb-1 block">
              {t("insights.trends.metric")}
            </label>
            <Select
              value={metric}
              onValueChange={(value) =>
                setMetric(
                  value as
                    | "passwords"
                    | "users"
                    | "logins"
                    | "security_events"
                    | "collaboration"
                )
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="passwords">
                  {t("insights.trends.metrics.passwords")}
                </SelectItem>
                <SelectItem value="users">
                  {t("insights.trends.metrics.users")}
                </SelectItem>
                <SelectItem value="logins">
                  {t("insights.trends.metrics.logins")}
                </SelectItem>
                <SelectItem value="security_events">
                  {t("insights.trends.metrics.securityEvents")}
                </SelectItem>
                <SelectItem value="collaboration">
                  {t("insights.trends.metrics.collaboration")}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex-1">
            <label className="text-xs text-muted-foreground mb-1 block">
              {t("insights.trends.period")}
            </label>
            <Select
              value={period}
              onValueChange={(value) =>
                setPeriod(value as "7d" | "30d" | "90d" | "1y")
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">
                  {t("insights.trends.periods.7d")}
                </SelectItem>
                <SelectItem value="30d">
                  {t("insights.trends.periods.30d")}
                </SelectItem>
                <SelectItem value="90d">
                  {t("insights.trends.periods.90d")}
                </SelectItem>
                <SelectItem value="1y">
                  {t("insights.trends.periods.1y")}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Chart */}
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#0088FE"
                strokeWidth={2}
                name={t(`insights.trends.metrics.${metric}`)}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center py-12 text-center">
            <p className="text-sm text-muted-foreground">
              {t("insights.trends.noData")}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

