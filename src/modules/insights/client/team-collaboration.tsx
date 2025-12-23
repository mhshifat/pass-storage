"use client"

import * as React from "react"
import { useTranslation } from "react-i18next"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { trpc } from "@/trpc/client"
import { Loader2, Users, Share2, TrendingUp } from "lucide-react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"

export function TeamCollaboration() {
  const { t } = useTranslation()
  const { data, isLoading } = trpc.insights.teamCollaboration.useQuery({})

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t("insights.teamCollaboration.title")}</CardTitle>
          <CardDescription>
            {t("insights.teamCollaboration.description")}
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

  // Prepare data for charts
  const sharesByTeamData = data.sharesByTeam.map((team) => ({
    name: team.teamName,
    shares: team.shareCount,
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          {t("insights.teamCollaboration.title")}
        </CardTitle>
        <CardDescription>
          {t("insights.teamCollaboration.description")}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overview Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">
              {t("insights.teamCollaboration.totalTeams")}
            </p>
            <p className="text-2xl font-bold">{data.overview.totalTeams}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">
              {t("insights.teamCollaboration.activeTeams")}
            </p>
            <p className="text-2xl font-bold text-green-600">
              {data.overview.activeTeams}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">
              {t("insights.teamCollaboration.totalShares")}
            </p>
            <p className="text-2xl font-bold">{data.overview.totalShares}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">
              {t("insights.teamCollaboration.collaborationRate")}
            </p>
            <p className="text-2xl font-bold">
              {Math.round(data.overview.collaborationRate)}%
            </p>
          </div>
        </div>

        {/* Additional Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">
              {t("insights.teamCollaboration.sharedPasswords")}
            </p>
            <p className="text-xl font-semibold">
              {data.overview.sharedPasswords}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">
              {t("insights.teamCollaboration.teamMembers")}
            </p>
            <p className="text-xl font-semibold">
              {data.overview.teamMembers}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">
              {t("insights.teamCollaboration.avgMembersPerTeam")}
            </p>
            <p className="text-xl font-semibold">
              {Math.round(data.overview.averageMembersPerTeam)}
            </p>
          </div>
        </div>

        {/* Shares by Team Chart */}
        {sharesByTeamData.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">
              {t("insights.teamCollaboration.sharesByTeam")}
            </h4>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={sharesByTeamData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="shares" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Top Collaborators */}
        {data.topCollaborators.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">
              {t("insights.teamCollaboration.topCollaborators")}
            </h4>
            <div className="space-y-2">
              {data.topCollaborators.slice(0, 5).map((collaborator, index) => (
                <div
                  key={collaborator.userId}
                  className="flex items-center justify-between p-2 border rounded-md"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-muted-foreground">
                      #{index + 1}
                    </span>
                    <div>
                      <p className="text-sm font-medium">
                        {collaborator.userName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {collaborator.userEmail}
                      </p>
                    </div>
                  </div>
                  <span className="text-sm font-semibold">
                    {collaborator.shareCount}{" "}
                    {t("insights.teamCollaboration.shares")}
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

