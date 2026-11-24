const CACHE='dismat-steel-scan-mvc-v8';
const ASSETS=['./','./index.html','./style.css','./app.js','./src/controllers/app-controller.mjs','./src/catalog/catalog-data.mjs','./src/catalog/catalog-model.mjs','./src/catalog/catalog-store.mjs','./src/catalog/catalog-view.mjs','./src/catalog/catalog-controller.mjs','./src/domain/reading.mjs','./src/domain/scan-model.mjs','./src/data/scan-repository.mjs','./src/services/backup-service.mjs','./src/views/html.mjs','./src/views/photo-canvas.mjs','./src/vision/vision-image.mjs','./src/vision/rib-assist.mjs','./src/views/training-photo.mjs','./src/services/training-sample.mjs','./src/views/archive-view.mjs','./src/views/pdf-view.mjs','./manifest.webmanifest','./assets/icon.svg'];
self.addEventListener('install',event=>{event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS)).then(()=>self.skipWaiting()));});
self.addEventListener('activate',event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith('dismat-steel-scan-')&&key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET'||new URL(event.request.url).origin!==self.location.origin)return;
  event.respondWith(fetch(event.request).then(response=>{if(response.ok){const copy=response.clone();caches.open(CACHE).then(cache=>cache.put(event.request,copy)).catch(()=>{});}return response;}).catch(()=>caches.match(event.request)));
});
