"use client"

import { useEffect, useRef } from "react"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import {
  Lock,
  Shield,
  Users,
  History,
  Search,
  FolderTree,
  Share2,
  RotateCcw,
  AlertTriangle,
  Key,
  FileText,
  Zap,
} from "lucide-react"
import { cn } from "@/lib/utils"

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger)
}

const features = [
  {
    icon: Lock,
    title: "Secure Storage",
    description: "AES-256-CBC encryption with client-side decryption. Your passwords never leave your device unencrypted.",
    color: "text-blue-600",
  },
  {
    icon: Shield,
    title: "Breach Detection",
    description: "Automatically monitor your passwords against known data breaches and get instant alerts.",
    color: "text-red-600",
  },
  {
    icon: Users,
    title: "Team Collaboration",
    description: "Share passwords securely with teams and manage access with role-based permissions.",
    color: "text-purple-600",
  },
  {
    icon: History,
    title: "Password History",
    description: "Track all password changes with full version history and one-click restore.",
    color: "text-green-600",
  },
  {
    icon: Search,
    title: "Advanced Search",
    description: "Find passwords instantly with powerful search, filters, tags, and folders.",
    color: "text-orange-600",
  },
  {
    icon: FolderTree,
    title: "Organize & Tag",
    description: "Organize passwords with folders, tags, and favorites for quick access.",
    color: "text-indigo-600",
  },
  {
    icon: Share2,
    title: "Secure Sharing",
    description: "Share passwords with team members or create temporary share links with expiration.",
    color: "text-pink-600",
  },
  {
    icon: RotateCcw,
    title: "Auto Rotation",
    description: "Set up automatic password rotation policies with scheduled reminders.",
    color: "text-cyan-600",
  },
  {
    icon: AlertTriangle,
    title: "Security Alerts",
    description: "Get notified about weak passwords, duplicates, and security risks.",
    color: "text-yellow-600",
  },
  {
    icon: Key,
    title: "TOTP/2FA",
    description: "Store and generate two-factor authentication codes for your accounts.",
    color: "text-teal-600",
  },
  {
    icon: FileText,
    title: "Password Templates",
    description: "Create reusable templates for common password types to speed up entry.",
    color: "text-amber-600",
  },
  {
    icon: Zap,
    title: "Fast & Reliable",
    description: "Lightning-fast performance with offline support and instant sync.",
    color: "text-violet-600",
  },
]

export function FeaturesSection() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const cardsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!sectionRef.current || !cardsRef.current) return

    const ctx = gsap.context(() => {
      const cards = Array.from(cardsRef.current!.children) as HTMLElement[]
      
      // Only animate if cards exist
      if (cards.length === 0) return

      // Set initial state - ensure cards are visible
      gsap.set(cards, { opacity: 1, y: 0, scale: 1 })

      // Animate cards on scroll with smooth reveal
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
            duration: 0.6,
            delay: index * 0.08,
            ease: "power2.out",
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "top 80%",
              toggleActions: "play none none none",
            },
          }
        )
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={sectionRef}
      id="features"
      className="py-24 px-4 bg-muted/30"
    >
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            Everything You Need to{" "}
            <span className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
              Manage Passwords
            </span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Powerful features designed for individuals and teams who take security seriously.
          </p>
        </div>

        {/* Features Grid */}
        <div
          ref={cardsRef}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <div
                key={index}
                className="feature-card group relative p-6 rounded-xl bg-card border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 opacity-100"
                style={{ opacity: 1 }}
              >
                {/* Icon */}
                <div className={cn("mb-4 p-3 rounded-lg bg-muted w-fit", feature.color)}>
                  <Icon className="h-6 w-6" />
                </div>

                {/* Content */}
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {feature.description}
                </p>

                {/* Hover effect */}
                <div className="absolute inset-0 rounded-xl bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10" />
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

