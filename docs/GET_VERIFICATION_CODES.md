# How to Get Verification Codes for .env.local

This guide explains how to obtain the verification codes needed for lines 21-23 in your `.env.local` file:

```env
NEXT_PUBLIC_GOOGLE_VERIFICATION=your-google-verification-code-here
NEXT_PUBLIC_YANDEX_VERIFICATION=your-yandex-verification-code-here
NEXT_PUBLIC_YAHOO_VERIFICATION=your-yahoo-verification-code-here
```

## 1. Google Verification Code

### Step-by-Step:

1. **Go to Google Search Console**
   - Visit: https://search.google.com/search-console
   - Sign in with your Google account

2. **Add Your Property**
   - Click "Add Property" (or use the property dropdown)
   - Select "URL prefix" as the property type
   - Enter your website URL: `https://passbangla.com`
   - Click "Continue"

3. **Choose Verification Method**
   - Select **"HTML tag"** (recommended for Next.js)
   - You'll see a meta tag like this:
     ```html
     <meta name="google-site-verification" content="abc123xyz789..." />
     ```

4. **Copy the Verification Code**
   - Copy ONLY the `content` value (the long string after `content="`)
   - Example: If the tag is `<meta name="google-site-verification" content="abc123xyz789" />`
   - Copy: `abc123xyz789`

5. **Add to .env.local**
   ```env
   NEXT_PUBLIC_GOOGLE_VERIFICATION=abc123xyz789
   ```

6. **Verify**
   - After adding the code and deploying/restarting your app
   - Go back to Google Search Console
   - Click "Verify"
   - ✅ You're verified!

---

## 2. Yandex Verification Code (Optional)

Yandex offers two verification methods. Choose one:

### Method A: HTML File Upload (Recommended - Already Done!)

If Yandex asks you to upload an HTML file:

1. **The file has been created** at `public/yandex-verification.html`
2. **Deploy your site** or restart your dev server
3. **Verify the file is accessible** at: `https://passbangla.com/yandex-verification.html`
4. **Go back to Yandex Webmaster** and click "Verify"

The file contains your verification code: `f179c8429f117666`

### Method B: HTML Meta Tag (Alternative)

1. **Go to Yandex Webmaster**
   - Visit: https://webmaster.yandex.com/
   - Sign in with your Yandex account (create one if needed)

2. **Add Your Site**
   - Click "Add site"
   - Enter your website URL: `https://passbangla.com`
   - Click "Add"

3. **Choose Verification Method**
   - Select **"HTML meta tag"** verification
   - You'll see a meta tag like:
     ```html
     <meta name="yandex-verification" content="def456uvw012..." />
     ```

4. **Copy the Verification Code**
   - Copy the `content` value from the meta tag

5. **Add to .env.local**
   ```env
   NEXT_PUBLIC_YANDEX_VERIFICATION=def456uvw012
   ```

6. **Verify**
   - After adding the code, go back to Yandex Webmaster
   - Click "Verify"

---

## 3. Yahoo/Bing Verification Code (Optional)

**Note:** Yahoo uses Bing Webmaster Tools for verification.

### Step-by-Step:

1. **Go to Bing Webmaster Tools**
   - Visit: https://www.bing.com/webmasters
   - Sign in with your Microsoft account

2. **Add Your Site**
   - Click "Add a site"
   - Enter your website URL: `https://passbangla.com`
   - Click "Add"

3. **Choose Verification Method**
   - Select **"Meta tag"** verification
   - You'll see a meta tag like:
     ```html
     <meta name="msvalidate.01" content="ghi789rst345..." />
     ```

4. **Copy the Verification Code**
   - Copy the `content` value from the meta tag

5. **Add to .env.local**
   ```env
   NEXT_PUBLIC_YAHOO_VERIFICATION=ghi789rst345
   ```

6. **Verify**
   - After adding the code, go back to Bing Webmaster Tools
   - Click "Verify"

---

## Complete .env.local Example

After obtaining all codes, your `.env.local` file should look like this:

```env
# Site URL
NEXT_PUBLIC_SITE_URL=https://passbangla.com

# Search Engine Verification Codes
NEXT_PUBLIC_GOOGLE_VERIFICATION=abc123xyz789def456ghi012
NEXT_PUBLIC_YANDEX_VERIFICATION=def456uvw012ghi345jkl678
NEXT_PUBLIC_YAHOO_VERIFICATION=ghi789rst345uvw678xyz901
```

---

## Important Notes

### ⚠️ Security
- **Never commit `.env.local` to Git** - It's already in `.gitignore`
- Keep these codes private
- Don't share them publicly

### ✅ After Adding Codes

1. **Restart your dev server** (if running):
   ```bash
   # Stop the server (Ctrl+C)
   npm run dev
   ```

2. **Or rebuild for production**:
   ```bash
   npm run build
   npm start
   ```

3. **Verify the meta tags are present**:
   - Visit your site
   - View page source (Right-click → View Page Source)
   - Search for "google-site-verification"
   - You should see: `<meta name="google-site-verification" content="YOUR_CODE" />`

4. **Go back to the search console and click "Verify"**

### 🔍 Troubleshooting

**Code not working?**
- Make sure you copied ONLY the content value (not the entire meta tag)
- Check for extra spaces or quotes
- Ensure your site is deployed/accessible
- Wait a few minutes for changes to propagate

**Meta tag not showing?**
- Clear browser cache (Ctrl+F5 or Cmd+Shift+R)
- Restart your dev server
- Check that `.env.local` is in the project root
- Verify the variable names match exactly

---

## Quick Reference

| Service | URL | Verification Method |
|---------|-----|-------------------|
| **Google** | https://search.google.com/search-console | HTML tag |
| **Yandex** | https://webmaster.yandex.com/ | HTML meta tag |
| **Bing/Yahoo** | https://www.bing.com/webmasters | Meta tag |

---

## Which Ones Do You Need?

- **Google**: ✅ **Required** - Most important for SEO
- **Yandex**: Optional - Only if you want to target Russian/Belarusian markets
- **Yahoo/Bing**: Optional - Only if you want to target Bing/Yahoo search

**Minimum Setup**: Just add `NEXT_PUBLIC_GOOGLE_VERIFICATION` for now. You can add the others later if needed.

