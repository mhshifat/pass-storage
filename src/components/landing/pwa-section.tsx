"use client"

import { useEffect, useRef, useState } from "react"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import Link from "next/link"
import { Smartphone, Chrome, Globe, ArrowRight, Check, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger)
}

const platforms = [
  {
    icon: Smartphone,
    title: "Mobile PWA",
    description: "Install on iOS and Android. Works offline with full encryption support.",
    features: ["Offline Access", "Home Screen Install", "Push Notifications", "Native Feel"],
    cta: "Install PWA",
    color: "from-blue-500 to-cyan-500",
    available: true,
  },
  {
    icon: Chrome,
    title: "Browser Extension",
    description: "Auto-fill passwords seamlessly across Chrome and Firefox. Available now!",
    features: ["Auto-Fill", "Quick Access", "Secure Sync", "Chrome & Firefox"],
    cta: "Get Extension",
    color: "from-purple-500 to-pink-500",
    available: true,
    links: {
      chrome: "#chrome-extension", // Update with actual Chrome Web Store link
      firefox: "https://addons.mozilla.org/en-US/firefox/addon/pass-bangla", // Update with actual Firefox Add-ons link
    },
  },
  {
    icon: Globe,
    title: "Web App",
    description: "Access from any device with a modern, responsive web interface.",
    features: ["Any Device", "Real-Time Sync", "Team Collaboration", "Secure Cloud"],
    cta: "Try Web App",
    color: "from-green-500 to-emerald-500",
    available: true,
  },
]

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>
}

export function PWASection() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const cardsRef = useRef<HTMLDivElement>(null)
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isInstalled, setIsInstalled] = useState(() => {
    if (typeof window === "undefined") return false
    return window.matchMedia("(display-mode: standalone)").matches
  })

  // Handle PWA install prompt
  useEffect(() => {
    if (typeof window === "undefined") return
    if (isInstalled) return

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
    
    window.addEventListener("appinstalled", () => {
      setIsInstalled(true)
      setDeferredPrompt(null)
    })

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
    }
  }, [isInstalled])

  const handleInstallClick = async (e: React.MouseEvent) => {
    e.preventDefault()
    
    if (isInstalled) {
      return
    }

    // Check if iOS
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as Window & { MSStream?: unknown }).MSStream
    if (isIOS) {
      // For iOS, show instructions or let the browser handle it
      // The InstallPrompt component will handle iOS instructions
      // For now, just prevent default navigation
      return
    }

    if (deferredPrompt) {
      try {
        deferredPrompt.prompt()
        const { outcome } = await deferredPrompt.userChoice
        if (outcome === "accepted") {
          setDeferredPrompt(null)
        }
      } catch (error) {
        console.error("Error showing install prompt:", error)
      }
    } else {
      // If no prompt is available, guide user to manual installation
      // On desktop Chrome, they can use the install icon in the address bar
      // or go to Chrome menu > Install PassBangla
      if (typeof window !== "undefined" && "serviceWorker" in navigator) {
        // Check if Chrome
        const isChrome = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor)
        if (isChrome) {
          toast.info(
            "Look for the install icon in your browser's address bar, or go to Chrome menu (⋮) > Install PassBangla",
            { duration: 5000 }
          )
        } else {
          toast.info(
            "Install option should appear in your browser's address bar if this app is installable",
            { duration: 5000 }
          )
        }
      }
    }
  }

  useEffect(() => {
    if (!sectionRef.current || !cardsRef.current) return

    const ctx = gsap.context(() => {
      // Animate cards
      const cards = Array.from(cardsRef.current!.children) as HTMLElement[]
      
      if (cards.length === 0) return

      // Set initial state - ensure cards are visible
      gsap.set(cards, { opacity: 1, y: 0, scale: 1 })

      // Animate cards on scroll
      cards.forEach((card, index) => {
        gsap.fromTo(
          card,
          {
            y: 60,
            opacity: 0,
            scale: 0.9,
          },
          {
            y: 0,
            opacity: 1,
            scale: 1,
            duration: 0.7,
            delay: index * 0.12,
            ease: "power2.out",
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "top 80%",
              toggleActions: "play none none none",
            },
          }
        )
      })

      // Continuous float animation - start after initial animation
      cards.forEach((card, index) => {
        gsap.to(card, {
          y: (index % 2 === 0 ? -8 : 8),
          duration: 3 + Math.random() * 2,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
          delay: cards.length * 0.12 + index * 0.3,
        })
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={sectionRef}
      id="platforms"
      className="py-24 px-4 bg-muted/30 relative overflow-hidden"
    >
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-50/50 via-blue-50/30 to-pink-50/50 dark:from-background dark:via-background dark:to-muted/10" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            Access Your Passwords{" "}
            <span className="bg-gradient-to-r from-primary via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Anywhere
            </span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Available on all your devices. Install as a mobile app or use our browser extension 
            for seamless password management.
          </p>
        </div>

        {/* Platform Cards */}
        <div
          ref={cardsRef}
          className="grid md:grid-cols-3 gap-8"
        >
          {platforms.map((platform, index) => {
            const Icon = platform.icon
            return (
              <div
                key={index}
                className={cn(
                  "group relative p-8 rounded-2xl border-2 transition-all duration-300 hover:shadow-2xl opacity-100",
                  index === 2 
                    ? "bg-card border-primary/30 hover:border-primary/60 shadow-lg" 
                    : "bg-card border-border hover:border-primary/50"
                )}
                style={{ opacity: 1 }}
              >
                {/* Gradient background on hover - stronger for web app */}
                <div className={cn(
                  "absolute inset-0 rounded-2xl bg-gradient-to-br transition-opacity duration-300 -z-10",
                  index === 2
                    ? `bg-gradient-to-br ${platform.color} opacity-10 group-hover:opacity-15`
                    : `bg-gradient-to-br ${platform.color} opacity-0 group-hover:opacity-5`
                )} />

                {/* Icon */}
                <div className={cn(
                  "mb-6 p-4 rounded-xl bg-gradient-to-br w-fit text-white",
                  index === 2 
                    ? `${platform.color} shadow-lg scale-110` 
                    : `${platform.color}`
                )}>
                  <Icon className="h-8 w-8" />
                </div>

                {/* Content */}
                <div className="flex items-center gap-2 mb-2">
                  <h3 className={cn(
                    "text-2xl font-bold",
                    index === 2 && "text-foreground"
                  )}>{platform.title}</h3>
                  {index === 1 && (
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-primary/10 text-primary border border-primary/20">
                      Available
                    </span>
                  )}
                  {index === 2 && (
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20">
                      Primary
                    </span>
                  )}
                </div>
                <p className={cn(
                  "mb-6",
                  index === 2 ? "text-foreground/80" : "text-muted-foreground"
                )}>
                  {platform.description}
                </p>

                {/* Features */}
                <ul className="space-y-3 mb-6">
                  {platform.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-primary shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                {index === 1 && platform.links ? (
                  // Browser Extension - Show both Chrome and Firefox links
                  <div className="space-y-2">
                    <Button
                      asChild
                      className="w-full group/btn"
                      variant="default"
                    >
                      <a href={platform.links.chrome} target="_blank" rel="noopener noreferrer">
                        <Chrome className="mr-2 h-4 w-4" />
                        Get for Chrome
                        <ExternalLink className="ml-2 h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                      </a>
                    </Button>
                    <Button
                      asChild
                      className="w-full group/btn"
                      variant="outline"
                    >
                      <a href={platform.links.firefox} target="_blank" rel="noopener noreferrer">
                        Get for Firefox
                        <ExternalLink className="ml-2 h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                      </a>
                    </Button>
                  </div>
                ) : index === 0 ? (
                  // PWA Install Button
                  <Button
                    onClick={handleInstallClick}
                    disabled={isInstalled}
                    className="w-full group/btn"
                    variant="default"
                  >
                    {isInstalled ? "Installed" : platform.cta}
                    <ArrowRight className="ml-2 h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                  </Button>
                ) : (
                  <Button
                    asChild
                    className="w-full group/btn"
                    variant={index === 2 ? "default" : "outline"}
                  >
                    <Link href="/register">
                      {platform.cta}
                      <ArrowRight className="ml-2 h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                    </Link>
                  </Button>
                )}
              </div>
            )
          })}
        </div>

        {/* Available Badge */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-sm text-primary">
            <Check className="h-4 w-4" />
            <span>Browser Extensions available for Chrome and Firefox</span>
          </div>
        </div>
      </div>
    </section>
  )
}

