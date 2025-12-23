"use client"

import * as React from "react"
import { useTranslation } from "react-i18next"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { trpc } from "@/trpc/client"
import { Loader2, Users, Activity, TrendingUp } from "lucide-react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts"

export function UserEngagement() {
  const { t } = useTranslation()
  const { data, isLoading } = trpc.insights.userEngagement.useQuery({})

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t("insights.userEngagement.title")}</CardTitle>
          <CardDescription>
            {t("insights.userEngagement.description")}
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

  // Format activity by day data
  const activityByDayData = data.activityByDay.map((item) => ({
    date: new Date(item.date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
    count: item.count,
  }))

  // Format activity by hour data
  const activityByHourData = data.activityByHour.map((item) => ({
    hour: `${item.hour}:00`,
    count: item.count,
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          {t("insights.userEngagement.title")}
        </CardTitle>
        <CardDescription>
          {t("insights.userEngagement.description")}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overview Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">
              {t("insights.userEngagement.totalUsers")}
            </p>
            <p className="text-2xl font-bold">{data.overview.totalUsers}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">
              {t("insights.userEngagement.activeUsers")}
            </p>
            <p className="text-2xl font-bold text-green-600">
              {data.overview.activeUsers}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">
              {t("insights.userEngagement.dailyActiveUsers")}
            </p>
            <p className="text-2xl font-bold text-blue-600">
              {data.overview.dailyActiveUsers}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">
              {t("insights.userEngagement.engagementRate")}
            </p>
            <p className="text-2xl font-bold">
              {Math.round(data.overview.engagementRate)}%
            </p>
          </div>
        </div>

        {/* Activity Breakdown */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">
              {t("insights.userEngagement.logins")}
            </p>
            <p className="text-xl font-semibold">{data.activity.logins}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">
              {t("insights.userEngagement.passwordActions")}
            </p>
            <p className="text-xl font-semibold">
              {data.activity.passwordActions}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">
              {t("insights.userEngagement.reportActions")}
            </p>
            <p className="text-xl font-semibold">
              {data.activity.reportActions}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">
              {t("insights.userEngagement.teamActions")}
            </p>
            <p className="text-xl font-semibold">
              {data.activity.teamActions}
            </p>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Activity by Day */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium">
              {t("insights.userEngagement.activityByDay")}
            </h4>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={activityByDayData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#0088FE"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Activity by Hour */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium">
              {t("insights.userEngagement.activityByHour")}
            </h4>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={activityByHourData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#00C49F" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Most Active Users */}
        {data.mostActiveUsers.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">
              {t("insights.userEngagement.mostActiveUsers")}
            </h4>
            <div className="space-y-2">
              {data.mostActiveUsers.slice(0, 5).map((user, index) => (
                <div
                  key={user.userId}
                  className="flex items-center justify-between p-2 border rounded-md"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-muted-foreground">
                      #{index + 1}
                    </span>
                    <div>
                      <p className="text-sm font-medium">{user.userName}</p>
                      <p className="text-xs text-muted-foreground">
                        {user.userEmail}
                      </p>
                    </div>
                  </div>
                  <span className="text-sm font-semibold">
                    {user.actionCount} {t("insights.userEngagement.actions")}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

