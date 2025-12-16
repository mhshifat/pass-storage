"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface HealthMetric {
  label: string
  status: string
  percentage: number
  description: string
  color: string
}

interface SystemHealthProps {
  metrics: HealthMetric[]
}

export function SystemHealth({ metrics }: SystemHealthProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>System Health</CardTitle>
        <CardDescription>
          Overview of system performance and status
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-3">
          {metrics.map((metric, index) => (
            <div key={index} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{metric.label}</span>
                <Badge variant="secondary">{metric.status}</Badge>
              </div>
              <div className="h-2 bg-secondary rounded-full overflow-hidden">
                <div className={`h-full ${metric.color} w-[${metric.percentage}%]`} style={{ width: `${metric.percentage}%` }} />
              </div>
              <p className="text-xs text-muted-foreground">{metric.description}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
