import { SecuritySettings, ThreatDetectionSettings, ThreatEventsViewer } from "@/modules/settings/client"
import { IpWhitelistManagement } from "@/modules/settings/client/ip-whitelist-management"
import { SecuritySettingsPageHeader } from "./security-settings-page-header"

export default function SecuritySettingsPage() {
  return (
    <div className="p-6 space-y-6">
      <SecuritySettingsPageHeader />
      <SecuritySettings />
      <IpWhitelistManagement />
      <ThreatDetectionSettings />
      <ThreatEventsViewer />
    </div>
  )
}
