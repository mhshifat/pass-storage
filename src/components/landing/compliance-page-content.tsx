"use client"

import { Shield, CheckCircle2, FileCheck, Globe, Lock, Award, Building2, Eye } from "lucide-react"
import { useTranslation } from "@/hooks/use-translation"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export function CompliancePageContent() {
  const { t } = useTranslation()

  const certifications = [
    {
      icon: Globe,
      title: t("landing.compliancePage.gdpr.title"),
      description: t("landing.compliancePage.gdpr.description"),
      status: t("landing.compliancePage.gdpr.status"),
      details: t("landing.compliancePage.gdpr.details"),
    },
    {
      icon: Shield,
      title: t("landing.compliancePage.soc2.title"),
      description: t("landing.compliancePage.soc2.description"),
      status: t("landing.compliancePage.soc2.status"),
      details: t("landing.compliancePage.soc2.details"),
    },
    {
      icon: Lock,
      title: t("landing.compliancePage.iso27001.title"),
      description: t("landing.compliancePage.iso27001.description"),
      status: t("landing.compliancePage.iso27001.status"),
      details: t("landing.compliancePage.iso27001.details"),
    },
    {
      icon: Building2,
      title: t("landing.compliancePage.ccpa.title"),
      description: t("landing.compliancePage.ccpa.description"),
      status: t("landing.compliancePage.ccpa.status"),
      details: t("landing.compliancePage.ccpa.details"),
    },
  ]

  const principles = [
    {
      icon: Eye,
      title: t("landing.compliancePage.principles.transparency.title"),
      description: t("landing.compliancePage.principles.transparency.description"),
    },
    {
      icon: Lock,
      title: t("landing.compliancePage.principles.security.title"),
      description: t("landing.compliancePage.principles.security.description"),
    },
    {
      icon: FileCheck,
      title: t("landing.compliancePage.principles.accountability.title"),
      description: t("landing.compliancePage.principles.accountability.description"),
    },
    {
      icon: CheckCircle2,
      title: t("landing.compliancePage.principles.continuous.title"),
      description: t("landing.compliancePage.principles.continuous.description"),
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-primary/5 via-background to-muted/20">
        <div className="max-w-4xl mx-auto text-center">
          <Award className="h-16 w-16 text-primary mx-auto mb-6" />
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            {t("landing.compliancePage.title")}
          </h1>
          <p className="text-xl text-muted-foreground mb-4">
            {t("landing.compliancePage.subtitle")}
          </p>
          <p className="text-sm text-muted-foreground">
            {t("landing.compliancePage.lastUpdated")}
          </p>
        </div>
      </section>

      {/* Certifications */}
      <section className="py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              {t("landing.compliancePage.certifications.title")}
            </h2>
            <p className="text-lg text-muted-foreground">
              {t("landing.compliancePage.certifications.subtitle")}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {certifications.map((cert, index) => {
              const Icon = cert.icon
              return (
                <div
                  key={index}
                  className="p-6 rounded-lg border border-border bg-card hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start gap-4">
                    <Icon className="h-8 w-8 text-primary flex-shrink-0 mt-1" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-xl font-semibold">{cert.title}</h3>
                        <span className="px-3 py-1 bg-green-500/10 text-green-600 dark:text-green-400 text-xs font-medium rounded-full">
                          {cert.status}
                        </span>
                      </div>
                      <p className="text-muted-foreground mb-3">{cert.description}</p>
                      <p className="text-sm text-muted-foreground">{cert.details}</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Compliance Principles */}
      <section className="py-12 px-4 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              {t("landing.compliancePage.principles.title")}
            </h2>
            <p className="text-lg text-muted-foreground">
              {t("landing.compliancePage.principles.subtitle")}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {principles.map((principle, index) => {
              const Icon = principle.icon
              return (
                <div
                  key={index}
                  className="p-6 rounded-lg border border-border bg-background"
                >
                  <Icon className="h-8 w-8 text-primary mb-4" />
                  <h3 className="text-lg font-semibold mb-2">{principle.title}</h3>
                  <p className="text-sm text-muted-foreground">{principle.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Data Processing */}
      <section className="py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              {t("landing.compliancePage.dataProcessing.title")}
            </h2>
            <p className="text-lg text-muted-foreground">
              {t("landing.compliancePage.dataProcessing.subtitle")}
            </p>
          </div>

          <div className="space-y-6">
            <div className="p-6 rounded-lg border border-border bg-card">
              <h3 className="font-semibold mb-2">
                {t("landing.compliancePage.dataProcessing.rights.title")}
              </h3>
              <p className="text-muted-foreground text-sm mb-4">
                {t("landing.compliancePage.dataProcessing.rights.description")}
              </p>
              <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground ml-4">
                <li>{t("landing.compliancePage.dataProcessing.rights.item1")}</li>
                <li>{t("landing.compliancePage.dataProcessing.rights.item2")}</li>
                <li>{t("landing.compliancePage.dataProcessing.rights.item3")}</li>
                <li>{t("landing.compliancePage.dataProcessing.rights.item4")}</li>
                <li>{t("landing.compliancePage.dataProcessing.rights.item5")}</li>
              </ul>
            </div>

            <div className="p-6 rounded-lg border border-border bg-card">
              <h3 className="font-semibold mb-2">
                {t("landing.compliancePage.dataProcessing.retention.title")}
              </h3>
              <p className="text-muted-foreground text-sm">
                {t("landing.compliancePage.dataProcessing.retention.description")}
              </p>
            </div>

            <div className="p-6 rounded-lg border border-border bg-card">
              <h3 className="font-semibold mb-2">
                {t("landing.compliancePage.dataProcessing.security.title")}
              </h3>
              <p className="text-muted-foreground text-sm">
                {t("landing.compliancePage.dataProcessing.security.description")}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Audit Reports */}
      <section className="py-12 px-4 bg-muted/30">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <FileCheck className="h-12 w-12 text-primary mx-auto mb-4" />
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              {t("landing.compliancePage.audits.title")}
            </h2>
            <p className="text-lg text-muted-foreground">
              {t("landing.compliancePage.audits.subtitle")}
            </p>
          </div>

          <div className="p-6 rounded-lg border border-border bg-background text-center">
            <p className="text-muted-foreground mb-4">
              {t("landing.compliancePage.audits.content")}
            </p>
            <Button asChild variant="outline">
              <Link href="/security">{t("landing.compliancePage.audits.learnMore")}</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 px-4 border-t">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-muted-foreground mb-6">
            {t("landing.compliancePage.cta.text")}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild variant="outline">
              <Link href="/security">{t("landing.compliancePage.cta.security")}</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/privacy">{t("landing.compliancePage.cta.privacy")}</Link>
            </Button>
            <Button asChild>
              <Link href="/register">{t("landing.compliancePage.cta.getStarted")}</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}

