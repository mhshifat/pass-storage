"use client"

import * as React from "react"
import { useAccessibility } from "./accessibility-provider"
import { trpc } from "@/trpc/client"

/**
 * Component to sync accessibility preferences from user settings
 * This ensures accessibility preferences from database are applied
 */
export function AccessibilityInitializer() {
  const { updatePreferences } = useAccessibility()
  const [mounted, setMounted] = React.useState(false)
  const { data: userProfile } = trpc.users.getProfile.useQuery(undefined, {
    enabled: mounted,
    retry: false,
  })

  React.useEffect(() => {
    setMounted(true)
  }, [])

  // Load accessibility preferences from user profile
  React.useEffect(() => {
    if (!mounted || !userProfile?.user?.preferences) return

    const preferences = userProfile.user.preferences as any
    if (preferences?.accessibility) {
      updatePreferences(preferences.accessibility)
    }
  }, [mounted, userProfile, updatePreferences])

  return null
}

