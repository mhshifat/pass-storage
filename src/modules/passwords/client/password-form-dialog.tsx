"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Key, QrCode } from "lucide-react"

interface PasswordFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: Record<string, unknown>) => void
}

export function PasswordFormDialog({ open, onOpenChange, onSubmit }: PasswordFormDialogProps) {
  const [enableTotp, setEnableTotp] = React.useState(false)

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const data = {
      name: formData.get("pwd-name"),
      username: formData.get("pwd-username"),
      password: formData.get("pwd-password"),
      url: formData.get("pwd-url"),
      folder: formData.get("pwd-folder"),
      notes: formData.get("pwd-notes"),
      totpSecret: enableTotp ? formData.get("totp-secret") : null,
    }
    onSubmit(data)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Add New Password</DialogTitle>
          <DialogDescription>Create a new password entry</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4 overflow-y-auto max-h-[calc(90vh-180px)]">
            <div className="grid gap-2">
              <Label htmlFor="pwd-name">Name</Label>
              <Input id="pwd-name" name="pwd-name" placeholder="e.g., AWS Production" required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="pwd-username">Username / Email</Label>
              <Input id="pwd-username" name="pwd-username" placeholder="username@example.com" required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="pwd-password">Password</Label>
              <div className="flex gap-2">
                <Input id="pwd-password" name="pwd-password" type="password" required />
                <Button type="button" variant="outline" size="icon">
                  <Key className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Click the key icon to generate a strong password
              </p>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="pwd-url">URL (Optional)</Label>
              <Input id="pwd-url" name="pwd-url" placeholder="https://example.com" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="pwd-folder">Folder</Label>
              <Select name="pwd-folder">
                <SelectTrigger>
                  <SelectValue placeholder="Select a folder" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="infrastructure">Infrastructure</SelectItem>
                  <SelectItem value="databases">Databases</SelectItem>
                  <SelectItem value="development">Development</SelectItem>
                  <SelectItem value="marketing">Marketing</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="pwd-notes">Notes (Optional)</Label>
              <Textarea id="pwd-notes" name="pwd-notes" placeholder="Additional notes" rows={3} />
            </div>

            <Separator />

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="enable-totp" className="text-base">
                    TOTP / 2FA Authentication
                  </Label>
                  <p className="text-xs text-muted-foreground mt-1">
                    Add two-factor authentication for enhanced security
                  </p>
                </div>
                <Switch id="enable-totp" checked={enableTotp} onCheckedChange={setEnableTotp} />
              </div>

              {enableTotp && (
                <>
                  <div className="grid gap-2">
                    <Label htmlFor="totp-secret">TOTP Secret Key</Label>
                    <div className="flex gap-2">
                      <Input
                        id="totp-secret"
                        name="totp-secret"
                        placeholder="e.g., JBSWY3DPEHPK3PXP"
                        className="font-mono"
                      />
                      <Button type="button" variant="outline" size="icon" title="Scan QR Code">
                        <QrCode className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="rounded-lg border bg-muted/50 p-3 space-y-2">
                    <p className="text-xs font-medium">How to get your TOTP secret key:</p>
                    <ol className="text-xs text-muted-foreground space-y-1.5 ml-4 list-decimal">
                      <li>Open the website/app you want to secure with 2FA</li>
                      <li>Go to Security Settings and enable Two-Factor Authentication</li>
                      <li>Choose &quot;Authenticator App&quot; as your 2FA method</li>
                      <li>Click &quot;Can&apos;t scan QR code?&quot; or &quot;Enter manually&quot; option</li>
                      <li>Copy the displayed secret key (usually 16-32 characters)</li>
                      <li>Paste it here and save</li>
                    </ol>
                    <p className="text-xs text-muted-foreground mt-2">
                      💡 <strong>Tip:</strong> You can also click the QR code button to scan directly from
                      your screen
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Save Password</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
