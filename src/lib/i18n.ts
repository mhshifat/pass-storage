import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

// Import translation files
import enTranslations from '@/locales/en/common.json'
import bnTranslations from '@/locales/bn/common.json'

// Only initialize if not already initialized (for client-side)
if (!i18n.isInitialized) {
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
      lng: typeof window !== 'undefined' ? localStorage.getItem('i18nextLng') || 'en' : 'en', // Initial language
      debug: false,
      interpolation: {
        escapeValue: false, // React already escapes values
      },
      detection: {
        // Order of language detection
        order: ['localStorage', 'navigator', 'htmlTag'],
        caches: ['localStorage'], // Cache language preference
        lookupLocalStorage: 'i18nextLng',
      },
    })
}

export default i18n


