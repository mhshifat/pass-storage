"use client"

import { SecuritySettings } from "@/modules/settings/client"

export default function SecuritySettingsPage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Security Settings</h1>
        <p className="text-muted-foreground mt-1">Configure password policies and security requirements</p>
      </div>

      <SecuritySettings />
    </div>
  )
}
