import { Suspense } from "react"
import { InsightsContent } from "@/modules/insights/client/insights-content"
import { InsightsSkeleton } from "@/modules/insights/client/insights-skeleton"

export default function InsightsPage() {
  return (
    <Suspense fallback={<InsightsSkeleton />}>
      <InsightsContent />
    </Suspense>
  )
}

