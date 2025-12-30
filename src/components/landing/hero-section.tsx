"use client"

import { useEffect, useRef } from "react"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import Link from "next/link"
import { ArrowRight, Shield, Lock, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Logo } from "@/components/shared/logo"
import { ThreeBackground } from "./three-background"

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger)
}

export function HeroSection() {
  const heroRef = useRef<HTMLDivElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const subtitleRef = useRef<HTMLParagraphElement>(null)
  const ctaRef = useRef<HTMLDivElement>(null)
  const logoRef = useRef<HTMLDivElement>(null)
  const particlesRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Logo animation
      gsap.from(logoRef.current, {
        scale: 0,
        rotation: -180,
        opacity: 0,
        duration: 1,
        ease: "back.out(1.7)",
      })

      // Title animation
      gsap.from(titleRef.current, {
        y: 50,
        opacity: 0,
        duration: 1,
        delay: 0.3,
        ease: "power3.out",
      })

      // Subtitle animation
      gsap.from(subtitleRef.current, {
        y: 30,
        opacity: 0,
        duration: 1,
        delay: 0.6,
        ease: "power3.out",
      })

      // CTA buttons animation
      if (ctaRef.current && typeof gsap !== "undefined") {
        const ctaButtons = Array.from(ctaRef.current.children) as HTMLElement[]
        if (ctaButtons.length > 0) {
          // Set initial hidden state only if GSAP is available
          gsap.set(ctaButtons, { opacity: 0, y: 30 })
          // Animate to visible
          gsap.to(ctaButtons, {
            y: 0,
            opacity: 1,
            duration: 0.8,
            delay: 0.9,
            stagger: 0.1,
            ease: "power3.out",
          })
          
          // Fallback: Ensure buttons are visible after animation should complete
          // This handles cases where animation might not complete properly
          setTimeout(() => {
            ctaButtons.forEach(btn => {
              const computedStyle = window.getComputedStyle(btn)
              if (computedStyle.opacity === "0" || parseFloat(computedStyle.opacity) < 0.1) {
                btn.style.opacity = "1"
                btn.style.transform = "translateY(0px)"
              }
            })
          }, 2000) // 0.9s delay + 0.8s duration + buffer
        }
      }

      // Floating particles
      if (particlesRef.current) {
        const particles = particlesRef.current.children
        gsap.to(particles, {
          y: (i) => (i % 2 === 0 ? -20 : 20),
          x: (i) => (i % 2 === 0 ? 10 : -10),
          rotation: (i) => (i % 2 === 0 ? 5 : -5),
          duration: 3 + Math.random() * 2,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
          stagger: 0.2,
        })
      }

      // Continuous logo pulse
      gsap.to(logoRef.current, {
        scale: 1.05,
        duration: 2,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      })
    }, heroRef)

    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={heroRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden px-4 py-20"
    >
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-linear-to-br from-blue-50/50 via-purple-50/30 to-pink-50/50 dark:from-background dark:via-background dark:to-muted/20" />
      
      {/* Three.js Background */}
      <ThreeBackground />
      
      {/* Animated grid pattern */}
      <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
            backgroundSize: "32px 32px",
          }}
        />
      </div>

      {/* Floating particles */}
      <div ref={particlesRef} className="absolute inset-0 pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 rounded-full bg-primary/20"
            style={{
              left: `${20 + i * 15}%`,
              top: `${30 + (i % 3) * 20}%`,
            }}
          />
        ))}
      </div>

      {/* Decorative orbs */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-blue-200/30 dark:bg-primary/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 animate-pulse" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-200/30 dark:bg-primary/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2 animate-pulse" style={{ animationDelay: "1s" }} />

      {/* Content */}
      <div className="relative z-10 max-w-6xl mx-auto text-center space-y-8">
        {/* Beta Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-sm font-medium text-primary mb-4">
          <Sparkles className="h-4 w-4" />
          <span>Now in Beta</span>
        </div>

        {/* Logo */}
        <div ref={logoRef} className="flex justify-center mb-6">
          <div className="relative">
            <Logo className="h-20 w-20 md:h-24 md:w-24" />
            <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl -z-10" />
          </div>
        </div>

        {/* Title */}
        <h1
          ref={titleRef}
          className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight"
        >
          <span className="bg-linear-to-r from-primary via-purple-600 to-pink-600 bg-clip-text text-transparent">
            Enterprise Password
          </span>
          <br />
          <span className="text-foreground">Management Made Simple</span>
        </h1>

        {/* Subtitle */}
        <p
          ref={subtitleRef}
          className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto"
        >
          Secure, encrypted password storage with client-side encryption. 
          Your passwords never leave your device unencrypted.
        </p>

        {/* Security badges */}
        <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-primary" />
            <span>AES-256 Encryption</span>
          </div>
          <div className="flex items-center gap-2">
            <Lock className="h-4 w-4 text-primary" />
            <span>Client-Side Encryption</span>
          </div>
        </div>

        {/* CTA Buttons */}
        <div ref={ctaRef} className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Button asChild size="lg" className="text-lg px-8">
            <Link href="/register">
              Get Started Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="text-lg px-8">
            <Link href="/login">
              Sign In
            </Link>
          </Button>
        </div>

        {/* Trust indicators */}
        <p className="text-sm text-muted-foreground pt-4">
          No credit card required • Free during beta • Enterprise-ready security
        </p>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-muted-foreground/30 rounded-full flex items-start justify-center p-2">
          <div className="w-1 h-3 bg-muted-foreground/30 rounded-full" />
        </div>
      </div>
    </section>
  )
}

