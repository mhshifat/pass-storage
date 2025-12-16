import { cookies } from "next/headers"
import { SignJWT, jwtVerify } from "jose"

const secret = new TextEncoder().encode(
  process.env.SESSION_SECRET || "default-secret-change-in-production"
)

export interface SessionData {
  userId: string
  email: string
  isLoggedIn: boolean
}

export async function createSession(userId: string, email: string) {
  const token = await new SignJWT({ userId, email, isLoggedIn: true })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("7d")
    .sign(secret)

  const cookieStore = await cookies()
  cookieStore.set("session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 days
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
      userId: payload.userId as string,
      email: payload.email as string,
      isLoggedIn: payload.isLoggedIn as boolean,
    }
  } catch {
    return { userId: "", email: "", isLoggedIn: false }
  }
}

export async function destroySession() {
  const cookieStore = await cookies()
  cookieStore.delete("session")
}
