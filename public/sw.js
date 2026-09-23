const CACHE_NAME = 'devfit-v3';
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/logo_no_bg.png',
  '/favicon.svg',
  '/DeVFitLogo.png',
  '/version.json'
];

// Precache static shell on installation
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS).catch((err) => {
        console.warn('[SW] Precache partial error:', err);
      });
    }).then(() => self.skipWaiting())
  );
});

// Clean old caches on activation
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Strategy:
// 1. Navigation requests (HTML pages): Network-first with cache fallback and cache update.
//    If network fails or is absent, return cached /index.html immediately.
// 2. Static assets (JS, CSS, images, fonts): Cache-first with network fallback and dynamic caching.
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  if (!event.request.url.startsWith('http')) return;

  const url = new URL(event.request.url);

  // 1. Navigation / HTML requests
  if (event.request.mode === 'navigate' || url.pathname === '/' || url.pathname.endsWith('index.html')) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response && response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put('/index.html', clone);
            });
          }
          return response;
        })
        .catch(async () => {
          const cached = await caches.match('/index.html') || await caches.match('/');
          if (cached) return cached;
          return new Response('DeV Fit è pronto in modalità offline. Ricarica la pagina.', {
            headers: { 'Content-Type': 'text/html; charset=utf-8' }
          });
        })
    );
    return;
  }

  // 2. version.json (used by autoUpdater to check for updates)
  if (url.pathname.endsWith('version.json')) {
    event.respondWith(
      fetch(event.request).catch(() => caches.match(event.request))
    );
    return;
  }

  // 3. Static assets: Vite bundles (/assets/*), icons, images, Google Fonts
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const clone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, clone);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          return cachedResponse;
        });
    })
  );
});
