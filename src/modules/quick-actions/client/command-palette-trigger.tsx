"use client"

import * as React from "react"
import { Search } from "lucide-react"
import { cn } from "@/lib/utils"
import { useTranslation } from "react-i18next"
import { useCommandPalette } from "./command-palette-provider"

interface CommandPaletteTriggerProps {
  variant?: "default" | "outline" | "ghost"
  size?: "default" | "sm" | "lg" | "icon"
  className?: string
  showShortcut?: boolean
}

export function CommandPaletteTrigger({
  variant = "outline",
  size = "default",
  className,
  showShortcut = true,
}: CommandPaletteTriggerProps) {
  const { t } = useTranslation()
  const { setOpen } = useCommandPalette()
  const [isMac, setIsMac] = React.useState(false)

  React.useEffect(() => {
    setIsMac(navigator.platform.toUpperCase().indexOf("MAC") >= 0)
  }, [])

  const shortcut = isMac ? "⌘K" : "Ctrl+K"
  const shortcutKeys = isMac ? ["⌘", "K"] : ["Ctrl", "K"]

  // For icon-only variant, return a simple button
  if (size === "icon") {
    return (
      <button
        onClick={() => setOpen(true)}
        className={cn(
          "inline-flex items-center justify-center rounded-md text-sm font-medium transition-all",
          "h-9 w-9 hover:bg-accent hover:text-accent-foreground",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          className
        )}
        aria-label={t("quickActions.searchPlaceholder")}
      >
        <Search className="h-4 w-4" />
      </button>
    )
  }

  return (
    <button
      onClick={() => setOpen(true)}
      className={cn(
        "group relative flex h-9 w-full items-center gap-3 rounded-md border border-input bg-background px-3 text-sm shadow-xs transition-all",
        "hover:border-ring hover:bg-accent/50",
        "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] focus-visible:outline-none",
        "dark:bg-input/30 dark:border-input dark:hover:bg-input/50",
        size === "sm" && "h-8 text-xs",
        size === "lg" && "h-10 text-base",
        className
      )}
      aria-label={t("quickActions.searchPlaceholder")}
    >
      <Search className="h-4 w-4 shrink-0 text-muted-foreground transition-colors group-hover:text-foreground group-focus-visible:text-foreground" />
      <span className="flex-1 text-left text-muted-foreground group-hover:text-foreground group-focus-visible:text-foreground">
        {t("quickActions.searchPlaceholder")}
      </span>
      {showShortcut && (
        <div className="hidden shrink-0 items-center gap-1 sm:flex">
          {shortcutKeys.map((key, index) => (
            <kbd
              key={index}
              className={cn(
                "pointer-events-none flex h-5 min-w-[1.25rem] select-none items-center justify-center rounded border border-border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground shadow-sm",
                "group-hover:border-border/80 group-hover:bg-muted/80",
                index === 0 && "text-[11px]"
              )}
            >
              {key}
            </kbd>
          ))}
        </div>
      )}
    </button>
  )
}

