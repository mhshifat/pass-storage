import { Suspense } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TeamsActionsClient, TeamsTableSkeleton, TeamsStatsSkeleton } from "@/modules/teams/client"
import { caller } from "@/trpc/server"

async function TeamsContent({ page }: { page: number }) {
  const { teams, pagination } = await caller.teams.list({
    page,
    pageSize: 10,
  })

  return <TeamsActionsClient teams={teams} pagination={pagination} />
}

async function TeamsStats() {
  const stats = await caller.teams.stats()

  return (
    <div className="grid gap-4 md:grid-cols-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Total Teams</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.total}</div>
          <p className="text-xs text-muted-foreground">Active teams</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Total Members</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalMembers}</div>
          <p className="text-xs text-muted-foreground">Across all teams</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Shared Passwords</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalPasswords}</div>
          <p className="text-xs text-muted-foreground">
            {stats.total > 0 ? `Average ${Math.round(stats.totalPasswords / stats.total)} per team` : "No passwords shared"}
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Avg Team Size</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.avgTeamSize}</div>
          <p className="text-xs text-muted-foreground">Members per team</p>
        </CardContent>
      </Card>
    </div>
  )
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
