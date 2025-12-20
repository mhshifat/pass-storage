"use client"

import { useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import z from "zod"
import { trpc } from "@/trpc/client"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
import { SecuritySettingsSkeleton } from "./security-settings-skeleton"
import { usePermissions } from "@/hooks/use-permissions"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Info } from "lucide-react"

const securitySettingsSchema = z.object({
  // Password Policies
  passwordMinLength: z.number().min(4).max(128),
  passwordRequireUppercase: z.boolean(),
  passwordRequireLowercase: z.boolean(),
  passwordRequireNumbers: z.boolean(),
  passwordRequireSpecial: z.boolean(),
  passwordExpiryDays: z.number().min(0).max(3650),
  // Session Management
  sessionTimeoutMinutes: z.number().min(1).max(1440),
  sessionMaxConcurrent: z.number().min(1).max(100),
  sessionRequireReauth: z.boolean(),
  // Login Security
  loginMaxAttempts: z.number().min(1).max(20),
  loginLockoutDurationMinutes: z.number().min(1).max(1440),
})

type SecuritySettingsFormValues = z.infer<typeof securitySettingsSchema>

export function SecuritySettings() {
  const { hasPermission } = usePermissions()
  const canEdit = hasPermission("settings.edit")
  const { data: settings, isLoading, error } = trpc.settings.getSecuritySettings.useQuery()
  const utils = trpc.useUtils()
  const updateSettings = trpc.settings.updateSecuritySettings.useMutation({
    onSuccess: () => {
      toast.success("Security settings saved successfully")
      utils.settings.getSecuritySettings.invalidate()
    },
    onError: (error) => {
      toast.error(error.message || "Failed to save security settings")
    },
  })

  const form = useForm<SecuritySettingsFormValues>({
    resolver: zodResolver(securitySettingsSchema),
    defaultValues: {
      passwordMinLength: 12,
      passwordRequireUppercase: true,
      passwordRequireLowercase: true,
      passwordRequireNumbers: true,
      passwordRequireSpecial: true,
      passwordExpiryDays: 90,
      sessionTimeoutMinutes: 30,
      sessionMaxConcurrent: 3,
      sessionRequireReauth: true,
      loginMaxAttempts: 5,
      loginLockoutDurationMinutes: 15,
    },
  })

  // Update form when settings are loaded
  useEffect(() => {
    if (settings) {
      form.reset({
        passwordMinLength: settings.passwordMinLength,
        passwordRequireUppercase: settings.passwordRequireUppercase,
        passwordRequireLowercase: settings.passwordRequireLowercase,
        passwordRequireNumbers: settings.passwordRequireNumbers,
        passwordRequireSpecial: settings.passwordRequireSpecial,
        passwordExpiryDays: settings.passwordExpiryDays,
        sessionTimeoutMinutes: settings.sessionTimeoutMinutes,
        sessionMaxConcurrent: settings.sessionMaxConcurrent,
        sessionRequireReauth: settings.sessionRequireReauth,
        loginMaxAttempts: settings.loginMaxAttempts,
        loginLockoutDurationMinutes: settings.loginLockoutDurationMinutes,
      })
    }
  }, [settings, form])

  const onSubmit = async (values: SecuritySettingsFormValues) => {
    updateSettings.mutate(values)
  }

  if (isLoading) {
    return <SecuritySettingsSkeleton />
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Security Settings</CardTitle>
          <CardDescription>Configure security policies and settings</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-destructive">
            <p>Failed to load settings: {error.message}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {!canEdit && (
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              You have read-only access to these settings. Only users with edit permissions can modify them.
            </AlertDescription>
          </Alert>
        )}

        {/* Password Policies */}
        <Card>
          <CardHeader>
            <CardTitle>Password Policies</CardTitle>
            <CardDescription>
              Define password strength and complexity requirements
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="passwordMinLength"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Minimum Password Length</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      disabled={!canEdit}
                    />
                  </FormControl>
                  <p className="text-xs text-muted-foreground">
                    Minimum number of characters required
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Separator />

            <FormField
              control={form.control}
              name="passwordRequireUppercase"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <FormLabel>Require Uppercase Letters</FormLabel>
                      <p className="text-xs text-muted-foreground">
                        At least one uppercase letter (A-Z)
                      </p>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={!canEdit}
                      />
                    </FormControl>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="passwordRequireLowercase"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <FormLabel>Require Lowercase Letters</FormLabel>
                      <p className="text-xs text-muted-foreground">
                        At least one lowercase letter (a-z)
                      </p>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={!canEdit}
                      />
                    </FormControl>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="passwordRequireNumbers"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <FormLabel>Require Numbers</FormLabel>
                      <p className="text-xs text-muted-foreground">
                        At least one number (0-9)
                      </p>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={!canEdit}
                      />
                    </FormControl>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="passwordRequireSpecial"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <FormLabel>Require Special Characters</FormLabel>
                      <p className="text-xs text-muted-foreground">
                        At least one special character (!@#$%...)
                      </p>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={!canEdit}
                      />
                    </FormControl>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Separator />

            <FormField
              control={form.control}
              name="passwordExpiryDays"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password Expiry (days)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      disabled={!canEdit}
                    />
                  </FormControl>
                  <p className="text-xs text-muted-foreground">
                    Number of days before password must be changed (0 = never)
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />

            {canEdit && (
              <div className="pt-4">
                <Button type="submit" disabled={updateSettings.isPending}>
                  {updateSettings.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Save Password Policies
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Session Management */}
        <Card>
          <CardHeader>
            <CardTitle>Session Management</CardTitle>
            <CardDescription>Configure user session and timeout settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="sessionTimeoutMinutes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Session Timeout (minutes)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      disabled={!canEdit}
                    />
                  </FormControl>
                  <p className="text-xs text-muted-foreground">
                    Automatically log out inactive users after this time
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="sessionMaxConcurrent"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Maximum Concurrent Sessions</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      disabled={!canEdit}
                    />
                  </FormControl>
                  <p className="text-xs text-muted-foreground">
                    Maximum number of active sessions per user
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Separator />

            <FormField
              control={form.control}
              name="sessionRequireReauth"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <FormLabel>Require Re-authentication for Sensitive Actions</FormLabel>
                      <p className="text-xs text-muted-foreground">
                        Require password confirmation for critical operations
                      </p>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={!canEdit}
                      />
                    </FormControl>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {canEdit && (
              <div className="pt-4">
                <Button type="submit" disabled={updateSettings.isPending}>
                  {updateSettings.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Save Session Settings
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Login Security */}
        <Card>
          <CardHeader>
            <CardTitle>Login Security</CardTitle>
            <CardDescription>Configure login attempt limits and account lockout</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="loginMaxAttempts"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Maximum Failed Login Attempts</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      disabled={!canEdit}
                    />
                  </FormControl>
                  <p className="text-xs text-muted-foreground">
                    Lock account after this many failed attempts
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="loginLockoutDurationMinutes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Account Lockout Duration (minutes)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      disabled={!canEdit}
                    />
                  </FormControl>
                  <p className="text-xs text-muted-foreground">
                    How long to lock the account
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />

            {canEdit && (
              <div className="pt-4">
                <Button type="submit" disabled={updateSettings.isPending}>
                  {updateSettings.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Save Login Security
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </form>
    </Form>
  )
}
