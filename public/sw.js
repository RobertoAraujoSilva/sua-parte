// Optimized Service Worker - Avoids intercepting Supabase requests
const CACHE_NAME = 'sistema-ministerial-cache-v3';
const SUPABASE_DOMAINS = [
  'supabase.co',
  'supabase.com',  
  'nwpuurgwnnuejqinkvrh.supabase.co'
];

// Static assets to cache
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
  '/favicon.svg'
];

// Install event
self.addEventListener('install', (event) => {
  console.log('🔧 Service Worker: Installing...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('✅ Service Worker: Cache opened');
        return cache.addAll(STATIC_ASSETS);
      })
      .catch((error) => {
        console.warn('⚠️ Service Worker: Cache addAll failed, continuing without cache:', error);
        return Promise.resolve();
      })
      .then(() => {
        console.log('✅ Service Worker: Install completed');
        return self.skipWaiting();
      })
  );
});

// Activate event - clean old caches
self.addEventListener('activate', (event) => {
  console.log('🔄 Service Worker: Activating...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((cacheName) => cacheName !== CACHE_NAME)
            .map((cacheName) => {
              console.log('🗑️ Service Worker: Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            })
        );
      })
      .then(() => {
        console.log('✅ Service Worker: Activation completed');
        return self.clients.claim();
      })
  );
});

// Fetch event - avoid intercepting Supabase requests
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip Supabase requests entirely - DON'T INTERCEPT
  if (SUPABASE_DOMAINS.some(domain => url.hostname.includes(domain))) {
    return; // Let browser handle directly
  }

  // Skip API requests (backend)
  if (url.pathname.startsWith('/api/') || 
      (url.hostname === 'localhost' && url.port === '3001') ||
      (url.hostname === 'sua-parte.lovable.app' && url.pathname.startsWith('/api/'))) {
    return;
  }

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Cache strategy for static assets only
  event.respondWith(
    caches.match(request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        
        return fetch(request)
          .then((response) => {
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            
            const responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(request, responseToCache);
              })
              .catch((error) => {
                console.warn('⚠️ Service Worker: Failed to cache:', request.url, error);
              });
            
            return response;
          })
          .catch((error) => {
            console.warn('⚠️ Service Worker: Fetch failed:', request.url, error);
            
            if (request.destination === 'document') {
              return caches.match('/index.html');
            }
            
            return new Response('Resource not available offline', {
              status: 503,
              statusText: 'Service Unavailable',
              headers: { 'Content-Type': 'text/plain' }
            });
          });
      })
  );
});

// Mensagens do Service Worker
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_NAME });
  }
});

console.log('✅ Service Worker: Loaded successfully - Sistema Ministerial v3');
