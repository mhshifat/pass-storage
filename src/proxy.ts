import { NextRequest, NextResponse } from "next/server";
import { getSession } from "./lib/session";
import prisma from "./lib/prisma";

// Define route groups
const MFA_ROUTES = ["/mfa-setup", "/mfa-verify"];
const AUTH_ROUTES = ["/login", "/register"];
const ADMIN_ROUTE = "/admin";

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const session = await getSession();

  // Not logged in: block all except auth routes
  if (!session?.isLoggedIn) {
    if (!AUTH_ROUTES.some(route => pathname.startsWith(route))) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
    return NextResponse.next();
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { mfaEnabled: true, mfaSecret: true },
  });

  if (!user) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Logged in: block auth routes, redirect to admin
  if (AUTH_ROUTES.some(route => pathname.startsWith(route))) {
    return NextResponse.redirect(new URL(ADMIN_ROUTE, req.url));
  }

  if (!user.mfaEnabled) {
    return NextResponse.next();
  }

  // MFA routes: block if not logged in
  if (MFA_ROUTES.some(route => pathname.startsWith(route)) && !session?.isLoggedIn) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (MFA_ROUTES.some(route => pathname.startsWith(route)) && session?.mfaVerified) {
    return NextResponse.redirect(new URL(ADMIN_ROUTE, req.url));
  }

  // All other cases: allow
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|api|static|favicon.ico).*)"],
};
