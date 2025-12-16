"use client"

import * as React from "react"
import { useActionState } from "react"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
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
import { toast } from "sonner"
import { UserFormDialog } from "./user-form-dialog"
import { UsersTable } from "./users-table"
import { ResetPasswordDialog } from "./reset-password-dialog"
import { SendEmailDialog } from "./send-email-dialog"
import { createUserAction, updateUserAction, deleteUserAction, resetPasswordAction } from "@/app/admin/users/actions"
import { sendEmailAction } from "@/app/admin/users/email-actions"
import { useRouter } from "next/navigation"

interface User {
  id: string
  name: string
  email: string
  role: string
  mfaEnabled: boolean
  isActive: boolean
  lastLoginAt: Date | null
  createdAt: Date
  updatedAt: Date
}

interface UserActionsClientProps {
  users: User[]
}

export function UserActionsClient({ users }: UserActionsClientProps) {
  const router = useRouter()
  const [isCreateDialogOpen, setIsCreateDialogOpen] = React.useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false)
  const [isResetPasswordDialogOpen, setIsResetPasswordDialogOpen] = React.useState(false)
  const [isSendEmailDialogOpen, setIsSendEmailDialogOpen] = React.useState(false)
  const [selectedUser, setSelectedUser] = React.useState<User | null>(null)
  const [userToDelete, setUserToDelete] = React.useState<string | null>(null)
  const [userToResetPassword, setUserToResetPassword] = React.useState<{ id: string; name: string } | null>(null)
  const [userToEmail, setUserToEmail] = React.useState<{ id: string; name: string; email: string } | null>(null)

  const [createState, createFormAction, createPending] = useActionState(createUserAction, null)
  const [updateState, updateFormAction, updatePending] = useActionState(
    updateUserAction.bind(null, selectedUser?.id || ""),
    null
  )

  const handleEdit = (user: { id: string; name: string; email: string; role: string; status: string; mfa: boolean }) => {
    const foundUser = users.find((u) => u.id === user.id)
    if (foundUser) {
      setSelectedUser(foundUser)
      setIsEditDialogOpen(true)
    }
  }

  const handleDelete = (userId: string) => {
    setUserToDelete(userId)
    setIsDeleteDialogOpen(true)
  }

  const handleResetPassword = (userId: string) => {
    const user = users.find((u) => u.id === userId)
    if (user) {
      setUserToResetPassword({ id: user.id, name: user.name })
      setIsResetPasswordDialogOpen(true)
    }
  }

  const handleEmail = (userId: string) => {
    const user = users.find((u) => u.id === userId)
    if (user) {
      setUserToEmail({ id: user.id, name: user.name, email: user.email })
      setIsSendEmailDialogOpen(true)
    }
  }

  const confirmEmail = async (subject: string, message: string) => {
    if (userToEmail) {
      const formData = new FormData()
      formData.append("userId", userToEmail.id)
      formData.append("subject", subject)
      formData.append("message", message)

      const result = await sendEmailAction(null, formData)
      if (result.error) {
        throw new Error(result.error)
      }
      toast.success(`Email sent successfully to ${userToEmail.email}.`)
      router.refresh()
      setUserToEmail(null)
    }
  }

  const confirmResetPassword = async (currentPassword: string, newPassword: string) => {
    if (userToResetPassword) {
      const result = await resetPasswordAction(userToResetPassword.id, currentPassword, newPassword)
      if (result.error) {
        throw new Error(result.error)
      }
      toast.success("Password has been reset successfully.")
      router.refresh()
      setUserToResetPassword(null)
    }
  }

  const confirmDelete = async () => {
    if (userToDelete) {
      const result = await deleteUserAction(userToDelete)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success("User has been successfully deleted.")
        router.refresh()
      }
      setIsDeleteDialogOpen(false)
      setUserToDelete(null)
    }
  }

  React.useEffect(() => {
    if (createState?.success) {
      setIsCreateDialogOpen(false)
      toast.success("User created successfully.")
      router.refresh()
    }
  }, [createState, router])

  React.useEffect(() => {
    if (updateState?.success) {
      setIsEditDialogOpen(false)
      toast.success("User updated successfully.")
      router.refresh()
    }
  }, [updateState, router])

  // Map users to the format expected by UsersTable
  const mappedUsers = users.map((user) => ({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    status: user.isActive ? "active" : "inactive",
    mfa: user.mfaEnabled,
    lastLogin: user.lastLoginAt 
      ? new Date(user.lastLoginAt).toLocaleString() 
      : "Never",
    avatar: `/avatars/0${(users.indexOf(user) % 5) + 1}.png`,
  }))

  return (
    <>
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Users</h1>
          <p className="text-muted-foreground mt-1">
            Manage user accounts and permissions
          </p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add User
        </Button>
      </div>

      <UsersTable 
        users={mappedUsers} 
        onEdit={handleEdit} 
        onDelete={handleDelete} 
        onResetPassword={handleResetPassword}
        onEmail={handleEmail}
        onAddUser={() => setIsCreateDialogOpen(true)}
      />

      <UserFormDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        mode="create"
        formAction={createFormAction}
        isPending={createPending}
        state={createState}
      />

      <UserFormDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        user={
          selectedUser
            ? {
                id: selectedUser.id,
                name: selectedUser.name,
                email: selectedUser.email,
                role: selectedUser.role,
                status: selectedUser.isActive ? "active" : "inactive",
                mfa: selectedUser.mfaEnabled,
              }
            : null
        }
        mode="edit"
        formAction={updateFormAction}
        isPending={updatePending}
        state={updateState}
      />

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the user account
              and remove their data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <ResetPasswordDialog
        open={isResetPasswordDialogOpen}
        onOpenChange={setIsResetPasswordDialogOpen}
        onConfirm={confirmResetPassword}
        userName={userToResetPassword?.name}
      />

      <SendEmailDialog
        open={isSendEmailDialogOpen}
        onOpenChange={setIsSendEmailDialogOpen}
        onConfirm={confirmEmail}
        userEmail={userToEmail?.email}
        userName={userToEmail?.name}
      />
    </>
  )
}
