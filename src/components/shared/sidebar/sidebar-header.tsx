import { ChevronLeft, ChevronRight } from "lucide-react"
import { Logo } from "../logo"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface SidebarHeaderProps {
  isCollapsed: boolean
  onToggleCollapse: () => void
}

export function SidebarHeader({ isCollapsed, onToggleCollapse }: SidebarHeaderProps) {
  return (
    <div className="relative flex h-16 items-center border-b px-4 shrink-0">
      {isCollapsed ? (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="mx-auto">
                <Logo className="h-8 w-8" />
              </div>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>PassStorage</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ) : (
        <div className="flex items-center gap-2">
          <Logo className="h-8 w-8" />
          <span className="text-xl font-bold">PassStorage</span>
        </div>
      )}
      
      {/* Toggle button - always visible, positioned at the separator */}
      <Button
        variant="ghost"
        size="icon"
        onClick={onToggleCollapse}
        className="absolute -right-3 bottom-0 translate-y-1/2 h-6 w-6 rounded-full border bg-background shadow-md hover:bg-accent z-10"
      >
        {isCollapsed ? (
          <ChevronRight className="h-4 w-4" />
        ) : (
          <ChevronLeft className="h-4 w-4" />
        )}
      </Button>
    </div>
  )
}
