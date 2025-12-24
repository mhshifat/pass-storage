"use client"

import { HeroSection } from "./hero-section"
import { FeaturesSection } from "./features-section"
import { SecuritySection } from "./security-section"
import { PWASection } from "./pwa-section"
import { AppPreviewSection } from "./app-preview-section"
import { CTASection } from "./cta-section"
import { Footer } from "./footer"

export function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <HeroSection />
      <AppPreviewSection />
      <FeaturesSection />
      <SecuritySection />
      <PWASection />
      <CTASection />
      <Footer />
    </div>
  )
}

