const CACHE = 'boite-outils-v0.8.0';

// Fichiers à mettre en cache dès l'installation
const PRECACHE = [
  './',
  './index.html',
  './css/main.css',
  './css/variables.css',
  './css/base.css',
  './css/layout.css',
  './css/components.css',
  './js/firebase.js',
  './js/services/auth-service.js',
  './js/services/user-service.js',
  './js/services/character-service.js',
  './js/services/campaign-service.js',
  './js/ui/core.js',
  './js/ui/tutorial.js',
  './js/ui/hud.js',
  './js/ui/auth.js',
  './js/ui/hub.js',
  './js/config.js',
  './js/state.js',
  './js/player/index.js',
  './js/player/perso.js',
  './js/player/competences.js',
  './js/player/classes/barbare.js',
  './js/player/classes/moine.js',
  './js/player/classes/barde.js',
  './js/player/classes/roublard.js',
  './js/player/classes/guerrier.js',
  './js/player/classes/paladin.js',
  './js/player/classes/clerc.js',
  './js/player/classes/artificier.js',
  './js/player/classes/druide.js',
  './js/player/classes/ensorceleur.js',
  './js/player/classes/occultiste.js',
  './js/player/classes/magicien.js',
  './js/player/classes/rodeur.js',
  './js/player/combat.js',
  './js/player/sorts.js',
  './js/player/equipement.js',
  './js/player/sac.js',
  './js/player/journal.js',
  './js/player/xp.js',
  './js/mj/index.js',
  './js/mj/joueurs.js',
  './js/mj/combat.js',
  './js/mj/pnj.js',
  './js/mj/objets.js',
  './js/mj/journal.js',
  './js/mj/regles.js',
  './manifest.json',
  './icon.svg',
  './bg-login.png'
];

// Domaines Firebase/Google : jamais interceptés
const BYPASS = ['firebase', 'googleapis', 'gstatic', 'firestore', 'google-analytics'];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => c.addAll(PRECACHE))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
      .then(() => self.clients.matchAll({type:'window'}))
      .then(clients => clients.forEach(c => c.postMessage({type:'SW_UPDATED'})))
  );
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);

  // Laisser passer toutes les requêtes Firebase/Google directement au réseau
  if (BYPASS.some(d => url.hostname.includes(d))) return;

  // Compendiums JSON : network-first, fallback cache (gros fichiers mis en cache au premier chargement)
  if (url.pathname.endsWith('.json')) {
    e.respondWith(
      fetch(e.request)
        .then(r => {
          const clone = r.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
          return r;
        })
        .catch(() => caches.match(e.request))
    );
    return;
  }

  // Tout le reste : cache-first, fallback réseau
  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(r => {
        const clone = r.clone();
        caches.open(CACHE).then(c => c.put(e.request, clone));
        return r;
      });
    })
  );
});
