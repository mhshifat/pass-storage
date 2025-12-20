"use client";

import { useTranslation } from "react-i18next"
import { Users, UserPlus } from "lucide-react"
import { Button } from "@/components/ui/button"

interface TeamsEmptyStateProps {
  onCreateTeam?: () => void
  isSearching?: boolean
}

export function TeamsEmptyState({ onCreateTeam, isSearching = false }: TeamsEmptyStateProps) {
  const { t } = useTranslation()
  
  if (isSearching) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <div className="rounded-full bg-muted p-6 mb-4">
          <Users className="h-12 w-12 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">{t("teams.noTeams")}</h3>
        <p className="text-sm text-muted-foreground text-center max-w-sm mb-6">
          {t("teams.noTeamsSearchDescription")}
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="rounded-full bg-muted p-6 mb-4">
        <Users className="h-12 w-12 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold mb-2">{t("teams.noTeamsYet")}</h3>
      <p className="text-sm text-muted-foreground text-center max-w-sm mb-6">
        {t("teams.noTeamsDescription")}
      </p>
      {onCreateTeam && (
        <Button onClick={onCreateTeam}>
          <UserPlus className="mr-2 h-4 w-4" />
          {t("teams.createFirstTeam")}
        </Button>
      )}
    </div>
  )
}

