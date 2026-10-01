const CACHE_NAME = 'synchro-v6-collaborative-no-roles';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => caches.delete(cache))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Pass through directly to network
  event.respondWith(fetch(event.request).catch(() => caches.match(event.request)));
});
