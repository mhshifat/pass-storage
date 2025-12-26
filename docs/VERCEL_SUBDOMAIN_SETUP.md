# Vercel Subdomain Setup Guide

This guide explains how to configure subdomains to work correctly on Vercel.

## Problem

After deploying to Vercel, subdomains (e.g., `company.passbangla.com`) may not work correctly because:
1. Vercel uses `x-forwarded-host` header instead of `host` header
2. DNS wildcard configuration is needed
3. Vercel project settings need to be configured

## Solution

### Step 1: Configure DNS (Wildcard Subdomain)

You need to add a wildcard DNS record to allow any subdomain:

1. **Go to your domain registrar** (where you manage DNS for `passbangla.com`)

2. **Add a wildcard A record or CNAME:**
   - **Type**: `A` or `CNAME`
   - **Name**: `*` (wildcard)
   - **Value**: 
     - For A record: Vercel's IP addresses (check Vercel dashboard)
     - For CNAME: `cname.vercel-dns.com` (recommended)

   Example DNS records:
   ```
   Type    Name    Value
   A       @       [Vercel IP]
   CNAME   *       cname.vercel-dns.com
   ```

3. **Wait for DNS propagation** (can take up to 48 hours, usually 1-2 hours)

### Step 2: Configure Vercel Project

1. **Go to Vercel Dashboard**
   - Visit: https://vercel.com/dashboard
   - Select your project

2. **Add Domain**
   - Go to **Settings** → **Domains**
   - Add your main domain: `passbangla.com`
   - Add wildcard domain: `*.passbangla.com`

3. **Verify Domain**
   - Follow Vercel's instructions to verify domain ownership
   - Add the required DNS records if prompted

### Step 3: Update Environment Variables

Make sure your `.env.local` (or Vercel environment variables) includes:

```env
NEXT_PUBLIC_SITE_URL=https://passbangla.com
```

In Vercel Dashboard:
1. Go to **Settings** → **Environment Variables**
2. Add `NEXT_PUBLIC_SITE_URL` with value `https://passbangla.com`

### Step 4: Deploy

After configuring DNS and Vercel settings:

1. **Redeploy your application** (or push a new commit)
2. **Test subdomain access:**
   - Visit: `https://yourcompany.passbangla.com`
   - Should work correctly

## Testing

### Test Subdomain Detection

1. Visit a subdomain: `https://test.passbangla.com`
2. Check if the middleware correctly detects the subdomain
3. The subdomain should be available in:
   - `req.headers.get("x-subdomain")` (set by middleware)
   - Server components via `headers().get("x-subdomain")`

### Common Issues

#### Issue 1: Subdomain returns 404

**Solution:**
- Check DNS wildcard record is configured
- Verify `*.passbangla.com` is added in Vercel domains
- Wait for DNS propagation

#### Issue 2: Subdomain not detected

**Solution:**
- The middleware has been updated to check `x-forwarded-host` header
- Vercel automatically sets this header
- Make sure you've deployed the latest code

#### Issue 3: SSL Certificate Error

**Solution:**
- Vercel automatically provisions SSL certificates for all domains
- Wait a few minutes after adding domain
- Check Vercel dashboard for certificate status

## How It Works

1. **DNS Resolution:**
   - `company.passbangla.com` → Resolves to Vercel's servers (via wildcard DNS)

2. **Vercel Routing:**
   - Vercel receives the request with `Host: company.passbangla.com`
   - Sets `x-forwarded-host` header

3. **Middleware:**
   - Extracts subdomain from `x-forwarded-host` or `host` header
   - Sets `x-subdomain` header for use in server components

4. **Application:**
   - Server components can access subdomain via `headers().get("x-subdomain")`
   - Routing logic uses subdomain to find company/organization

## Verification

After setup, verify:

1. ✅ Main domain works: `https://passbangla.com`
2. ✅ Subdomain works: `https://test.passbangla.com`
3. ✅ Subdomain is detected in middleware
4. ✅ Login redirects work correctly
5. ✅ Register is blocked on subdomains (as designed)

## Additional Notes

- **Preview Deployments**: Subdomains won't work on Vercel preview URLs (e.g., `project-xxx.vercel.app`)
- **Custom Domains Required**: Subdomains only work with custom domains configured in Vercel
- **Wildcard SSL**: Vercel automatically provisions wildcard SSL certificates for `*.passbangla.com`

## Support

If subdomains still don't work after following this guide:

1. Check Vercel deployment logs
2. Verify DNS records using: `dig *.passbangla.com`
3. Check Vercel domain configuration
4. Review middleware logs (add console.log for debugging)

