"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface LiveRegionProps {
  "aria-live"?: "polite" | "assertive" | "off"
  "aria-atomic"?: boolean
  className?: string
  children?: React.ReactNode
}

/**
 * Live region component for screen reader announcements
 */
export function LiveRegion({
  "aria-live": ariaLive = "polite",
  "aria-atomic": ariaAtomic = true,
  className,
  children,
}: LiveRegionProps) {
  return (
    <div
      role="status"
      aria-live={ariaLive}
      aria-atomic={ariaAtomic}
      className={cn("sr-only", className)}
    >
      {children}
    </div>
  )
}

