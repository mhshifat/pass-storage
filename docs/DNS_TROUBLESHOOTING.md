# DNS Troubleshooting for Subdomains

## Error: DNS_PROBE_FINISHED_NXDOMAIN

This error means your browser cannot find the DNS record for `test.passbangla.com`.

## Quick Fix Checklist

### ✅ Step 1: Verify DNS Records

Check if your DNS records are configured correctly:

1. **Go to your domain registrar** (where you bought `passbangla.com`)
   - Examples: Namecheap, GoDaddy, Cloudflare, Google Domains, etc.

2. **Check for these DNS records:**

   **Option A: CNAME (Recommended)**
   ```
   Type:    CNAME
   Name:    *
   Value:   cname.vercel-dns.com
   TTL:     3600 (or Auto)
   ```

   **Option B: A Record (Alternative)**
   ```
   Type:    A
   Name:    *
   Value:   76.76.21.21 (Vercel's IP - check Vercel dashboard for current IPs)
   TTL:     3600
   ```

3. **Also ensure main domain is configured:**
   ```
   Type:    A or CNAME
   Name:    @ (or blank)
   Value:   [Vercel IP or cname.vercel-dns.com]
   ```

### ✅ Step 2: Verify in Vercel Dashboard

1. **Go to Vercel Dashboard**
   - Visit: https://vercel.com/dashboard
   - Select your project

2. **Check Domains Settings**
   - Go to **Settings** → **Domains**
   - You should see:
     - ✅ `passbangla.com` (main domain)
     - ✅ `*.passbangla.com` (wildcard subdomain)

3. **If wildcard is missing:**
   - Click **Add Domain**
   - Enter: `*.passbangla.com`
   - Follow verification steps

### ✅ Step 3: Test DNS Propagation

Use these tools to check if DNS is propagating:

1. **Online DNS Checker:**
   - https://dnschecker.org/
   - Enter: `test.passbangla.com`
   - Check if it resolves globally

2. **Command Line (if available):**
   ```bash
   # Check DNS resolution
   nslookup test.passbangla.com
   
   # Or with dig
   dig test.passbangla.com
   ```

3. **What to look for:**
   - Should resolve to Vercel's IP addresses
   - Or show CNAME pointing to `cname.vercel-dns.com`

### ✅ Step 4: Wait for DNS Propagation

DNS changes can take:
- **Minimum**: 5-15 minutes
- **Average**: 1-2 hours
- **Maximum**: 48 hours

**Factors affecting propagation:**
- Your DNS provider's TTL settings
- Your ISP's DNS cache
- Geographic location

**To speed up:**
- Lower TTL before making changes (e.g., 300 seconds)
- Clear your local DNS cache:
  ```bash
  # Windows
  ipconfig /flushdns
  
  # macOS
  sudo dscacheutil -flushcache; sudo killall -HUP mDNSResponder
  
  # Linux
  sudo systemd-resolve --flush-caches
  ```

## Common Issues & Solutions

### Issue 1: Wildcard DNS Record Not Added

**Symptom:** Main domain works, subdomains don't

**Solution:**
- Add wildcard (`*`) DNS record at your registrar
- Use CNAME pointing to `cname.vercel-dns.com`

### Issue 2: Vercel Not Configured for Wildcard

**Symptom:** DNS resolves but Vercel returns error

**Solution:**
- Add `*.passbangla.com` in Vercel Dashboard → Settings → Domains
- Redeploy after adding domain

### Issue 3: DNS Provider Doesn't Support Wildcard

**Symptom:** Can't add `*` record

**Solution:**
- Some providers use different syntax:
  - Try: `*` as name
  - Or: `*.passbangla.com` as name
  - Or: Contact support for wildcard setup
- Consider using Cloudflare (free, supports wildcards)

### Issue 4: Cached DNS

**Symptom:** Works for some users, not others

**Solution:**
- Clear browser cache
- Clear DNS cache (commands above)
- Try different network/ISP
- Use incognito/private browsing

## Step-by-Step: Setting Up Wildcard DNS

### Using Cloudflare (Recommended - Free)

1. **Add domain to Cloudflare**
   - Sign up at https://cloudflare.com
   - Add `passbangla.com`
   - Update nameservers at your registrar

2. **Add DNS Records:**
   ```
   Type: A
   Name: @
   Content: [Vercel IP]
   Proxy: Off
   
   Type: CNAME
   Name: *
   Target: cname.vercel-dns.com
   Proxy: Off
   ```

### Using Other Providers

**Namecheap:**
1. Go to Domain List → Manage → Advanced DNS
2. Add CNAME record:
   - Host: `*`
   - Value: `cname.vercel-dns.com`
   - TTL: Automatic

**GoDaddy:**
1. Go to DNS Management
2. Add CNAME record:
   - Name: `*`
   - Value: `cname.vercel-dns.com`
   - TTL: 1 hour

## Verification Steps

After configuring DNS:

1. ✅ **Check DNS propagation** (dnschecker.org)
2. ✅ **Verify in Vercel** (Settings → Domains)
3. ✅ **Test subdomain** (wait 1-2 hours after DNS change)
4. ✅ **Check SSL certificate** (Vercel auto-provisions)

## Still Not Working?

1. **Double-check DNS records** - Make sure wildcard (`*`) is added
2. **Verify Vercel domain** - `*.passbangla.com` must be added in Vercel
3. **Check DNS propagation** - Use dnschecker.org to verify globally
4. **Wait longer** - DNS can take up to 48 hours
5. **Contact support** - Your DNS provider or Vercel support

## Quick Test

Once DNS is configured, test with:

```bash
# Should resolve to Vercel IPs
ping test.passbangla.com

# Or check in browser
https://test.passbangla.com
```

If you see the landing page, DNS is working! 🎉

