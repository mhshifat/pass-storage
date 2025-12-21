import { Suspense } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  PasswordsTableSkeleton,
  PasswordsEmptyState,
} from "@/modules/passwords/client"
import { caller } from "@/trpc/server"
import { PasswordsContent } from "./passwords-content"
import { PasswordsListClient } from "./passwords-list-client"
import { PasswordsPageHeader } from "./passwords-page-header"
import { PasswordsStatsClient } from "./passwords-stats-client"

interface PasswordsPageProps {
  searchParams: Promise<{ page?: string; search?: string; filter?: string; tags?: string }>
}

export default async function PasswordsPage({ searchParams }: PasswordsPageProps) {
  const params = await searchParams
  const currentPage = Number(params.page) || 1
  const search = params.search || ""
  const filter = params.filter === "weak" || params.filter === "expiring" || params.filter === "favorites" ? params.filter : undefined
  const tagIds = params.tags ? params.tags.split(",").filter(Boolean) : undefined

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <PasswordsPageHeader />
        <PasswordsContent />
      </div>

      <Suspense fallback={<PasswordsStatsSkeleton />}>
        <PasswordsStats />
      </Suspense>

      <Suspense key={`${currentPage}-${search}-${filter}-${tagIds?.join(",")}`} fallback={<PasswordsTableSkeleton />}>
        <PasswordsListContent page={currentPage} search={search} filter={filter} tagIds={tagIds} />
      </Suspense>
    </div>
  )
}

async function PasswordsStats() {
  const stats = await caller.passwords.stats()
  return <PasswordsStatsClient stats={stats} />
}

function PasswordsStatsSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-4">
      {[1, 2, 3, 4].map((i) => (
        <Card key={i}>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">
              <div className="h-4 w-24 bg-muted animate-pulse rounded" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-8 w-16 bg-muted animate-pulse rounded mb-2" />
            <div className="h-3 w-32 bg-muted animate-pulse rounded" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

async function PasswordsListContent({
  page,
  search,
  filter,
  tagIds,
}: {
  page: number
  search: string
  filter?: "weak" | "expiring" | "favorites"
  tagIds?: string[]
}) {
  const { passwords, pagination } = await caller.passwords.list({
    page,
    pageSize: 10,
    search: search || undefined,
    filter: filter,
    tagIds: tagIds && tagIds.length > 0 ? tagIds : undefined,
  })

  if (passwords.length === 0) {
    return <PasswordsEmptyState isSearching={!!search || !!filter} />
  }

  return <PasswordsListClient passwords={passwords} pagination={pagination} />
}
