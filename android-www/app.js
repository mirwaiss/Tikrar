
/* ---------- Mushaf data (Madinah mushaf, 604 pages) ---------- */
const SURAHS=[["Al-Fatihah",1],["Al-Baqarah",2],["Al Imran",50],["An-Nisa",77],["Al-Ma'idah",106],["Al-An'am",128],["Al-A'raf",151],["Al-Anfal",177],["At-Tawbah",187],["Yunus",208],["Hud",221],["Yusuf",235],["Ar-Ra'd",249],["Ibrahim",255],["Al-Hijr",262],["An-Nahl",267],["Al-Isra",282],["Al-Kahf",293],["Maryam",305],["Taha",312],["Al-Anbiya",322],["Al-Hajj",332],["Al-Mu'minun",342],["An-Nur",350],["Al-Furqan",359],["Ash-Shu'ara",367],["An-Naml",377],["Al-Qasas",385],["Al-Ankabut",396],["Ar-Rum",404],["Luqman",411],["As-Sajdah",415],["Al-Ahzab",418],["Saba",428],["Fatir",434],["Ya-Sin",440],["As-Saffat",446],["Sad",453],["Az-Zumar",458],["Ghafir",467],["Fussilat",477],["Ash-Shura",483],["Az-Zukhruf",489],["Ad-Dukhan",496],["Al-Jathiyah",499],["Al-Ahqaf",502],["Muhammad",507],["Al-Fath",511],["Al-Hujurat",515],["Qaf",518],["Adh-Dhariyat",520],["At-Tur",523],["An-Najm",526],["Al-Qamar",528],["Ar-Rahman",531],["Al-Waqi'ah",534],["Al-Hadid",537],["Al-Mujadila",542],["Al-Hashr",545],["Al-Mumtahanah",549],["As-Saff",551],["Al-Jumu'ah",553],["Al-Munafiqun",554],["At-Taghabun",556],["At-Talaq",558],["At-Tahrim",560],["Al-Mulk",562],["Al-Qalam",564],["Al-Haqqah",566],["Al-Ma'arij",568],["Nuh",570],["Al-Jinn",572],["Al-Muzzammil",574],["Al-Muddaththir",575],["Al-Qiyamah",577],["Al-Insan",578],["Al-Mursalat",580],["An-Naba",582],["An-Nazi'at",583],["Abasa",585],["At-Takwir",586],["Al-Infitar",587],["Al-Mutaffifin",587],["Al-Inshiqaq",589],["Al-Buruj",590],["At-Tariq",591],["Al-A'la",591],["Al-Ghashiyah",592],["Al-Fajr",593],["Al-Balad",594],["Ash-Shams",595],["Al-Layl",595],["Ad-Duha",596],["Ash-Sharh",596],["At-Tin",597],["Al-Alaq",597],["Al-Qadr",598],["Al-Bayyinah",598],["Az-Zalzalah",599],["Al-Adiyat",599],["Al-Qari'ah",600],["At-Takathur",600],["Al-Asr",601],["Al-Humazah",601],["Al-Fil",601],["Quraysh",602],["Al-Ma'un",602],["Al-Kawthar",602],["Al-Kafirun",603],["An-Nasr",603],["Al-Masad",603],["Al-Ikhlas",604],["Al-Falaq",604],["An-Nas",604]];
const JUZ=[1,22,42,62,82,102,121,142,162,182,201,222,242,262,282,302,322,342,362,382,402,422,442,462,482,502,522,542,562,582];
const TOTAL=604;
function surahOf(p){let s=SURAHS[0][0];for(const [n,st] of SURAHS){if(st<=p)s=n;else break}return s}
function surahsOn(p){const on=SURAHS.filter(([,st])=>st===p).map(([n])=>n);return on.length?on:[surahOf(p)]}
function juzOf(p){let j=1;JUZ.forEach((st,i)=>{if(st<=p)j=i+1});return j}
function pageMeta(p){const s=surahsOn(p);return (s.length>2?s[0]+' – '+s[s.length-1]:s.join(', '))+' · Juz '+juzOf(p)}
/* Page order. 'surah': An-Nas back to Al-Fatihah, each surah from its first page forward. */
let SEQ_CACHE={};
function orderSeq(order){
  if(SEQ_CACHE[order])return SEQ_CACHE[order];
  const seq=[];const seen=new Set();
  if(order==='forward'){for(let p=1;p<=TOTAL;p++)seq.push({p,s:surahOf(p)})}
  else if(order==='backward'){for(let p=TOTAL;p>=1;p--)seq.push({p,s:surahOf(p)})}
  else{for(let i=SURAHS.length-1;i>=0;i--){const [name,st]=SURAHS[i];const nx=i+1<SURAHS.length?SURAHS[i+1][1]:TOTAL+1;const end=Math.max(st,nx-1);for(let p=st;p<=end;p++){if(!seen.has(p)){seen.add(p);seq.push({p,s:name,n:i+1})}}}}
  return SEQ_CACHE[order]=seq;
}
function ownerSurah(p){const it=orderSeq(S.settings.order).find(x=>x.p===p);return it?it.s:surahOf(p)}
function surahProgress(p){const seq=orderSeq(S.settings.order);const it=seq.find(x=>x.p===p);if(!it)return'';const blk=seq.filter(x=>x.s===it.s);return 'Surah '+it.s+' · page '+(blk.findIndex(x=>x.p===p)+1)+' of '+blk.length}
function range(pages){if(!pages.length)return'';const a=[...pages].sort((x,y)=>x-y);const out=[];let s=a[0],e=a[0];for(let i=1;i<=a.length;i++){if(a[i]===e+1){e=a[i]}else{out.push(s===e?''+s:s+'–'+e);s=e=a[i]}}return out.join(', ')}

/* ---------- State ---------- */
const STEP_DEF=[{id:"listen",on:true,req:true,count:3},{id:"tafsir",on:true,req:true,count:1},{id:"memo",on:true,req:true,count:1},{id:"rec",on:true,req:true,count:3},{id:"reps",on:true,req:true,count:40}];
const STEP_SHORT={listen:"Listen",tafsir:"Tafsir",memo:"Memorize",rec:"Record",reps:"Repeat"};
const STEP_NAMES={listen:"Listen to a reciter",tafsir:"Read the tafsir",memo:"Memorize the page",rec:"Record clean recitations",reps:"Repeat from memory"};
const DEF={joinReps:40,weakClear:20,priorConn:0,inOrder:true,steps:STEP_DEF.map(x=>({...x})),priorTo:0,priorPart:0,order:"surah",startPage:604,dir:-1,ppd:'1',listen:3,rec:3,reps:40,yreps:5,connTarget:10,cycle:6,rest:[],prior:""};
const LS='tikrar-tracker-v1';
const CLIENT=Math.random().toString(36).slice(2);
function fresh(){return{v:1,setup:false,settings:{...DEF},lessons:[],logs:{},done:{},revCursor:0,weak:{},miss:{},cc:{},pp:{},wk:{},wkNo:{},recovered:[],revLog:{},revStack:[],revExtra:{},updated:0}}
function normalize(o){const f=fresh();if(!o||typeof o!=='object')return f;const s={...f,...o};s.settings={...DEF,...(o.settings||{})};if(o.settings&&!o.settings.order)s.settings.order=o.settings.dir===-1?'backward':'forward';['logs','done','weak','miss','cc','pp','wk','wkNo','revExtra'].forEach(k=>{if(!s[k]||typeof s[k]!=='object')s[k]={}});if(!Array.isArray(s.lessons))s.lessons=[];s.lessons.forEach(l=>{if(l.half){l.lines=l.half===1?[1,8]:[9,15];delete l.half}});Object.keys(s.pp||{}).forEach(k=>{const m=k.match(/^(\d+)h([12])$/);if(m){s.pp[m[1]+'L'+(m[2]==='1'?1:9)]=s.pp[k];delete s.pp[k]}});Object.values(s.logs||{}).forEach(g=>{if(g&&g.ppd!=null)g.ppd=normAmt(g.ppd)});if(!s.revLog||typeof s.revLog!=='object')s.revLog={};if(!s.revExtra||typeof s.revExtra!=='object')s.revExtra={};{const td=dk();Object.keys(s.revLog).filter(k=>k>td).sort().forEach(k=>{(s.revExtra[td]=s.revExtra[td]||[]).push(s.revLog[k]);delete s.revLog[k]});(s.revStack||[]).forEach(e=>{if(e.date>td){e.date=td;e.extra=true}})}if(!Array.isArray(s.revStack))s.revStack=[];{const tg=s.logs&&s.logs[dk()];if(tg&&tg.revDone&&tg.revPortion&&!s.revLog[dk()]){s.revLog[dk()]=tg.revPortion;s.revStack.push({date:dk(),prev:tg.revPrev||0})}}if(!Array.isArray(s.recovered))s.recovered=[];if(!o.wk20){s.settings.weakClear=20;s.wk20=1}Object.keys(s.weak).forEach(k=>{if(s.weak[k]&&!s.wk[k])s.wk[k]={since:dk(),reviews:0,clean:0,mistakes:0,last:null,note:''}});s.weak={};Object.keys(s.wk).forEach(k=>s.weak[k]=1);if(!o.pp){const tl=s.logs[dk()];if(tl&&tl.pages)Object.keys(tl.pages).forEach(k=>{s.pp[k]=tl.pages[k]})}s.settings.order='surah';s.settings.startPage=TOTAL;if(!Array.isArray(s.settings.rest))s.settings.rest=[];if(!Array.isArray(s.settings.steps))s.settings.steps=STEP_DEF.map(x=>({...x}));s.settings.steps=s.settings.steps.filter(x=>x&&x.id&&(STEP_NAMES[x.id]||x.custom));STEP_DEF.forEach(d=>{if(!s.settings.steps.some(x=>x.id===d.id))s.settings.steps.push({...d,on:false})});s.settings.steps.forEach(z=>{if(!(z.count>=1))z.count=z.id==='listen'?(o.settings&&o.settings.listen)||3:z.id==='rec'?(o.settings&&o.settings.rec)||3:z.id==='reps'?(o.settings&&o.settings.reps)||40:1});s.settings.ppd=normAmt(s.settings.ppd);return s}
let S=fresh();
try{const raw=localStorage.getItem(LS);if(raw)S=normalize(JSON.parse(raw))}catch(e){}
const ui={openStep:{},tab:'today',confirmReset:false,confirmUndo:false,sync:'device'};

function dk(d=new Date()){const z=n=>String(n).padStart(2,'0');return d.getFullYear()+'-'+z(d.getMonth()+1)+'-'+z(d.getDate())}
const TODAY=()=>dk();
function fromKey(k){return new Date(k+'T12:00:00')}
function isRest(k){return S.settings.rest.includes(fromKey(k).getDay())&&!(S.logs[k]&&S.logs[k].work)}
function normAmt(v){const ok=['1L','2L','3L','4L','5L','6L','half','1','2','3'];if(v===0.5||v==='0.5')return'half';v=String(v);return ok.includes(v)?v:'1'}
function amtPages(k){return /L$/.test(k)?parseInt(k)/15:k==='half'?0.5:parseInt(k)}
function amtLabel(k){return /L$/.test(k)?(parseInt(k)===1?'1 line':parseInt(k)+' lines'):k==='half'?'½ page':(k==='1'?'1 page':k+' pages')}
function linesTxt(ln){return ln[0]===ln[1]?'line '+ln[0]:'lines '+ln[0]+'–'+ln[1]}
function dayPpd(t=TODAY()){const lg=S.logs[t];return normAmt((lg&&lg.ppd)||S.settings.ppd)}
function log(day=TODAY()){return S.logs[day]||(S.logs[day]={pages:{},conn:{},revChk:{},y:0})}
function aheadMemDate(){let m=TODAY();S.lessons.forEach(l=>{if(l.date>m)m=l.date});const d=fromKey(m);for(let i=0;i<30;i++){d.setDate(d.getDate()+1);const k=dk(d);if(!isRest(k))return k}return dk(d)}
function workTarget(){const tp=todaysPages();if(tp.done&&ui.aheadMem){const d=aheadMemDate();return{...lessonFor(d),date:d,ahead:true}}return{...tp,date:TODAY()}}
function pkey(p){const tp=workTarget();return tp.lines&&tp.pages[0]===p?p+'L'+tp.lines[0]:''+p}
function pst(p){const k=pkey(p);return S.pp[k]||(S.pp[k]={n:{},recReset:0,miss:0})}
const fmt=(d,o)=>d.toLocaleDateString(undefined,o);
function hijri(){try{return new Intl.DateTimeFormat('en-u-ca-islamic-umalqura',{day:'numeric',month:'long',year:'numeric'}).format(new Date())}catch(e){return''}}
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));

/* ---------- Schedule logic ---------- */
function surahBlock(n){return orderSeq('surah').filter(x=>x.n===n).map(x=>x.p)}
function priorSet(){const s=new Set();const st=S.settings;
  if(st.priorTo>=1){orderSeq('surah').forEach(x=>{if(x.n>=st.priorTo)s.add(x.p)});let n=st.priorTo-1;while(n>=1&&!surahBlock(n).length)n--;surahBlock(n).slice(0,st.priorPart||0).forEach(p=>s.add(p))}
(S.settings.prior||'').split(/[,\s]+/).forEach(t=>{const m=t.match(/^(\d+)(?:[-–](\d+))?$/);if(!m)return;let a=+m[1],b=m[2]?+m[2]:a;if(a>b)[a,b]=[b,a];for(let p=Math.max(1,a);p<=Math.min(TOTAL,b);p++)s.add(p)});return s}
function memorizedSet(){const s=priorSet();S.lessons.forEach(l=>{if(!l.lines||l.lines[1]>=15)l.pages.forEach(p=>s.add(p))});return s}
function isJoinLesson(l){return !!(l&&l.lines&&l.lines[0]>1&&l.lines[1]>=15&&S.settings.joinReps>0)}
function yTarget(l){return isJoinLesson(l)?S.settings.joinReps:S.settings.yreps}
function joinSplit(l){const p=l.pages[0];return l.split!=null?l.split:surahsOn(p).length>1}
function yDesc(l){if(!isJoinLesson(l))return 'Page '+lessonLabel(l);const p=l.pages[0];return joinSplit(l)?`The ${ownerSurah(p)} part of p. ${p}, both parts joined`:`Whole page ${p}, both parts joined`}
function lessonLabel(l){return range(l.pages)+(l.lines?` (${linesTxt(l.lines)})`:'')}
function todaysPages(){return lessonFor(TODAY())}
function lessonFor(t){
  const done=S.lessons.find(l=>l.date===t);
  if(done)return{pages:done.pages,lines:done.lines||null,done:true,lesson:done};
  const st=S.settings,mem=memorizedSet(),amt=dayPpd(t),part=amt==='half'||/L$/.test(amt);
  const span=a=>amt==='half'?[a,Math.min(15,a+7)]:/L$/.test(amt)?[a,Math.min(15,a+parseInt(amt)-1)]:[a,15];
  const before=S.lessons.filter(l=>l.date<t),last=before[before.length-1];
  if(last&&last.lines&&last.lines[1]<15&&!mem.has(last.pages[0]))return{pages:[last.pages[0]],lines:span(last.lines[1]+1),done:false,cont:true};
  const seq=orderSeq(st.order).map(x=>x.p);
  if(seq.every(p=>mem.has(p)))return{pages:[],lines:null,done:false,finished:true};
  let i=last?seq.indexOf(last.pages[last.pages.length-1])+1:0;if(i<0)i=0;
  const want=part?1:parseInt(amt),out=[];
  for(let g=0;g<seq.length&&out.length<want;g++){const q=seq[(i+g)%seq.length];if(!mem.has(q)&&!out.includes(q))out.push(q)}
  return{pages:out,lines:part&&out.length?span(1):null,done:false};
}
function recentPrior(){const st=S.settings,N=Math.max(0,st.priorConn|0);if(!N)return[];
  const pr=priorSet();return orderSeq('surah').map(x=>x.p).filter(p=>pr.has(p)).slice(-N)}
function ccBefore(key,lg){return (S.cc[key]||0)-(lg&&lg.conn&&lg.conn[key]?1:0)}
function plan(t=TODAY()){
  const st=S.settings,lg=S.logs[t]||{};
  const tgt=Math.max(1,st.connTarget|0);
  const prior=S.lessons.filter(l=>l.date<t);const D=prior.length;
  const virt=recentPrior().map(p=>({n:'v'+p,pages:[p],date:'',virtual:true}));
  const all=virt.concat(prior);
  const last=prior[D-1];
  const yl=last&&(!last.yDate||last.yDate===t)?last:null;
  const conn=all.filter(l=>l!==yl&&ccBefore(l.n,lg)<tgt).reverse();
  const vset=new Set(virt.map(l=>l.pages[0]));
  const old=[...priorSet()].filter(p=>!vset.has(p));all.forEach(l=>{if(l!==yl&&ccBefore(l.n,lg)>=tgt)old.push(...l.pages)});
  const oldU=[...new Set(old)].sort((a,b)=>a-b);
  const cyc=Math.max(1,st.cycle|0),per=Math.ceil(oldU.length/cyc);
  const nextFrom=ptr=>{let i=oldU.findIndex(p=>p>ptr);if(i<0)i=0;const out=[];for(let k=0;k<per&&k<oldU.length;k++)out.push(oldU[(i+k)%oldU.length]);return out};
  const doneToday=S.revLog[t];
  const portion=doneToday||nextFrom(S.revLast||0);
  const ahead=doneToday?nextFrom(S.revLast||0):[];
  const aheadDone=(S.revExtra[t]||[]);
  const roundDone=oldU.filter(p=>p<=(S.revLast||0)).length;
  const graduating=conn.filter(l=>ccBefore(l.n,lg)+(lg.conn&&lg.conn[l.n]?1:0)>=tgt).length;
  const nParts=Math.max(1,Math.ceil(oldU.length/Math.max(1,per)));const partOf=pp=>pp&&pp.length?Math.min(nParts,Math.floor(Math.max(0,oldU.indexOf(pp[0]))/Math.max(1,per))+1):1;
  return{D,tgt,yl,conn,old:oldU,cyc,per,portion,roundDone,graduating,ahead,aheadDone,nParts,partOf};
}
function getCount(x,id){if(x.n&&x.n[id]!=null)return x.n[id];
  if(id==='listen')return x.listen||0;if(id==='rec')return x.rec||0;if(id==='reps')return x.reps||0;if(id==='tafsir')return x.tafsir?1:0;if(id==='memo')return x.memo?1:0;return x.c&&x.c[id]?1:0}
function setCount(x,id,v){if(!x.n)x.n={};x.n[id]=Math.max(0,v)}
function lastRevPart(P,t){const ex=S.revExtra[t]||[];const pp=ex.length?ex[ex.length-1]:S.revLog[t];return pp?P.partOf(pp):null}
function stepState(p,st){const x=S.pp[pkey(p)]||{};const tp=workTarget();
  const list=st.steps.filter(z=>z.on);
  return list.map(z=>{const c=Math.max(1,z.count|0),v=Math.min(getCount(x,z.id),c);return{...z,count:c,val:v,frac:v/c,done:v>=c}})}
function pageReady(p){return stepState(p,S.settings).every(z=>!z.req||z.done)}
function pageFrac(p){const ss=stepState(p,S.settings).filter(z=>z.req);if(!ss.length)return 0;return ss.reduce((a,z)=>a+z.frac*(z.id==='reps'?2:1),0)/ss.reduce((a,z)=>a+(z.id==='reps'?2:1),0)}
function status(t=TODAY()){
  const lg=t===TODAY()?log(t):(S.logs[t]||{pages:{},conn:{},revChk:{},y:0}),st=S.settings,P=plan(t),tp=lessonFor(t),rest=isRest(t);
  const newState=tp.done?'done':(rest?'rest':(tp.finished?'done':'todo'));
  const newFrac=tp.done?1:(t!==TODAY()?0:tp.pages.length?tp.pages.reduce((a,p)=>a+pageFrac(p),0)/tp.pages.length:1);
  const yNeed=!!P.yl;const yDone=!yNeed||P.yl.yDate===t;const yT=yNeed?yTarget(P.yl):st.yreps;const yCount=Math.min(lg.y||0,yT);
  const cTotal=P.conn.length,cDone=P.conn.filter(l=>lg.conn[l.n]).length;
  const rNeed=P.portion.length>0;const rDone=!rNeed||!!S.revLog[t];const rChk=S.revLog[t]?P.portion.length:P.portion.filter(p=>lg.revChk[p]).length;
  const allDone=(newState!=='todo')&&yDone&&cDone===cTotal&&rDone;
  return{t,lg,st,P,tp,rest,yT,newState,newFrac,yNeed,yDone,yCount,cTotal,cDone,rNeed,rDone,rChk,allDone};
}
function refreshDone(){const d=fromKey(TODAY());for(let i=0;i<10;i++){const k=dk(d);const s=status(k);if(s.allDone)S.done[k]=1;else delete S.done[k];d.setDate(d.getDate()+1)}}
function streak(){
  const first=S.lessons[0]?.date;if(!first)return 0;
  const d=new Date();if(!S.done[dk(d)]&&!status().allDone)d.setDate(d.getDate()-1);
  let n=0;for(let i=0;i<3000;i++){const k=dk(d);if(k<first)break;if(S.done[k]||(k===TODAY()&&status().allDone))n++;else if(!isRest(k))break;d.setDate(d.getDate()-1)}
  return n;
}
function projection(){
  const st=S.settings;let rem=TOTAL-memorizedSet().size;if(rem<=0)return'Complete';
  if(st.rest.length>=7)return'—';
  const d=new Date();if(todaysPages().done)d.setDate(d.getDate()+1);
  let g=0;while(g<6000){if(!st.rest.includes(d.getDay())){rem-=amtPages(st.ppd);if(rem<=0)break}d.setDate(d.getDate()+1);g++}
  return fmt(d,{month:'short',year:'numeric'});
}

/* ---------- Storage: account (db) with device fallback ---------- */
let docRef=null,saving=false,pending=false,timer=null;
function save(){
  S.updated=Date.now();
  // keep only ~70 days of detailed logs
  const cut=new Date();cut.setDate(cut.getDate()-70);const ck=dk(cut);
  Object.keys(S.logs).forEach(k=>{if(k<ck)delete S.logs[k]});Object.keys(S.revLog).forEach(k=>{if(k<ck)delete S.revLog[k]});Object.keys(S.revExtra).forEach(k=>{if(k<ck)delete S.revExtra[k]});if(S.revStack.length>40)S.revStack=S.revStack.slice(-40);
  try{localStorage.setItem(LS,JSON.stringify(S))}catch(e){}
  if(!docRef)return;
  clearTimeout(timer);timer=setTimeout(flush,700);
}
async function flush(){
  timer=null;if(!docRef)return;
  if(saving){pending=true;return}
  saving=true;setSync('busy');
  try{await docRef.set({json:JSON.stringify(S),updated:S.updated,client:CLIENT});setSync('account')}
  catch(e){setSync('error')}
  saving=false;if(pending){pending=false;flush()}
}
function setSync(v){ui.sync=v;const el=document.getElementById('sync');if(el)el.outerHTML=syncHtml()}
function syncHtml(){const m={account:['ok','Saved to your account'],device:['','Saved on this device'],busy:['busy','Saving…'],error:['err','Not saved to account — kept on this device'],loading:['busy','Loading…']}[ui.sync]||['',''];return `<span id="sync" class="sync ${m[0]}"><i></i>${m[1]}</span>`}
async function initStore(){
  if(!window.claude||!window.claude.use)return;
  ui.sync='loading';render();
  const to=new Promise(r=>setTimeout(()=>r('timeout'),10000));
  try{
    const res=await Promise.race([(async()=>{
      const [db,user]=await Promise.all([claude.use('db'),claude.use('user')]);
      if(!db||!user)return null;
      const id=await user.id();if(!id)return null;
      const ref=db.collection('data/users/'+id).doc('tikrar');
      const snap=await ref.get();return{ref,snap};
    })(),to]);
    if(!res||res==='timeout'){ui.sync='device';render();return}
    docRef=res.ref;
    if(res.snap.exists){const d=res.snap.data()||{};try{const remote=normalize(JSON.parse(d.json));if((remote.updated||0)>=(S.updated||0))S=remote}catch(e){}}
    else if(S.updated){flush()}
    ui.sync='account';render();
    docRef.onSnapshot(snap=>{if(!snap.exists)return;const d=snap.data()||{};if(d.client===CLIENT||saving||timer)return;
      if((d.updated||0)>(S.updated||0)){try{S=normalize(JSON.parse(d.json));try{localStorage.setItem(LS,JSON.stringify(S))}catch(e){}render()}catch(e){}}},()=>{});
  }catch(e){ui.sync='device';render()}
}

/* ---------- Icons ---------- */
const IC={
  today:'<svg viewBox="0 0 24 24"><rect x="3.5" y="5" width="17" height="15" rx="2.5"/><path d="M3.5 10h17M8 3v4M16 3v4"/></svg>',
  memorize:'<svg viewBox="0 0 24 24"><path d="M12 6.5C10 5 7 4.5 4 5v13c3-.5 6 0 8 1.5 2-1.5 5-2 8-1.5V5c-3-.5-6 0-8 1.5Z"/><path d="M12 6.5v13"/></svg>',
  connection:'<svg viewBox="0 0 24 24"><path d="M9.5 14.5l5-5"/><path d="M11 6.5l1.5-1.5a4 4 0 0 1 5.7 5.7L16.5 12.5"/><path d="M13 17.5l-1.5 1.5a4 4 0 0 1-5.7-5.7L7.5 11.5"/></svg>',
  revision:'<svg viewBox="0 0 24 24"><path d="M20 12a8 8 0 1 1-2.3-5.6"/><path d="M20 4v4.5h-4.5"/></svg>',
  progress:'<svg viewBox="0 0 24 24"><rect x="4" y="4" width="4" height="4" rx="1"/><rect x="10" y="4" width="4" height="4" rx="1"/><rect x="16" y="4" width="4" height="4" rx="1"/><rect x="4" y="10" width="4" height="4" rx="1"/><rect x="10" y="10" width="4" height="4" rx="1"/><rect x="4" y="16" width="4" height="4" rx="1"/></svg>',
  gear:'<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z"/></svg>'
};

/* ---------- Rendering ---------- */
function ring(count,target,act,data){
  const r=46,c=2*Math.PI*r,f=Math.min(1,count/Math.max(1,target));
  return `<button class="ring" data-act="${act}" ${data} aria-label="Add one clean repetition"><svg viewBox="0 0 112 112"><circle class="bg" cx="56" cy="56" r="${r}"/><circle class="fg" cx="56" cy="56" r="${r}" stroke-dasharray="${c}" stroke-dashoffset="${c*(1-f)}"/></svg><span class="c"><b class="num">${count}</b><span class="num">of ${target}</span></span></button>`;
}
function header(){
  const today=fmt(new Date(),{weekday:'long',month:'long',day:'numeric'});const h=hijri();
  return `<header class="top"><div class="mark" aria-hidden="true">تكرار</div><div class="top-txt"><h1>Tikrar Hifz Tracker</h1><div class="d">${today}${h?' · '+h:''}</div></div><button class="icon-btn" data-act="tab" data-v="settings" aria-label="Settings">${IC.gear}</button></header>`;
}
function taskRow(tab,title,sub,state,frac,chip){
  const tk=state==='done'?'<span class="tick done">✓</span>':(frac>0?'<span class="tick part">•</span>':'<span class="tick"></span>');
  return `<button class="task" data-act="tab" data-v="${tab}">${tk}<span><span class="t">${title}</span><span class="s" style="display:block">${sub}</span>${state!=='done'&&state!=='rest'?`<span class="bar"><b style="width:${Math.round(frac*100)}%"></b></span>`:''}</span>${chip}</button>`;
}
function chipFor(state,text){return `<span class="chip ${state}">${text}</span>`}

function vToday(){
  const s=status(),st=s.st,P=s.P;
  let h='';
  const pg=s.tp.pages;
  h+=`<section class="hero"><div><div class="label">${s.tp.done?'Memorized today':s.rest?'Rest day':'Today’s page'}${s.tp.lines?' · '+linesTxt(s.tp.lines):''}</div><div class="pg num">${pg.length?(pg.length>1?range(pg):'p. '+pg[0]):'—'}</div><div class="sub">${pg.length?esc(S.settings.order==='surah'?surahProgress(pg[0])+' · Juz '+juzOf(pg[0]):pageMeta(pg[0])):s.tp.finished?'All 604 pages memorized':''}</div></div><div class="day">Lesson ${s.tp.done?s.tp.lesson.n:P.D+1}<br><span class="small">${memorizedSet().size} / ${TOTAL}</span></div></section>`;
  const yPages=P.yl?lessonLabel(P.yl):'';
  h+=`<div class="tasks">
   ${taskRow('memorize','New page',s.rest&&!s.tp.done?'Rest day — no new page':(s.tp.done?'Done · page '+lessonLabel(s.tp.lesson):stepSummary()),s.newState,s.newFrac,s.newState==='done'?chipFor('done','Done'):s.newState==='rest'?chipFor('rest','Rest'):chipFor(s.newFrac>0?'prog':'',Math.round(s.newFrac*100)+'%'))}
   ${taskRow('memorize','Yesterday’s repetition',s.yNeed?(isJoinLesson(P.yl)?'Whole page '+P.yl.pages[0]+' joined':'Page '+yPages)+' · '+s.yT+'× from memory':'Nothing from yesterday',s.yDone?'done':'todo',s.yCount/s.yT,s.yDone?chipFor('done',s.yNeed?'Done':'—'):chipFor(s.yCount?'prog':'',s.yCount+'/'+s.yT))}
   ${taskRow('connection','Connection',s.cTotal?(n=>n+' page'+(n>1?'s':'')+' · once each, '+P.tgt+' times in all')([...new Set([].concat(...P.conn.map(l=>l.pages)))].length):'Builds up as you memorize',s.cDone===s.cTotal?'done':'todo',s.cTotal?s.cDone/s.cTotal:1,s.cDone===s.cTotal?chipFor('done',s.cTotal?'Done':'—'):chipFor(s.cDone?'prog':'',s.cDone+'/'+s.cTotal))}
   ${taskRow('revision','Revision',s.rNeed?(s.rDone&&lastRevPart(P,s.t)?'Completed part '+lastRevPart(P,s.t)+' of '+P.nParts+((S.revExtra[s.t]||[]).length?' · '+(1+(S.revExtra[s.t]||[]).length)+' parts today':''):'Part '+P.partOf(P.portion)+' of '+P.nParts+' · pages '+range(P.portion)):'Pages arrive after '+P.tgt+' connection recitations',s.rDone?'done':'todo',s.rNeed?s.rChk/P.portion.length:1,s.rDone?chipFor('done',s.rNeed?'Done':'—'):chipFor(s.rChk?'prog':'',s.rChk+'/'+P.portion.length))}
  </div>`;
  const wn=Object.keys(S.wk).length;if(wn)h+=`<button class="task" data-act="goWeak" style="border:1px solid var(--line);border-radius:var(--r);background:var(--surface)"><span class="tick part">!</span><span><span class="t">Weak pages</span><span class="s" style="display:block">${wn} page${wn>1?'s':''} · review whenever you have time</span></span>${chipFor('',wn)}</button>`;
  if(s.allDone)h+=`<div class="card" style="text-align:center"><h2>Everything for today is done</h2><p class="muted small" style="margin:6px 0 0">Recite at a steady, audible pace (hadr). See you tomorrow, in sha Allah.</p></div>`;
  return h;
}
function vMemorize(){
  const s=status(),st=s.st,P=s.P,t=s.t;let h='<h2 style="font-size:22px">Memorization</h2>';
  // New page
  if(s.tp.done){
    h+=`<section class="card"><div class="card-h"><h2>Today’s new page</h2>${chipFor('done','Memorized')}</div><p style="margin:0">Page ${lessonLabel(s.tp.lesson)} · ${esc(pageMeta(s.tp.pages[0]))}. Tomorrow you’ll repeat ${isJoinLesson(s.tp.lesson)?'the whole page, joined, '+st.joinReps:'it '+st.yreps} times from memory.</p></section>`;
    const ahead=S.lessons.filter(l=>l.date>t);
    if(ahead.length)h+=`<p class="small muted" style="margin:0">Done ahead: ${ahead.map(l=>esc(dayName(l.date))+' (p. '+lessonLabel(l)+')').join(', ')}.</p>`;
    const ad=aheadMemDate(),nx=lessonFor(ad);
    if(!nx.finished&&nx.pages.length){
      if(ui.aheadMem)h+=`<div class="card-h" style="margin:4px 0 -4px"><div><div class="label">Ahead</div><h2>${esc(cap(dayName(ad)))}’s page</h2></div><button class="btn" data-act="aheadMemClose">Cancel</button></div>`+workBlock({...nx,date:ad,ahead:true},st);
      else h+=`<button class="btn block" data-act="aheadMemOpen">Memorize ${esc(dayName(ad))}’s page now · p. ${nx.lines?lessonLabel({pages:nx.pages,lines:nx.lines}):range(nx.pages)}</button>`;
    }
  }else if(s.tp.finished){
    h+=`<section class="card"><h2>All 604 pages memorized</h2><p class="muted">Keep up connection and revision. The program’s mastery course (3–4 pages a day) is the next step.</p></section>`;
  }else if(s.rest){
    h+=`<section class="card"><div class="card-h"><h2>Rest day</h2>${chipFor('rest','No new page')}</div><p class="muted" style="margin:0">Today is set as a rest day for new memorization. Connection and revision still count. Change rest days in Settings.</p><div class="row"><button class="btn" data-act="workRest">Memorize today anyway</button></div></section>`;
  }else{
    h+=workBlock({...s.tp,date:t},st);
  }
  // Yesterday
  if(P.yl){
    const done=P.yl.yDate===t;
    h+=`<section class="card"><div class="card-h"><h2>Yesterday’s repetition</h2>${done?chipFor('done','Done'):chipFor(s.yCount?'prog':'',s.yCount+'/'+s.yT)}</div><p style="margin:0">${esc(yDesc(P.yl))} · ${esc(pageMeta(P.yl.pages[0]))}</p><p class="small muted" style="margin:2px 0 0">${isJoinLesson(P.yl)?`You finished this page in parts, so instead of the usual ${st.yreps}, recite it joined ${s.yT} times from memory.${surahsOn(P.yl.pages[0]).length>1||P.yl.split!=null?'':''} <button class="flag ${joinSplit(P.yl)?'on':''}" data-act="ySplitTog">${joinSplit(P.yl)?'Page has two surahs ✓':'Page has two surahs?'}</button>`:`Recite it ${s.yT} times from memory, without looking at the mushaf.`}</p>
      <div class="counter">${ring(s.yCount,s.yT,'y','')}<div class="ctrls"><button class="btn pri" data-act="y">+1 from memory</button><button class="btn" data-act="yUndo" ${s.yCount?'':'disabled'}>Undo</button>${P.yl.pages.map(p=>weakBtn(p)).join('')}</div></div></section>`;
  }else{
    h+=`<section class="card"><div class="card-h"><h2>Yesterday’s repetition</h2></div><div class="empty">Nothing to repeat yet. The page you memorize today appears here tomorrow.</div></section>`;
  }
  return h;
}
function workBlock(w,st){
  const per=dayPpd(w.date);const ab=k=>`<button class="${per===k?'on':''}" data-act="dayPpd" data-v="${k}" aria-pressed="${per===k}">${k==='half'?'½':parseInt(k)}</button>`;
  let h=`<div class="amt"><div class="seg-wrap"><span class="small muted">Lines</span><div class="seg" role="group" aria-label="Lines">${['1L','2L','3L','4L','5L','6L'].map(ab).join('')}</div></div><div class="seg-wrap"><span class="small muted">Pages</span><div class="seg" role="group" aria-label="Pages">${['half','1','2','3'].map(ab).join('')}</div></div><p class="small muted" style="margin:0">${w.ahead?esc(cap(dayName(w.date))):'Today'}: ${amtLabel(per)}${per!==st.ppd?' · usually '+amtLabel(st.ppd):''}${w.cont?` · continuing p. ${w.pages[0]} from line ${w.lines[0]}`:''}</p></div>`;
  w.pages.forEach(p=>{h+=pageCard(p,st,w.lines)});
  const ready=w.pages.length&&w.pages.every(pageReady);const what=w.lines?`${linesTxt(w.lines)} of p. ${w.pages[0]}`:'page '+range(w.pages);
  return h+`<button class="btn pri block" data-act="complete" ${ready?'':'disabled'}>${ready?`Mark ${what} as memorized${w.ahead?' for '+esc(dayName(w.date)):''}`:'Finish the required steps to complete'}</button>`;
}
function weakBtn(p){return `<button class="flag ${S.weak[p]?'on':''}" data-act="weak" data-p="${p}">${S.weak[p]?'Weak page ✓':'Flag p. '+p+' as weak'}</button>`}
function pageCard(p,st,ln){
  const x=pst(p);const next=p<TOTAL?p+1:null;
  const seqI=orderSeq(st.order);const it=seqI.find(q=>q.p===p);const blk=it?seqI.filter(q=>q.s===it.s):[];
  const endOfSurah=blk.length>0&&blk[blk.length-1].p===p;
  const nextDone=!!next&&memorizedSet().has(next);
  const ss=stepState(p,st);
  const cur=ss.findIndex(z=>!z.done)+1;const open=ui.openStep[p]!=null?ui.openStep[p]:cur;
  let blocked=false;
  const body=ss.map((z,k)=>{
    const i=k+1,locked=st.inOrder&&blocked,ok=z.done,c=z.count,v=z.val,dis=locked||ok?'disabled':'';
    if(z.req&&!z.done)blocked=true;
    const col=i===open?'':`collapsed" data-act="openStep" data-p="${p}" data-i="${i}`;
    const at=`data-p="${p}" data-id="${z.id}"`;
    let title,note='';
    if(z.id==='listen'){title=`Listen to a reciter ${c}×`;note=`Follow along in the mushaf to protect against mistakes. <a href="https://quran.com/page/${p}" target="_blank" rel="noopener">Open page ${p} on Quran.com</a>`}
    else if(z.id==='tafsir'){title='Read the tafsir';note='Al-Mukhtasar fi al-Tafsir (English) or Tafsir al-Muyassar (Arabic), any time today.'}
    else if(z.id==='memo'){
      if(ln&&ln[1]<15){title=`Memorize ${linesTxt(ln)} of p. ${p}`;note=`Watch where each verse stops and starts. Carry on a little into line ${ln[1]+1} so the parts join.`}
      else{const pre=ln&&ln[0]>1?`Memorize ${linesTxt(ln)} of p. ${p}`:'Memorize the page';
        title=endOfSurah?`${pre} · end of Surah ${esc(it.s)}`:`${pre}${next?' + first line of p. '+next:''}`;
        note=(ln&&ln[0]>1?'Recite it joined to the lines before. ':'')+(endOfSurah?`Watch where each verse stops and starts. This completes the surah${nextDone?`. Page ${next} starts ${esc(surahsOn(next)[0])}, which you’ve already memorized, so joining its first line is optional`:''}.`:'Watch where each verse stops and starts. Don’t stop at the last verse; join it to the next page.')}}
    else if(z.id==='rec'){title=`Record ${c} recitation${c>1?'s':''} from memory`;note=`Play them back while looking at the mushaf. Even one mistake means record all ${c} again.${x.recReset?` Restarted ${x.recReset}×.`:''}`}
    else if(z.id==='reps'){title=`Repeat ${c}× from memory`;note=`A repetition with a mistake doesn’t count.${x.miss?` ${x.miss} mistake${x.miss>1?'s':''} so far.`:''}`}
    else if(z.id==='join'){const split=x.split!=null?x.split:surahsOn(p).length>1;const own=it?it.s:surahOf(p);
      title=split?`Repeat the ${esc(own)} part of p. ${p} ${c}×`:`Repeat the whole page ${c}×`;
      note=(split?`Join both halves, but only the ${esc(own)} part. The other surah on this page is recited with its own surah.`:'Recite both halves joined as one page, from memory.')+` <button class="flag ${split?'on':''}" data-act="splitTog" data-p="${p}" style="margin-top:6px">${split?'Page has two surahs ✓':'Page has two surahs?'}</button>`}
    else title=esc(z.label||'Custom step')+(c>1?` ${c}×`:'');
    if(z.label&&STEP_NAMES[z.id])title=esc(z.label)+(c>1?` · ${c}×`:'');
    let ctl;
    if(z.id==='rec')ctl=`<div class="row"><span class="chip ${ok?'done':v?'prog':''} num">${v} / ${c} clean</span><button class="btn" data-act="inc" ${at} ${dis}>Clean recording</button><button class="btn warn" data-act="recBad" ${at} ${locked||ok||!v?'disabled':''}>Found a mistake</button></div>`;
    else if(c===1)ctl=`<div class="row"><button class="check ${v?'on':''}" data-act="tog" ${at} ${locked?'disabled':''}><span class="box">✓</span>${z.id==='memo'?'I’ve memorized it':'Done'}</button></div>`;
    else if(c<=10&&z.id!=='reps')ctl=`<div class="row"><div class="dots">${Array.from({length:c},(_,q)=>`<button class="dot ${q<v?'on':''}" data-act="dot" ${at} data-i="${q+1}" ${locked?'disabled':''} aria-label="${q+1}">${q+1}</button>`).join('')}</div></div>`;
    else ctl=`<div class="counter">${locked?ring(0,c,'noop','disabled'):ring(v,c,'inc',at)}<div class="ctrls"><button class="btn pri" data-act="inc" ${at} ${dis}>+1${z.id==='reps'?' clean':''}</button>${z.id==='reps'?`<button class="btn warn" data-act="repMiss" ${at} ${dis}>Mistake · doesn’t count</button>`:''}<button class="btn" data-act="dec" ${at} ${v>0?'':'disabled'}>Undo</button></div></div>`;
    if(!z.req)note=(note?note+' ':'')+'<em>Optional.</em>';
    return `<div class="step ${ok?'ok':''} ${locked?'locked':''} ${col}"><span class="n">${ok?'✓':i}</span><div><div class="h">${title}</div>${note?`<div class="note">${note}</div>`:''}${ctl}</div></div>`;
  }).join('');
  return `<section class="card"><div class="card-h"><div><div class="label">New page${ln?' · '+linesTxt(ln):''}</div><h2>Page ${p}</h2></div><span class="small muted">${esc(surahProgress(p))}</span></div>${surahsOn(p).length>1?`<p class="small muted" style="margin:-4px 0 8px">This page holds ${esc(surahsOn(p).join(', '))}. Memorize the part you’re on; the rest is already done or comes later.</p>`:''}
  <div class="steps">${body||'<div class="empty">No steps are turned on. Add some in Settings → New page checklist.</div>'}</div></section>`;
}
function stepSummary(){const st=S.settings;return st.steps.filter(z=>z.on).map(z=>(z.label||STEP_SHORT[z.id]||'Step')+(z.count>1?' ×'+z.count:'')).join(' · ')||'No steps set'}

function vConnection(){
  const s=status(),P=s.P,st=s.st,lg=s.lg,t=s.t;
  let h=`<h2 style="font-size:22px">Connection</h2><p class="muted" style="margin:-6px 0 0">After its day of ${st.yreps} repetitions, each page comes here. Recite it once a day from memory; after ${P.tgt} recitations it moves to revision. Missed days don’t count.</p>`;
  h+=`<div class="stats"><div class="stat"><b class="num">${s.cTotal}</b><span>in connection</span></div><div class="stat"><b class="num">${s.cDone}/${s.cTotal}</b><span>done today</span></div><div class="stat"><b class="num">${P.graduating}</b><span>move to revision tomorrow</span></div></div>`;
  if(!P.conn.length){h+=`<div class="empty">${P.yl?'Only yesterday’s page so far — it’s handled in Yesterday’s repetition. Tomorrow it joins Connection.':'Connection starts once you’ve memorized a couple of pages.'}</div>`;return h}
  const sorted=P.conn.slice().sort((a,b)=>Math.min(...a.pages)-Math.min(...b.pages));
  const groups=[];sorted.forEach(l=>{const sn=ownerSurah(Math.min(...l.pages));const g=groups[groups.length-1];if(g&&g.s===sn)g.ls.push(l);else groups.push({s:sn,ls:[l]})});
  const row=l=>{const on=!!lg.conn[l.n];return `<div class="li"><button class="cb ${on?'on':''}" data-act="conn" data-n="${l.n}" aria-label="Mark page ${range(l.pages)} recited">✓</button><div class="m"><b>Page ${lessonLabel(l)}</b><div><span class="num">${Math.min(P.tgt,ccBefore(l.n,lg)+(on?1:0))}/${P.tgt}</span> · ${l.virtual?'Memorized before':'Lesson '+l.n}${l.virtual?'':' · '+fmt(fromKey(l.date),{month:'short',day:'numeric'})}</div></div>${l.pages.map(p=>`<button class="flag ${S.weak[p]?'on':''}" data-act="weak" data-p="${p}">${S.weak[p]?'Weak':'Flag'}</button>`).join('')}</div>`};
  h+=`<section class="card"><div class="card-h"><div><h2>Today’s connection</h2><div class="small muted">Grouped by surah, in reading order</div></div><button class="btn" data-act="connAll">${s.cDone===s.cTotal?'Clear all':'Mark all done'}</button></div>${groups.map(g=>{const pg=[].concat(...g.ls.map(l=>l.pages));const dn=g.ls.filter(l=>lg.conn[l.n]).length;const names=[...new Set([].concat(...pg.slice().sort((a,b)=>a-b).map(surahsOn)))];const label=names.length>2?names[0]+' – '+names[names.length-1]:names.join(', ');return `<div class="grp"><div class="grp-h"><b>${esc(label)}</b><span class="num">${pg.length>1?'pp. ':'p. '}${range(pg)} · ${dn}/${g.ls.length}</span></div><div class="list">${g.ls.map(row).join('')}</div></div>`}).join('')}</section>`;
  if(s.cDone===s.cTotal){
    let ad=null,AP=null;const d0=fromKey(t);for(let k=0;k<14;k++){d0.setDate(d0.getDate()+1);const key=dk(d0),pp=plan(key),lg2=S.logs[key]||{conn:{}};if(pp.conn.length&&!pp.conn.every(l=>lg2.conn&&lg2.conn[l.n])){ad=key;AP=pp;break}}
    const doneAhead=Object.keys(S.logs).filter(k=>k>t&&S.logs[k].conn&&Object.keys(S.logs[k].conn).length&&plan(k).conn.every(l=>S.logs[k].conn[l.n])).sort();
    if(ad||doneAhead.length){h+=`<section class="card"><div class="card-h"><div><div class="label">Ahead</div><h2>${ad?esc(cap(dayName(ad)))+'’s connection':'Connection ahead'}</h2></div>${doneAhead.length?chipFor('done',doneAhead.length+' day'+(doneAhead.length>1?'s':'')+' ahead'):''}</div>`;
      if(doneAhead.length)h+=`<p class="small muted" style="margin:-4px 0 8px">Already done: ${doneAhead.map(k=>esc(dayName(k))).join(', ')}.</p>`;
      if(ad){const lg2=log(ad);h+=ui.aheadConn?`<p class="small muted" style="margin:0 0 4px">Each tick counts as ${esc(dayName(ad))}’s recitation of that page.</p><div class="list">${AP.conn.slice().sort((a,b)=>Math.min(...a.pages)-Math.min(...b.pages)).map(l=>{const on=!!lg2.conn[l.n];return `<div class="li"><button class="cb ${on?'on':''}" data-act="connA" data-d="${ad}" data-n="${l.n}" aria-label="Mark page ${range(l.pages)} recited">✓</button><div class="m"><b>Page ${lessonLabel(l)}</b><div>${esc(ownerSurah(Math.min(...l.pages)))} · <span class="num">${Math.min(P.tgt,ccBefore(l.n,lg2)+(on?1:0))}/${P.tgt}</span></div></div><span></span></div>`}).join('')}</div><div class="row"><button class="btn pri" data-act="connAllA" data-d="${ad}">Mark all done</button><button class="btn" data-act="connAheadClose">Close</button></div>`
        :`<div class="row" style="margin-top:0"><button class="btn" data-act="connAheadOpen">Do ${esc(dayName(ad))}’s connection now · ${AP.conn.length} page${AP.conn.length>1?'s':''}</button></div>`}
      h+='</section>'}
  }
  return h;
}
function daysAgo(k){if(!k)return'never';const d=Math.round((fromKey(TODAY())-fromKey(k))/864e5);return d<=0?'today':d===1?'yesterday':d+' days ago'}
function weakList(){return Object.keys(S.wk).map(Number).map(p=>({p,...S.wk[p]})).sort((a,b)=>((a.last||'')<(b.last||'')?-1:(a.last||'')>(b.last||'')?1:0)||(a.p-b.p))}
function weakSuggestions(){return Object.keys(S.miss).map(Number).filter(p=>S.miss[p]>=3&&!S.wk[p]&&!(S.wkNo[p]>=S.miss[p])&&memorizedSet().has(p)).sort((a,b)=>S.miss[b]-S.miss[a]).slice(0,5)}
function vWeak(){
  const need=Math.max(1,S.settings.weakClear|0),t=TODAY(),list=weakList();
  let h=`<section class="card" id="weak"><div class="card-h"><div><div class="label">Any time · no schedule</div><h2>Weak pages</h2></div><span class="small muted num">${list.length}</span></div>`;
  if(!list.length)return h+`<div class="empty">Flag a shaky page from Connection, Revision or Yesterday’s repetition. It comes off after ${need} clean recitations.</div></section>`;
  h+=`<p class="small muted" style="margin:-4px 0 6px">Recite it from memory and tap after each recitation. Mistakes are tracked but don’t reset the count. ${need} clean recitations and it comes off the list.</p><div class="list">${list.map(w=>{const p=w.p,c=Math.min(w.clean||0,need);
    return `<div class="li wkrow"><div class="m"><b>Page ${p}</b><div>${esc(surahOf(p))} ${need<=7?`<span class="wkdots" aria-label="${c} of ${need} clean recitations">${Array.from({length:need},(_,i)=>`<i class="${i<c?'on':''}"></i>`).join('')}</span>`:`<span class="wkbar" aria-hidden="true"><b style="width:${Math.round(c/need*100)}%"></b></span><span class="num">${c}/${need}</span>`}</div></div><div class="wkb"><button class="btn pri" data-act="wkClean" data-p="${p}">Clean</button><button class="btn warn" data-act="wkMiss" data-p="${p}">Mistake</button>${w.prev?`<button class="mini" data-act="wkUndo" data-p="${p}" aria-label="Undo last tap" style="height:auto">↶</button>`:''}</div></div>`}).join('')}</div>`;
  return h+'</section>';
}
function dayName(k){const tm=fromKey(TODAY());tm.setDate(tm.getDate()+1);return k===dk(tm)?'tomorrow':fmt(fromKey(k),{weekday:'long'})}
function cap(x){return x.charAt(0).toUpperCase()+x.slice(1)}
function vRevision(){
  const s=status(),P=s.P,st=s.st,lg=s.lg,t=s.t;
  let h=`<h2 style="font-size:22px">Revision</h2><p class="muted" style="margin:-6px 0 0">Pages that have finished connection, recited from memory in mushaf order. You get through all of them about every ${P.cyc} days.</p>`;
  if(!P.old.length){h+=`<div class="empty">No old memorization yet. Pages move here after ${P.tgt} days of connection. If you memorized pages before starting, add them in Settings.</div>`;return h+vWeak()}
  const top=S.revStack[S.revStack.length-1];const canUndo=top&&top.date>=t;
  const row=(p,on,act,dis)=>`<div class="li"><button class="cb ${on?'on':''}" data-act="${act}" data-p="${p}" ${dis?'disabled':''} aria-label="Mark page ${p} recited">✓</button><div class="m"><b>Page ${p}</b><div>${esc(pageMeta(p))}${S.miss[p]?` · ${S.miss[p]} past mistake${S.miss[p]>1?'s':''}`:''}</div></div><button class="flag ${S.weak[p]?'on':''}" data-act="weak" data-p="${p}">${S.weak[p]?'Weak':'Flag'}</button></div>`;
  h+=`<section class="card"><div class="card-h"><div><div class="label">Today · ${P.portion.length} page${P.portion.length>1?'s':''}</div><h2>Part ${P.partOf(P.portion)} of ${P.nParts}</h2><div class="small muted">Pages ${range(P.portion)}</div></div>${s.rDone?chipFor('done','Done'):chipFor(s.rChk?'prog':'',s.rChk+'/'+P.portion.length)}</div>`;
  h+=`<div class="list">${P.portion.map(p=>row(p,s.rDone||!!lg.revChk[p],'revChk',s.rDone)).join('')}</div>`;
  h+=`<div class="row">${s.rDone?(canUndo?`<button class="btn" data-act="revUndo">${top.extra?'Undo extra part '+P.partOf((S.revExtra[t]||[]).slice(-1)[0])+' of '+P.nParts:'Undo, reopen today’s pages'}</button>`:''):`<button class="btn pri" data-act="revFinish">Finish today’s revision</button>`}</div></section>`;
  if(s.rDone&&P.ahead.length){
    const ac=lg.aheadChk||{};const nm='part '+P.partOf(P.ahead)+' of '+P.nParts;
    h+=`<section class="card"><div class="card-h"><div><div class="label">Extra</div><h2>Next: ${cap(nm)}</h2></div>${P.aheadDone.length?chipFor('done','+'+P.aheadDone.length+' extra today'):''}</div>`;
    if(P.aheadDone.length)h+=`<p class="small muted" style="margin:-4px 0 8px">Extra parts done today: ${P.aheadDone.map(pp=>'part '+P.partOf(pp)+' (pp. '+range(pp)+')').join(', ')}.</p>`;
    h+=ui.ahead?`<p class="small muted" style="margin:0 0 4px">Pages ${range(P.ahead)}. This moves you further through the cycle. Tomorrow you still do a part as usual.</p><div class="list">${P.ahead.map(p=>row(p,!!ac[p],'aheadChk',false)).join('')}</div><div class="row"><button class="btn pri" data-act="revAheadFinish">Finish ${esc(nm)}</button><button class="btn" data-act="revAheadClose">Cancel</button></div>`
      :`<div class="row" style="margin-top:0"><button class="btn" data-act="revAheadOpen">Do ${esc(nm)} as an extra · ${P.ahead.length} pages</button></div>`;
    h+='</section>';
  }
  const left=P.old.length-P.roundDone;
  h+=`<section class="card"><div class="card-h"><h2>This round</h2><span class="small muted num">${P.roundDone} of ${P.old.length} pages</span></div><div class="task" style="padding:0;border:0;grid-template-columns:1fr"><span class="bar" style="margin:0"><b style="width:${Math.round(P.roundDone/P.old.length*100)}%"></b></span></div><p class="small muted" style="margin:10px 0 0">${left?`About ${Math.ceil(left/Math.max(1,P.per))} more day${Math.ceil(left/Math.max(1,P.per))>1?'s':''} to finish this round.`:'Round complete. The next one starts from the beginning.'} Missed days never skip pages, and pages that join revision mid-round are picked up next round.</p></section>`;
  return h+vWeak();
}
function vProgress(){
  const P=plan(),mem=memorizedSet(),tp=todaysPages();
  const conn=new Set();P.conn.forEach(l=>l.pages.forEach(p=>conn.add(p)));
  const fresh=new Set([...(P.yl?P.yl.pages:[]),...(tp.done?tp.pages:[])]);
  let rows='';
  for(let j=0;j<30;j++){const a=JUZ[j],b=j<29?JUZ[j+1]-1:TOTAL;let c='';for(let p=a;p<=b;p++){const cls=fresh.has(p)?'new':conn.has(p)?'conn':mem.has(p)?'rev':'';c+=`<span class="cell ${cls} ${S.weak[p]?'weak':''}" title="p. ${p} · ${esc(surahOf(p))}"></span>`}rows+=`<div class="juz"><span class="jl num">Juz ${j+1}</span><div class="cells">${c}</div></div>`}
  let h=`<h2 style="font-size:22px">Progress</h2><div class="stats"><div class="stat"><b class="num">${mem.size}</b><span>of ${TOTAL} pages</span></div><div class="stat"><b class="num">${streak()}</b><span>day streak</span></div><div class="stat"><b>${projection()}</b><span>projected finish</span></div></div>`;
  h+=`<section class="card"><div class="card-h"><h2>The mushaf</h2><span class="small muted">one square per page</span></div><div style="overflow-x:auto">${rows}</div><div class="legend"><span><i style="background:var(--c-new)"></i>Today / yesterday</span><span><i style="background:var(--c-conn)"></i>Connection</span><span><i style="background:var(--c-rev)"></i>Revision</span><span><i style="background:var(--c-none)"></i>Not yet</span><span><i style="background:var(--c-none);outline:2px solid var(--danger);outline-offset:-1px"></i>Weak</span></div></section>`;
  const wl=weakList();
  h+=`<section class="card"><div class="card-h"><h2>Weak pages</h2><button class="btn" data-act="goWeak">Open</button></div><p class="small muted" style="margin:0">${wl.length?`${wl.length} page${wl.length>1?'s':''} flagged`:'None flagged'}</p></section>`;
  const recent=S.lessons.slice(-10).reverse();
  h+=`<section class="card"><div class="card-h"><h2>Recent lessons</h2>${S.lessons.length?`<button class="btn" data-act="undoLesson">Undo last lesson</button>`:''}</div>${ui.confirmUndo?`<div class="confirm">Remove lesson ${S.lessons[S.lessons.length-1].n} (page ${lessonLabel(S.lessons[S.lessons.length-1])})? Its page becomes today’s page again.<div class="row"><button class="btn warn" data-act="undoYes">Remove lesson</button><button class="btn" data-act="undoNo">Keep it</button></div></div>`:''}${recent.length?`<div class="list">${recent.map(l=>`<div class="li"><span class="chip num">#${l.n}</span><div class="m"><b>Page ${lessonLabel(l)}</b><div>${esc(pageMeta(l.pages[0]))}</div></div><span class="small muted">${fmt(fromKey(l.date),{month:'short',day:'numeric'})}</span></div>`).join('')}</div>`:'<div class="empty">Lessons you complete appear here.</div>'}</section>`;
  return h;
}
function priorFields(st){
  const opts=['<option value="0">Nothing yet</option>'].concat(SURAHS.map((x,i)=>i+1).reverse().map(n=>`<option value="${n}" ${st.priorTo===n?'selected':''}>An-Nas → ${esc(SURAHS[n-1][0])}</option>`)).join('');
  let nx=st.priorTo-1;while(nx>=1&&!surahBlock(nx).length)nx--;
  const blk=st.priorTo>=2&&nx>=1?surahBlock(nx):[];
  const part=blk.length>1?`<div class="field"><div class="fl"><b>Plus pages of ${esc(SURAHS[nx-1][0])}</b><span>Counted from its start · ${blk.length} pages</span></div><input type="number" id="set-priorPart" data-set="priorPart" min="0" max="${blk.length-1}" value="${st.priorPart||0}" inputmode="numeric"></div>`:'';
  const tp=todaysPages();const np=tp.done?null:tp.pages[0];
  return `<div class="field full"><div class="fl"><b>Memorized so far</b><span>These pages start in revision</span></div><select id="set-priorTo" data-set="priorTo" style="width:100%">${opts}</select></div>
   ${part}
   ${priorSet().size?`<div class="field"><div class="fl"><b>Still in connection</b><span>Your most recent memorized pages · each needs ${st.connTarget} recitations before revision</span></div><input type="number" id="set-priorConn" data-set="priorConn" min="0" max="${priorSet().size}" value="${st.priorConn||0}" inputmode="numeric"></div>`:''}
   ${np?`<p class="small muted" style="margin:2px 0 4px">Next new page: p. ${np} · ${esc(surahProgress(np))}</p>`:''}`;
}
function vSettings(){
  const st=S.settings;const D=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  const num=(k,label,hint,min,max)=>`<div class="field"><div class="fl"><b>${label}</b><span>${hint}</span></div><input type="number" id="set-${k}" data-set="${k}" min="${min}" max="${max}" value="${st[k]}" inputmode="numeric"></div>`;
  let h=`<h2 style="font-size:22px">Settings</h2>`;
  h+=`<section class="card"><div class="card-h"><h2>Plan</h2><span class="small muted">An-Nas → Al-Fatihah</span></div>
   ${priorFields(st)}
   <div class="field"><div class="fl"><b>Usual amount per day</b><span>${(m=>m>=12?'About '+Math.floor(m/12)+' yr'+(m%12?' '+(m%12)+' mo':''):'About '+m+' months')(Math.round(604/amtPages(st.ppd)/30.4))} for the whole Quran</span></div><select id="set-ppd" data-set="ppd">${['1L','2L','3L','4L','5L','6L','half','1','2','3'].map(k=>`<option value="${k}" ${st.ppd===k?'selected':''}>${amtLabel(k)}</option>`).join('')}</select></div>
   <div class="field full"><div class="fl"><b>Rest days</b><span>No new page; review continues</span></div><div class="days">${D.map((d,i)=>`<button data-act="restDay" data-i="${i}" class="${st.rest.includes(i)?'on':''}" aria-pressed="${st.rest.includes(i)}">${d}</button>`).join('')}</div></div>
  </section>`;
  h+=`<section class="card"><div class="card-h"><h2>New page checklist</h2></div><p class="small muted" style="margin:0 0 6px">The page can be marked memorized once every <b>required</b> step is done. Set × to 1 for a checkbox, or higher for a counter.</p>
   <div class="slist">${st.steps.map((z,k)=>`<div class="srow ${z.on?'':'off'}"><button class="sw ${z.on?'on':''}" data-act="stepOn" data-id="${z.id}" aria-pressed="${z.on}" aria-label="${z.on?'Turn off':'Turn on'} step"></button><input type="text" id="step-${z.id}" data-step-label="${z.id}" value="${esc(z.label||STEP_NAMES[z.id]||'')}" aria-label="Step name"><div class="sbtns"><label class="cnt">×<input type="number" id="cnt-${z.id}" data-stepcount="${z.id}" min="1" max="500" value="${z.count}" inputmode="numeric" aria-label="How many times"></label><button class="flag ${z.req?'on':''}" data-act="stepReq" data-id="${z.id}" ${z.on?'':'disabled'}>${z.req?'Required':'Optional'}</button><button class="mini" data-act="stepMove" data-id="${z.id}" data-dir="-1" ${k?'':'disabled'} aria-label="Move up">↑</button><button class="mini" data-act="stepMove" data-id="${z.id}" data-dir="1" ${k<st.steps.length-1?'':'disabled'} aria-label="Move down">↓</button>${z.custom?`<button class="mini" data-act="stepDel" data-id="${z.id}" aria-label="Remove step">✕</button>`:''}</div></div>`).join('')}</div>
   <div class="row"><input type="text" id="new-step" placeholder="Add a step, e.g. Recite to my teacher" style="flex:1;min-width:0;padding:9px 11px;border-radius:9px;border:1px solid var(--line);background:var(--surface);color:var(--ink);font:inherit"><button class="btn" data-act="stepAdd">Add</button></div>
   ${num('joinReps','Page finished in parts','The next day, the whole page is repeated joined this many times instead of the usual yesterday’s repetitions · 0 = off',0,200)}
   <div class="field" style="margin-top:8px"><div class="fl"><b>Keep steps in order</b><span>Each step unlocks after the required ones above it</span></div><button class="sw ${st.inOrder?'on':''}" data-act="inOrder" aria-pressed="${st.inOrder}" aria-label="Keep steps in order"></button></div>
  </section>`;
  h+=`<section class="card"><div class="card-h"><h2>Review</h2></div>
   ${num('yreps','Yesterday’s repetitions','Times from memory, the day after',1,50)}
   ${num('connTarget','Connection recitations','Days a page is recited before revision',1,60)}
   ${num('cycle','Revision cycle','Days to get through all old pages',1,60)}
   ${num('weakClear','Weak page recovery','Clean recitations to come off the list',1,60)}
  </section>`;
  h+=`<section class="card"><div class="card-h"><h2>Backup</h2></div>
   <p class="small muted" style="margin:0 0 8px">Save your progress to a file, or restore it here or on another device.</p>
   <div class="row" style="margin-top:0"><button class="btn pri" data-act="exportBk">Save a backup</button><button class="btn" data-act="importPick">Restore from backup</button><input type="file" id="importFile" accept=".json,application/json" hidden></div>
   ${ui.pendingImport?`<div class="confirm" style="margin-top:10px">Replace everything here with the backup from ${esc(ui.pendingImport.when)} (${ui.pendingImport.pages} pages memorized, ${ui.pendingImport.lessons} lessons)?<div class="row"><button class="btn warn" data-act="importYes">Replace with backup</button><button class="btn" data-act="importNo">Cancel</button></div></div>`:''}
   ${ui.msg?`<p class="small" style="margin:10px 0 0">${esc(ui.msg)}</p>`:''}
  </section>`;
  h+=`<section class="card"><div class="card-h"><h2>Data</h2>${syncHtml()}</div>
   <div class="row" style="margin-top:0"><button class="btn" data-act="defaults">Restore Tikrar defaults</button>${ui.confirmReset?'':`<button class="btn warn" data-act="reset">Reset all progress</button>`}</div>
   <p class="small muted" style="margin:8px 0 0">Defaults resets the checklist, counts and review settings. Your memorized pages and rest days stay.</p>
   ${ui.confirmReset?`<div class="confirm" style="margin-top:10px">Erase all lessons, logs and settings? This can’t be undone.<div class="row"><button class="btn warn" data-act="resetYes">Erase everything</button><button class="btn" data-act="resetNo">Cancel</button></div></div>`:''}
  </section>`;
  return h;
}
function widgetDays(){
  const out=[],d=fromKey(TODAY()),st=S.settings,wk=Object.keys(S.wk).length;
  for(let i=0;i<7;i++){const k=dk(d),s=status(k),tp=s.tp,P=s.P;
    const p=tp.pages[0];
    const page=tp.finished?'All memorized':s.rest&&!tp.done?'Rest day':p?'p. '+range(tp.pages):'—';
    const sub=p&&!(s.rest&&!tp.done)?(tp.lines?(tp.lines[0]===tp.lines[1]?'Line ':'Lines ')+tp.lines[0]+(tp.lines[0]===tp.lines[1]?'':'–'+tp.lines[1])+' · ':'')+surahProgress(p).replace(/^Surah /,''):'Review only';
    const rows=[
      {tab:'memorize',label:'New page',done:s.newState!=='todo',detail:tp.done?'Done':s.rest?'Rest day':i===0?(s.newFrac>=1?'mark done':Math.round(s.newFrac*100)+'%'):'To do'},
      {tab:'memorize',label:'Yesterday',done:s.yDone,detail:!s.yNeed?'—':s.yDone?'Done':s.yCount+'/'+s.yT},
      {tab:'connection',label:'Connection',done:s.cDone===s.cTotal,detail:s.cTotal?s.cDone+'/'+s.cTotal:'—'},
      {tab:'revision',label:'Revision',done:s.rDone,detail:!s.rNeed?'—':s.rDone?(lastRevPart(P,k)?'part '+lastRevPart(P,k)+'/'+P.nParts:'Done'):s.rChk+'/'+P.portion.length}];
    out.push({date:k,page,sub,rows,allDone:s.allDone,weak:wk});d.setDate(d.getDate()+1)}
  return out;
}
let lastWidget='';
function pushWidget(){if(!window.AndroidBridge||!AndroidBridge.updateWidget)return;try{const j=JSON.stringify({v:1,days:widgetDays()});if(j!==lastWidget){lastWidget=j;AndroidBridge.updateWidget(j)}}catch(e){}}
function goBack(){if(ui.tab!=='today'){act('tab',{v:'today'});return'stay'}return'exit'}
function render(){
  const v={today:vToday,memorize:vMemorize,connection:vConnection,revision:vRevision,progress:vProgress,settings:vSettings}[ui.tab]||vToday;
  document.getElementById('app').innerHTML=header()+`<main class="stack">${v()}</main>`+(ui.tab!=='settings'?`<p class="small muted" style="text-align:center;margin-top:18px">${syncHtml()}</p>`:'');
  const s=status();
  const pips={today:!s.allDone,memorize:(s.newState==='todo')||!s.yDone,connection:s.cDone<s.cTotal,revision:!s.rDone,progress:false};
  const tabs=[['today','Today'],['memorize','Memorize'],['connection','Connection'],['revision','Revision'],['progress','Progress']];
  document.getElementById('nav').innerHTML=`<div class="in">${tabs.map(([k,l])=>`<button class="${ui.tab===k?'on':''}" data-act="tab" data-v="${k}" aria-current="${ui.tab===k?'page':'false'}"><span class="ico">${IC[k]}${k==='revision'&&Object.keys(S.wk).length?`<span class="nbadge num">${Object.keys(S.wk).length}</span>`:''}</span>${l}<span class="pip ${pips[k]&&k!=='today'?'todo':''}"></span></button>`).join('')}</div>`;
  pushWidget();
}

/* ---------- Actions ---------- */
let wake=null;
function keepAwake(){if(wake||!navigator.wakeLock)return;navigator.wakeLock.request('screen').then(w=>{wake=w;w.addEventListener('release',()=>{wake=null})}).catch(()=>{})}
function buzz(){try{navigator.vibrate&&navigator.vibrate(12)}catch(e){}}
function act(a,d){
  const t=TODAY(),st=S.settings,p=d.p?+d.p:null;let changed=true;
  switch(a){
    case 'tab':ui.tab=d.v;ui.aheadMem=ui.aheadConn=ui.ahead=false;ui.confirmReset=ui.confirmUndo=false;ui.msg='';ui.pendingImport=null;changed=false;render();window.scrollTo(0,0);return;
    case 'noop':return;
    case 'openStep':ui.openStep[p]=+d.i;render();return;
    case 'dayPpd':{const wd=workTarget().date,lg=log(wd),v=normAmt(d.v),b=workTarget(),p0=b.pages[0],k0=p0?pkey(p0):null;if(v===st.ppd)delete lg.ppd;else lg.ppd=v;const a2=workTarget();if(p0&&a2.pages[0]===p0){const k1=pkey(p0);if(k1!==k0&&S.pp[k0]&&!S.pp[k1]){S.pp[k1]=S.pp[k0];delete S.pp[k0]}}ui.openStep={};break}
    case 'exportBk':exportBackup();return;
    case 'importPick':{const f=document.getElementById('importFile');if(f){f.value='';f.click()}return}
    case 'importNo':ui.pendingImport=null;render();return;
    case 'importYes':{if(!ui.pendingImport)return;S=normalize(ui.pendingImport.state);ui.pendingImport=null;ui.msg='Backup restored.';ui.openStep={};break}
    case 'workRest':{log().work=1;break}
    case 'splitTog':{const x=pst(p);const cur=x.split!=null?x.split:surahsOn(p).length>1;x.split=!cur;break}
    case 'inc':{const x=pst(p),z=st.steps.find(q=>q.id===d.id)||(d.id==='join'?{count:st.joinReps}:null);if(!z)return;setCount(x,d.id,Math.min(z.count,getCount(x,d.id)+1));buzz();if(z.count>10)keepAwake();break}
    case 'dec':{const x=pst(p);setCount(x,d.id,getCount(x,d.id)-1);break}
    case 'tog':{const x=pst(p);setCount(x,d.id,getCount(x,d.id)?0:1);break}
    case 'dot':{const x=pst(p),i=+d.i;setCount(x,d.id,getCount(x,d.id)>=i?i-1:i);break}
    case 'recBad':{const x=pst(p);setCount(x,'rec',0);x.recReset=(x.recReset||0)+1;S.miss[p]=(S.miss[p]||0)+1;break}
    case 'stepOn':{const z=st.steps.find(q=>q.id===d.id);if(z)z.on=!z.on;break}
    case 'stepReq':{const z=st.steps.find(q=>q.id===d.id);if(z)z.req=!z.req;break}
    case 'stepMove':{const k=st.steps.findIndex(q=>q.id===d.id),m=k+(+d.dir);if(k<0||m<0||m>=st.steps.length)return;const t2=st.steps[k];st.steps[k]=st.steps[m];st.steps[m]=t2;break}
    case 'stepDel':st.steps=st.steps.filter(q=>q.id!==d.id);break;
    case 'stepAdd':{const inp=document.getElementById('new-step');const v=(inp&&inp.value||'').trim();if(!v)return;st.steps.push({id:'c'+Date.now().toString(36),custom:true,label:v.slice(0,80),on:true,req:true,count:1});break}
    case 'inOrder':st.inOrder=!st.inOrder;break;
    case 'repMiss':{const x=pst(p);x.miss=(x.miss||0)+1;S.miss[p]=(S.miss[p]||0)+1;break}
    case 'aheadMemOpen':ui.aheadMem=true;ui.openStep={};render();return;
    case 'aheadMemClose':ui.aheadMem=false;ui.openStep={};render();return;
    case 'complete':{const tp=workTarget();if(tp.done||!tp.pages.length)return;ui.aheadMem=false;const L={n:S.lessons.length+1,pages:tp.pages.slice(),date:tp.date};if(tp.lines)L.lines=tp.lines.slice();S.lessons.push(L);break}
    case 'ySplitTog':{const P=plan();if(!P.yl)return;P.yl.split=!joinSplit(P.yl);break}
    case 'y':{const lg=log(),P=plan();if(!P.yl)return;const yt=yTarget(P.yl);lg.y=Math.min(yt,(lg.y||0)+1);if(lg.y>=yt)P.yl.yDate=t;buzz();keepAwake();break}
    case 'yUndo':{const lg=log(),P=plan();lg.y=Math.max(0,(lg.y||0)-1);if(P.yl&&P.yl.yDate===t&&lg.y<yTarget(P.yl))delete P.yl.yDate;break}
    case 'connA':{const lg=log(d.d),n=d.n;if(lg.conn[n]){delete lg.conn[n];S.cc[n]=Math.max(0,(S.cc[n]||0)-1)}else{lg.conn[n]=1;S.cc[n]=(S.cc[n]||0)+1}break}
    case 'connAllA':{const lg=log(d.d),P=plan(d.d);const all=P.conn.every(l=>lg.conn[l.n]);P.conn.forEach(l=>{const n=l.n;if(all){if(lg.conn[n]){delete lg.conn[n];S.cc[n]=Math.max(0,(S.cc[n]||0)-1)}}else if(!lg.conn[n]){lg.conn[n]=1;S.cc[n]=(S.cc[n]||0)+1}});break}
    case 'connAheadOpen':ui.aheadConn=true;render();return;
    case 'connAheadClose':ui.aheadConn=false;render();return;
    case 'conn':{const lg=log();const n=d.n;if(lg.conn[n]){delete lg.conn[n];S.cc[n]=Math.max(0,(S.cc[n]||0)-1)}else{lg.conn[n]=1;S.cc[n]=(S.cc[n]||0)+1}break}
    case 'connAll':{const lg=log(),P=plan();const all=P.conn.every(l=>lg.conn[l.n]);P.conn.forEach(l=>{const n=l.n;if(all){if(lg.conn[n]){delete lg.conn[n];S.cc[n]=Math.max(0,(S.cc[n]||0)-1)}}else if(!lg.conn[n]){lg.conn[n]=1;S.cc[n]=(S.cc[n]||0)+1}});break}
    case 'weak':if(S.wk[p]){delete S.wk[p];delete S.weak[p]}else{S.wk[p]={since:t,reviews:0,clean:0,mistakes:0,last:null,note:''};S.weak[p]=1}break;
    case 'wkClean':{const w=S.wk[p];if(!w)return;w.prev={clean:w.clean||0,mistakes:w.mistakes||0};w.clean=(w.clean||0)+1;w.last=t;w.reviews=(w.reviews||0)+1;buzz();
      if(w.clean>=Math.max(1,st.weakClear|0)){S.recovered.push({p,since:w.since,cleared:t,reviews:w.reviews});delete S.wk[p];delete S.weak[p]}break}
    case 'wkMiss':{const w=S.wk[p];if(!w)return;w.prev={clean:w.clean||0,mistakes:w.mistakes||0};w.last=t;w.reviews=(w.reviews||0)+1;w.mistakes=(w.mistakes||0)+1;S.miss[p]=(S.miss[p]||0)+1;break}
    case 'wkUndo':{const w=S.wk[p];if(!w||!w.prev)return;if((w.mistakes||0)>w.prev.mistakes)S.miss[p]=Math.max(0,(S.miss[p]||0)-1);w.clean=w.prev.clean;w.mistakes=w.prev.mistakes;delete w.prev;break}
    case 'goWeak':ui.tab='revision';render();setTimeout(()=>{const el=document.getElementById('weak');if(el)el.scrollIntoView({behavior:'smooth',block:'start'})},30);return;
    case 'revChk':{const lg=log();if(lg.revChk[p])delete lg.revChk[p];else lg.revChk[p]=1;break}
    case 'revFinish':{const P=plan();if(S.revLog[t]||!P.portion.length)return;S.revStack.push({date:t,prev:S.revLast||0});S.revLog[t]=P.portion.slice();S.revLast=P.portion[P.portion.length-1];const lg=log();P.portion.forEach(q=>lg.revChk[q]=1);ui.ahead=false;break}
    case 'revAheadOpen':ui.ahead=true;render();return;
    case 'revAheadClose':ui.ahead=false;render();return;
    case 'aheadChk':{const lg=log();if(!lg.aheadChk)lg.aheadChk={};if(lg.aheadChk[p])delete lg.aheadChk[p];else lg.aheadChk[p]=1;break}
    case 'revAheadFinish':{const P=plan();if(!S.revLog[t]||!P.ahead.length)return;S.revStack.push({date:t,prev:S.revLast||0,extra:true});(S.revExtra[t]=S.revExtra[t]||[]).push(P.ahead.slice());S.revLast=P.ahead[P.ahead.length-1];log().aheadChk={};ui.ahead=false;break}
    case 'revUndo':{const top=S.revStack[S.revStack.length-1];if(!top||top.date<t)return;S.revStack.pop();if(top.extra){const ex=S.revExtra[t]||[];ex.pop();if(!ex.length)delete S.revExtra[t]}else delete S.revLog[top.date];S.revLast=top.prev;if(top.date===t)log().revChk={};log().aheadChk={};ui.ahead=false;break}
    case 'restDay':{const i=+d.i;st.rest=st.rest.includes(i)?st.rest.filter(x=>x!==i):[...st.rest,i].sort();break}
    case 'defaults':{const keep={priorConn:st.priorConn,priorTo:st.priorTo,priorPart:st.priorPart,ppd:st.ppd,prior:st.prior,rest:st.rest};S.settings={...DEF,...keep,steps:STEP_DEF.map(q=>({...q}))};break}
    case 'undoLesson':ui.confirmUndo=true;changed=false;break;
    case 'undoNo':ui.confirmUndo=false;changed=false;break;
    case 'undoYes':{const L=S.lessons.pop();if(L)delete S.cc[L.n]}ui.confirmUndo=false;break;
    case 'reset':ui.confirmReset=true;changed=false;break;
    case 'resetNo':ui.confirmReset=false;changed=false;break;
    case 'resetYes':S=fresh();ui.confirmReset=false;ui.tab='today';break;
    default:return;
  }
  if(p!=null&&['inc','dec','tog','dot','recBad','repMiss'].includes(a)&&d.id!=='join')delete ui.openStep[p];
  if(changed){refreshDone();save()}
  render();
}
document.addEventListener('click',e=>{const b=e.target.closest('[data-act]');if(!b||b.disabled)return;act(b.dataset.act,b.dataset)});
async function exportBackup(){
  const data=JSON.stringify({app:'tikrar-tracker',version:1,exported:new Date().toISOString(),state:S});
  const name='tikrar-backup-'+TODAY()+'.json';ui.msg='';
  if(window.AndroidBridge&&AndroidBridge.saveFile){try{AndroidBridge.saveFile(name,data);ui.msg='Choose where to save the backup.'}catch(e){ui.msg='Couldn’t save a backup here.'}render();return}
  try{if(window.claude&&window.claude.use){const dl=await claude.use('downloads');if(dl){await dl.save({filename:name,data});ui.msg='Backup saved.';render();return}}}
  catch(e){if(e&&e.code==='declined'){ui.msg='Backup not saved.';render();return}}
  try{const u=URL.createObjectURL(new Blob([data],{type:'application/json'}));const a=document.createElement('a');a.href=u;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),3000);ui.msg='Backup saved as '+name+'.'}
  catch(e){ui.msg='Couldn’t save a backup here.'}
  render();
}
document.addEventListener('change',e=>{
  if(e.target&&e.target.id==='importFile'){const f=e.target.files&&e.target.files[0];if(!f)return;const r=new FileReader();r.onload=()=>{try{const o=JSON.parse(r.result);const st=o&&o.app==='tikrar-tracker'?o.state:(o&&o.settings&&o.lessons?o:null);if(!st)throw 0;const n=normalize(st),prev=S;S=n;const pages=memorizedSet().size;S=prev;ui.pendingImport={state:st,when:o.exported?new Date(o.exported).toLocaleDateString(undefined,{month:'short',day:'numeric',year:'numeric'}):'this file',pages,lessons:n.lessons.length};ui.msg=''}catch(err){ui.pendingImport=null;ui.msg='That file isn’t a Tikrar backup.'}render()};r.readAsText(f);return}
  const lb=e.target.closest('[data-step-label]');if(lb){const z=S.settings.steps.find(q=>q.id===lb.dataset.stepLabel);if(z){const v=lb.value.trim().slice(0,80);if(z.custom){if(v)z.label=v}else{if(v&&v!==STEP_NAMES[z.id])z.label=v;else delete z.label}}refreshDone();save();render();return}
  const wn=e.target.closest('[data-wknote]');if(wn){const w=S.wk[wn.dataset.wknote];if(w){w.note=wn.value.trim().slice(0,200);save()}return}
  const sc=e.target.closest('[data-stepcount]');if(sc){const z=S.settings.steps.find(q=>q.id===sc.dataset.stepcount);if(z){let v=parseInt(sc.value,10);z.count=isNaN(v)?1:Math.max(1,Math.min(500,v))}refreshDone();save();render();return}
  const el=e.target.closest('[data-set]');if(!el)return;
  if(el.dataset.set==='ppd'){S.settings.ppd=normAmt(el.value);refreshDone();save();render();return}const k=el.dataset.set,st=S.settings;
  if(k==='prior')st.prior=el.value.trim();
  else if(k==='order')st.order=['surah','forward','backward'].includes(el.value)?el.value:'surah';
  else{if(k==='priorTo')st.priorPart=0;
  const lim={joinReps:[0,200],weakClear:[1,60],priorConn:[0,604],priorTo:[0,114],priorPart:[0,300],startPage:[1,604],ppd:[1,5],listen:[1,10],rec:[1,10],reps:[1,200],yreps:[1,50],connTarget:[1,60],cycle:[1,60]}[k];let v=parseInt(el.value,10);if(isNaN(v))v=DEF[k];v=Math.max(lim[0],Math.min(lim[1],v));if(k==='priorConn')v=Math.min(v,priorSet().size);st[k]=v}
  refreshDone();save();render();
});
const TABS=['today','memorize','connection','revision','progress'];
function fromHash(){try{const h=(location.hash||'').slice(1);if(TABS.includes(h))ui.tab=h}catch(e){}}
fromHash();window.addEventListener('hashchange',()=>{fromHash();render()});
render();
initStore();
let lastDay=TODAY();
function wake2(){if(document.visibilityState==='visible'||!document.visibilityState){if(TODAY()!==lastDay){lastDay=TODAY();ui.openStep={}}render()}}
document.addEventListener('visibilitychange',wake2);window.addEventListener('focus',wake2);setInterval(()=>{if(TODAY()!==lastDay){lastDay=TODAY();ui.openStep={};render()}},60000);

try{navigator.storage&&navigator.storage.persist&&navigator.storage.persist()}catch(e){}
