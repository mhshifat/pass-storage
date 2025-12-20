import { NextRequest, NextResponse } from "next/server";
import { destroySession, getSession } from "./lib/session";
import prisma from "./lib/prisma";
import { hasPermission } from "./lib/permissions";

// Define route groups
const MFA_ROUTES = ["/mfa-setup", "/mfa-verify"];
const AUTH_ROUTES = ["/login", "/register"];
const ADMIN_ROUTE = "/admin";
const MAINTENANCE_ROUTE = "/maintenance";

// Route permission mapping
const ROUTE_PERMISSIONS: Record<string, string> = {
  "/admin/users": "user.view",
  "/admin/teams": "team.view",
  "/admin/roles": "role.manage",
  "/admin/passwords": "password.view",
  "/admin/audit-logs": "audit.view",
  "/admin/settings": "settings.view",
};

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const session = await getSession();

  // Not logged in: allow auth routes, block everything else
  if (!session?.isLoggedIn) {
    if (AUTH_ROUTES.some(route => pathname.startsWith(route))) {
      return NextResponse.next();
    }
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Logged in: block auth routes, redirect to admin
  if (AUTH_ROUTES.some(route => pathname.startsWith(route))) {
    return NextResponse.redirect(new URL(ADMIN_ROUTE, req.url));
  }

  // Get user for MFA and permission checks
  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { mfaEnabled: true, mfaSecret: true },
  });

  // If user doesn't exist in database but session exists, destroy session and redirect to login
  if (!user) {
    await destroySession();
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // MFA routes: handle MFA flow
  if (MFA_ROUTES.some(route => pathname.startsWith(route))) {
    if (!user?.mfaEnabled) {
      return NextResponse.redirect(new URL(ADMIN_ROUTE, req.url));
    }
    if (session.mfaVerified && pathname.startsWith("/mfa-verify")) {
      return NextResponse.redirect(new URL(ADMIN_ROUTE, req.url));
    }
    if (session.mfaVerified && pathname.startsWith("/mfa-setup")) {
      return NextResponse.redirect(new URL(ADMIN_ROUTE, req.url));
    }
    return NextResponse.next();
  }

  // If user has MFA enabled but not verified, redirect to MFA verify
  if (user?.mfaEnabled && !session.mfaVerified) {
    return NextResponse.redirect(new URL("/mfa-verify", req.url));
  }

  // Check maintenance mode - block non-admin users if enabled
  // Allow maintenance page itself and auth routes
  if (pathname !== MAINTENANCE_ROUTE && !AUTH_ROUTES.some(route => pathname.startsWith(route))) {
    const maintenanceModeSetting = await prisma.settings.findUnique({
      where: { key: "app.maintenance_mode" },
    })
    
    const isMaintenanceMode = maintenanceModeSetting?.value === true
    
    if (isMaintenanceMode) {
      // Check if user is an admin (SUPER_ADMIN role, ADMIN role, or has settings.edit permission)
      const userWithRole = await prisma.user.findUnique({
        where: { id: session.userId },
        select: { role: true },
      })
      
      const isSuperAdmin = userWithRole?.role === "SUPER_ADMIN"
      const isAdmin = userWithRole?.role === "ADMIN"
      const hasSettingsEdit = await hasPermission(session.userId, "settings.edit")
      
      const isAdminUser = isSuperAdmin || isAdmin || hasSettingsEdit
      
      // If not admin, block access and redirect to maintenance page
      if (!isAdminUser) {
        return NextResponse.redirect(new URL(MAINTENANCE_ROUTE, req.url))
      }
    }
  }

  // Check permissions for protected routes
  // First check exact match, then check if pathname starts with any route
  let requiredPermission: string | null = null
  
  if (ROUTE_PERMISSIONS[pathname]) {
    requiredPermission = ROUTE_PERMISSIONS[pathname]
  } else {
    // Check if pathname starts with any protected route
    const matchingRoute = Object.keys(ROUTE_PERMISSIONS).find(route => 
      pathname.startsWith(route + "/") || pathname === route
    )
    if (matchingRoute) {
      requiredPermission = ROUTE_PERMISSIONS[matchingRoute]
    }
  }
  
  if (requiredPermission) {
    try {
      const hasAccess = await hasPermission(session.userId, requiredPermission);
      if (!hasAccess) {
        return NextResponse.redirect(new URL("/admin", req.url));
      }
    } catch (error) {
      // If permission check fails (e.g., user doesn't exist), redirect to login
      await destroySession();
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  // All other cases: allow
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|api|static|favicon.ico).*)"],
};
