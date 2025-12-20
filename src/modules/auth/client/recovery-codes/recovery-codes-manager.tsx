"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { trpc } from "@/trpc/client"
import { toast } from "sonner"
import { Loader2, Copy, Check, AlertTriangle, RefreshCw, Download } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"

export function RecoveryCodesManager() {
  const [generatedCodes, setGeneratedCodes] = useState<string[] | null>(null)
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)
  const utils = trpc.useUtils()
  const { data: codesData, isLoading } = trpc.auth.listRecoveryCodes.useQuery()
  const { data: mfaSettings } = trpc.settings.getMfaSettings.useQuery()
  const generateCodes = trpc.auth.generateRecoveryCodes.useMutation({
    onSuccess: (data) => {
      setGeneratedCodes(data.codes)
      utils.auth.listRecoveryCodes.invalidate()
      toast.success("Recovery codes generated successfully. Please save them now!")
    },
    onError: (error) => {
      toast.error(error.message || "Failed to generate recovery codes")
    },
  })

  const handleCopy = async (code: string, index: number) => {
    try {
      await navigator.clipboard.writeText(code)
      setCopiedIndex(index)
      setTimeout(() => setCopiedIndex(null), 2000)
      toast.success("Code copied to clipboard")
    } catch {
      toast.error("Failed to copy code")
    }
  }

  const handleCopyAll = async () => {
    if (!generatedCodes) return
    try {
      await navigator.clipboard.writeText(generatedCodes.join("\n"))
      toast.success("All codes copied to clipboard")
    } catch {
      toast.error("Failed to copy codes")
    }
  }

  const handleDownload = () => {
    if (!generatedCodes) return
    
    const content = [
      "Recovery Codes",
      "==============",
      "",
      "Save these codes in a secure location. Each code can only be used once.",
      "",
      "IMPORTANT: If you lose access to your MFA device, use one of these codes to access your account.",
      "",
      ...generatedCodes.map((code, index) => `${index + 1}. ${code}`),
      "",
      `Generated: ${new Date().toLocaleString()}`,
      "",
      "Security Notice:",
      "- Store these codes in a secure, private location",
      "- Do not share these codes with anyone",
      "- Each code can only be used once",
      "- Generate new codes if you suspect they have been compromised",
    ].join("\n")

    const blob = new Blob([content], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `recovery-codes-${new Date().toISOString().split("T")[0]}.txt`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    toast.success("Recovery codes downloaded")
  }

  const unusedCount = codesData?.unusedCount ?? 0
  const totalCount = codesData?.totalCount ?? 0

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recovery Codes</CardTitle>
        <CardDescription>
          Backup codes to access your account if you lose your MFA device
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            {!mfaSettings?.recoveryCodesEnabled ? (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Recovery codes are not enabled by your administrator.
                </AlertDescription>
              </Alert>
            ) : totalCount === 0 ? (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  You don't have any recovery codes. Generate them now to secure your account.
                </AlertDescription>
              </Alert>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    Unused codes: <span className="font-semibold">{unusedCount}</span> / {totalCount}
                  </p>
                  {unusedCount === 0 && (
                    <Badge variant="destructive">All codes used</Badge>
                  )}
                </div>
                {unusedCount === 0 && (
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      All your recovery codes have been used. Generate new ones to maintain account access.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            )}

            <Dialog>
              <DialogTrigger asChild>
                <Button
                  variant={totalCount === 0 ? "default" : "outline"}
                  disabled={generateCodes.isPending || !mfaSettings?.recoveryCodesEnabled}
                  className="w-full"
                >
                  {generateCodes.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      {totalCount === 0 ? "Generate Recovery Codes" : "Generate New Codes"}
                    </>
                  )}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Recovery Codes</DialogTitle>
                  <DialogDescription>
                    Save these codes in a safe place. Each code can only be used once.
                  </DialogDescription>
                </DialogHeader>
                {generatedCodes ? (
                  <div className="space-y-4">
                    <Alert>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        <strong>Important:</strong> Save these codes now. You won't be able to see them again after closing this dialog.
                      </AlertDescription>
                    </Alert>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {generatedCodes.map((code, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 border rounded-lg font-mono text-sm"
                        >
                          <span>{code}</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleCopy(code, index)}
                            className="h-8 w-8"
                          >
                            {copiedIndex === index ? (
                              <Check className="h-4 w-4 text-green-600" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={handleCopyAll} variant="outline" className="flex-1">
                        <Copy className="mr-2 h-4 w-4" />
                        Copy All
                      </Button>
                      <Button onClick={handleDownload} variant="outline" className="flex-1">
                        <Download className="mr-2 h-4 w-4" />
                        Download
                      </Button>
                      <Button
                        onClick={() => setGeneratedCodes(null)}
                        variant="default"
                        className="flex-1"
                      >
                        I've Saved Them
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground mb-4">
                      Click the button below to generate recovery codes
                    </p>
                    <Button
                      onClick={() => generateCodes.mutate()}
                      disabled={generateCodes.isPending}
                    >
                      {generateCodes.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <RefreshCw className="mr-2 h-4 w-4" />
                          Generate Codes
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </DialogContent>
            </Dialog>
          </>
        )}
      </CardContent>
    </Card>
  )
}
