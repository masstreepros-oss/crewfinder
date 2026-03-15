const CACHE_VERSION = 'v4';
const CACHE_NAME = `crewfinder-${CACHE_VERSION}`;
const OFFLINE_URL = '/offline.html';

// HTML pages to cache
const HTML_PAGES = [
  '/',
  '/index.html',
  '/app.html',
  '/storm.html',
  '/calendar.html',
  '/equipment.html',
  '/news.html',
  '/admin.html',
  '/caller.html',
  '/demo.html',
  '/waitlist.html',
  '/privacy.html',
  '/terms.html',
  '/404.html',
  '/offline.html'
];

// Static assets to cache (icons, images)
const STATIC_ASSETS = [
  '/icon-192.png',
  '/icon-512.png',
  '/favicon.ico',
  '/og-image.png',
  '/manifest.json'
];

// CDN assets to cache
const CDN_ASSETS = [
  'https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&display=swap',
  'https://unpkg.com/@supabase/supabase-js@2.49.4/dist/umd/supabase.js',
  'https://cdnjs.cloudflare.com/ajax/libs/dompurify/3.0.8/purify.min.js'
];

// Install - cache the app shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      const promises = [
        ...HTML_PAGES.map(page => cache.add(page).catch(() => {})),
        ...STATIC_ASSETS.map(asset => cache.add(asset).catch(() => {})),
        ...CDN_ASSETS.map(asset => cache.add(asset).catch(() => {})),
        cache.add(OFFLINE_URL).catch(() => {})
      ];
      return Promise.all(promises);
    })
  );
  // Skip waiting to activate immediately
  self.skipWaiting();
});

// Activate - clean up old caches and claim clients
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    }).then(() => {
      // Take control of all clients immediately
      return self.clients.claim();
    })
  );
});

// Fetch - use different strategies based on content type
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);
  const isAPI = url.hostname.includes('supabase.co');
  const isIcon = url.pathname.match(/\.(png|ico|svg|jpg|jpeg|webp|gif)$/i);
  const isCDN = url.hostname.includes('cdn.jsdelivr.net') || url.hostname.includes('cdnjs.cloudflare.com') || url.hostname.includes('fonts.googleapis.com') || url.hostname.includes('fonts.gstatic.com');
  const isHTML = url.pathname.endsWith('.html') || url.pathname === '/';

  // Network-first for API calls with timeout
  if (isAPI) {
    event.respondWith(
      Promise.race([
        fetch(event.request)
          .then((response) => {
            if (response.ok) {
              const clone = response.clone();
              caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
            }
            return response;
          })
          .catch(() => caches.match(event.request)),
        new Promise((resolve) => {
          setTimeout(() => resolve(caches.match(event.request)), 5000);
        })
      ]).then(response => response || new Response('{"error":"offline"}', {
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      }))
    );
    return;
  }

  // Cache-first for static assets (icons, images)
  if (isIcon || (isCDN && !url.pathname.endsWith('.css'))) {
    event.respondWith(
      caches.match(event.request)
        .then((cached) => {
          if (cached) return cached;
          return fetch(event.request)
            .then((response) => {
              if (response.ok) {
                const clone = response.clone();
                caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
              }
              return response;
            })
            .catch(() => new Response('', { status: 404 }));
        })
    );
    return;
  }

  // Stale-while-revalidate for HTML pages
  if (isHTML) {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        const fetchPromise = fetch(event.request)
          .then((response) => {
            if (response.ok) {
              const clone = response.clone();
              caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
            }
            return response;
          })
          .catch(() => null);

        // Return cached version immediately, update in background
        if (cached) {
          // Fire off the network request to update cache in background
          fetchPromise;
          return cached;
        }
        // No cache — wait for network, fallback to offline page
        return fetchPromise.then(response => response || caches.match(OFFLINE_URL));
      })
    );
    return;
  }

  // Cache-first for CDN CSS/fonts
  if (isCDN) {
    event.respondWith(
      caches.match(event.request)
        .then((cached) => {
          if (cached) return cached;
          return fetch(event.request)
            .then((response) => {
              if (response.ok) {
                const clone = response.clone();
                caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
              }
              return response;
            })
            .catch(() => new Response('', { status: 404 }));
        })
    );
    return;
  }

  // Default: network-first with cache fallback
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return response;
      })
      .catch(() => {
        return caches.match(event.request).then((cached) => {
          return cached || caches.match(OFFLINE_URL);
        });
      })
  );
});

// Push notifications
self.addEventListener('push', (event) => {
  let data = { title: 'CrewFinder', body: 'You have a new notification' };

  try {
    if (event.data) {
      data = event.data.json();
    }
  } catch (e) {
    data.body = event.data ? event.data.text() : 'New notification';
  }

  const options = {
    body: data.body || '',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    vibrate: [200, 100, 200],
    data: {
      url: data.url || '/app.html',
    },
    actions: data.actions || [],
    tag: data.tag || 'crewfinder-notification',
    renotify: true,
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'CrewFinder', options)
  );
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const rawUrl = event.notification.data?.url || '/app.html';
  // Validate URL - only allow same-origin or relative paths
  const url = (rawUrl.startsWith('/') || rawUrl.startsWith(self.location.origin)) ? rawUrl : '/app.html';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (const client of windowClients) {
        if (client.url.includes('/app.html') && 'focus' in client) {
          return client.focus();
        }
      }
      return clients.openWindow(url);
    })
  );
});

// Listen for messages from the main thread
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
