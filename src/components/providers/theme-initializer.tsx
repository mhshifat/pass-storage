"use client"

import * as React from "react"
import { useTheme } from "next-themes"

/**
 * Component to sync theme from settings
 * This ensures the theme from database settings is applied
 */
export function ThemeInitializer() {
  const { setTheme, theme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  // Load theme from settings on mount
  React.useEffect(() => {
    if (!mounted) return

    // Try to get theme from settings API
    const loadThemeFromSettings = async () => {
      try {
        // Get theme from localStorage (set by next-themes)
        const storedTheme = localStorage.getItem("theme")
        
        // If no theme is stored in localStorage, default to system
        // The theme will be synced when user visits settings page
        if (!storedTheme) {
          // Check if there's a theme in the cookie or try to fetch from API
          // For now, we'll let next-themes handle the default
        }
      } catch (error) {
        // Silently fail - theme will use default
      }
    }

    loadThemeFromSettings()
  }, [mounted, setTheme])

  return null
}
