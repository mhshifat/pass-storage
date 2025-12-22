import { cookies } from "next/headers"
import { SignJWT, jwtVerify } from "jose"

const secret = new TextEncoder().encode(
  process.env.SESSION_SECRET || "default-secret-change-in-production"
)

export interface SessionData {
  userId: string
  email: string
  isLoggedIn: boolean,
  mfaVerified?: boolean,
  mfaSetupRequired?: boolean,
  mfaRequired?: boolean,
}

export async function createSession(
  userId: string,
  email: string,
  { 
    mfaVerified = true, 
    mfaSetupRequired = false, 
    mfaRequired = false,
    ipAddress = null,
    userAgent = null,
  }: {
    mfaVerified?: boolean
    mfaSetupRequired?: boolean
    mfaRequired?: boolean
    ipAddress?: string | null
    userAgent?: string | null
  } = {}
) {
  // Get session timeout from settings
  const prisma = (await import("@/lib/prisma")).default
  const sessionTimeoutSetting = await prisma.settings.findUnique({
    where: { key: "security.session.timeout_minutes" },
  })
  
  const timeoutMinutes = (sessionTimeoutSetting?.value as number) ?? 30
  const expirationTime = `${timeoutMinutes}m`
  const maxAge = timeoutMinutes * 60 // Convert to seconds

  const payload = { userId, email, isLoggedIn: true, mfaVerified, mfaSetupRequired, mfaRequired };
  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime(expirationTime)
    .sign(secret)

  const cookieStore = await cookies()
  cookieStore.set("session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge,
    path: "/",
  })

  // Parse device info from user agent
  const { parseUserAgent } = await import("@/lib/device-parser")
  const deviceInfo = parseUserAgent(userAgent)

  // Calculate expiration date
  const expires = new Date(Date.now() + maxAge * 1000)

  // Create database session record
  try {
    await prisma.session.create({
      data: {
        sessionToken: token,
        userId,
        expires,
        ipAddress: ipAddress || null,
        userAgent: userAgent || null,
        deviceName: deviceInfo.deviceName,
        deviceType: deviceInfo.deviceType,
        isTrusted: false, // Default to not trusted
        lastActiveAt: new Date(),
      },
    })
  } catch (error) {
    // Log error but don't fail session creation
    console.error("Failed to create database session record:", error)
  }
}

export async function getSession(): Promise<SessionData> {
  const cookieStore = await cookies()
  const token = cookieStore.get("session")?.value

  if (!token) {
    return { userId: "", email: "", isLoggedIn: false }
  }

  try {
    const { payload } = await jwtVerify(token, secret)
    
    // Verify session exists in database (not revoked)
    const prisma = (await import("@/lib/prisma")).default
    const dbSession = await prisma.session.findUnique({
      where: { sessionToken: token },
      select: { id: true, expires: true },
    })

    // If session doesn't exist in database or is expired, invalidate
    if (!dbSession || new Date(dbSession.expires) < new Date()) {
      // Session was revoked or expired, delete cookie
      cookieStore.delete("session")
      return { userId: "", email: "", isLoggedIn: false }
    }

    return {
      ...payload as unknown as SessionData
    }
  } catch {
    // Invalid token, delete cookie
    cookieStore.delete("session")
    return { userId: "", email: "", isLoggedIn: false }
  }
}

export async function destroySession() {
  const cookieStore = await cookies()
  const token = cookieStore.get("session")?.value

  // Delete cookie
  cookieStore.delete("session")

  // Delete database session record if token exists
  if (token) {
    try {
      const prisma = (await import("@/lib/prisma")).default
      await prisma.session.deleteMany({
        where: {
          sessionToken: token,
        },
      })
    } catch (error) {
      // Log error but don't fail logout
      console.error("Failed to delete database session record:", error)
    }
  }
}
