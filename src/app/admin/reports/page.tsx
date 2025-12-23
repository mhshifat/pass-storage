import { Suspense } from "react"
import { ReportsContent, ReportsSkeleton } from "@/modules/reports/client"

export default function ReportsPage() {
  return (
    <Suspense fallback={<ReportsSkeleton />}>
      <ReportsContent />
    </Suspense>
  )
}



