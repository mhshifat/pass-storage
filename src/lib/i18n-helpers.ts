/**
 * Translation helper utilities
 * These utilities make it easier to work with translations throughout the app
 */

import { TFunction } from "react-i18next"

/**
 * Get a translation with fallback
 * If the translation key doesn't exist, returns the key itself
 */
export function getTranslation(
  t: TFunction,
  key: string,
  fallback?: string
): string {
  const translation = t(key)
  // If translation returns the key itself (meaning it wasn't found), use fallback or key
  if (translation === key) {
    return fallback || key
  }
  return translation
}

/**
 * Get a translation with interpolation
 */
export function getTranslationWithParams(
  t: TFunction,
  key: string,
  params: Record<string, string | number>
): string {
  return t(key, params)
}

/**
 * Common translation patterns
 */
export const translationPatterns = {
  // Page titles
  pageTitle: (t: TFunction, section: string) => t(`${section}.title`),
  
  // Page descriptions
  pageDescription: (t: TFunction, section: string) => t(`${section}.description`),
  
  // Form labels
  formLabel: (t: TFunction, field: string) => t(`common.${field}`) || t(field),
  
  // Button labels
  buttonLabel: (t: TFunction, action: string) => t(`common.${action}`) || t(action),
  
  // Success messages
  successMessage: (t: TFunction, action: string) => {
    const key = `${action}.success`
    const translation = t(key)
    return translation !== key ? translation : t("common.success")
  },
  
  // Error messages
  errorMessage: (t: TFunction, action: string) => {
    const key = `errors.${action}`
    const translation = t(key)
    return translation !== key ? translation : t("errors.somethingWentWrong")
  },
  
  // Empty states
  emptyState: (t: TFunction, resource: string) => {
    const key = `${resource}.no${resource.charAt(0).toUpperCase() + resource.slice(1)}`
    const translation = t(key)
    return translation !== key ? translation : t("common.noResults")
  },
  
  // Confirmation messages
  confirmAction: (t: TFunction, action: string, resource: string) => {
    return t("common.confirmAction", { action: t(`common.${action}`), resource: t(resource) })
  },
}

/**
 * Helper to create translation keys from component names
 */
export function createTranslationKey(section: string, key: string): string {
  return `${section}.${key}`
}

/**
 * Helper to check if a translation exists
 */
export function hasTranslation(t: TFunction, key: string): boolean {
  const translation = t(key)
  return translation !== key
}


