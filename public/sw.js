// public/sw.js - Basic service worker for offline support

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open('sistema-ministerial-cache-v1').then((cache) => {
      return cache.addAll([
        '/',
        '/index.html',
        '/src/main.tsx', // Add more assets as needed
        // Include CSS, JS, images, etc.
      ]);
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.filter((cacheName) => {
          return cacheName !== 'sistema-ministerial-cache-v1';
        }).map((cacheName) => {
          return caches.delete(cacheName);
        })
      );
    })
  );
});
