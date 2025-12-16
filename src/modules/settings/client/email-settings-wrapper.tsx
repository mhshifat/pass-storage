import { serverTrpc } from "@/trpc/server-caller"
import { EmailSettings } from "./email-settings"

export default async function EmailSettingsWrapper() {
  const caller = await serverTrpc()
  const config = await caller.settings.getEmailConfig()
  return <EmailSettings config={config} />
}
