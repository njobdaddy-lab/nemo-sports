const CACHE_NAME = 'nemo-sports-shell-v13';
const APP_SHELL = [
  './',
  './index.html',
  './style.css?v=070',
  './style076.css?v=076',
  './gameplay077.css?v=077',
  './challenge079.css?v=079',
  './home-v2.css?v=2',
  './app077.js?v=077',
  './app082.js?v=082',
  './input078.js?v=078',
  './challenge079.js?v=079',
  './fullscreen.js?v=1',
  './pwa.js?v=2',
  './manifest.webmanifest',
  './assets/nemo-icon.svg',
  './assets/nemo-icon-maskable.svg'
];
self.addEventListener('install',(event)=>{event.waitUntil(caches.open(CACHE_NAME).then((cache)=>cache.addAll(APP_SHELL)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',(event)=>{event.waitUntil(caches.keys().then((keys)=>Promise.all(keys.filter((key)=>key!==CACHE_NAME).map((key)=>caches.delete(key)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',(event)=>{const request=event.request;if(request.method!=='GET')return;const url=new URL(request.url);if(url.origin!==self.location.origin)return;if(request.mode==='navigate'){event.respondWith(fetch(request).then((response)=>{const copy=response.clone();caches.open(CACHE_NAME).then((cache)=>cache.put('./index.html',copy));return response}).catch(()=>caches.match('./index.html')));return}event.respondWith(caches.match(request).then((cached)=>{const network=fetch(request).then((response)=>{if(response.ok){const copy=response.clone();caches.open(CACHE_NAME).then((cache)=>cache.put(request,copy))}return response}).catch(()=>cached);return cached||network}))});