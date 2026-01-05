"use client"

import Link from "next/link"
import { Calendar, Clock, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface BlogPost {
  slug: string
  title: string
  description: string
  date: string
  readTime: string
  category: string
}

interface BlogListingClientProps {
  posts: BlogPost[]
  translations: {
    title: string
    subtitle: string
    readMore: string
    readTime: string
    publishedOn: string
    categories: {
      features: string
      security: string
      collaboration: string
      overview: string
    }
  }
}

export function BlogListingClient({ posts, translations }: BlogListingClientProps) {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="py-20 px-4 bg-linear-to-br from-primary/5 via-background to-muted/20">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">{translations.title}</h1>
          <p className="text-xl text-muted-foreground mb-8">{translations.subtitle}</p>
        </div>
      </section>

      {/* Blog Posts */}
      <section className="py-12 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <Card key={post.slug} className="flex flex-col hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="secondary">{post.category}</Badge>
                  </div>
                  <CardTitle className="text-xl mb-2">{post.title}</CardTitle>
                  <CardDescription className="line-clamp-3">{post.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col justify-between">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>{new Date(post.date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>{post.readTime}</span>
                    </div>
                  </div>
                  <Button asChild variant="outline" className="w-full">
                    <Link href={`/blogs/${post.slug}`}>
                      {translations.readMore}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
