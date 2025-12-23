"use client"

import * as React from "react"
import { useTranslation } from "react-i18next"
import { trpc } from "@/trpc/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Copy, Check, Eye, EyeOff, ExternalLink, AlertCircle, Lock } from "lucide-react"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

interface TemporaryPasswordShareViewProps {
  token: string
}

export function TemporaryPasswordShareView({ token }: TemporaryPasswordShareViewProps) {
  const { t } = useTranslation()
  const [showPassword, setShowPassword] = React.useState(false)
  const [copied, setCopied] = React.useState<string | null>(null)

  const { data, isLoading, error } = trpc.passwords.accessTemporaryShare.useQuery(
    { shareToken: token },
    {
      retry: false,
    }
  )

  const handleCopy = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast.success(t("clipboard.copied"))
      setCopied(type)
      setTimeout(() => setCopied(null), 2000)
    } catch (error) {
      toast.error(t("clipboard.copyFailed"))
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-64 mt-2" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              {t("passwords.temporaryShare.accessError")}
            </CardTitle>
            <CardDescription>
              {error?.message || t("passwords.temporaryShare.notFound")}
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  const { password, shareInfo } = data

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-muted/30">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                {t("passwords.temporaryShare.sharedPassword")}
              </CardTitle>
              <CardDescription className="mt-1">
                {t("passwords.temporaryShare.sharedBy", {
                  name: password.owner.name || password.owner.email,
                })}
              </CardDescription>
            </div>
            {shareInfo.isOneTime && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {t("passwords.temporaryShare.oneTime")}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">{t("common.name")}</label>
            <div className="flex items-center gap-2">
              <div className="flex-1 rounded-md border bg-background px-3 py-2 text-sm">
                {password.name}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">{t("passwords.username")}</label>
            <div className="flex items-center gap-2">
              <div className="flex-1 rounded-md border bg-background px-3 py-2 text-sm font-mono">
                {password.username}
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleCopy(password.username, "username")}
              >
                {copied === "username" ? (
                  <Check className="h-4 w-4 text-green-600" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">{t("common.password")}</label>
            <div className="flex items-center gap-2">
              <div className="flex-1 rounded-md border bg-background px-3 py-2 text-sm font-mono">
                {showPassword ? password.password : "••••••••••••"}
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleCopy(password.password, "password")}
              >
                {copied === "password" ? (
                  <Check className="h-4 w-4 text-green-600" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {password.url && (
            <div className="space-y-2">
              <label className="text-sm font-medium">URL</label>
              <div className="flex items-center gap-2">
                <a
                  href={password.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 rounded-md border bg-background px-3 py-2 text-sm text-blue-600 hover:underline truncate dark:text-blue-400"
                >
                  {password.url}
                </a>
                <Button
                  variant="outline"
                  size="icon"
                  asChild
                >
                  <a
                    href={password.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </Button>
              </div>
            </div>
          )}

          {password.notes && (
            <div className="space-y-2">
              <label className="text-sm font-medium">{t("passwords.notes")}</label>
              <div className="rounded-md border bg-background px-3 py-2 text-sm whitespace-pre-wrap">
                {password.notes}
              </div>
            </div>
          )}

          {password.hasTotp && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {t("passwords.temporaryShare.totpNote")}
              </AlertDescription>
            </Alert>
          )}

          <Separator />

          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="space-y-1">
              {shareInfo.expiresAt && (
                <div>
                  {t("passwords.temporaryShare.expiresAt")}:{" "}
                  {new Date(shareInfo.expiresAt).toLocaleString()}
                </div>
              )}
              {shareInfo.maxAccesses && (
                <div>
                  {t("passwords.temporaryShare.accessCount")}: {shareInfo.accessCount} / {shareInfo.maxAccesses}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

