import { redirect, notFound } from "next/navigation"
import { getCurrentUser } from "@/lib/current-user"
import { headers } from "next/headers"

/**
 * Server component that protects admin routes by checking authentication, email verification, and MFA verification
 * This should wrap all admin routes to ensure users are authenticated, have verified email, and have verified MFA if required
 */
export async function AdminRouteGuard({ children }: { children: React.ReactNode }) {
  // Check if accessing from a subdomain - /admin is only accessible on subdomains
  const headersList = await headers()
  const subdomain = headersList.get("x-subdomain")
  
  // If no subdomain, show not found (admin routes are only accessible on subdomains)
  if (!subdomain) {
    notFound()
  }
  
  const { user, isAuthenticated, session } = await getCurrentUser();

  // If not authenticated, redirect to login
  if (!isAuthenticated || !user) {
    redirect("/login")
  }

  // Check email verification - must be verified before accessing admin
  if (!user.emailVerified) {
    redirect("/verify-email-required")
  }

  // PRIMARY CHECK: Use shouldVerifyMfa flag which is calculated correctly in getCurrentUser
  // shouldVerifyMfa = mfaEnabled && !session.mfaVerified && hasMfaMethod
  // This is the authoritative check that considers all factors
  if (session?.mfaSetupRequired === true || session?.mfaRequired === true) {
    if (session?.mfaSetupRequired === true) {
      redirect("/mfa-setup")
    } else if (session?.mfaRequired === true) {
      redirect("/mfa-verify")
    } else {
      return <>{children}</>
    }
  } else {
    return <>{children}</>
  }
}
