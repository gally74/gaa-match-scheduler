// GAA Match Scheduler Service Worker
const CACHE_NAME = 'gaa-scheduler-v1';
const urlsToCache = [
  '/gaa-match-scheduler/',
  '/gaa-match-scheduler/index.html',
  '/gaa-match-scheduler/styles.css',
  '/gaa-match-scheduler/script.js',
  '/gaa-match-scheduler/manifest.json',
  '/gaa-match-scheduler/icon-192x192.png',
  '/gaa-match-scheduler/icon-512x512.png'
];

// Install event - cache resources
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// Fetch event - serve from cache when offline
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Return cached version or fetch from network
        return response || fetch(event.request);
      }
    )
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
