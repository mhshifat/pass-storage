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
import { useRouter, useSearchParams } from "next/navigation"
import { trpc } from "@/trpc/client"
import { toast } from "sonner"
import { usePermissions } from "@/hooks/use-permissions"

interface PasswordShare {
  shareId: string
  teamId: string | null
  teamName: string
  expiresAt: Date | null
}

interface Password {
  id: string
  name: string
  username: string
  url?: string | null
  folder: string | null
  strength: "strong" | "medium" | "weak"
  shared: boolean
  sharedWith: PasswordShare[] | string[] // Can be array of strings (legacy) or PasswordShare objects
  lastModified: string
  expiresIn: number | null
  hasTotp: boolean
  isOwner?: boolean
}

interface PasswordsTableProps {
  passwords: Password[]
  onViewDetails: (password: Password) => void
  onEdit?: (password: Password) => void
  onDelete?: (password: Password) => void
  onShare?: (password: Password) => void
}

// Component to handle password copy functionality
function PasswordCell({ passwordId }: { passwordId: string }) {
  const [isCopying, setIsCopying] = React.useState(false)
  const { refetch } = trpc.passwords.getPassword.useQuery(
    { id: passwordId },
    {
      enabled: false, // Only fetch when button is clicked
    }
  )

  const handleCopyPassword = async () => {
    try {
      setIsCopying(true)
      const result = await refetch()
      if (result.data?.password) {
        await navigator.clipboard.writeText(result.data.password)
        toast.success("Password copied to clipboard")
      }
    } catch (error) {
      toast.error("Failed to get password")
    } finally {
      setIsCopying(false)
    }
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-mono text-muted-foreground">••••••••</span>
      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6"
        onClick={handleCopyPassword}
        disabled={isCopying}
        title="Copy password"
      >
        <Copy className="h-3 w-3" />
      </Button>
    </div>
  )
}

// Component to handle TOTP copy functionality
function TotpCell({ passwordId }: { passwordId: string }) {
  const [isCopying, setIsCopying] = React.useState(false)
  const { refetch } = trpc.passwords.generateTotp.useQuery(
    { id: passwordId },
    {
      enabled: false, // Only fetch when button is clicked
    }
  )

  const handleCopyTotp = async () => {
    try {
      setIsCopying(true)
      const result = await refetch()
      if (result.data?.totpCode) {
        await navigator.clipboard.writeText(result.data.totpCode)
        toast.success("TOTP code copied to clipboard")
      }
    } catch (error) {
      toast.error("Failed to generate TOTP code")
    } finally {
      setIsCopying(false)
    }
  }

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1">
        <Clock className="h-4 w-4 text-green-600" />
        <span className="text-xs font-medium text-green-600">Enabled</span>
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6"
        onClick={handleCopyTotp}
        disabled={isCopying}
        title="Copy TOTP code"
      >
        <Copy className="h-3 w-3" />
      </Button>
    </div>
  )
}

export function PasswordsTable({ passwords, onViewDetails, onEdit, onDelete, onShare }: PasswordsTableProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const utils = trpc.useUtils()
  const { hasPermission } = usePermissions()
  const [searchQuery, setSearchQuery] = React.useState(searchParams.get("search") || "")
  const [copyingPasswordId, setCopyingPasswordId] = React.useState<string | null>(null)
  const [copyingTotpId, setCopyingTotpId] = React.useState<string | null>(null)

  React.useEffect(() => {
    setSearchQuery(searchParams.get("search") || "")
  }, [searchParams])

  const handleSearchChange = (value: string) => {
    setSearchQuery(value)
    const params = new URLSearchParams(searchParams)
    if (value) {
      params.set("search", value)
      params.set("page", "1") // Reset to first page on search
    } else {
      params.delete("search")
    }
    router.push(`?${params.toString()}`)
  }

  const handleCopyPassword = async (passwordId: string) => {
    try {
      setCopyingPasswordId(passwordId)
      const result = await utils.passwords.getPassword.fetch({ id: passwordId })
      if (result?.password) {
        await navigator.clipboard.writeText(result.password)
        toast.success("Password copied to clipboard")
      }
    } catch (error) {
      toast.error("Failed to get password")
    } finally {
      setCopyingPasswordId(null)
    }
  }

  const handleCopyTotp = async (passwordId: string) => {
    try {
      setCopyingTotpId(passwordId)
      const result = await utils.passwords.generateTotp.fetch({ id: passwordId })
      if (result?.totpCode) {
        await navigator.clipboard.writeText(result.totpCode)
        toast.success("TOTP code copied to clipboard")
      }
    } catch (error) {
      toast.error("Failed to generate TOTP code")
    } finally {
      setCopyingTotpId(null)
    }
  }

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
              onChange={(e) => handleSearchChange(e.target.value)}
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
              <TableHead>Password</TableHead>
              <TableHead>Folder</TableHead>
              <TableHead>Strength</TableHead>
              <TableHead>TOTP</TableHead>
              <TableHead>Shared</TableHead>
              <TableHead>Expires</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {passwords.map((pwd) => (
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
                  {hasPermission("password.view") ? (
                    <PasswordCell passwordId={pwd.id} />
                  ) : (
                    <span className="text-xs text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell>
                  {pwd.folder ? (
                    <Badge variant="outline">{pwd.folder}</Badge>
                  ) : (
                    <span className="text-xs text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell>{getStrengthBadge(pwd.strength)}</TableCell>
                <TableCell>
                  {hasPermission("password.view") ? (
                    pwd.hasTotp ? (
                      <TotpCell passwordId={pwd.id} />
                    ) : (
                      <span className="text-xs text-muted-foreground">-</span>
                    )
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
                <TableCell>
                  {pwd.expiresIn !== null ? getExpiryBadge(pwd.expiresIn) : <span className="text-xs text-muted-foreground">-</span>}
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
                      <DropdownMenuItem onClick={() => onViewDetails(pwd)}>
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </DropdownMenuItem>
                      {hasPermission("password.view") && (
                        <>
                          <DropdownMenuItem
                            onClick={() => handleCopyPassword(pwd.id)}
                            disabled={copyingPasswordId === pwd.id}
                          >
                            <Copy className="mr-2 h-4 w-4" />
                            {copyingPasswordId === pwd.id ? "Copying..." : "Copy Password"}
                          </DropdownMenuItem>
                          {pwd.hasTotp && (
                            <DropdownMenuItem
                              onClick={() => handleCopyTotp(pwd.id)}
                              disabled={copyingTotpId === pwd.id}
                            >
                              <Clock className="mr-2 h-4 w-4" />
                              {copyingTotpId === pwd.id ? "Generating..." : "Copy TOTP Code"}
                            </DropdownMenuItem>
                          )}
                        </>
                      )}
                      {hasPermission("password.edit") && (
                        <DropdownMenuItem onClick={() => onEdit?.(pwd)}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                      )}
                      {hasPermission("password.share") && (
                        <DropdownMenuItem onClick={() => onShare?.(pwd)}>
                          <Share2 className="mr-2 h-4 w-4" />
                          Share
                        </DropdownMenuItem>
                      )}
                      {hasPermission("password.delete") && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => onDelete?.(pwd)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </>
                      )}
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
