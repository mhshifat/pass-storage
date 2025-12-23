"use client"

import { useTranslation } from "react-i18next"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface AuditLog {
  id: string
  user: string
  userEmail: string
  action: string
  resource: string
  ipAddress: string
  timestamp: string
  status: "success" | "failed" | "warning" | "blocked"
  avatar: string | null
  details?: Record<string, unknown>
}

interface LogDetailsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  log: AuditLog | null
}

export function LogDetailsDialog({ open, onOpenChange, log }: LogDetailsDialogProps) {
  const { t } = useTranslation()
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "success":
        return <Badge className="bg-green-100 text-green-800 border-green-200">{t("audit.success")}</Badge>
      case "failed":
        return <Badge className="bg-red-100 text-red-800 border-red-200">{t("audit.failed")}</Badge>
      case "warning":
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">{t("audit.warning")}</Badge>
      case "blocked":
        return <Badge className="bg-gray-100 text-gray-800 border-gray-200">{t("audit.blocked")}</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  if (!log) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{t("audit.detailsDialog.title")}</DialogTitle>
          <DialogDescription>{t("audit.detailsDialog.description")}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="grid gap-4">
            <div className="grid grid-cols-3 items-center gap-4">
              <span className="text-sm font-medium">{t("audit.detailsDialog.user")}:</span>
              <div className="col-span-2">
                <div className="flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={log.avatar || undefined} />
                    <AvatarFallback>
                      {log.user
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="text-sm">
                      {log.user === "Unknown" ? t("audit.unknown") : log.user}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {log.userEmail === "N/A" ? t("audit.notAvailable") : log.userEmail}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 items-center gap-4">
              <span className="text-sm font-medium">{t("audit.action")}:</span>
              <span className="col-span-2 text-sm">{log.action}</span>
            </div>

            <div className="grid grid-cols-3 items-center gap-4">
              <span className="text-sm font-medium">{t("audit.resource")}:</span>
              <span className="col-span-2 text-sm">{log.resource}</span>
            </div>

            <div className="grid grid-cols-3 items-center gap-4">
              <span className="text-sm font-medium">{t("audit.ipAddress")}:</span>
              <code className="col-span-2 text-xs bg-muted px-2 py-1 rounded w-fit">
                {log.ipAddress === "N/A" ? t("audit.notAvailable") : log.ipAddress}
              </code>
            </div>

            <div className="grid grid-cols-3 items-center gap-4">
              <span className="text-sm font-medium">{t("audit.time")}:</span>
              <span className="col-span-2 text-sm">{log.timestamp}</span>
            </div>

            <div className="grid grid-cols-3 items-center gap-4">
              <span className="text-sm font-medium">{t("audit.status")}:</span>
              <div className="col-span-2">{getStatusBadge(log.status)}</div>
            </div>
          </div>

          {log.details && (
            <>
              <div className="border-t pt-4">
                <h4 className="text-sm font-medium mb-3">{t("audit.detailsDialog.additionalDetails")}</h4>
                <div className="space-y-2 bg-muted/50 p-3 rounded-lg">
                  {Object.entries(log.details).map(([key, value]) => (
                    <div key={key} className="flex justify-between text-sm">
                      <span className="text-muted-foreground capitalize">
                        {key.replace(/([A-Z])/g, " $1").trim()}:
                      </span>
                      <span className="font-medium">
                        {Array.isArray(value) ? value.join(", ") : String(value)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
        <div className="flex justify-end">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t("common.close")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
