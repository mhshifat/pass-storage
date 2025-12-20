import { NextRequest, NextResponse } from "next/server"

/**
 * Extract subdomain from request hostname
 * Examples:
 * - bevy.passstorage.com -> "bevy"
 * - passstorage.com -> null (main domain)
 * - localhost:3000 -> null (development)
 */
function getSubdomain(req: NextRequest): string | null {
  const hostname = req.headers.get("host") || ""
  
  // In development, subdomain might be in the format: subdomain.localhost:3000
  // In production, it would be: subdomain.passstorage.com
  const parts = hostname.split(".")
  
  // If we have at least 3 parts (subdomain.domain.tld) or 2 parts in localhost (subdomain.localhost)
  if (parts.length >= 3 || (parts.length === 2 && parts[1].includes("localhost"))) {
    const subdomain = parts[0]
    // Don't treat "www" as a subdomain
    if (subdomain && subdomain !== "www" && subdomain !== "localhost") {
      return subdomain
    }
  }
  
  return null
}

export async function middleware(req: NextRequest) {
  const subdomain = getSubdomain(req)
  const { pathname } = req.nextUrl

  // Store subdomain in headers for server components to access
  const requestHeaders = new Headers(req.headers)
  requestHeaders.set("x-subdomain", subdomain || "")

  // Route protection based on subdomain (Edge-compatible only)
  // Block /register on subdomains
  if (subdomain && pathname.startsWith("/register")) {
    return NextResponse.redirect(new URL("/login", req.url))
  }

  // Block /login on main domain (only allow on subdomains)
  if (!subdomain && pathname.startsWith("/login")) {
    return NextResponse.redirect(new URL("/register", req.url))
  }

  // Create response with subdomain header
  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })
  
  // Preserve subdomain header in response
  response.headers.set("x-subdomain", subdomain || "")
  
  return response
}

export const config = {
  matcher: ["/((?!_next|api|static|favicon.ico).*)"],
}
