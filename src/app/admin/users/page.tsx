import { Suspense } from "react"
import { UserStats, UsersTableSkeleton, UsersPagination, UserActionsClient } from "@/modules/users/client"
import { caller } from "@/trpc/server"
import { User } from "@/app/generated";

async function getUserStats(currentUserId: string) {
  const { total, active, mfa, admins } = await caller.users.stats({ excludeUserId: currentUserId });
  return [
    { label: "Total Users", value: total.toLocaleString(), description: "Total number of users" },
    { label: "Active Users", value: active.toLocaleString(), description: total ? `${Math.round((active / total) * 100)}% of total` : "" },
    { label: "MFA Enabled", value: mfa.toLocaleString(), description: total ? `${Math.round((mfa / total) * 100)}% adoption` : "" },
    { label: "Admins", value: admins.toLocaleString(), description: total ? `${((admins / total) * 100).toFixed(1)}% of total` : "" },
  ];
}

async function UsersContent({ page, currentUserId, currentUser }: { 
  page: number; currentUserId: string; currentUser: User 
}) {
  const { users, pagination, isSuperAdmin } = await caller.users.list({
    page,
    pageSize: 10,
    excludeUserId: currentUserId
  })

  return (
    <>
      <UserActionsClient
        users={users}
        currentUserId={currentUserId}
        isSuperAdmin={isSuperAdmin}
        currentUser={currentUser}
      />
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
  const { session, user } = await caller.auth.getCurrentUser()
  const userStats = await getUserStats(session.userId)

  return (
    <div className="p-6 space-y-6">
      <UserStats stats={userStats} />

      <Suspense key={currentPage} fallback={<UsersTableSkeleton />}>
        <UsersContent page={currentPage} currentUserId={session.userId} currentUser={user as User} />
      </Suspense>
    </div>
  )
}
