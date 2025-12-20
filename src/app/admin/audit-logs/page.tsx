import { Suspense } from "react"
import { AuditLogsContent, AuditLogsSkeleton } from "@/modules/audit-logs/client"

export default function AuditLogsPage() {
  return (
    <Suspense fallback={<AuditLogsSkeleton />}>
      <AuditLogsContent />
    </Suspense>
  )
}
