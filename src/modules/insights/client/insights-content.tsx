"use client"

import * as React from "react"
import { useTranslation } from "react-i18next"
import { PasswordHealthScore } from "./password-health-score"
import { SecurityPosture } from "./security-posture"
import { UserEngagement } from "./user-engagement"
import { TeamCollaboration } from "./team-collaboration"
import { TrendAnalysis } from "./trend-analysis"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Shield, Users, Activity, TrendingUp } from "lucide-react"

export function InsightsContent() {
  const { t } = useTranslation()

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          {t("insights.title")}
        </h1>
        <p className="text-muted-foreground mt-1">
          {t("insights.description")}
        </p>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">
            {t("insights.tabs.overview")}
          </TabsTrigger>
          <TabsTrigger value="health">
            <Shield className="h-4 w-4 mr-2" />
            {t("insights.tabs.health")}
          </TabsTrigger>
          <TabsTrigger value="security">
            <Shield className="h-4 w-4 mr-2" />
            {t("insights.tabs.security")}
          </TabsTrigger>
          <TabsTrigger value="engagement">
            <Users className="h-4 w-4 mr-2" />
            {t("insights.tabs.engagement")}
          </TabsTrigger>
          <TabsTrigger value="collaboration">
            <Activity className="h-4 w-4 mr-2" />
            {t("insights.tabs.collaboration")}
          </TabsTrigger>
          <TabsTrigger value="trends">
            <TrendingUp className="h-4 w-4 mr-2" />
            {t("insights.tabs.trends")}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6">
            <PasswordHealthScore />
            <SecurityPosture />
          </div>
        </TabsContent>

        <TabsContent value="health" className="space-y-6">
          <PasswordHealthScore />
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <SecurityPosture />
        </TabsContent>

        <TabsContent value="engagement" className="space-y-6">
          <UserEngagement />
        </TabsContent>

        <TabsContent value="collaboration" className="space-y-6">
          <TeamCollaboration />
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          <TrendAnalysis />
        </TabsContent>
      </Tabs>
    </div>
  )
}

