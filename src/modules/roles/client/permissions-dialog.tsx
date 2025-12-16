"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"

interface Role {
  id: string
  name: string
  isSystem: boolean
}

interface Permission {
  id: string
  name: string
  description: string
}

interface PermissionCategory {
  category: string
  items: Permission[]
}

interface PermissionsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  role: Role | null
  permissions: PermissionCategory[]
}

export function PermissionsDialog({ open, onOpenChange, role, permissions }: PermissionsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{role?.name} - Permissions</DialogTitle>
          <DialogDescription>
            {role?.isSystem
              ? "View permissions for this system role"
              : "Manage permissions for this custom role"}
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-6">
          {permissions.map((category, index) => (
            <div key={category.category}>
              <h3 className="font-semibold text-sm mb-3">{category.category}</h3>
              <div className="space-y-3">
                {category.items.map((permission) => (
                  <div
                    key={permission.id}
                    className="flex items-start justify-between p-3 rounded-lg border bg-card"
                  >
                    <div className="flex-1">
                      <div className="font-medium text-sm">{permission.name}</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {permission.description}
                      </div>
                    </div>
                    <Switch disabled={role?.isSystem} defaultChecked={Math.random() > 0.3} />
                  </div>
                ))}
              </div>
              {index < permissions.length - 1 && <Separator className="mt-6" />}
            </div>
          ))}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {role?.isSystem ? "Close" : "Cancel"}
          </Button>
          {!role?.isSystem && (
            <Button onClick={() => onOpenChange(false)}>Save Changes</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
