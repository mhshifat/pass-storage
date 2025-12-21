"use client"

import { useState, useEffect } from "react"
import { useActionState } from "react"
import { Button } from "@/components/ui/button"
import { Plus, Upload, Download, Copy } from "lucide-react"
import { PasswordFormDialog, ImportPasswordDialog, ExportPasswordDialog } from "@/modules/passwords/client"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { createPasswordAction } from "./actions"
import { usePermissions } from "@/hooks/use-permissions"
import { useTranslation } from "react-i18next"

export function PasswordsContent() {
  const { t } = useTranslation()
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false)
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false)
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
      <div className="flex gap-2 flex-wrap">
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          {t("passwords.addPassword")}
        </Button>
        <Button variant="outline" onClick={() => setIsImportDialogOpen(true)}>
          <Upload className="mr-2 h-4 w-4" />
          {t("passwords.import.title")}
        </Button>
        <Button variant="outline" onClick={() => setIsExportDialogOpen(true)}>
          <Download className="mr-2 h-4 w-4" />
          {t("passwords.export.title")}
        </Button>
        {hasPermission("password.view") && (
          <Button 
            variant="outline" 
            onClick={() => router.push("/admin/passwords/duplicates")}
          >
            <Copy className="mr-2 h-4 w-4" />
            {t("passwords.duplicates.title")}
          </Button>
        )}
      </div>
      <PasswordFormDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        formAction={formAction}
        isPending={isPending}
        state={state}
      />
      <ImportPasswordDialog
        open={isImportDialogOpen}
        onOpenChange={setIsImportDialogOpen}
        onSuccess={() => router.refresh()}
      />
      <ExportPasswordDialog
        open={isExportDialogOpen}
        onOpenChange={setIsExportDialogOpen}
        onSuccess={() => router.refresh()}
      />
    </>
  )
}

