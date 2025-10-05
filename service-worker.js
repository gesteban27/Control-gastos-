const CACHE_NAME = "gastos-cache-v3"; // cambia el número en cada actualización
const FILES_TO_CACHE = [
  "index.html",
  "manifest.json",
  "icon.png"
];

// Instalar SW y guardar en caché
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(FILES_TO_CACHE);
    })
  );
  self.skipWaiting(); // fuerza que se active la nueva versión sin esperar
});

// Activar SW y borrar cachés viejos
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(
        keyList.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Estrategia: siempre intentar red desde internet primero
self.addEventListener("fetch", (event) => {
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Si va bien la red, actualiza la caché
        const clone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        return response;
      })
      .catch(() => caches.match(event.request)) // si no hay red, usa caché
  );
});
