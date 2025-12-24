# SEO Implementation Guide

This document outlines the complete SEO setup for PassStorage.

## ✅ Implemented Features

### 1. Meta Tags
- ✅ Title tags with template support
- ✅ Meta descriptions
- ✅ Keywords
- ✅ Author, creator, publisher
- ✅ Robots directives
- ✅ Canonical URLs
- ✅ Language alternates

### 2. Open Graph (OG) Images
- ✅ Dynamic OG image generation (`src/app/opengraph-image.tsx`)
- ✅ Automatically served at `/opengraph-image` or `/opengraph-image.png`
- ✅ 1200x630px optimized for social sharing
- ✅ Includes logo, title, and key messaging

### 3. Social Media Tags
- ✅ Open Graph tags (Facebook, LinkedIn, etc.)
- ✅ Twitter Card tags
- ✅ Proper image dimensions and alt text

### 4. Structured Data (JSON-LD)
- ✅ Organization schema
- ✅ WebSite schema with search action
- ✅ SoftwareApplication schema

### 5. Technical SEO
- ✅ Sitemap (`/sitemap.xml`)
- ✅ Robots.txt (`/robots.txt`)
- ✅ Mobile-friendly (PWA)
- ✅ Fast loading (optimized assets)

## 🖼️ OG Image

The OG image is automatically generated using Next.js ImageResponse. It includes:
- PassStorage logo
- Main title: "PassStorage"
- Subtitle: "Secure Password Manager for Teams"
- Description: "Enterprise password management with client-side encryption"
- Security badge: "Zero-Knowledge Architecture • SOC 2 Compliant"

The image is served at:
- `https://yourdomain.com/opengraph-image.png`
- Automatically used in Open Graph and Twitter Card tags

## 🔍 Google Verification

To get your Google verification code:

1. **Go to Google Search Console**: https://search.google.com/search-console
2. **Add your property** (your website URL)
3. **Choose "HTML tag" verification method**
4. **Copy the verification code** from the meta tag
5. **Add to `.env.local`**:
   ```env
   NEXT_PUBLIC_GOOGLE_VERIFICATION=your-code-here
   ```
6. **Verify in Google Search Console**

See `docs/GOOGLE_VERIFICATION.md` for detailed instructions.

## 📝 Environment Variables

Create a `.env.local` file with:

```env
# Site URL
NEXT_PUBLIC_SITE_URL=https://passstorage.com

# Search Engine Verification
NEXT_PUBLIC_GOOGLE_VERIFICATION=your-google-verification-code
NEXT_PUBLIC_YANDEX_VERIFICATION=your-yandex-verification-code
NEXT_PUBLIC_YAHOO_VERIFICATION=your-yahoo-verification-code
```

## 🚀 Testing SEO

### Test OG Image
```bash
# View OG image
curl https://yourdomain.com/opengraph-image.png

# Or visit in browser
https://yourdomain.com/opengraph-image.png
```

### Test Meta Tags
Use these tools:
- [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/)
- [Twitter Card Validator](https://cards-dev.twitter.com/validator)
- [LinkedIn Post Inspector](https://www.linkedin.com/post-inspector/)
- [Google Rich Results Test](https://search.google.com/test/rich-results)

### Test Structured Data
- [Google Rich Results Test](https://search.google.com/test/rich-results)
- [Schema.org Validator](https://validator.schema.org/)

### Test Sitemap
- Visit: `https://yourdomain.com/sitemap.xml`
- Submit to Google Search Console

### Test Robots.txt
- Visit: `https://yourdomain.com/robots.txt`

## 📊 SEO Checklist

- [x] Meta title and description
- [x] Open Graph tags
- [x] Twitter Card tags
- [x] OG image
- [x] Structured data (JSON-LD)
- [x] Sitemap
- [x] Robots.txt
- [x] Canonical URLs
- [x] Language alternates
- [x] Mobile-friendly
- [ ] Google verification (add code)
- [ ] Submit sitemap to Google
- [ ] Add alt text to all images
- [ ] Create page-specific metadata for all pages
- [ ] Add social media links to structured data

## 🎯 Next Steps

1. **Add Google Verification Code**
   - Follow `docs/GOOGLE_VERIFICATION.md`
   - Add code to `.env.local`

2. **Submit Sitemap**
   - Go to Google Search Console
   - Submit `sitemap.xml`

3. **Add Alt Text**
   - Review all images
   - Add descriptive alt attributes

4. **Page-Specific Metadata**
   - Add metadata to `/pricing`, `/features`, `/about`, etc.
   - Use the template: `%s | PassStorage`

5. **Social Media Links**
   - Update `OrganizationStructuredData` with actual social URLs
   - Add Twitter, GitHub, LinkedIn, etc.

6. **Monitor Performance**
   - Set up Google Analytics
   - Monitor Search Console regularly
   - Track Core Web Vitals

## 📚 Resources

- [Next.js Metadata Documentation](https://nextjs.org/docs/app/api-reference/functions/generate-metadata)
- [Google Search Central](https://developers.google.com/search)
- [Open Graph Protocol](https://ogp.me/)
- [Schema.org](https://schema.org/)
- [Twitter Cards](https://developer.twitter.com/en/docs/twitter-for-websites/cards/overview/abouts-cards)

