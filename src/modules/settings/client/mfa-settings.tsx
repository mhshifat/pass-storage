"use client"

import { useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import z from "zod"
import { trpc } from "@/trpc/client"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
import { usePermissions } from "@/hooks/use-permissions"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Info } from "lucide-react"
import { MfaSettingsSkeleton } from "./mfa-settings-skeleton"
import Link from "next/link"

const mfaSettingsSchema = z.object({
  enforceAllUsers: z.boolean(),
  enforceAdmins: z.boolean(),
  methodTotp: z.boolean(),
  methodSms: z.boolean(),
  methodEmail: z.boolean(),
  methodHardware: z.boolean(),
  gracePeriodDays: z.number().min(0).max(365),
  recoveryCodesEnabled: z.boolean(),
  recoveryCodesCount: z.number().min(1).max(50),
  adminResetEnabled: z.boolean(),
})

type MfaSettingsFormValues = z.infer<typeof mfaSettingsSchema>

export function MfaSettings() {
  const { hasPermission } = usePermissions()
  const canEdit = hasPermission("settings.edit")
  const { data: settings, isLoading, error } = trpc.settings.getMfaSettings.useQuery()
  const { data: credentialsStatus } = trpc.settings.checkMfaCredentialsStatus.useQuery()
  const utils = trpc.useUtils()
  const updateSettings = trpc.settings.updateMfaSettings.useMutation({
    onSuccess: () => {
      toast.success("MFA settings saved successfully")
      utils.settings.getMfaSettings.invalidate()
      utils.settings.checkMfaCredentialsStatus.invalidate()
    },
    onError: (error) => {
      toast.error(error.message || "Failed to save MFA settings")
    },
  })

  const form = useForm<MfaSettingsFormValues>({
    resolver: zodResolver(mfaSettingsSchema),
    defaultValues: {
      enforceAllUsers: false,
      enforceAdmins: false,
      methodTotp: true,
      methodSms: false,
      methodEmail: false,
      methodHardware: false,
      gracePeriodDays: 7,
      recoveryCodesEnabled: true,
      recoveryCodesCount: 10,
      adminResetEnabled: true,
    },
  })

  // Update form when settings are loaded
  useEffect(() => {
    if (settings) {
      form.reset({
        enforceAllUsers: settings.enforceAllUsers,
        enforceAdmins: settings.enforceAdmins,
        methodTotp: settings.methodTotp,
        methodSms: settings.methodSms,
        methodEmail: settings.methodEmail,
        methodHardware: settings.methodHardware,
        gracePeriodDays: settings.gracePeriodDays,
        recoveryCodesEnabled: settings.recoveryCodesEnabled,
        recoveryCodesCount: settings.recoveryCodesCount,
        adminResetEnabled: settings.adminResetEnabled,
      })
    }
  }, [settings, form])

  const onSubmit = async (values: MfaSettingsFormValues) => {
    updateSettings.mutate(values)
  }

  if (isLoading) {
    return <MfaSettingsSkeleton />
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Multi-Factor Authentication</CardTitle>
          <CardDescription>Configure MFA requirements and options</CardDescription>
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
        <Card>
          <CardHeader>
            <CardTitle>Multi-Factor Authentication</CardTitle>
            <CardDescription>Configure MFA requirements and options</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {!canEdit && (
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  You have read-only access to these settings. Only users with edit permissions can modify them.
                </AlertDescription>
              </Alert>
            )}

            <FormField
              control={form.control}
              name="enforceAllUsers"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <FormLabel>Enforce MFA for All Users</FormLabel>
                      <p className="text-xs text-muted-foreground">Require all users to enable MFA</p>
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
              name="enforceAdmins"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <FormLabel>Enforce MFA for Admins</FormLabel>
                      <p className="text-xs text-muted-foreground">Require admin users to enable MFA</p>
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

            <div>
              <FormLabel className="text-base">Available MFA Methods</FormLabel>
              <p className="text-xs text-muted-foreground mb-4">
                Select which MFA methods users can choose from
              </p>

              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="methodTotp"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center justify-between p-3 rounded-lg border">
                        <div className="flex items-center gap-3">
                          <div className="space-y-0.5">
                            <FormLabel>Authenticator App (TOTP)</FormLabel>
                            <p className="text-xs text-muted-foreground">
                              Google Authenticator, Authy, etc.
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">Recommended</Badge>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              disabled={!canEdit}
                            />
                          </FormControl>
                        </div>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="methodSms"
                  render={({ field }) => {
                    const isDisabled = !canEdit || !credentialsStatus?.smsConfigured
                    return (
                      <FormItem>
                        <div className="flex items-center justify-between p-3 rounded-lg border">
                          <div className="flex items-center gap-3">
                            <div className="space-y-0.5">
                              <FormLabel>SMS Authentication</FormLabel>
                              <p className="text-xs text-muted-foreground">
                                Send verification codes via SMS
                              </p>
                              {!credentialsStatus?.smsConfigured && (
                                <p className="text-xs text-destructive mt-1">
                                  SMS credentials not configured. Configure them in{" "}
                                  <Link href="/admin/settings/mfa-credentials" className="underline hover:text-destructive/80">
                                    MFA Credentials
                                  </Link>
                                </p>
                              )}
                            </div>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={(checked) => {
                                if (!credentialsStatus?.smsConfigured && checked) {
                                  toast.error("SMS credentials must be configured first. Please configure them in Settings → MFA Credentials.")
                                  return
                                }
                                field.onChange(checked)
                              }}
                              disabled={isDisabled}
                            />
                          </FormControl>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )
                  }}
                />

                <FormField
                  control={form.control}
                  name="methodEmail"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center justify-between p-3 rounded-lg border">
                        <div className="flex items-center gap-3">
                          <div className="space-y-0.5">
                            <FormLabel>Email Authentication</FormLabel>
                            <p className="text-xs text-muted-foreground">
                              Send verification codes via email
                            </p>
                          </div>
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
                  name="methodHardware"
                  render={({ field }) => {
                    const isDisabled = !canEdit || !credentialsStatus?.webauthnConfigured
                    return (
                      <FormItem>
                        <div className="flex items-center justify-between p-3 rounded-lg border">
                          <div className="flex items-center gap-3">
                            <div className="space-y-0.5">
                              <FormLabel>Hardware Security Keys</FormLabel>
                              <p className="text-xs text-muted-foreground">
                                YubiKey, Titan Security Key, etc.
                              </p>
                              {!credentialsStatus?.webauthnConfigured && (
                                <p className="text-xs text-destructive mt-1">
                                  WebAuthn credentials not configured. Configure them in{" "}
                                  <Link href="/admin/settings/mfa-credentials" className="underline hover:text-destructive/80">
                                    MFA Credentials
                                  </Link>
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary">Most Secure</Badge>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={(checked) => {
                                  if (!credentialsStatus?.webauthnConfigured && checked) {
                                    toast.error("WebAuthn credentials must be configured first. Please configure them in Settings → MFA Credentials.")
                                    return
                                  }
                                  field.onChange(checked)
                                }}
                                disabled={isDisabled}
                              />
                            </FormControl>
                          </div>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )
                  }}
                />
              </div>
            </div>

            <Separator />

            <FormField
              control={form.control}
              name="gracePeriodDays"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>MFA Enforcement Grace Period (days)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      disabled={!canEdit}
                    />
                  </FormControl>
                  <p className="text-xs text-muted-foreground">
                    Allow users this many days to set up MFA before enforcing
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
                  Save MFA Settings
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recovery Options</CardTitle>
            <CardDescription>
              Configure account recovery methods when MFA is lost
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                Users can generate and manage their recovery codes in{" "}
                <Link href="/admin/account/recovery-codes" className="underline hover:text-foreground">
                  Account → Recovery Codes
                </Link>
              </AlertDescription>
            </Alert>
            <FormField
              control={form.control}
              name="recoveryCodesEnabled"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <FormLabel>Recovery Codes</FormLabel>
                      <p className="text-xs text-muted-foreground">
                        Allow users to generate backup recovery codes
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
              name="recoveryCodesCount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Number of Recovery Codes</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                      disabled={!canEdit}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Separator />

            <FormField
              control={form.control}
              name="adminResetEnabled"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <FormLabel>Admin MFA Reset</FormLabel>
                      <p className="text-xs text-muted-foreground">Allow admins to reset MFA for users</p>
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
                  Save Recovery Settings
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </form>
    </Form>
  )
}
