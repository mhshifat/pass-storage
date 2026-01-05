import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

// Import translation files
import enTranslations from '@/locales/en/common.json'
import bnTranslations from '@/locales/bn/common.json'

// Only initialize if not already initialized (for client-side)
if (!i18n.isInitialized) {  
  // Get initial language from HTML lang attribute (set by server) or cookie
  // This ensures SSR and client start with the same language
  let initialLanguage = 'en'
  if (typeof window !== 'undefined') {
    // Priority: HTML lang attribute (set by server from cookie) > cookie > localStorage
    // The HTML lang attribute is set by the server based on the cookie, so it's the source of truth
    const htmlLang = document.documentElement.lang
    if (htmlLang && (htmlLang === 'en' || htmlLang === 'bn')) {
      initialLanguage = htmlLang
    } else {
      // Fallback to reading cookie directly
      const cookieMatch = document.cookie.match(/i18nextLng=([^;]+)/)
      if (cookieMatch && (cookieMatch[1] === 'en' || cookieMatch[1] === 'bn')) {
        initialLanguage = cookieMatch[1]
      } else {
        // Last resort: localStorage
        const stored = localStorage.getItem('i18nextLng')
        if (stored && (stored === 'en' || stored === 'bn')) {
          initialLanguage = stored
        }
      }
    }
  }

  i18n
    .use(LanguageDetector) // Detects user language
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
      detection: {
        // Order of language detection - but lng is already set, so this only applies to future changes
        order: ['cookie', 'localStorage', 'navigator', 'htmlTag'],
        caches: ['cookie', 'localStorage'], // Cache language preference in both cookie and localStorage
        lookupCookie: 'i18nextLng',
        lookupLocalStorage: 'i18nextLng',
        cookieMinutes: 525600, // 1 year
        cookieOptions: {
          path: '/',
          sameSite: 'lax',
        },
      },
      // Ensure proper language loading
      supportedLngs: ['en', 'bn'],
      nonExplicitSupportedLngs: false,
    })
    .then(() => {
      // Ensure the language is set correctly after initialization
      // This is a safety check in case LanguageDetector tried to override
      if (typeof window !== 'undefined' && i18n.language !== initialLanguage) {
        i18n.changeLanguage(initialLanguage).catch(() => {
          // Silent fail - language is already set
        })
      }
    })
    .catch((error) => {
      console.error('i18n initialization error:', error)
    })
}

export default i18n


