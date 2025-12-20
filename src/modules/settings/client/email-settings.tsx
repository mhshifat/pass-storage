
"use client"

import { useState, useEffect, useActionState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import { updateEmailConfigAction, testEmailConfigAction } from "@/app/admin/settings/email-actions"
import { useRouter } from "next/navigation"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Loader2, Info } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { useForm } from "react-hook-form"
import z from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { usePermissions } from "@/hooks/use-permissions"

export interface EmailConfig {
  smtp_host: string
  smtp_port: string
  smtp_secure: boolean
  smtp_user: string
  smtp_password: string
  smtp_from_email: string
  smtp_from_name: string
}

interface EmailSettingsProps {
  config: EmailConfig
}

const emailSettingsSchema = z.object({
  smtp_host: z.string().min(1, "SMTP Host is required"),
  smtp_port: z.string().min(1, "SMTP Port is required"),
  smtp_secure: z.enum(["none", "tls", "ssl"]),
  smtp_user: z.string().optional(),
  smtp_password: z.string().optional(),
  smtp_from_email: z.string().email("Invalid email address"),
  smtp_from_name: z.string().optional(),
})

type EmailSettingsFormValues = z.infer<typeof emailSettingsSchema>

export function EmailSettings({ config }: EmailSettingsProps) {
  const { hasPermission } = usePermissions()
  const canEdit = hasPermission("settings.edit")
  const router = useRouter()
  const [testEmail, setTestEmail] = useState("")
  const [isTesting, setIsTesting] = useState(false)
  const [state, formAction, isPending] = useActionState(updateEmailConfigAction, null)

  const form = useForm<EmailSettingsFormValues>({
    defaultValues: {
      smtp_host: config.smtp_host,
      smtp_port: config.smtp_port,
      smtp_secure: config.smtp_secure ? "ssl" : "tls",
      smtp_user: config.smtp_user,
      smtp_password: config.smtp_password,
      smtp_from_email: config.smtp_from_email,
      smtp_from_name: config.smtp_from_name,
    },
    resolver: zodResolver(emailSettingsSchema)
  })

  useEffect(() => {
    if (state?.success) {
      toast.success("Email settings saved successfully")
      router.refresh()
    } else if (state?.error) {
      toast.error(state.error)
    }
  }, [state, router])

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

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>SMTP Configuration</CardTitle>
          <CardDescription>Configure email server settings for notifications</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit((data) => {
                // Convert smtp_secure to boolean and build FormData
                const submitData = {
                  ...data,
                  smtp_secure: data.smtp_secure === "ssl",
                }
                const formData = new FormData()
                Object.entries(submitData).forEach(([key, value]) => {
                  formData.append(key, String(value))
                })
                formAction(formData)
              })}
              className="space-y-6"
            >
              {!canEdit && (
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    You have read-only access to these settings. Only users with edit permissions can modify them.
                  </AlertDescription>
                </Alert>
              )}

              {state?.error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{state.error}</AlertDescription>
                </Alert>
              )}

              <FormField
                control={form.control}
                name="smtp_host"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>SMTP Host</FormLabel>
                    <FormControl>
                      <Input placeholder="smtp.example.com" {...field} disabled={!canEdit} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="smtp_port"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>SMTP Port</FormLabel>
                      <FormControl>
                        <Input placeholder="587" {...field} disabled={!canEdit} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="smtp_secure"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Encryption</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                        disabled={!canEdit}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          <SelectItem value="tls">TLS (Port 587)</SelectItem>
                          <SelectItem value="ssl">SSL (Port 465)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Separator />

              <FormField
                control={form.control}
                name="smtp_user"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>SMTP Username (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="notifications@example.com" {...field} disabled={!canEdit} />
                    </FormControl>
                    <p className="text-xs text-muted-foreground">
                      Leave blank if your SMTP server doesn&#39;t require authentication
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="smtp_password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>SMTP Password (Optional)</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <p className="text-xs text-muted-foreground">
                      Leave blank if your SMTP server doesn&apos;t require authentication
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Separator />

              <FormField
                control={form.control}
                name="smtp_from_email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>From Email Address</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="noreply@passstorage.com" {...field} disabled={!canEdit} />
                    </FormControl>
                    <p className="text-xs text-muted-foreground">
                      Email address used as sender for notifications
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="smtp_from_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>From Name</FormLabel>
                    <FormControl>
                      <Input placeholder="PassStorage" {...field} disabled={!canEdit} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Separator />

              {canEdit && (
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
              )}
            </form>
          </Form>
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
              disabled={!canEdit}
            />
          </div>
          <Button variant="outline" onClick={handleTestEmail} disabled={isTesting || !canEdit}>
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
            <Switch defaultChecked disabled={!canEdit} />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Password Shared</Label>
              <p className="text-xs text-muted-foreground">
                Email users when passwords are shared with them
              </p>
            </div>
            <Switch defaultChecked disabled={!canEdit} />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Password Expiring</Label>
              <p className="text-xs text-muted-foreground">Email users about expiring passwords</p>
            </div>
            <Switch defaultChecked disabled={!canEdit} />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Security Alerts</Label>
              <p className="text-xs text-muted-foreground">Email admins about security events</p>
            </div>
            <Switch defaultChecked disabled={!canEdit} />
          </div>

          {canEdit && (
            <div className="pt-4">
              <Button>Save Notification Settings</Button>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  )
}
