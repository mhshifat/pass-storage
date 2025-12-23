"use client"

import * as React from "react"
import { SidebarHeader } from "./sidebar-header"
import { SidebarNavigation } from "./sidebar-navigation"
import { SidebarUserProfile } from "./sidebar-user-profile"
import { SidebarLanguageSelector } from "./sidebar-language-selector"
import { CommandPaletteTrigger } from "@/modules/quick-actions/client"
import { cn } from "@/lib/utils"

interface User {
  id: string
  name: string
  email: string
  image?: string | null
  role: string
}

interface AppSidebarProps {
  user: User
  isCollapsed: boolean
  onToggleCollapse: () => void
}

export function AppSidebar({ user, isCollapsed, onToggleCollapse }: AppSidebarProps) {
  return (
    <div className="flex h-full flex-col">
      <SidebarHeader isCollapsed={isCollapsed} onToggleCollapse={onToggleCollapse} />
      {/* Command Search Indicator */}
      <div className={cn(
        "border-b shrink-0",
        isCollapsed ? "px-2 py-3" : "px-3 py-3"
      )}>
        {isCollapsed ? (
          <CommandPaletteTrigger 
            size="icon" 
            variant="ghost"
            className="w-full"
          />
        ) : (
          <CommandPaletteTrigger 
            size="sm" 
            variant="outline"
          />
        )}
      </div>
      <SidebarNavigation isCollapsed={isCollapsed} />
      <div className="mt-auto">
        <SidebarLanguageSelector isCollapsed={isCollapsed} />
        <SidebarUserProfile user={user} isCollapsed={isCollapsed} />
      </div>
    </div>
  )
}
