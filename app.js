/* Meko — application logic (state in localStorage, SPA routing) */
(() => {
'use strict';
const U = window.UnicodeEngine;
const KEY = 'meko.state.v1';
const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const kn = n => String(n).replace(/\d/g, d => '٠١٢٣٤٥٦٧٨٩'[d]);
const ic = (n, c = '') => `<i data-lucide="${n}" class="${c}"></i>`;
const icons = () => window.lucide && lucide.createIcons({ attrs: { 'stroke-width': 1.5 } });
const now = () => Date.now(), H = 3600e3;

const DIAL = ['سۆرانی', 'کرمانجی', 'کەڵهوڕی', 'هەورامی', 'زازاکی'];
const TAGS = ['زمانەوانی', 'ڕێزمان', 'وشەسازی', 'شیعر', 'ئەدەبیات', 'مێژوو'];
const CATS = { all: 'هەموو', pdf: 'پەڕتووکی PDF', txt: 'دەقی خاو (TXT)', ling: 'زمان و فەرهەنگ', poetry: 'دیوانی شیعر' };
const TABS = { feed: 'گۆڕەپان', library: 'کتێبخانە و ئەرشیف', dm: 'نامەدان', profile: 'پڕۆفایل' };
const REPLIES = ['زۆر سوپاس، لە نزیکەوە سەیری دەکەم.', 'بیرۆکەیەکی بەنرخە؛ با لە مەکۆ بەشی بکەین.', 'ئەم دەقە بۆ ئەرشیف گونجاوە، بە یونیکۆدی پاک دەیخەینە کتێبخانە.', 'دەستخۆش، سبەینێ زیاتر قسەی لەسەر دەکەین.'];

/* ---------- seed data ---------- */
const seed = () => ({
  theme: 'dark', tab: 'feed', active: 'c1', filter: { d: null, t: null }, lib: { cat: 'all', q: '' }, prof: 'posts',
  me: { name: 'ئاراس ڕەحمان', handle: 'aras', region: 'سلێمانی', pen: 'توێژەری زمان و ئەدەبی کوردی',
    bio: 'لە سلێمانی دەژیم و لەسەر ڕێنووس، وشەسازی و پاراستنی دەقی کوردی بە یونیکۆد کار دەکەم. کۆکردنەوەی دەقی کۆن و گۆڕینیان بۆ UTF-8 ـی پاک کارە سەرەکییەکەمە.',
    lv: { 'سۆرانی': 5, 'کرمانجی': 3, 'کەڵهوڕی': 4, 'هەورامی': 2, 'زازاکی': 1 } },
  posts: [
    { id: 1, au: 'د. شیلان ئەمین', h: 'shilan', reg: 'هەولێر', d: 'سۆرانی', tag: 'زمانەوانی', ts: now() - 2 * H, likes: 42, dislikes: 1, me: {},
      text: 'جیاوازیی «ه» و «ە» لە ڕێنووسی کوردیدا جیاوازیی شێوە نییە، جیاوازیی دەنگە: «ە» بزوێنە و «ه» دەنگی بێ‌دەنگی هەناسەیە. تێکەڵکردنی ئەم دوو پیتە لە دەقی دیجیتاڵیدا گەڕان و ئەرشیف دەشکێنێت.',
      comments: [{ n: 'کاوە بەرلین', t: 'ڕاستە؛ لە ئەرشیفی کۆندا ژمارەیەکی زۆر وشە بەهۆی ئەم هەڵەیەوە دووبارە نووسراونەتەوە.' }] },
    { id: 2, au: 'ئاڤین دهۆکی', h: 'avin', reg: 'دهۆک', d: 'کرمانجی', tag: 'ڕێزمان', ts: now() - 5 * H, likes: 27, dislikes: 0, me: {},
      text: 'د کرمانجیێ دا ل دەمێ بۆری، کریار د گەل ئەگەرێ دهێتە ڕێزکرن؛ ئەڤە جیاوازییەکا گرنگە دناڤبەرا کرمانجی و سۆرانی دا.',
      comments: [] },
    { id: 3, au: 'کامەران سالار', h: 'kamaran', reg: 'سلێمانی', d: 'سۆرانی', tag: 'شیعر', ts: now() - 9 * H, likes: 63, dislikes: 2, me: {},
      text: 'ئەی نەسیمی بەربەیان بۆنی بەهاری بۆ بێنە | سڵاوی ئاشقی بێکەس بگەیەنە بۆ دڵداری\nدڵ لە نیگای تۆ ڕۆشنە وەک مانگی چواردە | شەوی تاریکی دووری بووە ڕۆژی بەهاران',
      comments: [{ n: 'نارین سلێمانی', t: 'ئاوازی ڕێبازی بابانی تێدا دیارە.' }] },
    { id: 4, au: 'ئاراس ڕەحمان', h: 'aras', reg: 'سلێمانی', d: 'کەڵهوڕی', tag: 'مێژوو', ts: now() - 26 * H, likes: 18, dislikes: 0, me: {}, mine: 1,
      text: 'کەڵهوڕەکان لە ناوچەکانی کرماشان و ئیلام و پشتکۆیان دەژین و زاراوەکەیان وشەی کۆنی زۆری پارێزراوە؛ کۆکردنەوەی گۆرانی و ئاخاوتنی ئەم ناوچانە بەشێکە لە پاراستنی میراتی نەتەوەیی.',
      comments: [] }
  ],
  books: [
    { id: 'b1', title: 'ڕێنووسی کوردی: ڕێنمایی یونیکۆد', author: 'ئەرشیفی مەکۆ', d: 'سۆرانی', cat: 'ling', pdf: 'renusi-unicode.pdf',
      txt: 'ڕێنووسی کوردی: ڕێنمایی یونیکۆد\n\n١. پیتەکانی «ک» و «ی» دەبێت لە شێوەی کوردییان بنووسرێن، نەک عەرەبی (ك، ي).\n٢. «ە» بزوێنەیە و «ه» دەنگی هەناسەیە؛ تێکەڵیان مەکە.\n٣. «ڕ» و «ڵ» پیتی سەربەخۆن و ناگۆڕدرێن بە «ر» و «ل».\n٤. بۆ دەقی درێژ هەمیشە UTF-8 بەکاربهێنە.' },
    { id: 'b2', title: 'دیوانی شیعر — هەڵبژاردەی ڕێبازی بابان', author: 'کۆکراوەی مەکۆ', d: 'سۆرانی', cat: 'poetry', pdf: '',
      txt: 'دیوانی هەڵبژاردە\n\nبەهار هات و گوڵ پشکووت و دڵ ئاوێتەی هیوایە\nچرا هەڵکرا لە شەودا و ڕێگا ڕووناکە و وایە\n\nلە کێوان خۆر هەڵدێت و ئاو دەگاتە دەشتی ئارام\nژیان دووبارە دەست پێ دەکات، بەم شێوەیە هەر ئەنجام' },
    { id: 'b3', title: 'ڕێزمانی کرمانجی بۆ فێرخوازان', author: 'ئاڤین دهۆکی', d: 'کرمانجی', cat: 'ling', pdf: 'grammar-kurmanji.pdf', txt: '' },
    { id: 'b4', title: 'فەرهەنگۆکی وشەی کەڵهوڕی', author: 'ئەرشیفی مەکۆ', d: 'کەڵهوڕی', cat: 'ling', pdf: '',
      txt: 'فەرهەنگۆکی وشەی کەڵهوڕی\n\nئاو: ئاو؛ ئاوی ڕووبار و کانی\nنان: نان؛ خۆراکی سەرەکی\nکێو: چیا؛ شاخ\nدڵ: دڵ؛ ناوەندی هەست' },
    { id: 'b5', title: 'وشەنامەی هەورامی–سۆرانی', author: 'دەستەی مەکۆ', d: 'هەورامی', cat: 'ling', pdf: 'hawrami-sorani.pdf',
      txt: 'وشەنامەی هەورامی–سۆرانی\n\nنموونەی تۆمار: وشەی هەورامی ← واتای سۆرانی ← نموونەی بەکارهێنان.\nئەم فایلە بۆ زیادکردنی تۆمارەکان بە UTF-8 ئامادەکراوە.' },
    { id: 'b6', title: 'چیرۆکە فۆلکلۆرییەکان', author: 'ئاراس ڕەحمان', d: 'سۆرانی', cat: 'other', pdf: '', mine: 1,
      txt: 'چیرۆکە فۆلکلۆرییەکان\n\nلە کۆنەوە دەگێڕنەوە کە لە گوندێکی چیاکاندا کانییەک هەبوو...\n(نموونەی دەقی خاو بۆ تاقیکردنەوەی خوێنەری TXT)' }
  ],
  chats: [
    { id: 'c1', n: 'شنۆ ئەحمەد', reg: 'کەرکووک', on: 1, m: [{ me: 0, t: 'سڵاو، دەقی نوێی ڕێزمانەکەم نارد بۆ ئەرشیف.', ts: now() - 3 * H }] },
    { id: 'c2', n: 'دیار ئامەدی', reg: 'ئامەد', on: 1, m: [{ me: 0, t: 'ڕێنووسی کرمانجی بە ئەلفبێی عەرەبی دەمەوێت بەراورد بکەم.', ts: now() - 6 * H }] },
    { id: 'c3', n: 'ڕێبوار مەهابادی', reg: 'مەهاباد', on: 0, m: [{ me: 1, t: 'گۆرانییە کۆنەکانی ناوچەکەتان تۆمار کراون؟', ts: now() - 30 * H }] },
    { id: 'c4', n: 'ڤیان قامیشلۆ', reg: 'قامیشلۆ', on: 1, m: [] },
    { id: 'c5', n: 'نارین سلێمانی', reg: 'سلێمانی', on: 0, m: [{ me: 0, t: 'دیوانەکە بە یونیکۆد ئامادە بوو.', ts: now() - 50 * H }] },
    { id: 'c6', n: 'کاوە بەرلین', reg: 'بەرلین', on: 1, m: [{ me: 0, t: 'لە دیاسپۆرا منداڵان کوردی فێر دەکەین، یارمەتی پێویستە.', ts: now() - 8 * H }] }
  ]
});

/* ---------- state ---------- */
let S = (() => { try { const r = JSON.parse(localStorage.getItem(KEY)); if (r && r.posts && r.books) return r; } catch (e) {} return seed(); })();
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} };
const OPEN = new Set(), TYPING = {};
let mob = 'list', curBook = null, shareId = null;

/* ---------- helpers ---------- */
const av = (n, c = '') => `<span class="avatar ${c}">${esc([...String(n).replace(/^د\.\s*/, '')][0] || '؟')}</span>`;
const words = t => t.trim().split(/\s+/).filter(Boolean).length;
const clock = ts => { const d = new Date(ts); return kn(String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0')); };
function ago(ts) { const m = Math.max(1, Math.round((now() - ts) / 6e4)); if (m < 60) return kn(m) + ' خولەک لەمەوپێش'; const h = Math.round(m / 60); return h < 24 ? kn(h) + ' کاتژمێر لەمەوپێش' : kn(Math.round(h / 24)) + ' ڕۆژ لەمەوپێش'; }
function toast(m) { const t = document.createElement('div'); t.className = 'toast'; t.textContent = m; $('#toasts').appendChild(t); setTimeout(() => t.classList.add('out'), 2300); setTimeout(() => t.remove(), 2700); }
const fit = t => { t.style.height = 'auto'; t.style.height = Math.min(t.scrollHeight, 320) + 'px'; };
const modal = (id, on) => { $('#' + id).classList.toggle('hidden', !on); document.body.classList.toggle('noscroll', !!$$('.modal:not(.hidden)').length); };
async function copy(t) { try { await navigator.clipboard.writeText(t); } catch (e) { const x = document.createElement('textarea'); x.value = t; document.body.appendChild(x); x.select(); document.execCommand('copy'); x.remove(); } }
function download(name, text) {
  const a = document.createElement('a'), url = URL.createObjectURL(new Blob([text], { type: 'text/plain;charset=utf-8' }));
  a.href = url; a.download = name.replace(/[\\/:*?"<>|]+/g, '-') + '.txt'; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/* ---------- timeline ---------- */
function postHTML(p) {
  const poem = p.tag === 'شیعر', open = OPEN.has(p.id), m = p.me || {};
  const body = poem
    ? `<div class="poem">${p.text.split('\n').filter(l => l.trim()).map(l => { const h = l.split('|'); return h.length > 1 ? `<div class="beyt"><span>${esc(h[0].trim())}</span><i class="orn"></i><span>${esc(h[1].trim())}</span></div>` : `<div class="beyt one">${esc(l.trim())}</div>`; }).join('')}</div>`
    : `<p class="prose">${esc(p.text).replace(/\n/g, '<br>')}</p>`;
  const act = (a, i, n, on, l) => `<button class="act ${on ? 'on' : ''}" data-act="${a}" data-id="${p.id}" aria-label="${l}">${ic(i)}${n != null ? `<span>${kn(n)}</span>` : ''}</button>`;
  return `<article class="card post" id="post-${p.id}">
    <header class="flex items-center gap-3">${av(p.au)}
      <div class="min-w-0 flex-1"><div class="flex items-center gap-2"><b class="truncate">${esc(p.au)}</b><span class="text-xs text-mute">@${esc(p.h)}</span></div>
      <div class="text-xs text-mute">${esc(p.reg)} · ${ago(p.ts)}</div></div>
      <span class="badge bronze">${esc(p.d)}</span></header>
    <div class="mt-4">${body}</div>
    <div class="mt-3 flex items-center gap-3"><span class="tag">#${esc(p.tag)}</span><span class="badge ok">${ic('shield-check')}UTF-8</span></div>
    <footer class="actbar">${act('like', 'thumbs-up', p.likes, m.like, 'ڵایک')}${act('dislike', 'thumbs-down', p.dislikes, m.dislike, 'دیسڵایک')}${act('comment', 'message-square', p.comments.length, open, 'کۆمێنت')}${act('share', 'share-2', null, false, 'شەیرکردن')}</footer>
    ${open ? `<div class="comments">${p.comments.map(c => `<div class="cm">${av(c.n, 'sm')}<div><b class="text-sm">${esc(c.n)}</b><p class="text-sm">${esc(c.t)}</p></div></div>`).join('')}
      <div data-uni-wrap><textarea class="field" rows="1" data-uni placeholder="کۆمێنتێک بنووسە..."></textarea>
      <div class="mt-2 flex items-center justify-between">${U.badge()}<button class="btn sm" data-act="sendcomment" data-id="${p.id}">ناردن</button></div></div></div>` : ''}
  </article>`;
}
function renderFeed() {
  const f = S.filter, L = S.posts.filter(p => (!f.d || p.d === f.d) && (!f.t || p.tag === f.t));
  const bar = f.d || f.t ? `<div class="filterbar"><span>فلتەر: ${esc(f.d || '')} ${f.t ? '#' + esc(f.t) : ''}</span><button data-act="clearf">لابردنی فلتەر</button></div>` : '';
  $('#feed').innerHTML = bar + (L.map(postHTML).join('') || '<p class="empty">هیچ نووسراوەیەک بەم فلتەرە نەدۆزرایەوە.</p>');
  icons();
}
function repost(id) {
  const p = S.posts.find(x => x.id == id), el = $('#post-' + id);
  if (!el) return renderFeed();
  const d = $('textarea[data-uni]', el); const v = d ? d.value : '';
  el.outerHTML = postHTML(p);
  const t = $('#post-' + id + ' textarea[data-uni]'); if (t && v) t.value = v;
  icons();
}
function react(id, k) {
  const p = S.posts.find(x => x.id == id), o = k === 'like' ? 'dislike' : 'like'; p.me = p.me || {};
  if (p.me[k]) { p.me[k] = 0; p[k + 's']--; } else { p.me[k] = 1; p[k + 's']++; if (p.me[o]) { p.me[o] = 0; p[o + 's']--; } }
  save(); repost(id);
}
function publish() {
  const ta = $('#c-text'), t = U.clean(ta.value).trim();
  if (!t) return toast('تکایە سەرەتا دەقێک بنووسە');
  S.posts.unshift({ id: now(), au: S.me.name, h: S.me.handle, reg: S.me.region, d: $('#c-dialect').value, tag: $('#c-tag').value, ts: now(), text: t, likes: 0, dislikes: 0, me: {}, comments: [], mine: 1 });
  ta.value = ''; fit(ta); save(); renderFeed(); renderSide(); renderProfile(); toast('نووسراوەکە بڵاوکرایەوە');
}
function sendComment(id) {
  const ta = $('#post-' + id + ' textarea[data-uni]'), t = U.clean(ta.value).trim();
  if (!t) return toast('کۆمێنتەکە بەتاڵە');
  S.posts.find(x => x.id == id).comments.push({ n: S.me.name, t }); save(); repost(id); toast('کۆمێنتەکە زیادکرا');
}
function openShare(id) {
  shareId = id;
  $('#share-body').innerHTML = `<button class="btn ghost w-full" data-act="copylink">${ic('link')}کۆپیکردنی بەستەری نووسراوە</button>
    <h4 class="sh mt-5">ناردن بۆ نامەدان</h4><div class="grid gap-1">${S.chats.map(c => `<button class="conv" data-act="shareto" data-id="${c.id}">${av(c.n)}<span class="meta"><b>${esc(c.n)}</b><small>${esc(c.reg)}</small></span></button>`).join('')}</div>`;
  modal('m-share', 1); icons();
}
const postLink = () => location.href.split('#')[0] + '#post-' + shareId;

/* ---------- discovery panel ---------- */
function renderSide() {
  const cnt = d => S.posts.filter(p => p.d === d).length, tc = t => S.posts.filter(p => p.tag === t).length;
  const wc = S.books.reduce((a, b) => a + words(b.txt || ''), 0);
  $('#side').innerHTML = `<section><h3 class="sh">فلتەری زاراوە</h3><div class="flex flex-wrap gap-2">${DIAL.map(d => `<button class="chip ${S.filter.d === d ? 'on' : ''}" data-act="fd" data-v="${d}">${d}<small>${kn(cnt(d))}</small></button>`).join('')}</div></section>
    <section><h3 class="sh">بابەتە ئەدەبییە چالاکەکان</h3><div class="flex flex-wrap gap-2">${TAGS.map(t => `<button class="chip ${S.filter.t === t ? 'on' : ''}" data-act="ft" data-v="${t}">#${t}<small>${kn(tc(t))}</small></button>`).join('')}</div></section>
    <section><h3 class="sh">ئامارەکانی کتێبخانە</h3><dl class="grid gap-2 text-sm">
      <div class="flex justify-between border-b border-line pb-2"><dt class="text-mute">کۆی پەڕتووکەکان</dt><dd>${kn(S.books.length)}</dd></div>
      <div class="flex justify-between border-b border-line pb-2"><dt class="text-mute">دەقی خاو (TXT)</dt><dd>${kn(S.books.filter(b => b.txt).length)}</dd></div>
      <div class="flex justify-between border-b border-line pb-2"><dt class="text-mute">پەڕتووکی PDF</dt><dd>${kn(S.books.filter(b => b.pdf).length)}</dd></div>
      <div class="flex justify-between"><dt class="text-mute">کۆی وشەکانی ئەرشیف</dt><dd>${kn(wc)}</dd></div></dl></section>`;
  icons();
}

/* ---------- library ---------- */
function libFilter() {
  const { cat, q } = S.lib, s = q.trim();
  return S.books.filter(b => (cat === 'all' || (cat === 'pdf' ? b.pdf : cat === 'txt' ? b.txt : b.cat === cat)) && (!s || (b.title + ' ' + b.author + ' ' + b.d).includes(s)));
}
function bookHTML(b) {
  return `<article class="card book"><div class="flex items-start justify-between gap-3"><div><h3 class="font-lit text-xl leading-9">${esc(b.title)}</h3><p class="text-sm text-mute">${esc(b.author)}</p></div><span class="badge bronze">${esc(b.d)}</span></div>
    <div class="mt-3 flex gap-2">${b.pdf ? '<span class="fmt">PDF</span>' : ''}${b.txt ? '<span class="fmt">TXT (UTF-8)</span>' : ''}</div>
    <div class="mt-4 flex flex-wrap gap-2">${b.txt ? `<button class="btn sm" data-act="readtxt" data-id="${b.id}">${ic('file-text')}خوێندنەوەی دەقی خاو (TXT)</button><button class="btn ghost sm" data-act="dltxt" data-id="${b.id}">${ic('download')}.TXT</button>` : ''}${b.pdf ? `<button class="btn ghost sm" data-act="pdf" data-id="${b.id}">${ic('book-open')}PDF</button>` : ''}</div></article>`;
}
function renderLibList() { $('#lib-list').innerHTML = libFilter().map(bookHTML).join('') || '<p class="empty sm:col-span-2">هیچ پەڕتووکێک نەدۆزرایەوە. بە دوگمەی «زیادکردن» دەتوانیت یەکەمیان بخەیتە ئەرشیف.</p>'; icons(); }
function renderLib() {
  $('#lib-tabs').innerHTML = Object.entries(CATS).map(([k, v]) => `<button class="tabbtn ${S.lib.cat === k ? 'on' : ''}" data-act="libcat" data-v="${k}">${v}</button>`).join('');
  renderLibList();
}
function openTxt(id) {
  const b = S.books.find(x => x.id == id); curBook = b;
  $('#txt-title').textContent = b.title;
  $('#txt-stats').textContent = `${kn(words(b.txt))} وشە · ${kn([...b.txt].length)} پیت · ${kn(b.txt.split('\n').length)} دێڕ · UTF-8`;
  $('#txt-body').innerHTML = b.txt.split('\n').map(l => `<li>${esc(l)}</li>`).join('');
  modal('m-txt', 1); $('#txt-body').scrollTop = 0;
}
function saveBook() {
  const g = i => $('#' + i), title = U.clean(g('ab-title').value).trim(), author = U.clean(g('ab-author').value).trim(), txt = U.clean(g('ab-txt').value).trim(), pdf = g('ab-pdf').value.trim();
  if (!title) return toast('ناونیشانی پەڕتووک پێویستە');
  if (!txt && !pdf) return toast('دەقی خاو یان زانیاری PDF زیاد بکە');
  S.books.unshift({ id: 'b' + now(), title, author: author || S.me.name, d: g('ab-dialect').value, cat: g('ab-cat').value, pdf, txt, mine: 1 });
  ['ab-title', 'ab-author', 'ab-pdf', 'ab-txt'].forEach(i => g(i).value = '');
  save(); modal('m-add', 0); S.lib.cat = 'all'; renderLib(); renderSide(); renderProfile(); toast('پەڕتووکەکە بە یونیکۆدی پاک خرایە ئەرشیف');
}

/* ---------- direct messages ---------- */
const chat = () => S.chats.find(c => c.id === S.active);
function renderDM() {
  $('#dm-wrap').dataset.m = mob;
  $('#dm-list').innerHTML = S.chats.map(c => { const l = c.m[c.m.length - 1];
    return `<button class="conv ${c.id === S.active ? 'on' : ''}" data-act="chat" data-id="${c.id}"><span class="avwrap">${av(c.n)}<i class="dot ${c.on ? 'live' : ''}"></i></span>
      <span class="meta"><b>${esc(c.n)}<span class="badge">${esc(c.reg)}</span></b><small>${l ? esc(l.t) : 'گفتوگۆیەکی نوێ دەستپێبکە'}</small></span></button>`; }).join('');
  icons();
}
function renderChat() {
  const c = chat(); if (!c) return;
  $('#dm-head').innerHTML = `<button class="iconbtn md:hidden" data-act="back" aria-label="گەڕانەوە">${ic('chevron-right')}</button>${av(c.n)}<div><b>${esc(c.n)}</b><div class="text-xs text-mute">${c.on ? 'ئۆنلاین' : 'ئۆفلاین'} · ${esc(c.reg)}</div></div>`;
  $('#dm-msgs').innerHTML = (c.m.map(m => `<div class="bub ${m.me ? 'me' : ''}"><p>${esc(m.t).replace(/\n/g, '<br>')}</p><time>${clock(m.ts)}</time></div>`).join('') || '<p class="empty">هێشتا نامەیەک نییە.</p>') + (TYPING[c.id] ? '<div class="bub typing"><span></span><span></span><span></span></div>' : '');
  const b = $('#dm-msgs'); b.scrollTop = b.scrollHeight; icons();
}
function sendMsg() {
  const i = $('#dm-in'), t = U.clean(i.value).trim(), c = chat(); if (!t) return;
  c.m.push({ me: 1, t, ts: now() }); i.value = ''; fit(i); save(); renderChat(); renderDM();
  if (!c.on) return;
  TYPING[c.id] = 1; renderChat();
  setTimeout(() => { delete TYPING[c.id]; c.m.push({ me: 0, t: REPLIES[Math.floor(Math.random() * REPLIES.length)], ts: now() }); save(); if (S.tab === 'dm') { if (S.active === c.id) renderChat(); renderDM(); } }, 1400 + Math.random() * 1200);
}

/* ---------- profile ---------- */
function renderProfile() {
  const m = S.me, mp = S.posts.filter(p => p.mine), mb = S.books.filter(b => b.mine);
  $('#prof').innerHTML = `<div class="border-b border-line p-6"><div class="flex items-center gap-4">${av(m.name, 'xl')}<div><h2 class="text-xl font-semibold">${esc(m.name)}</h2><p class="font-lit text-xl text-mute">${esc(m.pen)}</p><p class="text-xs text-mute">@${esc(m.handle)} · ${esc(m.region)}</p></div></div>
    <p class="mt-4 leading-8">${esc(m.bio)}</p>
    <div class="mt-4 flex flex-wrap gap-2">${DIAL.map(d => `<span class="badge bronze lv">${d}<span class="dots">${[0, 1, 2, 3, 4].map(i => `<s class="${i < (m.lv[d] || 0) ? 'f' : ''}"></s>`).join('')}</span></span>`).join('')}</div></div>
    <div class="tabs px-4"><button class="tabbtn ${S.prof === 'posts' ? 'on' : ''}" data-act="ptab" data-v="posts">نووسراوەکان (${kn(mp.length)})</button><button class="tabbtn ${S.prof === 'works' ? 'on' : ''}" data-act="ptab" data-v="works">بەرهەمەکانی کتێبخانە PDF / TXT (${kn(mb.length)})</button></div>
    <div class="grid gap-4 p-4">${S.prof === 'posts' ? (mp.map(postHTML).join('') || '<p class="empty">هێشتا نووسراوەت بڵاو نەکردووەتەوە. لە گۆڕەپان یەکەمیان بنووسە.</p>') : (mb.map(bookHTML).join('') || '<p class="empty">هێشتا بەرهەمێکت نەخستووەتە کتێبخانە.</p>')}</div>`;
  icons();
}

/* ---------- routing ---------- */
function go(t, push = true) {
  S.tab = t; save();
  $$('.view').forEach(v => v.classList.toggle('hidden', v.id !== 'view-' + t));
  $$('[data-tab]').forEach(b => b.classList.toggle('active', b.dataset.tab === t));
  $('#view-title').textContent = TABS[t];
  if (push) { try { history.replaceState(null, '', '#' + t); } catch (e) {} }
  ({ feed: renderFeed, library: renderLib, dm: () => { renderDM(); renderChat(); }, profile: renderProfile })[t]();
  window.scrollTo(0, 0);
}
function route() {
  const h = location.hash.slice(1);
  if (h.startsWith('post-')) { S.filter = { d: null, t: null }; go('feed', false); setTimeout(() => { const e = $('#' + h); e && e.scrollIntoView({ block: 'center' }); }, 60); }
  else if (TABS[h]) go(h, false);
  else go(S.tab, false);
}

/* ---------- events ---------- */
document.addEventListener('click', async e => {
  const el = e.target.closest('[data-act]'); if (!el) return;
  const a = el.dataset.act, id = el.dataset.id, v = el.dataset.v;
  switch (a) {
    case 'tab': go(el.dataset.tab); break;
    case 'theme': S.theme = S.theme === 'dark' ? 'light' : 'dark'; document.documentElement.dataset.theme = S.theme; save(); break;
    case 'like': case 'dislike': react(id, a); break;
    case 'comment': OPEN.has(+id) ? OPEN.delete(+id) : OPEN.add(+id); repost(id); if (OPEN.has(+id)) { const t = $('#post-' + id + ' textarea[data-uni]'); t && t.focus(); } break;
    case 'sendcomment': sendComment(id); break;
    case 'share': openShare(id); break;
    case 'copylink': await copy(postLink()); modal('m-share', 0); toast('بەستەری نووسراوە کۆپی کرا'); break;
    case 'shareto': { const c = S.chats.find(x => x.id === id), p = S.posts.find(x => x.id == shareId), ex = [...p.text.replace(/\|/g, ' ')].slice(0, 70).join('');
      c.m.push({ me: 1, t: `نووسراوەیەکی مەکۆ: «${ex}…»\n${postLink()}`, ts: now() }); save(); modal('m-share', 0); renderDM(); toast('نێردرا بۆ ' + c.n); break; }
    case 'publish': publish(); break;
    case 'fd': S.filter.d = S.filter.d === v ? null : v; save(); renderFeed(); renderSide(); go('feed', false); break;
    case 'ft': S.filter.t = S.filter.t === v ? null : v; save(); renderFeed(); renderSide(); go('feed', false); break;
    case 'clearf': S.filter = { d: null, t: null }; save(); renderFeed(); renderSide(); break;
    case 'libcat': S.lib.cat = v; save(); renderLib(); break;
    case 'readtxt': openTxt(id); break;
    case 'dltxt': { const b = S.books.find(x => x.id == id); download(b.title, b.txt); toast('فایلی .txt داگیرا'); break; }
    case 'dltxt2': download(curBook.title, curBook.txt); toast('فایلی .txt داگیرا'); break;
    case 'copytxt': await copy(curBook.txt); toast('تەواوی دەق کۆپی کرا'); break;
    case 'pdf': { const b = S.books.find(x => x.id == id); /^https?:\/\//.test(b.pdf) ? window.open(b.pdf, '_blank', 'noopener') : toast('PDF: ' + b.pdf + ' — تەنها زانیاری فایلەکە تۆمارکراوە'); break; }
    case 'addbook': modal('m-add', 1); break;
    case 'savebook': saveBook(); break;
    case 'close': { const m = el.closest('.modal'); if (m) modal(m.id, 0); break; }
    case 'chat': S.active = id; mob = 'chat'; save(); renderDM(); renderChat(); break;
    case 'back': mob = 'list'; renderDM(); break;
    case 'sendmsg': sendMsg(); break;
    case 'ptab': S.prof = v; save(); renderProfile(); break;
  }
});
document.addEventListener('input', e => { if (e.target.matches('textarea.field')) fit(e.target); });
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') $$('.modal:not(.hidden)').forEach(m => modal(m.id, 0));
  if (e.target.id === 'dm-in' && e.key === 'Enter' && !e.shiftKey && !e.isComposing) { e.preventDefault(); sendMsg(); }
});

/* ---------- init ---------- */
function init() {
  document.documentElement.dataset.theme = S.theme;
  const opt = a => a.map(x => `<option value="${x}">${x}</option>`).join('');
  $('#c-dialect').innerHTML = opt(DIAL); $('#ab-dialect').innerHTML = opt(DIAL);
  $('#c-tag').innerHTML = TAGS.map(t => `<option value="${t}">#${t}</option>`).join('');
  $('#c-tag').addEventListener('change', e => $('#poem-hint').classList.toggle('hidden', e.target.value !== 'شیعر'));
  $('#me-av').textContent = [...S.me.name][0];
  $('#lib-q').value = S.lib.q;
  $('#lib-q').addEventListener('input', e => { S.lib.q = e.target.value; save(); renderLibList(); });
  $('#ab-file').addEventListener('change', async e => {
    const f = e.target.files[0]; if (!f) return;
    $('#ab-txt').value = U.decodeBuffer(await f.arrayBuffer());
    if (!$('#ab-title').value) $('#ab-title').value = f.name.replace(/\.[^.]+$/, '');
    fit($('#ab-txt')); e.target.value = ''; toast('فایلەکە خوێندرایەوە و بوو بە UTF-8ـی پاک');
  });
  U.bind();
  renderSide(); renderProfile(); renderDM(); renderChat();
  route(); addEventListener('hashchange', route); icons();
}
init();
})();
