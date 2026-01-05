import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { getServerLanguage, getBlogTranslations } from "@/lib/i18n-server"
import { BlogPostClient } from "@/components/blogs/blog-post-client"

const BLOG_SLUGS = [
  "core-features",
  "advanced-search",
  "security",
  "team-management",
  "complete-overview",
]

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const language = await getServerLanguage()
  const translations = await getBlogTranslations(language)
  
  const postMap: Record<string, { title: string; description: string }> = {
    "core-features": {
      title: translations.posts.coreFeatures.title,
      description: translations.posts.coreFeatures.description,
    },
    "advanced-search": {
      title: translations.posts.advancedSearch.title,
      description: translations.posts.advancedSearch.description,
    },
    "security": {
      title: translations.posts.security.title,
      description: translations.posts.security.description,
    },
    "team-management": {
      title: translations.posts.teamManagement.title,
      description: translations.posts.teamManagement.description,
    },
    "complete-overview": {
      title: translations.posts.completeOverview.title,
      description: translations.posts.completeOverview.description,
    },
  }

  const post = postMap[slug]
  if (!post) {
    return {
      title: "Blog Post Not Found - PassBangla",
    }
  }

  return {
    title: `${post.title} - PassBangla Blogs`,
    description: post.description,
  }
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  
  if (!BLOG_SLUGS.includes(slug)) {
    notFound()
  }

  const language = await getServerLanguage()
  const translations = await getBlogTranslations(language)

  return <BlogPostClient slug={slug} translations={translations} language={language} />
}

