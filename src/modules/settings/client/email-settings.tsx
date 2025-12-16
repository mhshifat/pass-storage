"use client"

import { useState, useEffect, useActionState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"
import { trpc } from "@/trpc/client"
import { updateEmailConfigAction, testEmailConfigAction } from "@/app/admin/settings/email-actions"
import { useRouter } from "next/navigation"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Loader2 } from "lucide-react"

export function EmailSettings() {
  const router = useRouter()
  const [testEmail, setTestEmail] = useState("")
  const [isTesting, setIsTesting] = useState(false)
  const [encryption, setEncryption] = useState("tls")
  
  const { data: config, isLoading } = trpc.settings.getEmailConfig.useQuery()
  
  const [state, formAction, isPending] = useActionState(updateEmailConfigAction, null)

  useEffect(() => {
    if (state?.success) {
      toast.success("Email settings saved successfully")
      router.refresh()
    } else if (state?.error) {
      toast.error(state.error)
    }
  }, [state, router])

  useEffect(() => {
    if (config) {
      setEncryption(config.smtp_secure ? "ssl" : "tls")
    }
  }, [config])

  const handleTestEmail = async () => {
    if (!testEmail) {
      toast.error("Please enter an email address")
      return
    }

    setIsTesting(true)
    try {
      const result = await testEmailConfigAction(testEmail)
      if (result.success) {
        toast.success(`Test email sent to ${testEmail}`)
      } else {
        toast.error(result.error || "Failed to send test email")
      }
    } catch {
      toast.error("Failed to send test email")
    } finally {
      setIsTesting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>SMTP Configuration</CardTitle>
          <CardDescription>Configure email server settings for notifications</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="space-y-6">
            {state?.error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{state.error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="smtp_host">SMTP Host</Label>
              <Input
                id="smtp_host"
                name="smtp_host"
                placeholder="smtp.example.com"
                defaultValue={config?.smtp_host}
                required
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="smtp_port">SMTP Port</Label>
                <Input
                  id="smtp_port"
                  name="smtp_port"
                  placeholder="587"
                  defaultValue={config?.smtp_port}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="encryption">Encryption</Label>
                <Select
                  value={encryption}
                  onValueChange={(value) => setEncryption(value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="tls">TLS (Port 587)</SelectItem>
                    <SelectItem value="ssl">SSL (Port 465)</SelectItem>
                  </SelectContent>
                </Select>
                <input
                  type="hidden"
                  name="smtp_secure"
                  value={encryption === "ssl" ? "true" : "false"}
                />
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <Label htmlFor="smtp_user">SMTP Username (Optional)</Label>
              <Input
                id="smtp_user"
                name="smtp_user"
                placeholder="notifications@example.com"
                defaultValue={config?.smtp_user}
              />
              <p className="text-xs text-muted-foreground">
                Leave blank if your SMTP server doesn&#39;t require authentication
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="smtp_password">SMTP Password (Optional)</Label>
              <Input
                id="smtp_password"
                name="smtp_password"
                type="password"
                placeholder="••••••••"
                defaultValue={config?.smtp_password}
              />
              <p className="text-xs text-muted-foreground">
                Leave blank if your SMTP server doesn&apos;t require authentication
              </p>
            </div>

            <Separator />

            <div className="space-y-2">
              <Label htmlFor="smtp_from_email">From Email Address</Label>
              <Input
                id="smtp_from_email"
                name="smtp_from_email"
                type="email"
                placeholder="noreply@passstorage.com"
                defaultValue={config?.smtp_from_email}
                required
              />
              <p className="text-xs text-muted-foreground">
                Email address used as sender for notifications
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="smtp_from_name">From Name</Label>
              <Input
                id="smtp_from_name"
                name="smtp_from_name"
                placeholder="PassStorage"
                defaultValue={config?.smtp_from_name}
              />
            </div>

            <Separator />

            <div className="flex gap-2">
              <Button type="submit" disabled={isPending}>
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Email Settings"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Test Email Configuration</CardTitle>
          <CardDescription>Send a test email to verify your SMTP settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="test-email">Test Email Address</Label>
            <Input
              id="test-email"
              type="email"
              placeholder="test@example.com"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
            />
          </div>
          <Button variant="outline" onClick={handleTestEmail} disabled={isTesting}>
            {isTesting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              "Send Test Email"
            )}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Email Notifications</CardTitle>
          <CardDescription>Configure which events trigger email notifications</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>New User Registration</Label>
              <p className="text-xs text-muted-foreground">Email admins when new users register</p>
            </div>
            <Switch defaultChecked />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Password Shared</Label>
              <p className="text-xs text-muted-foreground">
                Email users when passwords are shared with them
              </p>
            </div>
            <Switch defaultChecked />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Password Expiring</Label>
              <p className="text-xs text-muted-foreground">Email users about expiring passwords</p>
            </div>
            <Switch defaultChecked />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Security Alerts</Label>
              <p className="text-xs text-muted-foreground">Email admins about security events</p>
            </div>
            <Switch defaultChecked />
          </div>

          <div className="pt-4">
            <Button>Save Notification Settings</Button>
          </div>
        </CardContent>
      </Card>
    </>
  )
}
