import type { Metadata } from "next"
import { UserGuideContent } from "@/components/landing/user-guide-content"

export const metadata: Metadata = {
  title: "User Guide - PassBangla",
  description: "Learn how to use PassBangla with step-by-step guides and screenshots. Master password management, team collaboration, and security features.",
}

export default function UserGuidePage() {
  return <UserGuideContent />
}

