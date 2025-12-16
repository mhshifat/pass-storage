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
import {
  Search,
  MoreHorizontal,
  Pencil,
  Trash2,
  Eye,
  Copy,
  Share2,
  FolderKey,
  Clock,
} from "lucide-react"

interface Password {
  id: string
  name: string
  username: string
  url?: string
  folder: string
  strength: "strong" | "medium" | "weak"
  shared: boolean
  sharedWith: string[]
  lastModified: string
  expiresIn: number
  owner: string
  hasTotp: boolean
  totpSecret?: string
}

interface PasswordsTableProps {
  passwords: Password[]
  onViewDetails: (password: Password) => void
}

export function PasswordsTable({ passwords, onViewDetails }: PasswordsTableProps) {
  const [searchQuery, setSearchQuery] = React.useState("")

  const filteredPasswords = passwords.filter(
    (pwd) =>
      pwd.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pwd.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pwd.folder.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getStrengthBadge = (strength: string) => {
    switch (strength) {
      case "strong":
        return <Badge className="bg-green-100 text-green-800 border-green-200">Strong</Badge>
      case "medium":
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Medium</Badge>
      case "weak":
        return <Badge className="bg-red-100 text-red-800 border-red-200">Weak</Badge>
      default:
        return <Badge variant="outline">{strength}</Badge>
    }
  }

  const getExpiryBadge = (days: number) => {
    if (days < 0) {
      return <Badge className="bg-red-100 text-red-800 border-red-200">Expired</Badge>
    } else if (days < 7) {
      return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Expiring Soon</Badge>
    } else if (days < 30) {
      return <Badge className="bg-blue-100 text-blue-800 border-blue-200">{days} days</Badge>
    }
    return <Badge variant="outline">{days} days</Badge>
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search passwords..."
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
              <TableHead>Name</TableHead>
              <TableHead>Username</TableHead>
              <TableHead>Folder</TableHead>
              <TableHead>Strength</TableHead>
              <TableHead>TOTP</TableHead>
              <TableHead>Shared</TableHead>
              <TableHead>Expires</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPasswords.map((pwd) => (
              <TableRow key={pwd.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <FolderKey className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="font-medium">{pwd.name}</div>
                      {pwd.url && (
                        <div className="text-xs text-muted-foreground truncate max-w-[200px]">
                          {pwd.url}
                        </div>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-sm">{pwd.username}</span>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{pwd.folder}</Badge>
                </TableCell>
                <TableCell>{getStrengthBadge(pwd.strength)}</TableCell>
                <TableCell>
                  {pwd.hasTotp ? (
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4 text-green-600" />
                      <span className="text-xs font-medium text-green-600">Enabled</span>
                    </div>
                  ) : (
                    <span className="text-xs text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell>
                  {pwd.shared ? (
                    <div className="flex items-center gap-1">
                      <Share2 className="h-4 w-4 text-blue-600" />
                      <span className="text-xs text-muted-foreground">
                        {pwd.sharedWith.length} {pwd.sharedWith.length === 1 ? "team" : "teams"}
                      </span>
                    </div>
                  ) : (
                    <span className="text-xs text-muted-foreground">Private</span>
                  )}
                </TableCell>
                <TableCell>{getExpiryBadge(pwd.expiresIn)}</TableCell>
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
                      <DropdownMenuItem onClick={() => onViewDetails(pwd)}>
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Copy className="mr-2 h-4 w-4" />
                        Copy Password
                      </DropdownMenuItem>
                      {pwd.hasTotp && (
                        <DropdownMenuItem>
                          <Clock className="mr-2 h-4 w-4" />
                          Copy TOTP Code
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem>
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Share2 className="mr-2 h-4 w-4" />
                        Share
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-red-600">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
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
