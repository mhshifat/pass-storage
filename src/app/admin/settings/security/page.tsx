import { SecuritySettings } from "@/modules/settings/client"
import { SecuritySettingsPageHeader } from "./security-settings-page-header"

export default function SecuritySettingsPage() {
  return (
    <div className="p-6 space-y-6">
      <SecuritySettingsPageHeader />
      <SecuritySettings />
    </div>
  )
}
