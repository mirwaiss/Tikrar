import os,shutil,re,json,subprocess
from PIL import Image,ImageDraw
import math
R='/home/claude/tikrar-android'
WEB='/home/claude/tikrar-app'
os.makedirs(R,exist_ok=True)
def w(path,txt):
    p=os.path.join(R,path);os.makedirs(os.path.dirname(p),exist_ok=True);open(p,'w').write(txt)
VERSION=int(open(R+'/.version').read()) if os.path.exists(R+'/.version') else 1
w('settings.gradle','''pluginManagement { repositories { google(); mavenCentral(); gradlePluginPortal() } }
dependencyResolutionManagement { repositories { google(); mavenCentral() } }
rootProject.name = "Tikrar"
include ':app'
''')
w('build.gradle',"plugins { id 'com.android.application' version '8.5.2' apply false }\n")
w('gradle.properties','org.gradle.jvmargs=-Xmx2g\nandroid.nonTransitiveRClass=true\n')
w('app/build.gradle','''plugins { id 'com.android.application' }
android {
    namespace 'com.tikrar.tracker'
    compileSdk 34
    defaultConfig {
        applicationId 'com.tikrar.tracker'
        minSdk 26
        targetSdk 34
        versionCode %d
        versionName '1.0.%d'
    }
    signingConfigs {
        tikrar {
            storeFile file('tikrar.keystore')
            storePassword 'tikrar-hifz'
            keyAlias 'tikrar'
            keyPassword 'tikrar-hifz'
        }
    }
    buildTypes {
        release { minifyEnabled false; signingConfig signingConfigs.tikrar }
        debug { signingConfig signingConfigs.tikrar }
    }
    compileOptions { sourceCompatibility JavaVersion.VERSION_17; targetCompatibility JavaVersion.VERSION_17 }
}
'''%(VERSION,VERSION))
w('app/src/main/AndroidManifest.xml','''<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android">
    <uses-permission android:name="android.permission.INTERNET" />
    <application
        android:label="Tikrar"
        android:icon="@mipmap/ic_launcher"
        android:roundIcon="@mipmap/ic_launcher"
        android:allowBackup="true"
        android:theme="@style/AppTheme">
        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:launchMode="singleTask"
            android:configChanges="orientation|screenSize|screenLayout|keyboardHidden|uiMode"
            android:windowSoftInputMode="adjustResize">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
        <receiver android:name=".TikrarWidget" android:exported="false">
            <intent-filter>
                <action android:name="android.appwidget.action.APPWIDGET_UPDATE" />
            </intent-filter>
            <meta-data android:name="android.appwidget.provider" android:resource="@xml/tikrar_widget" />
        </receiver>
    </application>
</manifest>
''')
w('app/src/main/res/values/themes.xml','''<resources>
    <style name="AppTheme" parent="android:Theme.Material.Light.NoActionBar">
        <item name="android:windowBackground">@color/bg</item>
        <item name="android:statusBarColor">@color/bg</item>
        <item name="android:navigationBarColor">@color/bg</item>
        <item name="android:windowLightStatusBar">true</item>
        <item name="android:windowLightNavigationBar">true</item>
    </style>
</resources>
''')
w('app/src/main/res/values-night/themes.xml','''<resources>
    <style name="AppTheme" parent="android:Theme.Material.NoActionBar">
        <item name="android:windowBackground">@color/bg</item>
        <item name="android:statusBarColor">@color/bg</item>
        <item name="android:navigationBarColor">@color/bg</item>
        <item name="android:windowLightStatusBar">false</item>
        <item name="android:windowLightNavigationBar">false</item>
    </style>
</resources>
''')
w('app/src/main/res/values/colors.xml','<resources>\n<color name="bg">#F2F5F2</color>\n<color name="icon_bg">#1D5A46</color>\n</resources>\n')
w('app/src/main/res/values-night/colors.xml','<resources>\n<color name="bg">#0E1412</color>\n</resources>\n')
w('app/src/main/res/values/strings.xml','<resources>\n<string name="widget_desc">New page, yesterday, connection and revision for today at a glance.</string>\n</resources>\n')
w('app/src/main/res/xml/tikrar_widget.xml','''<?xml version="1.0" encoding="utf-8"?>
<appwidget-provider xmlns:android="http://schemas.android.com/apk/res/android"
    android:minWidth="250dp"
    android:minHeight="110dp"
    android:targetCellWidth="4"
    android:targetCellHeight="2"
    android:minResizeWidth="180dp"
    android:minResizeHeight="100dp"
    android:resizeMode="horizontal|vertical"
    android:updatePeriodMillis="1800000"
    android:initialLayout="@layout/widget"
    android:previewLayout="@layout/widget"
    android:description="@string/widget_desc"
    android:widgetCategory="home_screen" />
''')
w('app/src/main/res/drawable/widget_bg.xml','''<?xml version="1.0" encoding="utf-8"?>
<shape xmlns:android="http://schemas.android.com/apk/res/android" android:shape="rectangle">
    <solid android:color="#16211C" />
    <corners android:radius="22dp" />
</shape>
''')
rows=''.join(f'''
        <TextView android:id="@+id/w_r{i}" android:layout_width="match_parent" android:layout_height="wrap_content"
            android:paddingTop="5dp" android:paddingBottom="5dp"
            android:textSize="14sp" android:textColor="#E4ECE7" android:maxLines="1" android:ellipsize="end"
            android:text="○  {lbl}" />''' for i,lbl in enumerate(['New page','Yesterday','Connection','Revision']))
w('app/src/main/res/layout/widget.xml',f'''<?xml version="1.0" encoding="utf-8"?>
<LinearLayout xmlns:android="http://schemas.android.com/apk/res/android"
    android:id="@+id/w_root"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    android:orientation="horizontal"
    android:background="@drawable/widget_bg"
    android:padding="14dp">
    <LinearLayout android:id="@+id/w_left" android:layout_width="0dp" android:layout_height="match_parent" android:layout_weight="1.05"
        android:orientation="vertical" android:gravity="center_vertical">
        <TextView android:id="@+id/w_label" android:layout_width="wrap_content" android:layout_height="wrap_content"
            android:text="TODAY" android:textSize="11sp" android:textStyle="bold" android:letterSpacing="0.1" android:textColor="#D8AF5C" />
        <TextView android:id="@+id/w_page" android:layout_width="match_parent" android:layout_height="40dp"
            android:text="Tikrar" android:textStyle="bold" android:textColor="#FFFFFF" android:maxLines="1" android:gravity="center_vertical"
            android:autoSizeTextType="uniform" android:autoSizeMinTextSize="16sp" android:autoSizeMaxTextSize="30sp" android:autoSizeStepGranularity="1sp" />
        <TextView android:id="@+id/w_sub" android:layout_width="wrap_content" android:layout_height="wrap_content"
            android:text="Open the app to load today" android:textSize="12sp" android:textColor="#93A39A" android:maxLines="2" android:ellipsize="end" />
        <TextView android:id="@+id/w_weak" android:layout_width="wrap_content" android:layout_height="wrap_content"
            android:text="" android:textSize="11sp" android:textColor="#D8AF5C" android:visibility="gone" android:layout_marginTop="4dp" />
    </LinearLayout>
    <LinearLayout android:id="@+id/w_rows" android:layout_width="0dp" android:layout_height="match_parent" android:layout_weight="1"
        android:orientation="vertical" android:gravity="center_vertical" android:layout_marginStart="10dp">{rows}
    </LinearLayout>
</LinearLayout>
''')
w('app/src/main/res/mipmap-anydpi-v26/ic_launcher.xml','''<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
    <background android:drawable="@color/icon_bg" />
    <foreground android:drawable="@mipmap/ic_launcher_fg" />
    <monochrome android:drawable="@mipmap/ic_launcher_fg" />
</adaptive-icon>
''')
def star(size,scale,bg,rounded=False):
    S=size*4;im=Image.new('RGBA',(S,S),(0,0,0,0));d=ImageDraw.Draw(im)
    green=(29,90,70,255);gold=(216,175,92,255)
    if bg: d.rectangle([0,0,S,S],fill=green)
    c=S/2;r=S*scale/2
    for rot in (0,45):
        d.polygon([(c+r*math.cos(math.radians(rot+45+90*i)),c+r*math.sin(math.radians(rot+45+90*i))) for i in range(4)],fill=gold)
    hole=(29,90,70,255) if bg else (0,0,0,0)
    d.ellipse([c-r*0.42,c-r*0.42,c+r*0.42,c+r*0.42],fill=hole)
    d.ellipse([c-r*0.2,c-r*0.2,c+r*0.2,c+r*0.2],fill=gold)
    return im.resize((size,size),Image.LANCZOS)
for dens,px in [('mdpi',48),('hdpi',72),('xhdpi',96),('xxhdpi',144),('xxxhdpi',192)]:
    os.makedirs(f'{R}/app/src/main/res/mipmap-{dens}',exist_ok=True)
    star(px,0.62,True).save(f'{R}/app/src/main/res/mipmap-{dens}/ic_launcher.png')
    fg=px*108//48
    star(fg,0.40,False).save(f'{R}/app/src/main/res/mipmap-{dens}/ic_launcher_fg.png')
J='app/src/main/java/com/tikrar/tracker/'
w(J+'MainActivity.java',r'''package com.tikrar.tracker;

import android.app.Activity;
import android.content.Intent;
import android.content.res.Configuration;
import android.graphics.Color;
import android.net.Uri;
import android.os.Bundle;
import android.webkit.JavascriptInterface;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Toast;

import java.io.BufferedReader;
import java.io.ByteArrayInputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import org.json.JSONArray;
import org.json.JSONObject;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;

public class MainActivity extends Activity {
    static final String HOST = "tikrar.local";
    static final String ORIGIN = "https://" + HOST + "/";
    static final int REQ_OPEN = 1, REQ_SAVE = 2;
    static final String UPDATE_BASE = "https://raw.githubusercontent.com/mirwaiss/Tikrar/main/android-www/";
    volatile boolean checking = false;
    WebView web;
    ValueCallback<Uri[]> fileCallback;
    String pendingSave;
    boolean loaded = false;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        boolean night = (getResources().getConfiguration().uiMode & Configuration.UI_MODE_NIGHT_MASK) == Configuration.UI_MODE_NIGHT_YES;
        web = new WebView(this);
        web.setBackgroundColor(Color.parseColor(night ? "#0E1412" : "#F2F5F2"));
        setContentView(web);
        WebSettings s = web.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setAllowFileAccess(false);
        s.setTextZoom(100);
        web.addJavascriptInterface(new Bridge(), "AndroidBridge");
        web.setWebViewClient(new WebViewClient() {
            @Override
            public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest request) {
                Uri u = request.getUrl();
                if (!HOST.equals(u.getHost())) return null;
                String path = u.getPath();
                if (path == null || path.equals("/") || path.isEmpty()) path = "/index.html";
                try {
                    File local = new File(getFilesDir(), "www" + path);
                    InputStream in = local.isFile() ? new FileInputStream(local) : getAssets().open("www" + path);
                    String mime = mimeFor(path);
                    boolean text = mime.startsWith("text/") || mime.contains("javascript") || mime.contains("json");
                    HashMap<String, String> headers = new HashMap<>();
                    headers.put("Cache-Control", "no-cache");
                    return new WebResourceResponse(mime, text ? "utf-8" : null, 200, "OK", headers, in);
                } catch (IOException e) {
                    return new WebResourceResponse("text/plain", "utf-8", 404, "Not Found", new HashMap<>(), new ByteArrayInputStream(new byte[0]));
                }
            }

            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                Uri u = request.getUrl();
                if (HOST.equals(u.getHost())) return false;
                try { startActivity(new Intent(Intent.ACTION_VIEW, u)); } catch (Exception ignored) { }
                return true;
            }

            @Override
            public void onPageFinished(WebView view, String url) { loaded = true; }
        });
        web.setWebChromeClient(new WebChromeClient() {
            @Override
            public boolean onShowFileChooser(WebView view, ValueCallback<Uri[]> callback, FileChooserParams params) {
                if (fileCallback != null) fileCallback.onReceiveValue(null);
                fileCallback = callback;
                Intent i = new Intent(Intent.ACTION_GET_CONTENT);
                i.addCategory(Intent.CATEGORY_OPENABLE);
                i.setType("*/*");
                try { startActivityForResult(i, REQ_OPEN); } catch (Exception e) { fileCallback = null; return false; }
                return true;
            }
        });
        applyStaged();
        String tab = getIntent() != null ? getIntent().getStringExtra("tab") : null;
        web.loadUrl(ORIGIN + "index.html" + (tab != null ? "#" + tab : ""));
    }

    int bundledVersion() {
        try (InputStream in = getAssets().open("www/version.json")) { return new JSONObject(readAll(in)).optInt("version", 0); } catch (Exception e) { return 0; }
    }

    int localVersion() {
        File f = new File(getFilesDir(), "www/version.json");
        if (!f.isFile()) return 0;
        try (InputStream in = new FileInputStream(f)) { return new JSONObject(readAll(in)).optInt("version", 0); } catch (Exception e) { return 0; }
    }

    static String readAll(InputStream in) throws Exception {
        StringBuilder sb = new StringBuilder();
        BufferedReader r = new BufferedReader(new InputStreamReader(in, StandardCharsets.UTF_8));
        String line;
        while ((line = r.readLine()) != null) sb.append(line).append('\n');
        return sb.toString();
    }

    static byte[] download(String url) throws Exception {
        HttpURLConnection c = (HttpURLConnection) new URL(url).openConnection();
        c.setConnectTimeout(8000);
        c.setReadTimeout(15000);
        c.setUseCaches(false);
        try {
            if (c.getResponseCode() != 200) throw new Exception("HTTP " + c.getResponseCode());
            try (InputStream in = c.getInputStream()) {
                java.io.ByteArrayOutputStream out = new java.io.ByteArrayOutputStream();
                byte[] buf = new byte[16384];
                int n;
                while ((n = in.read(buf)) > 0) out.write(buf, 0, n);
                return out.toByteArray();
            }
        } finally { c.disconnect(); }
    }

    static void deleteTree(File f) {
        if (f.isDirectory()) { File[] kids = f.listFiles(); if (kids != null) for (File k : kids) deleteTree(k); }
        f.delete();
    }

    /** Moves a fully downloaded update into place. Returns true if one was applied. */
    boolean applyStaged() {
        File staged = new File(getFilesDir(), "www_staged");
        if (!new File(staged, "version.json").isFile()) return false;
        File live = new File(getFilesDir(), "www");
        deleteTree(live);
        return staged.renameTo(live);
    }

    void checkForUpdate() {
        if (checking) return;
        checking = true;
        new Thread(() -> {
            try {
                String bust = "?t=" + System.currentTimeMillis();
                JSONObject remote = new JSONObject(new String(download(UPDATE_BASE + "version.json" + bust), StandardCharsets.UTF_8));
                int rv = remote.optInt("version", 0);
                int have = Math.max(bundledVersion(), localVersion());
                if (rv <= have || remote.optInt("minApp", 0) > BuildConfigLite.APP_VERSION) return;
                File staged = new File(getFilesDir(), "www_staged");
                deleteTree(staged);
                staged.mkdirs();
                JSONArray files = remote.getJSONArray("files");
                for (int i = 0; i < files.length(); i++) {
                    String name = files.getString(i);
                    if (!name.matches("[A-Za-z0-9_./-]+") || name.contains("..")) throw new Exception("bad name");
                    byte[] data = download(UPDATE_BASE + name + bust);
                    File out = new File(staged, name);
                    out.getParentFile().mkdirs();
                    try (FileOutputStream fo = new FileOutputStream(out)) { fo.write(data); }
                }
                try (FileOutputStream fo = new FileOutputStream(new File(staged, "version.json"))) { fo.write(remote.toString().getBytes(StandardCharsets.UTF_8)); }
                runOnUiThread(() -> Toast.makeText(this, "Tikrar update ready. It applies next time you open the app.", Toast.LENGTH_SHORT).show());
            } catch (Exception ignored) {
                deleteTree(new File(getFilesDir(), "www_staged"));
            } finally { checking = false; }
        }).start();
    }

    static String mimeFor(String p) {
        if (p.endsWith(".html")) return "text/html";
        if (p.endsWith(".js")) return "application/javascript";
        if (p.endsWith(".css")) return "text/css";
        if (p.endsWith(".woff2")) return "font/woff2";
        if (p.endsWith(".png")) return "image/png";
        if (p.endsWith(".json") || p.endsWith(".webmanifest")) return "application/json";
        return "application/octet-stream";
    }

    @Override
    protected void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        String tab = intent.getStringExtra("tab");
        if (tab != null && tab.matches("[a-z]+") && web != null) {
            web.evaluateJavascript("location.hash='" + tab + "'", null);
        }
    }

    @Override
    protected void onResume() {
        super.onResume();
        if (web != null && loaded) {
            if (applyStaged()) web.reload();
            else web.evaluateJavascript("try{wake2()}catch(e){}", null);
        }
        checkForUpdate();
    }

    @Override
    @SuppressWarnings("deprecation")
    public void onBackPressed() {
        if (web == null) { super.onBackPressed(); return; }
        web.evaluateJavascript("(function(){try{return goBack()}catch(e){return 'exit'}})()", value -> {
            if (value == null || value.contains("exit")) finish();
        });
    }

    @Override
    @SuppressWarnings("deprecation")
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        if (requestCode == REQ_OPEN) {
            if (fileCallback != null) {
                Uri u = (resultCode == RESULT_OK && data != null) ? data.getData() : null;
                fileCallback.onReceiveValue(u != null ? new Uri[]{u} : null);
                fileCallback = null;
            }
        } else if (requestCode == REQ_SAVE) {
            if (resultCode == RESULT_OK && data != null && data.getData() != null && pendingSave != null) {
                try (OutputStream out = getContentResolver().openOutputStream(data.getData())) {
                    out.write(pendingSave.getBytes(StandardCharsets.UTF_8));
                    Toast.makeText(this, "Backup saved", Toast.LENGTH_SHORT).show();
                    web.evaluateJavascript("ui.msg='Backup saved.';render()", null);
                } catch (Exception e) {
                    Toast.makeText(this, "Couldn't save the backup", Toast.LENGTH_SHORT).show();
                }
            }
            pendingSave = null;
        }
    }

    class Bridge {
        @JavascriptInterface
        public void updateWidget(String json) {
            getSharedPreferences("tikrar", MODE_PRIVATE).edit().putString("widget", json).apply();
            TikrarWidget.refreshAll(MainActivity.this);
        }

        @JavascriptInterface
        public void saveFile(String name, String data) {
            runOnUiThread(() -> {
                pendingSave = data;
                Intent i = new Intent(Intent.ACTION_CREATE_DOCUMENT);
                i.addCategory(Intent.CATEGORY_OPENABLE);
                i.setType("application/json");
                i.putExtra(Intent.EXTRA_TITLE, name);
                try { startActivityForResult(i, REQ_SAVE); } catch (Exception e) { pendingSave = null; }
            });
        }
    }
}
''')
w(J+'BuildConfigLite.java','package com.tikrar.tracker;\n\nfinal class BuildConfigLite { static final int APP_VERSION = %d; }\n'%VERSION)
w(J+'TikrarWidget.java',r'''package com.tikrar.tracker;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.graphics.Color;
import android.view.View;
import android.widget.RemoteViews;

import org.json.JSONArray;
import org.json.JSONObject;

import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Locale;

public class TikrarWidget extends AppWidgetProvider {
    static final int[] ROWS = {R.id.w_r0, R.id.w_r1, R.id.w_r2, R.id.w_r3};

    @Override
    public void onUpdate(Context context, AppWidgetManager manager, int[] ids) {
        for (int id : ids) manager.updateAppWidget(id, build(context));
    }

    static void refreshAll(Context c) {
        AppWidgetManager m = AppWidgetManager.getInstance(c);
        int[] ids = m.getAppWidgetIds(new ComponentName(c, TikrarWidget.class));
        for (int id : ids) m.updateAppWidget(id, build(c));
    }

    static PendingIntent open(Context c, String tab, int code) {
        Intent i = new Intent(c, MainActivity.class);
        i.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_SINGLE_TOP);
        if (tab != null) i.putExtra("tab", tab);
        return PendingIntent.getActivity(c, code, i, PendingIntent.FLAG_IMMUTABLE | PendingIntent.FLAG_UPDATE_CURRENT);
    }

    static RemoteViews build(Context c) {
        RemoteViews v = new RemoteViews(c.getPackageName(), R.layout.widget);
        v.setOnClickPendingIntent(R.id.w_root, open(c, "today", 100));
        v.setOnClickPendingIntent(R.id.w_left, open(c, "today", 101));
        JSONObject day = null;
        try {
            String json = c.getSharedPreferences("tikrar", Context.MODE_PRIVATE).getString("widget", null);
            String today = new SimpleDateFormat("yyyy-MM-dd", Locale.US).format(new Date());
            if (json != null) {
                JSONArray days = new JSONObject(json).getJSONArray("days");
                for (int i = 0; i < days.length(); i++) {
                    JSONObject d = days.getJSONObject(i);
                    if (today.equals(d.optString("date"))) { day = d; break; }
                }
            }
        } catch (Exception ignored) { }
        if (day == null) {
            v.setTextViewText(R.id.w_label, "TIKRAR");
            v.setTextViewText(R.id.w_page, "Open Tikrar");
            v.setTextViewText(R.id.w_sub, "Tap to load today's plan");
            v.setViewVisibility(R.id.w_weak, View.GONE);
            v.setViewVisibility(R.id.w_rows, View.GONE);
            return v;
        }
        v.setViewVisibility(R.id.w_rows, View.VISIBLE);
        boolean all = day.optBoolean("allDone");
        v.setTextViewText(R.id.w_label, all ? "ALL DONE TODAY" : "TODAY");
        v.setTextColor(R.id.w_label, Color.parseColor(all ? "#6CC797" : "#D8AF5C"));
        v.setTextViewText(R.id.w_page, day.optString("page"));
        v.setTextViewText(R.id.w_sub, day.optString("sub"));
        int weak = day.optInt("weak");
        if (weak > 0) {
            v.setViewVisibility(R.id.w_weak, View.VISIBLE);
            v.setTextViewText(R.id.w_weak, weak + (weak == 1 ? " weak page" : " weak pages"));
        } else v.setViewVisibility(R.id.w_weak, View.GONE);
        JSONArray rows = day.optJSONArray("rows");
        for (int i = 0; i < ROWS.length; i++) {
            JSONObject r = rows != null ? rows.optJSONObject(i) : null;
            if (r == null) { v.setViewVisibility(ROWS[i], View.GONE); continue; }
            boolean done = r.optBoolean("done");
            String detail = r.optString("detail");
            String text = (done ? "✓  " : "○  ") + r.optString("label") + (!done && detail.length() > 0 && !detail.equals("—") ? "  " + detail : "");
            v.setViewVisibility(ROWS[i], View.VISIBLE);
            v.setTextViewText(ROWS[i], text);
            v.setTextColor(ROWS[i], Color.parseColor(done ? "#6CC797" : "#E4ECE7"));
            v.setOnClickPendingIntent(ROWS[i], open(c, r.optString("tab"), 110 + i));
        }
        return v;
    }
}
''')
# web assets: from the PWA build, minus the service worker
www=R+'/app/src/main/assets/www'
shutil.rmtree(www,ignore_errors=True);shutil.copytree(WEB,www)
for f in ['sw.js','README.txt']:
    if os.path.exists(www+'/'+f):os.remove(www+'/'+f)
a=open(www+'/app.js').read()
a=re.sub(r"\nif\('serviceWorker' in navigator\)\{[^\n]*\n","\n",a)
open(www+'/app.js','w').write(a)
ix=open(www+'/index.html').read().replace('<link rel="manifest" href="manifest.webmanifest">\n','')
open(www+'/index.html','w').write(ix)
os.remove(www+'/manifest.webmanifest')
WEBVER=int(open('/home/claude/tikrar-android/.webver').read()) if os.path.exists('/home/claude/tikrar-android/.webver') else 1
open(www+'/version.json','w').write(json.dumps({'version':WEBVER,'minApp':1,'files':['index.html','app.js']}))
ks=R+'/app/tikrar.keystore'
if not os.path.exists(ks):
    subprocess.run(['keytool','-genkeypair','-keystore',ks,'-storepass','tikrar-hifz','-keypass','tikrar-hifz','-alias','tikrar','-keyalg','RSA','-keysize','2048','-validity','36500','-dname','CN=Tikrar Hifz Tracker'],check=True,capture_output=True)
print('android project ready, version',VERSION)
