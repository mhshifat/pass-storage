"use client"

import { BookOpen, Lock, Users, Shield, Search, Download } from "lucide-react"
import { useTranslation } from "@/hooks/use-translation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import Image from "next/image"

export function UserGuideContent() {
  const { t } = useTranslation()

  const guides = [
    {
      id: "getting-started",
      icon: BookOpen,
      title: t("landing.guide.gettingStarted.title"),
      description: t("landing.guide.gettingStarted.description"),
      steps: [
        {
          step: 1,
          title: t("landing.guide.gettingStarted.step1.title"),
          description: t("landing.guide.gettingStarted.step1.description"),
          image: "/guide/getting-started-1.png",
        },
        {
          step: 2,
          title: t("landing.guide.gettingStarted.step2.title"),
          description: t("landing.guide.gettingStarted.step2.description"),
          image: "/guide/getting-started-2.png",
        },
        {
          step: 3,
          title: t("landing.guide.gettingStarted.step3.title"),
          description: t("landing.guide.gettingStarted.step3.description"),
          image: "/guide/getting-started-3.png",
        },
      ],
    },
    {
      id: "passwords",
      icon: Lock,
      title: t("landing.guide.passwords.title"),
      description: t("landing.guide.passwords.description"),
      steps: [
        {
          step: 1,
          title: t("landing.guide.passwords.step1.title"),
          description: t("landing.guide.passwords.step1.description"),
          image: "/guide/passwords-1.png",
        },
        {
          step: 2,
          title: t("landing.guide.passwords.step2.title"),
          description: t("landing.guide.passwords.step2.description"),
          image: "/guide/passwords-2.png",
        },
        {
          step: 3,
          title: t("landing.guide.passwords.step3.title"),
          description: t("landing.guide.passwords.step3.description"),
          image: "/guide/passwords-3.png",
        },
        {
          step: 4,
          title: t("landing.guide.passwords.step4.title"),
          description: t("landing.guide.passwords.step4.description"),
          image: "/guide/passwords-4.png",
        },
      ],
    },
    {
      id: "teams",
      icon: Users,
      title: t("landing.guide.teams.title"),
      description: t("landing.guide.teams.description"),
      steps: [
        {
          step: 1,
          title: t("landing.guide.teams.step1.title"),
          description: t("landing.guide.teams.step1.description"),
          image: "/guide/teams-1.png",
        },
        {
          step: 2,
          title: t("landing.guide.teams.step2.title"),
          description: t("landing.guide.teams.step2.description"),
          image: "/guide/teams-2.png",
        },
        {
          step: 3,
          title: t("landing.guide.teams.step3.title"),
          description: t("landing.guide.teams.step3.description"),
          image: "/guide/teams-3.png",
        },
      ],
    },
    {
      id: "security",
      icon: Shield,
      title: t("landing.guide.security.title"),
      description: t("landing.guide.security.description"),
      steps: [
        {
          step: 1,
          title: t("landing.guide.security.step1.title"),
          description: t("landing.guide.security.step1.description"),
          image: "/guide/security-1.png",
        },
        {
          step: 2,
          title: t("landing.guide.security.step2.title"),
          description: t("landing.guide.security.step2.description"),
          image: "/guide/security-2.png",
        },
        {
          step: 3,
          title: t("landing.guide.security.step3.title"),
          description: t("landing.guide.security.step3.description"),
          image: "/guide/security-3.png",
        },
      ],
    },
    {
      id: "search",
      icon: Search,
      title: t("landing.guide.search.title"),
      description: t("landing.guide.search.description"),
      steps: [
        {
          step: 1,
          title: t("landing.guide.search.step1.title"),
          description: t("landing.guide.search.step1.description"),
          image: "/guide/search-1.png",
        },
        {
          step: 2,
          title: t("landing.guide.search.step2.title"),
          description: t("landing.guide.search.step2.description"),
          image: "/guide/search-2.png",
        },
      ],
    },
    {
      id: "import-export",
      icon: Download,
      title: t("landing.guide.importExport.title"),
      description: t("landing.guide.importExport.description"),
      steps: [
        {
          step: 1,
          title: t("landing.guide.importExport.step1.title"),
          description: t("landing.guide.importExport.step1.description"),
          image: "/guide/import-1.png",
        },
        {
          step: 2,
          title: t("landing.guide.importExport.step2.title"),
          description: t("landing.guide.importExport.step2.description"),
          image: "/guide/export-1.png",
        },
      ],
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="py-20 px-4 bg-linear-to-br from-primary/5 via-background to-muted/20">
        <div className="max-w-4xl mx-auto text-center">
          <BookOpen className="h-16 w-16 text-primary mx-auto mb-6" />
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            {t("landing.guide.title")}
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            {t("landing.guide.subtitle")}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg">
              <Link href="/register">{t("landing.guide.cta.getStarted")}</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/security">{t("landing.guide.cta.learnSecurity")}</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Quick Navigation */}
      <section className="py-8 px-4 border-b bg-muted/30 sticky top-0 z-10 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-wrap gap-2 justify-center">
            {guides.map((guide) => {
              const Icon = guide.icon
              return (
                <a
                  key={guide.id}
                  href={`#${guide.id}`}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-background border border-border hover:bg-accent transition-colors text-sm"
                >
                  <Icon className="h-4 w-4" />
                  <span>{guide.title}</span>
                </a>
              )
            })}
          </div>
        </div>
      </section>

      {/* Guides */}
      <section className="py-12 px-4">
        <div className="max-w-5xl mx-auto space-y-24">
          {guides.map((guide) => {
            const Icon = guide.icon
            return (
              <div key={guide.id} id={guide.id} className="scroll-mt-24">
                <div className="flex items-start gap-4 mb-8">
                  <div className="p-3 rounded-lg bg-primary/10">
                    <Icon className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold mb-2">{guide.title}</h2>
                    <p className="text-muted-foreground text-lg">{guide.description}</p>
                  </div>
                </div>

                <div className="space-y-12">
                  {guide.steps.map((step) => (
                    <div key={step.step} className="space-y-4">
                      <div className="flex items-start gap-4">
                        <div className="shrink-0 w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg">
                          {step.step}
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                          <p className="text-muted-foreground leading-relaxed">{step.description}</p>
                        </div>
                      </div>
                      
                      {/* Screenshot */}
                      <div className="ml-14 rounded-lg border border-border overflow-hidden shadow-lg bg-card">
                        <div className="relative w-full aspect-video bg-muted">
                          <Image
                            src={step.image}
                            alt={step.title}
                            fill
                            className="object-contain"
                            unoptimized
                            onError={() => {
                              // Fallback handled by CSS overlay
                            }}
                          />
                          {/* Fallback placeholder - shown if image fails to load */}
                          <div className="absolute inset-0 flex items-center justify-center text-muted-foreground bg-muted/50 opacity-0 hover:opacity-100 transition-opacity">
                            <div className="text-center">
                              <svg className="h-12 w-12 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                              <p className="text-sm">Screenshot will appear here</p>
                              <p className="text-xs mt-1 opacity-75">{step.image}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* Additional Resources */}
      <section className="py-12 px-4 bg-muted/30 border-t">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-4">{t("landing.guide.resources.title")}</h2>
          <p className="text-muted-foreground mb-6">{t("landing.guide.resources.description")}</p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Button asChild variant="outline">
              <Link href="/security">{t("landing.guide.resources.security")}</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/privacy">{t("landing.guide.resources.privacy")}</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/terms">{t("landing.guide.resources.terms")}</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/compliance">{t("landing.guide.resources.compliance")}</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}

