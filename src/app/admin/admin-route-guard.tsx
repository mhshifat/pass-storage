import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/current-user"

/**
 * Server component that protects admin routes by checking authentication and MFA verification
 * This should wrap all admin routes to ensure users are authenticated and have verified MFA if required
 */
export async function AdminRouteGuard({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, session } = await getCurrentUser();

  // If not authenticated, redirect to login
  if (!isAuthenticated || !user) {
    redirect("/login")
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
