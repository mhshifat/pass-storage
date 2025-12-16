"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

interface GroupFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: Record<string, unknown>) => void
}

export function GroupFormDialog({ open, onOpenChange, onSubmit }: GroupFormDialogProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget as HTMLFormElement)
    onSubmit({
      name: formData.get("name"),
      description: formData.get("description"),
      manager: formData.get("manager"),
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Group</DialogTitle>
          <DialogDescription>
            Create a group to organize users and manage password access
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Group Name</Label>
              <Input id="name" name="name" placeholder="Development Team" required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Brief description of the group"
                rows={3}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="manager">Group Manager</Label>
              <Input id="manager" name="manager" placeholder="Search for a user..." />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Create Group</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
