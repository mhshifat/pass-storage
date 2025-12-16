import { Suspense } from "react"
import { UserStats, UsersTableSkeleton, UsersPagination, UserActionsClient } from "@/modules/users/client"
import { caller } from "@/trpc/server"
import { getSession } from "@/lib/session"

const userStats = [
  { label: "Total Users", value: "1,247", description: "+12 from last month" },
  { label: "Active Users", value: "1,189", description: "95% of total" },
  { label: "MFA Enabled", value: "1,147", description: "92% adoption" },
  { label: "Admins", value: "8", description: "0.6% of total" },
]

async function UsersContent({ page, currentUserId }: { page: number; currentUserId: string }) {
  const { users, pagination } = await caller.users.list({ 
    page, 
    pageSize: 10,
    excludeUserId: currentUserId 
  })

  return (
    <>
      <UserActionsClient users={users} />
      <UsersPagination
        currentPage={pagination.page}
        totalPages={pagination.totalPages}
        total={pagination.total}
      />
    </>
  )
}

interface UsersPageProps {
  searchParams: Promise<{ page?: string }>
}

export default async function UsersPage({ searchParams }: UsersPageProps) {
  const params = await searchParams
  const currentPage = Number(params.page) || 1
  const session = await getSession()

  return (
    <div className="p-6 space-y-6">
      <UserStats stats={userStats} />

      <Suspense key={currentPage} fallback={<UsersTableSkeleton />}>
        <UsersContent page={currentPage} currentUserId={session.userId} />
      </Suspense>
    </div>
  )
}
