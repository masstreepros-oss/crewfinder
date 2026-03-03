const CACHE_NAME = 'crewfinder-v2';
const OFFLINE_URL = '/offline.html';

// HTML pages to cache
const HTML_PAGES = [
  '/app.html',
  '/storm.html',
  '/calendar.html',
  '/equipment.html',
  '/news.html',
  '/admin.html',
  '/index.html',
  '/caller.html',
  '/waitlist.html',
  '/404.html',
  '/offline.html'
];

// Static assets to cache
const STATIC_ASSETS = [
  'https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&display=swap',
  'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2',
  'https://cdnjs.cloudflare.com/ajax/libs/dompurify/3.0.8/purify.min.js'
];

// Install - cache the app shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // Try to add all pages and assets, but continue even if some fail
      const promises = [
        ...HTML_PAGES.map(page => cache.add(page).catch(() => {})),
        ...STATIC_ASSETS.map(asset => cache.add(asset).catch(() => {})),
        cache.add(OFFLINE_URL).catch(() => {})
      ];
      return Promise.all(promises);
    })
  );
  self.skipWaiting();
});

// Activate - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

// Fetch - use different strategies based on content type
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') return;

  const url = event.request.url;
  const isAPI = url.includes('supabase.co') || url.includes('googleapis.com/');
  const isStaticAsset = url.includes('.css') || url.includes('.js') || url.includes('fonts.googleapis') || url.includes('cdnjs.cloudflare');
  const isHTML = url.endsWith('.html') || url.endsWith('/');

  // Network-first strategy for API calls (but don't wait forever)
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
      ])
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // Cache-first strategy for static assets
  if (isStaticAsset) {
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
            .catch(() => caches.match(OFFLINE_URL));
        })
    );
    return;
  }

  // Network-first for HTML pages with offline fallback
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
      // Focus existing window if open
      for (const client of windowClients) {
        if (client.url.includes('/app.html') && 'focus' in client) {
          return client.focus();
        }
      }
      // Otherwise open new window
      return clients.openWindow(url);
    })
  );
});
