/* CAVA — guarda la app en el teléfono para que abra sin internet */
const CACHE = 'cava-v4';
const ARCHIVOS = ['./', './index.html', './manifest.json', './icon-192.png', './icon-512.png', './icon-maskable.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ARCHIVOS))
    .then(() => self.skipWaiting()).catch(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

function guardarCopia(req, resp) {
  const copia = resp.clone();
  caches.open(CACHE).then(c => c.put(req, copia)).catch(() => { });
  return resp;
}

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  if (url.origin !== location.origin) return;      // las tasas siempre van a la red

  // la app misma: primero la red, para que las mejoras lleguen solas al abrirla con señal
  if (e.request.mode === 'navigate' || url.pathname === '/' || url.pathname.endsWith('.html')) {
    e.respondWith(
      fetch(e.request)
        .then(resp => guardarCopia(e.request, resp))
        .catch(() => caches.match(e.request).then(r => r || caches.match('./index.html')))
    );
    return;
  }

  // íconos y demás: primero lo guardado
  e.respondWith(
    caches.match(e.request).then(hit => hit ||
      fetch(e.request).then(resp => guardarCopia(e.request, resp)).catch(() => caches.match('./index.html')))
  );
});
