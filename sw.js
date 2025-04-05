// Service Worker for Sea Catch Scorer PWA

// Use a cache name specific to your app and version it
const CACHE_NAME = 'sea-catch-scorer-cache-v1';

// List the essential files needed for the app shell to load
// IMPORTANT: Paths must be correct relative to the origin (including the repo name for GitHub Pages)
const APP_SHELL_URLS = [
  '/fishing-log-pwa/', // The root HTML page (or index.html)
  '/fishing-log-pwa/index.html', // Explicitly cache index.html as well
  '/fishing-log-pwa/manifest.json', // The web app manifest

  // Icons referenced in the manifest (add all sizes you actually create)
  '/fishing-log-pwa/icons/icon-192x192.png',
  '/fishing-log-pwa/icons/icon-512x512.png',
  // Add other icon paths here if you create them (e.g., /fishing-log-pwa/icons/icon-144x144.png)

  // External CSS Dependencies (CDNs)
  'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css',
  'https://cdn.jsdelivr.net/npm/bootstrap-icons/font/bootstrap-icons.css',
  'https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap',

  // External JS Dependencies (CDNs)
  'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js',

  // External Images (Important for offline look and feel)
  'https://i.postimg.cc/pLFtxQWs/seacatchscorecard.jpg' // Your background image

  // NOTE: Caching external resources (CDNs, image hosts) works, but has limitations.
  // - Opaque Responses: For resources without proper CORS headers, the SW might store an "opaque" response.
  //   This works for displaying, but the SW can't read its content or status code accurately.
  // - Font Files: Caching the Google Fonts CSS *doesn't* automatically cache the actual .woff2 font files it links to (hosted on fonts.gstatic.com).
  //   True offline fonts require caching those files too, which adds complexity.
];

// --- INSTALL Event ---
// Triggered when the service worker is first registered or updated.
self.addEventListener('install', (event) => {
  console.log('[SW] Install event');
  // Use event.waitUntil to ensure the SW doesn't activate until caching is complete.
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Caching App Shell URLs');
        // Add all essential URLs to the cache.
        // If any request fails, the whole cache operation fails.
        return cache.addAll(APP_SHELL_URLS);
      })
      .then(() => {
        console.log('[SW] App Shell URLs cached successfully');
        // Optional: Force the waiting service worker to become the active service worker.
        // self.skipWaiting(); // Use with caution, can cause issues if clients have old resources.
      })
      .catch((error) => {
        console.error('[SW] Failed to cache App Shell URLs:', error);
        // Optionally, you could decide not to activate the SW if caching fails critically.
      })
  );
});

// --- ACTIVATE Event ---
// Triggered after the install event, when the SW takes control.
// Used for cleaning up old caches.
self.addEventListener('activate', (event) => {
  console.log('[SW] Activate event');
  // Use event.waitUntil to prevent interruptions during cleanup.
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      // Promise.all waits for all deletions to complete.
      return Promise.all(
        cacheNames.map((cacheName) => {
          // If a cache name is found that isn't our current one, delete it.
          if (cacheName !== CACHE_NAME) {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('[SW] Old caches cleaned up');
      // Tell the active service worker to take control of the page immediately.
      return self.clients.claim();
    })
  );
});

// --- FETCH Event ---
// Triggered for every network request made by the page (HTML, CSS, JS, images, API calls, etc.).
self.addEventListener('fetch', (event) => {
  // We only want to handle GET requests for caching purposes
  if (event.request.method !== 'GET') {
    return;
  }

  // Cache-First Strategy for App Shell URLs (or all GET requests in this basic example)
  event.respondWith(
    caches.match(event.request) // Check if the request exists in the cache
      .then((cachedResponse) => {
        // 1. Cache Hit: Return the cached response immediately.
        if (cachedResponse) {
          // console.log('[SW] Serving from cache:', event.request.url);
          return cachedResponse;
        }

        // 2. Cache Miss: Request not in cache, fetch from the network.
        // console.log('[SW] Request not in cache, fetching from network:', event.request.url);
        return fetch(event.request)
          .then((networkResponse) => {
            // Optional: Cache the newly fetched resource for future offline use.
            // Be careful what you cache dynamically - avoid caching large files or API responses
            // unless you have a specific strategy (e.g., stale-while-revalidate).
            // For this basic example, we are NOT dynamically caching network responses,
            // only the pre-defined APP_SHELL_URLS during install.
            return networkResponse;
          })
          .catch((error) => {
            // Network Fetch Failed (likely offline)
            console.warn('[SW] Network fetch failed:', error);
            // Optional: You could return a generic offline fallback page/image here if needed.
            // For example: return caches.match('/fishing-log-pwa/offline.html');
            // If no fallback, the browser's default offline error will show.
          });
      })
  );
});

// Optional: Add listener for 'message' events if you need communication
// between your page JavaScript and the service worker.
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    console.log('[SW] Received SKIP_WAITING message. Activating new SW.');
    self.skipWaiting();
  }
});
