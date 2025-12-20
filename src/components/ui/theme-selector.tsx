"use client"

import * as React from "react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { SunIcon, MoonIcon, MonitorIcon } from "@/components/ui/theme-icons"
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

export function ThemeSelector() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <Button variant="outline" size="icon" disabled>
        <SunIcon className="h-4 w-4" />
      </Button>
    )
  }

  const themes = [
    { value: "light", label: "Light", icon: SunIcon },
    { value: "dark", label: "Dark", icon: MoonIcon },
    { value: "system", label: "System", icon: MonitorIcon },
  ]

  const currentTheme = themes.find((t) => t.value === theme) || themes[2]
  const CurrentIcon = currentTheme.icon

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="relative">
          <CurrentIcon className="h-4 w-4" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {themes.map((themeOption) => {
          const Icon = themeOption.icon
          return (
            <DropdownMenuItem
              key={themeOption.value}
              onClick={() => setTheme(themeOption.value)}
              className="flex items-center gap-2"
            >
              <Icon className="h-4 w-4" />
              <span>{themeOption.label}</span>
              {theme === themeOption.value && (
                <Check className="ml-auto h-4 w-4" />
              )}
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

interface ThemeSelectProps {
  value?: string
  onValueChange?: (value: string) => void
  disabled?: boolean
}

export function ThemeSelect({ value, onValueChange, disabled }: ThemeSelectProps) {
  const { theme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  const themes = [
    { value: "light", label: "Light", icon: SunIcon },
    { value: "dark", label: "Dark", icon: MoonIcon },
    { value: "system", label: "System", icon: MonitorIcon },
  ]

  const handleClick = React.useCallback((themeValue: string) => {
    if (disabled) return
    if (onValueChange) {
      onValueChange(themeValue)
    }
  }, [disabled, onValueChange])

  // Use the controlled value if provided, otherwise fall back to theme
  const currentValue = value !== undefined ? value : (theme || "system")

  if (!mounted) {
    return (
      <div className="flex items-center gap-2 rounded-md border border-input bg-background px-3 py-2 text-sm">
        <SunIcon className="h-4 w-4 text-muted-foreground" />
        <span className="text-muted-foreground">Loading...</span>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <div className="inline-flex rounded-lg border p-1 bg-background" role="group" aria-label="Theme selector">
        {themes.map((themeOption) => {
          const Icon = themeOption.icon
          const isSelected = currentValue === themeOption.value
          return (
            <button
              key={themeOption.value}
              type="button"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                handleClick(themeOption.value)
              }}
              onMouseDown={(e) => {
                // Prevent form submission if this is inside a form
                e.preventDefault()
              }}
              disabled={disabled}
              className={cn(
                "inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-all",
                "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                "disabled:opacity-50 disabled:cursor-not-allowed",
                !disabled && "cursor-pointer",
                isSelected
                  ? "bg-accent text-accent-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground active:scale-95"
              )}
              aria-pressed={isSelected}
              aria-label={`Select ${themeOption.label} theme`}
            >
              <Icon className="h-4 w-4" />
              <span>{themeOption.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
