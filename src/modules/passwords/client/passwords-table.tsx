"use client"

import * as React from "react"
import { useTranslation } from "react-i18next"
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
  CheckSquare,
  Square,
  RotateCw,
  AlertCircle,
} from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
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
  selectedIds?: string[]
  onSelectionChange?: (selectedIds: string[]) => void
}

// Component to handle password copy functionality
function PasswordCell({ passwordId }: { passwordId: string }) {
  const { t } = useTranslation()
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
        toast.success(t("passwords.passwordCopied"))
      }
    } catch (error) {
      toast.error(t("passwords.passwordCopyFailed"))
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
        title={t("passwords.copyPassword")}
      >
        <Copy className="h-3 w-3" />
      </Button>
    </div>
  )
}

// Component to handle TOTP copy functionality
function TotpCell({ passwordId }: { passwordId: string }) {
  const { t } = useTranslation()
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
        toast.success(t("passwords.totpCodeCopied"))
      }
    } catch (error) {
      toast.error(t("passwords.totpCodeFailed"))
    } finally {
      setIsCopying(false)
    }
  }

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1">
        <Clock className="h-4 w-4 text-green-600" />
        <span className="text-xs font-medium text-green-600">{t("mfa.enabled")}</span>
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6"
        onClick={handleCopyTotp}
        disabled={isCopying}
        title={t("passwords.copyTotpCode")}
      >
        <Copy className="h-3 w-3" />
      </Button>
    </div>
  )
}

export function PasswordsTable({ 
  passwords, 
  onViewDetails, 
  onEdit, 
  onDelete, 
  onShare,
  selectedIds = [],
  onSelectionChange,
}: PasswordsTableProps) {
  const { t } = useTranslation()
  const router = useRouter()
  const searchParams = useSearchParams()
  const utils = trpc.useUtils()
  const { hasPermission } = usePermissions()
  const [searchQuery, setSearchQuery] = React.useState(searchParams.get("search") || "")
  const [copyingPasswordId, setCopyingPasswordId] = React.useState<string | null>(null)
  const [copyingTotpId, setCopyingTotpId] = React.useState<string | null>(null)

  // Fetch rotation reminders to show indicators
  const { data: reminders } = trpc.passwordRotation.getReminders.useQuery(
    { daysAhead: 365 },
    { enabled: hasPermission("password.view") }
  )

  const getPasswordReminder = (passwordId: string) => {
    if (!reminders) return null
    return reminders.find((r) => r.passwordId === passwordId)
  }

  const handleSelectAll = (checked: boolean) => {
    if (onSelectionChange) {
      onSelectionChange(checked ? passwords.map((p) => p.id) : [])
    }
  }

  const handleSelectOne = (passwordId: string, checked: boolean) => {
    if (onSelectionChange) {
      if (checked) {
        onSelectionChange([...selectedIds, passwordId])
      } else {
        onSelectionChange(selectedIds.filter((id) => id !== passwordId))
      }
    }
  }

  const allSelected = passwords.length > 0 && selectedIds.length === passwords.length
  const someSelected = selectedIds.length > 0 && selectedIds.length < passwords.length

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
        toast.success(t("passwords.passwordCopied"))
      }
    } catch (error) {
      toast.error(t("passwords.passwordCopyFailed"))
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
        toast.success(t("passwords.totpCodeCopied"))
      }
    } catch (error) {
      toast.error(t("passwords.totpCodeFailed"))
    } finally {
      setCopyingTotpId(null)
    }
  }

  const getStrengthBadge = (strength: string) => {
    switch (strength) {
      case "strong":
        return <Badge className="bg-green-100 text-green-800 border-green-200">{t("passwords.strong")}</Badge>
      case "medium":
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">{t("passwords.medium")}</Badge>
      case "weak":
        return <Badge className="bg-red-100 text-red-800 border-red-200">{t("passwords.weak")}</Badge>
      default:
        return <Badge variant="outline">{strength}</Badge>
    }
  }

  const getExpiryBadge = (days: number) => {
    if (days < 0) {
      return <Badge className="bg-red-100 text-red-800 border-red-200">{t("passwords.expired")}</Badge>
    } else if (days < 7) {
      return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">{t("passwords.expiringSoon")}</Badge>
    } else if (days < 30) {
      return <Badge className="bg-blue-100 text-blue-800 border-blue-200">{t("passwords.daysRemaining", { days })}</Badge>
    }
    return <Badge variant="outline">{t("passwords.daysRemaining", { days })}</Badge>
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t("passwords.searchPasswords")}
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
              {onSelectionChange && (
                <TableHead className="w-12">
                  <Checkbox
                    checked={allSelected}
                    onCheckedChange={handleSelectAll}
                    aria-label={t("passwords.bulk.selectAll")}
                  />
                </TableHead>
              )}
              <TableHead>{t("common.name")}</TableHead>
              <TableHead>{t("passwords.username")}</TableHead>
              <TableHead>{t("common.password")}</TableHead>
              <TableHead>{t("passwords.folder")}</TableHead>
              <TableHead>{t("passwords.strength")}</TableHead>
              <TableHead>TOTP</TableHead>
              <TableHead>{t("passwords.shared")}</TableHead>
              <TableHead>{t("passwords.expiresAt")}</TableHead>
              <TableHead className="text-right">{t("common.actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {passwords.map((pwd) => (
              <TableRow key={pwd.id} className={selectedIds.includes(pwd.id) ? "bg-muted/50" : ""}>
                {onSelectionChange && (
                  <TableCell>
                    <Checkbox
                      checked={selectedIds.includes(pwd.id)}
                      onCheckedChange={(checked) => handleSelectOne(pwd.id, checked as boolean)}
                      aria-label={t("passwords.bulk.selectPassword", { name: pwd.name })}
                    />
                  </TableCell>
                )}
                <TableCell>
                  <div className="flex items-center gap-2">
                    <FolderKey className="h-4 w-4 text-muted-foreground" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <div className="font-medium">{pwd.name}</div>
                        {(() => {
                          const reminder = getPasswordReminder(pwd.id)
                          if (reminder) {
                            if (reminder.daysUntilRotation <= 0) {
                              return (
                                <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 flex items-center gap-1">
                                  <RotateCw className="h-3 w-3" />
                                  {t("passwords.rotation.rotationDue")}
                                </Badge>
                              )
                            } else if (reminder.daysUntilRotation <= 30) {
                              return (
                                <Badge variant="outline" className="text-yellow-600 flex items-center gap-1">
                                  <AlertCircle className="h-3 w-3" />
                                  {reminder.daysUntilRotation} {t("passwords.rotation.days")}
                                </Badge>
                              )
                            }
                          }
                          return null
                        })()}
                      </div>
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
                        {t("passwords.sharedWithTeams", { count: pwd.sharedWith.length })}
                      </span>
                    </div>
                  ) : (
                    <span className="text-xs text-muted-foreground">{t("passwords.private")}</span>
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
                      <DropdownMenuLabel>{t("common.actions")}</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => onViewDetails(pwd)}>
                        <Eye className="mr-2 h-4 w-4" />
                        {t("passwords.viewPassword")}
                      </DropdownMenuItem>
                      {hasPermission("password.view") && (
                        <>
                          <DropdownMenuItem
                            onClick={() => handleCopyPassword(pwd.id)}
                            disabled={copyingPasswordId === pwd.id}
                          >
                            <Copy className="mr-2 h-4 w-4" />
                            {copyingPasswordId === pwd.id ? t("passwords.copying") : t("passwords.copyPassword")}
                          </DropdownMenuItem>
                          {pwd.hasTotp && (
                            <DropdownMenuItem
                              onClick={() => handleCopyTotp(pwd.id)}
                              disabled={copyingTotpId === pwd.id}
                            >
                              <Clock className="mr-2 h-4 w-4" />
                              {copyingTotpId === pwd.id ? t("passwords.generating") : t("passwords.copyTotpCode")}
                            </DropdownMenuItem>
                          )}
                        </>
                      )}
                      {hasPermission("password.edit") && (
                        <DropdownMenuItem onClick={() => onEdit?.(pwd)}>
                          <Pencil className="mr-2 h-4 w-4" />
                          {t("common.edit")}
                        </DropdownMenuItem>
                      )}
                      {hasPermission("password.share") && (
                        <DropdownMenuItem onClick={() => onShare?.(pwd)}>
                          <Share2 className="mr-2 h-4 w-4" />
                          {t("passwords.sharePassword")}
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
                            {t("common.delete")}
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
