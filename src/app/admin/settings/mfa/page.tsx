import { MfaSettings } from "@/modules/settings/client"
import { MfaSettingsPageHeader } from "./mfa-settings-page-header"

export default function MfaSettingsPage() {
  return (
    <div className="p-6 space-y-6">
      <MfaSettingsPageHeader />
      <MfaSettings />
    </div>
  )
}
