// Service Worker — Le Jeu du 15
const CACHE = 'jeu15-v1';
const ASSETS = [
  '/Jeu-du-15/',
  '/Jeu-du-15/jeu-du-15-accessible.html',
  '/Jeu-du-15/manifest.json',
  '/Jeu-du-15/pwa-icons/icon-192.png',
  '/Jeu-du-15/pwa-icons/icon-512.png',
];

// Installation : mise en cache des ressources essentielles
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

// Activation : suppression des anciens caches
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch : cache-first pour les ressources locales, réseau pour JSONBin
self.addEventListener('fetch', e => {
  // Laisser passer les appels JSONBin (classement) sans mise en cache
  if (e.request.url.includes('jsonbin.io')) return;

  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(response => {
        // Mettre en cache les nouvelles ressources valides
        if (response && response.status === 200 && response.type === 'basic') {
          const clone = response.clone();
          caches.open(CACHE).then(cache => cache.put(e.request, clone));
        }
        return response;
      }).catch(() => caches.match('/Jeu-du-15/jeu-du-15-accessible.html'));
    })
  );
});
