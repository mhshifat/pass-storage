import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Suspense } from "react";
import "./globals.css";
import { TRPCReactProvider } from "@/trpc/client";
import { Toaster } from "@/components/ui/sonner";
import { NavigationProgress } from "@/components/providers/navigation-progress";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { ThemeInitializer } from "@/components/providers/theme-initializer";
import { I18nProvider } from "@/components/providers/i18n-provider";
import { AccessibilityProvider } from "@/components/providers/accessibility-provider";
import { AccessibilityInitializer } from "@/components/providers/accessibility-initializer";
import { InstallPrompt } from "@/components/pwa/install-prompt";
import { ServiceWorkerRegistration } from "@/components/pwa/service-worker-registration";
import { OrganizationStructuredData, WebSiteStructuredData, SoftwareApplicationStructuredData } from "@/components/seo/structured-data";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://passbangla.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "PassBangla - Secure Password Manager",
    template: "%s | PassBangla",
  },
  description: "Enterprise password management solution with client-side encryption. Secure, fast, and beautifully designed password manager for teams and individuals.",
  keywords: [
    "password manager",
    "enterprise password management",
    "secure password storage",
    "client-side encryption",
    "zero-knowledge architecture",
    "team password sharing",
    "password security",
    "cybersecurity",
    "password vault",
    "secure credentials",
  ],
  authors: [{ name: "PassBangla Team" }],
  creator: "PassBangla",
  publisher: "PassBangla",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: "PassBangla",
    title: "PassBangla - Secure Password Manager",
    description: "Enterprise password management solution with client-side encryption. Secure, fast, and beautifully designed.",
    images: [
      {
        url: `${siteUrl}/opengraph-image`,
        width: 1200,
        height: 630,
        alt: "PassBangla - Secure Password Manager",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "PassBangla - Secure Password Manager",
    description: "Enterprise password management solution with client-side encryption.",
    images: [`${siteUrl}/opengraph-image`],
    creator: "@passbangla",
  },
  alternates: {
    canonical: siteUrl,
    languages: {
      "en-US": `${siteUrl}/en`,
      "bn-BD": `${siteUrl}/bn`,
    },
  },
  category: "Security",
  classification: "Password Management Software",
  manifest: "/manifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "PassBangla",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
    shortcut: "/icon-192.png",
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION,
    yandex: process.env.NEXT_PUBLIC_YANDEX_VERIFICATION,
    yahoo: process.env.NEXT_PUBLIC_YAHOO_VERIFICATION,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="msvalidate.01" content="6FDB602163A60B7F0ABA4A29B9153BC2" />
        <meta name="yandex-verification" content="f179c8429f117666" />
        <OrganizationStructuredData />
        <WebSiteStructuredData />
        <SoftwareApplicationStructuredData />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AccessibilityProvider>
          <I18nProvider>
            <TRPCReactProvider>
              <ThemeInitializer />
                <AccessibilityInitializer />
              <Suspense fallback={null}>
                <NavigationProgress showFullPageLoader={false} />
              </Suspense>
              {children}
            </TRPCReactProvider>
            <Toaster />
            <ServiceWorkerRegistration />
            <InstallPrompt />
          </I18nProvider>
          </AccessibilityProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
