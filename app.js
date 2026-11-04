(()=>{'use strict';
const $=(s,r=document)=>r.querySelector(s),KEY='meko_state_v1',D=document;
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const nn=x=>(+x).toLocaleString('ar-EG'),I=n=>`<i data-lucide="${n}"></i>`;
const mk=c=>'data:image/svg+xml,'+encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" fill="${c}"/><circle cx="32" cy="25" r="11" fill="#fff" opacity=".85"/><path d="M10 64c3-18 15-22 22-22s19 4 22 22z" fill="#fff" opacity=".85"/></svg>`);
const COLORS=['#0f766e','#9a3412','#1d4ed8','#7c3aed','#be123c','#047857'];
const COUNTRIES=['کوردستان','ئەڵمانیا','سوید','بەریتانیا','فەڕەنسا','ئەمریکا','کەنەدا','ئوسترالیا','هیتر'];
const CITIES=['ئاکرێ','ئامەد','ئامێدی','ئورفا','ئیلام','باتمان','بانە','بێدلیس','بۆکان','پاوە','پێنجوێن','پیرانشار','تەقتەق','تکریت','جۆلەمێرگ','جوانڕۆ','چەمچەماڵ','چۆمان','حەسەکە','خانەقین','خۆی','خورماتوو','دێرسیم','دهۆک','دیواندەرە','ڕانیە','ڕەواندز','زاخۆ','زەڕایەن','سەردەشت','سەرپێڵی زەهاو','سەرێکانی','سەقز','سلێمانی','سنە','سۆران','سێرت','شنگال','شنۆ','شرنەخ','شەقڵاوە','عەفرین','قارس','قامیشلۆ','قەڵادزێ','قوچان','کرماشان','کەرکووک','کەلار','کۆبانێ','کۆیە','کفری','ماردین','ماکۆ','مەریوان','مەهاباد','مەلاطیە','مووش','نەغەدە','هەڵەبجە','هەولێر','وان'];
const CATS=['هەموو','دەقی خاو TXT','دیوانی شیعر','لێکۆڵینەوە','فەرهەنگ و زمان'];
const P={a:{n:'ئاوات عەبدولڕەحمان',v:mk('#0f766e')},d:{n:'دیلان هەورامی',v:mk('#9a3412')},k:{n:'کاروان شارەزووری',v:mk('#1d4ed8')}};
const T0=Date.now(),iso=h=>new Date(T0-h*36e5).toISOString();
const pm=(k,text)=>({m:0,n:P[k].n,v:P[k].v,text}),me=text=>({m:1,text});
const clock=()=>new Date().toLocaleTimeString('ar-EG',{hour:'2-digit',minute:'2-digit'});
const fd=t=>new Date(t).toLocaleDateString('ar-IQ',{day:'numeric',month:'long'});
const seed=()=>({
user:{name:'والی',handle:'wali_kurd',country:'کوردستان',city:'کەرکووک',bio:'تەلارسازیی وشە و خەیاڵ؛ هەوڵێک بۆ پاراستن و بوژاندنەوەی زمانی ڕەسەنی کوردی لە جیهانی دیجیتاڵیدا.',avatar:mk('#3f3f46'),followers:1280,following:214},
posts:[
{id:1,uid:'a',t:iso(2),poetry:1,text:'ئەی زمانی دایکم، ئەی ئاوی ژیانی دڵ\nلە تۆوە وشە دەڕوێ، لە تۆوە خەون دەگەشێتەوە',likes:214,liked:0,saved:0,cm:[{uid:'d',text:'زۆر جوان بوو، دەستت خۆش.'}]},
{id:2,uid:'d',t:iso(6),poetry:0,text:'زمان تەنیا ئامرازی گوتن نییە؛ ماڵی بیرکردنەوەیە. هەر وشەیەک کە دەمرێت، پەنجەرەیەک لە جیهانی ئێمە دادەخرێت.',likes:97,liked:0,saved:0,cm:[]},
{id:3,uid:'k',t:iso(11),poetry:1,text:'شەو درەنگە و مانگ لە ئاسمانی هەولێر\nنامەیەک دەنووسێ بۆ هەتاوی ئاوابوو',likes:156,liked:0,saved:0,cm:[]},
{id:4,uid:'me',t:iso(20),poetry:0,text:'ئەمڕۆ لە کتێبخانەکەمدا وشەیەکی کۆنم دۆزییەوە: «ئاوەز». ئەو وشانەی لە بیرچوونەتەوە، چیرۆکی گەلێکی تەواوی تێدایە.',likes:42,liked:0,saved:0,cm:[]},
{id:5,uid:'a',t:iso(30),poetry:1,text:'هەرچەندە ڕێگا دوور بێ و شەو درێژ بێ\nدڵ بە هیوا دەژی، وەک چیا بە بەفر',likes:188,liked:0,saved:0,cm:[]},
{id:6,uid:'k',t:iso(44),poetry:0,text:'کۆرپسی دەقی کوردی پێویستی بە دەقی پاک و یەکدەستی یونیکۆدە؛ ئەمە بنەمای گەڕان، وەرگێڕانی ماشێنی و فێرکردنی مۆدێلە زمانییەکانە.',likes:73,liked:0,saved:0,cm:[]}],
chats:[
{id:'c1',name:P.a.n,v:P.a.v,on:1,time:'١٠:٣٠',unread:2,msgs:[pm('a','سڵاو والی، دیوانەکەی نالیت تەواو کرد؟'),me('بەڵێ، ئێستا دەقەکەم بۆ ئەرشیف ئامادە دەکەم.'),pm('a','زۆر باشە، چاوەڕێی دەبم.')]},
{id:'c2',name:P.d.n,v:P.d.v,on:0,time:'دوێنێ',unread:0,msgs:[pm('d','تێبینییەکانی دیالێکتی هەورامیم نارد.'),me('سوپاس، بەیانی دەیخوێنمەوە.')]},
{id:'c3',name:P.k.n,v:P.k.v,on:1,time:'٠٨:١٥',unread:1,msgs:[pm('k','ئەو فەرهەنگە بە یونیکۆد نووسراوە؟'),me('بەڵێ، هەموو دەقەکان UTF-8ـن.'),pm('k','تەواو، دەتوانین بیخەینە ئەرشیفەوە.')]}],
groups:[
{id:'g1',name:'ئەنجومەنی زمانەوانانی مەکۆ',desc:'گفتوگۆی زمانەوانی',members:1850,cat:'کۆڕی زمانەوانی',v:mk('#047857'),time:'٠٩:١٥',unread:3,msgs:[pm('d','وشەی «پێڕاست» لە فەرهەنگەکەدا هەیە؟'),pm('k','بەڵێ، لە بەشی وشەی ڕەسەندا.'),me('زیادکردنی سەرچاوەکانیشی باشە.')]},
{id:'g2',name:'کۆڕی شیعری کلاسیکی کوردی',desc:'شیعری کلاسیک',members:3420,cat:'کۆڕی شیعری',v:mk('#9a3412'),time:'دوێنێ',unread:0,msgs:[pm('a','ئەمشەو غەزەلێکی کلاسیک دەخوێنینەوە.'),pm('d','چاوەڕێی دەکەین.')]}],
lib:[
{id:1,title:'دیوانی نالی',author:'نالی',cat:'دیوانی شیعر',fmt:'TXT',content:'هەڵبژاردەی نموونەیی\n\nئەی زمانی دایکم، ئەی ئاوی ژیانی دڵ\nلە تۆوە وشە دەڕوێ، لە تۆوە خەون دەگەشێتەوە\n\nشەو درەنگە و دڵ بە ڕێگای یار دەگەڕێ\nهەتا بەیانی چاو لە ڕێ دەمێنێتەوە'},
{id:2,title:'دیوانی مەحوی',author:'مەحوی',cat:'دیوانی شیعر',fmt:'TXT',content:'هەڵبژاردەی نموونەیی\n\nدڵ بە ڕازی نهێنی خۆی دەسووتێ\nوشە لە ناخدا وەک ئاگر دەمێنێتەوە\n\nهەر کەس بزانێ مانای ڕاستی چییە\nلە ڕێی خۆشەویستی دوور ناکەوێتەوە'},
{id:3,title:'حاجی قادری کۆیی',author:'حاجی قادری کۆیی',cat:'دیوانی شیعر',fmt:'TXT',content:'هەڵبژاردەی نموونەیی\n\nگەل بە زمانی خۆی دەژی و دەمێنێتەوە\nهەر نەتەوەیەک زمانی بمرێ، ناسنامەی ون دەبێ\n\nبەخێوکردنی وشە، بەخێوکردنی ئایندەیە'},
{id:4,title:'فەرهەنگی ڕیشەناسی و وشەی ڕەسەن',author:'تیمی مەکۆ',cat:'فەرهەنگ و زمان',fmt:'TXT',content:'ئاوەز: توانای تێگەیشتن و بیرکردنەوە.\n\nپێڕاست: ئەوەی بە ڕاستی دروست بێ.\n\nهەر وشەیەکی ڕەسەن، شوێنپێی مێژووی گەلێک لەگەڵ خۆی هەڵدەگرێت.'},
{id:5,title:'تێبینییەکانی دیالێکتی هەورامی و کەڵهوڕی',author:'دیلان هەورامی',cat:'لێکۆڵینەوە',fmt:'TXT',content:'دیالێکتەکانی کوردی گەنجینەی زمانەوانین.\n\nهەورامی چەندین شێوازی کۆنی ڕێزمانی پاراستووە، و کەڵهوڕیش لە دەنگسازیدا تایبەتمەندی خۆی هەیە.\n\nتۆمارکردنیان بە یونیکۆد بنەمای لێکۆڵینەوەی داهاتووە.'},
{id:6,title:'ئێستێتیکای وشە',author:'والی',cat:'لێکۆڵینەوە',fmt:'TXT',content:'جوانی لە وشەدا لە دەنگ و ماناوە دەست پێدەکات.\n\nکاتێک شاعیر وشەیەک هەڵدەبژێرێت، لە ڕاستیدا جیهانێک هەڵدەبژێرێت.\n\nزمانی جوان، زمانێکە کە ڕاستی و خەیاڵ پێکەوە دەگرێت.'}]
});
let S;try{S=JSON.parse(localStorage.getItem(KEY))}catch(e){}
if(!S||!S.user)S=seed();
const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){}};
const ui={view:'home',q:'',sq:false,tab:'mine',ctab:'chats',cq:'',cat:'هەموو',lq:'',fs:17,open:new Set(),room:null,poem:0,pa:null};
const who=u=>u==='me'?{name:S.user.name,v:S.user.avatar}:{name:P[u].n,v:P[u].v};
const icons=()=>window.lucide&&lucide.createIcons({attrs:{'stroke-width':1.75}});
const toast=t=>{const e=$('#toast');e.textContent=t;e.classList.add('show');clearTimeout(toast.t);toast.t=setTimeout(()=>e.classList.remove('show'),1800)};
const copy=async t=>{try{await navigator.clipboard.writeText(t)}catch(e){const a=D.createElement('textarea');a.value=t;D.body.appendChild(a);a.select();try{D.execCommand('copy')}catch(_){}a.remove()}};
const ov=(h,c='')=>{const d=D.createElement('div');d.className='ov '+c;d.innerHTML=h;$('#overlay-root').appendChild(d);icons();return d};
const closeOv=()=>{const l=$('#overlay-root').lastElementChild;if(l)l.remove()};
const setTheme=t=>{const r=D.documentElement;r.classList.remove('light','dark');r.classList.add(t);localStorage.setItem('meko_theme',t)};
const br=s=>esc(s).replace(/\n/g,'<br>');
const kb=i=>nn(Math.max(1,Math.ceil(new Blob([i.content]).size/1024)));
// ---- posts
const postH=p=>{const w=who(p.uid),o=ui.open.has(String(p.id));return `<article class="post-item" itemscope itemtype="https://schema.org/SocialMediaPosting"><header class="ph"><img class="avatar-sm" src="${w.v}" alt=""><div class="pm"><b itemprop="author">${esc(w.name)}</b><time itemprop="datePublished" datetime="${p.t}">${fd(p.t)}</time></div><button class="ib" data-a="more" data-id="${p.id}" aria-label="more">${I('more-horizontal')}</button></header><div class="pb ${p.poetry?'poem':''}" itemprop="articleBody">${br(p.text)}</div><div class="pc"><span>${nn(p.likes)} پەسەند</span><span>${nn(p.cm.length)} لێدوان</span></div><div class="pa"><button data-a="like" data-id="${p.id}" class="${p.liked?'on':''}">${I('heart')}پەسەندکردن</button><button data-a="cmt" data-id="${p.id}">${I('message-square')}لێدوان</button><button data-a="share" data-id="${p.id}">${I('share-2')}هاوبەشیکردن</button></div><section class="cmts ${o?'':'hidden'}">${p.cm.map(c=>{const x=who(c.uid);return `<div class="cm"><img class="avatar-xs" src="${x.v}" alt=""><div><b>${esc(x.name)}</b><p>${esc(c.text)}</p></div></div>`}).join('')}<div class="cinput"><input id="ci-${p.id}" type="text" placeholder="لێدوانێک بنووسە..."><button class="ib" data-a="cpost" data-id="${p.id}">${I('send')}</button></div></section></article>`};
const feedH=()=>{const q=ui.q.trim();return S.posts.filter(p=>!q||p.text.includes(q)||who(p.uid).name.includes(q)).map(postH).join('')||'<p class="empty">هیچ پۆستێک نەدۆزرایەوە</p>'};
const vHome=()=>`<header class="topbar"><h1>مەکۆ</h1><button class="ib" data-a="sbtn" aria-label="search">${I('search')}</button></header><div class="sbar ${ui.sq?'':'hidden'}"><input id="q" type="search" placeholder="گەڕان لە پۆست و نووسەر..." value="${esc(ui.q)}"></div><section id="feed">${feedH()}</section>`;
// ---- profile
const vProf=()=>{const u=S.user,mine=S.posts.filter(p=>p.uid==='me'),l=ui.tab==='mine'?mine:S.posts.filter(p=>p.saved);return `<header class="topbar"><b>@${esc(u.handle)}</b><button class="ib" data-a="edit">${I('settings')}</button></header><section class="phead"><img class="avatar-lg ring" src="${u.avatar}" alt=""><div class="stats"><div><b>${nn(mine.length)}</b><span>پۆست</span></div><div><b>${nn(u.followers)}</b><span>شوێنکەوتووان</span></div><div><b>${nn(u.following)}</b><span>شوێنکەوتوو</span></div></div></section><section class="bio"><b>${esc(u.name)}</b><p>${esc(u.bio)}</p><div class="loc">${I('map-pin')}<span>${esc(u.country)}، ${esc(u.city)}</span></div></section><div class="pbtns"><button data-a="edit">دەستکاریکردنی پڕۆفایل</button><button data-a="shareprof">هاوبەشیکردنی پڕۆفایل</button></div><div class="tabs"><button data-a="ptab" data-t="mine" class="${ui.tab==='mine'?'act':''}">بڵاوکراوەکانم</button><button data-a="ptab" data-t="saved" class="${ui.tab==='saved'?'act':''}">پاشەکەوتکراوەکان</button></div><section>${l.map(postH).join('')||'<p class="empty">هێشتا هیچ نییە</p>'}</section>`};
const cityF=(c,v)=>c==='کوردستان'?`<select id="ep-city">${CITIES.map(x=>`<option ${x===v?'selected':''}>${x}</option>`).join('')}</select>`:`<input id="ep-city" type="text" value="${esc(v)}" placeholder="شار">`;
// ---- chat
const rooms=()=>ui.ctab==='groups'?S.groups:S.chats;
const chatListH=()=>{const q=ui.cq.trim();return rooms().filter(c=>!q||c.name.includes(q)).map(c=>{const l=c.msgs[c.msgs.length-1];return `<div class="crow" data-a="room" data-id="${c.id}"><div class="aw"><img class="avatar-md" src="${c.v}" alt="">${c.on?'<span class="on-dot"></span>':''}</div><div class="cmid"><b>${esc(c.name)}</b><p>${l?esc(l.text):''}</p></div><div class="cside"><span>${c.time||''}</span>${c.unread?`<em>${nn(c.unread)}</em>`:''}</div></div>`}).join('')||'<p class="empty">هیچ شتێک نییە</p>'};
const vChat=()=>`<header class="topbar"><h1>نامەدان</h1><button class="ib" data-a="newchat">${I('square-pen')}</button></header><div class="sbar"><input id="cq" type="search" placeholder="گەڕان لە نامەکان..." value="${esc(ui.cq)}"></div><div class="tabs"><button data-a="ctab" data-t="chats" class="${ui.ctab==='chats'?'act':''}">چاتەکان</button><button data-a="ctab" data-t="groups" class="${ui.ctab==='groups'?'act':''}">گرووپەکان</button></div><section id="chat-list">${chatListH()}</section>`;
const msgH=(m,c,g)=>m.m?`<div class="msg mine"><div class="bub">${br(m.text)}</div></div>`:`<div class="msg them"><img class="avatar-xs" src="${m.v||c.v}" alt=""><div class="bub">${g&&m.n?`<b class="sn">${esc(m.n)}</b>`:''}${br(m.text)}</div></div>`;
const roomObj=()=>ui.room&&(ui.room.g?S.groups:S.chats).find(x=>x.id===ui.room.id);
const roomH=c=>`<header class="rh"><button class="ib" data-a="back">${I('arrow-right')}</button><img class="avatar-sm" src="${c.v}" alt=""><div><b>${esc(c.name)}</b><small>${ui.room.g?`${nn(c.members)} ئەندام · ${esc(c.cat)}`:'چالاکە لەسەر هێڵ'}</small></div></header><div class="stream" id="stream">${c.msgs.map(m=>msgH(m,c,ui.room.g)).join('')}</div><div class="cw"><div class="pill"><textarea id="chat-smart-input" rows="1" placeholder="نامەیەک بنووسە..."></textarea><button id="chat-send-btn" type="button" data-a="send" aria-label="send">${I('arrow-up')}</button></div></div>`;
const nform=t=>t==='dm'?`<label>ناوی کەسەکە<input id="n-name" type="text"></label><button class="solid" data-a="mkdm">دەستپێکردن</button>`:`<label>ناوی گرووپ<input id="g-name" type="text"></label><label>وەسف<textarea id="g-desc" rows="3"></textarea></label><label>پۆل<select id="g-cat"><option>کۆڕی زمانەوانی</option><option>کۆڕی شیعری</option><option>کۆڕی ئەدەبی</option><option>کۆڕی مێژوو</option></select></label><button class="solid" data-a="mkg">دروستکردنی گرووپ</button>`;
// ---- library
const rowsH=()=>{const q=ui.lq.trim();return S.lib.filter(i=>(ui.cat==='هەموو'||(ui.cat===CATS[1]?i.fmt==='TXT':i.cat===ui.cat))&&(!q||(i.title+i.author+i.content).includes(q))).map(i=>`<article class="lrow"><span class="fmt">${i.fmt}</span><div class="lmid"><h3>${esc(i.title)}</h3><p>${esc(i.author)} · ${esc(i.cat)} · ${kb(i)} کیلۆبایت</p></div><div><button class="ib" data-a="read" data-id="${i.id}" aria-label="read">${I('book-open')}</button><button class="ib" data-a="dl" data-id="${i.id}" aria-label="download">${I('download')}</button></div></article>`).join('')||'<p class="empty">هیچ دەقێک نەدۆزرایەوە</p>'};
const vLib=()=>{const f=S.lib[0];return `<header class="topbar"><h1>کتێبخانە و ئەرشیف</h1><button class="pill-btn" data-a="addtxt">+ زیادکردنی دەق</button></header><div class="sbar"><input id="lq" type="search" placeholder="گەڕان لە ناونیشان، نووسەر، یان دەقی خاو..." value="${esc(ui.lq)}"></div><div class="pills">${CATS.map(c=>`<button data-a="cat" data-c="${c}" class="${ui.cat===c?'act':''}">${c}</button>`).join('')}</div>${f?`<section class="hero"><h2>${esc(f.title)}</h2><p>${esc(f.content.split('\n').filter(Boolean).slice(0,2).join(' — '))}</p><button class="pill-btn" data-a="read" data-id="${f.id}">خوێندنەوەی دەق</button></section>`:''}<section id="lib-list">${rowsH()}</section>`};
const dl=i=>{const a=D.createElement('a');a.href=URL.createObjectURL(new Blob(['\uFEFF'+i.content],{type:'text/plain;charset=utf-8'}));a.download=i.title+'.txt';D.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),1000)};
// ---- JSON-LD / nav / render
const jsonld=()=>{let s=$('#meko-jsonld');if(!s){s=D.createElement('script');s.id='meko-jsonld';s.type='application/ld+json';D.head.appendChild(s)}
s.textContent=JSON.stringify({'@context':'https://schema.org','@graph':[...S.posts.map(p=>({'@type':'SocialMediaPosting',headline:p.text.slice(0,60),articleBody:p.text,datePublished:p.t,inLanguage:'ku',author:{'@type':'Person',name:who(p.uid).name}})),...S.lib.map(i=>({'@type':i.cat==='دیوانی شیعر'?'Book':'CreativeWork',name:i.title,author:{'@type':'Person',name:i.author},genre:i.cat,inLanguage:'ku',text:i.content}))]})};
const navUp=()=>{$('#nav-avatar').src=S.user.avatar;$('#n-home').classList.toggle('on',ui.view==='home');$('#n-chat').classList.toggle('on',ui.view==='chat');$('#n-menu').classList.toggle('on',ui.view==='profile'||ui.view==='lib');$('#n-dot').classList.toggle('hidden',!S.chats.concat(S.groups).some(c=>c.unread))};
const render=()=>{$('#app').innerHTML=({home:vHome,chat:vChat,profile:vProf,lib:vLib})[ui.view]();navUp();icons();jsonld()};
const go=v=>{ui.view=v;render();scrollTo(0,0)};
const sheet=h=>ov(`<div class="sheetbg" data-a="closeov"><div class="sheet glass" data-a="noop">${h}</div></div>`,'z120').style.background='transparent';
const post=id=>S.posts.find(p=>String(p.id)===String(id));
const openRoom=id=>{ui.room={id,g:id[0]==='g'};const c=roomObj();c.unread=0;save();ov(roomH(c),'room z60');const s=$('#stream');s.scrollTop=s.scrollHeight;navUp()};
// ---- actions
const A={
noop(){},closeov:closeOv,home:()=>go('home'),chat:()=>go('chat'),goprof(){closeOv();go('profile')},golib(){closeOv();go('lib')},
theme(){setTheme(D.documentElement.classList.contains('dark')?'light':'dark')},
menu:()=>sheet(`<button data-a="goprof">${I('user')}<span>پڕۆفایلەکەم</span></button><button data-a="golib">${I('library')}<span>کتێبخانە و ئەرشیف</span></button><button data-a="theme">${I('moon')}<span>دۆخی تاریک / ڕووناک</span><span class="sw"></span></button>`),
sbtn(){ui.sq=!ui.sq;if(!ui.sq)ui.q='';render();if(ui.sq)$('#q').focus()},
like(el){const p=post(el.dataset.id);p.liked=p.liked?0:1;p.likes+=p.liked?1:-1;save();render()},
cmt(el){const i=el.dataset.id;ui.open.has(i)?ui.open.delete(i):ui.open.add(i);render()},
cpost(el){const i=el.dataset.id,t=$('#ci-'+i).value.trim();if(!t)return;post(i).cm.push({uid:'me',text:t});ui.open.add(i);save();render()},
async share(el){const p=post(el.dataset.id);await copy(p.text+'\n'+location.href);toast('کۆپی کرا')},
more(el){const id=el.dataset.id,p=post(id);sheet(`<button data-a="save" data-id="${id}">${I('bookmark')}<span>${p.saved?'لابردنی پاشەکەوت':'پاشەکەوتکردن'}</span></button>${p.uid==='me'?`<button data-a="del" data-id="${id}">${I('trash-2')}<span>سڕینەوە</span></button>`:''}`)},
save(el){closeOv();const p=post(el.dataset.id);p.saved=p.saved?0:1;save();render();toast(p.saved?'پاشەکەوت کرا':'لابرا')},
del(el){closeOv();S.posts=S.posts.filter(p=>String(p.id)!==el.dataset.id);save();render()},
create(){ui.poem=0;ov(`<header class="topbar" style="position:static"><button class="ib" data-a="closeov">${I('x')}</button><span style="font-weight:500;color:var(--mu)">پۆستی نوێ</span><button id="pub-btn" class="pill-btn off" data-a="publish">بڵاوکردنەوە</button></header><div class="cbody"><img class="avatar-sm" src="${S.user.avatar}" alt=""><textarea id="creator-textarea" placeholder="چی لە دڵتدایە؟ لێرە بینووسە..."></textarea></div><div class="ctool"><button id="poem-btn" class="tog" data-a="poem">${I('feather')}<span>شێوازی شیعر</span></button></div>`,'z100');$('#creator-textarea').focus()},
poem(){ui.poem=ui.poem?0:1;$('#creator-textarea').classList.toggle('poem',!!ui.poem);$('#poem-btn').classList.toggle('on',!!ui.poem)},
publish(){const t=$('#creator-textarea').value.trim();if(!t)return;S.posts.unshift({id:Date.now(),uid:'me',t:new Date().toISOString(),poetry:ui.poem,text:t,likes:0,liked:0,saved:0,cm:[]});save();closeOv();ui.view='home';ui.q='';ui.sq=false;render();scrollTo({top:0,behavior:'smooth'})},
ptab(el){ui.tab=el.dataset.t;render()},
shareprof:async()=>{await copy(location.href.split('#')[0]+'#@'+S.user.handle);toast('بەستەر کۆپی کرا')},
edit(){ui.pa=null;const u=S.user;ov(`<header class="topbar" style="position:static"><button class="ib" data-a="closeov">${I('x')}</button><span>دەستکاریکردنی پڕۆفایل</span><button class="pill-btn" data-a="saveprof">پاشەکەوتکردن</button></header><div class="form"><div class="center"><img id="ep-av" class="avatar-lg" src="${u.avatar}" data-a="pick" alt=""><button class="link" data-a="pick">گۆڕینی وێنەی پڕۆفایل</button><input type="file" id="avatar-upload-input" accept="image/*" hidden></div><label>ناو<input id="ep-name" type="text" value="${esc(u.name)}"></label><label>ژیاننامە<textarea id="ep-bio" rows="4">${esc(u.bio)}</textarea></label><label>وڵات<select id="ep-country">${COUNTRIES.map(c=>`<option ${c===u.country?'selected':''}>${c}</option>`).join('')}</select></label><label>شار<span id="ep-cw">${cityF(u.country,u.city)}</span></label></div>`,'z105')},
pick(){$('#avatar-upload-input').click()},
saveprof(){const u=S.user;u.name=$('#ep-name').value.trim()||u.name;u.bio=$('#ep-bio').value.trim();u.country=$('#ep-country').value;u.city=$('#ep-city').value.trim();if(ui.pa)u.avatar=ui.pa;save();closeOv();render();toast('پاشەکەوت کرا')},
ctab(el){ui.ctab=el.dataset.t;render()},
newchat(){ov(`<header class="topbar" style="position:static"><button class="ib" data-a="closeov">${I('x')}</button><span>نامەی نوێ</span><span class="ib"></span></header><div class="tabs"><button data-a="ntab" data-t="dm" class="act">نامەی تایبەتی نوێ</button><button data-a="ntab" data-t="gr">دروستکردنی گرووپی نوێ</button></div><div class="form" id="nform">${nform('dm')}</div>`,'z105')},
ntab(el){[...el.parentElement.children].forEach(b=>b.classList.toggle('act',b===el));$('#nform').innerHTML=nform(el.dataset.t)},
mkdm(){const n=$('#n-name').value.trim();if(!n)return;let c=S.chats.find(x=>x.name===n);if(!c){c={id:'c'+Date.now(),name:n,v:mk(COLORS[Math.floor(Math.random()*6)]),on:0,time:clock(),unread:0,msgs:[]};S.chats.unshift(c);save()}closeOv();ui.ctab='chats';render();openRoom(c.id)},
mkg(){const n=$('#g-name').value.trim();if(!n)return;const c={id:'g'+Date.now(),name:n,desc:$('#g-desc').value.trim(),members:1,cat:$('#g-cat').value,v:mk(COLORS[Math.floor(Math.random()*6)]),time:clock(),unread:0,msgs:[]};S.groups.unshift(c);save();closeOv();ui.ctab='groups';render()},
room:el=>openRoom(el.dataset.id),
back(){closeOv();ui.room=null;render()},
send(){const t=$('#chat-smart-input'),v=t.value.trim();if(!v)return;const c=roomObj(),m=me(v);c.msgs.push(m);c.time=clock();save();t.value='';t.style.height='auto';t.style.overflowY='hidden';$('#chat-send-btn').classList.remove('show');const s=$('#stream');s.insertAdjacentHTML('beforeend',msgH(m,c,ui.room.g));s.scrollTop=s.scrollHeight},
cat(el){ui.cat=el.dataset.c;render()},
read(el){const i=S.lib.find(x=>String(x.id)===el.dataset.id);ui.ri=i;ov(`<div class="rtb"><button class="ib" data-a="closeov">${I('x')}</button><button class="t" data-a="fsp">A+</button><button class="t" data-a="fsm">A-</button><span class="sp"></span><button class="ib" data-a="rcopy" aria-label="کۆپیکردنی دەق" title="کۆپیکردنی دەق">${I('copy')}</button><button class="ib" data-a="rdl" aria-label="داگرتن (UTF-8 TXT)" title="داگرتن (UTF-8 TXT)">${I('download')}</button></div><article class="rb" id="rd" style="font-size:${ui.fs}px" itemscope itemtype="https://schema.org/CreativeWork"><h1 itemprop="name">${esc(i.title)}</h1><div itemprop="text">${i.content.split('\n').filter(Boolean).map(l=>`<p>${esc(l)}</p>`).join('')}</div></article>`,'z110')},
fsp(){ui.fs=Math.min(26,ui.fs+1);$('#rd').style.fontSize=ui.fs+'px'},fsm(){ui.fs=Math.max(15,ui.fs-1);$('#rd').style.fontSize=ui.fs+'px'},
async rcopy(){await copy(ui.ri.content);toast('دەق کۆپی کرا')},rdl:()=>dl(ui.ri),
dl(el){dl(S.lib.find(x=>String(x.id)===el.dataset.id))},
addtxt(){ov(`<header class="topbar" style="position:static"><button class="ib" data-a="closeov">${I('x')}</button><span>زیادکردنی دەق</span><button class="pill-btn" data-a="savetxt">پاشەکەوتکردن</button></header><div class="form"><label>ناونیشان<input id="t-title" type="text"></label><label>نووسەر<input id="t-author" type="text"></label><label>پۆلێن<select id="t-cat">${CATS.slice(2).map(c=>`<option>${c}</option>`).join('')}</select></label><label>دەق<textarea id="t-body" rows="12"></textarea></label></div>`,'z105')},
savetxt(){const t=$('#t-title').value.trim(),b=$('#t-body').value.trim();if(!t||!b)return toast('ناونیشان و دەق پێویستن');S.lib.push({id:Date.now(),title:t,author:$('#t-author').value.trim()||'نەزانراو',cat:$('#t-cat').value,fmt:'TXT',content:b});save();closeOv();render();toast('زیادکرا')}
};
D.addEventListener('click',e=>{const el=e.target.closest('[data-a]');if(el&&A[el.dataset.a])A[el.dataset.a](el,e)});
D.addEventListener('input',e=>{const t=e.target,id=t.id;
if(id==='q'){ui.q=t.value;$('#feed').innerHTML=feedH();icons()}
else if(id==='cq'){ui.cq=t.value;$('#chat-list').innerHTML=chatListH()}
else if(id==='lq'){ui.lq=t.value;$('#lib-list').innerHTML=rowsH();icons()}
else if(id==='creator-textarea')$('#pub-btn').classList.toggle('off',!t.value.trim());
else if(id==='chat-smart-input'){t.style.height='auto';const mh=96;if(t.scrollHeight<=mh){t.style.height=t.scrollHeight+'px';t.style.overflowY='hidden'}else{t.style.height=mh+'px';t.style.overflowY='auto'}$('#chat-send-btn').classList.toggle('show',t.value.trim().length>0)}});
D.addEventListener('keydown',e=>{if(e.key!=='Enter'||e.shiftKey)return;const t=e.target;
if(t.id==='chat-smart-input'&&matchMedia('(hover:hover)').matches){e.preventDefault();A.send()}
else if(t.id&&t.id.startsWith('ci-')){e.preventDefault();A.cpost({dataset:{id:t.id.slice(3)}})}});
D.addEventListener('change',e=>{const t=e.target;
if(t.id==='ep-country')$('#ep-cw').innerHTML=cityF(t.value,'');
else if(t.id==='avatar-upload-input'&&t.files[0]){const r=new FileReader();r.onload=()=>{const im=new Image();im.onload=()=>{const c=D.createElement('canvas');c.width=c.height=250;const s=Math.min(im.width,im.height);c.getContext('2d').drawImage(im,(im.width-s)/2,(im.height-s)/2,s,s,0,0,250,250);ui.pa=c.toDataURL('image/jpeg',.85);$('#ep-av').src=ui.pa};im.src=r.result};r.readAsDataURL(t.files[0])}});
setTheme(localStorage.getItem('meko_theme')||'light');
render();
})();
