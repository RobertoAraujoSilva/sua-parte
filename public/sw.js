// public/sw.js - Robust service worker for Sistema Ministerial

const CACHE_NAME = 'sistema-ministerial-cache-v2';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
  '/favicon.svg'
];

// Instalação do Service Worker
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Cache opened');
        // Adicionar apenas recursos que sabemos que existem
        return cache.addAll(STATIC_ASSETS);
      })
      .catch((error) => {
        console.warn('Service Worker: Cache addAll failed, continuing without cache:', error);
        // Continuar mesmo se o cache falhar
        return Promise.resolve();
      })
      .then(() => {
        console.log('Service Worker: Install completed');
        // Forçar ativação imediata
        return self.skipWaiting();
      })
  );
});

// Ativação do Service Worker
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((cacheName) => cacheName !== CACHE_NAME)
            .map((cacheName) => {
              console.log('Service Worker: Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            })
        );
      })
      .then(() => {
        console.log('Service Worker: Activation completed');
        // Tomar controle de todas as páginas abertas
        return self.clients.claim();
      })
  );
});

// Interceptação de requisições
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Não fazer cache de requisições de API ou backend
  if (url.pathname.startsWith('/api/') || 
      url.hostname === 'localhost' && url.port === '3001' ||
      url.hostname === 'sua-parte.lovable.app' && url.pathname.startsWith('/api/')) {
    return;
  }
  
  // Não fazer cache de requisições POST, PUT, DELETE
  if (request.method !== 'GET') {
    return;
  }
  
  // Estratégia: Cache First, depois Network
  event.respondWith(
    caches.match(request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          console.log('Service Worker: Serving from cache:', request.url);
          return cachedResponse;
        }
        
        // Se não estiver em cache, buscar da rede
        return fetch(request)
          .then((response) => {
            // Só fazer cache de respostas válidas
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            
            // Clonar a resposta para fazer cache
            const responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(request, responseToCache);
                console.log('Service Worker: Cached new resource:', request.url);
              })
              .catch((error) => {
                console.warn('Service Worker: Failed to cache resource:', request.url, error);
              });
            
            return response;
          })
          .catch((error) => {
            console.warn('Service Worker: Fetch failed:', request.url, error);
            
            // Para páginas HTML, tentar retornar index.html do cache
            if (request.destination === 'document') {
              return caches.match('/index.html');
            }
            
            // Para outros recursos, retornar uma resposta de erro amigável
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

console.log('Service Worker: Loaded successfully');
