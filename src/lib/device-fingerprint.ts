import { createHash } from "crypto"

/**
 * Generate a device fingerprint based on various device characteristics
 * This creates a unique identifier for a device that persists across sessions
 */
export function generateDeviceFingerprint(
  userAgent: string | null,
  ipAddress: string | null,
  screenWidth?: number,
  screenHeight?: number,
  timezone?: string,
  language?: string,
  platform?: string
): string {
  // Collect device characteristics
  const characteristics: string[] = []

  // User agent (browser, OS, device info)
  if (userAgent) {
    characteristics.push(userAgent)
  }

  // Screen resolution (if available)
  if (screenWidth && screenHeight) {
    characteristics.push(`screen:${screenWidth}x${screenHeight}`)
  }

  // Timezone
  if (timezone) {
    characteristics.push(`tz:${timezone}`)
  } else {
    // Fallback to browser timezone offset
    try {
      const offset = new Date().getTimezoneOffset()
      characteristics.push(`tz-offset:${offset}`)
    } catch {
      // Ignore if timezone detection fails
    }
  }

  // Language
  if (language) {
    characteristics.push(`lang:${language}`)
  }

  // Platform
  if (platform) {
    characteristics.push(`platform:${platform}`)
  }

  // IP address (first 3 octets only for privacy, helps with device identification)
  if (ipAddress) {
    const ipParts = ipAddress.split(".")
    if (ipParts.length === 4) {
      // Use first 3 octets only (e.g., 192.168.1.x)
      characteristics.push(`ip-prefix:${ipParts[0]}.${ipParts[1]}.${ipParts[2]}`)
    }
  }

  // Combine all characteristics and create hash
  const fingerprintString = characteristics.join("|")
  
  // Create SHA-256 hash of the fingerprint
  const hash = createHash("sha256")
  hash.update(fingerprintString)
  return hash.digest("hex")
}

/**
 * Generate device fingerprint from client-side data
 * This should be called from the browser to get screen, timezone, etc.
 */
export function generateClientDeviceFingerprint(
  userAgent: string | null,
  ipAddress: string | null
): string {
  // For server-side generation, we use only available data
  // Client-side should call generateDeviceFingerprint with all parameters
  return generateDeviceFingerprint(userAgent, ipAddress)
}

/**
 * Check if a device fingerprint matches a known trusted device
 * Checks both active and expired sessions to persist trust across sessions
 */
export async function isDeviceTrusted(
  fingerprint: string,
  userId: string
): Promise<boolean> {
  const prisma = (await import("@/lib/prisma")).default
  
  // Check if any session with this fingerprint was ever marked as trusted
  // This allows trust to persist even after sessions expire
  const trustedDevice = await prisma.session.findFirst({
    where: {
      userId,
      deviceFingerprint: fingerprint,
      isTrusted: true,
    },
    orderBy: {
      lastActiveAt: 'desc', // Get the most recent trusted session
    },
  })

  return !!trustedDevice
}

/**
 * Get device fingerprint from session
 */
export async function getDeviceFingerprintFromSession(
  sessionToken: string
): Promise<string | null> {
  const prisma = (await import("@/lib/prisma")).default
  
  const session = await prisma.session.findUnique({
    where: { sessionToken },
    select: { deviceFingerprint: true },
  })

  return session?.deviceFingerprint || null
}
