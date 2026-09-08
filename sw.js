// SB Treasury Tool — Minimal Service Worker
// இது App-ஐ Fast-ஆவும், Basic Offline Access-உடனும் Load ஆக உதவும்.
const CACHE_NAME = 'sb-treasury-cache-v1';
const PRECACHE_URLS = [
  './',
  './index.html',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      return cache.addAll(PRECACHE_URLS);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(
        keys.filter(function (key) { return key !== CACHE_NAME; })
            .map(function (key) { return caches.delete(key); })
      );
    })
  );
  self.clients.claim();
});

// Network-first strategy: புது Update எப்போவும் முதலில் Try பண்ணும்,
// Internet இல்லாட்டி மட்டும் Cache-ல் இருந்து Load ஆகும்.
self.addEventListener('fetch', function (event) {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    fetch(event.request)
      .then(function (response) {
        var responseClone = response.clone();
        caches.open(CACHE_NAME).then(function (cache) {
          cache.put(event.request, responseClone);
        });
        return response;
      })
      .catch(function () {
        return caches.match(event.request);
      })
  );
});
