import { Suspense } from "react"
import { RotationPageClient } from "./rotation-page-client"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function RotationPage() {
  return (
    <div className="p-6 space-y-6">
      <Suspense fallback={<RotationPageSkeleton />}>
        <RotationPageClient />
      </Suspense>
    </div>
  )
}

function RotationPageSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96" />
      </div>
      <Card>
        <CardContent className="p-6">
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    </div>
  )
}
