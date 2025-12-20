"use client"

import * as React from "react"
import { useTranslation } from "react-i18next"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Languages } from "lucide-react"
import { cn } from "@/lib/utils"

const languages = [
  { code: "en", name: "English", nativeName: "English" },
  { code: "bn", name: "Bangla", nativeName: "বাংলা" },
]

interface LanguageSelectorProps {
  className?: string
  variant?: "default" | "outline" | "ghost"
  size?: "default" | "sm" | "lg" | "icon"
  disabled?: boolean
}

export function LanguageSelector({
  className,
  variant = "outline",
  size = "default",
  disabled = false,
}: LanguageSelectorProps) {
  const { i18n } = useTranslation()
  const currentLanguage = languages.find((lang) => lang.code === i18n.language) || languages[0]

  const changeLanguage = (langCode: string) => {
    i18n.changeLanguage(langCode)
    // Update HTML lang attribute
    if (typeof document !== "undefined") {
      document.documentElement.lang = langCode
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={variant} size={size} className={cn("gap-2", className)} disabled={disabled}>
          <Languages className="h-4 w-4" />
          {size !== "icon" && <span>{currentLanguage.nativeName}</span>}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {languages.map((language) => (
          <DropdownMenuItem
            key={language.code}
            onClick={() => changeLanguage(language.code)}
            className={cn(
              "cursor-pointer",
              i18n.language === language.code && "bg-accent"
            )}
          >
            <div className="flex items-center gap-2">
              <span>{language.nativeName}</span>
              <span className="text-xs text-muted-foreground">({language.name})</span>
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}


