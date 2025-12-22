"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Sparkles } from "lucide-react"
import { useTour } from "@/components/tour"
import { useTranslation } from "react-i18next"

export function StartTourButton() {
  const { startTour, isActive } = useTour()
  const { t } = useTranslation()

  return (
    <Button
      onClick={startTour}
      disabled={isActive}
      variant="outline"
      className="gap-2"
    >
      <Sparkles className="h-4 w-4" />
      {t("onboarding.startTour")}
    </Button>
  )
}
