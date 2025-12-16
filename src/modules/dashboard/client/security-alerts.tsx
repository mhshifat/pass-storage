"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertTriangle } from "lucide-react"

interface Alert {
  type: "warning" | "info"
  message: string
  time: string
}

interface SecurityAlertsProps {
  alerts: Alert[]
}

export function SecurityAlerts({ alerts }: SecurityAlertsProps) {
  return (
    <Card className="lg:col-span-1">
      <CardHeader>
        <CardTitle>Security Alerts</CardTitle>
        <CardDescription>
          Important notifications and warnings
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {alerts.map((alert, index) => (
            <div key={index} className="flex items-start gap-4 p-3 rounded-lg border bg-card">
              <AlertTriangle className={`h-5 w-5 mt-0.5 ${alert.type === 'warning' ? 'text-yellow-600' : 'text-blue-600'}`} />
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium leading-none">
                  {alert.message}
                </p>
                <p className="text-xs text-muted-foreground">
                  {alert.time}
                </p>
              </div>
            </div>
          ))}
        </div>
        <Button variant="outline" className="w-full mt-4">
          View All Alerts
        </Button>
      </CardContent>
    </Card>
  )
}
