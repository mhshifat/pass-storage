import { Suspense } from "react"
import { RolesActionsClient, RolesTableSkeleton } from "@/modules/roles/client"
import { caller } from "@/trpc/server"
import { RolesPageHeader } from "./roles-page-header"
import { RoleStatsClient } from "./role-stats-client"

async function getRoleStats() {
  const stats = await caller.roles.stats()
  return stats
}

async function RolesContent() {
  const { roles } = await caller.roles.list({
    page: 1,
    pageSize: 100,
  })

  // Transform roles to match the expected interface
  const transformedRoles = roles.map((role) => ({
    id: role.id,
    name: role.name,
    description: role.description || "",
    users: role.users,
    isSystem: role.isSystem,
    createdAt: role.createdAt,
  }))

  return <RolesActionsClient roles={transformedRoles} />
}

export default async function RolesPage() {
  const roleStats = await getRoleStats()

  return (
    <div className="p-6 space-y-6">
      <RoleStatsClient stats={roleStats} />

      <Suspense fallback={<RolesTableSkeleton />}>
        <RolesContent />
      </Suspense>
    </div>
  )
}
