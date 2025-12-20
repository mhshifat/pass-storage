"use client"

import { Suspense } from "react"
import { MfaCredentialsSettings, MfaCredentialsSettingsSkeleton } from "@/modules/settings/client"

export default function MfaCredentialsSettingsPage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">MFA Credentials</h1>
        <p className="text-muted-foreground mt-1">Configure credentials for SMS and WebAuthn MFA methods</p>
      </div>

      <Suspense fallback={<MfaCredentialsSettingsSkeleton />}>
        <MfaCredentialsSettings />
      </Suspense>
    </div>
  )
}
