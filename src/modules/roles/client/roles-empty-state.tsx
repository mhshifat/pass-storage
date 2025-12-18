import { Shield, ShieldPlus } from "lucide-react"
import { Button } from "@/components/ui/button"

interface RolesEmptyStateProps {
  onCreateRole?: () => void
  isSearching?: boolean
}

export function RolesEmptyState({ onCreateRole, isSearching = false }: RolesEmptyStateProps) {
  if (isSearching) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <div className="rounded-full bg-muted p-6 mb-4">
          <Shield className="h-12 w-12 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">No roles found</h3>
        <p className="text-sm text-muted-foreground text-center max-w-sm">
          No roles match your search criteria. Try adjusting your search terms.
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="rounded-full bg-muted p-6 mb-4">
        <Shield className="h-12 w-12 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold mb-2">No roles yet</h3>
      <p className="text-sm text-muted-foreground text-center max-w-sm mb-6">
        Get started by creating your first custom role. Define permissions and assign them to users to control access to system features.
      </p>
      {onCreateRole && (
        <Button onClick={onCreateRole}>
          <ShieldPlus className="mr-2 h-4 w-4" />
          Create First Role
        </Button>
      )}
    </div>
  )
}

