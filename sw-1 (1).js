/* پرو چت - Service Worker (نسخه 1.3.1)
   شبکه اول: همیشه نسخه‌ی تازه را می‌گیرد؛ فقط اگر آفلاین بود از کش می‌خواند.
   version.json هرگز کش نمی‌شود تا بنر بروزرسانی همیشه درست کار کند. */
const V = 'prochat-1.3.1';
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil((async () => {
  for (const k of await caches.keys()) if (k !== V) await caches.delete(k);
  await self.clients.claim();
})()));
self.addEventListener('fetch', e => {
  const r = e.request, u = new URL(r.url);
  if (r.method !== 'GET' || u.origin !== location.origin || u.pathname.endsWith('version.json')) return;
  e.respondWith(fetch(r, { cache: 'no-store' }).then(res => {
    if (res.ok) { const c = res.clone(); caches.open(V).then(ch => ch.put(r, c)); }
    return res;
  }).catch(() => caches.match(r)));
});
