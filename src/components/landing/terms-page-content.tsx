"use client"

import { FileText, Shield, AlertCircle, Users, Lock } from "lucide-react"
import { useTranslation } from "@/hooks/use-translation"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export function TermsPageContent() {
  const { t } = useTranslation()

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-primary/5 via-background to-muted/20">
        <div className="max-w-4xl mx-auto text-center">
          <FileText className="h-16 w-16 text-primary mx-auto mb-6" />
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            {t("landing.termsPage.title")}
          </h1>
          <p className="text-xl text-muted-foreground mb-4">
            {t("landing.termsPage.subtitle")}
          </p>
          <p className="text-sm text-muted-foreground">
            {t("landing.termsPage.lastUpdated")}
          </p>
        </div>
      </section>

      {/* Terms Content */}
      <section className="py-12 px-4">
        <div className="max-w-4xl mx-auto prose prose-slate dark:prose-invert max-w-none">
          {/* Acceptance */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Shield className="h-6 w-6 text-primary" />
              {t("landing.termsPage.acceptance.title")}
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              {t("landing.termsPage.acceptance.content")}
            </p>
          </div>

          {/* Service Description */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Lock className="h-6 w-6 text-primary" />
              {t("landing.termsPage.service.title")}
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              {t("landing.termsPage.service.content")}
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
              <li>{t("landing.termsPage.service.feature1")}</li>
              <li>{t("landing.termsPage.service.feature2")}</li>
              <li>{t("landing.termsPage.service.feature3")}</li>
              <li>{t("landing.termsPage.service.feature4")}</li>
            </ul>
          </div>

          {/* User Responsibilities */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Users className="h-6 w-6 text-primary" />
              {t("landing.termsPage.responsibilities.title")}
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              {t("landing.termsPage.responsibilities.content")}
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
              <li>{t("landing.termsPage.responsibilities.item1")}</li>
              <li>{t("landing.termsPage.responsibilities.item2")}</li>
              <li>{t("landing.termsPage.responsibilities.item3")}</li>
              <li>{t("landing.termsPage.responsibilities.item4")}</li>
              <li>{t("landing.termsPage.responsibilities.item5")}</li>
            </ul>
          </div>

          {/* Prohibited Uses */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <AlertCircle className="h-6 w-6 text-primary" />
              {t("landing.termsPage.prohibited.title")}
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              {t("landing.termsPage.prohibited.content")}
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
              <li>{t("landing.termsPage.prohibited.item1")}</li>
              <li>{t("landing.termsPage.prohibited.item2")}</li>
              <li>{t("landing.termsPage.prohibited.item3")}</li>
              <li>{t("landing.termsPage.prohibited.item4")}</li>
              <li>{t("landing.termsPage.prohibited.item5")}</li>
            </ul>
          </div>

          {/* Intellectual Property */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-4">
              {t("landing.termsPage.intellectualProperty.title")}
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              {t("landing.termsPage.intellectualProperty.content")}
            </p>
          </div>

          {/* Limitation of Liability */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-4">
              {t("landing.termsPage.liability.title")}
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              {t("landing.termsPage.liability.content")}
            </p>
          </div>

          {/* Termination */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-4">
              {t("landing.termsPage.termination.title")}
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              {t("landing.termsPage.termination.content")}
            </p>
          </div>

          {/* Changes to Terms */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-4">
              {t("landing.termsPage.changes.title")}
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              {t("landing.termsPage.changes.content")}
            </p>
          </div>

          {/* Contact */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-4">
              {t("landing.termsPage.contact.title")}
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              {t("landing.termsPage.contact.content")}
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 px-4 bg-muted/30 border-t">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-muted-foreground mb-6">
            {t("landing.termsPage.cta.text")}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild variant="outline">
              <Link href="/privacy">{t("landing.termsPage.cta.privacyPolicy")}</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/security">{t("landing.termsPage.cta.security")}</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/register">{t("landing.termsPage.cta.getStarted")}</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}

