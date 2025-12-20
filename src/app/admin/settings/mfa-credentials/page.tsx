import { Suspense } from "react"
import { MfaCredentialsSettings, MfaCredentialsSettingsSkeleton } from "@/modules/settings/client"
import { MfaCredentialsPageHeader } from "./mfa-credentials-page-header"

export default function MfaCredentialsSettingsPage() {
  return (
    <div className="p-6 space-y-6">
      <MfaCredentialsPageHeader />
      <Suspense fallback={<MfaCredentialsSettingsSkeleton />}>
        <MfaCredentialsSettings />
      </Suspense>
    </div>
  )
}
