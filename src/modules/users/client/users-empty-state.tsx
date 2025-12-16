import { Users, UserPlus } from "lucide-react"
import { Button } from "@/components/ui/button"

interface UsersEmptyStateProps {
  onAddUser?: () => void
  isSearching?: boolean
}

export function UsersEmptyState({ onAddUser, isSearching = false }: UsersEmptyStateProps) {
  if (isSearching) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <div className="rounded-full bg-muted p-6 mb-4">
          <Users className="h-12 w-12 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">No users found</h3>
        <p className="text-sm text-muted-foreground text-center max-w-sm mb-6">
          No users match your search criteria. Try adjusting your search terms.
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="rounded-full bg-muted p-6 mb-4">
        <Users className="h-12 w-12 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold mb-2">No users yet</h3>
      <p className="text-sm text-muted-foreground text-center max-w-sm mb-6">
        Get started by creating your first user account. Users can access the system based on their assigned roles and permissions.
      </p>
      {onAddUser && (
        <Button onClick={onAddUser}>
          <UserPlus className="mr-2 h-4 w-4" />
          Add First User
        </Button>
      )}
    </div>
  )
}
