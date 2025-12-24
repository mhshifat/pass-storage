import { LandingPage } from "@/components/landing/landing-page"
import type { Metadata } from "next"

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://passstorage.com"

export const metadata: Metadata = {
  title: "PassStorage - Secure Password Manager for Teams",
  description: "Enterprise password management solution with client-side encryption. Secure, fast, and beautifully designed. Zero-knowledge architecture ensures your passwords are encrypted before they reach our servers.",
  keywords: [
    "password manager",
    "enterprise password management",
    "secure password storage",
    "client-side encryption",
    "zero-knowledge architecture",
    "team password sharing",
    "password security",
    "cybersecurity",
  ],
  openGraph: {
    title: "PassStorage - Secure Password Manager for Teams",
    description: "Enterprise password management solution with client-side encryption. Secure, fast, and beautifully designed.",
    url: siteUrl,
    siteName: "PassStorage",
    images: [
      {
        url: `${siteUrl}/opengraph-image`,
        width: 1200,
        height: 630,
        alt: "PassStorage - Secure Password Manager",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "PassStorage - Secure Password Manager for Teams",
    description: "Enterprise password management solution with client-side encryption.",
    images: [`${siteUrl}/opengraph-image`],
  },
  alternates: {
    canonical: siteUrl,
  },
}

export default function Home() {
  return <LandingPage />
}
