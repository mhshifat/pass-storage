import { useTranslation } from "react-i18next"
import { Shield, ShieldPlus } from "lucide-react"
import { Button } from "@/components/ui/button"

interface RolesEmptyStateProps {
  onCreateRole?: () => void
  isSearching?: boolean
}

export function RolesEmptyState({ onCreateRole, isSearching = false }: RolesEmptyStateProps) {
  const { t } = useTranslation()
  
  if (isSearching) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <div className="rounded-full bg-muted p-6 mb-4">
          <Shield className="h-12 w-12 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">{t("roles.noRoles")}</h3>
        <p className="text-sm text-muted-foreground text-center max-w-sm">
          {t("roles.noRolesSearchDescription")}
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="rounded-full bg-muted p-6 mb-4">
        <Shield className="h-12 w-12 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold mb-2">{t("roles.noRolesYet")}</h3>
      <p className="text-sm text-muted-foreground text-center max-w-sm mb-6">
        {t("roles.noRolesDescription")}
      </p>
      {onCreateRole && (
        <Button onClick={onCreateRole}>
          <ShieldPlus className="mr-2 h-4 w-4" />
          {t("roles.createFirstRole")}
        </Button>
      )}
    </div>
  )
}

