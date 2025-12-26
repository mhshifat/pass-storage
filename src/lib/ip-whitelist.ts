import prisma from "@/lib/prisma"

/**
 * Check if an IP address matches a CIDR range
 */
export function ipMatchesCidr(ip: string, cidr: string): boolean {
  // Handle single IP addresses (not CIDR)
  if (!cidr.includes("/")) {
    return ip === cidr
  }

  const [network, prefixLength] = cidr.split("/")
  const prefix = parseInt(prefixLength, 10)

  // Convert IP addresses to numbers
  const ipToNumber = (ip: string): number => {
    return ip.split(".").reduce((acc, octet) => (acc << 8) + parseInt(octet, 10), 0) >>> 0
  }

  const networkNum = ipToNumber(network)
  const ipNum = ipToNumber(ip)
  const mask = ~((1 << (32 - prefix)) - 1)

  return (networkNum & mask) === (ipNum & mask)
}

/**
 * Check if an IP address is whitelisted for a user or company
 */
export async function isIpWhitelisted(
  ipAddress: string,
  userId?: string,
  companyId?: string
): Promise<{ allowed: boolean; reason?: string }> {
  if (!ipAddress) {
    return { allowed: true } // Allow if no IP provided (e.g., localhost)
  }

  // Check user-specific whitelist first
  if (userId) {
    const userWhitelist = await prisma.ipWhitelist.findMany({
      where: {
        userId,
        isActive: true,
      },
    })

    for (const entry of userWhitelist) {
      if (ipMatchesCidr(ipAddress, entry.ipAddress)) {
        return { allowed: true }
      }
    }
  }

  // Check company-wide whitelist
  if (companyId) {
    const companyWhitelist = await prisma.ipWhitelist.findMany({
      where: {
        companyId,
        userId: null, // Company-wide entries
        isActive: true,
      },
    })

    for (const entry of companyWhitelist) {
      if (ipMatchesCidr(ipAddress, entry.ipAddress)) {
        return { allowed: true }
      }
    }
  }

  // Check if IP whitelisting is enforced
  const ipWhitelistEnabled = await prisma.settings.findUnique({
    where: { key: "security.ip_whitelist_enabled" },
  })

  if (ipWhitelistEnabled?.value === true) {
    // IP whitelisting is enabled and IP is not whitelisted
    return {
      allowed: false,
      reason: "IP address is not whitelisted",
    }
  }

  // IP whitelisting is not enforced, allow access
  return { allowed: true }
}

/**
 * Get geolocation information for an IP address
 * Uses a free geolocation API (ipapi.co or similar)
 */
export async function getIpGeolocation(ipAddress: string): Promise<{
  country?: string
  countryCode?: string
  city?: string
  region?: string
  isp?: string
  isVpn?: boolean
  isProxy?: boolean
} | null> {
  try {
    // Skip for localhost/private IPs
    if (
      ipAddress === "127.0.0.1" ||
      ipAddress === "::1" ||
      ipAddress.startsWith("192.168.") ||
      ipAddress.startsWith("10.") ||
      ipAddress.startsWith("172.16.") ||
      ipAddress.startsWith("172.17.") ||
      ipAddress.startsWith("172.18.") ||
      ipAddress.startsWith("172.19.") ||
      ipAddress.startsWith("172.20.") ||
      ipAddress.startsWith("172.21.") ||
      ipAddress.startsWith("172.22.") ||
      ipAddress.startsWith("172.23.") ||
      ipAddress.startsWith("172.24.") ||
      ipAddress.startsWith("172.25.") ||
      ipAddress.startsWith("172.26.") ||
      ipAddress.startsWith("172.27.") ||
      ipAddress.startsWith("172.28.") ||
      ipAddress.startsWith("172.29.") ||
      ipAddress.startsWith("172.30.") ||
      ipAddress.startsWith("172.31.")
    ) {
      return null
    }

    // Use ipapi.co free API (no key required for basic usage)
    // You can also use other services like ip-api.com, ipgeolocation.io, etc.
    const apiKey = process.env.IP_GEOLOCATION_API_KEY
    const apiUrl = apiKey
      ? `https://ipapi.co/${ipAddress}/json/?key=${apiKey}`
      : `https://ipapi.co/${ipAddress}/json/`

    const response = await fetch(apiUrl, {
      headers: {
        "User-Agent": "PassBangla/1.0",
      },
    })

    if (!response.ok) {
      console.warn(`Failed to fetch geolocation for IP ${ipAddress}: ${response.statusText}`)
      return null
    }

    const data = await response.json()

    // Check for API errors
    if (data.error) {
      console.warn(`Geolocation API error for IP ${ipAddress}: ${data.reason || "Unknown error"}`)
      return null
    }

    return {
      country: data.country_name,
      countryCode: data.country_code,
      city: data.city,
      region: data.region,
      isp: data.org,
      // Note: ipapi.co doesn't provide VPN detection in free tier
      // You may need to use a different service or API key for VPN detection
      isVpn: data.vpn === true || data.proxy === true,
      isProxy: data.proxy === true,
    }
  } catch (error) {
    console.error(`Error fetching geolocation for IP ${ipAddress}:`, error)
    return null
  }
}

/**
 * Check if an IP address is allowed based on geographic restrictions
 */
export async function checkGeographicRestriction(
  ipAddress: string,
  userId?: string,
  companyId?: string
): Promise<{ allowed: boolean; reason?: string; countryCode?: string }> {
  // Get geolocation for the IP
  const geo = await getIpGeolocation(ipAddress)

  if (!geo || !geo.countryCode) {
    // If we can't determine location, allow by default (fail open)
    return { allowed: true }
  }

  // Check user-specific restrictions first
  if (userId) {
    const userRestrictions = await prisma.geographicRestriction.findMany({
      where: {
        userId,
        isActive: true,
      },
    })

    for (const restriction of userRestrictions) {
      if (restriction.countryCode === geo.countryCode) {
        if (restriction.action === "BLOCK") {
          return {
            allowed: false,
            reason: `Access from ${geo.country || geo.countryCode} is blocked`,
            countryCode: geo.countryCode,
          }
        }
        // If action is ALLOW and country matches, allow access
        if (restriction.action === "ALLOW") {
          return { allowed: true, countryCode: geo.countryCode }
        }
      }
    }
  }

  // Check company-wide restrictions
  if (companyId) {
    const companyRestrictions = await prisma.geographicRestriction.findMany({
      where: {
        companyId,
        userId: null, // Company-wide entries
        isActive: true,
      },
    })

    for (const restriction of companyRestrictions) {
      if (restriction.countryCode === geo.countryCode) {
        if (restriction.action === "BLOCK") {
          return {
            allowed: false,
            reason: `Access from ${geo.country || geo.countryCode} is blocked`,
            countryCode: geo.countryCode,
          }
        }
        // If action is ALLOW and country matches, allow access
        if (restriction.action === "ALLOW") {
          return { allowed: true, countryCode: geo.countryCode }
        }
      }
    }
  }

  // Check if geographic restrictions are enforced
  const geoRestrictionEnabled = await prisma.settings.findUnique({
    where: { key: "security.geographic_restriction_enabled" },
  })

  if (geoRestrictionEnabled?.value === true) {
    // If restrictions are enabled and we have ALLOW rules, check if country is in allow list
    const allowRules = await prisma.geographicRestriction.findMany({
      where: {
        OR: [{ userId }, { companyId, userId: null }],
        action: "ALLOW",
        isActive: true,
      },
    })

    if (allowRules.length > 0) {
      // If there are ALLOW rules, only allow if country is in the list
      const isAllowed = allowRules.some((rule) => rule.countryCode === geo.countryCode)
      if (!isAllowed) {
        return {
          allowed: false,
          reason: `Access from ${geo.country || geo.countryCode} is not allowed`,
          countryCode: geo.countryCode,
        }
      }
    }
  }

  return { allowed: true, countryCode: geo.countryCode }
}

/**
 * Check for suspicious location based on user's login history
 */
export async function checkSuspiciousLocation(
  ipAddress: string,
  userId: string
): Promise<{ suspicious: boolean; reason?: string; geo?: unknown }> {
  // Get geolocation for current IP
  const currentGeo = await getIpGeolocation(ipAddress)

  if (!currentGeo || !currentGeo.countryCode) {
    return { suspicious: false }
  }

  // Get user's recent login history (last 10 logins)
  const recentLogins = await prisma.auditLog.findMany({
    where: {
      userId,
      action: "LOGIN_SUCCESS",
      ipAddress: { not: null },
      createdAt: {
        gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), // Last 90 days
      },
    },
    orderBy: { createdAt: "desc" },
    take: 10,
    select: {
      ipAddress: true,
      createdAt: true,
    },
  })

  // Get unique countries from recent logins
  const recentCountries = new Set<string>()
  for (const login of recentLogins) {
    if (login.ipAddress) {
      const geo = await getIpGeolocation(login.ipAddress)
      if (geo?.countryCode) {
        recentCountries.add(geo.countryCode)
      }
    }
  }

  // If user has never logged in from this country before, it's suspicious
  if (recentCountries.size > 0 && !recentCountries.has(currentGeo.countryCode)) {
    return {
      suspicious: true,
      reason: `Login from new location: ${currentGeo.country || currentGeo.countryCode}`,
      geo: currentGeo,
    }
  }

  // Check for VPN/proxy usage
  if (currentGeo.isVpn || currentGeo.isProxy) {
    return {
      suspicious: true,
      reason: "VPN or proxy detected",
      geo: currentGeo,
    }
  }

  return { suspicious: false, geo: currentGeo }
}

/**
 * Validate IP address format
 */
export function isValidIpAddress(ip: string): boolean {
  // Check for IPv4
  const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}(\/\d{1,2})?$/
  if (ipv4Regex.test(ip)) {
    const parts = ip.split("/")[0].split(".")
    return parts.every((part) => {
      const num = parseInt(part, 10)
      return num >= 0 && num <= 255
    })
  }

  // Check for CIDR notation
  if (ip.includes("/")) {
    const [network, prefix] = ip.split("/")
    const prefixNum = parseInt(prefix, 10)
    if (prefixNum < 0 || prefixNum > 32) {
      return false
    }
    return isValidIpAddress(network)
  }

  return false
}
