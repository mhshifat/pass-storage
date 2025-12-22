"use client"

import * as React from "react"
import { useTranslation } from "react-i18next"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { trpc } from "@/trpc/client"
import { Loader2, Lock, Share2, Users, FileText, Calendar } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

interface UserStatisticsProps {
  userId: string
}

export function UserStatistics({ userId }: UserStatisticsProps) {
  const { t } = useTranslation()
  const { data, isLoading, error } = trpc.users.getUserStatistics.useQuery()

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t("profile.statistics")}</CardTitle>
          <CardDescription>{t("profile.statisticsDescription")}</CardDescription>
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
          <CardTitle>{t("profile.statistics")}</CardTitle>
          <CardDescription>{t("profile.statisticsDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center text-destructive">
            <p>{error.message}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const stats = data || {
    passwords: 0,
    sharedPasswords: 0,
    teams: 0,
    auditLogs: 0,
    lastLoginAt: null,
    accountCreatedAt: null,
  }

  const statCards = [
    {
      title: t("profile.totalPasswords"),
      value: stats.passwords,
      icon: Lock,
      description: t("profile.totalPasswordsDescription"),
    },
    {
      title: t("profile.sharedPasswords"),
      value: stats.sharedPasswords,
      icon: Share2,
      description: t("profile.sharedPasswordsDescription"),
    },
    {
      title: t("profile.teams"),
      value: stats.teams,
      icon: Users,
      description: t("profile.teamsDescription"),
    },
    {
      title: t("profile.activityLogs"),
      value: stats.auditLogs,
      icon: FileText,
      description: t("profile.activityLogsDescription"),
    },
  ]

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            {t("profile.accountInfo")}
          </CardTitle>
          <CardDescription>{t("profile.accountInfoDescription")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {stats.accountCreatedAt && (
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                {t("profile.memberSince")}
              </label>
              <p className="text-sm font-medium">
                {new Date(stats.accountCreatedAt).toLocaleDateString()} (
                {formatDistanceToNow(new Date(stats.accountCreatedAt), { addSuffix: true })})
              </p>
            </div>
          )}
          {stats.lastLoginAt && (
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                {t("profile.lastLogin")}
              </label>
              <p className="text-sm font-medium">
                {new Date(stats.lastLoginAt).toLocaleDateString()} (
                {formatDistanceToNow(new Date(stats.lastLoginAt), { addSuffix: true })})
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
