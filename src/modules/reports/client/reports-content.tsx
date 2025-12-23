"use client"

import * as React from "react"
import { useTranslation } from "react-i18next"
import { trpc } from "@/trpc/client"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, FileText } from "lucide-react"
import { ReportsList } from "./reports-list"
import { ReportBuilderDialog } from "./report-builder-dialog"
import { ReportTemplatesList } from "./report-templates-list"
import { usePermissions } from "@/hooks/use-permissions"

export function ReportsContent() {
  const { t } = useTranslation()
  const { hasPermission } = usePermissions()
  const [builderOpen, setBuilderOpen] = React.useState(false)
  const [activeTab, setActiveTab] = React.useState("reports")

  const canCreate = hasPermission("report.create")

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t("reports.title")}</h1>
          <p className="text-muted-foreground mt-1">{t("reports.description")}</p>
        </div>
        {canCreate && (
          <Button onClick={() => setBuilderOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            {t("reports.createReport")}
          </Button>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="reports">
            <FileText className="mr-2 h-4 w-4" />
            {t("reports.tabs.reports")}
          </TabsTrigger>
          <TabsTrigger value="templates">
            <FileText className="mr-2 h-4 w-4" />
            {t("reports.tabs.templates")}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="reports" className="space-y-4">
          <ReportsList />
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <ReportTemplatesList />
        </TabsContent>
      </Tabs>

      {canCreate && (
        <ReportBuilderDialog open={builderOpen} onOpenChange={setBuilderOpen} />
      )}
    </div>
  )
}



