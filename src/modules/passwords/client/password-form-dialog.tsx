"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PasswordInput, generateStrongPassword } from "@/components/ui/password-input"
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
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { QrCode, FolderPlus, AlertCircle } from "lucide-react"
import { trpc } from "@/trpc/client"
import { CreateFolderDialog } from "@/modules/folders/client"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useEffect } from "react"

const passwordSchema = z.object({
  name: z.string().min(1, "Name is required"),
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
  url: z
    .string()
    .refine((val) => val === "" || z.string().url().safeParse(val).success, {
      message: "Must be a valid URL",
    })
    .optional()
    .or(z.literal("")),
  folderId: z.string().optional(),
  notes: z.string().optional(),
  enableTotp: z.boolean(),
  totpSecret: z.string().optional(),
})

type PasswordFormValues = z.infer<typeof passwordSchema>

interface Password {
  id: string
  name: string
  username: string
  password: string
  url?: string | null
  folderId?: string | null
  notes?: string | null
  hasTotp: boolean
  totpSecret?: string | null
}

interface PasswordFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  password?: Password | null
  mode?: "create" | "edit"
  formAction?: (payload: FormData) => void
  isPending?: boolean
  state?: { error?: string; fieldErrors?: { [key: string]: string }; success?: boolean } | null
  onSubmit?: (data: Record<string, unknown>) => void // For backward compatibility
}

export function PasswordFormDialog({
  open,
  onOpenChange,
  password,
  mode = "create",
  formAction,
  isPending = false,
  state = null,
  onSubmit,
}: PasswordFormDialogProps) {
  const [isCreateFolderDialogOpen, setIsCreateFolderDialogOpen] = React.useState(false)

  // Fetch folders
  const { data: foldersData, refetch: refetchFolders } = trpc.folders.list.useQuery(
    undefined,
    {
      enabled: open,
    }
  )

  const folders = foldersData?.folders || []

  const form = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      name: "",
      username: "",
      password: "",
      url: "",
      folderId: "",
      notes: "",
      enableTotp: false,
      totpSecret: "",
    },
  })

  const enableTotp = form.watch("enableTotp")

  // Reset form when dialog opens/closes or password changes
  useEffect(() => {
    if (open) {
      if (password && mode === "edit") {
        // Reset form with password data when available
        form.reset({
          name: password.name,
          username: password.username,
          password: password.password,
          url: password.url || "",
          folderId: password.folderId || "",
          notes: password.notes || "",
          enableTotp: password.hasTotp,
          totpSecret: password.totpSecret || "",
        })
      } else if (mode === "create") {
        form.reset({
          name: "",
          username: "",
          password: "",
          url: "",
          folderId: "",
          notes: "",
          enableTotp: false,
          totpSecret: "",
        })
      }
    } else {
      // Reset form when dialog closes
      form.reset()
    }
  }, [open, password, mode, form])

  // Sync server errors to form state
  useEffect(() => {
    if (state?.error) {
      form.setError("root", {
        type: "server",
        message: state.error,
      })
    }

    // Set field-specific errors
    if (state?.fieldErrors) {
      Object.entries(state.fieldErrors).forEach(([field, message]) => {
        form.setError(field as keyof PasswordFormValues, {
          type: "server",
          message,
        })
      })
    }

    // Close dialog on success
    if (state?.success) {
      onOpenChange(false)
      form.reset()
    }
  }, [state, form, onOpenChange])


  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    if (formAction) {
      // Use server action - FormData will be created from form fields
      const formData = new FormData(e.currentTarget)
      // Ensure totpSecret is only included if enableTotp is true
      const values = form.getValues()
      if (!values.enableTotp || !values.totpSecret) {
        formData.delete("totpSecret")
      }
      // Add passwordId for edit mode
      if (mode === "edit" && password?.id) {
        formData.append("passwordId", password.id)
      }
      formAction(formData)
    } else if (onSubmit) {
      // Use callback for backward compatibility
      const values = form.getValues()
      const data = {
        name: values.name,
        username: values.username,
        password: values.password,
        url: values.url || null,
        folderId: values.folderId || null,
        notes: values.notes || null,
        totpSecret: values.enableTotp && values.totpSecret ? values.totpSecret : null,
      }
      onSubmit(data)
    }
  }

  const handleCreateFolderSuccess = (newFolderId: string) => {
    refetchFolders()
    form.setValue("folderId", newFolderId)
    setIsCreateFolderDialogOpen(false)
  }

  const handleDialogOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      form.reset()
    }
    onOpenChange(newOpen)
  }

  return (
    <>
      <Dialog open={open} onOpenChange={handleDialogOpenChange}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>{mode === "create" ? "Add New Password" : "Edit Password"}</DialogTitle>
            <DialogDescription>
              {mode === "create" ? "Create a new password entry" : "Update password information"}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={handleSubmit} className="space-y-4">
              {form.formState.errors.root && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{form.formState.errors.root.message}</AlertDescription>
                </Alert>
              )}
              {mode === "edit" && !password && (
                <div className="text-sm text-muted-foreground text-center py-4">
                  Loading password data...
                </div>
              )}
              <div className="overflow-y-auto max-h-[calc(90vh-180px)] pr-2 space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., AWS Production" {...field} name="name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username / Email</FormLabel>
                      <FormControl>
                        <Input placeholder="username@example.com" {...field} name="username" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <PasswordInput
                          {...field}
                          name="password"
                          onGenerate={() => {
                            const generated = generateStrongPassword(20)
                            form.setValue("password", generated)
                            field.onChange({ target: { value: generated } })
                          }}
                        />
                      </FormControl>
                      <FormDescription>
                        Click the key icon to generate a strong password
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>URL (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="https://example.com" {...field} name="url" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="folderId"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center justify-between">
                        <FormLabel>Folder</FormLabel>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setIsCreateFolderDialogOpen(true)}
                          className="h-7 text-xs"
                        >
                          <FolderPlus className="mr-1 h-3 w-3" />
                          Create Folder
                        </Button>
                      </div>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a folder (optional)" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {folders.length === 0 ? (
                            <div className="px-2 py-1.5 text-sm text-muted-foreground text-center">
                              No folders yet. Create one to get started.
                            </div>
                          ) : (
                            folders.map((folder) => (
                              <SelectItem key={folder.id} value={folder.id}>
                                {folder.name}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                      <input type="hidden" name="folderId" value={field.value || ""} />
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes (Optional)</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Additional notes" rows={3} {...field} name="notes" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Separator />

                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="enableTotp"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">TOTP / 2FA Authentication</FormLabel>
                          <FormDescription>
                            Add two-factor authentication for enhanced security
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                        <input type="hidden" name="enableTotp" value={field.value ? "true" : "false"} />
                      </FormItem>
                    )}
                  />

                  {enableTotp && (
                    <>
                      <FormField
                        control={form.control}
                        name="totpSecret"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>TOTP Secret Key</FormLabel>
                            <FormControl>
                              <div className="flex gap-2">
                                <Input
                                  placeholder="e.g., JBSWY3DPEHPK3PXP"
                                  className="font-mono"
                                  {...field}
                                  name={enableTotp ? "totpSecret" : undefined}
                                />
                                <Button type="button" variant="outline" size="icon" title="Scan QR Code">
                                  <QrCode className="h-4 w-4" />
                                </Button>
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

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
                          💡 <strong>Tip:</strong> You can also click the QR code button to scan directly
                          from your screen
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleDialogOpenChange(false)}
                  disabled={isPending}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isPending}>
                  {isPending
                    ? mode === "create"
                      ? "Creating..."
                      : "Saving..."
                    : mode === "create"
                    ? "Save Password"
                    : "Save Changes"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <CreateFolderDialog
        open={isCreateFolderDialogOpen}
        onOpenChange={setIsCreateFolderDialogOpen}
        onSuccess={handleCreateFolderSuccess}
      />
    </>
  )
}
