import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

export function MfaSetupAlert({ error, success }: { error: string | null; success: boolean }) {
  if (error)
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  if (success)
    return (
      <Alert>
        <AlertDescription>MFA setup complete! You can now access your account.</AlertDescription>
      </Alert>
    )
  return null
}
