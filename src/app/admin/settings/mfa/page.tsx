"use client"

import { MfaSettings } from "@/modules/settings/client"

export default function MfaSettingsPage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">MFA Settings</h1>
        <p className="text-muted-foreground mt-1">Configure multi-factor authentication options</p>
      </div>

      <MfaSettings />
    </div>
  )
}
