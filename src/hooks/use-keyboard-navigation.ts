"use client"

import * as React from "react"

/**
 * Hook for managing keyboard navigation
 * Provides utilities for focus management and keyboard shortcuts
 */
export function useKeyboardNavigation() {
  const [focusedIndex, setFocusedIndex] = React.useState<number>(-1)

  // Focus trap for modals/dialogs
  const trapFocus = React.useCallback((containerRef: React.RefObject<HTMLElement>) => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return

      const container = containerRef.current
      if (!container) return

      const focusableElements = container.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )

      if (focusableElements.length === 0) return

      const firstElement = focusableElements[0]
      const lastElement = focusableElements[focusableElements.length - 1]

      if (e.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement) {
          e.preventDefault()
          lastElement.focus()
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          e.preventDefault()
          firstElement.focus()
        }
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => {
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [])

  // Arrow key navigation for lists
  const handleArrowNavigation = React.useCallback(
    (
      e: React.KeyboardEvent,
      items: HTMLElement[],
      currentIndex: number,
      onSelect?: (index: number) => void
    ) => {
      let newIndex = currentIndex

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault()
          newIndex = currentIndex < items.length - 1 ? currentIndex + 1 : 0
          break
        case "ArrowUp":
          e.preventDefault()
          newIndex = currentIndex > 0 ? currentIndex - 1 : items.length - 1
          break
        case "Home":
          e.preventDefault()
          newIndex = 0
          break
        case "End":
          e.preventDefault()
          newIndex = items.length - 1
          break
        case "Enter":
        case " ":
          e.preventDefault()
          if (onSelect) {
            onSelect(currentIndex)
          }
          return
        default:
          return
      }

      if (newIndex !== currentIndex && items[newIndex]) {
        items[newIndex].focus()
        setFocusedIndex(newIndex)
      }
    },
    []
  )

  // Escape key handler
  const handleEscape = React.useCallback(
    (callback: () => void) => {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          callback()
        }
      }

      document.addEventListener("keydown", handleKeyDown)
      return () => {
        document.removeEventListener("keydown", handleKeyDown)
      }
    },
    []
  )

  return {
    focusedIndex,
    setFocusedIndex,
    trapFocus,
    handleArrowNavigation,
    handleEscape,
  }
}

