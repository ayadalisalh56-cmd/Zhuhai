(function () {
'use strict';
var KEY = 'meko_state_v2', $ = function (s) { return document.querySelector(s); };
var D = function (n) { return String(n).replace(/\d/g, function (d) { return '٠١٢٣٤٥٦٧٨٩'[d]; }); };
var COL = ['#0ea5e9', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#14b8a6'];
function svg(n) {
  var h = Array.from(n).reduce(function (a, c) { return a + c.charCodeAt(0); }, 0) % 6;
  return 'data:image/svg+xml;utf8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="84" height="84"><rect width="84" height="84" fill="' + COL[h] + '"/><text x="42" y="57" font-size="40" text-anchor="middle" fill="#fff" font-family="sans-serif">' + n[0] + '</text></svg>');
}
var av = function (a) { return a.img || svg(a.name); };
var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
function ago(ts) {
  var m = Math.max(1, Math.round((Date.now() - new Date(ts)) / 60000));
  return m < 60 ? D(m) + ' خولەک لەمەوبەر' : m < 1440 ? D(Math.round(m / 60)) + ' کاتژمێر لەمەوبەر' : D(Math.round(m / 1440)) + ' ڕۆژ لەمەوبەر';
}

/* ---------- Kurdish Aramaic -> Latin (Hawar) ---------- */
var HM = { 'ا': 'a', 'ە': 'e', 'ێ': 'ê', 'ۆ': 'o', 'ب': 'b', 'پ': 'p', 'ت': 't', 'ج': 'c', 'چ': 'ç', 'ح': 'h', 'خ': 'x', 'د': 'd', 'ز': 'z', 'ژ': 'j', 'س': 's', 'ش': 'ş', 'ع': "'", 'غ': 'x', 'ف': 'f', 'ڤ': 'v', 'ق': 'q', 'ک': 'k', 'گ': 'g', 'م': 'm', 'ن': 'n', 'ه': 'h', 'ھ': 'h', '؟': '?', '،': ',', '؛': ';' };
var LET = /[\u0620-\u064A\u0671-\u06D5\u06EE-\u06FF]/, VOW = 'اەێۆ';
function transliterateKurdishToLatin(text) {
  var s = Array.from(text.replace(/[٠-٩]/g, function (d) { return '٠١٢٣٤٥٦٧٨٩'.indexOf(d); })), o = '';
  for (var i = 0; i < s.length; i++) {
    var c = s[i], p = s[i - 1], n = s[i + 1], pl = p && LET.test(p);
    if (c === 'و') {
      if (n === 'و') { o += 'û'; i++; }
      else if (n && VOW.indexOf(n) > -1 || n === 'ی') o += 'w';
      else o += pl ? 'u' : 'w';
    } else if (c === 'ی') o += ((n && VOW.indexOf(n) > -1) || (p && VOW.indexOf(p) > -1)) ? 'y' : 'î';
    else if (c === 'ئ') continue;
    else if (c === 'ر') o += 'r';
    else if (c === 'ڕ') o += pl ? 'rr' : 'r';
    else if (c === 'ل') o += 'l';
    else if (c === 'ڵ') o += pl ? 'll' : 'l';
    else if (c === '\u0640' || (c >= '\u064B' && c <= '\u065F')) continue;
    else o += HM[c] !== undefined ? HM[c] : c;
  }
  return o.replace(/(^|[.!?\n]\s*)(\p{L})/gu, function (m, a, b) { return a + b.toUpperCase(); });
}
window.transliterateKurdishToLatin = transliterateKurdishToLatin;

/* ---------- State & seed ---------- */
var S, U = { view: 'home', nf: 'all', pf: 'all', ct: 'dm', room: null, open: new Set(), latin: new Set(), poem: false, newAv: null };
var TYPES = ['LIKE', 'COMMENT', 'FOLLOW'];
function createNotification(type, p) {
  if (TYPES.indexOf(type) < 0) throw new Error('Invalid notification type');
  if (!p || !p.actorName) throw new Error('actorName required');
  if (type !== 'FOLLOW' && !p.postId) throw new Error('postId required');
  if (type === 'COMMENT' && !p.commentText) throw new Error('commentText required');
  var post = type === 'FOLLOW' ? null : S.posts.find(function (x) { return x.id === p.postId; });
  return {
    id: 'n' + Date.now() + Math.random().toString(36).slice(2, 6), type: type, actorName: p.actorName, actorHandle: p.actorHandle || 'user',
    actorAvatar: svg(p.actorName), postId: type === 'FOLLOW' ? null : p.postId,
    postExcerpt: type === 'FOLLOW' ? null : (post ? post.orig.replace(/\s+/g, ' ').slice(0, 70) : ''),
    commentText: type === 'COMMENT' ? p.commentText : null, isFollowingBack: type === 'FOLLOW' ? !!p.isFollowingBack : false,
    timestamp: p.timestamp || new Date().toISOString(), read: false
  };
}
function seed() {
  var t = function (h) { return new Date(Date.now() - h * 3600000).toISOString(); };
  S = {
    user: { name: 'والی', handle: 'wali_kurd', country: 'کوردستان', city: 'کەرکووک', bio: 'تەلارسازیی وشە و خەیاڵ؛ هەوڵێک بۆ پاراستن و بوژاندنەوەی زمانی ڕەسەنی کوردی لە جیهانی دیجیتاڵیدا.', avatar: null, followers: 1284, following: 312 },
    savedPostIds: [], notifications: [],
    posts: [
      { id: 'p1', name: 'ژیلا ئەحمەد', handle: 'zhila_a', time: t(2), poetry: true, likes: 214, shares: 12, liked: false, text: 'ئەی زمانی دایکم، ئەی ڕووناکی شەوی تاریک\nلە هەر وشەیەکتدا دنیایەک دەبینم\nتۆ خانووی دڵمی، تۆ ماڵی ڕۆحم\nهەتا زیندووم لە باوەشتدا دەژیم', comments: [{ name: 'ئاراس کەریم', text: 'زۆر جوانە، دەستخۆش.' }, { name: 'سارا ڕەحمان', text: 'هەر دێڕێک دڵی لەرزاند.' }] },
      { id: 'p2', name: 'ئاراس کەریم', handle: 'aras_k', time: t(5), poetry: false, likes: 96, shares: 7, liked: false, text: 'زمان تەنها ئامرازی قسەکردن نییە؛ ماڵی بیرکردنەوەی گەلانە. کاتێک وشەیەک لەبیر دەچێت، پارچەیەک لە جیهانبینی خۆمان لەدەست دەدەین. بۆیە نووسینەوە و تۆمارکردنی وشە ڕەسەنەکان ئەرکێکی هاوبەشە.', comments: [{ name: 'دڵشاد جەلال', text: 'ڕاست دەفەرموویت، با هەموومان بنووسین.' }] },
      { id: 'p3', me: true, time: t(9), poetry: true, likes: 58, shares: 3, liked: false, text: 'بەیانی بوو و خۆر هەڵات\nکەرکووک بە ئاواتەوە بەخەبەر هات\nهەر وشەیەک تۆوێکە، هەر دێڕێک باخێک\nبا بڕوێنین بۆ ئەوانەی دواتر دێن', comments: [{ name: 'ژیلا ئەحمەد', text: 'خوا بتپارێزێت، کەرکووک جوانە.' }] },
      { id: 'p4', me: true, time: t(26), poetry: false, likes: 41, shares: 5, liked: false, text: 'ڕێنووسی لاتینی و ئارامی دوو پەنجەرەن بۆ یەک باخچە. هەرکامیان بۆ مەبەستێک باشە، بەڵام دەقی یەکەم دەبێت ڕێک و یەکگرتوو بپارێزرێت بۆ ئەوەی ڕۆژێک مۆدێلە زمانییەکان لێی فێربن.', comments: [] },
      { id: 'p5', name: 'هێمن هەورامی', handle: 'hemin_h', time: t(30), poetry: true, likes: 133, shares: 9, liked: false, text: 'شەو درێژە و ئەستێرە کەمە\nبەڵام دڵ هێشتا بە هیوا گەرمە\nچرایەک هەڵبکە لە ناو وشەکاندا\nڕێگا بۆ هەموومان ڕوون دەبێتەوە', comments: [{ name: 'ئاراس کەریم', text: 'هیوا زیندووە.' }] }
    ],
    chats: [
      { id: 'c1', g: 0, name: 'ئاراس کەریم', status: 'چالاکە', time: '١٠:٤٠', msgs: [{ m: 0, t: 'سڵاو، پۆستەکەی ئەمڕۆتم زۆر پێخۆش بوو.' }, { m: 1, t: 'سوپاس! ئاسمانی ڕووناکی هەموومانە.' }] },
      { id: 'c2', g: 0, name: 'ژیلا ئەحمەد', status: 'چالاکە', time: '٠٩:١٥', msgs: [{ m: 0, t: 'دیوانەکەت کەی تەواو دەبێت؟' }] },
      { id: 'c3', g: 0, name: 'سارا ڕەحمان', status: 'چالاکە', time: 'دوێنێ', msgs: [{ m: 0, t: 'فەرهەنگەکە ناردم بۆت.' }] },
      { id: 'g1', g: 1, name: 'ئەدەبی کوردی', status: '١,٨٥٠ ئەندام', time: '١١:٠٠', msgs: [{ m: 0, t: 'ئەمشەو شیعرخوێندنەوەمان هەیە.', by: 'ژیلا ئەحمەد' }] },
      { id: 'g2', g: 1, name: 'زمانناسی و ڕێنووس', status: '١,٢٠٠ ئەندام', time: '٠٨:٣٠', msgs: [{ m: 0, t: 'پێشنیاری ڕێنووسی نوێ بخوێننەوە.', by: 'ئاراس کەریم' }] }
    ]
  };
  var N = function (ty, a, h, po, c, fb, hr) { var n = createNotification(ty, { actorName: a, actorHandle: h, postId: po, commentText: c, isFollowingBack: fb, timestamp: t(hr) }); n.read = hr > 20; return n; };
  S.notifications = [
    N('LIKE', 'ژیلا ئەحمەد', 'zhila_a', 'p3', null, false, 1),
    N('COMMENT', 'ئاراس کەریم', 'aras_k', 'p3', 'دێڕی کۆتایی زۆر بە مانایە.', false, 3),
    N('FOLLOW', 'هێمن هەورامی', 'hemin_h', null, null, false, 6),
    N('LIKE', 'دڵشاد جەلال', 'dilshad_j', 'p4', null, false, 12),
    N('COMMENT', 'ژیلا ئەحمەد', 'zhila_a', 'p4', 'پێشنیارێکی گرنگە.', false, 22),
    N('FOLLOW', 'سارا ڕەحمان', 'sara_r', null, null, true, 30)
  ];
}
function load() { try { S = JSON.parse(localStorage.getItem(KEY)); } catch (e) { S = null; } if (!S || !S.posts) seed(); S.posts.forEach(function (p) { p.orig = p.orig || p.text; }); }
function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} }
function addNotif(type, p) { S.notifications.unshift(createNotification(type, p)); save(); }
var author = function (p) { return p.me ? { name: S.user.name, handle: S.user.handle, img: S.user.avatar } : { name: p.name, handle: p.handle }; };
var demoActor = function (p) { return p.me ? { actorName: 'ئاراس کەریم', actorHandle: 'aras_k' } : { actorName: p.name, actorHandle: p.handle }; };
function toast(m) { var t = $('#toast'); t.textContent = m; t.classList.add('on'); clearTimeout(toast.h); toast.h = setTimeout(function () { t.classList.remove('on'); }, 1700); }

/* ---------- Views ---------- */
function postH(p) {
  var a = author(p), L = U.latin.has(p.id), t = L ? transliterateKurdishToLatin(p.orig) : p.orig, sv = S.savedPostIds.indexOf(p.id) > -1;
  var cm = U.open.has(p.id) ? '<section class="cms">' + p.comments.map(function (c) { var b = c.me ? { name: S.user.name, img: S.user.avatar } : c; return '<div class="cm"><img class="avatar-xs" src="' + av(b) + '" alt=""><div><b>' + esc(b.name) + '</b><p>' + esc(c.text) + '</p></div></div>'; }).join('') + '<div class="cmf"><input id="ci-' + p.id + '" data-id="' + p.id + '" placeholder="لێدوانێک بنووسە..."><button data-act="sendcm" data-id="' + p.id + '" aria-label="send"><i data-lucide="send"></i></button></div></section>' : '';
  return '<article class="post" id="p-' + p.id + '"><header class="ph"><div class="row"><img class="avatar-sm" src="' + av(a) + '" alt=""><div><b>' + esc(a.name) + '</b><br><time class="mu" datetime="' + p.time + '">' + new Date(p.time).toLocaleDateString('ckb', { day: 'numeric', month: 'long' }) + '</time></div></div><button data-act="more" data-id="' + p.id + '" aria-label="more"><i data-lucide="more-horizontal"></i></button></header>' +
    '<div class="pb' + (p.poetry ? ' poem' : '') + '"' + (L ? ' dir="ltr"' : '') + '>' + esc(t) + '</div>' +
    '<footer class="pa"><div class="g22"><button data-act="like" data-id="' + p.id + '" class="' + (p.liked ? 'liked' : '') + '"><i data-lucide="heart"></i><span>' + D(p.likes) + '</span></button><button data-act="cm" data-id="' + p.id + '"><i data-lucide="message-circle"></i><span>' + D(p.comments.length) + '</span></button><button data-act="share" data-id="' + p.id + '"><i data-lucide="share-2"></i><span>' + D(p.shares) + '</span></button></div>' +
    '<div class="g16"><button class="conv" data-act="conv" data-id="' + p.id + '">' + (L ? 'ئارامی' : 'لاتینی') + '</button><button data-act="save" data-id="' + p.id + '" class="' + (sv ? 'saved' : '') + '"><i data-lucide="bookmark"></i></button></div></footer>' + cm + '</article><div class="div"></div>';
}
var tabsH = function (list, cur, key) { return '<div class="tabs">' + list.map(function (t) { return '<button class="tab' + (cur === t[0] ? ' on' : '') + '" data-act="tab" data-k="' + key + '" data-v="' + t[0] + '">' + t[1] + '</button>'; }).join('') + '</div>'; };
function homeH() { return '<header class="top"><h1>مەکۆ</h1></header>' + S.posts.slice().sort(function (a, b) { return new Date(b.time) - new Date(a.time); }).map(postH).join(''); }
function savedH() {
  var l = S.posts.filter(function (p) { return S.savedPostIds.indexOf(p.id) > -1; });
  return '<header class="top"><div><h1>پاشەکەوتکراوەکان</h1><span class="mu">تەنها خۆت دەیبینیت</span></div><i data-lucide="lock"></i></header>' + (l.length ? l.map(postH).join('') : '<div class="empty">هێشتا هیچ پۆستێکت پاشەکەوت نەکردووە.</div>');
}
function notifH() {
  var f = { all: 1, LIKE: 'LIKE', COMMENT: 'COMMENT', FOLLOW: 'FOLLOW' }, l = S.notifications.filter(function (n) { return U.nf === 'all' || n.type === U.nf; });
  var rows = l.map(function (n) {
    var h = '<div class="nav"><img class="avatar-sm" src="' + n.actorAvatar + '" alt="">', b = '', x = '';
    switch (n.type) {
      case 'LIKE':
        h += '<span class="nb" style="background:#ef4444"><i data-lucide="heart"></i></span></div>';
        b = '<div><strong>' + esc(n.actorName) + '</strong> پۆستەکەتی پەسەند کرد.</div><div class="snip">' + esc(n.postExcerpt) + '</div>'; break;
      case 'COMMENT':
        h += '<span class="nb" style="background:#0084ff"><i data-lucide="message-circle"></i></span></div>';
        b = '<div><strong>' + esc(n.actorName) + '</strong> لێدوانێکی نووسی لەسەر پۆستەکەت:</div><div class="quote">«' + esc(n.commentText) + '»</div><div class="snip">' + esc(n.postExcerpt) + '</div>'; break;
      case 'FOLLOW':
        h += '<span class="nb" style="background:#10b981"><i data-lucide="user-plus"></i></span></div>';
        b = '<div><strong>' + esc(n.actorName) + '</strong> دەستی کرد بە شوێنکەوتنت.</div>';
        x = '<button class="pill' + (n.isFollowingBack ? ' alt' : '') + '" data-act="nfollow" data-id="' + n.id + '">' + (n.isFollowingBack ? 'شوێنکەوتوو' : 'شوێنکەوتنەوە') + '</button>'; break;
    }
    return '<div class="nt' + (n.read ? '' : ' unread') + '" data-act="nopen" data-id="' + n.id + '" role="button">' + h + '<div class="body">' + b + '<div class="mu">' + ago(n.timestamp) + '</div></div>' + x + '</div>';
  }).join('');
  return '<header class="top"><h1>ئاگادارییەکان</h1><button class="mu" data-act="readall">خوێندنەوەی هەموو</button></header>' +
    tabsH([['all', 'هەموو'], ['LIKE', 'پەسەندکردن'], ['COMMENT', 'لێدوانەکان'], ['FOLLOW', 'شوێنکەوتن']], U.nf, 'nf') + (rows || '<div class="empty">ئاگادارییەک نییە.</div>');
}
function profH() {
  var u = S.user, mine = S.posts.filter(function (p) { return p.me && (U.pf === 'all' || p.poetry); }), cnt = S.posts.filter(function (p) { return p.me; }).length;
  return '<header class="top"><b dir="ltr">@' + esc(u.handle) + '</b><button data-go="settings" aria-label="settings"><i data-lucide="settings"></i></button></header><section class="prof"><div class="row"><img class="avatar-lg" src="' + av({ name: u.name, img: u.avatar }) + '" alt=""><div class="stats"><div><b>' + D(cnt) + '</b><span class="mu">پۆست</span></div><div><b>' + D(u.followers) + '</b><span class="mu">شوێنکەوتووان</span></div><div><b>' + D(u.following) + '</b><span class="mu">شوێنکەوتوو</span></div></div></div>' +
    '<div style="margin-top:12px"><b>' + esc(u.name) + '</b><p style="margin:6px 0;line-height:1.8;font-size:14.5px">' + esc(u.bio) + '</p><span class="mu row" style="gap:4px"><i data-lucide="map-pin" style="width:14px;height:14px"></i>' + esc(u.country) + '، ' + esc(u.city) + '</span></div>' +
    '<div class="btns"><button data-act="edit">دەستکاریکردنی پڕۆفایل</button><button data-act="shareprof">هاوبەشیکردنی پڕۆفایل</button></div></section>' +
    tabsH([['all', 'هەموو بڵاوکراوەکانم'], ['poems', 'شیعرەکانم']], U.pf, 'pf') + '<div class="div"></div>' + (mine.map(postH).join('') || '<div class="empty">هێشتا هیچت بڵاو نەکردووەتەوە.</div>');
}
function settingsH() {
  var dk = document.documentElement.classList.contains('dark');
  return '<header class="top"><h1>ڕێکخستنەکان</h1></header><button class="setr" data-act="theme"><span>دۆخی تاریک</span><span class="switch"></span></button><button class="setr" data-act="testnotif"><span>تاقیکردنەوەی ئاگاداری</span><i data-lucide="bell"></i></button><button class="setr" data-act="reset"><span>ڕێکخستنەوەی داتای نموونە</span><i data-lucide="rotate-ccw"></i></button>';
}
function chatH() {
  var l = S.chats.filter(function (c) { return c.g === (U.ct === 'gr' ? 1 : 0); });
  return '<header class="top"><h1>چات</h1></header>' + tabsH([['dm', 'چاتەکان'], ['gr', 'گرووپەکان']], U.ct, 'ct') + l.map(function (c) {
    var last = c.msgs[c.msgs.length - 1];
    return '<button class="cl" data-act="room" data-id="' + c.id + '"><div class="rel"><img class="avatar-md" src="' + svg(c.name) + '" alt="">' + (c.g ? '' : '<span class="dot"></span>') + '</div><div style="flex:1;min-width:0"><b>' + esc(c.name) + '</b><div class="snip">' + esc(last.t) + '</div></div><span class="mu">' + c.time + '</span></button>';
  }).join('');
}
function roomH() {
  var c = S.chats.find(function (x) { return x.id === U.room; });
  return '<div class="room"><header class="top"><div class="row"><button data-act="back" aria-label="back"><i data-lucide="arrow-right"></i></button><img class="avatar-sm" src="' + svg(c.name) + '" alt=""><div><b>' + esc(c.name) + '</b><br><span class="mu">' + c.status + '</span></div></div></header><div class="msgs" id="msgs">' +
    c.msgs.map(function (m) { return m.m ? '<div class="mrow me"><div class="bub">' + esc(m.t) + '</div></div>' : '<div class="mrow they"><div class="bub">' + esc(m.t) + '</div><img class="avatar-xs" src="' + svg(m.by || c.name) + '" alt=""></div>'; }).join('') +
    '</div><div class="cin"><div class="pillin"><textarea id="mi" rows="1" placeholder="نامەیەک بنووسە..."></textarea><button class="send" id="ms" data-act="msg" aria-label="send"><i data-lucide="arrow-up"></i></button></div></div></div>';
}

/* ---------- Render ---------- */
function render() {
  var v = { home: homeH, notifs: notifH, chat: chatH, profile: profH, saved: savedH, settings: settingsH }[U.view];
  $('#view').innerHTML = U.room ? roomH() : v();
  document.body.classList.toggle('hide-bar', !!U.room);
  var un = S.notifications.filter(function (n) { return !n.read; }).length, b = $('#badge');
  b.hidden = !un; b.textContent = D(un);
  $('#barAv').src = av({ name: S.user.name, img: S.user.avatar });
  if (window.lucide) lucide.createIcons({ attrs: { 'stroke-width': 1.75 } });
  var m = $('#msgs'); if (m) m.scrollTop = m.scrollHeight;
  $('#meko-jsonld').textContent = JSON.stringify({ '@context': 'https://schema.org', '@graph': S.posts.map(function (p) { return { '@type': p.poetry ? 'CreativeWork' : 'SocialMediaPosting', '@id': '#' + p.id, inLanguage: 'ku', datePublished: p.time, text: p.orig, author: { '@type': 'Person', name: author(p).name }, interactionStatistic: { '@type': 'InteractionCounter', interactionType: 'https://schema.org/LikeAction', userInteractionCount: p.likes } }; }) });
}
function go(v) { U.view = v; U.room = null; closeDrawer(); render(); window.scrollTo(0, 0); }

/* ---------- Drawer, creator, modal ---------- */
function openDrawer() {
  var u = S.user, dk = document.documentElement.classList.contains('dark');
  $('#drawer').innerHTML = '<button class="dcard" data-go="profile"><img class="avatar-md" src="' + av({ name: u.name, img: u.avatar }) + '" alt=""><div><b>' + esc(u.name) + '</b><div class="mu" dir="ltr" style="text-align:right">@' + esc(u.handle) + '</div><div class="mu row" style="gap:4px"><i data-lucide="map-pin" style="width:12px;height:12px"></i>' + esc(u.city) + '</div><div class="mu">' + D(u.followers) + ' شوێنکەوتوو · ' + D(u.following) + ' شوێنکەوتووی</div></div></button>' +
    '<nav class="dnav"><button data-go="profile"><i data-lucide="user"></i>پڕۆفایلەکەم</button><button data-go="saved"><i data-lucide="bookmark"></i>پاشەکەوتکراوەکان</button><button data-go="settings"><i data-lucide="settings"></i>ڕێکخستنەکان</button></nav>' +
    '<div class="dfoot"><button data-act="theme" style="width:100%;justify-content:space-between;margin-bottom:12px;font-size:14px;color:var(--tx)"><span>دۆخی تاریک</span><span class="switch"></span></button>مەکۆ · ژێرخانی کراوەی زمانی کوردی</div>';
  lucide.createIcons({ attrs: { 'stroke-width': 1.75 } });
  $('#drawer').classList.add('open'); $('#backdrop').classList.add('open');
}
function closeDrawer() { $('#drawer').classList.remove('open'); $('#backdrop').classList.remove('open'); }
function openCreator() {
  U.poem = false; var c = $('#creator'); c.hidden = false;
  c.innerHTML = '<header class="top"><button data-act="closecr" aria-label="close"><i data-lucide="x"></i></button><b>پۆستی نوێ</b><button class="pill" data-act="publish">بڵاوکردنەوە</button></header><div class="cbody"><img class="avatar-sm" src="' + av({ name: S.user.name, img: S.user.avatar }) + '" alt=""><textarea id="ct" placeholder="چی لە دڵتدایە؟ لێرە بینووسە..."></textarea></div><div class="ctool"><button class="pill alt" id="pt" data-act="poemtog"><i data-lucide="feather" style="width:18px;height:18px"></i>شێوازی شیعر</button></div>';
  lucide.createIcons({ attrs: { 'stroke-width': 1.75 } }); $('#ct').focus();
}
function openEdit() {
  var u = S.user; U.newAv = null; var m = $('#modal'); m.hidden = false;
  m.innerHTML = '<div class="sheet"><div style="display:flex;justify-content:space-between;align-items:center"><button data-act="closemod">پاشگەزبوونەوە</button><b>دەستکاریکردنی پڕۆفایل</b><button class="pill" data-act="savepro">پاشەکەوتکردن</button></div><div style="text-align:center;margin-top:18px"><label class="cam"><img class="avatar-lg" id="eav" src="' + av({ name: u.name, img: u.avatar }) + '" alt=""><span><i data-lucide="camera"></i></span><input type="file" accept="image/*" id="ef" hidden></label><div class="mu" style="margin-top:8px">گۆڕینی وێنەی پڕۆفایل</div></div>' +
    '<div class="field"><label>ناوی پیشاندراو</label><input id="en" value="' + esc(u.name) + '"></div><div class="field"><label>نازناو / یوزەرنەیم</label><input id="eh" dir="ltr" value="' + esc(u.handle) + '" placeholder="wali_kurd"></div><div class="field"><label>ژیاننامە · <span id="ecnt">' + D(u.bio.length) + '</span>/١٦٠</label><textarea id="eb" maxlength="160" rows="3">' + esc(u.bio) + '</textarea></div></div>';
  lucide.createIcons({ attrs: { 'stroke-width': 1.75 } });
}

/* ---------- Actions ---------- */
function copy(t) { try { navigator.clipboard.writeText(t); } catch (e) {} }
function sendMsg() {
  var ta = $('#mi'), t = ta.value.trim(); if (!t) return;
  S.chats.find(function (x) { return x.id === U.room; }).msgs.push({ m: 1, t: t }); save(); render(); $('#mi').focus();
}
var A = {
  create: openCreator, drawer: openDrawer, closedrawer: closeDrawer,
  closecr: function () { $('#creator').hidden = true; }, closemod: function () { $('#modal').hidden = true; },
  poemtog: function () { U.poem = !U.poem; $('#ct').classList.toggle('poem', U.poem); $('#pt').classList.toggle('on', U.poem); },
  publish: function () {
    var t = $('#ct').value.trim(); if (!t) return toast('تکایە شتێک بنووسە');
    S.posts.unshift({ id: 'p' + Date.now(), me: true, time: new Date().toISOString(), poetry: U.poem, likes: 0, shares: 0, liked: false, text: t, orig: t, comments: [] });
    save(); $('#creator').hidden = true; go('home'); toast('بڵاوکرایەوە');
  },
  like: function (b, p) { p.liked = !p.liked; p.likes += p.liked ? 1 : -1; if (p.liked) addNotif('LIKE', Object.assign({ postId: p.id }, demoActor(p))); save(); render(); },
  cm: function (b, p) { U.open.has(p.id) ? U.open.delete(p.id) : U.open.add(p.id); render(); },
  sendcm: function (b, p) {
    var i = $('#ci-' + p.id), t = i.value.trim(); if (!t) return;
    p.comments.push({ me: true, text: t }); addNotif('COMMENT', Object.assign({ postId: p.id, commentText: t }, demoActor(p))); save(); render();
  },
  share: function (b, p) { p.shares++; copy(p.orig); save(); render(); toast('کۆپی کرا'); },
  conv: function (b, p) { U.latin.has(p.id) ? U.latin.delete(p.id) : U.latin.add(p.id); render(); },
  save: function (b, p) {
    var i = S.savedPostIds.indexOf(p.id); i > -1 ? S.savedPostIds.splice(i, 1) : S.savedPostIds.push(p.id);
    save(); render(); toast(i > -1 ? 'لابرا لە پاشەکەوتکراوەکان' : 'پاشەکەوت کرا');
  },
  more: function (b, p) { if (p.me && confirm('ئەم پۆستە بسڕدرێتەوە؟')) { S.posts = S.posts.filter(function (x) { return x.id !== p.id; }); save(); render(); } else if (!p.me) { copy(p.orig); toast('کۆپی کرا'); } },
  tab: function (b) { U[b.dataset.k] = b.dataset.v; render(); },
  readall: function () { S.notifications.forEach(function (n) { n.read = true; }); save(); render(); },
  nfollow: function (b) {
    var n = S.notifications.find(function (x) { return x.id === b.dataset.id; }); if (n.type !== 'FOLLOW') return;
    n.isFollowingBack = !n.isFollowingBack; S.user.following += n.isFollowingBack ? 1 : -1; save(); render();
  },
  nopen: function (b) {
    var n = S.notifications.find(function (x) { return x.id === b.dataset.id; }); n.read = true; save();
    if (n.type === 'FOLLOW') return render();
    if (n.type === 'COMMENT') U.open.add(n.postId);
    go('home'); var e = document.getElementById('p-' + n.postId); if (e) e.scrollIntoView({ block: 'start' });
  },
  theme: function () { var r = document.documentElement; r.classList.toggle('dark'); r.classList.toggle('light'); try { localStorage.setItem('meko_theme', r.classList.contains('dark') ? 'dark' : 'light'); } catch (e) {} render(); if ($('#drawer').classList.contains('open')) openDrawer(); },
  testnotif: function () {
    var p = S.posts.find(function (x) { return x.me; });
    addNotif('LIKE', { actorName: 'نالی کوردستانی', actorHandle: 'nali_k', postId: p.id });
    addNotif('COMMENT', { actorName: 'مەحوی نوێ', actorHandle: 'mahwi_n', postId: p.id, commentText: 'دەستت خۆش بێت!' });
    addNotif('FOLLOW', { actorName: 'گۆران کەریم', actorHandle: 'goran_k' }); render(); toast('ئاگادارییەکان زیادکران');
  },
  reset: function () { if (confirm('هەموو داتا بسڕدرێتەوە؟')) { localStorage.removeItem(KEY); seed(); save(); U.open.clear(); U.latin.clear(); go('home'); } },
  edit: openEdit,
  shareprof: function () { copy('@' + S.user.handle); toast('کۆپی کرا'); },
  savepro: function () {
    var h = $('#eh').value.toLowerCase().replace(/[^a-z0-9_]/g, ''), n = $('#en').value.trim();
    if (!n || !h) return toast('ناو و نازناو پێویستن');
    S.user.name = n; S.user.handle = h; S.user.bio = $('#eb').value.trim(); if (U.newAv) S.user.avatar = U.newAv;
    save(); $('#modal').hidden = true; render(); toast('پاشەکەوت کرا');
  },
  room: function (b) { U.room = b.dataset.id; render(); },
  back: function () { U.room = null; render(); },
  msg: sendMsg
};

document.addEventListener('click', function (e) {
  var g = e.target.closest('[data-go]'); if (g) return go(g.dataset.go);
  var b = e.target.closest('[data-act]'); if (!b) return;
  var f = A[b.dataset.act]; if (f) f(b, S.posts.find(function (x) { return x.id === b.dataset.id; }));
});
document.addEventListener('keydown', function (e) {
  if (e.key === 'Enter' && e.target.matches('.cmf input')) A.sendcm(null, S.posts.find(function (x) { return x.id === e.target.dataset.id; }));
});
document.addEventListener('input', function (e) {
  var t = e.target;
  if (t.id === 'mi') { t.style.height = 'auto'; t.style.height = Math.min(t.scrollHeight, 96) + 'px'; $('#ms').classList.toggle('on', !!t.value.trim()); }
  if (t.id === 'eb') $('#ecnt').textContent = D(t.value.length);
});
document.addEventListener('change', function (e) {
  if (e.target.id !== 'ef' || !e.target.files[0]) return;
  var r = new FileReader();
  r.onload = function () {
    var im = new Image();
    im.onload = function () {
      var c = document.createElement('canvas'); c.width = c.height = 250; var x = c.getContext('2d'), s = Math.min(im.width, im.height);
      x.drawImage(im, (im.width - s) / 2, (im.height - s) / 2, s, s, 0, 0, 250, 250);
      U.newAv = c.toDataURL('image/jpeg', 0.85); $('#eav').src = U.newAv;
    };
    im.src = r.result;
  };
  r.readAsDataURL(e.target.files[0]);
});

try { var th = localStorage.getItem('meko_theme'); if (th === 'dark') { document.documentElement.classList.replace('light', 'dark'); } } catch (e) {}
load(); save(); render();
})();
