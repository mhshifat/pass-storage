"use client"

import { useState } from "react"
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
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

interface SendEmailDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (subject: string, message: string) => Promise<void>
  userEmail?: string
  userName?: string
}

export function SendEmailDialog({
  open,
  onOpenChange,
  onConfirm,
  userEmail,
  userName,
}: SendEmailDialogProps) {
  const [subject, setSubject] = useState("")
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleConfirm = async () => {
    setError("")

    if (!subject.trim()) {
      setError("Subject is required")
      return
    }

    if (!message.trim()) {
      setError("Message is required")
      return
    }

    setIsLoading(true)
    try {
      await onConfirm(subject, message)
      setSubject("")
      setMessage("")
      onOpenChange(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send email")
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    setSubject("")
    setMessage("")
    setError("")
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Send Email</DialogTitle>
          <DialogDescription>
            {userName && userEmail
              ? `Send an email to ${userName} (${userEmail})`
              : "Compose and send an email to this user"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="to">To</Label>
            <Input
              id="to"
              type="email"
              value={userEmail || ""}
              disabled
              className="bg-muted"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="subject">Subject</Label>
            <Input
              id="subject"
              placeholder="Enter email subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              placeholder="Enter your message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              disabled={isLoading}
              rows={8}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={isLoading}>
            {isLoading ? "Sending..." : "Send Email"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
