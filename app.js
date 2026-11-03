(() => {
'use strict';
const $ = (s, r = document) => r.querySelector(s);
const KEY = 'meko.v2', KD = '٠١٢٣٤٥٦٧٨٩', H = 3600000;
const num = n => String(n).replace(/\d/g, d => KD[d]);
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const icons = () => { if (window.lucide) lucide.createIcons({ attrs: { 'stroke-width': 1.75 } }); };
const I = n => `<i data-lucide="${n}"></i>`;

const CITIES = ['ئامەد','ئیلام','بۆکان','پاوە','پیرانشار','جزیری بۆتان','جۆلەمێرگ','خانەقین','دهۆک','دێرسم','ڕحا','زاخۆ','سنە','سلێمانی','سەقز','شنگال','عاموودێ','عەفرین','قامیشلۆ','قارس','کرماشان','کەرکووک','کۆبانێ','مەریوان','مەهاباد','مێردین','ورمێ','وان','هەولێر','هەڵەبجە'];
const WORLD = { 'ئەڵمانیا': ['بەرلین','هامبورگ','کۆلن','میونشن'], 'بەریتانیا': ['بیرمنگهام','لەندەن','مانچێستەر'], 'سوید': ['ئۆپسالا','ستۆکهۆلم','گۆتەبۆری'], 'فەڕەنسا': ['پاریس','لیۆن','مارسێل'], 'ئەمریکا': ['لۆس ئەنجلس','نیویۆرک','نەشڤێل'], 'کەنەدا': ['تۆرۆنتۆ','مۆنتریاڵ','ڤانکۆڤەر'], 'هۆڵەندا': ['ئەمستردام','ئوتریخت','ڕۆتردام'], 'نەرویج': ['بێرگن','ئۆسلۆ','ترۆنهایم'] };
const citiesOf = c => c === 'کوردستان' ? CITIES : (WORLD[c] || []);

const now = Date.now();
const seed = () => ({
  dark: false,
  me: { name: 'ئاراس ڕەحمان', handle: 'aras.rahman', bio: 'وشە ماڵی منە،\nو هەر شیعرێک دەرگایەکە بۆ ئاسۆ.', country: 'کوردستان', city: 'کەرکووک', followers: 1284, following: 312 },
  posts: [
    { id: 1, author: 'ڕێبین کەریم', text: 'زمان تەنها ئامرازی قسەکردن نییە؛ ماڵی بیرەوەرییەکانمانە.', poetry: false, ts: now - 2 * H, likes: 45, liked: false, comments: [{ a: 'دانا سەعید', t: 'ڕاستە، با بیپارێزین.' }] },
    { id: 2, author: 'هێڤی ئامەدی', text: 'هەر وشەیەک کە دەیڵێم\nپردێکە بۆ دایکم،\nلە دوورەوە دەمگەڕێنێتەوە\nبۆ ماڵی ڕۆژانی منداڵی.', poetry: true, ts: now - 5 * H, likes: 118, liked: false, comments: [] },
    { id: 3, author: 'ئاراس ڕەحمان', me: true, text: 'ئەمڕۆ دەستم کرد بە ڕێکخستنی ئەرشیفی دەقە کوردییەکان. زۆربەی ئەو کتێبانەی کە دەیان ساڵ لەمەوبەر چاپکراون، تەنها وەک وێنە ماونەتەوە و گەڕان تێیاندا مومکین نییە. ئەگەر دەقەکان بە یونیکۆدی پاک بپارێزرێن، هەموو نەوەیەک دەتوانێت بیانخوێنێتەوە، لێیان بگەڕێت و کۆپییان بکات. ئەمە هەنگاوی یەکەمە بۆ کتێبخانەیەکی گەورەتر.', poetry: false, ts: now - 26 * H, likes: 73, liked: true, comments: [{ a: 'شادی ئەحمەد', t: 'کارێکی زۆر بەنرخە.' }, { a: 'ڕێبین کەریم', t: 'بەردەوام بە.' }] }
  ],
  contacts: [
    { id: 1, name: 'ڕێبین کەریم', online: true, unread: true, msgs: [{ me: false, t: 'فایلی دیوانەکەت گەیشت، سوپاس.', ts: now - 2 * H }] },
    { id: 2, name: 'هێڤی ئامەدی', online: false, unread: false, msgs: [{ me: true, t: 'شیعرەکەت زۆر جوان بوو.', ts: now - 30 * H }] },
    { id: 3, name: 'دانا سەعید', online: true, unread: false, msgs: [{ me: false, t: 'سبەی دەتوانین کۆببینەوە؟', ts: now - 3 * 24 * H }] },
    { id: 4, name: 'شادی ئەحمەد', online: false, unread: false, msgs: [{ me: false, t: 'ڕێنووسەکە ناردم بۆت.', ts: now - 6 * 24 * H }] }
  ],
  books: [
    { id: 1, title: 'فەرهەنگی زاراوە زمانناسییەکان', author: 'ئەرشیفی مەکۆ', pdf: true, cat: 'lang', desc: 'کۆمەڵێک زاراوەی زمانناسی بە شیکردنەوەی کورت و نموونە.', text: 'ڕستە\nیەکەیەکی زمانییە کە واتایەکی تەواو دەگەیەنێت.\n\nڕەگ\nبنەڕەتی وشەیە پێش زیادکردنی پاشگر و پێشگر.\n\nپاشگر\nپارچەیەکە کە دوای ڕەگ دێت و واتای وشە دەگۆڕێت.' },
    { id: 2, title: 'هەڵبژاردەی شیعری کوردی', author: 'چەند نووسەرێک', pdf: false, cat: 'poetry', mine: true, desc: 'دەقی خاوی کۆمەڵێک شیعر بە یونیکۆدی پاک.', text: 'شەوێک لە شاخ\n\nمانگ لەسەر سەرم دەگەڕا\nو بای شەمال دەیگوت:\nهەر ڕێگایەک بەرەو ماڵ دەچێت.' },
    { id: 3, title: 'ڕێنووسی کوردی: ڕێبەرێکی کورت', author: 'ئەرشیفی مەکۆ', pdf: true, cat: 'lang', desc: 'یاساکانی نووسینی پیتەکان و جیاکردنەوەی ئەو نووسینانەی کە زۆر تێکەڵ دەکرێن.', text: 'ک و ی و ە و ۆ پیتی کوردین و لەگەڵ ك و ي و ة و ؤی عەرەبی تێکەڵ نەکرێن.' },
    { id: 4, title: 'نامەکانی دوور', author: 'ئاراس ڕەحمان', pdf: false, cat: 'poetry', desc: 'نامەی ئەدەبی کورت، وەک دەقی خاو پارێزراوە.', text: 'بۆ ئەو کەسەی لە دوورە،\n\nئەم وشانە بەبێ ڕازاندنەوە دەنێرم؛\nبەڵکو لە شوێنی خۆیان بمێننەوە.' }
  ],
  saved: { posts: [], books: [] }
});

let S;
try { S = Object.assign(seed(), JSON.parse(localStorage.getItem(KEY)) || {}); } catch (e) { S = seed(); }
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} };

let cur = 'feed', chatId = null, ptab = 'posts', flt = 'all', fq = null, bq = '', dq = '';
const C = new Set(), X = new Set();

const ago = ts => { const m = Math.max(0, (Date.now() - ts) / 60000); return m < 1 ? 'ئێستا' : m < 60 ? num(Math.floor(m)) + ' خولەک لەمەوبەر' : m < 1440 ? num(Math.floor(m / 60)) + ' کاتژمێر لەمەوبەر' : num(Math.floor(m / 1440)) + ' ڕۆژ لەمەوبەر'; };
const short = ts => { const m = (Date.now() - ts) / 60000; return m < 60 ? num(Math.max(1, Math.floor(m))) + 'خ' : m < 1440 ? num(Math.floor(m / 60)) + 'ک' : num(Math.floor(m / 1440)) + 'ڕ'; };
const cc = n => 'c' + (([...n].reduce((a, c) => a + c.charCodeAt(0), 0) % 5) + 1);
const av = (n, s = '', on) => `<span class="av ${cc(n)} ${s}">${esc([...n][0] || '؟')}${on ? '<i class="on-dot"></i>' : ''}</span>`;
const toast = t => { const e = $('#toast'); e.textContent = t; e.classList.add('on'); clearTimeout(toast.t); toast.t = setTimeout(() => e.classList.remove('on'), 1800); };
const loc = m => `${m.country}، ${m.city}`;
const myPosts = () => S.posts.filter(p => p.me);

/* ---------- components ---------- */
const post = p => {
  const poem = p.poetry, sh = p.text.length < 120 && !poem, lg = p.text.length > 200 && !poem, ex = X.has(p.id);
  const cm = C.has(p.id) ? `<div class="cm">${p.comments.map(c => `<div class="c">${av(c.a, 'sm')}<div class="t"><b>${esc(c.a)}</b>${esc(c.t)}</div></div>`).join('')}<form data-f="cm" data-id="${p.id}"><input class="field" name="t" placeholder="لێدوانێک بنووسە..." autocomplete="off"><button class="send" aria-label="ناردن">${I('send')}</button></form></div>` : '';
  return `<article class="post" data-id="${p.id}"><div class="ph">${av(p.author)}<div class="pm"><b>${esc(p.author)}</b><span>${ago(p.ts)}</span></div><button class="ib" data-a="more" data-id="${p.id}" aria-label="زیاتر">${I('more-horizontal')}</button></div>
<div class="pb ${poem ? 'poem' : sh ? 'short' : ''}${lg && !ex ? ' clamp' : ''}">${esc(p.text)}</div>${lg ? `<button class="more" data-a="exp" data-id="${p.id}">${ex ? 'کەمتر' : 'زیاتر ببینە...'}</button>` : ''}
<div class="sum"><span>${num(p.likes)} پەسەندکردن</span><span>${num(p.comments.length)} لێدوان</span></div>
<div class="acts"><button class="${p.liked ? 'on' : ''}" data-a="like" data-id="${p.id}">${I('thumbs-up')}پەسەندکردن</button><button data-a="cmt" data-id="${p.id}">${I('message-square')}لێدوان</button><button data-a="share" data-id="${p.id}">${I('share-2')}هاوبەشیکردن</button></div>${cm}</article><div class="gap"></div>`;
};
const postList = (arr, q = '') => { const l = arr.filter(p => !q || p.text.includes(q) || p.author.includes(q)); return l.length ? l.map(post).join('') : '<div class="empty">هیچ پۆستێک نەدۆزرایەوە.</div>'; };
const bookCard = (b, i) => `<button class="bk k${i % 5}" data-a="book" data-id="${b.id}"><div class="cv"><h3>${esc(b.title)}</h3><small>${esc(b.author)}</small></div><h4>${esc(b.title)}</h4><p>${esc(b.author)}</p><div class="pills">${b.pdf ? '<span class="pill">PDF</span>' : ''}<span class="pill">TXT</span></div></button>`;
const bookGrid = arr => arr.length ? `<div class="grid">${arr.map(bookCard).join('')}</div>` : '<div class="empty">هیچ پەڕتووکێک نییە.</div>';
const FIL = [['all', 'هەموو'], ['pdf', 'پەڕتووکی PDF'], ['txt', 'دەقی خاو (TXT)'], ['lang', 'زمان و فەرهەنگ'], ['poetry', 'دیوانی شیعر']];
const books = () => S.books.filter(b => (flt === 'all' || (flt === 'pdf' && b.pdf) || (flt === 'txt' && !b.pdf) || b.cat === flt) && (!bq || b.title.includes(bq) || b.author.includes(bq)));
const back = (v, t, extra = '') => `<header class="hd"><button class="ib" data-a="go" data-v="${v}" aria-label="گەڕانەوە">${I('arrow-right')}</button><h2>${t}</h2>${extra}</header>`;

/* ---------- views ---------- */
const views = {
  feed: () => `<header class="hd">${fq === null ? `<h1>مەکۆ</h1><button class="ib" data-a="search" aria-label="گەڕان">${I('search')}</button>` : `<label class="srch">${I('search')}<input id="fq" value="${esc(fq)}" placeholder="گەڕان لە پۆستەکان..." autofocus></label><button class="ib" data-a="search" aria-label="داخستن">${I('x')}</button>`}</header><div id="list">${postList(S.posts, fq || '')}</div>`,
  menu: () => `<header class="hd"><h1>مینیو</h1></header>
<button class="card" data-a="go" data-v="profile">${av(S.me.name, 'md')}<div><b>${esc(S.me.name)}</b><span>${esc(loc(S.me))}</span></div></button>
<div class="sc"><button data-a="go" data-v="library">${I('library')}کتێبخانە و ئەرشیف</button><button data-a="go" data-v="saved">${I('bookmark')}پاشەکەوتکراوەکان</button></div>
<div class="set"><div class="row"><span>گۆڕینی ڕووکار (تاریک / ڕووناک)</span><button class="tog ${S.dark ? 'on' : ''}" data-a="theme" role="switch" aria-checked="${S.dark}" aria-label="ڕووکاری تاریک"></button></div></div>`,
  profile: () => { const m = S.me, mine = myPosts(), bk = S.books.filter(b => b.mine || S.saved.books.includes(b.id));
    return `<div class="pt"><b>${esc(m.handle)}</b><button class="ib" data-a="go" data-v="menu" aria-label="مینیو">${I('menu')}</button></div>
<div class="pr">${av(m.name, 'lg')}<div class="st"><div><b>${num(mine.length)}</b><span>پۆست</span></div><div><b>${num(m.followers)}</b><span>شوێنکەوتووان</span></div><div><b>${num(m.following)}</b><span>شوێنکەوتوو</span></div></div></div>
<div class="bio"><b>${esc(m.name)}</b><p>${esc(m.bio)}</p><div class="loc">${I('map-pin')}${esc(loc(m))}</div></div>
<div class="btns"><button class="btn" data-a="edit">دەستکاریکردنی پڕۆفایل</button><button class="btn" data-a="shareP">هاوبەشیکردنی پڕۆفایل</button></div>
<div class="tabs"><button class="${ptab === 'posts' ? 'on' : ''}" data-a="ptab" data-v="posts">نووسراوەکان</button><button class="${ptab === 'books' ? 'on' : ''}" data-a="ptab" data-v="books">پەڕتووکەکان</button></div>
${ptab === 'posts' ? postList(mine) : bookGrid(bk)}`; },
  dm: () => `<header class="hd"><h1>نامەدان</h1><button class="ib" data-a="newdm" aria-label="نامەی نوێ">${I('square-pen')}</button></header>
<div style="padding:10px 16px"><label class="srch" style="height:42px">${I('search')}<input id="dq" value="${esc(dq)}" placeholder="گەڕان لە نامەکان..."></label></div><div id="list">${dmList()}</div>`,
  chat: () => { const c = S.contacts.find(x => x.id === chatId);
    return `<header class="hd"><button class="ib" data-a="go" data-v="dm" aria-label="گەڕانەوە">${I('arrow-right')}</button>${av(c.name, 'sm', c.online)}<h2>${esc(c.name)}</h2></header><div class="msgs" id="msgs">${c.msgs.map(m => `<div class="bub ${m.me ? 'me' : ''}">${esc(m.t)}</div>`).join('')}</div><form class="cb" data-f="dm"><input class="field" name="t" placeholder="نامەیەک بنووسە..." autocomplete="off"><button class="send" aria-label="ناردن">${I('send')}</button></form>`; },
  library: () => `<div style="position:sticky;top:0;z-index:20;background:var(--bg)">${back('menu', 'کتێبخانە و ئەرشیف')}<div style="display:flex;gap:8px;padding:10px 16px"><label class="srch">${I('search')}<input id="bq" value="${esc(bq)}" placeholder="گەڕان لە پەڕتووکەکان..."></label><button class="ib" style="background:var(--tx);color:var(--bg)" data-a="addbook" aria-label="زیادکردنی پەڕتووک">${I('plus')}</button></div><div class="fl">${FIL.map(f => `<button class="${flt === f[0] ? 'on' : ''}" data-a="flt" data-v="${f[0]}">${f[1]}</button>`).join('')}</div></div><div id="list">${bookGrid(books())}</div>`,
  saved: () => { const sp = S.posts.filter(p => S.saved.posts.includes(p.id)), sb = S.books.filter(b => S.saved.books.includes(b.id));
    return back('menu', 'پاشەکەوتکراوەکان') + (sp.length || sb.length ? sp.map(post).join('') + bookGrid(sb) : '<div class="empty">هێشتا هیچت پاشەکەوت نەکردووە. لە پۆستێک یان پەڕتووکێک دوگمەی پاشەکەوتکردن بگرە.</div>'); }
};
function dmList() {
  const l = S.contacts.filter(c => !dq || c.name.includes(dq));
  return l.length ? l.map(c => { const m = c.msgs[c.msgs.length - 1]; return `<button class="dm" data-a="chat" data-id="${c.id}">${av(c.name, 'md', c.online)}<div class="m"><b>${esc(c.name)}</b><span>${m.me ? 'تۆ: ' : ''}${esc(m.t)} · ${short(m.ts)}</span></div>${c.unread ? '<i class="ud"></i>' : ''}</button>`; }).join('') : '<div class="empty">هیچ گفتوگۆیەک نەدۆزرایەوە.</div>';
}

/* ---------- render ---------- */
function render() {
  const app = $('#app');
  app.className = cur === 'chat' ? 'chatting' : '';
  app.innerHTML = views[cur]();
  $('#nav').style.display = cur === 'chat' ? 'none' : '';
  const grp = { feed: 'feed', dm: 'dm', chat: 'dm' }[cur] || 'menu';
  ['feed', 'dm', 'menu'].forEach(g => $('#n-' + g).classList.toggle('on', g === grp));
  $('#n-av').className = 'av ' + cc(S.me.name); $('#n-av').textContent = [...S.me.name][0];
  $('#n-dot').style.display = S.contacts.some(c => c.unread) ? 'block' : 'none';
  document.documentElement.dataset.theme = S.dark ? 'dark' : 'light';
  icons();
  const m = $('#msgs'); if (m) m.scrollTop = m.scrollHeight;
}
const go = v => { cur = v; render(); scrollTo(0, 0); };
const rp = id => { const p = S.posts.find(x => x.id === id), el = $(`.post[data-id="${id}"]`); if (el && p) { el.outerHTML = post(p); icons(); } };
const refill = (sel, html) => { $(sel).innerHTML = html; icons(); };

/* ---------- modals ---------- */
function modal(html, full) {
  const m = document.createElement('div'); m.className = 'mask';
  m.innerHTML = `<div class="sheet${full ? ' full' : ''}" role="dialog"><div class="grab"></div>${html}</div>`;
  m.addEventListener('click', e => { if (e.target === m) m.remove(); });
  document.body.appendChild(m); icons(); return m;
}
const mh = t => `<div class="sh"><h3>${t}</h3><button class="ib" data-a="close" aria-label="داخستن">${I('x')}</button></div>`;
const opts = (l, s) => l.map(x => `<option ${x === s ? 'selected' : ''}>${esc(x)}</option>`).join('');
const newPost = () => { modal(`${mh('پۆستی نوێ')}<textarea class="in" id="np" placeholder="چی لە دڵتدایە؟" autofocus></textarea><button class="chip" id="poem" data-a="poem">${I('feather')}شیعر</button><div class="col"><button class="btn p" style="height:46px;font-size:16px" data-a="publish">بڵاوکردنەوە</button></div>`); };
const editProfile = () => { const m = S.me; modal(`${mh('دەستکاریکردنی پڕۆفایل')}<label class="lbl">ناو</label><input class="in" id="ep-n" value="${esc(m.name)}"><label class="lbl">ژیاننامە</label><textarea class="in" id="ep-b" style="min-height:90px">${esc(m.bio)}</textarea><label class="lbl">وڵات</label><select class="in" id="ep-c">${opts(['کوردستان', ...Object.keys(WORLD)], m.country)}</select><label class="lbl">شار</label><select class="in" id="ep-ci">${opts(citiesOf(m.country), m.city)}</select><div class="col"><button class="btn p" style="height:46px" data-a="saveP">پاشەکەوتکردن</button></div>`); };
const bookDetail = id => { const b = S.books.find(x => x.id === id), sv = S.saved.books.includes(id);
  modal(`${mh('')}<h3 style="font-family:Amiri,serif;font-size:26px;line-height:1.6">${esc(b.title)}</h3><p style="color:var(--mut)">${esc(b.author)}</p><div class="pills">${b.pdf ? '<span class="pill">PDF</span>' : ''}<span class="pill">TXT</span></div><p style="margin-top:14px">${esc(b.desc)}</p><div class="col"><button class="btn p" style="height:46px" data-a="readtxt" data-id="${id}">خوێندنەوەی دەقی خاو (TXT)</button><button class="btn" style="height:46px" data-a="openpdf" data-id="${id}">کردنەوەی پەڕتووکی PDF</button><button class="btn" style="height:46px" data-a="bsave" data-id="${id}">${sv ? 'لابردن لە پاشەکەوتکراوەکان' : 'پاشەکەوتکردن'}</button></div>`); };
const reader = id => { const b = S.books.find(x => x.id === id), w = b.text.trim().split(/\s+/).filter(Boolean).length;
  modal(`${mh(esc(b.title))}<div class="meta"><span>${num(w)} وشە</span><span>${num(b.text.length)} پیت</span></div><div class="btns" style="padding:12px 0 0"><button class="btn" data-a="copytxt" data-id="${id}">کۆپیکردنی دەق</button><button class="btn p" data-a="dltxt" data-id="${id}">داگرتنی فایلی .TXT</button></div><div class="rd" dir="rtl">${esc(b.text)}</div>`, true); };
const addBook = () => { modal(`${mh('زیادکردنی پەڕتووک / دەقی خاو')}<label class="lbl">ناونیشان</label><input class="in" id="ab-t"><label class="lbl">نووسەر</label><input class="in" id="ab-a"><label class="lbl">پۆل</label><select class="in" id="ab-c"><option value="lang">زمان و فەرهەنگ</option><option value="poetry">دیوانی شیعر</option></select><label class="lbl">دەقی خاو یان فایلی TXT</label><textarea class="in" id="ab-x" placeholder="دەق لێرە دابنێ..."></textarea><input type="file" id="ab-f" accept=".txt,text/plain" style="margin-top:8px"><div class="col"><button class="btn p" style="height:46px" data-a="saveBook">زیادکردن</button></div>`); };
const download = (name, text) => { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([text], { type: 'text/plain;charset=utf-8' })); a.download = name.replace(/[\\/:*?"<>|]/g, '') + '.txt'; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 1000); };
const copy = t => (navigator.clipboard ? navigator.clipboard.writeText(t) : Promise.reject()).catch(() => { const x = document.createElement('textarea'); x.value = t; document.body.appendChild(x); x.select(); document.execCommand('copy'); x.remove(); });

/* ---------- events ---------- */
const A = {
  go: d => { if (d.v === 'profile') ptab = 'posts'; go(d.v); },
  new: () => newPost(), close: (d, el) => el.closest('.mask').remove(),
  like: d => { const p = S.posts.find(x => x.id === +d.id); p.liked = !p.liked; p.likes += p.liked ? 1 : -1; save(); rp(p.id); },
  cmt: d => { const id = +d.id; C.has(id) ? C.delete(id) : C.add(id); rp(id); },
  exp: d => { const id = +d.id; X.has(id) ? X.delete(id) : X.add(id); rp(id); },
  more: d => { const id = +d.id, l = S.saved.posts, i = l.indexOf(id); i < 0 ? l.push(id) : l.splice(i, 1); save(); toast(i < 0 ? 'پۆستەکە پاشەکەوت کرا' : 'لە پاشەکەوتکراوەکان لابرا'); },
  share: d => { copy(location.href.split('#')[0] + '#post-' + d.id).then(() => toast('بەستەرەکە کۆپی کرا')); },
  search: () => { fq = fq === null ? '' : null; render(); const e = $('#fq'); if (e) e.focus(); },
  theme: () => { S.dark = !S.dark; save(); render(); },
  edit: () => editProfile(),
  shareP: () => copy(location.href.split('#')[0] + '#' + S.me.handle).then(() => toast('بەستەری پڕۆفایل کۆپی کرا')),
  ptab: d => { ptab = d.v; render(); },
  flt: d => { flt = d.v; render(); },
  book: d => bookDetail(+d.id),
  bsave: (d, el) => { const id = +d.id, l = S.saved.books, i = l.indexOf(id); i < 0 ? l.push(id) : l.splice(i, 1); save(); el.textContent = i < 0 ? 'لابردن لە پاشەکەوتکراوەکان' : 'پاشەکەوتکردن'; toast(i < 0 ? 'پاشەکەوت کرا' : 'لابرا'); },
  readtxt: (d, el) => { el.closest('.mask').remove(); reader(+d.id); },
  openpdf: d => toast('پەڕتووکی PDF دەکرێتەوە...'),
  copytxt: d => copy(S.books.find(b => b.id === +d.id).text).then(() => toast('دەقەکە کۆپی کرا')),
  dltxt: d => { const b = S.books.find(x => x.id === +d.id); download(b.title, b.text); toast('فایلی TXT داگیرا'); },
  addbook: () => addBook(),
  newdm: () => modal(`${mh('نامەی نوێ')}${S.contacts.map(c => `<button class="dm" style="padding-inline:0" data-a="pick" data-id="${c.id}">${av(c.name, 'md', c.online)}<div class="m"><b>${esc(c.name)}</b></div></button>`).join('')}`),
  pick: (d, el) => { el.closest('.mask').remove(); A.chat(d); },
  chat: d => { chatId = +d.id; S.contacts.find(c => c.id === chatId).unread = false; save(); go('chat'); },
  poem: (d, el) => el.classList.toggle('on'),
  publish: (d, el) => { const t = $('#np').value.trim(); if (!t) return toast('سەرەتا شتێک بنووسە'); S.posts.unshift({ id: Date.now(), author: S.me.name, me: true, text: t, poetry: $('#poem').classList.contains('on'), ts: Date.now(), likes: 0, liked: false, comments: [] }); save(); el.closest('.mask').remove(); go('feed'); toast('بڵاوکرایەوە'); },
  saveP: (d, el) => { const n = $('#ep-n').value.trim(); if (!n) return toast('ناو بەتاڵە'); Object.assign(S.me, { name: n, bio: $('#ep-b').value.trim(), country: $('#ep-c').value, city: $('#ep-ci').value }); S.posts.forEach(p => { if (p.me) p.author = n; }); save(); el.closest('.mask').remove(); render(); toast('پاشەکەوت کرا'); },
  saveBook: (d, el) => { const t = $('#ab-t').value.trim(), x = $('#ab-x').value.trim(); if (!t || !x) return toast('ناونیشان و دەق پێویستن'); S.books.unshift({ id: Date.now(), title: t, author: $('#ab-a').value.trim() || 'نەزانراو', pdf: false, cat: $('#ab-c').value, mine: true, desc: 'دەقی خاوی زیادکراو بە یونیکۆدی پاک.', text: x }); save(); el.closest('.mask').remove(); if (cur === 'library') render(); toast('پەڕتووکەکە زیادکرا'); }
};
document.addEventListener('click', e => { const el = e.target.closest('[data-a]'); if (el && A[el.dataset.a]) A[el.dataset.a](el.dataset, el); });
document.addEventListener('submit', e => {
  const f = e.target.closest('[data-f]'); if (!f) return; e.preventDefault();
  const v = f.elements.t.value.trim(); if (!v) return;
  if (f.dataset.f === 'cm') { const p = S.posts.find(x => x.id === +f.dataset.id); p.comments.push({ a: S.me.name, t: v }); save(); rp(p.id); const i = $(`.post[data-id="${p.id}"] input`); if (i) i.focus(); }
  else { const c = S.contacts.find(x => x.id === chatId); c.msgs.push({ me: true, t: v, ts: Date.now() }); save(); render(); $('.cb input').focus(); }
});
document.addEventListener('input', e => {
  const i = e.target.id;
  if (i === 'fq') { fq = e.target.value; refill('#list', postList(S.posts, fq)); }
  if (i === 'dq') { dq = e.target.value; refill('#list', dmList()); }
  if (i === 'bq') { bq = e.target.value; refill('#list', bookGrid(books())); }
});
document.addEventListener('change', e => {
  if (e.target.id === 'ep-c') $('#ep-ci').innerHTML = opts(citiesOf(e.target.value));
  if (e.target.id === 'ab-f' && e.target.files[0]) { const f = e.target.files[0]; UnicodeEngine.readTxt(f).then(t => { $('#ab-x').value = t; if (!$('#ab-t').value) $('#ab-t').value = UnicodeEngine.clean(f.name.replace(/\.txt$/i, '')); }); }
});
document.addEventListener('click', e => { const el = e.target.closest('#nav [data-a]'); if (el && el.dataset.a === 'go' && el.dataset.v === 'feed') { fq = null; } }, true);

render();
})();
