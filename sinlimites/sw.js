// Service worker de Sin Límites: solo toca SUS cachés (CAVA vive en el mismo dominio)
const CACHE = 'sinlimites-v10';
const ASSETS = ['./', './index.html', './sl-manifest.webmanifest', './sl-icon-192.png', './sl-icon-512.png', './sl-icon-maskable-512.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k.startsWith('sinlimites-') && k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || !req.url.startsWith(self.registration.scope)) return;
  const url = new URL(req.url);
  const esDoc = req.mode === 'navigate' || req.destination === 'document';
  const esDato = url.pathname.includes('/data/');
  if (esDoc || esDato) {
    // red primero: la app y los datos del plan llegan frescos cuando hay señal; sin señal, la última copia
    const clave = esDoc ? './index.html' : url.pathname;
    e.respondWith(fetch(req).then(r => { if (r.ok) { const cp = r.clone(); caches.open(CACHE).then(c => c.put(clave, cp)); } return r; })
      .catch(() => caches.match(clave, {ignoreSearch: true})));
  } else {
    e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(r => { const cp = r.clone(); caches.open(CACHE).then(c => c.put(req, cp)); return r; })));
  }
});
