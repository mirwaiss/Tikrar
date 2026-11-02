import os,shutil,json,subprocess,sys
REPO='/home/claude/tikrar'
PWA='/home/claude/tikrar-app'
AWWW='/home/claude/tikrar-android/app/src/main/assets/www'
for name in os.listdir(REPO):
    if name=='.git':continue
    p=os.path.join(REPO,name);shutil.rmtree(p) if os.path.isdir(p) else os.remove(p)
for name in os.listdir(PWA):
    if name=='README.txt':continue
    s=os.path.join(PWA,name);d=os.path.join(REPO,name)
    shutil.copytree(s,d) if os.path.isdir(s) else shutil.copy(s,d)
os.makedirs(REPO+'/android-www')
for f in ['index.html','app.js','version.json']:shutil.copy(f'{AWWW}/{f}',f'{REPO}/android-www/{f}')
os.makedirs(REPO+'/src');shutil.copy('/home/claude/tikrar.html',REPO+'/src/tikrar.html')
os.makedirs(REPO+'/tools')
for f in ['build.py','build_android.py','publish.py']:shutil.copy('/tmp/claude-0/build/'+f,REPO+'/tools/'+f)
open(REPO+'/.nojekyll','w').write('')
open(REPO+'/.gitignore','w').write('*.keystore\nlocal.properties\nbuild/\n')
v=json.load(open(REPO+'/android-www/version.json'))['version']
open(REPO+'/README.md','w').write(f'''# Tikrar Hifz Tracker

Quran memorization tracker following the Tikrar method (memorization, connection, revision).

- `index.html`, `app.js`, `sw.js`, fonts and icons: the installable web app (GitHub Pages).
- `android-www/`: the app code the Android app downloads to update itself. Current version: {v}.
- `src/tikrar.html`: the single-file source.
- `tools/`: build scripts for the web app and the Android APK.

The Android signing key is not stored here.
''')
print('assembled, web version',v)
