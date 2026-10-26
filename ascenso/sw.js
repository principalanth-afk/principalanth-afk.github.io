/* ASCENSO — service worker: funciona sin conexión tras la primera visita */
const CACHE = 'ascenso-v1';
const SHELL = ['./', 'index.html', 'manifest.json', 'css/styles.css', 'js/i18n.js', 'js/figure.js', 'js/motions.js', 'js/exercises.js', 'js/music.js', 'js/voice.js', 'js/planner.js', 'js/camera.js', 'js/app.js', 'icons/icon-192.png', 'icons/icon-512.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const req = e.request; if (req.method !== 'GET') return;
  const url = new URL(req.url);
  const runtime = url.origin === location.origin || /fonts\.(googleapis|gstatic)\.com|cdn\.jsdelivr\.net|storage\.googleapis\.com/.test(url.host);
  if (!runtime) return;
  e.respondWith(
    (url.origin === location.origin
      ? fetch(req).then(r => { const cp = r.clone(); caches.open(CACHE).then(c => c.put(req, cp)); return r; }).catch(() => caches.match(req))
      : caches.match(req).then(hit => hit || fetch(req).then(r => { if (r.ok || r.type === 'opaque') { const cp = r.clone(); caches.open(CACHE).then(c => c.put(req, cp)); } return r; })))
  );
});
