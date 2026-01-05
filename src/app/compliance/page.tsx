import type { Metadata } from "next"
import { CompliancePageContent } from "@/components/landing/compliance-page-content"

export const metadata: Metadata = {
  title: "Compliance & Certifications - PassBangla",
  description: "Learn about PassBangla's compliance with GDPR, SOC 2, and other security standards. View our certifications and audit reports.",
}

export default function CompliancePage() {
  return <CompliancePageContent />
}

