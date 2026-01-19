// Service Worker para RTVC Programación - Modo Desarrollo Friendly
const CACHE_VERSION = 'rtvc-v1';
const CACHE_NAME = `rtvc-cache-${CACHE_VERSION}`;
const RUNTIME_CACHE = `rtvc-runtime-${CACHE_VERSION}`;
const API_CACHE = `rtvc-api-${CACHE_VERSION}`;

// Detectar si estamos en desarrollo (localhost o IP local)
const isDevelopment = self.location.hostname === 'localhost' ||
                     self.location.hostname.match(/^192\.168\.\d+\.\d+$/) ||
                     self.location.hostname.match(/^10\.\d+\.\d+\.\d+$/) ||
                     self.location.hostname.match(/^172\.(1[6-9]|2\d|3[0-1])\.\d+\.\d+$/);

console.log('[SW] Modo:', isDevelopment ? 'DESARROLLO' : 'PRODUCCIÓN');
console.log('[SW] Hostname:', self.location.hostname);

// Recursos mínimos para cachear (solo en producción)
const STATIC_ASSETS = isDevelopment ? [] : [
  '/',
  '/index.html',
  '/manifest.json'
];

// Instalar Service Worker
self.addEventListener('install', (event) => {
  console.log('[SW] Instalando Service Worker v' + CACHE_VERSION);

  if (isDevelopment) {
    console.log('[SW] Modo desarrollo: Skipping cache en instalación');
    event.waitUntil(self.skipWaiting());
    return;
  }

  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Cacheando recursos estáticos');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => self.skipWaiting())
      .catch((error) => {
        console.error('[SW] Error en instalación:', error);
        return self.skipWaiting();
      })
  );
});

// Activar Service Worker
self.addEventListener('activate', (event) => {
  console.log('[SW] Activando Service Worker v' + CACHE_VERSION);

  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME &&
                cacheName !== RUNTIME_CACHE &&
                cacheName !== API_CACHE) {
              console.log('[SW] Eliminando cache antiguo:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => self.clients.claim())
      .catch((error) => {
        console.error('[SW] Error en activación:', error);
        return self.clients.claim();
      })
  );
});

// Estrategia de fetch - MUY PERMISIVA EN DESARROLLO
self.addEventListener('fetch', (event) => {
  const { request } = event;

  try {
    const url = new URL(request.url);

    // IMPORTANTE: Ignorar protocolos no HTTP/HTTPS
    if (!url.protocol.startsWith('http')) {
      return;
    }

    // En desarrollo: SIEMPRE intentar red primero, sin cache
    if (isDevelopment) {
      event.respondWith(
        fetch(request)
          .then(response => {
            // En desarrollo, NO cachear nada para evitar problemas
            return response;
          })
          .catch(error => {
            console.warn('[SW] Fetch falló (desarrollo):', request.url, error.message);

            // Intentar cache solo si existe
            return caches.match(request)
              .then(cachedResponse => {
                if (cachedResponse) {
                  console.log('[SW] Sirviendo desde cache (fallback):', request.url);
                  return cachedResponse;
                }

                // Si no hay cache, devolver error apropiado
                if (request.destination === 'document') {
                  return caches.match('/index.html');
                }

                // Para otros recursos, propagar el error
                throw error;
              });
          })
      );
      return;
    }

    // ==== MODO PRODUCCIÓN: Estrategias de cache normales ====

    // Para API requests: Network First
    if (url.pathname.startsWith('/api/')) {
      event.respondWith(
        fetch(request)
          .then((response) => {
            if (response && response.status === 200) {
              const responseToCache = response.clone();
              caches.open(API_CACHE)
                .then(cache => cache.put(request, responseToCache))
                .catch(err => console.warn('[SW] Error al cachear API:', err));
            }
            return response;
          })
          .catch(() => {
            return caches.match(request)
              .then((cachedResponse) => {
                if (cachedResponse) {
                  console.log('[SW] Sirviendo API desde cache:', request.url);
                  return cachedResponse;
                }

                return new Response(
                  JSON.stringify({
                    error: 'Sin conexión',
                    offline: true,
                    message: 'No hay conexión a internet'
                  }),
                  {
                    headers: { 'Content-Type': 'application/json' },
                    status: 503
                  }
                );
              });
          })
      );
      return;
    }

    // Para recursos estáticos: Cache First
    if (['script', 'style', 'image', 'font'].includes(request.destination)) {
      event.respondWith(
        caches.match(request)
          .then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse;
            }

            return fetch(request)
              .then((response) => {
                if (response && response.status === 200) {
                  const responseToCache = response.clone();
                  caches.open(RUNTIME_CACHE)
                    .then(cache => cache.put(request, responseToCache))
                    .catch(err => console.warn('[SW] Error al cachear recurso:', err));
                }
                return response;
              });
          })
      );
      return;
    }

    // Para navegación: Network First con fallback
    if (request.mode === 'navigate') {
      event.respondWith(
        fetch(request)
          .catch(() => caches.match('/index.html'))
      );
      return;
    }

    // Default: Network First
    event.respondWith(
      fetch(request)
        .catch(() => caches.match(request))
    );

  } catch (error) {
    console.error('[SW] Error en fetch handler:', error);
    // En caso de error, dejar que el navegador maneje la petición
  }
});

// Manejar mensajes del cliente
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys()
        .then(cacheNames => Promise.all(cacheNames.map(name => caches.delete(name))))
        .then(() => console.log('[SW] Todos los caches limpiados'))
    );
  }
});

console.log('[SW] Service Worker v' + CACHE_VERSION + ' cargado en modo:', isDevelopment ? 'DESARROLLO' : 'PRODUCCIÓN');
