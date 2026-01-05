import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
// LanguageDetector removed - we handle language detection manually via blocking script

// Import translation files
import enTranslations from '@/locales/en/common.json'
import bnTranslations from '@/locales/bn/common.json'

// Only initialize if not already initialized (for client-side)
if (!i18n.isInitialized) {  
  // Get initial language with priority:
  // 1. window.__I18N_INITIAL_LANGUAGE__ (set by blocking script from cookie/localStorage/server)
  // 2. Cookie (user's explicit preference)
  // 3. localStorage (user's explicit preference)
  // 4. HTML lang attribute (set by server from country detection)
  // 5. Default to 'en'
  // NO browser language detection - only use explicit preferences
  let initialLanguage = 'en'
  if (typeof window !== 'undefined') {
    // Priority 1: window.__I18N_INITIAL_LANGUAGE__ (set by blocking script)
    const windowWithLang = window as typeof window & { __I18N_INITIAL_LANGUAGE__?: string }
    if (windowWithLang.__I18N_INITIAL_LANGUAGE__) {
      const scriptLang = windowWithLang.__I18N_INITIAL_LANGUAGE__
      if (scriptLang === 'en' || scriptLang === 'bn') {
        initialLanguage = scriptLang
      }
    } else {
      // Priority 2: Cookie (user's explicit preference)
      const cookieMatch = document.cookie.match(/i18nextLng=([^;]+)/)
      if (cookieMatch && (cookieMatch[1] === 'en' || cookieMatch[1] === 'bn')) {
        initialLanguage = cookieMatch[1]
      } else {
        // Priority 3: localStorage (user's explicit preference)
        const stored = localStorage.getItem('i18nextLng')
        if (stored && (stored === 'en' || stored === 'bn')) {
          initialLanguage = stored
        } else {
          // Priority 4: HTML lang attribute (set by server from country detection)
          const htmlLang = document.documentElement.lang
          if (htmlLang && (htmlLang === 'en' || htmlLang === 'bn')) {
            initialLanguage = htmlLang
          }
        }
      }
    }
  }
  i18n
    .use(initReactI18next) // Passes i18n down to react-i18next
    .init({
      resources: {
        en: {
          translation: enTranslations,
        },
        bn: {
          translation: bnTranslations,
        },
      },
      fallbackLng: 'en', // Default language
      lng: initialLanguage, // Set initial language to match server - this prevents LanguageDetector from overriding
      debug: false,
      react: {
        useSuspense: false, // Disable suspense to avoid hydration issues
      },
      interpolation: {
        escapeValue: false, // React already escapes values
      },
      // No detection config - we handle language detection manually via blocking script
      // The blocking script sets the cookie, and we read it in initialLanguage
      // Ensure proper language loading
      supportedLngs: ['en', 'bn'],
      nonExplicitSupportedLngs: false,
    })
    .then(() => {
      // Ensure the language is set correctly after initialization
      // Cookie (set by blocking script) is the source of truth
      if (typeof window !== 'undefined') {
        // Get the language from cookie (set by blocking script) as source of truth
        const cookieMatch = document.cookie.match(/i18nextLng=([^;]+)/)
        const cookieLang = cookieMatch && (cookieMatch[1] === 'en' || cookieMatch[1] === 'bn') ? cookieMatch[1] : null
        
        // If cookie exists, use it (it was set by blocking script from timezone detection)
        // Otherwise, use initialLanguage
        const targetLanguage = cookieLang || initialLanguage
        
        // Only change language if it doesn't match the target
        // This prevents LanguageDetector from overriding the cookie
        if (i18n.language !== targetLanguage && targetLanguage) {
          i18n.changeLanguage(targetLanguage).catch(() => {
            // Silent fail
          })
        }
        
        // IMPORTANT: Only update cookie if it doesn't exist or matches targetLanguage
        // Never overwrite a cookie that was set by the blocking script
        if (cookieLang) {
          // Cookie already exists (set by blocking script) - don't overwrite it
          // Just sync localStorage
          try {
            localStorage.setItem('i18nextLng', cookieLang)
          } catch {
            // Ignore localStorage errors
          }
        } else if (targetLanguage === 'en' || targetLanguage === 'bn') {
          // No cookie exists - set it now
          const expires = new Date()
          expires.setFullYear(expires.getFullYear() + 1)
          document.cookie = `i18nextLng=${targetLanguage}; path=/; expires=${expires.toUTCString()}; SameSite=Lax`
          try {
            localStorage.setItem('i18nextLng', targetLanguage)
          } catch {
            // Ignore localStorage errors
          }
        }
      }
    })
    .catch((error) => {
      console.error('i18n initialization error:', error)
    })
}

export default i18n


