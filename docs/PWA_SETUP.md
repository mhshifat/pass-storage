# PWA Setup Guide

PassStorage has been configured as a Progressive Web App (PWA) to provide a native app-like experience on mobile and desktop devices.

## Features

✅ **Offline Support** - Service worker caches essential assets for offline access  
✅ **Install Prompt** - Users can install the app to their home screen  
✅ **App-like Experience** - Standalone mode without browser UI  
✅ **Fast Loading** - Cached assets load instantly  
✅ **Cross-platform** - Works on iOS, Android, and Desktop  

## Setup Instructions

### 1. Generate PWA Icons

You need to generate the required icon files for the PWA:

**Option A: Using the script (requires sharp)**
```bash
npm install -D sharp
npm run generate-pwa-icons
```

**Option B: Manual generation**
Create the following icon files in the `public/` directory:
- `icon-192.png` (192x192 pixels)
- `icon-512.png` (512x512 pixels)
- `apple-icon.png` (180x180 pixels)

You can use online tools like:
- [RealFaviconGenerator](https://realfavicongenerator.net/)
- [PWA Builder Image Generator](https://www.pwabuilder.com/imageGenerator)

### 2. Test PWA Features

1. **Build and run in production mode:**
   ```bash
   npm run build
   npm start
   ```

2. **Test on mobile device:**
   - Open the app in a mobile browser
   - Look for the install prompt
   - On iOS: Use "Add to Home Screen"
   - On Android: Use the browser's install prompt

3. **Test offline mode:**
   - Install the app
   - Turn on airplane mode
   - The app should still work with cached content

### 3. Service Worker

The service worker (`public/sw.js`) is automatically registered in production mode. It:
- Caches essential pages and assets
- Provides offline fallback
- Updates automatically when new versions are available

### 4. Manifest

The app manifest (`src/app/manifest.ts`) defines:
- App name and description
- Icons and theme colors
- Display mode (standalone)
- Shortcuts for quick access

## Configuration

### Customizing the Manifest

Edit `src/app/manifest.ts` to customize:
- App name and description
- Theme colors
- Icons
- Shortcuts

### Customizing the Service Worker

Edit `public/sw.js` to:
- Add more assets to cache
- Customize caching strategy
- Add background sync
- Implement push notifications

### Install Prompt

The install prompt (`src/components/pwa/install-prompt.tsx`) automatically shows:
- On Android/Desktop: Native install prompt
- On iOS: Instructions for "Add to Home Screen"

## Browser Support

- ✅ Chrome/Edge (Android & Desktop)
- ✅ Safari (iOS & macOS)
- ✅ Firefox (Android & Desktop)
- ✅ Samsung Internet

## Troubleshooting

### Icons not showing
- Ensure icon files exist in `public/` directory
- Check file sizes match manifest requirements
- Clear browser cache

### Service worker not registering
- Service worker only registers in production mode
- Check browser console for errors
- Ensure `public/sw.js` exists

### Install prompt not showing
- Must be served over HTTPS (or localhost)
- Must have valid manifest
- User must visit site multiple times (browser requirement)

## Next Steps

1. Generate the icon files
2. Test in production mode
3. Customize manifest and service worker as needed
4. Deploy to production with HTTPS

For more information, see:
- [Next.js PWA Documentation](https://nextjs.org/docs/app/api-reference/file-conventions/metadata)
- [MDN PWA Guide](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps)

