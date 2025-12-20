"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, X, Info, AlertCircle, CheckCircle2 } from "lucide-react"
import { trpc } from "@/trpc/client"
import { toast } from "sonner"

interface Alert {
  id: string
  severity: "critical" | "high" | "medium" | "low"
  type: "warning" | "info" | "error"
  message: string
  time: string
}

interface SecurityAlertsProps {
  alerts: Alert[]
}

const severityConfig = {
  critical: {
    icon: AlertCircle,
    color: "text-red-600",
    bgColor: "bg-red-50 border-red-200",
    badge: "destructive",
  },
  high: {
    icon: AlertTriangle,
    color: "text-orange-600",
    bgColor: "bg-orange-50 border-orange-200",
    badge: "destructive",
  },
  medium: {
    icon: AlertTriangle,
    color: "text-yellow-600",
    bgColor: "bg-yellow-50 border-yellow-200",
    badge: "secondary",
  },
  low: {
    icon: Info,
    color: "text-blue-600",
    bgColor: "bg-blue-50 border-blue-200",
    badge: "outline",
  },
}

export function SecurityAlerts({ alerts: initialAlerts }: SecurityAlertsProps) {
  const router = useRouter()
  const [dismissedAlerts, setDismissedAlerts] = useState<Set<string>>(new Set())
  const utils = trpc.useUtils()
  const dismissAlert = trpc.dashboard.dismissAlert.useMutation({
    onSuccess: () => {
      toast.success("Alert dismissed")
      // Invalidate alerts to refetch
      utils.dashboard.securityAlerts.invalidate()
    },
    onError: (error) => {
      toast.error(`Failed to dismiss alert: ${error.message}`)
    },
  })

  const handleViewAllAlerts = () => {
    router.push("/admin/audit-logs")
  }

  const handleDismiss = (alertId: string) => {
    dismissAlert.mutate({ alertId })
    setDismissedAlerts((prev) => new Set(prev).add(alertId))
  }

  // Filter out dismissed alerts
  const visibleAlerts = initialAlerts.filter(
    (alert) => !dismissedAlerts.has(alert.id)
  )

  const getSeverityLabel = (severity: Alert["severity"]) => {
    return severity.charAt(0).toUpperCase() + severity.slice(1)
  }

  return (
    <Card className="lg:col-span-1">
      <CardHeader>
        <CardTitle>Security Alerts</CardTitle>
        <CardDescription>
          Important notifications and warnings
        </CardDescription>
      </CardHeader>
      <CardContent>
        {visibleAlerts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <svg
              width="120"
              height="120"
              viewBox="0 0 120 120"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="mx-auto"
            >
              <circle cx="60" cy="60" r="50" fill="#ECFDF5" />
              <circle cx="60" cy="50" r="20" fill="#10B981" opacity="0.2" />
              <path
                d="M60 35L60 55M60 65L60 70"
                stroke="#10B981"
                strokeWidth="3"
                strokeLinecap="round"
              />
              <circle cx="60" cy="50" r="15" stroke="#10B981" strokeWidth="2" fill="none" />
              <path
                d="M45 75C45 70.5817 48.5817 67 53 67H67C71.4183 67 75 70.5817 75 75V80H45V75Z"
                fill="#10B981"
                opacity="0.3"
              />
            </svg>
            <h3 className="text-sm font-semibold mt-4 mb-1">All clear!</h3>
            <p className="text-xs text-muted-foreground max-w-xs">
              No active security alerts. Your system is secure.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {visibleAlerts.map((alert) => {
              const config = severityConfig[alert.severity]
              const IconComponent = config.icon

              return (
                <div
                  key={alert.id}
                  className={`flex items-start gap-3 p-3 rounded-lg border ${config.bgColor} relative group`}
                >
                  <IconComponent className={`h-5 w-5 mt-0.5 flex-shrink-0 ${config.color}`} />
                  <div className="flex-1 space-y-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant={config.badge as any} className="text-xs">
                        {getSeverityLabel(alert.severity)}
                      </Badge>
                    </div>
                    <p className="text-sm font-medium leading-none">
                      {alert.message}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {alert.time}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                    onClick={() => handleDismiss(alert.id)}
                    disabled={dismissAlert.isPending}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )
            })}
          </div>
        )}
        <Button
          variant="outline"
          className="w-full mt-4"
          onClick={handleViewAllAlerts}
        >
          View All Alerts
        </Button>
      </CardContent>
    </Card>
  )
}
