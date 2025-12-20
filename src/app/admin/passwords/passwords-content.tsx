"use client"

import { useState, useEffect } from "react"
import { useActionState } from "react"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { PasswordFormDialog } from "@/modules/passwords/client"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { createPasswordAction } from "./actions"
import { usePermissions } from "@/hooks/use-permissions"
import { useTranslation } from "react-i18next"

export function PasswordsContent() {
  const { t } = useTranslation()
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const router = useRouter()
  const { hasPermission } = usePermissions()
  const [state, formAction, isPending] = useActionState(createPasswordAction, null)

  useEffect(() => {
    if (state?.success) {
      toast.success(t("passwords.addPassword") + " " + t("common.success").toLowerCase())
      setIsCreateDialogOpen(false)
      router.refresh()
    } else if (state?.error) {
      toast.error(state.error)
    }
  }, [state, router, t])

  if (!hasPermission("password.create")) {
    return null
  }

  return (
    <>
      <Button onClick={() => setIsCreateDialogOpen(true)}>
        <Plus className="mr-2 h-4 w-4" />
        {t("passwords.addPassword")}
      </Button>
      <PasswordFormDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        formAction={formAction}
        isPending={isPending}
        state={state}
      />
    </>
  )
}

