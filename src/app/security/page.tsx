import type { Metadata } from "next"
import { SecurityPageContent } from "@/components/landing/security-page-content"

export const metadata: Metadata = {
  title: "Security & Trust - PassBangla",
  description: "Learn about PassBangla's security architecture, zero-knowledge encryption, and commitment to protecting your data.",
}

export default function SecurityPage() {
  return <SecurityPageContent />
}

