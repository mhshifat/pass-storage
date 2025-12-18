"use client"

import * as React from "react"
import { useActionState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { toast } from "sonner"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { RoleFormDialog } from "./role-form-dialog"
import { RolesTable } from "./roles-table"
import { PermissionsDialog } from "./permissions-dialog"
import { createRoleAction, updateRoleAction, deleteRoleAction } from "@/app/admin/roles/actions"
import { trpc } from "@/trpc/client"

interface Role {
  id: string
  name: string
  description: string | null
  users: number
  isSystem: boolean
  createdAt: string
}

interface RolesActionsClientProps {
  roles: Role[]
}

export function RolesActionsClient({ roles }: RolesActionsClientProps) {
  // Fetch permissions from database
  const { data: permissionsData } = trpc.roles.getAllPermissions.useQuery()
  
  // Transform permissions data to match the expected format
  const permissions = React.useMemo(() => {
    if (!permissionsData) {
      // Fallback to empty array while loading
      return []
    }
    return permissionsData.map((category) => ({
      category: category.category,
      items: category.items.map((item) => ({
        id: item.id,
        key: item.key,
        name: item.name,
        description: item.description,
      })),
    }))
  }, [permissionsData])
  const router = useRouter()
  const [isCreateDialogOpen, setIsCreateDialogOpen] = React.useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false)
  const [isPermissionsDialogOpen, setIsPermissionsDialogOpen] = React.useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false)
  const [selectedRole, setSelectedRole] = React.useState<Role | null>(null)
  const [roleToEdit, setRoleToEdit] = React.useState<Role | null>(null)
  const [roleToDelete, setRoleToDelete] = React.useState<string | null>(null)

  const [createState, createFormAction, createPending] = useActionState(createRoleAction, null)
  const [updateState, updateFormAction, updatePending] = useActionState(
    updateRoleAction.bind(null, roleToEdit?.id || ""),
    null
  )

  React.useEffect(() => {
    if (createState?.success) {
      toast.success("Role created successfully")
      setIsCreateDialogOpen(false)
      router.refresh()
    } else if (createState?.error) {
      toast.error(createState.error)
    }
  }, [createState, router])

  React.useEffect(() => {
    if (updateState?.success) {
      toast.success("Role updated successfully")
      setIsEditDialogOpen(false)
      setRoleToEdit(null)
      router.refresh()
    } else if (updateState?.error) {
      toast.error(updateState.error)
    }
  }, [updateState, router])

  const handleViewPermissions = (role: Role) => {
    setSelectedRole(role)
    setIsPermissionsDialogOpen(true)
  }

  const handleEdit = (role: Role) => {
    setRoleToEdit(role)
    setIsEditDialogOpen(true)
  }

  const handleDelete = (role: Role) => {
    setRoleToDelete(role.id)
    setIsDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (roleToDelete) {
      const result = await deleteRoleAction(roleToDelete)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success("Role has been successfully deleted.")
        router.refresh()
      }
      setIsDeleteDialogOpen(false)
      setRoleToDelete(null)
    }
  }

  return (
    <>
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
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

      <RolesTable 
        roles={roles} 
        onViewPermissions={handleViewPermissions}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onCreateRole={() => setIsCreateDialogOpen(true)}
      />

      <RoleFormDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        mode="create"
        formAction={createFormAction}
        isPending={createPending}
        state={createState}
      />

      <RoleFormDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        role={roleToEdit}
        mode="edit"
        formAction={updateFormAction}
        isPending={updatePending}
        state={updateState}
      />

      <PermissionsDialog
        open={isPermissionsDialogOpen}
        onOpenChange={setIsPermissionsDialogOpen}
        role={selectedRole}
        permissions={permissions}
      />

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the role
              and remove all associated permissions. Users assigned to this role will need to be reassigned.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

