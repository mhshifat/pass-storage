// Service Worker for PassBangla PWA
const CACHE_NAME = 'passbangla-v1'
const RUNTIME_CACHE = 'passbangla-runtime-v1'

// Assets to cache on install
const PRECACHE_ASSETS = [
  '/',
  '/login',
  '/admin',
  '/offline',
]

// Install event - cache essential assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS)
    })
  )
  self.skipWaiting()
})

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => {
            return cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE
          })
          .map((cacheName) => caches.delete(cacheName))
      )
    })
  )
  return self.clients.claim()
})

// Fetch event - network first, fallback to cache
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return
  }

  // Skip API requests and external resources
  if (
    event.request.url.includes('/api/') ||
    event.request.url.includes('chrome-extension://') ||
    event.request.url.includes('data:')
  ) {
    return
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Clone the response
        const responseToCache = response.clone()

        // Cache successful responses
        if (response.status === 200) {
          caches.open(RUNTIME_CACHE).then((cache) => {
            cache.put(event.request, responseToCache)
          })
        }

        return response
      })
      .catch(() => {
        // Network failed, try cache
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse
          }

          // If it's a navigation request and we have an offline page
          if (event.request.mode === 'navigate') {
            return caches.match('/offline')
          }

          // Return a basic offline response
          return new Response('Offline', {
            status: 503,
            statusText: 'Service Unavailable',
            headers: new Headers({
              'Content-Type': 'text/plain',
            }),
          })
        })
      })
  )
})

// Background sync for offline actions (if needed)
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-passwords') {
    event.waitUntil(syncPasswords())
  }
})

async function syncPasswords() {
  // Implement password sync logic here
  // This would sync any offline changes when connection is restored
  console.log('Syncing passwords...')
}

