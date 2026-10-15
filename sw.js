/* سرویس‌ورکر: بعد از اولین لود موفق، کتابخانه‌ی فایربیس و صفحه از حافظه‌ی گوشی بالا میاد */
const V = 'prochat-v1';
const SDK = /^https:\/\/(www\.gstatic\.com\/firebasejs\/|cdn\.jsdelivr\.net\/npm\/)/;

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));

self.addEventListener('fetch', e => {
  const r = e.request;
  if (r.method !== 'GET') return;
  const u = new URL(r.url);
  if (u.pathname.endsWith('version.json')) return; // همیشه از شبکه (برای چک آپدیت)

  // کتابخانه‌ها: اول حافظه، بعد شبکه
  if (SDK.test(r.url)) {
    e.respondWith((async () => {
      const c = await caches.open(V), hit = await c.match(r);
      if (hit) return hit;
      const res = await fetch(r);
      if (res.ok) c.put(r, res.clone());
      return res;
    })());
    return;
  }

  // خود صفحه: اول شبکه (تا آپدیت‌ها بیان)، اگه ۶ ثانیه طول کشید یا قطع بود از حافظه
  if (u.origin === location.origin && (r.mode === 'navigate' || u.pathname.endsWith('.html') || u.pathname.endsWith('/'))) {
    e.respondWith((async () => {
      const c = await caches.open(V);
      const net = fetch(r).then(res => { if (res.ok) c.put(r, res.clone()); return res; });
      const first = await Promise.race([net.catch(() => null), new Promise(ok => setTimeout(() => ok(null), 6000))]);
      if (first) return first;
      const hit = await c.match(r, { ignoreSearch: true });
      return hit || net;
    })());
  }
});
