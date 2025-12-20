"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { trpc } from "@/trpc/client"
import { Loader2 } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ChangePasswordForm } from "@/modules/users/client/change-password-form"

export default function ProfilePage() {
  const { data: authData, isLoading, error } = trpc.auth.getCurrentUser.useQuery()
  const user = authData?.user

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-destructive">
              <p>Failed to load profile: {error.message}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p>User not found</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Profile</h1>
        <p className="text-muted-foreground mt-1">View and manage your account information</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>Your account details and information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src="" alt={user.name} />
              <AvatarFallback className="text-lg">{initials}</AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-2xl font-semibold">{user.name}</h2>
              <p className="text-muted-foreground">{user.email}</p>
              <div className="mt-2">
                <Badge variant="secondary">{user.role}</Badge>
              </div>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Email</label>
              <p className="text-sm font-medium">{user.email}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Role</label>
              <p className="text-sm font-medium">
                <Badge variant="secondary">{user.role}</Badge>
              </p>
            </div>
            {user.phoneNumber && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Phone Number</label>
                <p className="text-sm font-medium">{user.phoneNumber}</p>
              </div>
            )}
            <div>
              <label className="text-sm font-medium text-muted-foreground">MFA Status</label>
              <p className="text-sm font-medium">
                <Badge variant={user.mfaEnabled ? "default" : "secondary"}>
                  {user.mfaEnabled ? "Enabled" : "Disabled"}
                </Badge>
                {user.mfaEnabled && user.mfaMethod && (
                  <span className="ml-2 text-xs text-muted-foreground">({user.mfaMethod})</span>
                )}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Separator />

      <ChangePasswordForm />
    </div>
  )
}
