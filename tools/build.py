import re,os,json,shutil
from PIL import Image,ImageDraw
D='/home/claude/tikrar-app'
shutil.rmtree(D,ignore_errors=True);os.makedirs(D+'/fonts');os.makedirs(D+'/icons')
src=open('/home/claude/tikrar.html').read()
title=re.search(r'<title>.*?</title>',src).group(0)
body=src.replace(title,'')
body=re.sub(r'<meta name="claude:viewport-fit-sides"[^>]*>\n?','',body)
body=re.sub(r'<link rel="(preconnect|stylesheet)"[^>]*>\n?','',body)
F='/tmp/claude-0/fonts'
fonts=[('Reem Kufi','reem-kufi-latin-%s-normal.woff2','x_fontsource-reem-kufi-5.3.0',[500,600,700],None),
       ('IBM Plex Sans','ibm-plex-sans-latin-%s-normal.woff2','x_fontsource-ibm-plex-sans-5.3.0',[400,500,600],None),
       ('Amiri','amiri-arabic-%s-normal.woff2','x_fontsource-amiri-5.3.0',[700],'U+0600-06FF,U+0750-077F,U+FB50-FDFF,U+FE70-FEFF')]
ff=[]
for fam,pat,pkg,ws,ur in fonts:
  for w in ws:
    fn=pat%w;shutil.copy(f'{F}/{pkg}/files/{fn}',f'{D}/fonts/{fn}')
    ff.append(f"@font-face{{font-family:'{fam}';font-style:normal;font-weight:{w};font-display:swap;src:url(fonts/{fn}) format('woff2');{('unicode-range:'+ur+';') if ur else ''}}}")
head=f'''<!doctype html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
{title}
<meta name="theme-color" content="#F2F5F2" media="(prefers-color-scheme: light)">
<meta name="theme-color" content="#0E1412" media="(prefers-color-scheme: dark)">
<link rel="manifest" href="manifest.webmanifest">
<link rel="icon" href="icons/icon-192.png">
<link rel="apple-touch-icon" href="icons/apple-touch-icon.png">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-title" content="Tikrar">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<style>{''.join(ff)}
:root{{color-scheme:light;padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}}body{{margin:0;font:14px system-ui,-apple-system,sans-serif;-webkit-tap-highlight-color:transparent}}img{{max-width:100%}}[hidden]{{display:none!important}}</style>
</head><body>
'''
tail='''<script>
if('serviceWorker' in navigator){window.addEventListener('load',()=>{navigator.serviceWorker.register('sw.js').catch(()=>{})})}
try{navigator.storage&&navigator.storage.persist&&navigator.storage.persist()}catch(e){}
</script>
</body></html>'''
import re as _re
m=_re.search(r'<script>(.*)</script>',body,_re.S)
appjs=m.group(1)+"\nif('serviceWorker' in navigator){window.addEventListener('load',()=>{navigator.serviceWorker.register('sw.js').catch(()=>{})})}\ntry{navigator.storage&&navigator.storage.persist&&navigator.storage.persist()}catch(e){}\n"
open(D+'/app.js','w').write(appjs)
body=body[:m.start()]+'<script src="app.js"></script>'+body[m.end():]
tail='</body></html>'
csp='<meta http-equiv="Content-Security-Policy" content="default-src \'self\'; script-src \'self\'; style-src \'self\' \'unsafe-inline\'; img-src \'self\' data: blob:; font-src \'self\'; connect-src \'self\'; manifest-src \'self\'; worker-src \'self\'; frame-src \'none\'">'
head=head.replace('<meta charset="utf-8">','<meta charset="utf-8">\n'+csp)
open(D+'/index.html','w').write(head+body+tail)
files=['./','index.html','app.js','manifest.webmanifest','icons/icon-192.png','icons/icon-512.png','icons/icon-maskable-512.png','icons/apple-touch-icon.png']+['fonts/'+f for f in sorted(os.listdir(D+'/fonts'))]
sw='''const CACHE='tikrar-v21';
const FILES=%s;
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET'||new URL(e.request.url).origin!==location.origin)return;
  e.respondWith(caches.open(CACHE).then(async c=>{
    const hit=await c.match(e.request,{ignoreSearch:true})||(e.request.mode==='navigate'?await c.match('index.html'):null);
    const net=fetch(e.request).then(r=>{if(r&&r.ok)c.put(e.request,r.clone());return r}).catch(()=>null);
    return hit||(await net)||new Response('Offline',{status:503});
  }));
});
'''%json.dumps(files)
open(D+'/sw.js','w').write(sw)
man={"name":"Tikrar Hifz Tracker","short_name":"Tikrar","description":"Daily Quran memorization tracker following the Tikrar method.","start_url":"./","scope":"./","display":"standalone","orientation":"portrait","background_color":"#0E1412","theme_color":"#1D5A46","shortcuts":[{"name":"Memorize","short_name":"Memorize","url":"./#memorize","icons":[{"src":"icons/icon-192.png","sizes":"192x192"}]},{"name":"Connection","short_name":"Connection","url":"./#connection","icons":[{"src":"icons/icon-192.png","sizes":"192x192"}]},{"name":"Revision","short_name":"Revision","url":"./#revision","icons":[{"src":"icons/icon-192.png","sizes":"192x192"}]}],
 "icons":[{"src":"icons/icon-192.png","sizes":"192x192","type":"image/png","purpose":"any"},{"src":"icons/icon-512.png","sizes":"512x512","type":"image/png","purpose":"any"},{"src":"icons/icon-maskable-512.png","sizes":"512x512","type":"image/png","purpose":"maskable"}]}
open(D+'/manifest.webmanifest','w').write(json.dumps(man,indent=2))
# icons: eight-pointed star on green
import math
def icon(size,scale,rounded):
  S=size*4;im=Image.new('RGBA',(S,S),(0,0,0,0));d=ImageDraw.Draw(im)
  green=(29,90,70,255);gold=(216,175,92,255)
  if rounded:d.rounded_rectangle([0,0,S-1,S-1],radius=int(S*0.22),fill=green)
  else:d.rectangle([0,0,S,S],fill=green)
  c=S/2;r=S*scale/2
  for rot in (0,45):
    pts=[(c+r*math.cos(math.radians(rot+45+90*i)),c+r*math.sin(math.radians(rot+45+90*i))) for i in range(4)]
    d.polygon(pts,fill=gold)
  d.ellipse([c-r*0.42,c-r*0.42,c+r*0.42,c+r*0.42],fill=green)
  d.ellipse([c-r*0.2,c-r*0.2,c+r*0.2,c+r*0.2],fill=gold)
  return im.resize((size,size),Image.LANCZOS)
icon(192,0.62,True).save(D+'/icons/icon-192.png')
icon(512,0.62,True).save(D+'/icons/icon-512.png')
icon(512,0.5,False).save(D+'/icons/icon-maskable-512.png')
icon(180,0.6,False).convert('RGB').save(D+'/icons/apple-touch-icon.png')
open(D+'/README.txt','w').write('''Tikrar Hifz Tracker - installable app

PUT IT ONLINE (one time, free)
Option A - Netlify (easiest)
 1. Go to app.netlify.com/drop and sign up for a free account.
 2. Drag this whole "tikrar-app" folder onto the page.
 3. You get a link like https://something.netlify.app - open it on your phone.

Option B - GitHub Pages
 1. Create a free GitHub account and a new public repository.
 2. Upload everything inside this folder (Add file > Upload files).
 3. Settings > Pages > Deploy from branch > main > / (root) > Save.
 4. After a minute your link is https://YOURNAME.github.io/REPO/

INSTALL ON YOUR PHONE
 iPhone: open the link in Safari > Share > Add to Home Screen.
 Android: open the link in Chrome > menu (three dots) > Install app (or Add to Home screen).

YOUR DATA
 Progress is saved on the device. Use Settings > Backup > Save a backup
 now and then, and Restore from backup to move progress between devices.
''')
print('built',sorted(os.listdir(D)))
