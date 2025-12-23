"use client"

import * as React from "react"
import { useTranslation } from "react-i18next"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { CalendarIcon, BarChart3 } from "lucide-react"
import { format, subDays } from "date-fns"
import { trpc } from "@/trpc/client"
import { Loader2 } from "lucide-react"
import { Label } from "@/components/ui/label"
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
  PieChart,
  Pie,
  Cell,
} from "recharts"

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"]

export function AuditLogAnalytics() {
  const { t } = useTranslation()
  const [dateRange, setDateRange] = React.useState({
    start: subDays(new Date(), 30),
    end: new Date(),
  })
  const [isCalendarOpen, setIsCalendarOpen] = React.useState(false)

  const { data: analytics, isLoading } = trpc.auditLogs.getAnalytics.useQuery(
    {
      startDate: dateRange.start,
      endDate: dateRange.end,
    },
    {
      enabled: !!dateRange.start && !!dateRange.end,
    }
  )

  const logsByActionData = analytics?.logsByAction.map((item) => ({
    name: item.action,
    value: item.count,
  })) || []

  const logsByStatusData = analytics?.logsByStatus.map((item) => ({
    name: t(`audit.${item.status.toLowerCase()}`),
    value: item.count,
  })) || []

  const logsByDayData = analytics?.logsByDay.map((item) => ({
    date: format(new Date(item.date), "MMM dd"),
    count: item.count,
  })) || []

  const logsByHourData = analytics?.logsByHour.map((item) => ({
    hour: `${item.hour}:00`,
    count: item.count,
  })) || []

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                {t("audit.analytics.title")}
              </CardTitle>
              <CardDescription>
                {t("audit.analytics.description")}
              </CardDescription>
            </div>
            <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {format(dateRange.start, "MMM dd")} -{" "}
                  {format(dateRange.end, "MMM dd")}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <div className="p-4 space-y-4">
                  <div>
                    <Label className="text-sm font-medium mb-2 block">
                      {t("audit.analytics.startDate")}
                    </Label>
                    <Calendar
                      key={`start-${dateRange.start.toISOString()}`}
                      mode="single"
                      selected={dateRange.start}
                      onSelect={(date) =>
                        date && setDateRange({ ...dateRange, start: date })
                      }
                      defaultMonth={dateRange.start}
                      autoFocus
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium mb-2 block">
                      {t("audit.analytics.endDate")}
                    </Label>
                    <Calendar
                      key={`end-${dateRange.end.toISOString()}`}
                      mode="single"
                      selected={dateRange.end}
                      onSelect={(date) =>
                        date && setDateRange({ ...dateRange, end: date })
                      }
                      defaultMonth={dateRange.end}
                      autoFocus
                    />
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : analytics ? (
            <div className="space-y-6">
              {/* Summary Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">
                      {t("audit.analytics.totalLogs")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {analytics.totalLogs.toLocaleString()}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">
                      {t("audit.analytics.uniqueActions")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {analytics.logsByAction.length}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">
                      {t("audit.analytics.uniqueUsers")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {analytics.logsByUser.length}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">
                      {t("audit.analytics.failedActions")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-destructive">
                      {analytics.failedActions.reduce(
                        (sum, item) => sum + item.count,
                        0
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Logs by Action */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">
                      {t("audit.analytics.logsByAction")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={logsByActionData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="value" fill="#0088FE" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Logs by Status */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">
                      {t("audit.analytics.logsByStatus")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={logsByStatusData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) =>
                            `${name} ${(percent * 100).toFixed(0)}%`
                          }
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {logsByStatusData.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={COLORS[index % COLORS.length]}
                            />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Logs by Day */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">
                      {t("audit.analytics.logsByDay")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={logsByDayData}>
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
                  </CardContent>
                </Card>

                {/* Logs by Hour */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">
                      {t("audit.analytics.logsByHour")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={logsByHourData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="hour" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="count" fill="#00C49F" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>

              {/* Top Users and IPs */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top Users */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">
                      {t("audit.analytics.topUsers")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {analytics.logsByUser.slice(0, 10).map((item, index) => (
                        <div
                          key={item.userId}
                          className="flex items-center justify-between p-2 rounded-md bg-muted"
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">
                              {index + 1}.
                            </span>
                            <span className="text-sm">{item.userName === "Unknown" ? t("audit.unknown") : item.userName}</span>
                          </div>
                          <span className="text-sm font-medium">
                            {item.count}
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Top IP Addresses */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">
                      {t("audit.analytics.topIpAddresses")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {analytics.topIpAddresses.slice(0, 10).map((item, index) => (
                        <div
                          key={item.ipAddress}
                          className="flex items-center justify-between p-2 rounded-md bg-muted"
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">
                              {index + 1}.
                            </span>
                            <span className="text-sm font-mono">
                              {item.ipAddress}
                            </span>
                          </div>
                          <span className="text-sm font-medium">
                            {item.count}
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Failed Actions */}
              {analytics.failedActions.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg text-destructive">
                      {t("audit.analytics.failedActions")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {analytics.failedActions.map((item) => (
                        <div
                          key={item.action}
                          className="flex items-center justify-between p-2 rounded-md bg-destructive/10"
                        >
                          <span className="text-sm">{item.action}</span>
                          <span className="text-sm font-medium text-destructive">
                            {item.count}
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              {t("audit.analytics.noData")}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
