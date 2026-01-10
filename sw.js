// sw.js
const CACHE_NAME = 'sq-v300-cache-v2';
const urlsToCache = [
  './',
  './index.html',
  './css/style300.css'
  // 如果有多個 JS 檔，建議也列在這裡，或者保持這樣最簡化即可
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});