"use client"

import { LanguageSelector } from "@/components/ui/language-selector"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Languages } from "lucide-react"

interface SidebarLanguageSelectorProps {
  isCollapsed: boolean
}

export function SidebarLanguageSelector({ isCollapsed }: SidebarLanguageSelectorProps) {
  if (isCollapsed) {
    return (
      <div className="border-t p-3">
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center justify-center">
                <LanguageSelector variant="ghost" size="icon" />
              </div>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>Language</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    )
  }

  return (
    <div className="border-t p-3">
      <div className="space-y-2">
        <div className="flex items-center gap-2 px-2 mb-2">
          <Languages className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Language
          </span>
        </div>
        <div className="px-2">
          <LanguageSelector variant="outline" size="sm" className="w-full justify-start" />
        </div>
      </div>
    </div>
  )
}


