const CACHE_NAME = 'arman-os-v2';
const ASSETS = [
  '/arman-os/',
  '/arman-os/index.html',
  '/arman-os/manifest.json',
  '/arman-os/icon-192.png',
  '/arman-os/icon-512.png',
];

// Install — cache core assets
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

// Activate — clean old caches
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch — network first, cache fallback for navigation; cache first for assets
self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);

  // Skip non-GET and API calls
  if (e.request.method !== 'GET') return;
  if (url.hostname === 'api.dropboxapi.com' || url.hostname === 'content.dropboxapi.com') return;
  if (url.hostname === 'api.anthropic.com') return;
  if (url.hostname === 'calendar.google.com') return;

  // Navigation — network first
  if (e.request.mode === 'navigate') {
    e.respondWith(
      fetch(e.request).catch(() => caches.match('/arman-os/index.html'))
    );
    return;
  }

  // Assets — cache first
  e.respondWith(
    caches.match(e.request).then((cached) => cached || fetch(e.request))
  );
});
