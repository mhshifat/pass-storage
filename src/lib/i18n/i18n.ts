import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import enTranslation from './locales/en/translation.json';
import bnTranslation from './locales/bn/translation.json';

// Declare module namespace to augment react-i18next types
declare module 'react-i18next' {
  interface CustomTypeOptions {
    returnNull: false;
    resources: {
      translation: typeof enTranslation;
    };
  }
}

i18n
  .use(LanguageDetector) // Detects user language
  .use(initReactI18next) // Passes i18n down to react-i18next
  .init({
    resources: {
      en: {
        translation: enTranslation
      },
      bn: {
        translation: bnTranslation
      }
    },
    fallbackLng: 'en', // Default language
    interpolation: {
      escapeValue: false // React already escapes values
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage']
    },
    returnNull: false
  });

export default i18n;
