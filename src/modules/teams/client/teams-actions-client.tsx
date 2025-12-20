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
import { TeamFormDialog } from "./team-form-dialog"
import { TeamsTable } from "./teams-table"
import { TeamMembersDialog } from "./team-members-dialog"
import { TeamPasswordsDialog } from "./team-passwords-dialog"
import { TeamsPagination } from "./teams-pagination"
import { createTeamAction, updateTeamAction, deleteTeamAction } from "@/app/admin/teams/actions"
import { usePermissions } from "@/hooks/use-permissions"

interface Team {
  id: string
  name: string
  description: string | null
  members: number
  passwords: number
  createdAt: string
  manager: string
}

interface TeamsActionsClientProps {
  teams: Team[]
  pagination: {
    page: number
    pageSize: number
    total: number
    totalPages: number
  }
}

export function TeamsActionsClient({ teams, pagination }: TeamsActionsClientProps) {
  const router = useRouter()
  const { hasPermission } = usePermissions()
  const [isCreateDialogOpen, setIsCreateDialogOpen] = React.useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = React.useState(false)
  const [isPasswordsDialogOpen, setIsPasswordsDialogOpen] = React.useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false)
  const [selectedTeam, setSelectedTeam] = React.useState<Team | null>(null)
  const [teamToEdit, setTeamToEdit] = React.useState<Team | null>(null)
  const [teamToDelete, setTeamToDelete] = React.useState<string | null>(null)

  const [createState, createFormAction, createPending] = useActionState(createTeamAction, null)
  const [updateState, updateFormAction, updatePending] = useActionState(
    updateTeamAction.bind(null, teamToEdit?.id || ""),
    null
  )

  React.useEffect(() => {
    if (createState?.success) {
      toast.success("Team created successfully")
      setIsCreateDialogOpen(false)
      router.refresh()
    } else if (createState?.error) {
      toast.error(createState.error)
    }
  }, [createState, router])

  React.useEffect(() => {
    if (updateState?.success) {
      toast.success("Team updated successfully")
      setIsEditDialogOpen(false)
      setTeamToEdit(null)
      router.refresh()
    } else if (updateState?.error) {
      toast.error(updateState.error)
    }
  }, [updateState, router])

  const handleViewMembers = (team: Team) => {
    setSelectedTeam(team)
    setIsViewDialogOpen(true)
  }

  const handleManagePasswords = (team: Team) => {
    setSelectedTeam(team)
    setIsPasswordsDialogOpen(true)
  }

  const handleEdit = (team: Team) => {
    setTeamToEdit(team)
    setIsEditDialogOpen(true)
  }

  const handleDelete = (teamId: string) => {
    setTeamToDelete(teamId)
    setIsDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!teamToDelete) return

    try {
      const result = await deleteTeamAction(teamToDelete)
      if (result.success) {
        toast.success("Team deleted successfully")
        setIsDeleteDialogOpen(false)
        setTeamToDelete(null)
        router.refresh()
      } else if (result.error) {
        toast.error(result.error)
      }
    } catch {
      toast.error("Failed to delete team")
    }
  }

  return (
    <>
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Teams</h1>
          <p className="text-muted-foreground mt-1">
            Manage teams and organize password access
          </p>
        </div>
        {hasPermission("team.create") && (
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create Team
          </Button>
        )}
      </div>

      <TeamsTable
        teams={teams}
        onViewMembers={handleViewMembers}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onCreateTeam={() => setIsCreateDialogOpen(true)}
        onManagePasswords={handleManagePasswords}
      />

      {teams.length > 0 && (
        <TeamsPagination
          currentPage={pagination.page}
          totalPages={pagination.totalPages}
          total={pagination.total}
          pageSize={pagination.pageSize}
        />
      )}

      <TeamFormDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        mode="create"
        formAction={createFormAction}
        isPending={createPending}
        state={createState}
      />

      <TeamFormDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        team={teamToEdit ? { id: teamToEdit.id, name: teamToEdit.name, description: teamToEdit.description || null } : null}
        mode="edit"
        formAction={updateFormAction}
        isPending={updatePending}
        state={updateState}
      />

      <TeamMembersDialog
        open={isViewDialogOpen}
        onOpenChange={setIsViewDialogOpen}
        team={selectedTeam ? { id: selectedTeam.id, name: selectedTeam.name } : null}
      />

      <TeamPasswordsDialog
        open={isPasswordsDialogOpen}
        onOpenChange={setIsPasswordsDialogOpen}
        team={selectedTeam ? { id: selectedTeam.id, name: selectedTeam.name } : null}
      />

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the team and remove all
              associated members and password shares.
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

