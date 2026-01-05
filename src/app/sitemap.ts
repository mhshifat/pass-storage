import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  // IMPORTANT: This must match your Google Search Console property URL exactly
  // If your property is https://passbangla.com, set NEXT_PUBLIC_SITE_URL=https://passbangla.com
  // If your property is https://passstorage.com, set NEXT_PUBLIC_SITE_URL=https://passstorage.com
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://passbangla.com'

  // Validate that baseUrl is a valid URL
  if (!baseUrl.startsWith('http://') && !baseUrl.startsWith('https://')) {
    throw new Error('NEXT_PUBLIC_SITE_URL must start with http:// or https://')
  }

  const routes = [
    '',
    '/register',
    '/login',
    '/features',
    '/security',
    '/pricing',
    '/privacy',
  ]

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === '' ? 'daily' : 'weekly',
    priority: route === '' ? 1 : 0.8,
  }))
}

