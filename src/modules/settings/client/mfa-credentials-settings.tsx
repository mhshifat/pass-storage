"use client"

import { useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import z from "zod"
import { trpc } from "@/trpc/client"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
import { usePermissions } from "@/hooks/use-permissions"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Info } from "lucide-react"

const mfaCredentialsSchema = z.object({
  smsAccountSid: z.string().optional(),
  smsAuthToken: z.string().optional(),
  smsPhoneNumber: z.string().optional(),
  webauthnRpId: z.string().optional(),
  webauthnRpName: z.string().optional(),
  webauthnOrigin: z.string().url("Invalid URL format").optional().or(z.literal("")),
})

type MfaCredentialsFormValues = z.infer<typeof mfaCredentialsSchema>

export function MfaCredentialsSettings() {
  const { hasPermission } = usePermissions()
  const canEdit = hasPermission("settings.edit")
  const { data: credentials, isLoading, error } = trpc.settings.getMfaCredentials.useQuery()
  const utils = trpc.useUtils()
  const updateCredentials = trpc.settings.updateMfaCredentials.useMutation({
    onSuccess: () => {
      toast.success("MFA credentials saved successfully")
      utils.settings.getMfaCredentials.invalidate()
    },
    onError: (error) => {
      toast.error(error.message || "Failed to save MFA credentials")
    },
  })

  const form = useForm<MfaCredentialsFormValues>({
    resolver: zodResolver(mfaCredentialsSchema),
    defaultValues: {
      smsAccountSid: "",
      smsAuthToken: "",
      smsPhoneNumber: "",
      webauthnRpId: "",
      webauthnRpName: "",
      webauthnOrigin: "",
    },
  })

  // Update form when credentials are loaded
  useEffect(() => {
    if (credentials) {
      form.reset({
        smsAccountSid: credentials.smsAccountSid,
        smsAuthToken: credentials.smsAuthToken,
        smsPhoneNumber: credentials.smsPhoneNumber,
        webauthnRpId: credentials.webauthnRpId,
        webauthnRpName: credentials.webauthnRpName,
        webauthnOrigin: credentials.webauthnOrigin,
      })
    }
  }, [credentials, form])

  const onSubmit = async (values: MfaCredentialsFormValues) => {
    updateCredentials.mutate(values)
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>MFA Credentials</CardTitle>
          <CardDescription>Configure credentials for SMS and WebAuthn MFA methods</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>MFA Credentials</CardTitle>
          <CardDescription>Configure credentials for SMS and WebAuthn MFA methods</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-destructive">
            <p>Failed to load credentials: {error.message}</p>
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

        {/* SMS Credentials */}
        <Card>
          <CardHeader>
            <CardTitle>SMS Authentication Credentials</CardTitle>
            <CardDescription>
              Configure Twilio credentials for SMS-based MFA. Required if SMS MFA is enabled.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="smsAccountSid"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Twilio Account SID</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                      {...field}
                      disabled={!canEdit}
                    />
                  </FormControl>
                  <FormDescription>
                    Your Twilio Account SID from the Twilio Console
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="smsAuthToken"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Twilio Auth Token</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Your Twilio Auth Token"
                      {...field}
                      disabled={!canEdit}
                    />
                  </FormControl>
                  <FormDescription>
                    Your Twilio Auth Token from the Twilio Console
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="smsPhoneNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Twilio Phone Number</FormLabel>
                  <FormControl>
                    <Input
                      type="tel"
                      placeholder="+1234567890"
                      {...field}
                      disabled={!canEdit}
                    />
                  </FormControl>
                  <FormDescription>
                    The Twilio phone number to send SMS from (E.164 format)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* WebAuthn Credentials */}
        <Card>
          <CardHeader>
            <CardTitle>WebAuthn (Hardware Security Keys) Credentials</CardTitle>
            <CardDescription>
              Configure WebAuthn settings for hardware security key authentication. Required if WebAuthn MFA is enabled.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="webauthnRpId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Relying Party ID (RP ID)</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      placeholder="example.com"
                      {...field}
                      disabled={!canEdit}
                    />
                  </FormControl>
                  <FormDescription>
                    Your domain name (e.g., example.com). Must match your application domain.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="webauthnRpName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Relying Party Name</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      placeholder="Password Storage"
                      {...field}
                      disabled={!canEdit}
                    />
                  </FormControl>
                  <FormDescription>
                    The name displayed to users when registering security keys
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="webauthnOrigin"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Origin URL</FormLabel>
                  <FormControl>
                    <Input
                      type="url"
                      placeholder="https://example.com"
                      {...field}
                      disabled={!canEdit}
                    />
                  </FormControl>
                  <FormDescription>
                    The origin URL of your application (e.g., https://example.com)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {canEdit && (
          <div className="flex justify-end">
            <Button type="submit" disabled={updateCredentials.isPending}>
              {updateCredentials.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Save MFA Credentials
            </Button>
          </div>
        )}
      </form>
    </Form>
  )
}
