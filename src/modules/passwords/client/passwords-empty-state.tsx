"use client";

import { useTranslation } from "react-i18next"
import { FolderKey, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"

interface PasswordsEmptyStateProps {
  onCreatePassword?: () => void
  isSearching?: boolean
}

export function PasswordsEmptyState({
  onCreatePassword,
  isSearching = false,
}: PasswordsEmptyStateProps) {
  const { t } = useTranslation()
  
  if (isSearching) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <div className="rounded-full bg-muted p-6 mb-4">
          <FolderKey className="h-12 w-12 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">{t("passwords.noPasswords")}</h3>
        <p className="text-sm text-muted-foreground text-center max-w-sm mb-6">
          {t("passwords.noPasswordsSearchDescription")}
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="rounded-full bg-muted p-6 mb-4">
        <FolderKey className="h-12 w-12 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold mb-2">{t("passwords.noPasswordsYet")}</h3>
      <p className="text-sm text-muted-foreground text-center max-w-sm mb-6">
        {t("passwords.noPasswordsDescription")}
      </p>
      {onCreatePassword && (
        <Button onClick={onCreatePassword}>
          <Plus className="mr-2 h-4 w-4" />
          {t("passwords.createFirstPassword")}
        </Button>
      )}
    </div>
  )
}

