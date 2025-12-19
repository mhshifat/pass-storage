"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Eye, EyeOff, Copy, Clock, X, Users } from "lucide-react"
import { trpc } from "@/trpc/client"
import { toast } from "sonner"
import { usePermissions } from "@/hooks/use-permissions"
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
import { removePasswordShareAction } from "@/app/admin/passwords/unshare-actions"
import { useRouter } from "next/navigation"

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
  password?: string // Decrypted password (optional, fetched separately)
  isOwner?: boolean // Indicates if the current user owns this password
}

interface PasswordDetailsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  password: Password | null
  onEdit?: (password: Password) => void
}

export function PasswordDetailsDialog({
  open,
  onOpenChange,
  password,
  onEdit,
}: PasswordDetailsDialogProps) {
  const router = useRouter()
  const { hasPermission } = usePermissions()
  const [showPassword, setShowPassword] = React.useState(false)
  const [totpCode, setTotpCode] = React.useState("123456")
  const [totpTimeLeft, setTotpTimeLeft] = React.useState(30)
  const [isRemoveShareDialogOpen, setIsRemoveShareDialogOpen] = React.useState(false)
  const [shareToRemove, setShareToRemove] = React.useState<{ shareId: string; teamName: string } | null>(null)
  const [isRemoving, setIsRemoving] = React.useState(false)

  // Fetch password details with decrypted password
  const { data: passwordData, isLoading, refetch: refetchPasswordData } = trpc.passwords.getById.useQuery(
    { id: password?.id || "" },
    {
      enabled: open && !!password?.id,
    }
  )
  
  // Get tRPC utils for invalidating queries
  const utils = trpc.useUtils()

  const decryptedPassword = passwordData?.password || ""

  // Reset showPassword when dialog closes or password changes
  React.useEffect(() => {
    if (!open || !password?.id) {
      setShowPassword(false)
    }
  }, [open, password?.id])

  // Simulate TOTP code generation and countdown
  React.useEffect(() => {
    if (!password?.hasTotp) return

    const interval = setInterval(() => {
      setTotpTimeLeft((prev) => {
        if (prev <= 1) {
          // Generate new TOTP code
          setTotpCode(Math.floor(100000 + Math.random() * 900000).toString())
          return 30
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [password?.hasTotp])

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

  const handleRemoveShare = async () => {
    if (!shareToRemove) return

    try {
      setIsRemoving(true)
      const result = await removePasswordShareAction(shareToRemove.shareId)
      if (result.success) {
        toast.success(`Password unshared from ${shareToRemove.teamName}`)
        setIsRemoveShareDialogOpen(false)
        setShareToRemove(null)
        
        // Refetch password data to update the shares list
        await refetchPasswordData()
        
        // Invalidate passwords list query to update the table
        await utils.passwords.list.invalidate()
        
        router.refresh()
      } else if (result.error) {
        toast.error(result.error)
      }
    } catch (error) {
      toast.error("Failed to remove password share")
    } finally {
      setIsRemoving(false)
    }
  }

  const getExpiryBadge = (days: number | null) => {
    if (days === null) {
      return <Badge variant="outline">Never</Badge>
    }
    if (days < 0) {
      return <Badge className="bg-red-100 text-red-800 border-red-200">Expired</Badge>
    } else if (days < 7) {
      return (
        <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Expiring Soon</Badge>
      )
    } else if (days < 30) {
      return <Badge className="bg-blue-100 text-blue-800 border-blue-200">{days} days</Badge>
    }
    return <Badge variant="outline">{days} days</Badge>
  }

  if (!password) return null

  // Use fetched password data if available, otherwise use passed password
  const displayPassword = passwordData || password
  
  // Determine if user is owner - check both passwordData and displayPassword
  // passwordData comes from getById query which includes isOwner
  // displayPassword might come from list query which also includes isOwner
  const isOwner = passwordData?.isOwner ?? (displayPassword as Password).isOwner ?? false

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Password Details</DialogTitle>
          <DialogDescription>View and manage password information</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="grid gap-4">
            <div className="grid grid-cols-3 items-center gap-4">
              <span className="text-sm font-medium">Name:</span>
              <span className="col-span-2 text-sm">{displayPassword.name}</span>
            </div>

            <div className="grid grid-cols-3 items-center gap-4">
              <span className="text-sm font-medium">Username:</span>
              <span className="col-span-2 text-sm font-mono">{displayPassword.username}</span>
            </div>

            <div className="grid grid-cols-3 items-center gap-4">
              <span className="text-sm font-medium">Password:</span>
              <div className="col-span-2 flex items-center gap-2">
                <Input
                  type={showPassword ? "text" : "password"}
                  value={isLoading ? "Loading..." : showPassword ? decryptedPassword : "••••••••••••"}
                  readOnly
                  className="font-mono"
                />
                {hasPermission("password.view") && (
                  <>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={isLoading}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => {
                        if (decryptedPassword) {
                          navigator.clipboard.writeText(decryptedPassword)
                          toast.success("Password copied to clipboard")
                        }
                      }}
                      disabled={isLoading || !decryptedPassword}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </>
                )}
              </div>
            </div>

            {displayPassword.url && (
              <div className="grid grid-cols-3 items-center gap-4">
                <span className="text-sm font-medium">URL:</span>
                <a
                  href={displayPassword.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="col-span-2 text-sm text-blue-600 hover:underline truncate"
                >
                  {displayPassword.url}
                </a>
              </div>
            )}

            <div className="grid grid-cols-3 items-center gap-4">
              <span className="text-sm font-medium">Folder:</span>
              {displayPassword.folder ? (
                <Badge variant="outline" className="w-fit">
                  {displayPassword.folder}
                </Badge>
              ) : (
                <span className="col-span-2 text-sm text-muted-foreground">-</span>
              )}
            </div>

            <div className="grid grid-cols-3 items-center gap-4">
              <span className="text-sm font-medium">Strength:</span>
              <div className="col-span-2">{getStrengthBadge(displayPassword.strength)}</div>
            </div>


            {displayPassword.shared && (
              <div className="grid grid-cols-3 items-start gap-4">
                <span className="text-sm font-medium">Shared with:</span>
                <div className="col-span-2 flex flex-wrap gap-2">
                  {Array.isArray(displayPassword.sharedWith) && displayPassword.sharedWith.length > 0 && (
                    <>
                      {typeof displayPassword.sharedWith[0] === "string" ? (
                        // Legacy format: array of strings
                        displayPassword.sharedWith.map((team, idx) => (
                          <Badge key={idx} variant="secondary">
                            {team}
                          </Badge>
                        ))
                      ) : (
                        // New format: array of PasswordShare objects
                        (displayPassword.sharedWith as PasswordShare[]).map((share) => (
                          <Badge
                            key={share.shareId}
                            variant="secondary"
                            className="flex items-center gap-1.5 pr-0"
                          >
                            <Users className="h-3 w-3" />
                            <span>{share.teamName}</span>
                            {isOwner && hasPermission("password.share") && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-5 w-5 p-0.5 ml-1 -mr-1 hover:bg-destructive/20 hover:text-destructive rounded-full"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  e.preventDefault()
                                  setShareToRemove({ shareId: share.shareId, teamName: share.teamName })
                                  setIsRemoveShareDialogOpen(true)
                                }}
                                title="Remove share"
                              >
                                <X className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
                              </Button>
                            )}
                          </Badge>
                        ))
                      )}
                    </>
                  )}
                </div>
              </div>
            )}

            <div className="grid grid-cols-3 items-center gap-4">
              <span className="text-sm font-medium">Last Modified:</span>
              <span className="col-span-2 text-sm">{displayPassword.lastModified}</span>
            </div>

            <div className="grid grid-cols-3 items-center gap-4">
              <span className="text-sm font-medium">Expires:</span>
              <div className="col-span-2">{getExpiryBadge(displayPassword.expiresIn)}</div>
            </div>

            {displayPassword.hasTotp && hasPermission("password.view") && (
              <>
                <Separator />
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium">TOTP Authentication</span>
                  </div>

                  <div className="p-4 rounded-lg border bg-muted/50">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <div className="text-3xl font-mono font-bold tracking-wider">{totpCode}</div>
                        <p className="text-xs text-muted-foreground mt-1">One-Time Password</p>
                      </div>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => navigator.clipboard.writeText(totpCode)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Time remaining</span>
                        <span className="font-medium">{totpTimeLeft}s</span>
                      </div>
                      <Progress value={(totpTimeLeft / 30) * 100} className="h-1" />
                    </div>
                  </div>

                </div>
              </>
            )}
          </div>
        </div>
        <DialogFooter className="flex gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button onClick={() => onEdit?.(passwordData || password)}>Edit Password</Button>
        </DialogFooter>
      </DialogContent>

      <AlertDialog open={isRemoveShareDialogOpen} onOpenChange={setIsRemoveShareDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Share?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove this password from &quot;{shareToRemove?.teamName}&quot;? 
              Team members will no longer have access to this password.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isRemoving}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemoveShare}
              disabled={isRemoving}
              className="bg-red-600 hover:bg-red-700"
            >
              {isRemoving ? "Removing..." : "Remove Share"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Dialog>
  )
}
