import type { Metadata } from "next"
import { TermsPageContent } from "@/components/landing/terms-page-content"

export const metadata: Metadata = {
  title: "Terms of Service - PassBangla",
  description: "Read PassBangla's Terms of Service to understand the terms and conditions for using our password management platform.",
}

export default function TermsPage() {
  return <TermsPageContent />
}

