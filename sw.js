const CACHE='tikrar-v32';
const FILES=["./", "index.html", "app.js", "manifest.webmanifest", "icons/icon-192.png", "icons/icon-512.png", "icons/icon-maskable-512.png", "icons/apple-touch-icon.png", "fonts/amiri-arabic-700-normal.woff2", "fonts/ibm-plex-sans-latin-400-normal.woff2", "fonts/ibm-plex-sans-latin-500-normal.woff2", "fonts/ibm-plex-sans-latin-600-normal.woff2", "fonts/reem-kufi-latin-500-normal.woff2", "fonts/reem-kufi-latin-600-normal.woff2", "fonts/reem-kufi-latin-700-normal.woff2"];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE&&k!=='tikrar-mushaf').map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  const U=new URL(e.request.url);
  if(e.request.method==='GET'&&(U.host==='api.quran.com'||U.host==='verses.quran.foundation')){e.respondWith(caches.open('tikrar-mushaf').then(async c=>{const hit=await c.match(e.request);if(hit)return hit;const r=await fetch(e.request);if(r&&r.ok)c.put(e.request,r.clone());return r}));return}
  if(e.request.method!=='GET'||new URL(e.request.url).origin!==location.origin)return;
  e.respondWith(caches.open(CACHE).then(async c=>{
    const hit=await c.match(e.request,{ignoreSearch:true})||(e.request.mode==='navigate'?await c.match('index.html'):null);
    const net=fetch(e.request).then(r=>{if(r&&r.ok)c.put(e.request,r.clone());return r}).catch(()=>null);
    return hit||(await net)||new Response('Offline',{status:503});
  }));
});
