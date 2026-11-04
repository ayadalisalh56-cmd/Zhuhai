(()=>{
const $=s=>document.querySelector(s),K='meko_state_v2',DG='٠١٢٣٤٥٦٧٨٩';
const n=x=>String(x).replace(/\d/g,d=>DG[d]);
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const av=(t,c)=>'data:image/svg+xml;utf8,'+encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect width="100" height="100" fill="${c}"/><text x="50" y="66" font-size="46" text-anchor="middle" fill="#fff" font-family="sans-serif">${t}</text></svg>`);
const ISO=m=>new Date(Date.now()-m*6e4).toISOString();
const ago=t=>{const m=(Date.now()-new Date(t))/6e4;return m<1?'ئێستا':m<60?n(Math.floor(m))+' خولەک لەمەوبەر':m<1440?n(Math.floor(m/60))+' کاتژمێر لەمەوبەر':n(Math.floor(m/1440))+' ڕۆژ لەمەوبەر'};
const PP={ar:{name:'ئاراس کەریم',handle:'aras_karim',avatar:av('ئ','#b45309')},sh:{name:'شیرین ڕەشید',handle:'shirin_r',avatar:av('ش','#7c3aed')},ha:{name:'هێمن کەمال',handle:'hemn_k',avatar:av('ه','#0369a1')},za:{name:'زریان محەمەد',handle:'zryan_m',avatar:av('ز','#be123c')}};
const CITIES=['ئاکرێ','ئامەد','ئامێدی','ئورفا','ئیلام','باتمان','بانە','بێدلیس','بۆکان','پاوە','پێنجوێن','پیرانشار','تەقتەق','تکریت','جۆلەمێرگ','جوانڕۆ','چەمچەماڵ','چۆمان','حەسەکە','خانەقین','خۆی','خورماتوو','دێرسیم','دهۆک','دیواندەرە','ڕانیە','ڕەواندز','زاخۆ','زەڕایەن','سەردەشت','سەرپێڵی زەهاو','سەرێکانی','سەقز','سلێمانی','سنە','سۆران','سێرت','شنگال','شنۆ','شرنەخ','شەقڵاوە','عەفرین','قارس','قامیشلۆ','قەڵادزێ','قوچان','کرماشان','کەرکووک','کەلار','کۆبانێ','کۆیە','کفری','ماردین','ماکۆ','مەریوان','مەهاباد','مەلاطیە','مووش','نەغەدە','هەڵەبجە','هەولێر','وان'];

/* ---------- strictly-typed notification factory ---------- */
function createNotification(type,p){
  if(!['LIKE','COMMENT','FOLLOW'].includes(type))throw new Error('invalid type');
  if(!p||!p.actorName||!p.actorHandle||!p.actorAvatar)throw new Error('actor required');
  const L=type!=='FOLLOW';
  if(L&&(!p.postId||!p.postExcerpt))throw new Error('post required');
  if(type==='COMMENT'&&!p.commentText)throw new Error('commentText required');
  return{id:p.id||'n'+Date.now()+Math.random().toString(36).slice(2,6),type,actorName:p.actorName,actorHandle:p.actorHandle,actorAvatar:p.actorAvatar,postId:L?p.postId:null,postExcerpt:L?p.postExcerpt:null,commentText:type==='COMMENT'?p.commentText:null,isFollowingBack:type==='FOLLOW'?!!p.isFollowingBack:false,timestamp:p.timestamp||new Date().toISOString(),read:!!p.read};
}
const who=k=>({actorName:PP[k].name,actorHandle:PP[k].handle,actorAvatar:PP[k].avatar});
const ex=p=>p.orig.replace(/\n/g,' ').slice(0,60);

/* ---------- seed ---------- */
function seed(){
  const u={name:'والی',handle:'wali_kurd',country:'کوردستان',city:'کەرکووک',bio:'تەلارسازیی وشە و خەیاڵ؛ هەوڵێک بۆ پاراستن و بوژاندنەوەی زمانی ڕەسەنی کوردی لە جیهانی دیجیتاڵیدا.',avatar:av('و','#0f766e'),followers:1284,following:312};
  const P=(id,w,m,poem,text,likes,sh,cm)=>({id,authorName:w?PP[w].name:u.name,authorHandle:w?PP[w].handle:u.handle,avatar:w?PP[w].avatar:u.avatar,mine:!w,time:ISO(m),isPoetry:poem,orig:text,script:'ar',likes,liked:false,shares:sh,comments:cm.map((c,i)=>({id:id+'c'+i,who:c[0],text:c[1]}))});
  const posts=[
    P('p1',null,35,true,'زمانی دایک، گوڵی باخچەی ڕۆحمە\nهەر وشەیەک تێیدا، ئاسۆیەکی نوێیە\nبە وشە دەژیم و بە وشەش دەمرم\nئەمە سوێندی منە بە خاکی کوردستان',214,31,[['ar','ئافەرین، وشەکانت دڵی هەژاندم.'],['sh','زمانی دایک هەمیشە زیندووە.']]),
    P('p2','ar',150,false,'وشەی «ئاو» لە زمانی کوردیدا تەنیا ماددەیەک نییە؛ ڕیشەی ژیانە و لە دەیان زاراوە و فۆلکلۆردا هەزاران ساڵە دەژی. هەر نەتەوەیەک وشەکانی بپارێزێت، ناسنامەکەی دەپارێزێت.',96,12,[['ha','وتارێکی زۆر بەجێ بوو.']]),
    P('p3','sh',340,true,'شەوێک لە شەوانی هەولێر\nمانگ بەسەر قەڵاوە نیشتبووەوە\nو دڵم وەک چراکەی کۆچەرێک\nلە دووروە بانگی ماڵی دەکرد',158,19,[['za','هەستێکی تایبەتم پێ بەخشی.']]),
    P('p4','ha',720,false,'جوانی لە ئەدەبدا ئەوە نییە کە وشە بڕازێنرێتەوە، بەڵکو ئەوەیە کە وشە ڕاستییەک بدرکێنێت. دەقێکی جوان ئەو دەقەیە کە خوێنەر لە دوای تەواوبوونی خوێندنەوە، هێشتا لە ناو ئەوەدا بژی.',121,17,[['ar','بیرۆکەیەکی قووڵە.'],['sh','پشتگیریت دەکەم.']]),
    P('p5',null,1500,false,'کۆکردنەوەی دەقی کوردی بە یونیکۆد، یەکەم هەنگاوە بۆ ئەوەی زمانەکەمان لە مۆتۆڕی گەڕان و وەرگێڕانی ماشینی و زیرەکی دەستکرد جێگەی خۆی بگرێتەوە.',187,44,[['za','دەستخۆش، کارێکی زۆر پێویستە.']]),
    P('p6','za',2900,true,'کوردستان، ئەی نیشتمانی چیا و دار\nپێت دەڵێم هەر تۆی لە دڵمدا بەردەوام\nهەر چەند دوورم، تۆ لە نێو چاوانمی\nوەک ئەستێرە لە ئاسمانی تاریکدا',233,38,[['ha','زۆر جوان بوو.']])
  ];
  const N=(t,k,pid,o)=>{const p=posts.find(x=>x.id===pid);return createNotification(t,Object.assign(who(k),{postId:pid,postExcerpt:p&&ex(p)},o))};
  const notifications=[
    N('LIKE','ar','p1',{id:'n1',timestamp:ISO(10)}),
    N('COMMENT','ha','p1',{id:'n2',commentText:'ئەم شیعرە ڕاستەوخۆ دەچێتە ناو دڵەوە.',timestamp:ISO(40)}),
    createNotification('FOLLOW',Object.assign(who('sh'),{id:'n3',timestamp:ISO(120),isFollowingBack:false})),
    N('LIKE','za','p5',{id:'n4',timestamp:ISO(300),read:true}),
    N('COMMENT','sh','p5',{id:'n5',commentText:'هیوادارم ئەم پڕۆژەیە بەردەوام بێت.',timestamp:ISO(600),read:true}),
    createNotification('FOLLOW',Object.assign(who('ar'),{id:'n6',timestamp:ISO(1200),isFollowingBack:true,read:true}))
  ];
  const chats=[
    {id:'c1',type:'dm',name:PP.ar.name,avatar:PP.ar.avatar,online:true,time:'١٠:٣٠',msgs:[{me:false,text:'سڵاو والی، شیعرەکەی ئەمڕۆت زۆر جوان بوو.'},{me:true,text:'سوپاس بەڕێز، دڵخۆشم کە بەدڵت بووە.'}]},
    {id:'c2',type:'dm',name:PP.sh.name,avatar:PP.sh.avatar,online:false,time:'دوێنێ',msgs:[{me:false,text:'ئەو وتارەی ڕێنووس بنێرە بۆم تکایە.'}]},
    {id:'c3',type:'dm',name:PP.ha.name,avatar:PP.ha.avatar,online:true,time:'٠٩:١٥',msgs:[{me:true,text:'سبەینێ یەکدی دەبینین؟'},{me:false,text:'بەڵێ، کاتژمێر دە باشە.'}]},
    {id:'g1',type:'group',name:'گرووپی ئەدەبیاتی کوردی',avatar:av('ئ','#334155'),members:1850,time:'١١:٠٠',msgs:[{me:false,who:'sh',text:'شیعری نوێی ئەم هەفتەیە بخوێننەوە.'}]},
    {id:'g2',type:'group',name:'کۆڕی زمانەوانی و ڕێنووس',avatar:av('ک','#0f766e'),members:2430,time:'دوێنێ',msgs:[{me:false,who:'ar',text:'بۆچوونتان لەسەر یەکخستنی ڕێنووس چییە؟'}]}
  ];
  return{user:u,posts,notifications,chats,saved:[],fs:15.5};
}
let S;try{S=JSON.parse(localStorage.getItem(K))}catch(e){S=null}
if(!S||!S.user)S=seed();
const save=()=>{try{localStorage.setItem(K,JSON.stringify(S))}catch(e){}};
const V={view:'home',nf:'all',open:new Set(),ptab:'all',ctab:'dm',room:null};
const P=id=>S.posts.find(p=>p.id===id);
const notify=(t,o)=>{try{S.notifications.unshift(createNotification(t,o));save()}catch(e){console.error(e)}};
const rnd=()=>['ar','sh','ha','za'][Math.floor(Math.random()*4)];

/* ---------- Kurdish Aramaic -> Latin (Hawar) ---------- */
const KV='اەێۆ';
function lw(w){
  if(w==='و')return'û';
  const M={ا:'a',ە:'e',ێ:'ê',ۆ:'o',ب:'b',پ:'p',ت:'t',ج:'c',چ:'ç',ح:'h',خ:'x',د:'d',ز:'z',ژ:'j',س:'s',ش:'ş',ع:"'",غ:'x',ف:'f',ڤ:'v',ق:'q',ک:'k',گ:'g',م:'m',ن:'n',ه:'h',ھ:'h',ء:"'",'؟':'?','،':',','؛':';','\u0640':'','\u200c':''};
  const c=[...w];let o='';
  for(let i=0;i<c.length;i++){
    const ch=c[i],pv=c[i-1],nx=c[i+1],st=i===0;
    if(ch==='ئ'){if(nx&&'اەێۆوی'.includes(nx))continue;o+="'";continue}
    if(ch==='و'){if(nx==='و'){o+='û';i++;continue}o+=((pv&&KV.includes(pv))||(nx&&KV.includes(nx)))?'w':'u';continue}
    if(ch==='ی'){o+=((pv&&KV.includes(pv))||(nx&&KV.includes(nx)))?'y':'î';continue}
    if(ch==='ر'){o+='r';continue}
    if(ch==='ڕ'){o+=st?'r':'rr';continue}
    if(ch==='ل'){o+='l';continue}
    if(ch==='ڵ'){o+=st?'l':'ll';continue}
    const d=DG.indexOf(ch);
    o+=M[ch]!==undefined?M[ch]:(d>=0?d:ch);
  }
  return o;
}
function transliterateKurdishToLatin(text){
  return text.replace(/[\u0600-\u06FF\u200c]+/g,lw).replace(/(^|\n|[.!?]\s+)(\p{L})/gu,(m,a,b)=>a+b.toUpperCase());
}

/* ---------- JSON-LD ---------- */
function ld(){
  const g=S.posts.map(p=>({'@type':'SocialMediaPosting','@id':'#p-'+p.id,inLanguage:'ku',headline:p.orig.slice(0,60),articleBody:p.orig,datePublished:p.time,author:{'@type':'Person',name:p.mine?S.user.name:p.authorName},interactionStatistic:{'@type':'InteractionCounter',interactionType:'https://schema.org/LikeAction',userInteractionCount:p.likes}}));
  $('#meko-jsonld').textContent=JSON.stringify({'@context':'https://schema.org','@graph':g});
}

/* ---------- views ---------- */
const icons=()=>{if(window.lucide)lucide.createIcons({attrs:{'stroke-width':1.75}})};
function toast(m){const t=$('#toast');t.textContent=m;t.classList.add('show');clearTimeout(toast.t);toast.t=setTimeout(()=>t.classList.remove('show'),1800)}
const cmt=p=>`<section class="cms">${p.comments.map(c=>{const w=c.who==='me'?S.user:PP[c.who];return`<div class="cm"><img class="avatar-xs" src="${w.avatar}" alt=""><div class="cb"><b>${esc(w.name)}</b><p>${esc(c.text)}</p></div></div>`}).join('')}<div class="ci"><input id="ci-${p.id}" placeholder="لێدوانێک بنووسە..."><button class="ib" data-a="addc" data-id="${p.id}" aria-label="send"><i data-lucide="send"></i></button></div></section>`;
function postH(p){
  const la=p.script==='la',t=la?transliterateKurdishToLatin(p.orig):p.orig;
  const nm=p.mine?S.user.name:p.authorName,im=p.mine?S.user.avatar:p.avatar;
  return`<article class="post" id="p-${p.id}"><header class="ph"><div class="pm"><img class="avatar-sm" src="${im}" alt=""><div><b>${esc(nm)}</b><time datetime="${p.time}">${ago(p.time)}</time></div></div><button class="ib" data-a="more" data-id="${p.id}" aria-label="more"><i data-lucide="more-horizontal"></i></button></header><section class="pb ${p.isPoetry?'poem':'prose'}"${la?' dir="ltr"':''} lang="${la?'ku-Latn':'ku'}">${esc(t).replace(/\n/g,'<br>')}</section><footer class="pa"><div class="g1"><button class="ab ${p.liked?'liked':''}" data-a="like" data-id="${p.id}" aria-label="like"><i data-lucide="heart"></i><span>${n(p.likes)}</span></button><button class="ab" data-a="cm" data-id="${p.id}" aria-label="comments"><i data-lucide="message-circle"></i><span>${n(p.comments.length)}</span></button><button class="ab" data-a="share" data-id="${p.id}" aria-label="share"><i data-lucide="share-2"></i><span>${n(p.shares)}</span></button></div><div class="g2"><button class="pillb" data-a="conv" data-id="${p.id}">${la?'ئارامی':'لاتینی'}</button><button class="ab ${S.saved.includes(p.id)?'saved':''}" data-a="save" data-id="${p.id}" aria-label="save"><i data-lucide="bookmark"></i></button></div></footer>${V.open.has(p.id)?cmt(p):''}</article>`;
}
const feed=a=>a.filter(p=>!p.hidden).map(postH).join('<div class="sep"></div>')||'<p class="empty">هیچ پۆستێک نییە</p>';

function notifH(x){
  const t=`<time datetime="${x.timestamp}">${ago(x.timestamp)}</time>`,c=x.read?'':' un';
  switch(x.type){
    case'LIKE':return`<div class="nr${c}" data-a="nrow" data-id="${x.id}"><div class="nav"><img class="avatar-md" src="${x.actorAvatar}" alt=""><span class="nb" style="background:#ef4444"><i data-lucide="heart"></i></span></div><div class="nt"><p><strong>${esc(x.actorName)}</strong> پۆستەکەتی پەسەند کرد.</p><small class="ex">${esc(x.postExcerpt)}</small>${t}</div></div>`;
    case'COMMENT':return`<div class="nr${c}" data-a="nrow" data-id="${x.id}"><div class="nav"><img class="avatar-md" src="${x.actorAvatar}" alt=""><span class="nb" style="background:#0084ff"><i data-lucide="message-circle"></i></span></div><div class="nt"><p><strong>${esc(x.actorName)}</strong> لێدوانێکی نووسی لەسەر پۆستەکەت:</p><blockquote class="qb">“${esc(x.commentText)}”</blockquote><small class="ex">${esc(x.postExcerpt)}</small>${t}</div></div>`;
    case'FOLLOW':return`<div class="nr${c}" data-a="nrow" data-id="${x.id}"><div class="nav"><img class="avatar-md" src="${x.actorAvatar}" alt=""><span class="nb" style="background:#10b981"><i data-lucide="user-plus"></i></span></div><div class="nt"><p><strong>${esc(x.actorName)}</strong> دەستی کرد بە شوێنکەوتنت.</p>${t}</div><button class="fb ${x.isFollowingBack?'on':''}" data-a="fol" data-id="${x.id}">${x.isFollowingBack?'شوێنکەوتوو':'شوێنکەوتنەوە'}</button></div>`;
  }
  return'';
}
function notifs(){
  const T=[['all','هەموو'],['LIKE','پەسەندکردن'],['COMMENT','لێدوانەکان'],['FOLLOW','شوێنکەوتن']];
  const l=S.notifications.filter(x=>V.nf==='all'||x.type===V.nf);
  return`<header class="nh"><b>ئاگادارییەکان</b><button data-a="mall">خوێندنەوەی هەموو</button></header><nav class="tabs">${T.map(t=>`<button data-a="nf" data-t="${t[0]}" class="${V.nf===t[0]?'on':''}">${t[1]}</button>`).join('')}</nav><section>${l.map(notifH).join('')||'<p class="empty">هیچ ئاگادارییەک نییە</p>'}</section>`;
}
function prof(){
  const u=S.user,mine=S.posts.filter(p=>p.mine&&(V.ptab==='all'||p.isPoetry));
  return`<header class="ptop"><span dir="ltr">@${esc(u.handle)}</span><button class="ib" data-a="nav" data-v="settings" aria-label="settings"><i data-lucide="settings"></i></button></header><section class="phd"><img class="avatar-lg" src="${u.avatar}" alt=""><div class="st"><div><b>${n(S.posts.filter(p=>p.mine).length)}</b><span>پۆست</span></div><div><b>${n(u.followers)}</b><span>شوێنکەوتووان</span></div><div><b>${n(u.following)}</b><span>شوێنکەوتوو</span></div></div></section><section class="pbio"><b>${esc(u.name)}</b><p>${esc(u.bio)}</p><span class="loc"><i data-lucide="map-pin"></i>${esc(u.country)}، ${esc(u.city)}</span></section><div class="pbt"><button class="btn2" data-a="editp">دەستکاریکردنی پڕۆفایل</button><button class="btn2" data-a="shp">هاوبەشیکردنی پڕۆفایل</button></div><nav class="tabs"><button data-a="ptab" data-t="all" class="${V.ptab==='all'?'on':''}">هەموو بڵاوکراوەکانم</button><button data-a="ptab" data-t="poem" class="${V.ptab==='poem'?'on':''}">شیعرەکانم</button></nav><section>${feed(mine)}</section>`;
}
const saved=()=>`<header class="sh"><div><b>پاشەکەوتکراوەکان</b><small><i data-lucide="lock"></i>تەنها خۆت دەیبینیت</small></div></header><section>${S.saved.length?feed(S.posts.filter(p=>S.saved.includes(p.id))):'<p class="empty">هێشتا هیچ پۆستێکت پاشەکەوت نەکردووە</p>'}</section>`;
const sett=()=>`<header class="sh"><b>ڕێکخستنەکان</b></header><section class="srow"><span>ڕووکاری تاریک</span><button class="tg" data-a="theme" aria-pressed="${document.documentElement.classList.contains('dark')}"><i></i></button></section><section class="srow"><span>قەبارەی نووسینی خوێندنەوە</span><div><button class="ib" data-a="fs" data-d="-1">A-</button><b>${n(S.fs)}</b><button class="ib" data-a="fs" data-d="1">A+</button></div></section><section class="srow"><button class="btn2" data-a="tn">تاقیکردنەوەی ئاگاداری</button><button class="btn2" data-a="reset">ڕێکخستنەوەی داتای نموونە</button></section>`;
function chat(){
  const l=S.chats.filter(c=>c.type===V.ctab);
  return`<div class="chh"><nav class="tabs"><button data-a="ctab" data-t="dm" class="${V.ctab==='dm'?'on':''}">چاتەکان</button><button data-a="ctab" data-t="group" class="${V.ctab==='group'?'on':''}">گرووپەکان</button></nav><button class="ib" data-a="newchat" aria-label="new"><i data-lucide="square-pen"></i></button></div><section>${l.map(c=>{const m=c.msgs[c.msgs.length-1];return`<div class="cr" data-a="room" data-id="${c.id}"><div class="dot"><img class="avatar-md" src="${c.avatar}" alt="">${c.online?'<i></i>':''}</div><div class="cc"><b>${esc(c.name)}</b><span>${m?esc(m.text):''}</span></div><time>${c.time}</time></div>`}).join('')}</section>`;
}
function room(){
  const c=S.chats.find(x=>x.id===V.room);
  const st=c.type==='group'?n(c.members.toLocaleString('en'))+' ئەندام':(c.online?'چالاکە':'');
  return`<header class="rh"><button class="ib" data-a="back" aria-label="back"><i data-lucide="arrow-right"></i></button><img class="avatar-sm" src="${c.avatar}" alt=""><div><b>${esc(c.name)}</b><small>${st}</small></div></header><section class="msgs">${c.msgs.map(m=>m.me?`<div class="mr m"><div class="bub">${esc(m.text)}</div></div>`:`<div class="mr t"><img class="avatar-xs" src="${m.who?PP[m.who].avatar:c.avatar}" alt=""><div class="bub">${esc(m.text)}</div></div>`).join('')}</section><div class="rin"><div class="rpill"><textarea id="rin" rows="1" placeholder="نامەیەک بنووسە..."></textarea><button class="rs" id="rs" data-a="send" aria-label="send"><i data-lucide="arrow-up"></i></button></div></div>`;
}
function bar(){
  const un=S.notifications.filter(x=>!x.read).length,v=V.view,b=$('#bar');
  b.classList.toggle('hide',v==='room');
  b.innerHTML=`<button data-a="nav" data-v="home" class="${v==='home'?'on':''}" aria-label="home"><i data-lucide="home"></i></button><button data-a="nav" data-v="notifs" class="${v==='notifs'?'on':''}" aria-label="notifications"><i data-lucide="bell"></i>${un?`<em class="badge">${n(un)}</em>`:''}</button><button class="plus" data-a="create" aria-label="create"><i data-lucide="plus"></i></button><button data-a="nav" data-v="chat" class="${v==='chat'?'on':''}" aria-label="chat"><i data-lucide="message-circle"></i></button><button class="bav" data-a="drawer" aria-label="menu"><img src="${S.user.avatar}" alt=""><span class="mb"><i data-lucide="menu"></i></span></button>`;
}
function render(){
  const v=V.view;
  $('#app').innerHTML=v==='home'?'<h1 class="sr">مەکۆ</h1>'+feed(S.posts):v==='notifs'?notifs():v==='profile'?prof():v==='saved'?saved():v==='settings'?sett():v==='chat'?chat():room();
  bar();icons();ld();
  document.documentElement.style.setProperty('--fs',S.fs+'px');
}

/* ---------- drawer / theme ---------- */
function setTheme(d){const h=document.documentElement;h.classList.toggle('dark',d);h.classList.toggle('light',!d);try{localStorage.setItem('meko_theme',d?'dark':'light')}catch(e){}}
function drawerH(){
  const u=S.user,d=document.documentElement.classList.contains('dark');
  $('#drawer').innerHTML=`<header class="dp" data-a="go" data-v="profile"><img class="avatar-md" src="${u.avatar}" alt=""><div><b>${esc(u.name)}</b><span dir="ltr">@${esc(u.handle)}</span><span class="loc"><i data-lucide="map-pin"></i>${esc(u.city)}، ${esc(u.country)}</span><small>${n(u.followers)} شوێنکەوتووان · ${n(u.following)} شوێنکەوتوو</small></div></header><nav class="dn"><button data-a="go" data-v="profile"><i data-lucide="user"></i>پڕۆفایلەکەم</button><button data-a="go" data-v="saved"><i data-lucide="bookmark"></i><span>پاشەکەوتکراوەکان<small>تەنها خۆت دەیبینیت</small></span></button><button data-a="go" data-v="settings"><i data-lucide="settings"></i>ڕێکخستنەکان</button></nav><footer class="df"><div class="row"><span>ڕووکاری تاریک</span><button class="tg" data-a="dtheme" aria-pressed="${d}"><i></i></button></div><span>مەکۆ · ژێرخانی کراوەی زمانی کوردی</span></footer>`;
  icons();
}
const closeD=()=>{$('#drawer').classList.remove('open');$('#backdrop').classList.remove('open')};

/* ---------- creator ---------- */
function openC(){
  $('#creator').innerHTML=`<header class="ct"><button class="ib" data-a="cx" aria-label="close"><i data-lucide="x"></i></button><b>پۆستی نوێ</b><button class="pill" data-a="pub">بڵاوکردنەوە</button></header><div class="cbody"><img class="avatar-sm" src="${S.user.avatar}" alt=""><textarea id="cta" placeholder="چی لە دڵتدایە؟ لێرە بینووسە..."></textarea></div><footer class="cf"><button class="chip" id="cpo" data-a="poem"><i data-lucide="feather"></i>شێوازی شیعر</button></footer>`;
  $('#creator').classList.add('open');icons();$('#cta').focus();
}

/* ---------- modals ---------- */
const closeM=()=>{$('#modal').classList.remove('open');$('#modal').innerHTML=''};
function cityF(c,v){$('#ecw').innerHTML=c==='کوردستان'?`<select id="eci">${CITIES.map(x=>`<option${x===v?' selected':''}>${x}</option>`).join('')}</select>`:`<input id="eci" value="${esc(v)}" maxlength="40">`}
function editM(){
  const u=S.user;
  $('#modal').innerHTML=`<div class="mbd" data-a="mx"></div><div class="sheet"><header class="mh"><button class="ib" data-a="mx" aria-label="close"><i data-lucide="x"></i></button><b>دەستکاریکردنی پڕۆفایل</b><button class="pill" data-a="savep">پاشەکەوتکردن</button></header><div class="ae"><div class="aw"><img id="ea" class="avatar-lg" src="${u.avatar}" alt=""><span class="cam"><i data-lucide="camera"></i></span></div><label class="lnk">گۆڕینی وێنەی پڕۆفایل<input type="file" accept="image/*" id="ef" hidden></label></div><label class="f"><span>ناوی پیشاندراو</span><input id="en" value="${esc(u.name)}" maxlength="40"></label><label class="f"><span>نازناو / یوزەرنەیم</span><div class="hw"><b>@</b><input id="eh" value="${esc(u.handle)}" maxlength="30"></div></label><label class="f"><span>ژیاننامە</span><textarea id="eb" maxlength="160" rows="3">${esc(u.bio)}</textarea><small id="ec">${n(u.bio.length)}/${n(160)}</small></label><div class="f2"><label class="f"><span>وڵات</span><select id="eco">${['کوردستان','ئەڵمانیا','سوید','بەریتانیا','ئەمریکا'].map(c=>`<option${c===u.country?' selected':''}>${c}</option>`).join('')}</select></label><label class="f"><span>شار</span><span id="ecw"></span></label></div></div>`;
  $('#modal').classList.add('open');cityF(u.country,u.city);icons();
}
function chatM(){
  $('#modal').innerHTML=`<div class="mbd" data-a="mx"></div><div class="sheet"><header class="mh"><button class="ib" data-a="mx" aria-label="close"><i data-lucide="x"></i></button><b>نوێ</b><button class="pill" data-a="mkchat">دروستکردن</button></header><label class="f"><span>جۆر</span><select id="nt"><option value="dm">چاتی تایبەت</option><option value="group">گرووپی گەورە</option></select></label><label class="f"><span>ناو</span><input id="nn" maxlength="40"></label></div>`;
  $('#modal').classList.add('open');icons();
}
function pic(f){
  const r=new FileReader();
  r.onload=()=>{const i=new Image();i.onload=()=>{const c=document.createElement('canvas');c.width=c.height=250;const s=Math.min(i.width,i.height);c.getContext('2d').drawImage(i,(i.width-s)/2,(i.height-s)/2,s,s,0,0,250,250);S.user.avatar=c.toDataURL('image/jpeg',.85);save();$('#ea').src=S.user.avatar;render();toast('وێنەی پڕۆفایل گۆڕدرا')};i.src=r.result};
  r.readAsDataURL(f);
}
function addC(id){
  const i=$('#ci-'+id),p=P(id);if(!i||!i.value.trim())return;
  const t=i.value.trim();p.comments.push({id:id+'c'+Date.now(),who:'me',text:t});
  notify('COMMENT',Object.assign(who(rnd()),{postId:id,postExcerpt:ex(p),commentText:t}));
  save();render();
}

/* ---------- actions ---------- */
function act(a,d){
  const p=d.id&&S.posts.find(x=>x.id===d.id);
  switch(a){
    case'nav':case'go':closeD();V.view=d.v;V.room=null;render();scrollTo(0,0);break;
    case'drawer':drawerH();$('#drawer').classList.add('open');$('#backdrop').classList.add('open');break;
    case'dx':closeD();break;
    case'create':openC();break;
    case'cx':$('#creator').classList.remove('open');break;
    case'poem':$('#cta').classList.toggle('poem');$('#cpo').classList.toggle('on');break;
    case'pub':{
      const t=$('#cta').value.trim();if(!t){toast('سەرەتا شتێک بنووسە');break}
      S.posts.unshift({id:'p'+Date.now(),authorName:S.user.name,authorHandle:S.user.handle,avatar:S.user.avatar,mine:true,time:new Date().toISOString(),isPoetry:$('#cta').classList.contains('poem'),orig:t,script:'ar',likes:0,liked:false,shares:0,comments:[]});
      save();$('#creator').classList.remove('open');V.view='home';render();scrollTo(0,0);toast('بڵاوکرایەوە');break}
    case'like':p.liked=!p.liked;p.likes+=p.liked?1:-1;if(p.liked)notify('LIKE',Object.assign(who(rnd()),{postId:p.id,postExcerpt:ex(p)}));save();render();break;
    case'cm':V.open.has(d.id)?V.open.delete(d.id):V.open.add(d.id);render();break;
    case'addc':addC(d.id);break;
    case'share':{const t=p.orig;p.shares++;save();render();if(navigator.clipboard)navigator.clipboard.writeText(t).then(()=>toast('کۆپی کرا'),()=>toast('کۆپی نەکرا'));else toast('کۆپی نەکرا');break}
    case'conv':p.script=p.script==='la'?'ar':'la';save();render();break;
    case'save':{const i=S.saved.indexOf(d.id);i<0?S.saved.push(d.id):S.saved.splice(i,1);save();render();toast(i<0?'پاشەکەوت کرا':'لابرا لە پاشەکەوتکراوەکان');break}
    case'more':if(p.mine){if(confirm('ئەم پۆستە بسڕدرێتەوە؟')){S.posts=S.posts.filter(x=>x.id!==p.id);S.saved=S.saved.filter(x=>x!==p.id);save();render()}}else{p.hidden=true;save();render();toast('پۆستەکە شاردرایەوە')}break;
    case'nf':V.nf=d.t;render();break;
    case'mall':S.notifications.forEach(x=>x.read=true);save();render();break;
    case'nrow':{
      const x=S.notifications.find(y=>y.id===d.id);x.read=true;save();
      if(x.postId&&P(x.postId)){V.view='home';if(x.type==='COMMENT')V.open.add(x.postId);render();setTimeout(()=>{const e=document.getElementById('p-'+x.postId);if(e)e.scrollIntoView({block:'start'})},30)}else render();break}
    case'fol':{const x=S.notifications.find(y=>y.id===d.id);x.isFollowingBack=!x.isFollowingBack;S.user.following+=x.isFollowingBack?1:-1;x.read=true;save();render();break}
    case'ptab':V.ptab=d.t;render();break;
    case'editp':editM();break;
    case'shp':if(navigator.clipboard)navigator.clipboard.writeText('@'+S.user.handle).then(()=>toast('کۆپی کرا'),()=>toast('کۆپی نەکرا'));break;
    case'mx':closeM();break;
    case'savep':{
      const h=$('#eh').value.toLowerCase().replace(/[^a-z0-9_]/g,''),nm=$('#en').value.trim();
      if(!h||!nm){toast('ناو و نازناو پێویستن');break}
      Object.assign(S.user,{name:nm,handle:h,bio:$('#eb').value.trim(),country:$('#eco').value,city:$('#eci').value});
      save();closeM();render();toast('پاشەکەوت کرا');break}
    case'theme':setTheme(!document.documentElement.classList.contains('dark'));render();break;
    case'dtheme':setTheme(!document.documentElement.classList.contains('dark'));drawerH();render();break;
    case'fs':S.fs=Math.min(22,Math.max(13,S.fs+ +d.d));save();render();break;
    case'tn':{
      const t=['LIKE','COMMENT','FOLLOW'][Math.floor(Math.random()*3)],m=S.posts.find(x=>x.mine),o=who(rnd());
      if(t==='FOLLOW')notify(t,o);else notify(t,Object.assign(o,{postId:m.id,postExcerpt:ex(m),commentText:t==='COMMENT'?'ئەمە لێدوانێکی تاقیکردنەوەیە.':null}));
      render();toast('ئاگادارییەکی نوێ دروست کرا');break}
    case'reset':if(confirm('هەموو داتاکان بگەڕێنرێنەوە بۆ نموونە؟')){S=seed();save();V.open.clear();render();toast('ڕێکخرایەوە')}break;
    case'ctab':V.ctab=d.t;render();break;
    case'newchat':chatM();break;
    case'mkchat':{
      const nm=$('#nn').value.trim();if(!nm){toast('ناو بنووسە');break}
      const g=$('#nt').value==='group';
      S.chats.unshift({id:'c'+Date.now(),type:g?'group':'dm',name:nm,avatar:av(nm[0],g?'#334155':'#0369a1'),online:!g,members:1,time:'ئێستا',msgs:[]});
      V.ctab=g?'group':'dm';save();closeM();render();break}
    case'room':V.room=d.id;V.view='room';render();scrollTo(0,document.body.scrollHeight);break;
    case'back':V.view='chat';V.room=null;render();break;
    case'send':{
      const t=$('#rin').value.trim();if(!t)break;
      S.chats.find(x=>x.id===V.room).msgs.push({me:true,text:t});save();render();scrollTo(0,document.body.scrollHeight);break}
  }
}
document.addEventListener('click',e=>{const t=e.target.closest('[data-a]');if(t)act(t.dataset.a,t.dataset)});
document.addEventListener('input',e=>{
  const t=e.target;
  if(t.id==='eh')t.value=t.value.toLowerCase().replace(/[^a-z0-9_]/g,'');
  if(t.id==='eb'){t.style.height='auto';t.style.height=t.scrollHeight+'px';$('#ec').textContent=n(t.value.length)+'/'+n(160)}
  if(t.id==='rin'){t.style.height='auto';t.style.height=Math.min(t.scrollHeight,96)+'px';$('#rs').classList.toggle('show',!!t.value.trim())}
});
document.addEventListener('change',e=>{const t=e.target;if(t.id==='eco')cityF(t.value,'');if(t.id==='ef'&&t.files[0])pic(t.files[0])});
document.addEventListener('keydown',e=>{if(e.key==='Enter'&&e.target.id&&e.target.id.startsWith('ci-')){e.preventDefault();addC(e.target.id.slice(3))}});

/* ---------- init ---------- */
try{setTheme(localStorage.getItem('meko_theme')==='dark')}catch(e){}
render();
window.addEventListener('load',icons);
})();
