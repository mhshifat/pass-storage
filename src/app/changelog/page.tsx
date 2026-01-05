import type { Metadata } from "next"
import { getServerLanguage, getChangelogTranslations } from "@/lib/i18n-server"
import { ChangelogClient } from "@/components/changelog/changelog-client"

export const metadata: Metadata = {
  title: "Changelog - PassBangla",
  description: "See what's new in PassBangla. Track updates, new features, bug fixes, and improvements.",
}

export default async function ChangelogPage() {
  const language = await getServerLanguage()
  const translations = await getChangelogTranslations(language)

  return <ChangelogClient translations={translations} language={language} />
}

