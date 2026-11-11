// Offline support for the recorder: the page, its icons and config.json are kept on the phone, so
// recording works without a connection (the word list is kept by the page itself, in IndexedDB). Each visit online fetches fresh copies first.
// Uploads (POST to Google) and other sites are never touched by this worker.
const SHELL = 'grabadora-2026-11-10.3';
self.addEventListener('install', e => e.waitUntil((async () => {
  const c = await caches.open(SHELL);
  const files = ['./', 'index.html', 'manifest.webmanifest', 'icon.svg', 'icon-192.png', 'icon-512.png', 'config.json'];
  await c.addAll(files.map(f => new Request(f, {cache: 'reload'})));
  await self.skipWaiting();
})()));
self.addEventListener('activate', e => e.waitUntil(caches.keys()
  .then(ks => Promise.all(ks.filter(k => k.startsWith('grabadora-') && k !== SHELL).map(k => caches.delete(k))))
  .then(() => self.clients.claim())));
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== location.origin) return;
  e.respondWith(fetch(e.request, {cache: 'no-store'})
    .then(r => { if (r.ok) { const k = r.clone(); caches.open(SHELL).then(c => c.put(e.request, k)); } return r; })
    .catch(() => caches.match(e.request, {ignoreSearch: true}).then(r => r || caches.match('./'))));
});
