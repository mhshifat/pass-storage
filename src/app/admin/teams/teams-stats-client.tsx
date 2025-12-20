"use client"

import { useTranslation } from "react-i18next"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface TeamsStatsClientProps {
  stats: {
    total: number
    totalMembers: number
    totalPasswords: number
    avgTeamSize: number
  }
}

export function TeamsStatsClient({ stats }: TeamsStatsClientProps) {
  const { t } = useTranslation()
  const { total, totalMembers, totalPasswords, avgTeamSize } = stats

  return (
    <div className="grid gap-4 md:grid-cols-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">{t("teams.totalTeams")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{total}</div>
          <p className="text-xs text-muted-foreground">{t("teams.activeTeams")}</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">{t("teams.totalMembers")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalMembers}</div>
          <p className="text-xs text-muted-foreground">{t("teams.acrossAllTeams")}</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">{t("teams.sharedPasswords")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalPasswords}</div>
          <p className="text-xs text-muted-foreground">
            {total > 0 
              ? t("teams.averagePerTeam", { count: Math.round(totalPasswords / total) })
              : t("teams.noPasswordsShared")}
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">{t("teams.avgTeamSize")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{avgTeamSize}</div>
          <p className="text-xs text-muted-foreground">{t("teams.membersPerTeam")}</p>
        </CardContent>
      </Card>
    </div>
  )
}
