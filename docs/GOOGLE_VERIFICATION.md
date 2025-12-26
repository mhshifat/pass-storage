# Google Search Console Verification Guide

This guide will help you verify your website with Google Search Console to get your verification code.

## Step 1: Access Google Search Console

1. Go to [Google Search Console](https://search.google.com/search-console)
2. Sign in with your Google account
3. Click "Add Property" or use the property dropdown

## Step 2: Add Your Property

1. Choose "URL prefix" as the property type
2. Enter your website URL (e.g., `https://passbangla.com`)
3. Click "Continue"

## Step 3: Verify Ownership

Google offers several verification methods. Choose one:

### Method 1: HTML Tag (Recommended for Next.js)

1. Select "HTML tag" as the verification method
2. You'll see a meta tag like:
   ```html
   <meta name="google-site-verification" content="YOUR_VERIFICATION_CODE" />
   ```
3. Copy the `content` value (the verification code)
4. Add it to your `.env.local` file:
   ```env
   NEXT_PUBLIC_GOOGLE_VERIFICATION=YOUR_VERIFICATION_CODE
   ```
5. The code is already integrated in `src/app/layout.tsx` - it will automatically add the meta tag
6. Click "Verify" in Google Search Console

### Method 2: HTML File Upload

1. Download the HTML verification file from Google
2. Place it in your `public/` directory
3. Deploy your site
4. Click "Verify" in Google Search Console

### Method 3: DNS Record

1. Select "DNS record" as the verification method
2. Add the TXT record to your domain's DNS settings
3. Wait for DNS propagation (can take up to 48 hours)
4. Click "Verify" in Google Search Console

## Step 4: Verify and Access

Once verified, you'll have access to:
- Search performance data
- Index coverage reports
- URL inspection tool
- Sitemap submission
- Core Web Vitals data

## Step 5: Submit Your Sitemap

After verification:

1. Go to "Sitemaps" in the left sidebar
2. Enter `sitemap.xml` in the "Add a new sitemap" field
3. Click "Submit"
4. Google will automatically crawl your sitemap

## Additional Verification Services

### Yandex Webmaster

1. Go to [Yandex Webmaster](https://webmaster.yandex.com/)
2. Add your site
3. Choose "HTML meta tag" verification
4. Copy the verification code
5. Add to `.env.local`:
   ```env
   NEXT_PUBLIC_YANDEX_VERIFICATION=YOUR_YANDEX_CODE
   ```

### Bing Webmaster Tools

1. Go to [Bing Webmaster Tools](https://www.bing.com/webmasters)
2. Add your site
3. Choose "Meta tag" verification
4. Copy the verification code
5. Add to `.env.local`:
   ```env
   NEXT_PUBLIC_BING_VERIFICATION=YOUR_BING_CODE
   ```

## Environment Variables Setup

Create or update your `.env.local` file:

```env
# Site URL
NEXT_PUBLIC_SITE_URL=https://passbangla.com

# Search Engine Verification Codes
NEXT_PUBLIC_GOOGLE_VERIFICATION=your-google-verification-code-here
NEXT_PUBLIC_YANDEX_VERIFICATION=your-yandex-verification-code-here
NEXT_PUBLIC_YAHOO_VERIFICATION=your-yahoo-verification-code-here
```

## Testing Verification

After adding the verification codes:

1. Build your application: `npm run build`
2. Start the production server: `npm start`
3. View page source and check for the verification meta tags:
   ```html
   <meta name="google-site-verification" content="YOUR_CODE" />
   ```
4. Go back to Google Search Console and click "Verify"

## Troubleshooting

### Verification Failed

- **Check the meta tag is present**: View page source and search for "google-site-verification"
- **Ensure it's in the `<head>`**: The tag must be in the document head
- **Check for typos**: Verify the code matches exactly
- **Wait a few minutes**: Sometimes it takes time for changes to propagate

### Meta Tag Not Showing

- **Clear cache**: Hard refresh (Ctrl+F5 or Cmd+Shift+R)
- **Check environment variables**: Ensure `.env.local` is loaded
- **Restart dev server**: Stop and restart `npm run dev`
- **Check build**: In production, ensure the build includes the meta tag

## Next Steps After Verification

1. **Submit Sitemap**: Add `sitemap.xml` to Google Search Console
2. **Request Indexing**: Use URL Inspection tool for important pages
3. **Monitor Performance**: Check search analytics regularly
4. **Fix Issues**: Address any crawl errors or indexing issues
5. **Optimize**: Use Core Web Vitals data to improve site speed

## Security Note

⚠️ **Important**: Never commit `.env.local` to version control. It should be in your `.gitignore` file.

