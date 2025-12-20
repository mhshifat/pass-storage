import { Suspense } from "react"
import { TeamsActionsClient, TeamsTableSkeleton, TeamsStatsSkeleton } from "@/modules/teams/client"
import { caller } from "@/trpc/server"
import { TeamsPageHeader } from "./teams-page-header"
import { TeamsStatsClient } from "./teams-stats-client"

async function TeamsContent({ page }: { page: number }) {
  const { teams, pagination } = await caller.teams.list({
    page,
    pageSize: 10,
  })

  return <TeamsActionsClient teams={teams} pagination={pagination} />
}

async function TeamsStats() {
  const stats = await caller.teams.stats()
  return <TeamsStatsClient stats={stats} />
}

interface TeamsPageProps {
  searchParams: Promise<{ page?: string }>
}

export default async function TeamsPage({ searchParams }: TeamsPageProps) {
  const params = await searchParams
  const currentPage = Number(params.page) || 1

  return (
    <div className="p-6 space-y-6">
      <Suspense fallback={<TeamsStatsSkeleton />}>
        <TeamsStats />
      </Suspense>

      <Suspense key={currentPage} fallback={<TeamsTableSkeleton />}>
        <TeamsContent page={currentPage} />
      </Suspense>
    </div>
  )
}
