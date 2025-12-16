"use client"

import * as React from "react"
import { SidebarHeader } from "./sidebar-header"
import { SidebarNavigation } from "./sidebar-navigation"
import { SidebarUserProfile } from "./sidebar-user-profile"

interface User {
  id: string
  name: string
  email: string
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
      <SidebarNavigation isCollapsed={isCollapsed} />
      <SidebarUserProfile user={user} isCollapsed={isCollapsed} />
    </div>
  )
}
