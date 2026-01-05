"use client"

import { useEffect } from "react"
import { I18nextProvider } from "react-i18next"
import i18n from "@/lib/i18n"

export function I18nProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Priority: cookie/localStorage > HTML lang attribute
    // Cookie/localStorage is the user's explicit preference and should always win
    if (typeof window !== "undefined") {
      const getCookieValue = (name: string) => {
        const value = `; ${document.cookie}`
        const parts = value.split(`; ${name}=`)
        if (parts.length === 2) return parts.pop()?.split(';').shift()
        return null
      }
      
      const cookieLanguage = getCookieValue("i18nextLng")
      const localStorageLanguage = localStorage.getItem("i18nextLng")
      const htmlLang = document.documentElement.lang
      
      // Priority 1: Cookie (user's explicit preference)
      // Priority 2: localStorage (user's explicit preference)
      // Priority 3: HTML lang (server-set, might be wrong after redirect)
      const preferredLanguage = (cookieLanguage && (cookieLanguage === 'en' || cookieLanguage === 'bn')) 
        ? cookieLanguage
        : (localStorageLanguage && (localStorageLanguage === 'en' || localStorageLanguage === 'bn'))
        ? localStorageLanguage
        : (htmlLang && (htmlLang === 'en' || htmlLang === 'bn'))
        ? htmlLang
        : 'en'
      
      // Sync localStorage with cookie if needed
      if (cookieLanguage && !localStorageLanguage) {
        localStorage.setItem("i18nextLng", cookieLanguage)
      } else if (localStorageLanguage && !cookieLanguage) {
        // Set cookie from localStorage if cookie is missing
        const expires = new Date()
        expires.setFullYear(expires.getFullYear() + 1)
        document.cookie = `i18nextLng=${localStorageLanguage}; path=/; expires=${expires.toUTCString()}; SameSite=Lax`
      }
      
      // Only change language if it doesn't match the preferred language
      // This ensures user preference (cookie/localStorage) always wins over HTML lang
      if (i18n.language !== preferredLanguage && (preferredLanguage === 'en' || preferredLanguage === 'bn')) {
        i18n.changeLanguage(preferredLanguage).catch(() => {
          // Silent fail
        })
        // Update HTML lang to match preferred language
        document.documentElement.lang = preferredLanguage
      }
    }
  }, [])

  // Listen for language changes
  useEffect(() => {
    const handleLanguageChange = (lng: string) => {
      if (typeof document !== "undefined") {
        document.documentElement.lang = lng
      }
      // Force a re-render by dispatching a custom event
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("i18n:languageChanged", { detail: lng }))
      }
    }

    i18n.on("languageChanged", handleLanguageChange)

    return () => {
      i18n.off("languageChanged", handleLanguageChange)
    }
  }, [])

  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>
}


