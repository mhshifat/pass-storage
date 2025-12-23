"use client"

import * as React from "react"
import { createContext, useContext, useEffect } from "react"

interface AccessibilityPreferences {
  highContrast: boolean
  fontSize: "small" | "medium" | "large" | "xlarge"
  reducedMotion: boolean
}

interface AccessibilityContextType {
  preferences: AccessibilityPreferences
  updatePreferences: (prefs: Partial<AccessibilityPreferences>) => void
  applyAccessibilityStyles: () => void
}

const defaultPreferences: AccessibilityPreferences = {
  highContrast: false,
  fontSize: "medium",
  reducedMotion: false,
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined)

export function useAccessibility() {
  const context = useContext(AccessibilityContext)
  if (!context) {
    throw new Error("useAccessibility must be used within AccessibilityProvider")
  }
  return context
}

interface AccessibilityProviderProps {
  children: React.ReactNode
  initialPreferences?: Partial<AccessibilityPreferences>
}

export function AccessibilityProvider({
  children,
  initialPreferences,
}: AccessibilityProviderProps) {
  // Initialize state with lazy initialization to avoid setState in effect
  const [preferences, setPreferences] = React.useState<AccessibilityPreferences>(() => {
    // Try to load from localStorage first
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("accessibility-preferences")
      if (stored) {
        try {
          const parsed = JSON.parse(stored)
          return { ...defaultPreferences, ...parsed, ...initialPreferences }
        } catch (error) {
          console.error("Failed to parse accessibility preferences:", error)
        }
      }
    }
    return { ...defaultPreferences, ...initialPreferences }
  })

  const applyAccessibilityStyles = React.useCallback(() => {
    const root = document.documentElement

    // Apply high contrast
    if (preferences.highContrast) {
      root.classList.add("high-contrast")
    } else {
      root.classList.remove("high-contrast")
    }

    // Apply font size
    root.classList.remove("font-small", "font-medium", "font-large", "font-xlarge")
    root.classList.add(`font-${preferences.fontSize}`)

    // Apply reduced motion
    if (preferences.reducedMotion) {
      root.classList.add("reduced-motion")
      // Set CSS variable for prefers-reduced-motion
      root.style.setProperty("--motion-reduce", "1")
    } else {
      root.classList.remove("reduced-motion")
      root.style.setProperty("--motion-reduce", "0")
    }

    // Set CSS custom properties
    root.style.setProperty("--accessibility-high-contrast", preferences.highContrast ? "1" : "0")
    root.style.setProperty("--accessibility-font-size", preferences.fontSize)
  }, [preferences])

  // Save preferences to localStorage when they change
  useEffect(() => {
    localStorage.setItem("accessibility-preferences", JSON.stringify(preferences))
    applyAccessibilityStyles()
  }, [applyAccessibilityStyles, preferences])

  // Apply styles on mount and when preferences change
  useEffect(() => {
    applyAccessibilityStyles()
  }, [applyAccessibilityStyles])

  const updatePreferences = React.useCallback((newPrefs: Partial<AccessibilityPreferences>) => {
    setPreferences((prev) => ({ ...prev, ...newPrefs }))
  }, [])

  return (
    <AccessibilityContext.Provider
      value={{
        preferences,
        updatePreferences,
        applyAccessibilityStyles,
      }}
    >
      {children}
    </AccessibilityContext.Provider>
  )
}

