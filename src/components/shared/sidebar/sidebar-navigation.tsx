"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Users,
  Shield,
  Settings,
  Lock,
  Activity,
  ChevronRight,
  BoxesIcon,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { usePermissions } from "@/hooks/use-permissions"

const navigation = [
  {
    name: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
    permission: null, // Always visible
  },
  {
    name: "Users",
    href: "/admin/users",
    icon: Users,
    permission: "user.view",
  },
  {
    name: "Teams",
    href: "/admin/teams",
    icon: BoxesIcon,
    permission: "team.view",
  },
  {
    name: "Roles & Permissions",
    href: "/admin/roles",
    icon: Shield,
    permission: "role.manage",
  },
  {
    name: "Passwords",
    href: "/admin/passwords",
    icon: Lock,
    permission: "password.view",
  },
  {
    name: "Audit Logs",
    href: "/admin/audit-logs",
    icon: Activity,
    permission: "audit.view",
  },
  {
    name: "Settings",
    icon: Settings,
    permission: "settings.view",
    children: [
      { name: "General", href: "/admin/settings/general", permission: "settings.view" },
      { name: "Email", href: "/admin/settings/email", permission: "settings.view" },
      { name: "Security", href: "/admin/settings/security", permission: "settings.view" },
      { name: "MFA", href: "/admin/settings/mfa", permission: "settings.view" },
    ],
  },
]

interface SidebarNavigationProps {
  isCollapsed: boolean
}

export function SidebarNavigation({ isCollapsed }: SidebarNavigationProps) {
  const pathname = usePathname()
  const [expandedItems, setExpandedItems] = React.useState<string[]>(["Settings"])
  const { hasPermission } = usePermissions()

  const toggleExpand = (name: string) => {
    setExpandedItems((prev) =>
      prev.includes(name) ? prev.filter((item) => item !== name) : [...prev, name]
    )
  }

  // Filter navigation items based on permissions
  const filteredNavigation = navigation.filter((item) => {
    if (!item.permission) return true // Always show items without permission requirement
    return hasPermission(item.permission)
  }).map((item) => {
    if (item.children) {
      return {
        ...item,
        children: item.children.filter((child) => {
          if (!child.permission) return true
          return hasPermission(child.permission)
        }),
      }
    }
    return item
  }).filter((item) => {
    // Hide parent items if all children are filtered out
    if (item.children && item.children.length === 0) return false
    return true
  })

  if (isCollapsed) {
    return (
      <ScrollArea className="flex-1 px-2 py-4">
        <TooltipProvider delayDuration={0}>
          <nav className="space-y-2">
            {filteredNavigation.map((item) => {
              const isActive = item.href === pathname

              if (item.children) {
                // For collapsed mode with children, show dropdown menu
                return (
                  <DropdownMenu key={item.name}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <DropdownMenuTrigger asChild>
                          <button
                            className={cn(
                              "flex w-full items-center justify-center rounded-lg p-3 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                              "text-muted-foreground"
                            )}
                          >
                            <item.icon className="h-5 w-5" />
                          </button>
                        </DropdownMenuTrigger>
                      </TooltipTrigger>
                      <TooltipContent side="right">
                        <p>{item.name}</p>
                      </TooltipContent>
                    </Tooltip>
                    <DropdownMenuContent side="right" align="start" className="w-48">
                      {item.children.map((child) => (
                        <DropdownMenuItem key={child.href} asChild>
                          <Link href={child.href} className="cursor-pointer">
                            {child.name}
                          </Link>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )
              }

              return (
                <Tooltip key={item.name}>
                  <TooltipTrigger asChild>
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center justify-center rounded-lg p-3 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                        isActive
                          ? "bg-accent text-accent-foreground"
                          : "text-muted-foreground"
                      )}
                    >
                      <item.icon className="h-5 w-5" />
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    <p>{item.name}</p>
                  </TooltipContent>
                </Tooltip>
              )
            })}
          </nav>
        </TooltipProvider>
      </ScrollArea>
    )
  }

  return (
    <ScrollArea className="flex-1 px-3 py-4">
      <nav className="space-y-1">
        {filteredNavigation.map((item) => {
          const isActive = item.href === pathname
          const isExpanded = expandedItems.includes(item.name)

          if (item.children) {
            return (
              <div key={item.name}>
                <button
                  onClick={() => toggleExpand(item.name)}
                  className={cn(
                    "flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                    "text-muted-foreground"
                  )}
                >
                  <div className="flex items-center">
                    <item.icon className="mr-3 h-4 w-4" />
                    {item.name}
                  </div>
                  <ChevronRight
                    className={cn(
                      "h-4 w-4 transition-transform",
                      isExpanded && "rotate-90"
                    )}
                  />
                </button>
                {isExpanded && (
                  <div className="ml-7 mt-1 space-y-1">
                    {item.children.map((child) => {
                      const isChildActive = child.href === pathname
                      return (
                        <Link
                          key={child.href}
                          href={child.href}
                          className={cn(
                            "block rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                            isChildActive
                              ? "bg-accent text-accent-foreground"
                              : "text-muted-foreground"
                          )}
                        >
                          {child.name}
                        </Link>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          }

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                isActive
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground"
              )}
            >
              <item.icon className="mr-3 h-4 w-4" />
              {item.name}
            </Link>
          )
        })}
      </nav>
    </ScrollArea>
  )
}
