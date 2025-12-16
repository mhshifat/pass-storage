"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RolesTable, RoleFormDialog, PermissionsDialog } from "@/modules/roles/client"

const roles = [
  {
    id: "1",
    name: "Super Admin",
    description: "Full system access with all permissions",
    users: 3,
    isSystem: true,
    createdAt: "2024-01-01",
  },
  {
    id: "2",
    name: "Admin",
    description: "Administrative access to most features",
    users: 8,
    isSystem: true,
    createdAt: "2024-01-01",
  },
  {
    id: "3",
    name: "Manager",
    description: "Can manage team members and passwords",
    users: 24,
    isSystem: true,
    createdAt: "2024-01-01",
  },
  {
    id: "4",
    name: "User",
    description: "Standard user with basic permissions",
    users: 1212,
    isSystem: true,
    createdAt: "2024-01-01",
  },
  {
    id: "5",
    name: "Auditor",
    description: "Read-only access for audit purposes",
    users: 5,
    isSystem: false,
    createdAt: "2024-03-15",
  },
]

const permissions = [
  {
    category: "User Management",
    items: [
      { id: "user.create", name: "Create Users", description: "Create new user accounts" },
      { id: "user.edit", name: "Edit Users", description: "Modify user information" },
      { id: "user.delete", name: "Delete Users", description: "Remove user accounts" },
      { id: "user.view", name: "View Users", description: "View user information" },
    ],
  },
  {
    category: "Password Management",
    items: [
      { id: "password.create", name: "Create Passwords", description: "Create new password entries" },
      { id: "password.edit", name: "Edit Passwords", description: "Modify password entries" },
      { id: "password.delete", name: "Delete Passwords", description: "Remove password entries" },
      { id: "password.view", name: "View Passwords", description: "View password entries" },
      { id: "password.share", name: "Share Passwords", description: "Share passwords with others" },
    ],
  },
  {
    category: "Group Management",
    items: [
      { id: "group.create", name: "Create Groups", description: "Create new groups" },
      { id: "group.edit", name: "Edit Groups", description: "Modify group settings" },
      { id: "group.delete", name: "Delete Groups", description: "Remove groups" },
      { id: "group.view", name: "View Groups", description: "View group information" },
    ],
  },
  {
    category: "System Settings",
    items: [
      { id: "settings.view", name: "View Settings", description: "View system settings" },
      { id: "settings.edit", name: "Edit Settings", description: "Modify system settings" },
      { id: "audit.view", name: "View Audit Logs", description: "Access audit logs" },
      { id: "role.manage", name: "Manage Roles", description: "Create and edit roles" },
    ],
  },
]

export default function RolesPage() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = React.useState(false)
  const [isPermissionsDialogOpen, setIsPermissionsDialogOpen] = React.useState(false)
  const [selectedRole, setSelectedRole] = React.useState<typeof roles[0] | null>(null)

  const handleCreateSubmit = (data: any) => {
    console.log("Create role:", data)
    setIsCreateDialogOpen(false)
  }

  const handleViewPermissions = (role: typeof roles[0]) => {
    setSelectedRole(role)
    setIsPermissionsDialogOpen(true)
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Roles & Permissions</h1>
          <p className="text-muted-foreground mt-1">
            Define roles and manage access permissions
          </p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Role
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Roles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5</div>
            <p className="text-xs text-muted-foreground">4 system, 1 custom</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">System Roles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4</div>
            <p className="text-xs text-muted-foreground">Pre-defined roles</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Custom Roles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1</div>
            <p className="text-xs text-muted-foreground">User-created roles</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Permissions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">17</div>
            <p className="text-xs text-muted-foreground">Available permissions</p>
          </CardContent>
        </Card>
      </div>

      <RolesTable roles={roles} onViewPermissions={handleViewPermissions} />

      <RoleFormDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSubmit={handleCreateSubmit}
      />

      <PermissionsDialog
        open={isPermissionsDialogOpen}
        onOpenChange={setIsPermissionsDialogOpen}
        role={selectedRole}
        permissions={permissions}
      />
    </div>
  )
}
