"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"

interface SecurityAlert {
  type: "weak" | "expiring"
  count: number
  message: string
}

interface SecurityAlertsProps {
  alerts: SecurityAlert[]
}

export function SecurityAlerts({ alerts }: SecurityAlertsProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleFilterClick = (type: "weak" | "expiring") => {
    const params = new URLSearchParams(searchParams.toString())
    
    if (type === "weak") {
      // Filter by weak strength
      params.set("filter", "weak")
      params.delete("page") // Reset to first page
    } else if (type === "expiring") {
      // Filter by expiring soon
      params.set("filter", "expiring")
      params.delete("page") // Reset to first page
    }
    
    router.push(`?${params.toString()}`)
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {alerts.map((alert) => (
        <Card
          key={alert.type}
          className={
            alert.type === "weak"
              ? "border-red-200 bg-red-50/50"
              : "border-yellow-200 bg-yellow-50/50"
          }
        >
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <AlertTriangle
                className={`h-5 w-5 ${
                  alert.type === "weak" ? "text-red-600" : "text-yellow-600"
                }`}
              />
              <CardTitle
                className={`text-sm font-medium ${
                  alert.type === "weak" ? "text-red-900" : "text-yellow-900"
                }`}
              >
                {alert.type === "weak" ? "Weak Passwords" : "Expiring Passwords"}
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p
              className={`text-sm ${
                alert.type === "weak" ? "text-red-800" : "text-yellow-800"
              }`}
            >
              {alert.message}
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-3"
              onClick={() => handleFilterClick(alert.type)}
            >
              {alert.type === "weak" ? "Review Weak Passwords" : "View Expiring Passwords"}
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
