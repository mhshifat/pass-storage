"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { GroupsTable, GroupFormDialog, GroupMembersDialog } from "@/modules/groups/client"

const groups = [
  {
    id: "1",
    name: "Development Team",
    description: "Development and engineering team",
    members: 24,
    passwords: 45,
    createdAt: "2024-01-15",
    manager: "John Doe",
  },
  {
    id: "2",
    name: "DevOps",
    description: "Infrastructure and operations team",
    members: 8,
    passwords: 78,
    createdAt: "2024-02-10",
    manager: "Jane Smith",
  },
  {
    id: "3",
    name: "Marketing",
    description: "Marketing and communications",
    members: 12,
    passwords: 23,
    createdAt: "2024-03-05",
    manager: "Mike Johnson",
  },
  {
    id: "4",
    name: "Sales",
    description: "Sales and customer success",
    members: 18,
    passwords: 34,
    createdAt: "2024-03-20",
    manager: "Sarah Williams",
  },
  {
    id: "5",
    name: "Executive",
    description: "Executive leadership team",
    members: 5,
    passwords: 12,
    createdAt: "2024-01-01",
    manager: "Tom Brown",
  },
]

const groupMembers = [
  {
    id: "1",
    name: "John Doe",
    email: "john.doe@company.com",
    role: "Manager",
    avatar: "/avatars/01.png",
  },
  {
    id: "2",
    name: "Jane Smith",
    email: "jane.smith@company.com",
    role: "Member",
    avatar: "/avatars/02.png",
  },
  {
    id: "3",
    name: "Mike Johnson",
    email: "mike.johnson@company.com",
    role: "Member",
    avatar: "/avatars/03.png",
  },
]

export default function GroupsPage() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = React.useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = React.useState(false)
  const [selectedGroup, setSelectedGroup] = React.useState<typeof groups[0] | null>(null)

  const handleCreateSubmit = (data: any) => {
    console.log("Create group:", data)
    setIsCreateDialogOpen(false)
  }

  const handleViewMembers = (group: typeof groups[0]) => {
    setSelectedGroup(group)
    setIsViewDialogOpen(true)
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Groups</h1>
          <p className="text-muted-foreground mt-1">
            Manage teams and organize password access
          </p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Group
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Groups</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">34</div>
            <p className="text-xs text-muted-foreground">+2 from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Members</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">847</div>
            <p className="text-xs text-muted-foreground">Across all groups</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Shared Passwords</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,234</div>
            <p className="text-xs text-muted-foreground">Average 36 per group</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Avg Group Size</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">25</div>
            <p className="text-xs text-muted-foreground">Members per group</p>
          </CardContent>
        </Card>
      </div>

      <GroupsTable groups={groups} onViewMembers={handleViewMembers} />

      <GroupFormDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSubmit={handleCreateSubmit}
      />

      <GroupMembersDialog
        open={isViewDialogOpen}
        onOpenChange={setIsViewDialogOpen}
        group={selectedGroup}
        members={groupMembers}
      />
    </div>
  )
}
