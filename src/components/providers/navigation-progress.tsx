"use client"

import * as React from "react"
import { usePathname, useSearchParams } from "next/navigation"
import NProgress from "nprogress"
import "nprogress/nprogress.css"
import { PageLoader } from "@/components/ui/page-loader"

// Configure NProgress
if (typeof window !== "undefined") {
  NProgress.configure({
    showSpinner: false,
    trickleSpeed: 200,
    minimum: 0.08,
    easing: "ease",
    speed: 500,
  })
}

interface NavigationProgressProps {
  showFullPageLoader?: boolean
}

export function NavigationProgress({ showFullPageLoader = false }: NavigationProgressProps = {}) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [mounted, setMounted] = React.useState(false)
  const [isNavigating, setIsNavigating] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  React.useEffect(() => {
    if (!mounted) return

    // Start progress when route changes
    setIsNavigating(true)
    NProgress.start()

    // Complete progress after route change is processed
    const timer = setTimeout(() => {
      setIsNavigating(false)
      NProgress.done()
    }, 300)

    return () => {
      clearTimeout(timer)
      setIsNavigating(false)
      NProgress.done()
    }
  }, [pathname, searchParams, mounted])

  // Intercept Link clicks for better UX
  React.useEffect(() => {
    if (!mounted) return

    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      const link = target.closest("a")
      
      if (link && link.href) {
        const url = new URL(link.href)
        const currentUrl = new URL(window.location.href)
        
        // Only show progress for same-origin navigation
        if (url.origin === currentUrl.origin && url.pathname !== currentUrl.pathname) {
          setIsNavigating(true)
          NProgress.start()
        }
      }
    }

    document.addEventListener("click", handleClick, true)
    return () => {
      document.removeEventListener("click", handleClick, true)
    }
  }, [mounted])

  return (
    <>
      {showFullPageLoader && isNavigating && <PageLoader />}
    </>
  )
}
