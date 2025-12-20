"use client"

import { useTranslation as useI18nTranslation } from "react-i18next"

/**
 * Custom hook for translations with type safety
 * This is a wrapper around react-i18next's useTranslation hook
 */
export function useTranslation() {
  return useI18nTranslation()
}


