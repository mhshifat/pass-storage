"use client"

import { useEffect } from "react"
import { I18nextProvider } from "react-i18next"
import i18n from "@/lib/i18n"

export function I18nProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Initialize i18n on client side and update HTML lang attribute
    if (typeof window !== "undefined") {
      // Get language from localStorage or use default
      const savedLanguage = localStorage.getItem("i18nextLng") || "en"
      i18n.changeLanguage(savedLanguage).then(() => {
        // Update HTML lang attribute
        document.documentElement.lang = savedLanguage
      })
    }
  }, [])

  // Listen for language changes
  useEffect(() => {
    const handleLanguageChange = (lng: string) => {
      if (typeof document !== "undefined") {
        document.documentElement.lang = lng
      }
    }

    i18n.on("languageChanged", handleLanguageChange)

    return () => {
      i18n.off("languageChanged", handleLanguageChange)
    }
  }, [])

  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>
}


