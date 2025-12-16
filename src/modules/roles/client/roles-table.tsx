"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Search, MoreHorizontal, Pencil, Trash2, Shield } from "lucide-react"

interface Role {
  id: string
  name: string
  description: string
  users: number
  isSystem: boolean
  createdAt: string
}

interface RolesTableProps {
  roles: Role[]
  onViewPermissions: (role: Role) => void
}

export function RolesTable({ roles, onViewPermissions }: RolesTableProps) {
  const [searchQuery, setSearchQuery] = React.useState("")

  const filteredRoles = roles.filter(
    (role) =>
      role.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      role.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search roles..."
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
              <TableHead>Role Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Users</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRoles.map((role) => (
              <TableRow key={role.id}>
                <TableCell>
                  <div>
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{role.name}</span>
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      {role.description}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={role.isSystem ? "secondary" : "default"}>
                    {role.isSystem ? "System" : "Custom"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <span className="text-sm font-medium">{role.users}</span>
                  <span className="text-sm text-muted-foreground"> users</span>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {new Date(role.createdAt).toLocaleDateString()}
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
                      <DropdownMenuItem onClick={() => onViewPermissions(role)}>
                        <Shield className="mr-2 h-4 w-4" />
                        View Permissions
                      </DropdownMenuItem>
                      <DropdownMenuItem disabled={role.isSystem}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit Role
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem disabled={role.isSystem} className="text-red-600">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete Role
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
