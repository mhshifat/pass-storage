import { Suspense } from "react"
import { RolesActionsClient, RolesTableSkeleton, RoleStats } from "@/modules/roles/client"
import { caller } from "@/trpc/server"

async function getRoleStats() {
  const { total, system, custom, permissions } = await caller.roles.stats()
  return [
    {
      label: "Total Roles",
      value: total.toLocaleString(),
      description: `${system} system, ${custom} custom`,
    },
    {
      label: "System Roles",
      value: system.toLocaleString(),
      description: "Pre-defined roles",
    },
    {
      label: "Custom Roles",
      value: custom.toLocaleString(),
      description: "User-created roles",
    },
    {
      label: "Permissions",
      value: permissions.toLocaleString(),
      description: "Available permissions",
    },
  ]
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
      <RoleStats stats={roleStats} />

      <Suspense fallback={<RolesTableSkeleton />}>
        <RolesContent />
      </Suspense>
    </div>
  )
}
