import type { Metadata } from "next"
import Link from "next/link"
import { Calendar, Clock, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getServerLanguage, getBlogTranslations } from "@/lib/i18n-server"
import { BlogListingClient } from "@/components/blogs/blog-listing-client"

export const metadata: Metadata = {
  title: "Blogs - PassBangla",
  description: "Learn about password management, security best practices, and PassBangla features.",
}

export default async function BlogsPage() {
  const language = await getServerLanguage()
  const translations = await getBlogTranslations(language)

  const blogPosts = [
    {
      slug: "core-features",
      title: translations.posts.coreFeatures.title,
      description: translations.posts.coreFeatures.description,
      date: "2024-01-15",
      readTime: "5 min",
      category: translations.categories.features,
    },
    {
      slug: "advanced-search",
      title: translations.posts.advancedSearch.title,
      description: translations.posts.advancedSearch.description,
      date: "2024-01-20",
      readTime: "6 min",
      category: translations.categories.features,
    },
    {
      slug: "security",
      title: translations.posts.security.title,
      description: translations.posts.security.description,
      date: "2024-01-25",
      readTime: "7 min",
      category: translations.categories.security,
    },
    {
      slug: "team-management",
      title: translations.posts.teamManagement.title,
      description: translations.posts.teamManagement.description,
      date: "2024-02-01",
      readTime: "6 min",
      category: translations.categories.collaboration,
    },
    {
      slug: "complete-overview",
      title: translations.posts.completeOverview.title,
      description: translations.posts.completeOverview.description,
      date: "2024-02-05",
      readTime: "10 min",
      category: translations.categories.overview,
    },
  ]

  return <BlogListingClient posts={blogPosts} translations={translations} />
}

