// Service Worker for QueueLess PWA
const CACHE_NAME = 'queueless-v1';
const ASSETS_TO_CACHE = [
  './index.html',
  './mobile-app.html',
  './staff-dashboard.html',
  './kiosk-display.html',
  './analytics.html',
  './assets/css/style.css',
  './assets/js/engine.js',
  './manifest.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    }).catch(() => {
      console.log('Service Worker caching bypassed for local file protocol');
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request).catch(() => response);
    })
  );
});
