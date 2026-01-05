"use client"

import { useEffect, useState } from "react"
import { useTranslation } from "@/hooks/use-translation"

/**
 * Hook to force component re-render when language changes
 * This ensures components update when i18n language changes
 */
export function useI18nRerender() {
  const { i18n } = useTranslation()
  const [langKey, setLangKey] = useState(() => i18n.language)
  
  useEffect(() => {
    // Set initial language
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLangKey(i18n.language)
    
    const handleLanguageChange = (lng: string) => {
      setLangKey(lng)
    }
    
    // Also listen for custom event
    const handleCustomEvent = (e: CustomEvent) => {
      setLangKey(e.detail)
    }
    
    i18n.on("languageChanged", handleLanguageChange)
    window.addEventListener("i18n:languageChanged", handleCustomEvent as EventListener)
    
    return () => {
      i18n.off("languageChanged", handleLanguageChange)
      window.removeEventListener("i18n:languageChanged", handleCustomEvent as EventListener)
    }
  }, [i18n])
  
  // Return the language key to force re-render
  return langKey
}

