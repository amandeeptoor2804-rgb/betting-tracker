// Service worker for GitHub Pages subfolder: /betting-tracker/
const ROOT = "/betting-tracker/";
const CACHE_NAME = "bet-tracker-v4";
const CORE_ASSETS = [
  ROOT,
  ROOT + "index.html",
  ROOT + "manifest.json"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(CORE_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => (key === CACHE_NAME ? null : caches.delete(key)))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // Only handle requests inside /betting-tracker/
  if (!url.pathname.startsWith(ROOT)) {
    return;
  }

  // Navigations: go online first, fall back to cached index.html
  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req).catch(() =>
        caches.match(ROOT + "index.html", { ignoreSearch: true })
      )
    );
    return;
  }

  // Other requests: cache-first, then network
  event.respondWith(
    caches.match(req).then((cached) => cached || fetch(req))
  );
});
