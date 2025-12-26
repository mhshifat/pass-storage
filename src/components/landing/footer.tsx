"use client"

import Link from "next/link"
import { Logo } from "@/components/shared/logo"
import { Github, Twitter, Mail } from "lucide-react"
import { cn } from "@/lib/utils"

const footerLinks = {
  product: [
    { name: "Features", href: "#features", comingSoon: false },
    { name: "Security", href: "#security", comingSoon: false },
    { name: "Pricing", href: "#pricing", comingSoon: true },
    { name: "Changelog", href: "#changelog", comingSoon: true },
  ],
  company: [
    { name: "About", href: "#about", comingSoon: true },
    { name: "Blog", href: "#blog", comingSoon: true },
    { name: "Careers", href: "#careers", comingSoon: true },
    { name: "Contact", href: "#contact", comingSoon: true },
  ],
  legal: [
    { name: "Privacy", href: "/privacy", comingSoon: false },
    { name: "Terms", href: "#terms", comingSoon: true },
    { name: "Security", href: "#security", comingSoon: false },
    { name: "Compliance", href: "#compliance", comingSoon: true },
  ],
}

export function Footer() {
  return (
    <footer className="border-t bg-muted/30 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Logo className="h-8 w-8" />
              <span className="text-xl font-bold">PassBangla</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Enterprise password management with client-side encryption.
            </p>
            <div className="flex gap-4">
              <a
                href="#"
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="GitHub"
              >
                <Github className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Email"
              >
                <Mail className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h3 className="font-semibold mb-4">Product</h3>
            <ul className="space-y-2">
              {footerLinks.product.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className={cn(
                      "text-sm text-muted-foreground hover:text-foreground transition-colors",
                      link.comingSoon && "cursor-not-allowed opacity-60"
                    )}
                    onClick={(e) => link.comingSoon && e.preventDefault()}
                  >
                    {link.name}
                    {link.comingSoon && (
                      <span className="ml-1 text-xs">(Coming Soon)</span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="font-semibold mb-4">Company</h3>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className={cn(
                      "text-sm text-muted-foreground hover:text-foreground transition-colors",
                      link.comingSoon && "cursor-not-allowed opacity-60"
                    )}
                    onClick={(e) => link.comingSoon && e.preventDefault()}
                  >
                    {link.name}
                    {link.comingSoon && (
                      <span className="ml-1 text-xs">(Coming Soon)</span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h3 className="font-semibold mb-4">Legal</h3>
            <ul className="space-y-2">
              {footerLinks.legal.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className={cn(
                      "text-sm text-muted-foreground hover:text-foreground transition-colors",
                      link.comingSoon && "cursor-not-allowed opacity-60"
                    )}
                    onClick={(e) => link.comingSoon && e.preventDefault()}
                  >
                    {link.name}
                    {link.comingSoon && (
                      <span className="ml-1 text-xs">(Coming Soon)</span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} PassBangla. All rights reserved.
          </p>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Made with</span>
            <span className="text-red-500">♥</span>
            <span>for security-conscious teams</span>
          </div>
        </div>
      </div>
    </footer>
  )
}

