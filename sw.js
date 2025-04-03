// Service Worker for Sea Catch Scorer PWA

const CACHE_NAME = 'sea-catch-cache-v1'; // Increment version if you change cached files
const FILES_TO_CACHE = [
  './', // Cache the root (index.html)
  './index.html', // Explicitly cache index.html as well
  './manifest.json', // Cache the manifest
  './icon-192.png', // Cache the main icons (update paths if needed)
  './icon-512.png',
  // Add other core local assets here if needed (e.g., local CSS/JS files)
  // Note: External URLs (bootstrap, google fonts, background image) are not cached here by default.
  // The fetch handler will try network first for those.
];

// Install event: cache core files
self.addEventListener('install', (event) => {
  console.log('[ServiceWorker] Install');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[ServiceWorker] Pre-caching offline page');
        return cache.addAll(FILES_TO_CACHE);
      })
      .then(() => {
        console.log('[ServiceWorker] Files cached successfully');
        return self.skipWaiting(); // Activate worker immediately
      })
      .catch(error => {
          console.error('[ServiceWorker] Cache addAll failed:', error);
      })
  );
});

// Activate event: clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[ServiceWorker] Activate');
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(keyList.map((key) => {
        if (key !== CACHE_NAME) {
          console.log('[ServiceWorker] Removing old cache', key);
          return caches.delete(key);
        }
      }));
    })
    .then(() => {
         console.log('[ServiceWorker] Claiming clients');
         return self.clients.claim(); // Take control of open clients immediately
    })
  );
});

// Fetch event: serve cached content when offline (Cache-First strategy for core files)
self.addEventListener('fetch', (event) => {
  //console.log('[ServiceWorker] Fetch', event.request.url);

  // Use Cache-First strategy only for GET requests
  if (event.request.method !== 'GET') {
      return;
  }

  // Try to find the response in the cache.
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // If found in cache, return it.
        if (response) {
          //console.log('[ServiceWorker] Returning from Cache:', event.request.url);
          return response;
        }

        // If not found in cache, fetch from network.
        //console.log('[ServiceWorker] Fetching from Network:', event.request.url);
        return fetch(event.request)
            .then((networkResponse) => {
                // Optional: You could cache non-core network responses here dynamically,
                // but be careful about what you cache (e.g., don't cache API POSTs).
                // For simplicity, this basic SW only caches the core files during install.
                return networkResponse;
            })
            .catch((error) => {
                // Handle fetch errors (e.g., offline)
                console.warn('[ServiceWorker] Fetch failed; returning offline page instead.', error);
                // Optionally return a generic offline fallback page here if you have one cached
                // return caches.match('./offline.html');
                // Or just let the browser handle the fetch error
            });
      })
  );
});