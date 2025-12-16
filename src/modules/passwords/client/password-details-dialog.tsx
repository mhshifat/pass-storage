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
import { Eye, EyeOff, Copy, Clock } from "lucide-react"

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

interface PasswordDetailsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  password: Password | null
}

export function PasswordDetailsDialog({ open, onOpenChange, password }: PasswordDetailsDialogProps) {
  const [showPassword, setShowPassword] = React.useState(false)
  const [totpCode, setTotpCode] = React.useState("123456")
  const [totpTimeLeft, setTotpTimeLeft] = React.useState(30)

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

  const getExpiryBadge = (days: number) => {
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
              <span className="col-span-2 text-sm">{password.name}</span>
            </div>

            <div className="grid grid-cols-3 items-center gap-4">
              <span className="text-sm font-medium">Username:</span>
              <span className="col-span-2 text-sm font-mono">{password.username}</span>
            </div>

            <div className="grid grid-cols-3 items-center gap-4">
              <span className="text-sm font-medium">Password:</span>
              <div className="col-span-2 flex items-center gap-2">
                <Input
                  type={showPassword ? "text" : "password"}
                  value="••••••••••••"
                  readOnly
                  className="font-mono"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
                <Button variant="outline" size="icon">
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {password.url && (
              <div className="grid grid-cols-3 items-center gap-4">
                <span className="text-sm font-medium">URL:</span>
                <a
                  href={password.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="col-span-2 text-sm text-blue-600 hover:underline truncate"
                >
                  {password.url}
                </a>
              </div>
            )}

            <div className="grid grid-cols-3 items-center gap-4">
              <span className="text-sm font-medium">Folder:</span>
              <Badge variant="outline" className="w-fit">
                {password.folder}
              </Badge>
            </div>

            <div className="grid grid-cols-3 items-center gap-4">
              <span className="text-sm font-medium">Strength:</span>
              <div className="col-span-2">{getStrengthBadge(password.strength)}</div>
            </div>

            <div className="grid grid-cols-3 items-center gap-4">
              <span className="text-sm font-medium">Owner:</span>
              <span className="col-span-2 text-sm">{password.owner}</span>
            </div>

            {password.shared && (
              <div className="grid grid-cols-3 items-start gap-4">
                <span className="text-sm font-medium">Shared with:</span>
                <div className="col-span-2 flex flex-wrap gap-1">
                  {password.sharedWith.map((team, idx) => (
                    <Badge key={idx} variant="secondary">
                      {team}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-3 items-center gap-4">
              <span className="text-sm font-medium">Last Modified:</span>
              <span className="col-span-2 text-sm">{password.lastModified}</span>
            </div>

            <div className="grid grid-cols-3 items-center gap-4">
              <span className="text-sm font-medium">Expires:</span>
              <div className="col-span-2">{getExpiryBadge(password.expiresIn)}</div>
            </div>

            {password.hasTotp && (
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

                  <div className="text-xs text-muted-foreground">
                    Secret:{" "}
                    <code className="bg-muted px-1 py-0.5 rounded">{password.totpSecret}</code>
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
          <Button>Edit Password</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
