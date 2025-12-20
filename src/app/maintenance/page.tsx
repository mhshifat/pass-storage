import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Wrench } from "lucide-react"
import Link from "next/link"

export default function MaintenancePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            <Wrench className="h-8 w-8 text-muted-foreground" />
          </div>
          <CardTitle className="text-2xl">System Maintenance</CardTitle>
          <CardDescription>
            The system is currently under maintenance
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
          <p className="text-sm text-muted-foreground">
            We're performing scheduled maintenance to improve your experience. 
            Please check back shortly.
          </p>
          <p className="text-xs text-muted-foreground">
            Administrators can still access the system during maintenance.
          </p>
          <div className="pt-4">
            <Button asChild variant="outline">
              <Link href="/login">Back to Login</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
