
"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form"
import { FolderKey, Search, Plus } from "lucide-react"
import { trpc } from "@/trpc/client"
import { toast } from "sonner"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

type AddPasswordShareFormValues = {
  passwordId: string
  expiresAt?: string
}

interface AddPasswordShareDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  teamId: string
  onSuccess: () => void
}

const addPasswordShareSchema = z.object({
  passwordId: z.string().min(1, "Password is required"),
  expiresAt: z.string().optional(),
})

export function AddPasswordShareDialog({
  open,
  onOpenChange,
  teamId,
  onSuccess,
}: AddPasswordShareDialogProps) {
  const [passwordSearch, setPasswordSearch] = useState("")

  const form = useForm<AddPasswordShareFormValues>({
    resolver: zodResolver(addPasswordShareSchema),
    defaultValues: {
      passwordId: "",
      expiresAt: "",
    },
  })

  // Fetch available passwords
  const { data: passwordsData, isLoading: isLoadingPasswords } =
    trpc.teams.getAvailablePasswordsToShare.useQuery(
      {
        teamId,
        search: passwordSearch,
      },
      {
        enabled: open && teamId.length > 0,
      }
    )

  const sharePasswordMutation = trpc.teams.sharePasswordWithTeam.useMutation({
    onSuccess: () => {
      toast.success("Password shared with team successfully")
      form.reset()
      setPasswordSearch("")
      onOpenChange(false)
      onSuccess()
    },
    onError: (error) => {
      toast.error(error.message || "Failed to share password with team")
    },
  })

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      form.reset()
      setPasswordSearch("")
    }
    onOpenChange(newOpen)
  }

  const handleSubmit = (values: AddPasswordShareFormValues) => {
    sharePasswordMutation.mutate({
      passwordId: values.passwordId,
      teamId,
      expiresAt: values.expiresAt || undefined,
    })
  }

  const passwords = passwordsData?.passwords || []
  const filteredPasswords = passwordSearch
    ? passwords.filter(
        (p) =>
          p.name.toLowerCase().includes(passwordSearch.toLowerCase()) ||
          p.username.toLowerCase().includes(passwordSearch.toLowerCase()) ||
          (p.url && p.url.toLowerCase().includes(passwordSearch.toLowerCase()))
      )
    : passwords

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Share Password with Team</DialogTitle>
          <DialogDescription>
            Select a password to share with this team. All team members will have access to it.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <div className="space-y-2">
              <FormLabel>Search Passwords</FormLabel>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, username, or URL..."
                  className="pl-8"
                  value={passwordSearch}
                  onChange={(e) => setPasswordSearch(e.target.value)}
                />
              </div>
            </div>

            <FormField
              control={form.control}
              name="passwordId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a password">
                          {field.value
                            ? passwords.find((p) => p.id === field.value)?.name || "Select a password"
                            : "Select a password"}
                        </SelectValue>
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="max-h-[300px]">
                      {isLoadingPasswords ? (
                        <div className="px-2 py-1.5 text-sm text-muted-foreground">
                          Loading passwords...
                        </div>
                      ) : filteredPasswords.length === 0 ? (
                        <div className="px-2 py-1.5 text-sm text-muted-foreground">
                          {passwordSearch
                            ? "No passwords found"
                            : "No available passwords to share"}
                        </div>
                      ) : (
                        filteredPasswords.map((password) => (
                          <SelectItem key={password.id} value={password.id}>
                            <div className="flex items-center gap-2">
                              <FolderKey className="h-4 w-4 text-muted-foreground" />
                              <div className="flex flex-col">
                                <span>{password.name}</span>
                                <span className="text-xs text-muted-foreground">
                                  {password.username}
                                </span>
                              </div>
                            </div>
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="expiresAt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Expiration Date (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      value={field.value || ""}
                      onChange={(e) => field.onChange(e.target.value || undefined)}
                      min={new Date().toISOString().split("T")[0]}
                    />
                  </FormControl>
                  <FormDescription>
                    Set an expiration date to automatically revoke access
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
                disabled={sharePasswordMutation.isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={sharePasswordMutation.isPending}>
                {sharePasswordMutation.isPending ? (
                  "Sharing..."
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" />
                    Share Password
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

