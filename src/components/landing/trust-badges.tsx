"use client"

import { Shield, Lock, CheckCircle2, Award, FileCheck, Globe } from "lucide-react"
import { useTranslation } from "@/hooks/use-translation"

export function TrustBadges() {
  const { t } = useTranslation()

  const badges = [
    {
      icon: Shield,
      title: t("landing.trust.zeroKnowledge"),
      description: t("landing.trust.zeroKnowledgeDesc"),
    },
    {
      icon: Lock,
      title: t("landing.trust.clientSideEncryption"),
      description: t("landing.trust.clientSideEncryptionDesc"),
    },
    {
      icon: CheckCircle2,
      title: t("landing.trust.audited"),
      description: t("landing.trust.auditedDesc"),
    },
    {
      icon: Award,
      title: t("landing.trust.compliant"),
      description: t("landing.trust.compliantDesc"),
    },
    {
      icon: FileCheck,
      title: t("landing.trust.openSource"),
      description: t("landing.trust.openSourceDesc"),
    },
    {
      icon: Globe,
      title: t("landing.trust.gdpr"),
      description: t("landing.trust.gdprDesc"),
    },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {badges.map((badge, index) => {
        const Icon = badge.icon
        return (
          <div
            key={index}
            className="flex flex-col items-center text-center p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
          >
            <Icon className="h-8 w-8 text-primary mb-2" />
            <h3 className="font-semibold text-sm mb-1">{badge.title}</h3>
            <p className="text-xs text-muted-foreground">{badge.description}</p>
          </div>
        )
      })}
    </div>
  )
}

