import { cookies, headers } from "next/headers"
import { getLanguageFromCountry } from "./country-language-detection"

const LANGUAGE_COOKIE_NAME = "i18nextLng"
const DEFAULT_LANGUAGE = "en"
const SUPPORTED_LANGUAGES = ["en", "bn"] as const

export type SupportedLanguage = typeof SUPPORTED_LANGUAGES[number]

/**
 * Detect country from request headers (server-side)
 * Uses Cloudflare/Vercel headers if available, or Accept-Language header
 */
async function detectCountryFromHeaders(): Promise<string | null> {
  try {
    const headersList = await headers()
    
    // Cloudflare provides CF-IPCountry header
    const cfCountry = headersList.get('cf-ipcountry')
    if (cfCountry) return cfCountry
    
    // Vercel provides x-vercel-ip-country header
    const vercelCountry = headersList.get('x-vercel-ip-country')
    if (vercelCountry) return vercelCountry
    
    // Try to extract from Accept-Language header as fallback
    const acceptLanguage = headersList.get('accept-language')
    if (acceptLanguage) {
      // Accept-Language format: "en-US,en;q=0.9,bn-BD;q=0.8" or "bn,en;q=0.9" or "bn-BD,bn;q=0.9,en;q=0.8"
      // First check if Bengali language is present (bn-BD or bn)
      const locales = acceptLanguage.split(',')
      for (const locale of locales) {
        const langPart = locale.split(';')[0].trim().toLowerCase()
        // Check if it's Bengali (bn-BD, bn, or bn-*)
        if (langPart.startsWith('bn')) {
          // Extract country code if present (bn-BD -> BD)
          const parts = langPart.split('-')
          if (parts.length > 1) {
            const countryCode = parts[1].toUpperCase()
            // If it's BD, return it; otherwise check if it's a valid country code
            if (countryCode === 'BD') {
              return 'BD'
            }
          }
          // If just "bn" without country, assume Bangladesh (most common Bengali-speaking country)
          return 'BD'
        }
      }
      
      // If no Bengali found, extract country codes from other locales (but don't use for language detection)
      // We only want to detect country if Bengali language is present
    }
  } catch (error) {
    // Ignore errors - country detection is optional
  }
  
  return null
}

/**
 * Get the user's language preference (server-side)
 * Priority:
 * 1. Cookie (user's explicit preference) - HIGHEST
 * 2. Country-based detection (if no preference set)
 * 3. Default to 'en'
 */
export async function getServerLanguage(): Promise<SupportedLanguage> {
  try {
    const cookieStore = await cookies()
    const languageCookie = cookieStore.get(LANGUAGE_COOKIE_NAME)?.value
    
    // Priority 1: User's explicit preference (cookie) - always respect this
    if (languageCookie && SUPPORTED_LANGUAGES.includes(languageCookie as SupportedLanguage)) {
      return languageCookie as SupportedLanguage
    }
    
    // Priority 2: Country-based detection (only if no preference is set)
    const countryCode = await detectCountryFromHeaders()
    const countryLanguage = getLanguageFromCountry(countryCode)
    if (countryLanguage) {
      return countryLanguage
    }
  } catch (error) {
    // If cookies() fails (e.g., in middleware), try country detection
    try {
      const countryCode = await detectCountryFromHeaders()
      const countryLanguage = getLanguageFromCountry(countryCode)
      if (countryLanguage) {
        return countryLanguage
      }
    } catch {
      // Ignore country detection errors
    }
    console.warn("Failed to read language cookie:", error)
  }
  
  // Priority 3: Default to English
  return DEFAULT_LANGUAGE
}

/**
 * Get blog translations based on language
 */
export function getBlogTranslations(language: SupportedLanguage) {
  // Import translations dynamically to avoid server/client issues
  if (language === "bn") {
    const bnTranslations = require("@/locales/bn/common.json")
    return bnTranslations.blog || {}
  }
  
  const enTranslations = require("@/locales/en/common.json")
  return enTranslations.blog || {}
}


