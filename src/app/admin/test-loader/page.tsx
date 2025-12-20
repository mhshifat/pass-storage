"use client"

import * as React from "react"
import { PageLoader, ModernLoader } from "@/components/ui/page-loader"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function TestLoaderPage() {
  const [showLoader, setShowLoader] = React.useState(false)
  const [showModernLoader, setShowModernLoader] = React.useState(false)

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Loader Test Page</h1>
        <p className="text-muted-foreground mt-1">Test the page loader components</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Standard Page Loader</CardTitle>
            <CardDescription>Full-screen loader with spinning circle</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => {
              setShowLoader(true)
              setTimeout(() => setShowLoader(false), 2000)
            }}>
              Show Standard Loader (2s)
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Modern Page Loader</CardTitle>
            <CardDescription>Full-screen loader with animated circles</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => {
              setShowModernLoader(true)
              setTimeout(() => setShowModernLoader(false), 2000)
            }}>
              Show Modern Loader (2s)
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Navigation Progress Bar</CardTitle>
          <CardDescription>
            The progress bar at the top of the page should appear when you navigate between pages.
            Try clicking on any navigation link in the sidebar to see it in action.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            The nprogress bar is automatically shown at the top of the page during route transitions.
            You can see it by navigating between pages using the sidebar links.
          </p>
        </CardContent>
      </Card>

      {showLoader && <PageLoader />}
      {showModernLoader && <ModernLoader />}
    </div>
  )
}
