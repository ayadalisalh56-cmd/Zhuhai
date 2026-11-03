(()=>{
const K='meko_state_v1',$=s=>document.querySelector(s);
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const kn=n=>Number(n).toLocaleString('ar-EG'),fd=d=>new Date(d).toLocaleDateString('ar-IQ',{month:'long',day:'numeric'});
const nowT=()=>new Date().toLocaleTimeString('ar-EG',{hour:'2-digit',minute:'2-digit'});
const ic=()=>window.lucide&&lucide.createIcons({attrs:{'stroke-width':1.75}});
const I=(n)=>`<i data-lucide="${n}"></i>`;
const svg=b=>'data:image/svg+xml;utf8,'+encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">'+b+'</svg>');
const ini=(n,c='#52525b')=>svg(`<rect width="100" height="100" fill="${c}"/><text x="50" y="68" font-size="46" text-anchor="middle" fill="#fff" font-family="sans-serif">${esc(n[0])}</text>`);
const portrait=svg('<rect width="100" height="100" fill="#3f3f46"/><circle cx="50" cy="38" r="18" fill="#d4d4d8"/><path d="M14 100c0-24 16-38 36-38s36 14 36 38z" fill="#d4d4d8"/>');
const COUNTRIES=['کوردستان','ئەڵمانیا','سوید','بەریتانیا','فەڕەنسا','ئەمریکا','کەنەدا','ئوسترالیا','هیتر'];
const CITIES=['ئاکرێ','ئامەد','ئامێدی','ئورفا','ئیلام','باتمان','بانە','بێدلیس','بۆکان','پاوە','پێنجوێن','پیرانشار','تەقتەق','تکریت','جۆلەمێرگ','جوانڕۆ','چەمچەماڵ','چۆمان','حەسەکە','خانەقین','خۆی','خورماتوو','دێرسیم','دهۆک','دیواندەرە','ڕانیە','ڕەواندز','زاخۆ','زەڕایەن','سەردەشت','سەرپێڵی زەهاو','سەرێکانی','سەقز','سلێمانی','سنە','سۆران','سێرت','شنگال','شنۆ','شرنەخ','شەقڵاوە','عەفرین','قارس','قامیشلۆ','قەڵادزێ','قوچان','کرماشان','کەرکووک','کەلار','کۆبانێ','کۆیە','کفری','ماردین','ماکۆ','مەریوان','مەهاباد','مەلاطیە','مووش','نەغەدە','هەڵەبجە','هەولێر','وان'];
const CATS=['هەموو','دەقی خاو TXT','دیوانی شیعر','لێکۆڵینەوە','فەرهەنگ و زمان'];
const T=h=>new Date(Date.now()-h*36e5).toISOString();
const seed=()=>({
user:{name:'والی',handle:'@wali_kurd',bio:'تەلارسازیی وشە و خەیاڵ؛ هەوڵێک بۆ پاراستن و بوژاندنەوەی زمانی ڕەسەنی کوردی لە جیهانی دیجیتاڵیدا.',country:'کوردستان',city:'کەرکووک',avatar:portrait,followers:1280,following:214},
posts:[
{id:'p1',n:'والی',me:1,po:1,d:T(2),l:48,lk:0,sv:0,c:[{n:'ئاوات عەبدولڕەحمان',t:'جوان بوو، دەستت خۆش.'}],t:'شەوێک لە ژێر چرای وشەدا دانیشتم\nدڵم ئەو کتێبە بوو کە هەرگیز تەواو نابێت\nهەر پیتێک گوڵێکە لە باخچەی زمانم\nهەر دێڕێک ڕێگایەکە بۆ ماڵی خۆم'},
{id:'p2',n:'دیلان هەورامی',po:0,d:T(5),l:72,lk:0,sv:0,c:[],t:'زمان تەنیا ئامرازی گوتن نییە؛ ماڵێکە کە هەموو یادەوەرییەکانمان تێیدا دەژین. هەر وشەیەک کە دەینووسینەوە، خشتێکە لەو ماڵەدا.\n\nکاتێک وشەیەکی ڕەسەن لە بیر دەچێتەوە، ژوورێک لەو ماڵە تاریک دەبێت.'},
{id:'p3',n:'کاروان شارەزووری',po:1,d:T(9),l:95,lk:0,sv:0,c:[],t:'ئەی زمانی دایک، ئاوێنەی ڕۆحی منی\nهەر کە دەتدوێنم، ئاسمان دێتە ناو دەمم\nشەوی تاریکی دوورکەوتنەوە بە تۆ ڕووناکە\nلە تۆوە دەگەڕێمەوە سەر خاکی خۆم'},
{id:'p4',n:'ئاوات عەبدولڕەحمان',po:0,d:T(14),l:131,lk:0,sv:0,c:[],t:'نووسینی کوردی بە پیتی ڕاست و یەکگرتوو یەکەم هەنگاوە بۆ ئەوەی گەڕان، وەرگێڕانی ماشینی و زیرەکیی دەستکرد بتوانن زمانەکەمان بناسنەوە. هەر دەقێکی پاک، بەشێکە لە هەمبارێکی گەورە بۆ نەوەکانی داهاتوو.'},
{id:'p5',n:'والی',me:1,po:1,d:T(30),l:64,lk:0,sv:0,c:[],t:'غەزەل دەنووسم بە خوێنی دڵ لەسەر ئاو\nکە ناپارێزرێت، بەڵام هەر دەمێنێتەوە\nوشەکانم بۆ ئەوانن کە دوای من دێن\nدەنگی من لە دەنگی ئەوان دەژی'}],
chats:[
{id:'c1',n:'ئاوات عەبدولڕەحمان',g:0,on:1,u:2,m:[{s:'ئاوات',t:'سڵاو والی، وتارەکەت دەربارەی ڕێنووسی کوردی خوێندەوە. زۆر بەسوود بوو.',tm:'١٠:٢٠'},{me:1,t:'سوپاس ئاوات گیان. دەمەوێت لیستی وشە ڕەسەنەکان فراوانتر بکەم.',tm:'١٠:٢٥'},{s:'ئاوات',t:'من چەند وشەی کۆنی ناوچەکەم کۆکردۆتەوە، بۆت دەنێرم.',tm:'١٠:٣٠'}]},
{id:'c2',n:'دیلان هەورامی',g:0,on:0,u:0,m:[{s:'دیلان',t:'لە هەورامیدا وشەی «دەریا» بە شێوازێکی تر دەگوترێت، دەتەوێت بیخەینە فەرهەنگەکەوە؟',tm:'٠٩:١٠'},{me:1,t:'بێگومان، با بە نموونەی شیعرییەوە بینووسین.',tm:'٠٩:١٥'}]},
{id:'c3',n:'کاروان شارەزووری',g:0,on:1,u:0,m:[{me:1,t:'کاروان، دیوانەکەت چۆن دەڕوات؟',tm:'ئەمڕۆ'},{s:'کاروان',t:'نزیکەی تەواو بووە؛ دەمەوێت دەقەکان وەک TXT لە ئەرشیفدا دابنێم.',tm:'ئەمڕۆ'}]},
{id:'g1',n:'ئەنجومەنی زمانەوانانی مەکۆ',g:1,mem:1850,desc:'کۆڕی لێکۆڵینەوەی زمان',u:5,m:[{s:'هێمن',t:'پێشنیار دەکەم ڕێنووسی وشە داتاشراوەکان یەکلا بکەینەوە.',tm:'١١:٠٠'},{s:'ژیلەمۆ',t:'من لەگەڵم؛ نموونەکان لە فەرهەنگەکەدا کۆدەکەمەوە.',tm:'١١:٠٥'}]},
{id:'g2',n:'کۆڕی شیعری کلاسیکی کوردی',g:1,mem:3420,desc:'شیعری کلاسیک',u:0,m:[{s:'ڕێباز',t:'ئەمشەو باسی بنەماکانی غەزەل دەکەین.',tm:'٠٨:٣٠'},{s:'شنۆ',t:'بەخێربێن، هەموو بە دەنگی بەرزەوە بخوێننەوە.',tm:'٠٨:٤٠'}]}],
lib:[
{id:'l1',title:'نموونەی غەزەلی کلاسیکی',au:'والی',cat:'دیوانی شیعر',fmt:'TXT',content:'غەزەلی شەو\nشەو هات و مانگ لە ئاسمان بوو بە چراێک\nدڵ بوو بە کتێبێک و وشە بوو بە ڕێبوارێک\nئەی ئەوەی ناوی ئازادیت لە دەمم گوێ لێبوو\nهەر وشەیەکی من هێشتا بە تۆوە دەژی\n\nبەندی دووەم\nلە شاخەکانەوە دەنگێک دێت، ئاو دەڵێت بخوێنەوە\nلە دۆڵەکانەوە ڕەنگێک دێت، گوڵ دەڵێت بنووسە'},
{id:'l2',title:'فەرهەنگۆکی وشە ڕەسەنەکان',au:'مەکۆ',cat:'فەرهەنگ و زمان',fmt:'TXT',content:'ڕەسەن: ئەوەی بنەڕەتی خۆی هەیە و لە زمانی دایکەوە هاتووە.\n\nهەڵبەست: دەقێکی شیعری کە بە ئاگایی دروست کرابێت.\n\nدەستەواژە: چەند وشەیەک کە پێکەوە واتایەکی تایبەت دەگەیەنن.\n\nخوێندنەوە: ڕێگایەک بۆ تێگەیشتن لە دەق و دنیا.'},
{id:'l3',title:'تێبینی لەسەر دیالێکتی هەورامی و کەلهوڕی',au:'مەکۆ',cat:'لێکۆڵینەوە',fmt:'TXT',content:'زمانی کوردی چەندین دیالێکتی دەوڵەمەندی هەیە و هەر یەکەیان بەشێکی ئەو خانەیەن کە زمانەکە پێک دەهێنن.\n\nهەورامی بە ڕێزمانێکی کۆن و دەنگدانەوەیەکی تایبەت ناسراوە و ئەدەبێکی دەوڵەمەندی هەیە.\n\nکەلهوڕی لە وشە و ڕستەسازیدا تایبەتمەندی خۆی هەیە. بەراوردکردنیان بۆ لێکۆڵەر دەرگایەکی فراوان دەکاتەوە.'},
{id:'l4',title:'لەبارەی جوانیناسی لە شیعری کوردیدا',au:'والی',cat:'لێکۆڵینەوە',fmt:'PDF',content:'جوانی لە شیعری کوردیدا تەنیا ڕازاندنەوە نییە؛ ڕێگایەکە بۆ ناسینی خود و خاک.\n\nکاتێک شاعیر وێنەیەکی سروشت دەکێشێت، لە ڕاستیدا یادەوەرییەکی کۆمەڵایەتی دەنووسێتەوە.\n\nژیری و ئاهەنگ لە شیعردا پێکەوە دەژین: ئاهەنگ دەنگ دەبەخشێتە واتا و واتا ڕەگ دەبەخشێتە ئاهەنگ.'},
{id:'l5',title:'کۆمەڵەی دەقی خاو بۆ ماشین',au:'مەکۆ',cat:'دەقی خاو TXT',fmt:'TXT',content:'ئەمە دەقێکی خاوی پاکە بۆ لێکۆڵینەوە و فێرکردنی مۆدێلە زمانییەکان.\n\nزمان ماڵی ئێمەیە. هەر کەسێک بە زمانی خۆی بنووسێت، میراتێک بۆ داهاتوو دەپارێزێت.\n\nدەقی کوردیی پاک یارمەتی گەڕان، وەرگێڕان و دەنگ بۆ دەق دەدات.'},
{id:'l6',title:'ئاوێنەی ڕووناکی',au:'والی',cat:'دیوانی شیعر',fmt:'TXT',content:'ئاوێنەی ڕووناکی\nلە ناو وشەکاندا ڕووناکییەک هەیە\nکە هیچ شەوێک نایکوژێنێتەوە\nهەر کەسێک بە زمانی دایکی بخوێنێتەوە\nماڵێکی نوێ لە دڵیدا دروست دەکات'}]});
let S;try{S=JSON.parse(localStorage.getItem(K))}catch(e){}if(!S||!S.user)S=seed();
let V='home',CH=null,PT='mine',LC='هەموو',LQ='',CT='dm',Q='',CQ='',RF=18,pend=null;const openC=new Set();
const save=()=>{try{localStorage.setItem(K,JSON.stringify(S))}catch(e){}ld()};
const ld=()=>{let e=$('#meko-jsonld');if(!e){e=document.createElement('script');e.id='meko-jsonld';e.type='application/ld+json';document.head.appendChild(e)}
e.textContent=JSON.stringify({'@context':'https://schema.org','@graph':[...S.posts.map(p=>({'@type':'SocialMediaPosting',inLanguage:'ku',headline:p.t.split('\n')[0],articleBody:p.t,datePublished:p.d,author:{'@type':'Person',name:p.me?S.user.name:p.n}})),...S.lib.map(b=>({'@type':b.cat==='دیوانی شیعر'?'Book':'CreativeWork',inLanguage:'ku',name:b.title,author:{'@type':'Person',name:b.au},text:b.content}))]})};
const toast=m=>{const t=$('#toast');t.textContent=m;t.classList.add('show');clearTimeout(toast.k);toast.k=setTimeout(()=>t.classList.remove('show'),1800)};
const copy=t=>{(navigator.clipboard?navigator.clipboard.writeText(t):Promise.reject()).catch(()=>{const a=document.createElement('textarea');a.value=t;document.body.appendChild(a);a.select();document.execCommand('copy');a.remove()})};
const ov=h=>{$('#ov').innerHTML=h;ic()};
const hideAll=()=>{document.querySelectorAll('.pop').forEach(x=>x.hidden=true);$('#pop').hidden=true};
const avOf=o=>o.me?S.user.avatar:ini(o.n);
const body=t=>esc(t).replace(/\n/g,'<br>');
function post(p){const o=openC.has(p.id);return`<article class="post-item" itemscope itemtype="https://schema.org/SocialMediaPosting" id="po-${p.id}">
<header class="ph"><img class="avatar-sm" src="${avOf(p)}" alt=""><div class="pn"><b itemprop="author">${esc(p.me?S.user.name:p.n)}</b><time datetime="${p.d}" itemprop="datePublished">${fd(p.d)}</time></div><button class="ib" data-a="pm" data-id="${p.id}" aria-label="more">${I('more-horizontal')}</button>
<div class="pop" id="pm-${p.id}" hidden><button data-a="sv" data-id="${p.id}">${I('bookmark')}${p.sv?'لابردنی پاشەکەوت':'پاشەکەوتکردن'}</button>${p.me?`<button data-a="del" data-id="${p.id}">${I('trash-2')}سڕینەوە</button>`:''}</div></header>
<div class="pb${p.po?' poem':''}" itemprop="articleBody" lang="ku">${body(p.t)}</div>
<div class="pc"><span>${kn(p.l)} پەسەندکراو</span><span>${kn(p.c.length)} لێدوان</span></div>
<div class="pa"><button data-a="lk" data-id="${p.id}" class="${p.lk?'on':''}">${I('heart')}پەسەندکردن</button><button data-a="cm" data-id="${p.id}">${I('message-square')}لێدوان</button><button data-a="sh" data-id="${p.id}">${I('share-2')}هاوبەشیکردن</button></div>
<section class="cm" id="cm-${p.id}" ${o?'':'hidden'}>${p.c.map(c=>`<div class="cmi"><img class="avatar-xs" src="${avOf(c)}" alt=""><div><b>${esc(c.me?S.user.name:c.n)}</b>${esc(c.t)}</div></div>`).join('')}<div class="cmf"><input type="text" id="ci-${p.id}" placeholder="لێدوانێک بنووسە..."><button data-a="cs" data-id="${p.id}">ناردن</button></div></section></article>`}
const rp=id=>{const p=S.posts.find(x=>x.id===id),e=$('#po-'+id);if(p&&e){e.outerHTML=post(p);ic()}};
const list=ps=>ps.length?ps.map(post).join(''):'<div class="empty">هیچ پۆستێک نییە</div>';
function feed(){const q=Q.trim();$('#feed').innerHTML=list(S.posts.filter(p=>!q||p.t.includes(q)||(p.me?S.user.name:p.n).includes(q)));ic()}
function vHome(m){m.innerHTML=`<header class="top"><h1>مەکۆ</h1><button class="ib" data-a="srch" aria-label="search">${I('search')}</button></header><div class="sb" id="sb" ${Q?'':'hidden'}><input type="search" class="pin" id="q" value="${esc(Q)}" placeholder="گەڕان لە پۆست و نووسەر..."></div><section id="feed"></section>`;feed()}
function vProf(m){const u=S.user,mine=S.posts.filter(p=>p.me),sv=S.posts.filter(p=>p.sv);
m.innerHTML=`<header class="top"><h2>${esc(u.handle)}</h2><button class="ib" data-a="edit" aria-label="edit">${I('settings')}</button></header>
<section><div class="pt"><div class="ring"><img class="avatar-lg" src="${u.avatar}" alt=""></div><div class="ps"><div><b>${kn(mine.length)}</b><span>پۆست</span></div><div><b>${kn(u.followers)}</b><span>شوێنکەوتووان</span></div><div><b>${kn(u.following)}</b><span>شوێنکەوتوو</span></div></div></div>
<div class="bio"><b>${esc(u.name)}</b><p>${esc(u.bio)}</p><small>${I('map-pin')}${esc(u.country)}${u.city?'، '+esc(u.city):''}</small></div>
<div class="btn2"><button data-a="edit">دەستکاریکردنی پڕۆفایل</button><button data-a="shp">هاوبەشیکردنی پڕۆفایل</button></div>
<div class="tabs"><button data-a="pt" data-v="mine" class="${PT==='mine'?'on':''}">بڵاوکراوەکانم</button><button data-a="pt" data-v="saved" class="${PT==='saved'?'on':''}">پاشەکەوتکراوەکان</button></div></section>
<section style="background:var(--bg2)">${list(PT==='mine'?mine:sv)}</section>`}
const lastOf=c=>c.m.length?c.m[c.m.length-1].t:c.desc||'';
const crow=c=>`<div class="cr" data-a="oc" data-id="${c.id}"><div class="aw"><img class="avatar-md" src="${ini(c.n,c.g?'#0f766e':'#52525b')}" alt="">${c.on?'<i class="on-dot"></i>':''}</div><div class="cmid"><b>${esc(c.n)}</b><p>${esc(lastOf(c))}</p></div><div class="cl"><small>${c.m.length?c.m[c.m.length-1].tm:''}</small>${c.u?`<span class="bd">${kn(c.u)}</span>`:''}</div></div>`;
function clist(){const q=CQ.trim();const a=S.chats.filter(c=>(CT==='g'?c.g:!c.g)&&(!q||c.n.includes(q)||lastOf(c).includes(q)));$('#cl').innerHTML=a.length?a.map(crow).join(''):'<div class="empty">هیچ نامەیەک نییە</div>';ic()}
function vChat(m){if(CH)return vRoom(m);
m.innerHTML=`<header class="top"><h2>نامەدان</h2><button class="ib" data-a="nc" aria-label="new">${I('square-pen')}</button></header><div class="srch"><input type="search" class="pin" id="cq" value="${esc(CQ)}" placeholder="گەڕان لە نامەکان..."></div><div class="seg"><button data-a="ct" data-v="dm" class="${CT==='dm'?'on':''}">چاتەکان</button><button data-a="ct" data-v="g" class="${CT==='g'?'on':''}">گرووپەکان</button></div><section id="cl"></section>`;clist()}
const bub=(c,x)=>x.me?`<div class="m-me"><div class="bu">${esc(x.t)}</div></div>`:`<div class="m-them"><img class="avatar-xs" src="${ini(x.s||c.n,c.g?'#0f766e':'#52525b')}" alt=""><div class="bu">${esc(x.t)}</div></div>`;
function vRoom(m){const c=S.chats.find(x=>x.id===CH);c.u=0;save();
m.innerHTML=`<section class="room"><header class="rh"><button class="ib" data-a="back" aria-label="back">${I('arrow-right')}</button><img class="avatar-sm" src="${ini(c.n,c.g?'#0f766e':'#52525b')}" alt=""><div><b>${esc(c.n)}</b><small>${c.g?kn(c.mem.toLocaleString?c.mem:c.mem)+' ئەندام · '+esc(c.desc||'گرووپ'):'چالاکە لەسەر هێڵ'}</small></div></header><div class="stream" id="st">${c.m.map(x=>bub(c,x)).join('')}</div><div class="cin"><div class="shell"><button id="chat-send-btn" type="button" data-a="send" aria-label="send">${I('arrow-up')}</button><textarea id="chat-smart-input" rows="1" placeholder="نامەیەک بنووسە..."></textarea></div></div></section>`;const s=$('#st');s.scrollTop=s.scrollHeight}
const sz=b=>kn(Math.max(1,Math.ceil(new Blob([b.content]).size/1024)));
const lrow=b=>`<article class="lrow" itemscope itemtype="https://schema.org/${b.cat==='دیوانی شیعر'?'Book':'CreativeWork'}"><span class="fmt">${b.fmt}</span><div style="flex:1;min-width:0"><h3 itemprop="name">${esc(b.title)}</h3><p>${esc(b.au)} · ${esc(b.cat)} · ${sz(b)} کیلۆبایت</p></div><div style="display:flex"><button class="ib" data-a="rd" data-id="${b.id}" aria-label="read">${I('book-open')}</button><button class="ib" data-a="dl" data-id="${b.id}" aria-label="download">${I('download')}</button></div></article>`;
function llist(){const q=LQ.trim();const a=S.lib.filter(b=>(LC==='هەموو'||b.cat===LC)&&(!q||(b.title+b.au+b.content).includes(q)));$('#ll').innerHTML=a.length?a.map(lrow).join(''):'<div class="empty">هیچ دەقێک نەدۆزرایەوە</div>';ic()}
function vLib(m){const h=S.lib[0];m.innerHTML=`<header class="top"><h2>کتێبخانە و ئەرشیف</h2><button data-a="at" style="font-size:13px;font-weight:600">+ زیادکردنی دەق</button></header><div class="srch"><input type="search" class="pin" id="lq" value="${esc(LQ)}" placeholder="گەڕان لە ناونیشان، نووسەر، یان دەقی خاو..."></div><div class="pills">${CATS.map(c=>`<button data-a="lc" data-v="${c}" class="${LC===c?'on':''}">${c}</button>`).join('')}</div>${h?`<section class="hero"><small>${esc(h.au)} · ${esc(h.cat)}</small><h2>${esc(h.title)}</h2><p>${esc(h.content.split('\n').slice(0,2).join(' '))}</p><button data-a="rd" data-id="${h.id}">خوێندنەوەی دەق</button></section>`:''}<section id="ll" style="padding-bottom:12px"></section>`;llist()}
function nav(){$('#nav').innerHTML=`<button class="ni ${V==='home'?'on':''}" data-a="go" data-v="home" aria-label="home">${I('home')}</button><button class="plus" data-a="plus" aria-label="create">${I('plus')}</button><button class="ni ${V==='chat'?'on':''}" data-a="go" data-v="chat" aria-label="chat">${I('message-circle')}${S.chats.some(c=>c.u)?'<span class="dot"></span>':''}</button><button class="mn" data-a="menu" aria-label="menu"><img class="avatar-nav" src="${S.user.avatar}" alt=""><span class="mb">${I('menu')}</span></button>`}
function render(){({home:vHome,profile:vProf,chat:vChat,lib:vLib})[V]($('#view'));nav();ic()}
const dl=b=>{const a=document.createElement('a');a.href=URL.createObjectURL(new Blob(['\uFEFF'+b.content],{type:'text/plain;charset=utf-8'}));a.download=b.title+'.txt';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),500)};
const cityF=(c,v)=>c==='کوردستان'?`<select id="ec-city">${CITIES.map(x=>`<option ${x===v?'selected':''}>${x}</option>`).join('')}</select>`:`<input type="text" id="ec-city" value="${esc(v||'')}">`;
const A={
go(d){V=d.v;CH=null;hideAll();ov('');render();scrollTo(0,0)},
srch(){const s=$('#sb');s.hidden=!s.hidden;if(!s.hidden)$('#q').focus()},
pm(d){const e=$('#pm-'+d.id),o=!e.hidden;hideAll();e.hidden=o},
sv(d){const p=S.posts.find(x=>x.id===d.id);p.sv=p.sv?0:1;save();toast(p.sv?'پاشەکەوت کرا':'لابرا');V==='profile'?render():rp(d.id)},
del(d){S.posts=S.posts.filter(x=>x.id!==d.id);save();V==='profile'?render():feed();toast('سڕایەوە')},
lk(d){const p=S.posts.find(x=>x.id===d.id);p.lk=p.lk?0:1;p.l+=p.lk?1:-1;save();rp(d.id)},
cm(d){const e=$('#cm-'+d.id);e.hidden=!e.hidden;e.hidden?openC.delete(d.id):openC.add(d.id)},
cs(d){const i=$('#ci-'+d.id),t=i.value.trim();if(!t)return;S.posts.find(x=>x.id===d.id).c.push({me:1,t});openC.add(d.id);save();rp(d.id)},
sh(d){const p=S.posts.find(x=>x.id===d.id);copy(p.t+'\n'+location.href);toast('کۆپی کرا')},
plus(){hideAll();let po=0;ov(`<section class="ovl"><header class="oh"><button class="ib" data-a="cx" aria-label="close">${I('x')}</button><span style="font-size:14px;color:var(--mu)">پۆستی نوێ</span><button class="pubbtn" id="pub" data-a="pub" disabled>بڵاوکردنەوە</button></header><div class="cbody"><img class="avatar-sm" src="${S.user.avatar}" alt=""><textarea id="creator-textarea" placeholder="چی لە دڵتدایە؟ لێرە بینووسە..."></textarea></div><div class="cbar"><button class="tg" id="poetb" data-a="poem">${I('feather')}شێوازی شیعر</button></div></section>`);$('#creator-textarea').focus()},
cx(){ov('')},
poem(){const t=$('#creator-textarea');t.classList.toggle('poem');$('#poetb').classList.toggle('on')},
pub(){const t=$('#creator-textarea'),v=t.value.trim();if(!v)return;S.posts.unshift({id:'p'+Date.now(),n:S.user.name,me:1,po:t.classList.contains('poem')?1:0,d:new Date().toISOString(),l:0,lk:0,sv:0,c:[],t:v});save();ov('');V='home';Q='';render();scrollTo(0,0)},
menu(){const p=$('#pop'),o=!p.hidden;hideAll();if(o)return;const dk=document.documentElement.classList.contains('dark');p.innerHTML=`<button data-a="go" data-v="profile">${I('user')}پڕۆفایلەکەم</button><button data-a="go" data-v="lib">${I('library')}کتێبخانە و ئەرشیف</button><button data-a="theme">${I('moon')}دۆخی تاریک / ڕووناک<span class="sw ${dk?'on':''}"></span></button>`;p.hidden=false;ic()},
theme(){const r=document.documentElement,d=!r.classList.contains('dark');r.classList.toggle('dark',d);r.classList.toggle('light',!d);localStorage.setItem('meko_theme',d?'dark':'light');$('#pop .sw').classList.toggle('on',d)},
pt(d){PT=d.v;render()},
shp(){copy(location.href+'#'+S.user.handle);toast('بەستەری پڕۆفایل کۆپی کرا')},
edit(){const u=S.user;pend=null;ov(`<section class="ovl"><header class="oh"><button class="ib" data-a="cx" aria-label="close">${I('x')}</button><span>دەستکاریکردنی پڕۆفایل</span><button class="pubbtn" data-a="sp">پاشەکەوتکردن</button></header><div class="ebody"><div style="text-align:center;margin-bottom:18px"><button data-a="pickav" aria-label="avatar"><img class="avatar-lg" id="eav" src="${u.avatar}" alt="" style="margin:auto"></button><br><button data-a="pickav" style="font-size:13px;font-weight:600;margin-top:8px">گۆڕینی وێنەی پڕۆفایل</button><input type="file" id="avatar-upload-input" accept="image/*" hidden></div>
<label class="fld">ناو<input type="text" id="ec-name" value="${esc(u.name)}"></label><label class="fld">ژیاننامە<textarea id="ec-bio" rows="4">${esc(u.bio)}</textarea></label>
<label class="fld">وڵات<select id="ec-country">${COUNTRIES.map(c=>`<option ${c===u.country?'selected':''}>${c}</option>`).join('')}</select></label><label class="fld">شار<span id="cityw">${cityF(u.country,u.city)}</span></label></div></section>`)},
pickav(){$('#avatar-upload-input').click()},
sp(){const u=S.user;u.name=$('#ec-name').value.trim()||u.name;u.bio=$('#ec-bio').value.trim();u.country=$('#ec-country').value;u.city=$('#ec-city').value.trim();if(pend)u.avatar=pend;save();ov('');render();toast('پاشەکەوت کرا')},
ct(d){CT=d.v;CQ='';render()},
oc(d){CH=d.id;render()},
back(){CH=null;render()},
send(){const i=$('#chat-smart-input'),t=i.value.trim();if(!t)return;const c=S.chats.find(x=>x.id===CH),x={me:1,t,tm:nowT()};c.m.push(x);save();const s=$('#st');s.insertAdjacentHTML('beforeend',bub(c,x));s.scrollTop=s.scrollHeight;i.value='';i.style.height='auto';$('#chat-send-btn').classList.remove('show');i.focus()},
nc(){ncm('dm')},
nct(d){ncm(d.v)},
mkdm(){const n=$('#nc-n').value.trim();if(!n)return;S.chats.unshift({id:'c'+Date.now(),n,g:0,on:0,u:0,m:[]});save();ov('');CT='dm';CH=S.chats[0].id;render()},
mkg(){const n=$('#ng-n').value.trim();if(!n)return;S.chats.unshift({id:'g'+Date.now(),n,g:1,mem:1,desc:$('#ng-d').value.trim()||$('#ng-c').value,u:0,m:[]});save();ov('');CT='g';CH=null;render();toast('گرووپ دروستکرا')},
lc(d){LC=d.v;render()},
rd(d){const b=S.lib.find(x=>x.id===d.id);ov(`<section class="ovl rd"><div class="rbar"><button class="ib" data-a="cx" aria-label="close">${I('x')}</button><span class="sp"></span><button class="t" data-a="fs" data-v="2">A+</button><button class="t" data-a="fs" data-v="-2">A-</button><button class="ib" data-a="cpy" data-id="${b.id}" aria-label="copy" title="کۆپیکردنی دەق">${I('copy')}</button><button class="ib" data-a="dl" data-id="${b.id}" aria-label="download" title="داگرتن (UTF-8 TXT)">${I('download')}</button></div><article id="rb" style="font-size:${RF}px" itemscope itemtype="https://schema.org/CreativeWork"><h1 itemprop="name">${esc(b.title)}</h1>${b.content.split('\n').filter(Boolean).map(p=>`<p>${esc(p)}</p>`).join('')}</article></section>`)},
fs(d){RF=Math.min(26,Math.max(15,RF+Number(d.v)));$('#rb').style.fontSize=RF+'px'},
cpy(d){copy(S.lib.find(x=>x.id===d.id).content);toast('دەق کۆپی کرا')},
dl(d){dl(S.lib.find(x=>x.id===d.id))},
at(){ov(`<section class="ovl"><header class="oh"><button class="ib" data-a="cx" aria-label="close">${I('x')}</button><span>زیادکردنی دەق</span><button class="pubbtn" data-a="st">زیادکردن</button></header><div class="ebody"><label class="fld">ناونیشان<input type="text" id="at-t"></label><label class="fld">نووسەر<input type="text" id="at-a"></label><label class="fld">پۆلێن<select id="at-c">${CATS.slice(1).map(c=>`<option>${c}</option>`).join('')}</select></label><label class="fld">دەق<textarea id="at-x" rows="12"></textarea></label></div></section>`)},
st(){const t=$('#at-t').value.trim(),x=$('#at-x').value.trim();if(!t||!x){toast('ناونیشان و دەق پێویستن');return}S.lib.push({id:'l'+Date.now(),title:t,au:$('#at-a').value.trim()||'نەزانراو',cat:$('#at-c').value,fmt:'TXT',content:x});save();ov('');V='lib';render();toast('زیادکرا')}};
function ncm(mode){ov(`<section class="ovl"><header class="oh"><button class="ib" data-a="cx" aria-label="close">${I('x')}</button><span>نامەی نوێ</span><span style="width:36px"></span></header><div class="seg"><button data-a="nct" data-v="dm" class="${mode==='dm'?'on':''}">نامەی تایبەتی نوێ</button><button data-a="nct" data-v="g" class="${mode==='g'?'on':''}">دروستکردنی گرووپی نوێ</button></div><div class="ebody">${mode==='dm'?`<label class="fld">ناوی کەس<input type="text" id="nc-n"></label><button class="pubbtn" data-a="mkdm">دەستپێکردن</button>`:`<label class="fld">ناوی گرووپ<input type="text" id="ng-n"></label><label class="fld">وەسفی گرووپ<textarea id="ng-d" rows="3"></textarea></label><label class="fld">پۆلێن<select id="ng-c"><option>کۆڕی زمانەوانی</option><option>کۆڕی شیعر</option><option>کۆڕی ئەدەبی</option></select></label><button class="pubbtn" data-a="mkg">دروستکردن</button>`}</div></section>`)}
document.addEventListener('click',e=>{const b=e.target.closest('[data-a]');const k=b&&b.dataset.a;if(!['pm','menu','theme'].includes(k)&&!(b&&e.target.closest('.pop,.menu-pop')&&0))hideAll();if(!b)return;if(k==='menu'||k==='pm'||k==='theme'||!e.target.closest('.menu-pop'))A[k]&&A[k](b.dataset,b);else A[k]&&A[k](b.dataset,b)});
document.addEventListener('input',e=>{const t=e.target;
if(t.id==='q'){Q=t.value;feed()}else if(t.id==='cq'){CQ=t.value;clist()}else if(t.id==='lq'){LQ=t.value;llist()}
else if(t.id==='creator-textarea')$('#pub').disabled=!t.value.trim();
else if(t.id==='chat-smart-input'){t.style.height='auto';const mx=96;if(t.scrollHeight<=mx){t.style.height=t.scrollHeight+'px';t.style.overflowY='hidden'}else{t.style.height=mx+'px';t.style.overflowY='auto'}$('#chat-send-btn').classList.toggle('show',t.value.trim().length>0)}});
document.addEventListener('change',e=>{const t=e.target;
if(t.id==='ec-country')$('#cityw').innerHTML=cityF(t.value,'');
if(t.id==='avatar-upload-input'&&t.files[0]){const r=new FileReader();r.onload=()=>{const im=new Image();im.onload=()=>{const c=document.createElement('canvas');c.width=c.height=250;const s=Math.min(im.width,im.height);c.getContext('2d').drawImage(im,(im.width-s)/2,(im.height-s)/2,s,s,0,0,250,250);pend=c.toDataURL('image/jpeg',.85);$('#eav').src=pend};im.src=r.result};r.readAsDataURL(t.files[0])}});
const th=localStorage.getItem('meko_theme')||'light';document.documentElement.className=th;
ld();render();
})();
