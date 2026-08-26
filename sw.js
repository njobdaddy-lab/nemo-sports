const CACHE_NAME = 'nemo-sports-shell-v23';
const APP_SHELL = [
  './',
  './index.html',
  './style.css?v=070',
  './style076.css?v=076',
  './gameplay077.css?v=077',
  './portrait-face087.css?v=087',
  './intro088.css?v=089',
  './challenge079.css?v=079',
  './final-sprint084.css?v=084',
  './race-flow089.css?v=089',
  './result086.css?v=086',
  './medal090.css?v=090',
  './home-v2.css?v=2',
  './app083.js?v=083',
  './app100-loader.js?v=100',
  './input078.js?v=078',
  './challenge079.js?v=079',
  './final-sprint100.js?v=100',
  './portrait-face087.js?v=087',
  './intro088.js?v=089',
  './race-flow089.js?v=089',
  './result086.js?v=086',
  './medal090.js?v=090',
  './fullscreen.js?v=1',
  './pwa.js?v=2',
  './manifest.webmanifest',
  './assets/nemo-icon.svg',
  './assets/nemo-icon-maskable.svg'
];
self.addEventListener('install',(event)=>{event.waitUntil(caches.open(CACHE_NAME).then((cache)=>cache.addAll(APP_SHELL)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',(event)=>{event.waitUntil(caches.keys().then((keys)=>Promise.all(keys.filter((key)=>key!==CACHE_NAME).map((key)=>caches.delete(key)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',(event)=>{const request=event.request;if(request.method!=='GET')return;const url=new URL(request.url);if(url.origin!==self.location.origin)return;if(request.mode==='navigate'){event.respondWith(fetch(request).then((response)=>{const copy=response.clone();caches.open(CACHE_NAME).then((cache)=>cache.put('./index.html',copy));return response}).catch(()=>caches.match('./index.html')));return}event.respondWith(caches.match(request).then((cached)=>{const network=fetch(request).then((response)=>{if(response.ok){const copy=response.clone();caches.open(CACHE_NAME).then((cache)=>cache.put(request,copy))}return response}).catch(()=>cached);return cached||network}))});