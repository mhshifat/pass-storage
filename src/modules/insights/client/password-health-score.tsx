"use client"

import * as React from "react"
import { useTranslation } from "react-i18next"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { trpc } from "@/trpc/client"
import { Loader2, Shield, AlertTriangle, CheckCircle2, XCircle } from "lucide-react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"

const COLORS = ["#22c55e", "#eab308", "#ef4444"] // green, yellow, red

export function PasswordHealthScore() {
  const { t } = useTranslation()
  const { data, isLoading } = trpc.insights.passwordHealthScore.useQuery({})

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t("insights.passwordHealth.title")}</CardTitle>
          <CardDescription>
            {t("insights.passwordHealth.description")}
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

  const getStatusColor = () => {
    switch (data.status) {
      case "excellent":
        return "bg-green-600"
      case "good":
        return "bg-blue-600"
      case "fair":
        return "bg-yellow-600"
      case "poor":
        return "bg-red-600"
      default:
        return "bg-gray-600"
    }
  }

  // Prepare data for charts
  const strengthData = [
    {
      name: t("insights.passwordHealth.strong"),
      value: data.breakdown.strength.strong,
      color: "#22c55e",
    },
    {
      name: t("insights.passwordHealth.medium"),
      value: data.breakdown.strength.medium,
      color: "#eab308",
    },
    {
      name: t("insights.passwordHealth.weak"),
      value: data.breakdown.strength.weak,
      color: "#ef4444",
    },
  ]

  const securityData = [
    {
      name: t("insights.passwordHealth.withMFA"),
      value: data.breakdown.security.withMFA,
    },
    {
      name: t("insights.passwordHealth.breached"),
      value: data.breakdown.security.breached,
    },
    {
      name: t("insights.passwordHealth.withoutRotation"),
      value: data.breakdown.security.withoutRotation,
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {getStatusIcon()}
          {t("insights.passwordHealth.title")}
        </CardTitle>
        <CardDescription>
          {t("insights.passwordHealth.description")}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Score Display */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">
              {t("insights.passwordHealth.overallScore")}
            </span>
            <Badge variant="secondary" className="text-lg font-bold">
              {data.score}/100
            </Badge>
          </div>
          <Progress value={data.score} className="h-3" />
          <p className="text-xs text-muted-foreground">
            {t(`insights.passwordHealth.status.${data.status}`)}
          </p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">
              {t("insights.passwordHealth.totalPasswords")}
            </p>
            <p className="text-2xl font-bold">{data.totalPasswords}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">
              {t("insights.passwordHealth.weakPasswords")}
            </p>
            <p className="text-2xl font-bold text-red-600">
              {data.weakPasswords}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">
              {t("insights.passwordHealth.breachedPasswords")}
            </p>
            <p className="text-2xl font-bold text-orange-600">
              {data.breachedPasswords}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">
              {t("insights.passwordHealth.expiredPasswords")}
            </p>
            <p className="text-2xl font-bold text-yellow-600">
              {data.expiredPasswords}
            </p>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Password Strength Distribution */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium">
              {t("insights.passwordHealth.strengthDistribution")}
            </h4>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={strengthData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Security Features */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium">
              {t("insights.passwordHealth.securityFeatures")}
            </h4>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={securityData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) =>
                    `${name}: ${value}`
                  }
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {securityData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

