const cacheName = "doubao-responses-test-key-v14";
const assets = ["/styles.css?v=star14", "/app.js?v=star14", "/manifest.webmanifest", "/icon.svg"];

self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(caches.open(cacheName).then((cache) => cache.addAll(assets)));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    Promise.all([
      caches.keys().then((keys) =>
        Promise.all(keys.filter((key) => key !== cacheName).map((key) => caches.delete(key))),
      ),
      self.clients.claim(),
    ]),
  );
});

self.addEventListener("message", (event) => {
  if (event.data?.type === "CLEAR_APP_CACHE") {
    event.waitUntil(
      caches.keys().then((keys) => Promise.all(keys.map((key) => caches.delete(key)))),
    );
  }
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET" || event.request.url.includes("/api/")) {
    return;
  }

  if (event.request.mode === "navigate" || event.request.url.endsWith("/index.html")) {
    event.respondWith(fetch(event.request).catch(() => caches.match("/index.html")));
    return;
  }

  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request)),
  );
});
