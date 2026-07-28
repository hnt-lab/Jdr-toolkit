// La version est la source unique commune à l'interface et au cache hors-ligne.
// Un nouveau déploiement crée ainsi un nouveau cache et purge l'ancien à l'activation.
importScripts('./version.js');
const CACHE = 'mj-toolkit-shell-v' + APP_VERSION;
const FALLBACK = './index.html';

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    const response = await fetch(FALLBACK, { cache: 'reload' });
    const html = await response.clone().text();
    const assets = new Set(['./', FALLBACK, './manifest.json']);
    for (const match of html.matchAll(/<(?:script|link)\b[^>]*(?:src|href)=["']([^"'#?]+)["'][^>]*>/gi)) {
      const url = new URL(match[1], self.location.href);
      if (url.origin === self.location.origin) assets.add(url.pathname);
    }
    await Promise.all(Array.from(assets).map(async asset => {
      try {
        const assetResponse = await fetch(asset, { cache: 'reload' });
        if (assetResponse.ok) await cache.put(asset, assetResponse);
      } catch (error) {
        // Un module optionnel manquant ne doit pas empêcher l'installation du shell.
      }
    }));
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const names = await caches.keys();
    await Promise.all(names.filter(name => name !== CACHE).map(name => caches.delete(name)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  event.respondWith((async () => {
    const cached = await caches.match(event.request);
    if (cached) return cached;
    try {
      const response = await fetch(event.request);
      if (response && (response.ok || response.type === 'opaque')) {
        const cache = await caches.open(CACHE);
        await cache.put(event.request, response.clone());
      }
      return response;
    } catch (error) {
      if (event.request.mode === 'navigate') {
        const fallback = await caches.match(FALLBACK);
        if (fallback) return fallback;
      }
      throw error;
    }
  })());
});
