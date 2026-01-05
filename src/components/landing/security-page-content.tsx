"use client"

import { Shield, Lock, Key, Eye, Server, CheckCircle2, FileText, Users, Award, Globe } from "lucide-react"
import { useTranslation } from "@/hooks/use-translation"
import { TrustBadges } from "./trust-badges"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export function SecurityPageContent() {
  const { t } = useTranslation()

  const securityFeatures = [
    {
      icon: Lock,
      title: t("landing.security.aes256cbc.title"),
      description: t("landing.security.aes256cbc.description"),
    },
    {
      icon: Key,
      title: t("landing.security.clientSideEncryption.title"),
      description: t("landing.security.clientSideEncryption.description"),
    },
    {
      icon: Shield,
      title: t("landing.security.pbkdf2.title"),
      description: t("landing.security.pbkdf2.description"),
    },
    {
      icon: Eye,
      title: t("landing.security.zeroKnowledge.title"),
      description: t("landing.security.zeroKnowledge.description"),
    },
    {
      icon: Server,
      title: t("landing.security.encryptedAtRest.title"),
      description: t("landing.security.encryptedAtRest.description"),
    },
    {
      icon: CheckCircle2,
      title: t("landing.security.httpsEverywhere.title"),
      description: t("landing.security.httpsEverywhere.description"),
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-primary/5 via-background to-muted/20">
        <div className="max-w-4xl mx-auto text-center">
          <Shield className="h-16 w-16 text-primary mx-auto mb-6" />
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            {t("landing.securityPage.title")}
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            {t("landing.securityPage.subtitle")}
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span>{t("landing.securityPage.trustedBy")}</span>
            </div>
            <div className="flex items-center gap-2">
              <Award className="h-4 w-4" />
              <span>{t("landing.securityPage.audited")}</span>
            </div>
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              <span>{t("landing.securityPage.compliant")}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="py-12 px-4 border-b">
        <div className="max-w-7xl mx-auto">
          <TrustBadges />
        </div>
      </section>

      {/* Security Architecture */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              {t("landing.securityPage.architecture.title")}
            </h2>
            <p className="text-lg text-muted-foreground">
              {t("landing.securityPage.architecture.subtitle")}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {securityFeatures.map((feature, index) => {
              const Icon = feature.icon
              return (
                <div
                  key={index}
                  className="p-6 rounded-lg border border-border bg-card hover:shadow-md transition-shadow"
                >
                  <Icon className="h-8 w-8 text-primary mb-4" />
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Zero-Knowledge Explanation */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <Eye className="h-12 w-12 text-primary mx-auto mb-4" />
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              {t("landing.securityPage.zeroKnowledge.title")}
            </h2>
            <p className="text-lg text-muted-foreground">
              {t("landing.securityPage.zeroKnowledge.subtitle")}
            </p>
          </div>

          <div className="space-y-6">
            <div className="p-6 bg-background rounded-lg border border-border">
              <h3 className="font-semibold mb-2">{t("landing.securityPage.zeroKnowledge.point1.title")}</h3>
              <p className="text-muted-foreground">{t("landing.securityPage.zeroKnowledge.point1.desc")}</p>
            </div>
            <div className="p-6 bg-background rounded-lg border border-border">
              <h3 className="font-semibold mb-2">{t("landing.securityPage.zeroKnowledge.point2.title")}</h3>
              <p className="text-muted-foreground">{t("landing.securityPage.zeroKnowledge.point2.desc")}</p>
            </div>
            <div className="p-6 bg-background rounded-lg border border-border">
              <h3 className="font-semibold mb-2">{t("landing.securityPage.zeroKnowledge.point3.title")}</h3>
              <p className="text-muted-foreground">{t("landing.securityPage.zeroKnowledge.point3.desc")}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Compliance & Audits */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <FileText className="h-12 w-12 text-primary mx-auto mb-4" />
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              {t("landing.securityPage.compliance.title")}
            </h2>
            <p className="text-lg text-muted-foreground">
              {t("landing.securityPage.compliance.subtitle")}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="p-6 rounded-lg border border-border bg-card">
              <h3 className="font-semibold mb-2">{t("landing.securityPage.compliance.gdpr.title")}</h3>
              <p className="text-muted-foreground text-sm">{t("landing.securityPage.compliance.gdpr.desc")}</p>
            </div>
            <div className="p-6 rounded-lg border border-border bg-card">
              <h3 className="font-semibold mb-2">{t("landing.securityPage.compliance.audits.title")}</h3>
              <p className="text-muted-foreground text-sm">{t("landing.securityPage.compliance.audits.desc")}</p>
            </div>
            <div className="p-6 rounded-lg border border-border bg-card">
              <h3 className="font-semibold mb-2">{t("landing.securityPage.compliance.bugBounty.title")}</h3>
              <p className="text-muted-foreground text-sm">{t("landing.securityPage.compliance.bugBounty.desc")}</p>
            </div>
            <div className="p-6 rounded-lg border border-border bg-card">
              <h3 className="font-semibold mb-2">{t("landing.securityPage.compliance.transparency.title")}</h3>
              <p className="text-muted-foreground text-sm">{t("landing.securityPage.compliance.transparency.desc")}</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 bg-primary/5">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">{t("landing.securityPage.cta.title")}</h2>
          <p className="text-muted-foreground mb-8">{t("landing.securityPage.cta.subtitle")}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg">
              <Link href="/register">{t("landing.securityPage.cta.getStarted")}</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/privacy">{t("landing.securityPage.cta.privacyPolicy")}</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}

