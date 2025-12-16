"use client"

import { EmailSettings } from "@/modules/settings/client"

export default function EmailSettingsPage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Email Settings</h1>
        <p className="text-muted-foreground mt-1">Configure email notifications and delivery settings</p>
      </div>

      <EmailSettings />
    </div>
  )
}
