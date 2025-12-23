"use client"

import * as React from "react"
import { useTranslation } from "react-i18next"
import { cn } from "@/lib/utils"

interface SkipLinkProps {
  href: string
  children?: React.ReactNode
  className?: string
}

/**
 * Skip link component for keyboard navigation
 * Allows users to skip to main content
 */
export function SkipLink({ href, children, className }: SkipLinkProps) {
  const { t } = useTranslation()

  return (
    <a
      href={href}
      className={cn(
        "sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50",
        "focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground",
        "focus:rounded-md focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-ring",
        className
      )}
      aria-label={children ? undefined : t("accessibility.skipToContent")}
    >
      {children || t("accessibility.skipToContent")}
    </a>
  )
}

