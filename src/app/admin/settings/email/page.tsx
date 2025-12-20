import EmailSettingsWrapper from "@/modules/settings/client/email-settings-wrapper"
import { EmailSettingsPageHeader } from "./email-settings-page-header"

export default function EmailSettingsPage() {
  return (
    <div className="p-6 space-y-6">
      <EmailSettingsPageHeader />
      <EmailSettingsWrapper />
    </div>
  )
}
