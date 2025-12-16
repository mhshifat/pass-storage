"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Search, MoreHorizontal, Pencil, Trash2, Users, FolderKey } from "lucide-react"

interface Group {
  id: string
  name: string
  description: string
  members: number
  passwords: number
  createdAt: string
  manager: string
}

interface GroupsTableProps {
  groups: Group[]
  onViewMembers: (group: Group) => void
  onEdit?: (group: Group) => void
  onDelete?: (groupId: string) => void
}

export function GroupsTable({ groups, onViewMembers, onEdit, onDelete }: GroupsTableProps) {
  const [searchQuery, setSearchQuery] = React.useState("")

  const filteredGroups = groups.filter(
    (group) =>
      group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      group.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search groups..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Group Name</TableHead>
              <TableHead>Manager</TableHead>
              <TableHead>Members</TableHead>
              <TableHead>Passwords</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredGroups.map((group) => (
              <TableRow key={group.id}>
                <TableCell>
                  <div>
                    <div className="font-medium">{group.name}</div>
                    <div className="text-sm text-muted-foreground">{group.description}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm">{group.manager}</div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">{group.members}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <FolderKey className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">{group.passwords}</span>
                  </div>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {new Date(group.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => onViewMembers(group)}>
                        <Users className="mr-2 h-4 w-4" />
                        View Members
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onEdit?.(group)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit Group
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <FolderKey className="mr-2 h-4 w-4" />
                        Manage Passwords
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-red-600"
                        onClick={() => onDelete?.(group.id)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete Group
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
