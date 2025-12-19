import { Users, UserPlus } from "lucide-react"
import { Button } from "@/components/ui/button"

interface TeamsEmptyStateProps {
  onCreateTeam?: () => void
  isSearching?: boolean
}

export function TeamsEmptyState({ onCreateTeam, isSearching = false }: TeamsEmptyStateProps) {
  if (isSearching) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <div className="rounded-full bg-muted p-6 mb-4">
          <Users className="h-12 w-12 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">No teams found</h3>
        <p className="text-sm text-muted-foreground text-center max-w-sm mb-6">
          No teams match your search criteria. Try adjusting your search terms.
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="rounded-full bg-muted p-6 mb-4">
        <Users className="h-12 w-12 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold mb-2">No teams yet</h3>
      <p className="text-sm text-muted-foreground text-center max-w-sm mb-6">
        Get started by creating your first team. Teams help organize users and manage password access more efficiently.
      </p>
      {onCreateTeam && (
        <Button onClick={onCreateTeam}>
          <UserPlus className="mr-2 h-4 w-4" />
          Create First Team
        </Button>
      )}
    </div>
  )
}

