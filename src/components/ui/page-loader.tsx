"use client"

import * as React from "react"

export function PageLoader() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-4">
        <LoaderSVG />
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    </div>
  )
}

function LoaderSVG() {
  return (
    <svg
      className="h-12 w-12 animate-spin text-primary"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  )
}

// Alternative loader with a more modern SVG design
export function ModernLoader() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-4">
        <ModernLoaderSVG />
        <p className="text-sm text-muted-foreground animate-pulse">Loading...</p>
      </div>
    </div>
  )
}

function ModernLoaderSVG() {
  return (
    <svg
      className="h-16 w-16"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 100"
      preserveAspectRatio="xMidYMid"
    >
      <circle
        cx="50"
        cy="50"
        r="35"
        fill="none"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
        className="text-primary"
      >
        <animate
          attributeName="stroke-dasharray"
          dur="2s"
          repeatCount="indefinite"
          values="0 220;110 110;0 220"
        />
        <animate
          attributeName="stroke-dashoffset"
          dur="2s"
          repeatCount="indefinite"
          values="0;-110;-220"
        />
      </circle>
      <circle
        cx="50"
        cy="50"
        r="20"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        className="text-primary/50"
      >
        <animate
          attributeName="stroke-dasharray"
          dur="1.5s"
          repeatCount="indefinite"
          values="0 125;62.5 62.5;0 125"
        />
        <animate
          attributeName="stroke-dashoffset"
          dur="1.5s"
          repeatCount="indefinite"
          values="0;-62.5;-125"
        />
      </circle>
    </svg>
  )
}
