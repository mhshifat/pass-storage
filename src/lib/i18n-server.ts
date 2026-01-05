import { cookies } from "next/headers"

const LANGUAGE_COOKIE_NAME = "i18nextLng"
const DEFAULT_LANGUAGE = "en"
const SUPPORTED_LANGUAGES = ["en", "bn"] as const

export type SupportedLanguage = typeof SUPPORTED_LANGUAGES[number]

/**
 * Get the user's language preference from cookies (server-side)
 * This ensures SSR and client render the same language
 */
export async function getServerLanguage(): Promise<SupportedLanguage> {
  try {
    const cookieStore = await cookies()
    const languageCookie = cookieStore.get(LANGUAGE_COOKIE_NAME)?.value
    
    if (languageCookie && SUPPORTED_LANGUAGES.includes(languageCookie as SupportedLanguage)) {
      return languageCookie as SupportedLanguage
    }
  } catch (error) {
    // If cookies() fails (e.g., in middleware), return default
    console.warn("Failed to read language cookie:", error)
  }
  
  return DEFAULT_LANGUAGE
}


