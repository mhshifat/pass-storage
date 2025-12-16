"use client"

import { GeneralSettings } from "@/modules/settings/client"

export default function GeneralSettingsPage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">General Settings</h1>
        <p className="text-muted-foreground mt-1">Configure general system settings and preferences</p>
      </div>

      <GeneralSettings />
    </div>
  )
}
