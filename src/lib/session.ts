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

export async function createSession(userId: string, email: string, { mfaVerified = true, mfaSetupRequired = false, mfaRequired = false } = {}) {
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
}

export async function getSession(): Promise<SessionData> {
  const cookieStore = await cookies()
  const token = cookieStore.get("session")?.value

  if (!token) {
    return { userId: "", email: "", isLoggedIn: false }
  }

  try {
    const { payload } = await jwtVerify(token, secret)
    return {
      ...payload as unknown as SessionData
    }
  } catch {
    return { userId: "", email: "", isLoggedIn: false }
  }
}

export async function destroySession() {
  const cookieStore = await cookies()
  cookieStore.delete("session")
}
