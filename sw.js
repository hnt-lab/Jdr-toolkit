// Version lue depuis la source unique version.js (changer le numéro là-bas seulement)
importScripts('./version.js');
const CACHE = 'boite-outils-v' + APP_VERSION;

// Fichiers à mettre en cache dès l'installation
const PRECACHE = [
  './',
  './index.html',
  './version.js',
  './css/main.css',
  './css/variables.css',
  './css/base.css',
  './css/layout.css',
  './css/components.css',
  './css/redesign.css',
  './css/design-system.css',
  './css/maquette.css',
  './js/firebase.js',
  './js/services/auth-service.js',
  './js/services/user-service.js',
  './js/services/character-service.js',
  './js/services/campaign-service.js',
  './js/ui/core.js',
  './js/ui/shell.js',
  './js/ui/tutorial.js',
  './js/ui/hud.js',
  './js/ui/auth.js',
  './js/ui/compendium-ui.js',
  './js/ui/compendium-editor.js',
  './js/ui/hub.js',
  './js/config.js',
  './js/compendium.js',
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
  './img/icon.svg',
  './img/icon-512.png',
  './img/logo.png',
  './img/bg-login.jpg'
];

// Domaines Firebase/Google : jamais interceptés
const BYPASS = ['firebase', 'googleapis', 'gstatic', 'firestore', 'google-analytics'];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      // fetch {cache:'reload'} → on précache des fichiers FRAIS (pas le cache HTTP du navigateur)
      .then(c => Promise.all(PRECACHE.map(u =>
        fetch(u, {cache:'reload'}).then(r => { if (r && r.ok) return c.put(u, r); }).catch(() => {})
      )))
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

  // CACHE D'ABORD (rapide, pas de course au chargement des scripts) → réseau si absent.
  // ⚠️ NE PAS passer le CODE en network-first : essayé en v0.9.78 → COURSE (auth Firebase résout
  // avant que les scripts séquentiels soient chargés → « loadMJCompLib is not defined » → page blanche).
  // Cache-first charge vite = pas de course. La fraîcheur vient du BUMP de version.js (nouveau nom de
  // cache → ancien supprimé à l'activate → précache frais) + overlay SW_UPDATED. Voir feedback-sw-version.
  e.respondWith(
    caches.match(e.request).then(hit => hit || fetch(e.request).then(r => {
      if (r && r.ok) { const clone = r.clone(); caches.open(CACHE).then(c => c.put(e.request, clone)); }
      return r;
    }).catch(() => hit))
  );
});
