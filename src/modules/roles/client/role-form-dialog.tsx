"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface RoleFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: Record<string, unknown>) => void
}

export function RoleFormDialog({ open, onOpenChange, onSubmit }: RoleFormDialogProps) {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const data = {
      name: formData.get("role-name"),
      description: formData.get("role-description"),
    }
    onSubmit(data)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Role</DialogTitle>
          <DialogDescription>
            Define a custom role with specific permissions
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="role-name">Role Name</Label>
              <Input id="role-name" name="role-name" placeholder="Custom Role" required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="role-description">Description</Label>
              <Textarea
                id="role-description"
                name="role-description"
                placeholder="Brief description of the role"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Create & Set Permissions</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
