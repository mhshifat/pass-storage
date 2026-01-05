"use client"

import { useEffect } from "react"
import { I18nextProvider } from "react-i18next"
import i18n from "@/lib/i18n"

export function I18nProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Verify i18n language matches HTML lang attribute (set by server)
    // This ensures SSR and client are in sync
    if (typeof window !== "undefined") {
      const htmlLang = document.documentElement.lang
      
      // If i18n is already initialized with the correct language, we're good
      // Otherwise, sync it (though it should already be correct from i18n.ts initialization)
      if (htmlLang && (htmlLang === 'en' || htmlLang === 'bn') && i18n.language !== htmlLang) {
        // This should rarely happen, but it's a safety check
        i18n.changeLanguage(htmlLang).catch(() => {
          // Silent fail
        })
      }
      
      // Sync localStorage with cookie if needed
      const getCookieValue = (name: string) => {
        const value = `; ${document.cookie}`
        const parts = value.split(`; ${name}=`)
        if (parts.length === 2) return parts.pop()?.split(';').shift()
        return null
      }
      
      const cookieLanguage = getCookieValue("i18nextLng")
      const localStorageLanguage = localStorage.getItem("i18nextLng")
      
      if (cookieLanguage && !localStorageLanguage) {
        localStorage.setItem("i18nextLng", cookieLanguage)
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


