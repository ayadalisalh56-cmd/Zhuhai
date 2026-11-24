/**
 * مەکۆ (Meko) — app.js
 * ---------------------------------------------------------------------------
 * Client-side Kurdish social / literary / open-AI-corpus application.
 * Binds to the exact DOM structure, IDs and <template> elements of index.html.
 *
 * Depends on:
 *   - styles.css          (.dark / .light, .drawer-open / .drawer-closed, .text-poetry …)
 *   - unicode-engine.js   (window.normalizeKurdishText, window.kurdishToLatin)
 *   - lucide              (window.lucide.createIcons)
 *
 * Persistent state lives in localStorage under "meko_state_v2".
 * ---------------------------------------------------------------------------
 */
(function () {
  'use strict';

  /* ==========================================================================
   * 0. CONSTANTS & SMALL HELPERS
   * ======================================================================== */
  var STORAGE_KEY = 'meko_state_v2';
  var ME = 'me';
  var MAX_CHARS = 500;
  var RING_LENGTH = 62.83;
  var FEED_PAGE_SIZE = 6;
  var MAX_IMAGES = 4;
  var VIEWS = ['home', 'profile', 'saved', 'settings', 'chat-list', 'chat-room', 'notifications'];
  var BLANK_IMG = 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==';
  var KU_DIGITS = '٠١٢٣٤٥٦٧٨٩';
  var KU_MONTHS = ['کانوونی دووەم', 'شوبات', 'ئازار', 'نیسان', 'ئایار', 'حوزەیران', 'تەمموز', 'ئاب', 'ئەیلوول', 'تشرینی یەکەم', 'تشرینی دووەم', 'کانوونی یەکەم'];
  var DEFAULT_SETTINGS = {
    notifLikes: true,
    notifReplies: true,
    notifFollows: true,
    notifMessages: true,
    privateAccount: false,
    readReceipts: true
  };
  var AVATAR_PALETTES = [
    ['#059669', '#34d399'], ['#0ea5e9', '#6366f1'], ['#f97316', '#ef4444'], ['#8b5cf6', '#ec4899'],
    ['#14b8a6', '#3b82f6'], ['#eab308', '#f97316'], ['#e11d48', '#7c3aed'], ['#0d9488', '#84cc16']
  ];
  var EMOJIS = ['😀', '😂', '😍', '🥰', '😊', '😉', '😎', '🤔', '😢', '😭', '😡', '🙏', '👍', '👏', '🔥', '❤️', '💚', '✨', '🌿', '🌄', '📖', '✍️', '🪶', '🕊️', '🎉', '💡', '🤝', '🌹'];

  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function byId(id) { return document.getElementById(id); }
  function camel(id) { return id.replace(/-([a-z])/g, function (m, c) { return c.toUpperCase(); }); }
  function toKu(v) { return String(v).replace(/\d/g, function (d) { return KU_DIGITS.charAt(Number(d)); }); }
  function clamp(n, lo, hi) { return Math.min(hi, Math.max(lo, n)); }
  function charLen(s) { return Array.from(String(s == null ? '' : s)).length; }
  function uid(prefix) { return prefix + '_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7); }
  function hashStr(s) {
    var h = 2166136261;
    s = String(s);
    for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
    return h >>> 0;
  }
  function escapeXml(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
  function finePointer() { return !!(window.matchMedia && window.matchMedia('(pointer: fine)').matches); }

  function fmtCount(n) {
    n = Number(n) || 0;
    if (n < 1000) return toKu(n);
    if (n < 1000000) return toKu(String(Math.round(n / 100) / 10).replace('.', '٫')) + ' هەزار';
    return toKu(String(Math.round(n / 100000) / 10).replace('.', '٫')) + ' ملیۆن';
  }

  function startOfDay(ts) { var d = new Date(ts); d.setHours(0, 0, 0, 0); return d.getTime(); }
  function isSameDay(a, b) { return startOfDay(a) === startOfDay(b); }
  function fmtClock(ts) {
    var d = new Date(ts);
    return toKu(String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0'));
  }
  function fmtDate(ts, withYear) {
    var d = new Date(ts);
    var s = toKu(d.getDate()) + ' ' + KU_MONTHS[d.getMonth()];
    if (withYear || d.getFullYear() !== new Date().getFullYear()) s += ' ' + toKu(d.getFullYear());
    return s;
  }
  function relTime(ts, ago) {
    var diff = Math.max(0, Date.now() - ts);
    var min = Math.floor(diff / 60000);
    if (min < 1) return 'ئێستا';
    var out;
    if (min < 60) out = toKu(min) + ' خولەک';
    else if (min < 1440) out = toKu(Math.floor(min / 60)) + ' کاتژمێر';
    else if (min < 10080) out = toKu(Math.floor(min / 1440)) + ' ڕۆژ';
    else return fmtDate(ts);
    return ago ? out + ' لەمەوبەر' : out;
  }
  function dayLabel(ts) {
    var today = startOfDay(Date.now());
    var day = startOfDay(ts);
    if (day === today) return 'ئەمڕۆ';
    if (day === today - 86400000) return 'دوێنێ';
    return fmtDate(ts);
  }
  function chatListTime(ts) {
    var today = startOfDay(Date.now());
    var day = startOfDay(ts);
    if (day === today) return fmtClock(ts);
    if (day === today - 86400000) return 'دوێنێ';
    return fmtDate(ts);
  }
  function excerpt(text, max) {
    var t = String(text || '').replace(/\s+/g, ' ').trim();
    max = max || 70;
    var chars = Array.from(t);
    return chars.length > max ? chars.slice(0, max).join('') + '…' : t;
  }
  function countWords(text) {
    return String(text || '').split(/\s+/).filter(function (w) { return /[\p{L}\p{N}]/u.test(w); }).length;
  }
  function setShown(el, show, displayClass) {
    if (!el) return;
    el.classList.toggle('hidden', !show);
    if (displayClass) el.classList.toggle(displayClass, !!show);
  }
  function isShown(el) { return !!el && !el.classList.contains('hidden'); }

  /* --- Kurdish text engine wrappers (graceful if the engine failed to load) --- */
  function normalizeText(text) {
    var s = String(text == null ? '' : text);
    if (typeof window.normalizeKurdishText === 'function') {
      try { return window.normalizeKurdishText(s); } catch (e) { /* fall through */ }
    }
    return s.replace(/\u064A/g, '\u06CC').replace(/\u0649/g, '\u06CC').replace(/\u0643/g, '\u06A9').replace(/\u0640/g, '');
  }
  function toLatin(text) {
    if (typeof window.kurdishToLatin === 'function') {
      try { return window.kurdishToLatin(String(text == null ? '' : text)); } catch (e) { /* fall through */ }
    }
    return null;
  }

  function refreshIcons() {
    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      window.lucide.createIcons({ attrs: { 'stroke-width': 1.75 } });
    }
  }

  /* ==========================================================================
   * 1. DETERMINISTIC SVG AVATARS
   * ======================================================================== */
  function initialsOf(name) {
    var words = String(name || '').trim().split(/\s+/).filter(Boolean);
    if (!words.length) return '؟';
    var first = function (w) { return Array.from(w)[0] || ''; };
    var a = first(words[0]);
    var b = words.length > 1 ? first(words[words.length - 1]) : '';
    var latin = /[A-Za-z]/.test(a);
    var out = b ? a + (latin ? '' : '\u200C') + b : a;
    return latin ? out.toUpperCase() : out;
  }

  function makeAvatar(label, key) {
    var h = hashStr(String(key || label));
    var pal = AVATAR_PALETTES[h % AVATAR_PALETTES.length];
    var angle = (h >> 3) % 360;
    var initials = initialsOf(label);
    var size = Array.from(initials).length > 2 ? 40 : (Array.from(initials).length > 1 ? 46 : 58);
    var svg =
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128">' +
      '<defs><linearGradient id="g" gradientTransform="rotate(' + angle + ' .5 .5)">' +
      '<stop offset="0" stop-color="' + pal[0] + '"/><stop offset="1" stop-color="' + pal[1] + '"/></linearGradient></defs>' +
      '<rect width="128" height="128" fill="url(#g)"/>' +
      '<text x="64" y="66" dy=".35em" text-anchor="middle" font-family="Vazirmatn,Tahoma,Arial,sans-serif" font-size="' + size + '" font-weight="700" fill="#ffffff">' +
      escapeXml(initials) + '</text></svg>';
    return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
  }

  /* ==========================================================================
   * 2. SEED DATA & STATE (localStorage: meko_state_v2)
   * ======================================================================== */
  var state = null;

  function buildSeedState() {
    var now = Date.now();
    var MIN = 60000, HOUR = 3600000, DAY = 86400000;

    var currentUser = {
      id: 'u_wali',
      displayName: 'والی',
      username: 'wali_kurd',
      avatar: makeAvatar('والی', 'u_wali'),
      customAvatar: false,
      bio: 'تەلارسازیی وشە و خەیاڵ؛ هەوڵێک بۆ پاراستن و بووژاندنەوەی زمانی ڕەسەنی کوردی و شیعری کلاسیک لە جیهانی دیجیتاڵیدا.',
      country: 'کوردستان', countryKey: 'kurdistan',
      city: 'کەرکووک', cityKey: 'kirkuk',
      joined: '٢٠٢٦',
      verified: true,
      followingCount: 214,
      followersCount: 1280
    };

    function user(id, name, handle, bio, country, countryKey, city, cityKey, joined, verified, followers, following) {
      return {
        id: id, displayName: name, username: handle, avatar: makeAvatar(name, id), customAvatar: false,
        bio: bio, country: country, countryKey: countryKey, city: city, cityKey: cityKey,
        joined: joined, verified: verified, followersCount: followers, followingCount: following
      };
    }

    var users = [
      user('u_nali', 'نالی', 'nali_diwan', 'غەزەل و بەیتی کلاسیکی کوردی؛ هەژماری یادکردنەوەی شاعیرانی گەورە.', 'کوردستان', 'kurdistan', 'سلێمانی', 'sulaymaniyah', '٢٠٢٤', true, 8420, 12),
      user('u_mahwi', 'مەحوی', 'mahwi_poet', 'فەلسەفە و ئەوین لە ناو بەیتدا؛ ڕێگەیەک بۆ ناسینی خود.', 'کوردستان', 'kurdistan', 'هەڵەبجە', 'halabja', '٢٠٢٤', true, 6310, 9),
      user('u_soran', 'سۆران کەمال', 'soran_zimanzan', 'زمانناس و توێژەری ڕێزمانی کوردی.', 'کوردستان', 'kurdistan', 'هەولێر', 'erbil', '٢٠٢٥', false, 960, 188),
      user('u_zhila', 'ژیلە هەورامی', 'zhila_h', 'نووسەر و وەرگێڕ؛ لە پەیوەندیی نێوان ئەلفوبێی عەرەبی و لاتینیی کوردی دەکۆڵمەوە.', 'ئێران', 'iran', 'سنە', 'sanandaj', '٢٠٢٥', false, 1540, 302),
      user('u_awat', 'ئاوات ئەحمەد', 'awat_ai', 'ئەندازیاری نەرمامێر؛ کۆکردنەوەی داتای کراوە بۆ ژیریی دەستکردی کوردی.', 'ئەڵمانیا', 'germany', 'کۆلن', 'cologne', '٢٠٢٥', false, 2210, 143)
    ];

    function comment(id, authorId, text, ago) {
      return { id: id, authorId: authorId, text: text, createdAt: now - ago };
    }

    var P1 = [
      'ئەی وشەی ڕوونی دڵم، ئەی ڕووناکیی ئەم ئاسمان',
      'تۆ ئاوازی هەناسەم بووی لە ناو ئەم جیهان',
      '',
      'هەر کەسێ زمانی خۆی پاراست، ماوە ناوی هەتا هەتایە',
      'بێ زمان نابێ گەلێک ئاوەدان و کامەڕان',
      '',
      'والی لە ڕێی شیعردا دەگەڕێ بۆ ڕەچەڵەکی وشە',
      'چونکە وشە ماڵی ڕۆحە، ڕۆح دەبێتە جاویدان'
    ].join('\n');

    var P2 = [
      'ئەی بای سەحەر سڵاوی من بگەیەنە بۆ ئەو یار',
      'بڵێ دڵم لە دووریی تۆ پڕە لە دەرد و ئازار',
      '',
      'چاوم بە ڕێی تۆیە و ڕۆژ و شەو لە ئینتیزار',
      'تا کەی بمێنم لەم هیجرانە بێ سەبر و قەرار',
      '',
      'نالی لە ناڵەی شەوانەدا هەمیشە دەکا هاوار',
      'مەگەر ببینم جارێکی تر ڕووی ئەو نیگار'
    ].join('\n');

    var P3 = [
      'هەرچی دیتم لەم جیهانە، هەمووی خەونێکی ڕەنگین',
      'تا بە خۆ هاتم لە دەستم ڕۆیی ئەو نەخشە شیرین',
      '',
      'عاشقی ڕاستەقینە دڵی دەکاتە ماڵی یەقین',
      'ئەوەی لە خۆی دوور بکەوێ، دەگا بە ڕەوشەنبین',
      '',
      'مەحوی لە هەر شوێنێ بگەڕێ، ڕێگەی یەکە و ڕێبەر یەکە',
      'ئەوەی ئەو ڕێیە بزانێ، ناگەڕێتەوە بۆ ئەم زەمین'
    ].join('\n');

    var P4 = 'وشەکان تەنیا ئامرازی گوتن نین، ئەوان ماڵی بیرکردنەوەی گەلێکن. «ئاوەز» وشەیەکی ڕەسەنی کوردییە بۆ ئەو تواناییەی کە مرۆڤ پێی لە ڕاستی تێدەگات و بڕیار دەدات؛ ئەگەر زیاتر بەکاری بهێنین، پێویستمان بە وشەی بیانی کەمتر دەبێت.\n\nهەروەها وشەی «داڤین» لە هەندێک ناوچەدا دەبیسترێت؛ هیوادارم هاوڕێیان ماناو شێوەی بەکارهێنانی لە ناوچەی خۆیانەوە لە ژێر ئەم پۆستە بنووسن، با وشەکان وەک گەنجینەیەکی هاوبەش تۆمار بکەین.';

    var P5 = 'چاوگ لە زمانی کوردیدا بنەمای دروستکردنی کردارەکانە. لە چاوگی «نووسین» ڕەگی ڕانەبردوو «نووس» وەردەگیرێت و دەبێتە «دەنووسم، دەنووسی، دەنووسێت». هەمان شێوە لە «خوێندن» دەبێتە «دەخوێنم» و لە «کردن» دەبێتە «دەکەم».\n\nبۆ ژیریی دەستکرد، دۆزینەوەی ڕەگ و پاشگرەکان ڕێگەیەکی گرنگە بۆ شیکاریی ڕێزمانیی خۆکاری کوردی.';

    var P6 = 'بۆ ئەوەی مۆدێلە زمانییەکان کوردی باش فێر ببن، پێویستمان بە داتاسێتێکی یەکگرتووی UTF-8 هەیە. گرنگترین هەنگاو ئاساییکردنەوەی (normalization) پیتەکانە: «\u064A» و «ی» یان «\u0643» و «ک» نابێت وەک دوو پیتی جیاواز بژمێردرێن، چونکە کۆدی یونیکۆدیان جیاوازە.\n\nئەگەر هەموومان یەک شێواز بگرینەبەر، کۆرپەسی کراوەی کوردی زۆر پاکتر و بەکارهێنراوتر دەبێت.';

    var P7 = 'ئەلفوبێی لاتینیی کوردی (هاوار) لە ساڵی ١٩٣٢ لە گۆڤاری «هاوار»دا بڵاوکرایەوە. ئەمڕۆ زۆر کوردی ڕۆژئاوا و باکوور پێی دەنووسن، بەڵام لە باشوور و ڕۆژهەڵات بە پیتی عەرەبی-فارسی دەنووسرێت.\n\nئەم ئەپە هەوڵێکە بۆ ئەوەی هەر دوو شێوازەکە لە نزیکەوە ببینین: دوگمەی «لاتینی» لە ژێر هەر پۆستێک دەقەکە دەگۆڕێت.';

    var P8 = [
      'شەو درەنگانێ، چرای وشەم هەڵکرد لە دڵ',
      'نوورێکی نەرم بوو بە ڕێبەر بۆ ئەم مەنزڵ',
      '',
      'هەر وشەیەک کە لە ڕاستییەوە دێتە دەر',
      'دەبێتە گوڵێکی تازە لە باخی ئەم مەنزڵ'
    ].join('\n');

    function post(id, authorId, text, isPoetry, ago, likes, likedByMe, comments) {
      return {
        id: id, authorId: authorId, text: text, isPoetry: isPoetry, createdAt: now - ago,
        likes: likes, likedByMe: likedByMe, reposts: 0, repostedByMe: false,
        scriptMode: 'arab', comments: comments || [], media: []
      };
    }

    var posts = [
      post('p1', 'u_wali', P1, true, 35 * MIN, 42, false, [
        comment('c1a', 'u_zhila', 'بەیتی کۆتایی زۆر جوان بوو؛ وشە وەک ماڵی ڕۆح، ڕاستە.', 20 * MIN),
        comment('c1b', 'u_awat', 'ئەم بەیتانە دەتوانن ببنە بەشێک لە کۆرپەسی شیعری کوردی.', 12 * MIN)
      ]),
      post('p2', 'u_nali', P2, true, 2 * HOUR, 187, true, [
        comment('c2a', 'u_wali', 'سڵاو لەو ڕۆحە، وشەکانت هێشتا زیندوون.', 90 * MIN)
      ]),
      post('p3', 'u_mahwi', P3, true, 5 * HOUR, 96, true, []),
      post('p4', 'u_wali', P4, false, 9 * HOUR, 58, false, [
        comment('c4a', 'u_soran', 'وشەی «ئاوەز» لە ناوچەکەی ئێمەش بەکار دێت؛ لە ژێر ئەم پۆستە نموونەی زیاتر دەنووسم.', 6 * HOUR)
      ]),
      post('p5', 'u_soran', P5, false, 1 * DAY + 2 * HOUR, 73, true, [
        comment('c5a', 'u_wali', 'نموونەکانت زۆر ڕوونن، سوپاس سۆران گیان.', 20 * HOUR),
        comment('c5b', 'u_zhila', 'دەکرێت هەمان شێوە بۆ کردارە لێکدراوەکانیش دابنێین؟', 18 * HOUR)
      ]),
      post('p6', 'u_awat', P6, false, 2 * DAY + 3 * HOUR, 129, false, [
        comment('c6a', 'u_soran', 'ئاساییکردنەوە یەکەمین هەنگاوە؛ پاشان پێویستمان بە پاککردنەوەی ژمارە و نیشانەکانیش هەیە.', 2 * DAY),
        comment('c6b', 'u_wali', 'لە ڕێکخستنەکانەوە دەتوانن داتاکە بە JSONL داببەزێنن.', 2 * DAY - HOUR)
      ]),
      post('p7', 'u_zhila', P7, false, 4 * DAY, 64, false, []),
      post('p8', 'u_wali', P8, true, 6 * DAY, 31, false, [])
    ];

    var savedPostIds = ['p2', 'p5', 'p6'];

    function notif(id, type, actorId, postId, commentText, isFollowingBack, ago, read) {
      var actor = users.filter(function (u) { return u.id === actorId; })[0];
      var target = posts.filter(function (p) { return p.id === postId; })[0];
      return {
        id: id, type: type,
        actorName: actor.displayName, actorHandle: actor.username, actorAvatar: actor.avatar,
        postId: postId || null,
        postExcerpt: target ? excerpt(target.text, 64) : '',
        commentText: commentText || '',
        isFollowingBack: !!isFollowingBack,
        timestamp: now - ago, read: !!read
      };
    }

    var notifications = [
      notif('n1', 'LIKE', 'u_zhila', 'p1', '', false, 14 * MIN, false),
      notif('n2', 'COMMENT', 'u_soran', 'p4', 'وشەی «ئاوەز» لە ناوچەکەی ئێمەش بەکار دێت...', false, 6 * HOUR, false),
      notif('n3', 'FOLLOW', 'u_awat', null, '', false, 9 * HOUR, false),
      notif('n4', 'LIKE', 'u_nali', 'p8', '', false, 1 * DAY, true),
      notif('n5', 'COMMENT', 'u_awat', 'p1', 'ئەم بەیتانە دەتوانن ببنە بەشێک لە کۆرپەسی شیعری کوردی.', false, 1 * DAY + 3 * HOUR, true),
      notif('n6', 'FOLLOW', 'u_zhila', null, '', true, 3 * DAY, true)
    ];

    function msg(from, text, ago, status) {
      return { id: uid('m'), from: from, text: text, createdAt: now - ago, status: from === ME ? (status || 'read') : undefined };
    }

    var chats = [
      {
        id: 'c_soran', type: 'dm', name: 'سۆران کەمال', avatar: users[2].avatar,
        participantIds: ['u_soran'], online: true, unread: 1, muted: false, lastSeen: now - 2 * MIN,
        messages: [
          msg('u_soran', 'سڵاو والی، پۆستەکەی چاوگم خستە ژێر پێداچوونەوە. دەتوانین لەسەر ڕێزمانی کوردی هاوکاری یەکتر بین؟', 2 * DAY + 4 * HOUR),
          msg(ME, 'سڵاو سۆران گیان! بێگومان، زۆر دڵخۆش دەبم. ئامادەم ڕەگ و پاشگرەکان لە خشتەیەکدا کۆ بکەمەوە.', 2 * DAY + 3 * HOUR),
          msg('u_soran', 'زۆر باشە. هەفتەی داهاتوو لە ئەنجومەنی زمان باسی دەکەین.', 1 * DAY + 5 * HOUR),
          msg(ME, 'باشە، یادم دەکەوێتەوە.', 1 * DAY + 4 * HOUR),
          msg('u_soran', 'ئەمڕۆ چەند نموونەی نوێم دۆزییەوە، دواتر بۆت دەنێرم.', 25 * MIN)
        ]
      },
      {
        id: 'c_zhila', type: 'dm', name: 'ژیلە هەورامی', avatar: users[3].avatar,
        participantIds: ['u_zhila'], online: false, unread: 0, muted: false, lastSeen: now - 3 * HOUR,
        messages: [
          msg('u_zhila', 'بەیتەکانت زۆر جوان بوون، بەتایبەتی کۆتایی ئەو غەزەلە.', 1 * DAY + 6 * HOUR),
          msg(ME, 'سوپاس ژیلە گیان، دڵخۆشم کە پێت خۆش بووە.', 1 * DAY + 5 * HOUR),
          msg('u_zhila', 'دەمەوێ وەرگێڕانی لاتینیی هاوار بۆ هەندێک لە بەیتەکانت ئامادە بکەم، ڕێگەم دەدەیت؟', 1 * DAY + 4 * HOUR),
          msg(ME, 'بێگومان، ئەو دوگمەی «لاتینی»ی پۆستەکان بۆ هەمان مەبەستە.', 1 * DAY + 3 * HOUR)
        ]
      },
      {
        id: 'c_awat', type: 'dm', name: 'ئاوات ئەحمەد', avatar: users[4].avatar,
        participantIds: ['u_awat'], online: true, unread: 0, muted: false, lastSeen: now - 5 * MIN,
        messages: [
          msg('u_awat', 'سڵاو، دەتەوێ داتاسێتی پۆستەکانی مەکۆ بە JSONL ڕێک بخەین؟', 3 * DAY),
          msg(ME, 'بەڵێ، دوگمەی داگرتن لە ڕێکخستنەکان هەیە.', 3 * DAY - HOUR),
          msg('u_awat', 'ڕێک بوو! فایلەکەم تاقی کردەوە و ئەنجامەکە زۆر باش بوو.', 8 * HOUR)
        ]
      },
      {
        id: 'g_lang', type: 'group', name: 'ئەنجومەنی زمان و ژیریی دەستکردی کوردی', avatar: makeAvatar('ئەنجومەنی زمان و ژیریی دەستکردی کوردی', 'g_lang'),
        participantIds: ['u_awat', 'u_soran', 'u_zhila'], online: false, unread: 2, muted: false, lastSeen: 0,
        messages: [
          msg('u_awat', 'بەخێربێن بۆ ئەنجومەن. ئامانج کۆکردنەوەی داتای ئاسایی و یەکگرتووی کوردییە.', 4 * DAY),
          msg('u_soran', 'پێشنیار دەکەم یەکەم هەنگاو لیستی ئەو پیتانە بێت کە بە شێوازی جیاواز نووسراون.', 4 * DAY - 2 * HOUR),
          msg('u_zhila', 'منیش دەتوانم نموونەی لاتینیی هاوار ڕێک بخەم.', 4 * DAY - 3 * HOUR),
          msg(ME, 'زۆر باشە. با هەر کەسێک بەشێک وەربگرێت.', 3 * DAY + 20 * HOUR),
          msg('u_awat', 'ئەرکەکان دابەش کران؛ دوێنێ بە جوانی کارمان کرد.', 1 * DAY + 2 * HOUR),
          msg('u_soran', 'هەفتەی داهاتوو کۆبوونەوەیەکی کورتمان دەبێت لەسەر ڕێساکانی ئاساییکردن.', 4 * HOUR)
        ]
      },
      {
        id: 'g_diwan', type: 'group', name: 'دیوانی شیعری کلاسیک', avatar: makeAvatar('دیوانی شیعری کلاسیک', 'g_diwan'),
        participantIds: ['u_nali', 'u_mahwi', 'u_zhila'], online: false, unread: 0, muted: false, lastSeen: 0,
        messages: [
          msg('u_nali', 'ئەمشەو بەیتێکی نوێم لەسەر دووریی یار نووسی.', 5 * DAY),
          msg('u_mahwi', 'دەبێ لەگەڵ پاراستنی کۆن، ڕەنگی ئەم سەردەمیشی تێدا بێت.', 5 * DAY - HOUR),
          msg('u_zhila', 'ڕاستە، شیعر دەبێ لە ڕۆحی ئەمڕۆدا هەناسە بدات.', 5 * DAY - 2 * HOUR),
          msg(ME, 'پێشنیار دەکەم هەفتانە یەک غەزەل بخوێنینەوە و باسی بکەین.', 4 * DAY + 20 * HOUR),
          msg('u_mahwi', 'پێشنیارێکی جوانە؛ پشتگیری دەکەم.', 4 * DAY + 18 * HOUR)
        ]
      }
    ];

    return {
      version: 2,
      currentUser: currentUser,
      users: users,
      posts: posts,
      savedPostIds: savedPostIds,
      notifications: notifications,
      chats: chats,
      following: ['u_nali', 'u_mahwi', 'u_zhila', 'u_soran'],
      theme: 'system',
      viewingUserHandle: currentUser.username,
      draft: null,
      settings: Object.assign({}, DEFAULT_SETTINGS),
      incomingCursor: 0
    };
  }

  /* Posts that "arrive" while the person is on the home feed (drives #new-posts-pill) */
  var INCOMING_POOL = [
    {
      id: 'p_in_1', authorId: 'u_soran', isPoetry: false, likes: 12,
      text: 'پرسیار بۆ هاوڕێیان: لە کوردیدا بۆ وشەی «کۆمپیوتەر» کام هاوتای ڕەسەنتان پێ باشترە؟ پێشنیارەکانتان لە ژێر ئەم پۆستە بنووسن.'
    },
    {
      id: 'p_in_2', authorId: 'u_mahwi', isPoetry: true, likes: 40,
      text: ['ئەی دڵی بێ ئارام، تا کەی لەم جیهانە بێ قەرار', 'ئاشتی لە ناخی خۆتدایە، مەگەڕێ بەدوای هیچ یار'].join('\n')
    },
    {
      id: 'p_in_3', authorId: 'u_awat', isPoetry: false, likes: 25,
      text: 'دەستپێکی کۆکردنەوەی داتاسێتی کراوە: ئەگەر پۆستێک بە کوردییەکی ڕوون و پاک نووسرا، دەتوانیت لە ڕێکخستنەکانەوە هەموو پۆستەکان بە JSONL دابەزێنیت.'
    }
  ];

  function isValidState(s) {
    return !!s && typeof s === 'object' && s.currentUser && typeof s.currentUser.id === 'string' &&
      Array.isArray(s.posts) && Array.isArray(s.users) && Array.isArray(s.chats) &&
      Array.isArray(s.notifications) && Array.isArray(s.savedPostIds) && Array.isArray(s.following);
  }

  function sanitizeState(s) {
    s.settings = Object.assign({}, DEFAULT_SETTINGS, s.settings || {});
    s.theme = ['light', 'dark', 'system'].indexOf(s.theme) >= 0 ? s.theme : 'system';
    s.viewingUserHandle = s.viewingUserHandle || s.currentUser.username;
    s.draft = s.draft && typeof s.draft === 'object' ? s.draft : null;
    s.incomingCursor = Number(s.incomingCursor) || 0;
    s.posts.forEach(function (p) {
      p.comments = Array.isArray(p.comments) ? p.comments : [];
      p.media = Array.isArray(p.media) ? p.media : [];
      p.likes = Number(p.likes) || 0;
      p.reposts = Number(p.reposts) || 0;
      p.scriptMode = p.scriptMode === 'latin' ? 'latin' : 'arab';
      p.isPoetry = !!p.isPoetry;
    });
    s.chats.forEach(function (c) {
      c.messages = Array.isArray(c.messages) ? c.messages : [];
      c.unread = Number(c.unread) || 0;
      c.participantIds = Array.isArray(c.participantIds) ? c.participantIds : [];
    });
    return s;
  }

  function loadState() {
    var parsed = null;
    try {
      var raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) parsed = JSON.parse(raw);
    } catch (e) {
      parsed = null;
    }
    if (!isValidState(parsed)) {
      var seed = buildSeedState();
      try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seed)); } catch (e2) { /* ignore */ }
      return seed;
    }
    return sanitizeState(parsed);
  }

  var quotaWarned = false;
  function saveState() {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      if (!quotaWarned) {
        quotaWarned = true;
        toast('شوێنی هەڵگرتن پڕ بووە؛ هەندێک گۆڕانکاری ڕەنگە پاشەکەوت نەکرابێت.', 'error');
      }
    }
    updateJsonLd();
  }

  /* ==========================================================================
   * 3. DOM CACHE + UI STATE
   * ======================================================================== */
  var dom = {};
  var ui = {
    currentView: null,
    renderedHandle: null,
    history: [],
    feedTab: 'for-you',
    feedVisible: FEED_PAGE_SIZE,
    loadingMore: false,
    profileTab: 'posts',
    notifFilter: 'all',
    activeChatId: null,
    pendingReplies: {},
    pendingPosts: [],
    drawerOpen: false,
    popupCleanup: null,
    incomingTimer: null,
    lastReply: {},
    resetArmed: false,
    resetTimer: null,
    bodyLocks: 0
  };

  function cacheDom() {
    [
      'sidebar-drawer', 'sidebar-backdrop', 'sidebar-panel', 'sidebar-close', 'sidebar-avatar', 'sidebar-display-name',
      'sidebar-handle', 'sidebar-following-count', 'sidebar-followers-count', 'theme-toggle',
      'main-content', 'feed-refresh', 'feed-tabs', 'feed-tab-for-you', 'feed-tab-following', 'new-posts-pill',
      'home-composer-avatar', 'home-composer-trigger', 'home-composer-image',
      'feed-list', 'feed-skeleton', 'feed-empty', 'feed-empty-create', 'feed-error', 'feed-retry',
      'feed-sentinel', 'feed-loading-more', 'feed-end',
      'profile-back', 'profile-skeleton', 'profile-posts-count', 'profile-header-title', 'profile-avatar',
      'profile-edit-btn', 'profile-message-btn', 'profile-follow-btn', 'profile-display-name', 'profile-verified',
      'profile-handle', 'profile-bio', 'profile-location-wrap', 'profile-location', 'profile-joined',
      'profile-following-btn', 'profile-followers-btn', 'profile-following-count', 'profile-followers-count',
      'profile-tabs', 'profile-posts-list', 'profile-empty',
      'saved-back', 'saved-list', 'saved-skeleton', 'saved-empty',
      'settings-back', 'settings-edit-profile', 'setting-notif-likes', 'setting-notif-replies', 'setting-notif-follows',
      'setting-notif-messages', 'setting-private-account', 'setting-read-receipts',
      'chat-list', 'chat-list-skeleton', 'chat-list-empty', 'chat-list-no-results', 'chat-search',
      'chat-room-avatar', 'chat-room-online-dot', 'chat-room-name', 'chat-room-status', 'chat-room-profile',
      'chat-room-menu', 'chat-back', 'chat-messages', 'chat-messages-skeleton', 'chat-scroll-bottom', 'chat-typing',
      'chat-form', 'chat-emoji-btn', 'chat-input', 'chat-send',
      'notif-mark-all', 'notif-tabs', 'notif-list', 'notif-skeleton', 'notif-empty', 'notif-badge',
      'bottom-bar', 'nav-home', 'nav-notifications', 'nav-create', 'nav-chat', 'nav-menu', 'bottom-avatar',
      'creator-canvas', 'creator-close', 'creator-submit', 'creator-avatar', 'creator-textarea', 'creator-media-grid',
      'creator-file-input', 'creator-add-image', 'creator-add-emoji', 'creator-add-location', 'creator-char-count',
      'creator-counter-progress', 'creator-discard-sheet', 'creator-discard-confirm', 'creator-save-draft',
      'creator-discard-cancel',
      'edit-profile-modal', 'edit-profile-backdrop', 'edit-profile-close', 'edit-profile-form', 'edit-display-name',
      'edit-name-count', 'edit-name-error', 'edit-username', 'edit-username-count', 'edit-username-error',
      'edit-username-hint', 'edit-bio', 'edit-bio-count', 'edit-country', 'edit-city', 'edit-profile-cancel',
      'edit-profile-save',
      'toast-region', 'meko-jsonld'
    ].forEach(function (id) { dom[camel(id)] = byId(id); });
    dom.views = $$('.app-view');
  }

  /* ==========================================================================
   * 4. DATA ACCESS HELPERS
   * ======================================================================== */
  function fallbackUser() {
    return { id: 'u_unknown', displayName: 'بەکارهێنەری نەناسراو', username: 'unknown', avatar: makeAvatar('؟', 'unknown'), verified: false };
  }
  function getUserById(id) {
    if (state.currentUser.id === id) return state.currentUser;
    for (var i = 0; i < state.users.length; i++) if (state.users[i].id === id) return state.users[i];
    return null;
  }
  function getUserByHandle(handle) {
    var h = String(handle || '').toLowerCase();
    if (state.currentUser.username.toLowerCase() === h) return state.currentUser;
    for (var i = 0; i < state.users.length; i++) if (state.users[i].username.toLowerCase() === h) return state.users[i];
    return null;
  }
  function getPostById(id) {
    for (var i = 0; i < state.posts.length; i++) if (state.posts[i].id === id) return state.posts[i];
    return null;
  }
  function getChat(id) {
    for (var i = 0; i < state.chats.length; i++) if (state.chats[i].id === id) return state.chats[i];
    return null;
  }
  function sortedPosts() {
    return state.posts.slice().sort(function (a, b) { return b.createdAt - a.createdAt; });
  }
  function isFollowing(userId) { return state.following.indexOf(userId) >= 0; }
  function locationText(u) { return [u.city, u.country].filter(Boolean).join('، '); }

  function toggleFollow(userId, force) {
    var u = getUserById(userId);
    if (!u || userId === state.currentUser.id) return false;
    var now = typeof force === 'boolean' ? force : !isFollowing(userId);
    var was = isFollowing(userId);
    if (now && !was) {
      state.following.push(userId);
      state.currentUser.followingCount = (state.currentUser.followingCount || 0) + 1;
      u.followersCount = (u.followersCount || 0) + 1;
    } else if (!now && was) {
      state.following = state.following.filter(function (id) { return id !== userId; });
      state.currentUser.followingCount = Math.max(0, (state.currentUser.followingCount || 0) - 1);
      u.followersCount = Math.max(0, (u.followersCount || 0) - 1);
    }
    state.notifications.forEach(function (n) {
      if (n.type === 'FOLLOW' && n.actorHandle === u.username) n.isFollowingBack = now;
    });
    saveState();
    updateSidebar();
    return now;
  }

  /* ==========================================================================
   * 5. TOASTS
   * ======================================================================== */
  function toast(message, type) {
    var region = dom.toastRegion;
    var tpl = byId('tpl-toast');
    if (!region || !tpl) return;
    var node = tpl.content.firstElementChild.cloneNode(true);
    var icons = { success: 'circle-check', error: 'circle-alert', info: 'info' };
    $('.toast-icon', node).setAttribute('data-lucide', icons[type] || 'info');
    $('.toast-message', node).textContent = message;
    node.classList.add('transition-all', 'duration-300', 'opacity-0', '-translate-y-2');
    region.appendChild(node);
    while (region.children.length > 3) region.removeChild(region.firstElementChild);
    refreshIcons();
    requestAnimationFrame(function () {
      requestAnimationFrame(function () { node.classList.remove('opacity-0', '-translate-y-2'); });
    });
    setTimeout(function () {
      node.classList.add('opacity-0', '-translate-y-2');
      setTimeout(function () { if (node.parentNode) node.parentNode.removeChild(node); }, 320);
    }, 2600);
  }

  /* ==========================================================================
   * 6. THEME
   * ======================================================================== */
  function isDarkEffective() {
    if (state.theme === 'dark') return true;
    if (state.theme === 'light') return false;
    return !!(window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
  }

  function applyTheme() {
    var dark = isDarkEffective();
    [document.documentElement, document.body].forEach(function (el) {
      el.classList.toggle('dark', dark);
      el.classList.toggle('light', !dark);
    });
    document.documentElement.style.colorScheme = dark ? 'dark' : 'light';
    if (dom.themeToggle) dom.themeToggle.setAttribute('aria-checked', String(dark));
    $$('input[name="theme"]').forEach(function (r) { r.checked = r.value === state.theme; });
    var meta = $('meta[name="theme-color"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('name', 'theme-color');
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', dark ? '#0d1218' : '#ffffff');
  }

  function setTheme(theme) {
    state.theme = theme;
    saveState();
    applyTheme();
  }

  /* ==========================================================================
   * 7. BODY LOCK, POPUPS (menu / emoji), FOCUS TRAP
   * ======================================================================== */
  function lockBody(lock) {
    ui.bodyLocks = Math.max(0, ui.bodyLocks + (lock ? 1 : -1));
    document.body.style.overflow = ui.bodyLocks > 0 ? 'hidden' : '';
  }

  function closePopup() {
    if (ui.popupCleanup) {
      var fn = ui.popupCleanup;
      ui.popupCleanup = null;
      fn();
    }
  }

  function openPopup(panel, anchor, opts) {
    closePopup();
    opts = opts || {};
    document.body.appendChild(panel);
    panel.style.position = 'fixed';
    panel.style.zIndex = '65';
    function position() {
      var r = anchor.getBoundingClientRect();
      var pw = panel.offsetWidth, ph = panel.offsetHeight;
      var left = clamp(opts.alignEnd ? r.right - pw : r.left, 8, Math.max(8, window.innerWidth - pw - 8));
      var top;
      if (opts.above) top = r.top - ph - 8;
      else top = r.bottom + 6;
      if (top + ph > window.innerHeight - 8) top = r.top - ph - 6;
      if (top < 8) top = 8;
      panel.style.left = left + 'px';
      panel.style.top = top + 'px';
    }
    position();
    function onDown(e) { if (!panel.contains(e.target) && !anchor.contains(e.target)) closePopup(); }
    function onScroll() { closePopup(); }
    setTimeout(function () { document.addEventListener('pointerdown', onDown, true); }, 0);
    window.addEventListener('scroll', onScroll, true);
    window.addEventListener('resize', onScroll);
    ui.popupCleanup = function () {
      document.removeEventListener('pointerdown', onDown, true);
      window.removeEventListener('scroll', onScroll, true);
      window.removeEventListener('resize', onScroll);
      if (panel.parentNode) panel.parentNode.removeChild(panel);
    };
    return position;
  }

  /** Generic dropdown menu. items: [{label, icon, danger, keepOpen, onClick(ctrl)}] */
  function showMenu(anchor, items, opts) {
    var panel = document.createElement('div');
    panel.setAttribute('role', 'menu');
    panel.className = 'min-w-[200px] overflow-hidden rounded-2xl bg-white py-1 shadow-2xl ring-1 ring-slate-200 dark:bg-night-800 dark:ring-white/10';
    var position;
    var ctrl = {
      close: closePopup,
      setItems: build
    };
    function build(list) {
      panel.textContent = '';
      list.forEach(function (item) {
        var b = document.createElement('button');
        b.type = 'button';
        b.setAttribute('role', 'menuitem');
        b.className = 'flex w-full items-center gap-3 px-4 py-2.5 text-start text-sm font-semibold transition hover:bg-slate-100 dark:hover:bg-white/10 ' +
          (item.danger ? 'text-rose-500' : 'text-slate-700 dark:text-slate-200');
        if (item.icon) {
          var ic = document.createElement('i');
          ic.setAttribute('data-lucide', item.icon);
          ic.className = 'h-4 w-4 shrink-0';
          b.appendChild(ic);
        }
        var sp = document.createElement('span');
        sp.textContent = item.label;
        b.appendChild(sp);
        b.addEventListener('click', function () {
          if (!item.keepOpen) closePopup();
          if (item.onClick) item.onClick(ctrl);
        });
        panel.appendChild(b);
      });
      refreshIcons();
      if (position) position();
    }
    build(items);
    position = openPopup(panel, anchor, opts || { alignEnd: false });
    return ctrl;
  }

  function showEmojiPicker(anchor, target) {
    var panel = document.createElement('div');
    panel.className = 'grid grid-cols-7 gap-1 rounded-2xl bg-white p-2 shadow-2xl ring-1 ring-slate-200 dark:bg-night-800 dark:ring-white/10';
    panel.setAttribute('role', 'listbox');
    panel.setAttribute('aria-label', 'ئیمۆجی');
    EMOJIS.forEach(function (em) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'inline-flex h-9 w-9 items-center justify-center rounded-xl text-xl transition hover:bg-slate-100 active:scale-90 dark:hover:bg-white/10';
      b.textContent = em;
      b.addEventListener('click', function () {
        var start = typeof target.selectionStart === 'number' ? target.selectionStart : target.value.length;
        var end = typeof target.selectionEnd === 'number' ? target.selectionEnd : target.value.length;
        target.setRangeText(em, start, end, 'end');
        target.dispatchEvent(new Event('input', { bubbles: true }));
        target.focus();
      });
      panel.appendChild(b);
    });
    openPopup(panel, anchor, { above: true, alignEnd: false });
  }

  function trapTab(e, container) {
    if (!container) return;
    var focusables = $$('a[href],button:not([disabled]),input:not([disabled]):not([type="hidden"]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])', container)
      .filter(function (el) { return el.offsetParent !== null; });
    if (!focusables.length) return;
    var first = focusables[0];
    var last = focusables[focusables.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }

  async function copyText(text) {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        return true;
      }
    } catch (e) { /* fall back below */ }
    try {
      var ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.cssText = 'position:fixed;top:-1000px;opacity:0';
      document.body.appendChild(ta);
      ta.select();
      var ok = document.execCommand('copy');
      ta.parentNode.removeChild(ta);
      return ok;
    } catch (e2) {
      return false;
    }
  }

  /* ==========================================================================
   * 8. IMAGE COMPRESSION (FileReader + offscreen canvas)
   * ======================================================================== */
  function readFileAsDataURL(file) {
    return new Promise(function (resolve, reject) {
      var r = new FileReader();
      r.onload = function () { resolve(r.result); };
      r.onerror = function () { reject(r.error || new Error('read-failed')); };
      r.readAsDataURL(file);
    });
  }
  function loadImage(src) {
    return new Promise(function (resolve, reject) {
      var img = new Image();
      img.onload = function () { resolve(img); };
      img.onerror = function () { reject(new Error('image-failed')); };
      img.src = src;
    });
  }
  async function compressImage(file, opts) {
    var dataUrl = await readFileAsDataURL(file);
    var img = await loadImage(dataUrl);
    var w = img.naturalWidth || img.width;
    var h = img.naturalHeight || img.height;
    var canvas = document.createElement('canvas');
    var ctx = canvas.getContext('2d');
    var max = opts.max;
    if (opts.square) {
      canvas.width = max;
      canvas.height = max;
      var side = Math.min(w, h);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, max, max);
      ctx.drawImage(img, (w - side) / 2, (h - side) / 2, side, side, 0, 0, max, max);
    } else {
      var scale = Math.min(1, max / Math.max(w, h));
      canvas.width = Math.max(1, Math.round(w * scale));
      canvas.height = Math.max(1, Math.round(h * scale));
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    }
    return canvas.toDataURL('image/jpeg', opts.quality);
  }

  /* ==========================================================================
   * 9. VIEW ROUTER, SKELETONS, BOTTOM BAR, SIDEBAR DRAWER
   * ======================================================================== */
  function hideSkeletons() {
    ['feed-skeleton', 'profile-skeleton', 'saved-skeleton', 'chat-list-skeleton', 'chat-messages-skeleton', 'notif-skeleton'].forEach(function (id) {
      var el = byId(id);
      if (el) el.classList.add('hidden');
    });
    if (dom.feedList) dom.feedList.setAttribute('aria-busy', 'false');
  }

  function updateNavCurrent(view) {
    var map = { 'home': 'navHome', 'notifications': 'navNotifications', 'chat-list': 'navChat', 'chat-room': 'navChat' };
    ['navHome', 'navNotifications', 'navChat'].forEach(function (key) {
      var b = dom[key];
      if (!b) return;
      if (map[view] === key) b.setAttribute('aria-current', 'page');
      else b.removeAttribute('aria-current');
    });
  }

  function renderView(view) {
    switch (view) {
      case 'home': renderFeed(); break;
      case 'profile': renderProfile(); break;
      case 'saved': renderSaved(); break;
      case 'settings': syncSettingsUI(); break;
      case 'chat-list': renderChatList(); break;
      case 'chat-room': renderChatRoom(); break;
      case 'notifications': renderNotifications(); break;
      default: break;
    }
  }

  function navigateTo(view, opts) {
    opts = opts || {};
    if (VIEWS.indexOf(view) === -1) view = 'home';
    if (view === 'chat-room' && !getChat(ui.activeChatId)) view = 'chat-list';
    if (ui.drawerOpen) closeDrawer(false);
    closePopup();

    var prev = ui.currentView;
    if (!opts.back && !opts.initial && prev && (prev !== view || view === 'profile')) {
      ui.history.push({ view: prev, handle: ui.renderedHandle });
      if (ui.history.length > 15) ui.history.shift();
    }

    dom.views.forEach(function (sec) {
      var name = sec.getAttribute('data-view');
      var active = name === view;
      sec.classList.toggle('hidden', !active);
      if (name === 'chat-room') sec.classList.toggle('flex', active);
    });
    if (dom.bottomBar) dom.bottomBar.classList.toggle('hidden', view === 'chat-room');

    ui.currentView = view;
    updateNavCurrent(view);
    hideSkeletons();
    renderView(view);
    refreshIcons();
    if (view !== 'chat-room') window.scrollTo({ top: 0, behavior: 'auto' });
  }

  function goBack() {
    var entry = ui.history.pop();
    if (!entry) { navigateTo('home', { back: true }); return; }
    if (entry.view === 'profile' && entry.handle) state.viewingUserHandle = entry.handle;
    navigateTo(entry.view, { back: true });
  }

  function openDrawer() {
    var d = dom.sidebarDrawer;
    if (!d) return;
    d.setAttribute('data-state', 'open');
    d.setAttribute('aria-hidden', 'false');
    d.classList.add('drawer-open');
    d.classList.remove('drawer-closed');
    document.body.classList.add('drawer-lock');
    dom.navMenu.setAttribute('aria-expanded', 'true');
    ui.drawerOpen = true;
    setTimeout(function () { if (dom.sidebarClose) dom.sidebarClose.focus(); }, 60);
  }

  function closeDrawer(restoreFocus) {
    var d = dom.sidebarDrawer;
    if (!d) return;
    d.setAttribute('data-state', 'closed');
    d.setAttribute('aria-hidden', 'true');
    d.classList.remove('drawer-open');
    d.classList.add('drawer-closed');
    document.body.classList.remove('drawer-lock');
    dom.navMenu.setAttribute('aria-expanded', 'false');
    var wasOpen = ui.drawerOpen;
    ui.drawerOpen = false;
    if (wasOpen && restoreFocus !== false) dom.navMenu.focus();
  }

  function updateSidebar() {
    var u = state.currentUser;
    dom.sidebarAvatar.src = u.avatar || BLANK_IMG;
    dom.sidebarAvatar.alt = u.displayName;
    dom.sidebarDisplayName.textContent = u.displayName;
    dom.sidebarHandle.textContent = '@' + u.username;
    dom.sidebarFollowingCount.textContent = fmtCount(u.followingCount);
    dom.sidebarFollowersCount.textContent = fmtCount(u.followersCount);
  }

  /** Keeps the current user's name/avatar in sync across every place it appears. */
  function syncCurrentUserUI() {
    var u = state.currentUser;
    updateSidebar();
    dom.bottomAvatar.src = u.avatar || BLANK_IMG;
    dom.bottomAvatar.alt = u.displayName;
    dom.homeComposerAvatar.src = u.avatar || BLANK_IMG;
    dom.homeComposerAvatar.alt = u.displayName;
    dom.creatorAvatar.src = u.avatar || BLANK_IMG;
    dom.creatorAvatar.alt = u.displayName;
  }

  function updateBadges() {
    var count = state.notifications.filter(function (n) { return !n.read && isNotifTypeEnabled(n.type); }).length;
    var b = dom.notifBadge;
    if (b) {
      b.textContent = count > 9 ? toKu(9) + '+' : toKu(count);
      setShown(b, count > 0);
    }
    var chatBadge = byId('chat-badge');
    if (!chatBadge && dom.navChat) {
      chatBadge = document.createElement('span');
      chatBadge.id = 'chat-badge';
      chatBadge.className = 'absolute end-1 top-1 hidden min-w-[18px] rounded-full bg-rose-500 px-1 text-center text-[10px] font-bold leading-[18px] text-white ring-2 ring-white dark:ring-night-800';
      chatBadge.setAttribute('aria-live', 'polite');
      dom.navChat.appendChild(chatBadge);
    }
    if (chatBadge) {
      var unread = state.settings.notifMessages
        ? state.chats.reduce(function (s, c) { return s + (c.muted ? 0 : (c.unread || 0)); }, 0)
        : 0;
      chatBadge.textContent = unread > 9 ? toKu(9) + '+' : toKu(unread);
      setShown(chatBadge, unread > 0);
    }
  }

  /* ==========================================================================
   * 10. POST RENDERING (#tpl-post), POETRY MODE, SCRIPT CONVERTER, COMMENTS
   * ======================================================================== */
  function applyPostScript(textEl, post) {
    if (post.scriptMode === 'latin') {
      var latin = toLatin(post.text);
      if (latin != null) {
        textEl.textContent = latin;
        textEl.setAttribute('dir', 'ltr');
        textEl.setAttribute('lang', 'ku-Latn');
        return;
      }
      post.scriptMode = 'arab';
    }
    textEl.textContent = post.text;
    textEl.setAttribute('dir', 'rtl');
    textEl.setAttribute('lang', 'ckb');
  }

  function buildScriptButton(post) {
    var b = document.createElement('button');
    b.type = 'button';
    b.setAttribute('data-action', 'toggle-script');
    b.className = 'script-toggle inline-flex items-center gap-1.5 rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-xs font-bold text-brand-700 transition hover:bg-brand-100 active:scale-95 aria-pressed:border-brand-600 aria-pressed:bg-brand-600 aria-pressed:text-white dark:border-white/15 dark:bg-white/10 dark:text-brand-300 dark:hover:bg-white/15';
    b.innerHTML = '<i data-lucide="languages" class="h-3.5 w-3.5"></i><span class="script-label"></span>';
    updateScriptButton(b, post.scriptMode);
    return b;
  }

  function updateScriptButton(btn, mode) {
    var latin = mode === 'latin';
    $('.script-label', btn).textContent = latin ? 'ئارامی' : 'لاتینی';
    btn.setAttribute('aria-pressed', String(latin));
    btn.setAttribute('aria-label', latin ? 'گەڕانەوە بۆ نووسینی ئارامی' : 'گۆڕین بۆ نووسینی لاتینی (هاوار)');
  }

  function buildCommentItem(c) {
    var author = getUserById(c.authorId) || fallbackUser();
    var li = document.createElement('li');
    li.className = 'flex gap-2.5';
    var img = document.createElement('img');
    img.className = 'h-8 w-8 shrink-0 rounded-full bg-slate-200 object-cover dark:bg-night-700';
    img.src = author.avatar || BLANK_IMG;
    img.alt = '';
    var body = document.createElement('div');
    body.className = 'min-w-0 flex-1';
    var head = document.createElement('div');
    head.className = 'flex flex-wrap items-center gap-x-1.5 text-xs';
    var name = document.createElement('strong');
    name.className = 'font-extrabold';
    name.textContent = author.displayName;
    var handle = document.createElement('span');
    handle.className = 'text-slate-500 dark:text-slate-400';
    handle.setAttribute('dir', 'ltr');
    handle.textContent = '@' + author.username;
    var time = document.createElement('span');
    time.className = 'text-slate-400';
    time.textContent = '· ' + relTime(c.createdAt);
    head.append(name, handle, time);
    var p = document.createElement('p');
    p.className = 'mt-0.5 whitespace-pre-wrap break-words text-sm leading-6';
    p.setAttribute('dir', 'auto');
    p.textContent = c.text;
    body.append(head, p);
    li.append(img, body);
    return li;
  }

  function fillComments(list, post) {
    list.textContent = '';
    if (!post.comments.length) {
      var empty = document.createElement('li');
      empty.className = 'post-comments-empty py-1 text-center text-xs text-slate-500 dark:text-slate-400';
      empty.textContent = 'هێشتا هیچ لێدوانێک نییە؛ یەکەم کەس بە.';
      list.appendChild(empty);
      return;
    }
    post.comments.forEach(function (c) { list.appendChild(buildCommentItem(c)); });
  }

  function buildCommentsDrawer(post) {
    var wrap = document.createElement('div');
    wrap.className = 'post-comments-drawer hidden mt-3 rounded-2xl border border-slate-200 bg-slate-50/70 p-3 dark:border-white/10 dark:bg-white/5';
    var list = document.createElement('ul');
    list.className = 'post-comments-list space-y-3';
    fillComments(list, post);

    var form = document.createElement('form');
    form.className = 'post-comment-form mt-3 flex items-center gap-2';
    form.setAttribute('autocomplete', 'off');
    var input = document.createElement('input');
    input.type = 'text';
    input.className = 'post-comment-input min-w-0 flex-1 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/15 dark:border-white/15 dark:bg-night-800';
    input.placeholder = 'لێدوانێک بنووسە...';
    input.setAttribute('dir', 'auto');
    input.setAttribute('aria-label', 'نووسینی لێدوان');
    input.maxLength = 300;
    var btn = document.createElement('button');
    btn.type = 'submit';
    btn.disabled = true;
    btn.className = 'post-comment-send shrink-0 rounded-full bg-brand-600 px-4 py-2 text-sm font-bold text-white transition active:scale-95 disabled:cursor-not-allowed disabled:opacity-50';
    btn.textContent = 'ناردن';
    form.append(input, btn);
    wrap.append(list, form);
    return wrap;
  }

  function renderPost(post) {
    var tpl = byId('tpl-post');
    var card = tpl.content.firstElementChild.cloneNode(true);
    var author = getUserById(post.authorId) || fallbackUser();
    card.setAttribute('data-post-id', post.id);

    $('.post-avatar-btn', card).setAttribute('aria-label', 'پرۆفایلی ' + author.displayName);
    var img = $('.post-avatar', card);
    img.src = author.avatar || BLANK_IMG;
    img.alt = '';
    $('.post-author', card).textContent = author.displayName;
    $('.post-verified', card).classList.toggle('hidden', !author.verified);
    $('.post-handle', card).textContent = '@' + author.username;
    var time = $('.post-time', card);
    time.textContent = relTime(post.createdAt);
    time.setAttribute('datetime', new Date(post.createdAt).toISOString());
    time.title = fmtDate(post.createdAt, true) + ' · ' + fmtClock(post.createdAt);

    var textEl = $('.post-text', card);
    textEl.classList.add(post.isPoetry ? 'text-poetry' : 'text-prose');
    applyPostScript(textEl, post);

    var mediaEl = $('.post-media', card);
    var media = Array.isArray(post.media) ? post.media : [];
    if (media.length) {
      mediaEl.classList.remove('hidden');
      mediaEl.classList.add('grid');
      media.forEach(function (src, i) {
        var im = document.createElement('img');
        im.src = src;
        im.alt = 'وێنەی پۆست';
        im.loading = 'lazy';
        if (media.length === 1) im.className = 'col-span-2 max-h-96 w-full object-cover';
        else if (media.length === 3 && i === 0) im.className = 'col-span-2 aspect-video w-full object-cover';
        else im.className = 'aspect-square w-full object-cover';
        mediaEl.appendChild(im);
      });
    }

    $('.post-reply-count', card).textContent = fmtCount(post.comments.length);
    var like = $('[data-action="like"]', card);
    like.setAttribute('aria-pressed', String(!!post.likedByMe));
    $('.post-like-count', like).textContent = fmtCount(post.likes);
    $('[data-action="bookmark"]', card).setAttribute('aria-pressed', String(state.savedPostIds.indexOf(post.id) >= 0));

    var repostBtn = $('[data-action="repost"]', card);
    if (repostBtn) repostBtn.replaceWith(buildScriptButton(post));

    var actions = $('.post-actions', card);
    actions.after(buildCommentsDrawer(post));
    return card;
  }

  function appendPosts(container, posts) {
    var frag = document.createDocumentFragment();
    posts.forEach(function (p) { frag.appendChild(renderPost(p)); });
    container.appendChild(frag);
  }

  /* ---- post interactions ---- */
  function toggleLike(post, btn) {
    post.likedByMe = !post.likedByMe;
    post.likes = Math.max(0, post.likes + (post.likedByMe ? 1 : -1));
    btn.setAttribute('aria-pressed', String(post.likedByMe));
    $('.post-like-count', btn).textContent = fmtCount(post.likes);
    var svg = $('svg', btn);
    if (svg && svg.animate) svg.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.35)' }, { transform: 'scale(1)' }], { duration: 240 });
    saveState();
  }

  function toggleBookmark(post, btn) {
    var i = state.savedPostIds.indexOf(post.id);
    var nowSaved = i < 0;
    if (nowSaved) state.savedPostIds.unshift(post.id);
    else state.savedPostIds.splice(i, 1);
    btn.setAttribute('aria-pressed', String(nowSaved));
    saveState();
    toast(nowSaved ? 'پۆستەکە پاشەکەوت کرا' : 'پۆستەکە لە پاشەکەوتکراوەکان لابرا', 'success');
    if (ui.currentView === 'saved') renderSaved();
  }

  function toggleScript(post, card, btn) {
    if (post.scriptMode !== 'latin' && toLatin(post.text) == null) {
      toast('گۆڕینی نووسین بۆ لاتینی ئێستا بەردەست نییە.', 'error');
      return;
    }
    post.scriptMode = post.scriptMode === 'latin' ? 'arab' : 'latin';
    applyPostScript($('.post-text', card), post);
    updateScriptButton(btn, post.scriptMode);
    saveState();
  }

  function toggleCommentsDrawer(card, btn) {
    var drawer = $('.post-comments-drawer', card);
    if (!drawer) return;
    var open = drawer.classList.contains('hidden');
    drawer.classList.toggle('hidden', !open);
    btn.setAttribute('aria-expanded', String(open));
    if (open) {
      var input = $('.post-comment-input', drawer);
      if (input) setTimeout(function () { input.focus({ preventScroll: true }); }, 30);
    }
  }

  function submitComment(post, card, form) {
    var input = $('.post-comment-input', form);
    var text = normalizeText(input.value).trim();
    if (!text) return;
    post.comments.push({ id: uid('c'), authorId: state.currentUser.id, text: text, createdAt: Date.now() });
    input.value = '';
    $('.post-comment-send', form).disabled = true;
    fillComments($('.post-comments-list', card), post);
    $('.post-reply-count', card).textContent = fmtCount(post.comments.length);
    saveState();
    toast('لێدوانەکەت نێردرا', 'success');
  }

  function deletePost(post) {
    state.posts = state.posts.filter(function (p) { return p.id !== post.id; });
    state.savedPostIds = state.savedPostIds.filter(function (id) { return id !== post.id; });
    saveState();
    renderView(ui.currentView);
    toast('پۆستەکە سڕایەوە', 'success');
  }

  function showPostMenu(anchor, post) {
    var author = getUserById(post.authorId);
    var own = post.authorId === state.currentUser.id;
    var items = [
      {
        label: 'کۆپیکردنی دەق', icon: 'copy',
        onClick: function () {
          copyText(post.text).then(function (ok) { toast(ok ? 'دەقی پۆستەکە کۆپی کرا' : 'کۆپیکردن سەرکەوتوو نەبوو', ok ? 'success' : 'error'); });
        }
      }
    ];
    if (!own && author) {
      var following = isFollowing(author.id);
      items.push({
        label: (following ? 'وازهێنان لە شوێنکەوتنی ' : 'شوێنکەوتنی ') + '@' + author.username,
        icon: following ? 'user-minus' : 'user-plus',
        onClick: function () {
          var now = toggleFollow(author.id);
          toast(now ? 'ئێستا شوێنکەوتووی ' + author.displayName + 'یت' : 'وازت لە شوێنکەوتن هێنا', 'success');
          if (ui.currentView === 'home') renderFeed();
        }
      });
    }
    if (own) {
      items.push({
        label: 'سڕینەوەی پۆست', icon: 'trash-2', danger: true, keepOpen: true,
        onClick: function (ctrl) {
          ctrl.setItems([
            { label: 'دڵنیایت لە سڕینەوە؟', icon: 'triangle-alert', keepOpen: true, onClick: function () {} },
            { label: 'بەڵێ، بیسڕەوە', icon: 'trash-2', danger: true, onClick: function () { deletePost(post); } },
            { label: 'پاشگەزبوونەوە', icon: 'x', onClick: function () {} }
          ]);
        }
      });
    }
    showMenu(anchor, items, { alignEnd: false });
  }

  /** One delegated listener per post list. */
  function bindPostList(container) {
    container.addEventListener('click', function (e) {
      var actionEl = e.target.closest('[data-action]');
      if (!actionEl || !container.contains(actionEl)) return;
      var card = actionEl.closest('.post-card');
      if (!card) return;
      var post = getPostById(card.getAttribute('data-post-id'));
      if (!post) return;
      switch (actionEl.getAttribute('data-action')) {
        case 'open-profile': {
          var a = getUserById(post.authorId);
          if (a) openProfile(a.username);
          break;
        }
        case 'more': showPostMenu(actionEl, post); break;
        case 'reply': toggleCommentsDrawer(card, actionEl); break;
        case 'toggle-script': toggleScript(post, card, actionEl); break;
        case 'like': toggleLike(post, actionEl); break;
        case 'bookmark': toggleBookmark(post, actionEl); break;
        case 'share': {
          var shown = post.scriptMode === 'latin' ? (toLatin(post.text) || post.text) : post.text;
          copyText(shown).then(function (ok) { toast(ok ? 'دەقی پۆستەکە کۆپی کرا' : 'کۆپیکردن سەرکەوتوو نەبوو', ok ? 'success' : 'error'); });
          break;
        }
        default: break;
      }
    });
    container.addEventListener('submit', function (e) {
      var form = e.target.closest('.post-comment-form');
      if (!form) return;
      e.preventDefault();
      var card = form.closest('.post-card');
      var post = card && getPostById(card.getAttribute('data-post-id'));
      if (post) submitComment(post, card, form);
    });
    container.addEventListener('input', function (e) {
      var input = e.target.closest('.post-comment-input');
      if (!input) return;
      var send = $('.post-comment-send', input.closest('form'));
      if (send) send.disabled = !input.value.trim();
    });
  }

  /* ==========================================================================
   * 11. FEED (tabs, refresh, infinite scroll, new-posts pill)
   * ======================================================================== */
  function getFeedPosts() {
    var posts = sortedPosts();
    if (ui.feedTab === 'following') {
      var allowed = state.following.concat([state.currentUser.id]);
      posts = posts.filter(function (p) { return allowed.indexOf(p.authorId) >= 0; });
    }
    return posts;
  }

  function syncFeedTabs() {
    [dom.feedTabForYou, dom.feedTabFollowing].forEach(function (tab) {
      tab.setAttribute('aria-selected', String(tab.getAttribute('data-feed') === ui.feedTab));
    });
  }

  function renderFeed() {
    try {
      var posts = getFeedPosts();
      dom.feedList.textContent = '';
      setShown(dom.feedError, false, 'flex');
      appendPosts(dom.feedList, posts.slice(0, ui.feedVisible));
      setShown(dom.feedEmpty, posts.length === 0, 'flex');
      setShown(dom.feedEnd, posts.length > 0 && ui.feedVisible >= posts.length);
      setShown(dom.feedLoadingMore, false, 'flex');
      dom.feedList.setAttribute('aria-busy', 'false');
      syncFeedTabs();
      updatePill();
      refreshIcons();
    } catch (err) {
      if (window.console) console.error('[meko] feed render failed', err);
      setShown(dom.feedError, true, 'flex');
      dom.feedList.setAttribute('aria-busy', 'false');
    }
  }

  function sentinelVisible() {
    var r = dom.feedSentinel.getBoundingClientRect();
    return r.top < window.innerHeight + 400;
  }

  function loadMoreFeed() {
    if (ui.loadingMore || ui.currentView !== 'home') return;
    var posts = getFeedPosts();
    if (ui.feedVisible >= posts.length) return;
    ui.loadingMore = true;
    setShown(dom.feedLoadingMore, true, 'flex');
    setTimeout(function () {
      var from = ui.feedVisible;
      ui.feedVisible += FEED_PAGE_SIZE;
      appendPosts(dom.feedList, getFeedPosts().slice(from, ui.feedVisible));
      setShown(dom.feedLoadingMore, false, 'flex');
      setShown(dom.feedEnd, ui.feedVisible >= getFeedPosts().length);
      ui.loadingMore = false;
      refreshIcons();
      if (ui.currentView === 'home' && sentinelVisible()) loadMoreFeed();
    }, 450);
  }

  function updatePill() {
    var n = ui.pendingPosts.length;
    var pill = dom.newPostsPill;
    if (!pill) return;
    var label = $('span', pill);
    if (label) label.textContent = n > 1 ? toKu(n) + ' پۆستی نوێ' : 'پۆستی نوێ';
    setShown(pill, n > 0 && ui.currentView === 'home', 'flex');
  }

  function flushPending() {
    if (!ui.pendingPosts.length) return 0;
    var n = ui.pendingPosts.length;
    ui.pendingPosts.slice().reverse().forEach(function (p) {
      if (!getPostById(p.id)) state.posts.unshift(p);
    });
    state.incomingCursor += n;
    ui.pendingPosts = [];
    saveState();
    return n;
  }

  function deliverIncoming() {
    ui.incomingTimer = null;
    var idx = state.incomingCursor + ui.pendingPosts.length;
    if (idx >= INCOMING_POOL.length) return;
    if (document.hidden || ui.currentView !== 'home') { scheduleIncoming(); return; }
    var t = INCOMING_POOL[idx];
    ui.pendingPosts.push({
      id: t.id, authorId: t.authorId, text: t.text, isPoetry: t.isPoetry, createdAt: Date.now(),
      likes: t.likes, likedByMe: false, reposts: 0, repostedByMe: false, scriptMode: 'arab', comments: [], media: []
    });
    updatePill();
    scheduleIncoming();
  }

  function scheduleIncoming() {
    if (ui.incomingTimer) clearTimeout(ui.incomingTimer);
    if (state.incomingCursor + ui.pendingPosts.length >= INCOMING_POOL.length) return;
    ui.incomingTimer = setTimeout(deliverIncoming, 45000);
  }

  function refreshFeed() {
    var btn = dom.feedRefresh;
    var svg = $('svg', btn);
    if (svg) svg.classList.add('animate-spin');
    btn.disabled = true;
    setTimeout(function () {
      var n = flushPending();
      ui.feedVisible = FEED_PAGE_SIZE;
      renderFeed();
      if (svg) svg.classList.remove('animate-spin');
      btn.disabled = false;
      window.scrollTo({ top: 0, behavior: 'smooth' });
      toast(n ? 'پۆستی نوێ بارکرا' : 'پۆستەکان نوێکرانەوە', 'success');
    }, 650);
  }

  function focusPost(postId, openComments) {
    var post = getPostById(postId);
    if (!post) { toast('ئەم پۆستە ئیتر بەردەست نییە.', 'error'); return; }
    ui.feedTab = 'for-you';
    var idx = getFeedPosts().findIndex(function (p) { return p.id === postId; });
    if (idx >= ui.feedVisible) ui.feedVisible = idx + 1;
    navigateTo('home');
    requestAnimationFrame(function () {
      var card = dom.feedList.querySelector('[data-post-id="' + postId + '"]');
      if (!card) return;
      card.scrollIntoView({ block: 'center', behavior: 'smooth' });
      card.classList.add('ring-2', 'ring-brand-500/50');
      setTimeout(function () { card.classList.remove('ring-2', 'ring-brand-500/50'); }, 1800);
      if (openComments) {
        var rb = $('[data-action="reply"]', card);
        var drawer = $('.post-comments-drawer', card);
        if (rb && drawer && drawer.classList.contains('hidden')) toggleCommentsDrawer(card, rb);
      }
    });
  }

  /* ==========================================================================
   * 12. SAVED VIEW
   * ======================================================================== */
  function renderSaved() {
    dom.savedList.textContent = '';
    var posts = state.savedPostIds.map(getPostById).filter(Boolean);
    appendPosts(dom.savedList, posts);
    setShown(dom.savedEmpty, posts.length === 0, 'flex');
    refreshIcons();
  }

  /* ==========================================================================
   * 13. CREATOR CANVAS
   * ======================================================================== */
  var creator = { open: false, isPoetry: false, media: [] };

  function injectPoetryToggle() {
    var group = $('#creator-canvas footer > div:first-child');
    if (!group || byId('creator-poetry-toggle')) return;
    var btn = document.createElement('button');
    btn.id = 'creator-poetry-toggle';
    btn.type = 'button';
    btn.setAttribute('aria-pressed', 'false');
    btn.className = 'ms-1 inline-flex h-10 items-center gap-1.5 rounded-full border border-brand-200 px-3.5 text-sm font-bold text-brand-700 transition hover:bg-brand-50 active:scale-95 aria-pressed:border-brand-600 aria-pressed:bg-brand-600 aria-pressed:text-white dark:border-white/20 dark:text-brand-300 dark:hover:bg-white/10';
    btn.innerHTML = '<i data-lucide="feather" class="h-4 w-4"></i><span>شێوازی شیعر</span>';
    group.appendChild(btn);
    dom.creatorPoetryToggle = btn;
  }

  function creatorHasContent() {
    return dom.creatorTextarea.value.trim().length > 0 || creator.media.length > 0;
  }

  function updateCreatorUI() {
    var val = dom.creatorTextarea.value;
    var len = charLen(val);
    var ratio = Math.min(len / MAX_CHARS, 1);
    var remaining = MAX_CHARS - len;
    dom.creatorCounterProgress.style.strokeDashoffset = String(RING_LENGTH * (1 - ratio));
    ['stroke-brand-500', 'stroke-amber-500', 'stroke-rose-500'].forEach(function (c) { dom.creatorCounterProgress.classList.remove(c); });
    dom.creatorCounterProgress.classList.add(remaining < 0 ? 'stroke-rose-500' : (remaining <= 20 ? 'stroke-amber-500' : 'stroke-brand-500'));
    dom.creatorCharCount.textContent = toKu(remaining);
    dom.creatorCharCount.classList.toggle('text-rose-500', remaining < 0);
    dom.creatorCharCount.classList.toggle('text-slate-500', remaining >= 0);
    setShown(dom.creatorCharCount, remaining <= 50);
    dom.creatorSubmit.disabled = !((val.trim().length > 0 || creator.media.length > 0) && len <= MAX_CHARS);
    dom.creatorTextarea.classList.toggle('text-poetry', creator.isPoetry);
    if (dom.creatorPoetryToggle) dom.creatorPoetryToggle.setAttribute('aria-pressed', String(creator.isPoetry));
  }

  function renderCreatorMedia() {
    var grid = dom.creatorMediaGrid;
    grid.textContent = '';
    var tpl = byId('tpl-creator-media');
    creator.media.forEach(function (m) {
      var node = tpl.content.firstElementChild.cloneNode(true);
      node.setAttribute('data-media-id', m.id);
      $('.creator-media-img', node).src = m.dataUrl;
      $('.creator-media-img', node).alt = 'پێشبینینی وێنە';
      $('.creator-media-remove', node).addEventListener('click', function () {
        creator.media = creator.media.filter(function (x) { return x.id !== m.id; });
        renderCreatorMedia();
        updateCreatorUI();
      });
      grid.appendChild(node);
    });
    setShown(grid, creator.media.length > 0, 'grid');
    refreshIcons();
  }

  async function addCreatorFiles(fileList) {
    var files = Array.prototype.slice.call(fileList || []).filter(function (f) { return /^image\//.test(f.type); });
    if (!files.length) {
      if (fileList && fileList.length) toast('تەنها فایلی وێنە پشتگیری دەکرێت.', 'error');
      return;
    }
    var room = MAX_IMAGES - creator.media.length;
    if (room <= 0) { toast('زۆرترین ژمارەی وێنە ' + toKu(MAX_IMAGES) + 'ە.', 'error'); return; }
    if (files.length > room) toast('تەنها ' + toKu(room) + ' وێنەی تر دەتوانیت زیاد بکەیت.', 'info');
    for (var i = 0; i < Math.min(files.length, room); i++) {
      try {
        var dataUrl = await compressImage(files[i], { max: 720, quality: 0.82 });
        creator.media.push({ id: uid('img'), dataUrl: dataUrl });
      } catch (err) {
        toast('وێنەیەک بار نەکرا.', 'error');
      }
    }
    renderCreatorMedia();
    updateCreatorUI();
  }

  function resetCreator() {
    dom.creatorTextarea.value = '';
    creator.isPoetry = false;
    creator.media = [];
    dom.creatorFileInput.value = '';
    renderCreatorMedia();
    updateCreatorUI();
  }

  function openCreator(opts) {
    opts = opts || {};
    if (ui.drawerOpen) closeDrawer(false);
    closePopup();
    if (!creator.open) {
      creator.open = true;
      if (state.draft && (state.draft.text || (state.draft.media && state.draft.media.length))) {
        dom.creatorTextarea.value = state.draft.text || '';
        creator.isPoetry = !!state.draft.isPoetry;
        creator.media = (state.draft.media || []).map(function (src) { return { id: uid('img'), dataUrl: src }; });
      } else {
        dom.creatorTextarea.value = '';
        creator.isPoetry = false;
        creator.media = [];
      }
      renderCreatorMedia();
      updateCreatorUI();
      dom.creatorCanvas.classList.remove('hidden');
      dom.creatorCanvas.classList.add('flex');
      dom.creatorCanvas.setAttribute('aria-hidden', 'false');
      lockBody(true);
    }
    setShown(dom.creatorDiscardSheet, false, 'flex');
    refreshIcons();
    setTimeout(function () { dom.creatorTextarea.focus(); }, 60);
    if (opts.pickImage) setTimeout(function () { dom.creatorFileInput.click(); }, 120);
  }

  function closeCreator() {
    if (!creator.open) return;
    creator.open = false;
    dom.creatorCanvas.classList.add('hidden');
    dom.creatorCanvas.classList.remove('flex');
    dom.creatorCanvas.setAttribute('aria-hidden', 'true');
    setShown(dom.creatorDiscardSheet, false, 'flex');
    lockBody(false);
  }

  function requestCloseCreator() {
    if (creatorHasContent()) {
      setShown(dom.creatorDiscardSheet, true, 'flex');
      setTimeout(function () { dom.creatorDiscardConfirm.focus(); }, 30);
    } else {
      closeCreator();
    }
  }

  function submitCreator() {
    var raw = dom.creatorTextarea.value;
    var text = normalizeText(raw).trim();
    if (!text && !creator.media.length) return;
    if (charLen(text) > MAX_CHARS) { toast('دەقەکە درێژترە لە ' + toKu(MAX_CHARS) + ' پیت.', 'error'); return; }
    var post = {
      id: uid('p'), authorId: state.currentUser.id, text: text, isPoetry: creator.isPoetry,
      createdAt: Date.now(), likes: 0, likedByMe: false, reposts: 0, repostedByMe: false,
      scriptMode: 'arab', comments: [], media: creator.media.map(function (m) { return m.dataUrl; })
    };
    state.posts.unshift(post);
    state.draft = null;
    saveState();
    closeCreator();
    resetCreator();
    ui.feedTab = 'for-you';
    ui.feedVisible = Math.max(ui.feedVisible, FEED_PAGE_SIZE);
    if (ui.currentView === 'home') { renderFeed(); window.scrollTo({ top: 0, behavior: 'smooth' }); }
    else navigateTo('home');
    toast('پۆستەکەت بڵاوکرایەوە', 'success');
  }

  function saveDraft() {
    state.draft = {
      text: dom.creatorTextarea.value,
      isPoetry: creator.isPoetry,
      media: creator.media.map(function (m) { return m.dataUrl; })
    };
    saveState();
    closeCreator();
    toast('وەک ڕەشنووس پاشەکەوت کرا', 'success');
  }

  function discardCreator() {
    state.draft = null;
    saveState();
    closeCreator();
    resetCreator();
  }

  function insertAtCursor(textarea, text) {
    var start = typeof textarea.selectionStart === 'number' ? textarea.selectionStart : textarea.value.length;
    var end = typeof textarea.selectionEnd === 'number' ? textarea.selectionEnd : textarea.value.length;
    textarea.setRangeText(text, start, end, 'end');
    textarea.dispatchEvent(new Event('input', { bubbles: true }));
    textarea.focus();
  }

  /* ==========================================================================
   * 14. PROFILE VIEW
   * ======================================================================== */
  function resolveViewingUser() {
    return getUserByHandle(state.viewingUserHandle) || state.currentUser;
  }

  function openProfile(handle) {
    var u = getUserByHandle(handle);
    if (!u) { toast('پرۆفایلەکە نەدۆزرایەوە.', 'error'); return; }
    if (state.viewingUserHandle !== u.username || ui.currentView !== 'profile') ui.profileTab = 'posts';
    state.viewingUserHandle = u.username;
    navigateTo('profile');
  }

  function buildReplyItem(comment, post) {
    var author = getUserById(comment.authorId) || fallbackUser();
    var parentAuthor = getUserById(post.authorId) || fallbackUser();
    var el = document.createElement('article');
    el.className = 'reply-item flex gap-3 px-4 py-3.5';
    el.setAttribute('data-post-id', post.id);
    var img = document.createElement('img');
    img.className = 'h-11 w-11 shrink-0 rounded-full bg-slate-200 object-cover dark:bg-night-700';
    img.src = author.avatar || BLANK_IMG;
    img.alt = '';
    var body = document.createElement('div');
    body.className = 'min-w-0 flex-1';
    var head = document.createElement('div');
    head.className = 'flex flex-wrap items-center gap-x-1.5 text-sm';
    var name = document.createElement('strong');
    name.className = 'font-extrabold';
    name.textContent = author.displayName;
    var meta = document.createElement('span');
    meta.className = 'text-slate-500 dark:text-slate-400';
    meta.textContent = '· ' + relTime(comment.createdAt);
    head.append(name, meta);
    var ctx = document.createElement('p');
    ctx.className = 'mt-0.5 text-xs text-slate-500 dark:text-slate-400';
    ctx.textContent = 'وەڵامی ';
    var h = document.createElement('span');
    h.setAttribute('dir', 'ltr');
    h.className = 'inline-block font-semibold text-brand-600 dark:text-brand-400';
    h.textContent = '@' + parentAuthor.username;
    ctx.appendChild(h);
    var text = document.createElement('p');
    text.className = 'mt-1 whitespace-pre-wrap break-words text-[15px] leading-7';
    text.setAttribute('dir', 'auto');
    text.textContent = comment.text;
    body.append(head, ctx, text);
    el.append(img, body);
    return el;
  }

  function renderProfile() {
    var user = resolveViewingUser();
    var own = user.id === state.currentUser.id;
    ui.renderedHandle = user.username;

    dom.profileHeaderTitle.textContent = user.displayName;
    dom.profileAvatar.src = user.avatar || BLANK_IMG;
    dom.profileAvatar.alt = 'وێنەی پرۆفایلی ' + user.displayName;
    dom.profileDisplayName.textContent = user.displayName;
    dom.profileVerified.classList.toggle('hidden', !user.verified);
    dom.profileHandle.textContent = '@' + user.username;
    dom.profileBio.textContent = user.bio || '';
    dom.profileBio.classList.toggle('hidden', !user.bio);
    var loc = locationText(user);
    dom.profileLocation.textContent = loc;
    setShown(dom.profileLocationWrap, !!loc, 'inline-flex');
    dom.profileJoined.textContent = user.joined || '—';
    dom.profileFollowingCount.textContent = fmtCount(user.followingCount);
    dom.profileFollowersCount.textContent = fmtCount(user.followersCount);

    setShown(dom.profileEditBtn, own);
    setShown(dom.profileMessageBtn, !own, 'inline-flex');
    setShown(dom.profileFollowBtn, !own);
    if (!own) {
      var f = isFollowing(user.id);
      dom.profileFollowBtn.setAttribute('aria-pressed', String(f));
      dom.profileFollowBtn.textContent = f ? 'شوێنکەوتوو' : 'شوێنکەوتن';
    }

    $$('[data-profile-tab]', dom.profileTabs).forEach(function (t) {
      t.setAttribute('aria-selected', String(t.getAttribute('data-profile-tab') === ui.profileTab));
    });

    var userPosts = sortedPosts().filter(function (p) { return p.authorId === user.id; });
    dom.profilePostsCount.textContent = toKu(userPosts.length);
    dom.profilePostsList.textContent = '';
    var count = 0;
    if (ui.profileTab === 'posts') {
      appendPosts(dom.profilePostsList, userPosts);
      count = userPosts.length;
    } else if (ui.profileTab === 'media') {
      var withMedia = userPosts.filter(function (p) { return p.media && p.media.length; });
      appendPosts(dom.profilePostsList, withMedia);
      count = withMedia.length;
    } else if (ui.profileTab === 'likes') {
      var liked = own ? sortedPosts().filter(function (p) { return p.likedByMe; }) : [];
      appendPosts(dom.profilePostsList, liked);
      count = liked.length;
    } else if (ui.profileTab === 'replies') {
      var replies = [];
      state.posts.forEach(function (p) {
        p.comments.forEach(function (c) { if (c.authorId === user.id) replies.push({ c: c, p: p }); });
      });
      replies.sort(function (a, b) { return b.c.createdAt - a.c.createdAt; });
      var frag = document.createDocumentFragment();
      replies.forEach(function (r) { frag.appendChild(buildReplyItem(r.c, r.p)); });
      dom.profilePostsList.appendChild(frag);
      count = replies.length;
    }
    setShown(dom.profileEmpty, count === 0, 'flex');
    refreshIcons();
  }

  function openChatWithUser(userId) {
    var u = getUserById(userId);
    if (!u) return;
    var chat = state.chats.filter(function (c) { return c.type === 'dm' && c.participantIds[0] === userId; })[0];
    if (!chat) {
      chat = {
        id: uid('c'), type: 'dm', name: u.displayName, avatar: u.avatar, participantIds: [userId],
        online: false, unread: 0, muted: false, lastSeen: Date.now(), messages: [], lastActivity: Date.now()
      };
      state.chats.unshift(chat);
      saveState();
    }
    openChat(chat.id);
  }

  /* ==========================================================================
   * 15. EDIT PROFILE MODAL
   * ======================================================================== */
  var edit = { open: false, avatarData: null };
  var cityMaster = [];
  var KURDISTAN_UNIFIED = ['iraq', 'turkey', 'iran', 'syria'];
  var EXTRA_CITIES = [
    ['shingal', 'شنگال', 'iraq'], ['akre', 'ئاکرێ', 'iraq'], ['soran', 'سۆران', 'iraq'], ['chamchamal', 'چەمچەماڵ', 'iraq'],
    ['kalar', 'کەلار', 'iraq'], ['makhmur', 'مەخموور', 'iraq'],
    ['batman', 'باتمان', 'turkey'], ['dersim', 'دێرسم', 'turkey'], ['siirt', 'سێرت', 'turkey'],
    ['saqqez', 'سەقز', 'iran'], ['marivan', 'مەریوان', 'iran'], ['bukan', 'بۆکان', 'iran'],
    ['piranshahr', 'پیرانشار', 'iran'], ['qasr-shirin', 'قەسری شیرین', 'iran'],
    ['amuda', 'عامودا', 'syria'], ['derik', 'دێریک', 'syria'], ['serekaniye', 'سەرێکانی', 'syria']
  ];

  function setupLocationControls() {
    var countrySel = dom.editCountry;
    if (!$('option[value="kurdistan"]', countrySel)) {
      var opt = new Option('کوردستان', 'kurdistan');
      var after = countrySel.options[1] || null;
      countrySel.insertBefore(opt, after);
    }
    cityMaster = $$('option[data-country]', dom.editCity).map(function (o) {
      return { value: o.value, label: o.textContent.trim(), country: o.getAttribute('data-country') };
    });
    EXTRA_CITIES.forEach(function (c) {
      if (!cityMaster.some(function (x) { return x.value === c[0]; })) cityMaster.push({ value: c[0], label: c[1], country: c[2] });
    });
  }

  function citiesForCountry(country) {
    if (!country) return [];
    if (country === 'iraq' || country === 'kurdistan') {
      return cityMaster.filter(function (c) { return KURDISTAN_UNIFIED.indexOf(c.country) >= 0; });
    }
    return cityMaster.filter(function (c) { return c.country === country; });
  }

  function rebuildCityOptions(country, selected) {
    var sel = dom.editCity;
    sel.textContent = '';
    sel.appendChild(new Option('هەڵبژێرە...', ''));
    var cities = citiesForCountry(country);
    cities.forEach(function (c) {
      var o = new Option(c.label, c.value);
      o.setAttribute('data-country', c.country);
      sel.appendChild(o);
    });
    sel.disabled = !country || cities.length === 0;
    sel.value = selected && cities.some(function (c) { return c.value === selected; }) ? selected : '';
  }

  function injectAvatarPicker() {
    var scroller = $('#edit-profile-form > div');
    if (!scroller || byId('edit-avatar-trigger')) return;
    var row = document.createElement('div');
    row.className = 'flex items-center gap-4';
    row.innerHTML =
      '<button id="edit-avatar-trigger" type="button" aria-label="گۆڕینی وێنەی پرۆفایل" class="group relative h-20 w-20 shrink-0 overflow-hidden rounded-full ring-2 ring-brand-500/30 transition active:scale-95">' +
      '<img id="edit-avatar-preview" src="' + BLANK_IMG + '" alt="" class="h-full w-full bg-slate-200 object-cover dark:bg-night-700">' +
      '<span class="absolute inset-0 flex items-center justify-center bg-black/40 text-white"><i data-lucide="camera" class="h-6 w-6"></i></span>' +
      '</button>' +
      '<div class="min-w-0"><p class="text-sm font-semibold">وێنەی پرۆفایل</p>' +
      '<p class="mt-0.5 text-xs text-slate-500 dark:text-slate-400">وێنەکە بە شێوەی چوارگۆشە (٢٥٠×٢٥٠) کۆمپرێس دەکرێت.</p></div>' +
      '<input id="edit-avatar-file" type="file" accept="image/*" class="hidden">';
    scroller.insertBefore(row, scroller.firstChild);
    dom.editAvatarTrigger = byId('edit-avatar-trigger');
    dom.editAvatarPreview = byId('edit-avatar-preview');
    dom.editAvatarFile = byId('edit-avatar-file');
    dom.editAvatarTrigger.addEventListener('click', function () { dom.editAvatarFile.click(); });
    dom.editAvatarFile.addEventListener('change', async function () {
      var file = dom.editAvatarFile.files && dom.editAvatarFile.files[0];
      if (!file) return;
      if (!/^image\//.test(file.type)) { toast('تەنها فایلی وێنە پشتگیری دەکرێت.', 'error'); return; }
      try {
        edit.avatarData = await compressImage(file, { max: 250, quality: 0.85, square: true });
        dom.editAvatarPreview.src = edit.avatarData;
      } catch (e) {
        toast('وێنەکە بار نەکرا.', 'error');
      }
      dom.editAvatarFile.value = '';
    });
  }

  function updateEditCounters() {
    dom.editNameCount.textContent = charLen(dom.editDisplayName.value) + '/40';
    dom.editUsernameCount.textContent = charLen(dom.editUsername.value) + '/20';
    dom.editBioCount.textContent = charLen(dom.editBio.value) + '/160';
  }

  function setFieldError(inputEl, errEl, message) {
    if (message) {
      errEl.textContent = message;
      errEl.classList.remove('hidden');
      inputEl.classList.add('border-rose-500');
      inputEl.setAttribute('aria-invalid', 'true');
    } else {
      errEl.textContent = '';
      errEl.classList.add('hidden');
      inputEl.classList.remove('border-rose-500');
      inputEl.removeAttribute('aria-invalid');
    }
  }

  function validateEditForm() {
    var ok = true;
    var name = dom.editDisplayName.value.trim();
    if (!name) { setFieldError(dom.editDisplayName, dom.editNameError, 'ناوی پیشاندراو پێویستە.'); ok = false; }
    else setFieldError(dom.editDisplayName, dom.editNameError, '');

    var uname = dom.editUsername.value.trim().replace(/^@+/, '');
    var re = /^[A-Za-z0-9_]{3,20}$/;
    if (!re.test(uname)) {
      setFieldError(dom.editUsername, dom.editUsernameError, 'ناوی بەکارهێنەر دەبێت لە ٣ بۆ ٢٠ پیتی ئینگلیزی، ژمارە یان _ پێکهاتبێت.');
      ok = false;
    } else if (state.users.some(function (u) { return u.username.toLowerCase() === uname.toLowerCase(); })) {
      setFieldError(dom.editUsername, dom.editUsernameError, 'ئەم ناوی بەکارهێنەرە پێشتر گیراوە.');
      ok = false;
    } else {
      setFieldError(dom.editUsername, dom.editUsernameError, '');
    }
    return ok;
  }

  function openEditProfile() {
    var u = state.currentUser;
    edit.avatarData = null;
    dom.editDisplayName.value = u.displayName;
    dom.editUsername.value = u.username;
    dom.editBio.value = u.bio || '';
    dom.editCountry.value = u.countryKey || '';
    rebuildCityOptions(u.countryKey || '', u.cityKey || '');
    dom.editAvatarPreview.src = u.avatar || BLANK_IMG;
    setFieldError(dom.editDisplayName, dom.editNameError, '');
    setFieldError(dom.editUsername, dom.editUsernameError, '');
    updateEditCounters();
    if (ui.drawerOpen) closeDrawer(false);
    closePopup();
    edit.open = true;
    dom.editProfileModal.classList.remove('hidden');
    dom.editProfileModal.classList.add('flex');
    dom.editProfileModal.setAttribute('aria-hidden', 'false');
    lockBody(true);
    refreshIcons();
    setTimeout(function () { dom.editDisplayName.focus(); }, 60);
  }

  function closeEditProfile() {
    if (!edit.open) return;
    edit.open = false;
    dom.editProfileModal.classList.add('hidden');
    dom.editProfileModal.classList.remove('flex');
    dom.editProfileModal.setAttribute('aria-hidden', 'true');
    lockBody(false);
  }

  function saveEditProfile() {
    if (!validateEditForm()) {
      var firstBad = $('[aria-invalid="true"]', dom.editProfileForm);
      if (firstBad) firstBad.focus();
      return;
    }
    var u = state.currentUser;
    var oldHandle = u.username;
    var newName = normalizeText(dom.editDisplayName.value).trim();
    var newHandle = dom.editUsername.value.trim().replace(/^@+/, '');
    var countryKey = dom.editCountry.value;
    var cityKey = dom.editCity.value;
    var countryOpt = dom.editCountry.options[dom.editCountry.selectedIndex];
    var cityOpt = dom.editCity.options[dom.editCity.selectedIndex];

    if (edit.avatarData) { u.avatar = edit.avatarData; u.customAvatar = true; }
    else if (!u.customAvatar && newName !== u.displayName) u.avatar = makeAvatar(newName, u.id);
    u.displayName = newName;
    u.username = newHandle;
    u.bio = normalizeText(dom.editBio.value).trim();
    u.countryKey = countryKey;
    u.country = countryKey && countryOpt ? countryOpt.textContent.trim() : '';
    u.cityKey = cityKey;
    u.city = cityKey && cityOpt ? cityOpt.textContent.trim() : '';

    if (state.viewingUserHandle === oldHandle) state.viewingUserHandle = newHandle;
    if (ui.renderedHandle === oldHandle) ui.renderedHandle = newHandle;
    ui.history.forEach(function (h) { if (h.handle === oldHandle) h.handle = newHandle; });

    saveState();
    syncCurrentUserUI();
    closeEditProfile();
    renderView(ui.currentView);
    toast('پرۆفایلەکەت نوێکرایەوە', 'success');
  }

  /* ==========================================================================
   * 16. NOTIFICATIONS
   * ======================================================================== */
  var NOTIF_META = {
    LIKE: { icon: 'heart', slot: 'bg-rose-50 text-rose-500 dark:bg-rose-500/15 dark:text-rose-400' },
    COMMENT: { icon: 'message-circle', slot: 'bg-sky-50 text-sky-600 dark:bg-sky-500/15 dark:text-sky-400' },
    FOLLOW: { icon: 'user-plus', slot: 'bg-violet-50 text-violet-600 dark:bg-violet-500/15 dark:text-violet-400' }
  };

  function isNotifTypeEnabled(type) {
    if (type === 'LIKE') return state.settings.notifLikes;
    if (type === 'COMMENT') return state.settings.notifReplies;
    if (type === 'FOLLOW') return state.settings.notifFollows;
    return true;
  }

  function setupNotifTabs() {
    var wrap = dom.notifTabs;
    var firstBtn = $('button', wrap);
    var cls = firstBtn ? firstBtn.className : '';
    wrap.textContent = '';
    [['all', 'هەموو'], ['LIKE', 'پەسەندکردن'], ['COMMENT', 'لێدوانەکان'], ['FOLLOW', 'شوێنکەوتن']].forEach(function (pair) {
      var b = document.createElement('button');
      b.type = 'button';
      b.setAttribute('role', 'tab');
      b.setAttribute('data-notif-filter', pair[0]);
      b.setAttribute('aria-selected', String(pair[0] === ui.notifFilter));
      b.className = cls + ' whitespace-nowrap px-1';
      b.textContent = pair[1];
      wrap.appendChild(b);
    });
  }

  function styleFollowBackButton(btn, following) {
    btn.setAttribute('aria-pressed', String(following));
    btn.textContent = following ? 'شوێنکەوتوو' : 'شوێنکەوتنەوە';
    btn.className = 'mt-2 inline-flex rounded-full px-4 py-1.5 text-xs font-bold transition active:scale-95 ' +
      (following
        ? 'border border-slate-300 text-slate-700 dark:border-white/20 dark:text-slate-200'
        : 'bg-slate-900 text-white dark:bg-white dark:text-slate-900');
  }

  function buildNotification(n) {
    var tpl = byId('tpl-notification');
    var li = tpl.content.firstElementChild.cloneNode(true);
    var item = $('.notif-item', li);
    var meta = NOTIF_META[n.type] || NOTIF_META.LIKE;

    if (n.type === 'FOLLOW') {
      var div = document.createElement('div');
      Array.prototype.slice.call(item.attributes).forEach(function (a) {
        if (a.name !== 'type') div.setAttribute(a.name, a.value);
      });
      Array.prototype.slice.call(item.childNodes).forEach(function (child) { div.appendChild(child); });
      div.setAttribute('role', 'group');
      div.classList.add('cursor-pointer');
      item.replaceWith(div);
      item = div;
    }

    item.setAttribute('data-notification-id', n.id);
    item.setAttribute('data-type', n.type);
    $('.notif-icon', item).setAttribute('data-lucide', meta.icon);
    $('.notif-icon-slot', item).className = 'notif-icon-slot mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full ' + meta.slot;
    var av = $('.notif-avatar', item);
    av.src = n.actorAvatar || BLANK_IMG;
    av.alt = n.actorName;

    var textEl = $('.notif-text', item);
    textEl.textContent = '';
    var strong = document.createElement('strong');
    strong.className = 'font-extrabold';
    strong.textContent = n.actorName;
    textEl.appendChild(strong);
    if (n.type === 'LIKE') textEl.appendChild(document.createTextNode(' پۆستەکەتی پەسەند کرد.'));
    else if (n.type === 'COMMENT') textEl.appendChild(document.createTextNode(' لێدوانێکی نووسی: «' + (n.commentText || '') + '»'));
    else textEl.appendChild(document.createTextNode(' دەستی کرد بە شوێنکەوتنت.'));

    var preview = $('.notif-preview', item);
    if (n.type === 'FOLLOW' || !n.postExcerpt) {
      preview.textContent = '';
      preview.classList.add('hidden');
    } else {
      preview.textContent = n.postExcerpt;
    }

    var time = $('.notif-time', item);
    time.textContent = relTime(n.timestamp);
    time.setAttribute('datetime', new Date(n.timestamp).toISOString());
    $('.notif-unread-dot', item).classList.toggle('hidden', !!n.read);
    if (!n.read) item.classList.add('bg-brand-50/60', 'dark:bg-brand-500/5');

    if (n.type === 'FOLLOW') {
      var fb = document.createElement('button');
      fb.type = 'button';
      fb.setAttribute('data-action', 'follow-back');
      styleFollowBackButton(fb, n.isFollowingBack);
      var holder = $('.min-w-0', item);
      (holder || item).appendChild(fb);
    }
    return li;
  }

  function renderNotifications() {
    var list = dom.notifList;
    list.textContent = '';
    var items = state.notifications
      .filter(function (n) { return isNotifTypeEnabled(n.type) && (ui.notifFilter === 'all' || n.type === ui.notifFilter); })
      .sort(function (a, b) { return b.timestamp - a.timestamp; });
    var frag = document.createDocumentFragment();
    items.forEach(function (n) { frag.appendChild(buildNotification(n)); });
    list.appendChild(frag);
    setShown(dom.notifEmpty, items.length === 0, 'flex');
    $$('[data-notif-filter]', dom.notifTabs).forEach(function (t) {
      t.setAttribute('aria-selected', String(t.getAttribute('data-notif-filter') === ui.notifFilter));
    });
    updateBadges();
    refreshIcons();
  }

  function handleNotifClick(e) {
    var item = e.target.closest('.notif-item');
    if (!item) return;
    var n = state.notifications.filter(function (x) { return x.id === item.getAttribute('data-notification-id'); })[0];
    if (!n) return;

    var fb = e.target.closest('[data-action="follow-back"]');
    if (fb) {
      var u = getUserByHandle(n.actorHandle);
      var now;
      if (u) now = toggleFollow(u.id);
      else { now = !n.isFollowingBack; n.isFollowingBack = now; saveState(); }
      n.isFollowingBack = now;
      styleFollowBackButton(fb, now);
      saveState();
      toast(now ? 'ئێستا شوێنکەوتووی ' + n.actorName + 'یت' : 'وازت لە شوێنکەوتن هێنا', 'success');
      return;
    }

    if (!n.read) {
      n.read = true;
      saveState();
      $('.notif-unread-dot', item).classList.add('hidden');
      item.classList.remove('bg-brand-50/60', 'dark:bg-brand-500/5');
      updateBadges();
    }
    if (n.type === 'FOLLOW') {
      if (getUserByHandle(n.actorHandle)) openProfile(n.actorHandle);
    } else if (n.postId) {
      focusPost(n.postId, n.type === 'COMMENT');
    }
  }

  function markAllNotificationsRead() {
    var changed = false;
    state.notifications.forEach(function (n) { if (!n.read) { n.read = true; changed = true; } });
    saveState();
    renderNotifications();
    toast(changed ? 'هەموو ئاگادارکردنەوەکان وەک خوێندراوە دیاری کران' : 'هیچ ئاگادارکردنەوەیەکی نەخوێندراو نییە', changed ? 'success' : 'info');
  }

  /* ==========================================================================
   * 17. CHAT LIST & CHAT ROOM
   * ======================================================================== */
  var REPLY_POOLS = {
    greet: ['سڵاو و ڕێزت! چۆنی؟ هیوادارم باش بیت.', 'سڵاو گیان! خۆشحاڵم کە دەبینمەوە.', 'ڕۆژت باش، چی نوێ هەیە؟'],
    thanks: ['بەخێر بێیت، هەمیشە ئامادەم.', 'قابیلی نییە، ئەرکی هەموومانە.', 'دەستت خۆش، منیش سوپاست دەکەم.'],
    poetry: [
      'شیعری کلاسیک گەنجینەی زمانەکەمانە؛ پێویستە بپارێزرێت و بخوێنرێتەوە.',
      'ئەو بەیتانە وشەی کۆن و ڕەسەنیان تێدایە؛ باشە لە ژێر هەر یەکێکیان مانای وشەکان بنووسین.',
      'غەزەل بە ئاوازی ناوەوە دەگوترێت؛ پێشنیار دەکەم بەیتەکە بە دەنگی بەرز بخوێنیتەوە.'
    ],
    ai: [
      'بۆ ژیریی دەستکرد پێویستمان بە داتای پاک و ئاساییکراو هەیە؛ UTF-8 یەکەم مەرجە.',
      'ڕاستە، کۆرپەسی کراوەی کوردی دەتوانێت کار بۆ هەموو توێژەران ئاسان بکات.',
      'باشە با دواتر نموونەی JSONL ی چەند پۆستێک پێکەوە بپشکنین.'
    ],
    language: [
      'وشە ماڵی بیرکردنەوەیە؛ هەر وشەیەکی ڕەسەن کە دەیژینینەوە ئەرکێکی گەورەیە.',
      'پرسیارێکی باشە، با لە ڕێزمان و ڕەگی وشەکان دەستپێبکەین.',
      'ناوچە جیاوازەکان وشەی جیاواز بەکار دەهێنن، ئەوەش بەشێکە لە دەوڵەمەندیی زمان.'
    ],
    question: [
      'پرسیارێکی باشە؛ با کەمێک بیری لێ بکەمەوە و دوایی وەڵامت دەدەمەوە.',
      'بە بۆچوونی من وەڵامەکە لە نموونە و بەکارهێنانی ڕاستەقینەدایە.',
      'هەندێک سەرچاوەم هەیە، دەیانخەمە ناو گفتوگۆکە.'
    ],
    generic: [
      'زۆر باشە، لێی تێگەیشتم.',
      'دەستت خۆش، ڕاستە ئەوەی دەیڵێیت.',
      'با زیاتر لەسەر ئەمە قسە بکەین.',
      'ئاگادار بووم و دواتر بۆت دەنووسمەوە.',
      'بیرۆکەیەکی جوانە، دەتوانین گەشەی پێ بدەین.'
    ]
  };

  function classifyText(text) {
    var t = normalizeText(text);
    if (/سڵاو|سلاو|بەیانی باش|ئێوارە باش|شەو باش/.test(t)) return 'greet';
    if (/سوپاس|مەمنون|دەستت خۆش|ساغبیت/.test(t)) return 'thanks';
    if (/شیعر|غەزەل|بەیت|دیوان|نالی|مەحوی|والی/.test(t)) return 'poetry';
    if (/ژیریی دەستکرد|داتا|کۆرپەس|مۆدێل|jsonl|ai\b|یونیکۆد|utf/i.test(t)) return 'ai';
    if (/زمان|وشە|چاوگ|ڕێزمان|ئاوەز|پیت|ئەلفوبێ|هاوار|لاتینی/.test(t)) return 'language';
    if (/[؟?]/.test(t) || /چۆن|چی|کێ|کەی|بۆچی/.test(t)) return 'question';
    return 'generic';
  }

  function pickReply(text, chat) {
    var pool = REPLY_POOLS[classifyText(text)] || REPLY_POOLS.generic;
    var last = ui.lastReply[chat.id];
    var candidates = pool.filter(function (r) { return r !== last; });
    var reply = pick(candidates.length ? candidates : pool);
    ui.lastReply[chat.id] = reply;
    return reply;
  }

  function chatTitle(chat) {
    if (chat.type === 'dm') {
      var u = getUserById(chat.participantIds[0]);
      return u ? u.displayName : chat.name;
    }
    return chat.name;
  }
  function chatAvatar(chat) {
    if (chat.type === 'dm') {
      var u = getUserById(chat.participantIds[0]);
      return (u && u.avatar) || chat.avatar || BLANK_IMG;
    }
    return chat.avatar || BLANK_IMG;
  }
  function lastMessage(chat) { return chat.messages.length ? chat.messages[chat.messages.length - 1] : null; }
  function chatSortTime(chat) {
    var m = lastMessage(chat);
    return m ? m.createdAt : (chat.lastActivity || 0);
  }
  function chatPreview(chat) {
    var m = lastMessage(chat);
    if (!m) return 'هێشتا نامەیەک نییە';
    var prefix = '';
    if (m.from === ME) prefix = 'تۆ: ';
    else if (chat.type === 'group') {
      var s = getUserById(m.from);
      prefix = (s ? s.displayName.split(' ')[0] : '') + ': ';
    }
    return prefix + String(m.text).replace(/\s+/g, ' ');
  }

  function renderChatList() {
    var list = dom.chatList;
    list.textContent = '';
    var q = normalizeText(dom.chatSearch.value || '').trim().toLowerCase();
    var chats = state.chats.slice().sort(function (a, b) { return chatSortTime(b) - chatSortTime(a); });
    var filtered = chats.filter(function (c) {
      if (!q) return true;
      return normalizeText(chatTitle(c) + ' ' + chatPreview(c)).toLowerCase().indexOf(q) >= 0;
    });
    var tpl = byId('tpl-chat-item');
    var frag = document.createDocumentFragment();
    filtered.forEach(function (chat) {
      var li = tpl.content.firstElementChild.cloneNode(true);
      var btn = $('.chat-item', li);
      btn.setAttribute('data-chat-id', chat.id);
      var img = $('.chat-item-avatar', li);
      img.src = chatAvatar(chat);
      img.alt = '';
      $('.chat-item-name', li).textContent = chatTitle(chat);
      var m = lastMessage(chat);
      var t = $('.chat-item-time', li);
      t.textContent = m ? chatListTime(m.createdAt) : '';
      if (m) t.setAttribute('datetime', new Date(m.createdAt).toISOString());
      $('.chat-item-preview', li).textContent = chatPreview(chat);
      $('.chat-item-online', li).classList.toggle('hidden', !(chat.type === 'dm' && chat.online));
      var unread = $('.chat-item-unread', li);
      unread.textContent = toKu(chat.unread || 0);
      unread.classList.toggle('hidden', !(chat.unread > 0));
      if (chat.unread > 0) $('.chat-item-name', li).classList.add('font-extrabold');
      frag.appendChild(li);
    });
    list.appendChild(frag);
    setShown(dom.chatListEmpty, state.chats.length === 0, 'flex');
    setShown(dom.chatListNoResults, state.chats.length > 0 && filtered.length === 0);
    updateBadges();
  }

  function openChat(chatId) {
    var chat = getChat(chatId);
    if (!chat) return;
    ui.activeChatId = chatId;
    navigateTo('chat-room');
  }

  function chatStatusText(chat) {
    if (chat.type === 'group') return toKu(chat.participantIds.length + 1) + ' ئەندام';
    if (chat.online) return 'ئۆنلاین';
    return chat.lastSeen ? 'دوایین بینین ' + relTime(chat.lastSeen, true) : 'ئۆفلاین';
  }

  function statusIconName(status) {
    return status === 'read' && state.settings.readReceipts ? 'check-check' : 'check';
  }

  function setMessageStatusIcon(msgEl, status) {
    var old = $('.message-status', msgEl);
    if (!old) return;
    var i = document.createElement('i');
    i.setAttribute('data-lucide', statusIconName(status));
    i.className = 'message-status h-3.5 w-3.5';
    old.replaceWith(i);
  }

  function buildDateDivider(ts) {
    var node = byId('tpl-chat-date-divider').content.firstElementChild.cloneNode(true);
    $('.chat-date-label', node).textContent = dayLabel(ts);
    return node;
  }

  function buildMessage(chat, msg) {
    var mine = msg.from === ME;
    var node = byId(mine ? 'tpl-message-outgoing' : 'tpl-message-incoming').content.firstElementChild.cloneNode(true);
    node.setAttribute('data-message-id', msg.id);
    $('.message-text', node).textContent = msg.text;
    var time = $('.message-time', node);
    time.textContent = fmtClock(msg.createdAt);
    time.setAttribute('datetime', new Date(msg.createdAt).toISOString());
    if (mine) {
      $('.message-status', node).setAttribute('data-lucide', statusIconName(msg.status));
    } else if (chat.type === 'group') {
      var sender = getUserById(msg.from);
      if (sender) {
        var label = document.createElement('span');
        label.className = 'message-sender mb-0.5 px-1 text-xs font-bold';
        label.style.color = 'hsl(' + (hashStr(sender.id) % 360) + ' 55% 45%)';
        label.textContent = sender.displayName;
        node.insertBefore(label, node.firstChild);
      }
    }
    return node;
  }

  function isNearBottom() {
    var el = dom.chatMessages;
    return el.scrollHeight - el.scrollTop - el.clientHeight < 160;
  }
  function scrollMessagesToBottom(smooth) {
    var el = dom.chatMessages;
    if (el.scrollTo) el.scrollTo({ top: el.scrollHeight, behavior: smooth ? 'smooth' : 'auto' });
    else el.scrollTop = el.scrollHeight;
    setShown(dom.chatScrollBottom, false, 'flex');
  }
  function showTyping(show) {
    var near = isNearBottom();
    setShown(dom.chatTyping, show, 'flex');
    if (show && near) scrollMessagesToBottom(true);
  }

  function renderChatRoom() {
    var chat = getChat(ui.activeChatId);
    if (!chat) { navigateTo('chat-list'); return; }
    chat.unread = 0;
    saveState();
    updateBadges();

    dom.chatRoomAvatar.src = chatAvatar(chat);
    dom.chatRoomAvatar.alt = '';
    dom.chatRoomName.textContent = chatTitle(chat);
    dom.chatRoomStatus.textContent = chatStatusText(chat);
    dom.chatRoomOnlineDot.classList.toggle('hidden', !(chat.type === 'dm' && chat.online));

    var box = dom.chatMessages;
    box.textContent = '';
    var frag = document.createDocumentFragment();
    if (!chat.messages.length) {
      var hint = document.createElement('p');
      hint.className = 'my-auto text-center text-sm text-slate-500 dark:text-slate-400';
      hint.textContent = 'هێشتا نامەیەک نییە؛ یەکەم نامە بنێرە.';
      frag.appendChild(hint);
    }
    chat.messages.forEach(function (m, i) {
      var prev = i > 0 ? chat.messages[i - 1] : null;
      if (!prev || !isSameDay(prev.createdAt, m.createdAt)) frag.appendChild(buildDateDivider(m.createdAt));
      frag.appendChild(buildMessage(chat, m));
    });
    box.appendChild(frag);
    setShown(dom.chatTyping, (ui.pendingReplies[chat.id] || 0) > 0, 'flex');
    dom.chatInput.value = '';
    autosizeChatInput();
    dom.chatSend.disabled = true;
    refreshIcons();
    scrollMessagesToBottom(false);
  }

  function appendMessageDOM(chat, msg) {
    var box = dom.chatMessages;
    var placeholder = $('p.my-auto', box);
    if (placeholder) placeholder.remove();
    var near = isNearBottom();
    var idx = chat.messages.indexOf(msg);
    var prev = idx > 0 ? chat.messages[idx - 1] : null;
    var frag = document.createDocumentFragment();
    if (!prev || !isSameDay(prev.createdAt, msg.createdAt)) frag.appendChild(buildDateDivider(msg.createdAt));
    frag.appendChild(buildMessage(chat, msg));
    box.appendChild(frag);
    refreshIcons();
    if (msg.from === ME || near) scrollMessagesToBottom(true);
    else setShown(dom.chatScrollBottom, true, 'flex');
  }

  function updateReadIcons(chat) {
    chat.messages.forEach(function (m) {
      if (m.from !== ME) return;
      var el = dom.chatMessages.querySelector('[data-message-id="' + m.id + '"]');
      if (el) setMessageStatusIcon(el, m.status);
    });
    refreshIcons();
  }

  function autosizeChatInput() {
    var el = dom.chatInput;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 120) + 'px';
  }

  function pickReplier(chat) {
    if (chat.type === 'dm') return getUserById(chat.participantIds[0]) || fallbackUser();
    var members = chat.participantIds.map(getUserById).filter(Boolean);
    return members.length ? pick(members) : fallbackUser();
  }

  function scheduleReply(chat, userMsg) {
    ui.pendingReplies[chat.id] = (ui.pendingReplies[chat.id] || 0) + 1;
    if (ui.currentView === 'chat-room' && ui.activeChatId === chat.id) showTyping(true);
    setTimeout(function () {
      ui.pendingReplies[chat.id] = Math.max(0, (ui.pendingReplies[chat.id] || 1) - 1);
      var replier = pickReplier(chat);
      var reply = { id: uid('m'), from: replier.id, text: pickReply(userMsg.text, chat), createdAt: Date.now() };
      chat.messages.forEach(function (m) { if (m.from === ME) m.status = 'read'; });
      chat.messages.push(reply);
      chat.lastActivity = reply.createdAt;
      var active = ui.currentView === 'chat-room' && ui.activeChatId === chat.id;
      if (!active) chat.unread = (chat.unread || 0) + 1;
      saveState();
      if (active) {
        if (!ui.pendingReplies[chat.id]) showTyping(false);
        updateReadIcons(chat);
        appendMessageDOM(chat, reply);
      } else {
        updateBadges();
        if (ui.currentView === 'chat-list') renderChatList();
      }
    }, 1100);
  }

  function sendChatMessage() {
    var chat = getChat(ui.activeChatId);
    if (!chat) return;
    var text = normalizeText(dom.chatInput.value).trim();
    if (!text) return;
    var msg = { id: uid('m'), from: ME, text: text, createdAt: Date.now(), status: 'sent' };
    chat.messages.push(msg);
    chat.lastActivity = msg.createdAt;
    saveState();
    dom.chatInput.value = '';
    autosizeChatInput();
    dom.chatSend.disabled = true;
    appendMessageDOM(chat, msg);
    scheduleReply(chat, msg);
    dom.chatInput.focus();
  }

  function showChatRoomMenu(anchor) {
    var chat = getChat(ui.activeChatId);
    if (!chat) return;
    showMenu(anchor, [
      {
        label: chat.muted ? 'چالاککردنی ئاگادارکردنەوە' : 'بێدەنگکردن', icon: chat.muted ? 'bell' : 'bell-off',
        onClick: function () {
          chat.muted = !chat.muted;
          saveState();
          updateBadges();
          toast(chat.muted ? 'گفتوگۆکە بێدەنگ کرا' : 'ئاگادارکردنەوە چالاک کرایەوە', 'success');
        }
      },
      {
        label: 'پاککردنەوەی نامەکان', icon: 'eraser', danger: true, keepOpen: true,
        onClick: function (ctrl) {
          ctrl.setItems([
            { label: 'هەموو نامەکان دەسڕێنەوە؟', icon: 'triangle-alert', keepOpen: true, onClick: function () {} },
            {
              label: 'بەڵێ، پاکی بکەرەوە', icon: 'eraser', danger: true,
              onClick: function () { chat.messages = []; saveState(); renderChatRoom(); toast('نامەکان پاککرانەوە', 'success'); }
            },
            { label: 'پاشگەزبوونەوە', icon: 'x', onClick: function () {} }
          ]);
        }
      },
      {
        label: 'سڕینەوەی گفتوگۆ', icon: 'trash-2', danger: true, keepOpen: true,
        onClick: function (ctrl) {
          ctrl.setItems([
            { label: 'گفتوگۆکە دەسڕدرێتەوە؟', icon: 'triangle-alert', keepOpen: true, onClick: function () {} },
            {
              label: 'بەڵێ، بیسڕەوە', icon: 'trash-2', danger: true,
              onClick: function () {
                state.chats = state.chats.filter(function (c) { return c.id !== chat.id; });
                ui.activeChatId = null;
                saveState();
                ui.history = [];
                navigateTo('chat-list');
                toast('گفتوگۆکە سڕایەوە', 'success');
              }
            },
            { label: 'پاشگەزبوونەوە', icon: 'x', onClick: function () {} }
          ]);
        }
      }
    ], { alignEnd: false });
  }

  /* ==========================================================================
   * 18. SETTINGS, OPEN KURDISH AI CORPUS EXPORT, JSON-LD
   * ======================================================================== */
  function syncSettingsUI() {
    var s = state.settings;
    dom.settingNotifLikes.checked = !!s.notifLikes;
    dom.settingNotifReplies.checked = !!s.notifReplies;
    dom.settingNotifFollows.checked = !!s.notifFollows;
    dom.settingNotifMessages.checked = !!s.notifMessages;
    dom.settingPrivateAccount.checked = !!s.privateAccount;
    dom.settingReadReceipts.checked = !!s.readReceipts;
    $$('input[name="theme"]').forEach(function (r) { r.checked = r.value === state.theme; });
    updateCorpusStats();
  }

  function injectCorpusSection() {
    var container = $('#view-settings > div');
    if (!container || byId('export-jsonl-btn')) return;
    var sec = document.createElement('section');
    sec.setAttribute('aria-labelledby', 'settings-corpus-title');
    sec.innerHTML =
      '<h3 id="settings-corpus-title" class="mb-2 px-1 text-xs font-bold tracking-wide text-slate-500 dark:text-slate-400">ژێرخانی کراوەی ژیریی دەستکرد (Open Kurdish AI Corpus)</h3>' +
      '<div class="space-y-3 rounded-2xl border border-brand-200 bg-brand-50/60 p-4 dark:border-white/10 dark:bg-brand-900/20">' +
      '<p class="text-sm leading-7 text-slate-700 dark:text-slate-300">هەموو پۆستەکانی مەکۆ دەتوانرێت وەک داتاسێتێکی کراوەی کوردی بە UTF-8 و مۆڵەتی <span dir="ltr" class="inline-block font-semibold">CC-BY-4.0</span> دابەزێنرێت؛ هەر دێڕێک پۆستێکە بە دەقی ئارامی، ئەلفوبێی لاتینی (هاوار)، ژمارەی وشە، ژانر و نووسەر.</p>' +
      '<p id="corpus-stats" class="text-xs text-slate-500 dark:text-slate-400"></p>' +
      '<button id="export-jsonl-btn" type="button" class="flex w-full items-center justify-center gap-2 rounded-full bg-brand-600 px-5 py-3 text-sm font-bold text-white shadow-md shadow-brand-600/25 transition hover:bg-brand-700 active:scale-95"><i data-lucide="download" class="h-4 w-4"></i><span>داگرتنی داتاسێت بە فۆرماتی JSONL</span></button>' +
      '<button id="reset-seed-btn" type="button" class="flex w-full items-center justify-center gap-2 rounded-full border border-slate-300 px-5 py-3 text-sm font-bold transition hover:bg-slate-100 active:scale-95 dark:border-white/20 dark:hover:bg-white/10"><i data-lucide="rotate-ccw" class="h-4 w-4"></i><span>گەڕاندنەوەی داتای بنەڕەتی</span></button>' +
      '</div>';
    container.appendChild(sec);
    dom.exportJsonlBtn = byId('export-jsonl-btn');
    dom.resetSeedBtn = byId('reset-seed-btn');
    dom.corpusStats = byId('corpus-stats');
    dom.exportJsonlBtn.addEventListener('click', exportCorpus);
    dom.resetSeedBtn.addEventListener('click', onResetClick);
  }

  function updateCorpusStats() {
    if (!dom.corpusStats) return;
    var words = state.posts.reduce(function (s, p) { return s + countWords(p.text); }, 0);
    dom.corpusStats.textContent = toKu(state.posts.length) + ' پۆست · ' + toKu(words) + ' وشە · مۆڵەت: CC-BY-4.0';
  }

  function exportCorpus() {
    var lines = sortedPosts().map(function (p) {
      var a = getUserById(p.authorId) || fallbackUser();
      var arab = normalizeText(p.text);
      var latin = toLatin(p.text);
      return JSON.stringify({
        id: p.id,
        text: arab,
        text_latin: latin == null ? '' : latin,
        language: 'ckb',
        script: 'Arab',
        word_count: countWords(p.text),
        genre: p.isPoetry ? 'poetry' : 'prose',
        author: a.displayName,
        author_handle: a.username,
        created_at: new Date(p.createdAt).toISOString(),
        likes: p.likes,
        comments: p.comments.length,
        license: 'CC-BY-4.0',
        source: 'meko'
      });
    });
    var blob = new Blob([lines.join('\n') + '\n'], { type: 'application/x-ndjson;charset=utf-8' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = 'meko_kurdish_corpus.jsonl';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(function () { URL.revokeObjectURL(url); }, 1500);
    toast('داتاسێتەکە دابەزێنرا (' + toKu(lines.length) + ' پۆست)', 'success');
  }

  function setResetButtonLabel(text) {
    var span = $('span', dom.resetSeedBtn);
    if (span) span.textContent = text;
  }

  function onResetClick() {
    if (!ui.resetArmed) {
      ui.resetArmed = true;
      setResetButtonLabel('دڵنیایت؟ دووبارە کرتە بکە بۆ گەڕاندنەوە');
      dom.resetSeedBtn.classList.add('border-rose-500', 'text-rose-500');
      ui.resetTimer = setTimeout(disarmReset, 4000);
      return;
    }
    disarmReset();
    resetToSeed();
  }

  function disarmReset() {
    ui.resetArmed = false;
    if (ui.resetTimer) clearTimeout(ui.resetTimer);
    if (dom.resetSeedBtn) {
      setResetButtonLabel('گەڕاندنەوەی داتای بنەڕەتی');
      dom.resetSeedBtn.classList.remove('border-rose-500', 'text-rose-500');
    }
  }

  function resetToSeed() {
    state = buildSeedState();
    try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (e) { /* ignore */ }
    closePopup();
    closeEditProfile();
    if (creator.open) closeCreator();
    resetCreator();
    ui.history = [];
    ui.feedTab = 'for-you';
    ui.feedVisible = FEED_PAGE_SIZE;
    ui.profileTab = 'posts';
    ui.notifFilter = 'all';
    ui.activeChatId = null;
    ui.pendingPosts = [];
    ui.pendingReplies = {};
    dom.chatSearch.value = '';
    applyTheme();
    syncCurrentUserUI();
    updateBadges();
    updateJsonLd();
    navigateTo('home');
    scheduleIncoming();
    toast('داتای بنەڕەتی گەڕێندرایەوە', 'success');
  }

  function updateJsonLd() {
    var node = dom.mekoJsonld || byId('meko-jsonld');
    if (!node || !state) return;
    var base = '';
    try {
      if (window.location && window.location.protocol && window.location.protocol.indexOf('http') === 0) {
        base = window.location.origin + window.location.pathname;
      }
    } catch (e) { base = ''; }
    var graph = sortedPosts().slice(0, 50).map(function (p) {
      var a = getUserById(p.authorId) || fallbackUser();
      var item = {
        '@type': 'SocialMediaPosting',
        'headline': excerpt(p.text, 100),
        'articleBody': p.text,
        'inLanguage': 'ku',
        'genre': p.isPoetry ? 'Poetry' : 'Prose',
        'datePublished': new Date(p.createdAt).toISOString(),
        'author': { '@type': 'Person', 'name': a.displayName, 'alternateName': '@' + a.username, 'identifier': a.username },
        'interactionStatistic': [
          { '@type': 'InteractionCounter', 'interactionType': 'https://schema.org/LikeAction', 'userInteractionCount': p.likes },
          { '@type': 'InteractionCounter', 'interactionType': 'https://schema.org/CommentAction', 'userInteractionCount': p.comments.length }
        ],
        'commentCount': p.comments.length,
        'comment': p.comments.slice(0, 10).map(function (c) {
          var ca = getUserById(c.authorId) || fallbackUser();
          return {
            '@type': 'Comment', 'text': c.text, 'dateCreated': new Date(c.createdAt).toISOString(),
            'author': { '@type': 'Person', 'name': ca.displayName, 'identifier': ca.username }
          };
        })
      };
      if (base) { item['@id'] = base + '#post-' + p.id; item['url'] = base + '#post-' + p.id; }
      return item;
    });
    var json = JSON.stringify({ '@context': 'https://schema.org', '@graph': graph });
    node.textContent = json.replace(/</g, '\\u003c');
  }

  /* ==========================================================================
   * 19. EVENT BINDING
   * ======================================================================== */
  function bindEvents() {
    /* ---- Bottom bar & drawer ---- */
    dom.bottomBar.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-nav-target]');
      if (!btn) return;
      var target = btn.getAttribute('data-nav-target');
      ui.history = [];
      if (target === 'home' && ui.currentView === 'home') { window.scrollTo({ top: 0, behavior: 'smooth' }); return; }
      navigateTo(target);
    });
    dom.navMenu.addEventListener('click', openDrawer);
    dom.sidebarClose.addEventListener('click', function () { closeDrawer(); });
    dom.sidebarBackdrop.addEventListener('click', function () { closeDrawer(); });
    dom.sidebarPanel.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-nav-target]');
      if (!btn) return;
      var target = btn.getAttribute('data-nav-target');
      closeDrawer(false);
      if (target === 'profile') {
        state.viewingUserHandle = state.currentUser.username;
        ui.profileTab = 'posts';
      }
      navigateTo(target);
    });

    /* ---- Theme ---- */
    dom.themeToggle.addEventListener('click', function () { setTheme(isDarkEffective() ? 'light' : 'dark'); });
    $$('input[name="theme"]').forEach(function (r) {
      r.addEventListener('change', function () { if (r.checked) setTheme(r.value); });
    });
    if (window.matchMedia) {
      var mq = window.matchMedia('(prefers-color-scheme: dark)');
      var onMq = function () { if (state.theme === 'system') applyTheme(); };
      if (mq.addEventListener) mq.addEventListener('change', onMq);
      else if (mq.addListener) mq.addListener(onMq);
    }

    /* ---- Back buttons ---- */
    dom.profileBack.addEventListener('click', goBack);
    dom.savedBack.addEventListener('click', goBack);
    dom.settingsBack.addEventListener('click', goBack);
    dom.chatBack.addEventListener('click', function () { ui.history = []; navigateTo('chat-list'); });

    /* ---- Feed ---- */
    bindPostList(dom.feedList);
    bindPostList(dom.profilePostsList);
    bindPostList(dom.savedList);
    dom.feedTabs.addEventListener('click', function (e) {
      var tab = e.target.closest('[data-feed]');
      if (!tab) return;
      ui.feedTab = tab.getAttribute('data-feed');
      ui.feedVisible = FEED_PAGE_SIZE;
      renderFeed();
    });
    dom.feedRefresh.addEventListener('click', refreshFeed);
    dom.feedRetry.addEventListener('click', renderFeed);
    dom.newPostsPill.addEventListener('click', function () {
      flushPending();
      ui.feedVisible = Math.max(ui.feedVisible, FEED_PAGE_SIZE);
      renderFeed();
      window.scrollTo({ top: 0, behavior: 'smooth' });
      scheduleIncoming();
    });
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        if (entries.some(function (en) { return en.isIntersecting; })) loadMoreFeed();
      }, { rootMargin: '400px' }).observe(dom.feedSentinel);
    } else {
      window.addEventListener('scroll', function () { if (sentinelVisible()) loadMoreFeed(); }, { passive: true });
    }

    /* ---- Creator ---- */
    [dom.navCreate, dom.homeComposerTrigger, dom.feedEmptyCreate].forEach(function (b) {
      b.addEventListener('click', function () { openCreator(); });
    });
    dom.homeComposerImage.addEventListener('click', function () { openCreator({ pickImage: true }); });
    dom.creatorTextarea.addEventListener('input', updateCreatorUI);
    dom.creatorTextarea.addEventListener('keydown', function (e) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter' && !dom.creatorSubmit.disabled) { e.preventDefault(); submitCreator(); }
    });
    dom.creatorPoetryToggle.addEventListener('click', function () {
      creator.isPoetry = !creator.isPoetry;
      updateCreatorUI();
      dom.creatorTextarea.focus();
    });
    dom.creatorAddImage.addEventListener('click', function () { dom.creatorFileInput.click(); });
    dom.creatorFileInput.addEventListener('change', function () {
      addCreatorFiles(dom.creatorFileInput.files).then(function () { dom.creatorFileInput.value = ''; });
    });
    dom.creatorAddEmoji.addEventListener('click', function () { showEmojiPicker(dom.creatorAddEmoji, dom.creatorTextarea); });
    dom.creatorAddLocation.addEventListener('click', function () {
      var loc = locationText(state.currentUser);
      if (!loc) { toast('سەرەتا شوێنەکەت لە پرۆفایلدا دیاری بکە.', 'info'); return; }
      insertAtCursor(dom.creatorTextarea, '📍 ' + loc);
    });
    dom.creatorClose.addEventListener('click', requestCloseCreator);
    dom.creatorSubmit.addEventListener('click', submitCreator);
    dom.creatorDiscardConfirm.addEventListener('click', discardCreator);
    dom.creatorSaveDraft.addEventListener('click', saveDraft);
    dom.creatorDiscardCancel.addEventListener('click', function () {
      setShown(dom.creatorDiscardSheet, false, 'flex');
      dom.creatorTextarea.focus();
    });

    /* ---- Profile ---- */
    dom.profileTabs.addEventListener('click', function (e) {
      var tab = e.target.closest('[data-profile-tab]');
      if (!tab) return;
      ui.profileTab = tab.getAttribute('data-profile-tab');
      renderProfile();
    });
    dom.profileEditBtn.addEventListener('click', openEditProfile);
    dom.settingsEditProfile.addEventListener('click', openEditProfile);
    dom.profileFollowBtn.addEventListener('click', function () {
      var u = resolveViewingUser();
      if (u.id === state.currentUser.id) return;
      var now = toggleFollow(u.id);
      toast(now ? 'ئێستا شوێنکەوتووی ' + u.displayName + 'یت' : 'وازت لە شوێنکەوتن هێنا', 'success');
      renderProfile();
    });
    dom.profileMessageBtn.addEventListener('click', function () {
      var u = resolveViewingUser();
      if (u.id !== state.currentUser.id) openChatWithUser(u.id);
    });
    dom.profileFollowingBtn.addEventListener('click', function () {
      var u = resolveViewingUser();
      toast(fmtCount(u.followingCount) + ' کەس شوێنکەوتوویەتی', 'info');
    });
    dom.profileFollowersBtn.addEventListener('click', function () {
      var u = resolveViewingUser();
      toast(fmtCount(u.followersCount) + ' کەس شوێنکەوتوویانە', 'info');
    });

    /* ---- Edit profile modal ---- */
    dom.editProfileClose.addEventListener('click', closeEditProfile);
    dom.editProfileCancel.addEventListener('click', closeEditProfile);
    dom.editProfileBackdrop.addEventListener('click', closeEditProfile);
    dom.editProfileForm.addEventListener('submit', function (e) { e.preventDefault(); saveEditProfile(); });
    [dom.editDisplayName, dom.editUsername, dom.editBio].forEach(function (el) {
      el.addEventListener('input', function () {
        updateEditCounters();
        if (el === dom.editDisplayName && dom.editNameError && !dom.editNameError.classList.contains('hidden')) validateEditForm();
        if (el === dom.editUsername) {
          var v = el.value.trim().replace(/^@+/, '');
          if (!v) setFieldError(el, dom.editUsernameError, '');
          else validateEditForm();
        }
      });
    });
    dom.editCountry.addEventListener('change', function () { rebuildCityOptions(dom.editCountry.value, ''); });

    /* ---- Notifications ---- */
    dom.notifTabs.addEventListener('click', function (e) {
      var tab = e.target.closest('[data-notif-filter]');
      if (!tab) return;
      ui.notifFilter = tab.getAttribute('data-notif-filter');
      renderNotifications();
    });
    dom.notifList.addEventListener('click', handleNotifClick);
    dom.notifMarkAll.addEventListener('click', markAllNotificationsRead);

    /* ---- Settings toggles ---- */
    var settingMap = [
      ['settingNotifLikes', 'notifLikes'], ['settingNotifReplies', 'notifReplies'], ['settingNotifFollows', 'notifFollows'],
      ['settingNotifMessages', 'notifMessages'], ['settingPrivateAccount', 'privateAccount'], ['settingReadReceipts', 'readReceipts']
    ];
    settingMap.forEach(function (pair) {
      dom[pair[0]].addEventListener('change', function () {
        state.settings[pair[1]] = dom[pair[0]].checked;
        saveState();
        updateBadges();
      });
    });

    /* ---- Chat list ---- */
    dom.chatList.addEventListener('click', function (e) {
      var item = e.target.closest('.chat-item');
      if (item) openChat(item.getAttribute('data-chat-id'));
    });
    dom.chatSearch.addEventListener('input', renderChatList);

    /* ---- Chat room ---- */
    dom.chatInput.addEventListener('input', function () {
      autosizeChatInput();
      dom.chatSend.disabled = !dom.chatInput.value.trim();
    });
    dom.chatInput.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && !e.shiftKey && !e.isComposing && finePointer()) {
        e.preventDefault();
        sendChatMessage();
      }
    });
    dom.chatForm.addEventListener('submit', function (e) { e.preventDefault(); sendChatMessage(); });
    dom.chatMessages.addEventListener('scroll', function () {
      setShown(dom.chatScrollBottom, !isNearBottom(), 'flex');
    }, { passive: true });
    dom.chatScrollBottom.addEventListener('click', function () { scrollMessagesToBottom(true); });
    dom.chatEmojiBtn.addEventListener('click', function () { showEmojiPicker(dom.chatEmojiBtn, dom.chatInput); });
    dom.chatRoomMenu.addEventListener('click', function () { showChatRoomMenu(dom.chatRoomMenu); });
    dom.chatRoomProfile.addEventListener('click', function () {
      var chat = getChat(ui.activeChatId);
      if (!chat) return;
      if (chat.type === 'dm') {
        var u = getUserById(chat.participantIds[0]);
        if (u) openProfile(u.username);
      } else {
        var names = chat.participantIds.map(function (id) { var u2 = getUserById(id); return u2 ? u2.displayName : ''; }).filter(Boolean);
        toast('ئەندامان: ' + names.concat([state.currentUser.displayName]).join('، '), 'info');
      }
    });

    /* ---- Global keyboard ---- */
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        if (ui.popupCleanup) { closePopup(); return; }
        if (creator.open && isShown(dom.creatorDiscardSheet)) {
          setShown(dom.creatorDiscardSheet, false, 'flex');
          return;
        }
        if (creator.open) { requestCloseCreator(); return; }
        if (edit.open) { closeEditProfile(); return; }
        if (ui.drawerOpen) { closeDrawer(); }
      } else if (e.key === 'Tab') {
        if (edit.open) trapTab(e, dom.editProfileModal);
        else if (creator.open) trapTab(e, dom.creatorCanvas);
        else if (ui.drawerOpen) trapTab(e, dom.sidebarPanel);
      }
    });

    /* ---- Keep relative times fresh ---- */
    setInterval(function () {
      if (document.hidden) return;
      if (ui.currentView === 'home' || ui.currentView === 'notifications' || ui.currentView === 'chat-list') {
        if (!creator.open && !edit.open) renderView(ui.currentView);
      }
    }, 60000);
  }

  /* ==========================================================================
   * 20. INIT
   * ======================================================================== */
  function init() {
    cacheDom();
    state = loadState();

    hideSkeletons();
    applyTheme();

    // Dynamic UI that the markup leaves to the script
    injectPoetryToggle();
    injectAvatarPicker();
    injectCorpusSection();
    setupLocationControls();
    setupNotifTabs();

    // Drawer starts closed
    dom.sidebarDrawer.setAttribute('data-state', 'closed');
    dom.sidebarDrawer.setAttribute('aria-hidden', 'true');
    dom.sidebarDrawer.classList.add('drawer-closed');
    dom.sidebarDrawer.classList.remove('drawer-open');

    bindEvents();
    syncCurrentUserUI();
    syncSettingsUI();
    updateBadges();
    updateJsonLd();
    ui.feedTab = 'for-you';
    syncFeedTabs();
    navigateTo('home', { initial: true });
    refreshIcons();
    scheduleIncoming();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
