import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { TRPCReactProvider } from "@/trpc/client";
import { Toaster } from "@/components/ui/sonner";
import { NavigationProgress } from "@/components/providers/navigation-progress";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { ThemeInitializer } from "@/components/providers/theme-initializer";
import { I18nProvider } from "@/components/providers/i18n-provider";
import { AccessibilityProvider } from "@/components/providers/accessibility-provider";
import { AccessibilityInitializer } from "@/components/providers/accessibility-initializer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PassStorage - Secure Password Manager",
  description: "Enterprise password management solution",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
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
              <NavigationProgress showFullPageLoader={false} />
              {children}
            </TRPCReactProvider>
            <Toaster />
          </I18nProvider>
          </AccessibilityProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
