import { Suspense } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  SecurityAlerts,
  PasswordsTableSkeleton,
  PasswordsEmptyState,
} from "@/modules/passwords/client"
import { caller } from "@/trpc/server"
import { PasswordsContent } from "./passwords-content"
import { PasswordsListClient } from "./passwords-list-client"

interface PasswordsPageProps {
  searchParams: Promise<{ page?: string; search?: string; filter?: string }>
}

export default async function PasswordsPage({ searchParams }: PasswordsPageProps) {
  const params = await searchParams
  const currentPage = Number(params.page) || 1
  const search = params.search || ""
  const filter = params.filter === "weak" || params.filter === "expiring" ? params.filter : undefined

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Passwords</h1>
          <p className="text-muted-foreground mt-1">
            Manage and organize all stored passwords
          </p>
        </div>
        <PasswordsContent />
      </div>

      <Suspense fallback={<PasswordsStatsSkeleton />}>
        <PasswordsStats />
      </Suspense>

      <Suspense key={`${currentPage}-${search}-${filter}`} fallback={<PasswordsTableSkeleton />}>
        <PasswordsListContent page={currentPage} search={search} filter={filter} />
      </Suspense>
    </div>
  )
}

async function PasswordsStats() {
  const stats = await caller.passwords.stats()

  const securityAlerts = [
    ...(stats.weak > 0
      ? [
          {
            type: "weak" as const,
            count: stats.weak,
            message: `${stats.weak} password${stats.weak === 1 ? "" : "s"} ${stats.weak === 1 ? "is" : "are"} using weak security. Consider updating ${stats.weak === 1 ? "it" : "them"} for better protection.`,
          },
        ]
      : []),
    ...(stats.expiringSoon > 0
      ? [
          {
            type: "expiring" as const,
            count: stats.expiringSoon,
            message: `${stats.expiringSoon} password${stats.expiringSoon === 1 ? "" : "s"} will expire within the next 7 days. Update ${stats.expiringSoon === 1 ? "it" : "them"} to maintain access.`,
          },
        ]
      : []),
  ]

  return (
    <>
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Passwords</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {stats.recentCount > 0 ? `+${stats.recentCount} in last 30 days` : "No recent additions"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Strong Passwords</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.strong.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">{stats.strongPercentage}% of total</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Weak Passwords</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.weak.toLocaleString()}</div>
            <p className={`text-xs ${stats.weak > 0 ? "text-red-600 dark:text-red-400" : "text-muted-foreground"}`}>
              {stats.weak > 0 ? "Need attention" : "All secure"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Expiring Soon</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.expiringSoon.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Within 7 days</p>
          </CardContent>
        </Card>
      </div>

      {securityAlerts.length > 0 && <SecurityAlerts alerts={securityAlerts} />}
    </>
  )
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
}: {
  page: number
  search: string
  filter?: "weak" | "expiring"
}) {
  const { passwords, pagination } = await caller.passwords.list({
    page,
    pageSize: 10,
    search: search || undefined,
    filter: filter,
  })

  if (passwords.length === 0) {
    return <PasswordsEmptyState isSearching={!!search || !!filter} />
  }

  return <PasswordsListClient passwords={passwords} pagination={pagination} />
}
