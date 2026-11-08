/*!
 * Meko (مەکۆ) — app.js
 * Client-side Kurdish social, literary and open AI corpus application.
 * Binds to index.html, styles.css and unicode-engine.js
 * (window.normalizeKurdishText, window.kurdishToLatin).
 */
(function () {
  'use strict';

  /* =====================================================================
     1. CONSTANTS & SMALL HELPERS
     ===================================================================== */
  const STATE_KEY = 'meko_state_v2';
  const THEME_KEY = 'meko_theme';
  const MAX_CHARS = 500;
  const RING_LENGTH = 62.83;
  const MAX_IMAGES = 4;
  const MINUTE = 60000;
  const HOUR = 3600000;
  const DAY = 86400000;
  const KU_DIGITS = '٠١٢٣٤٥٦٧٨٩';
  const MONTHS = ['کانوونی دووەم', 'شوبات', 'ئازار', 'نیسان', 'ئایار', 'حوزەیران', 'تەمموز', 'ئاب', 'ئەیلوول', 'تشرینی یەکەم', 'تشرینی دووەم', 'کانوونی یەکەم'];
  const EMOJIS = ['😊', '😂', '🥹', '😍', '🤍', '💚', '🌿', '🌙', '⭐', '🔥', '👏', '🙏', '🤝', '📖', '✍️', '🪶', '🎶', '🏔️', '☀️', '🌹', '👍', '🤔', '😅', '🎉'];
  const NOTIF_TYPES = ['LIKE', 'COMMENT', 'FOLLOW'];
  const NOTIF_SETTING_KEY = { LIKE: 'notifLikes', COMMENT: 'notifReplies', FOLLOW: 'notifFollows' };
  const NOTIF_ICON = { LIKE: 'heart', COMMENT: 'message-circle', FOLLOW: 'user-plus' };
  const KURDISH_COUNTRY_GROUP = ['iraq', 'turkey', 'iran', 'syria'];
  const EXTRA_CITIES = [
    { value: 'sinjar', label: 'شنگال', country: 'iraq' },
    { value: 'akre', label: 'ئاکرێ', country: 'iraq' },
    { value: 'soran', label: 'سۆران', country: 'iraq' },
    { value: 'chamchamal', label: 'چەمچەماڵ', country: 'iraq' },
    { value: 'batman', label: 'باتمان', country: 'turkey' },
    { value: 'dersim', label: 'دێرسم', country: 'turkey' },
    { value: 'saqqez', label: 'سەقز', country: 'iran' },
    { value: 'marivan', label: 'مەریوان', country: 'iran' },
    { value: 'baneh', label: 'بانە', country: 'iran' }
  ];

  const $ = (id) => document.getElementById(id);
  const qs = (sel, root) => (root || document).querySelector(sel);
  const qsa = (sel, root) => Array.from((root || document).querySelectorAll(sel));
  const toKu = (v) => String(v).replace(/\d/g, (d) => KU_DIGITS[d]);
  const clamp = (n, a, b) => Math.min(Math.max(n, a), b);
  const uid = (p) => p + '_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  const isObj = (v) => v && typeof v === 'object' && !Array.isArray(v);

  function fmtCount(n) {
    n = Number(n) || 0;
    const compact = (x, unit) => toKu(x.toFixed(1).replace(/\.0$/, '')).replace('.', '٫') + ' ' + unit;
    if (n >= 1000000) return compact(n / 1000000, 'ملیۆن');
    if (n >= 1000) return compact(n / 1000, 'هەزار');
    return toKu(n);
  }

  function normalize(text) {
    const s = String(text == null ? '' : text);
    try {
      return typeof window.normalizeKurdishText === 'function' ? String(window.normalizeKurdishText(s)) : s;
    } catch (e) { return s; }
  }

  function toLatin(text) {
    const s = String(text == null ? '' : text);
    try {
      return typeof window.kurdishToLatin === 'function' ? String(window.kurdishToLatin(s)) : s;
    } catch (e) { return s; }
  }

  function excerpt(text, n) {
    const flat = String(text).replace(/\s+/g, ' ').trim();
    return flat.length > n ? flat.slice(0, n).trim() + '…' : flat;
  }

  function countWords(text) {
    const m = String(text).match(/[\p{L}\p{M}]+/gu);
    return m ? m.length : 0;
  }

  function el(tag, className, text) {
    const n = document.createElement(tag);
    if (className) n.className = className;
    if (text != null) n.textContent = text;
    return n;
  }

  function show(node, display) {
    if (!node) return;
    node.classList.remove('hidden');
    if (display) node.classList.add(display);
  }

  function hide(node, display) {
    if (!node) return;
    node.classList.add('hidden');
    if (display) node.classList.remove(display);
  }

  function refreshIcons() {
    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      try { window.lucide.createIcons({ attrs: { 'stroke-width': 1.75 } }); } catch (e) { /* icons are decorative */ }
    }
  }

  let scrollLocks = 0;
  function lockScroll() { if (scrollLocks++ === 0) document.body.style.overflow = 'hidden'; }
  function unlockScroll() { if (scrollLocks > 0 && --scrollLocks === 0) document.body.style.overflow = ''; }

  /* ----- Dates (Kurdish formatting) ----- */
  function dayKey(ts) { const d = new Date(ts); return d.getFullYear() + '-' + d.getMonth() + '-' + d.getDate(); }

  function shortDate(ts, withYear) {
    const d = new Date(ts);
    let s = toKu(d.getDate()) + ' ' + MONTHS[d.getMonth()];
    if (withYear || d.getFullYear() !== new Date().getFullYear()) s += ' ' + toKu(d.getFullYear());
    return s;
  }

  function clockTime(ts) {
    const d = new Date(ts);
    return toKu(String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0'));
  }

  function timeAgo(ts) {
    const s = Math.max(0, Math.floor((Date.now() - ts) / 1000));
    if (s < 45) return 'ئێستا';
    const m = Math.floor(s / 60);
    if (m < 60) return toKu(Math.max(1, m)) + ' خولەک';
    const h = Math.floor(m / 60);
    if (h < 24) return toKu(h) + ' کاتژمێر';
    const d = Math.floor(h / 24);
    if (d < 7) return toKu(d) + ' ڕۆژ';
    return shortDate(ts, false);
  }

  function dayLabel(ts) {
    const k = dayKey(ts);
    if (k === dayKey(Date.now())) return 'ئەمڕۆ';
    if (k === dayKey(Date.now() - DAY)) return 'دوێنێ';
    return shortDate(ts, true);
  }

  function chatListTime(ts) {
    const k = dayKey(ts);
    if (k === dayKey(Date.now())) return clockTime(ts);
    if (k === dayKey(Date.now() - DAY)) return 'دوێنێ';
    return shortDate(ts, false);
  }

  /* =====================================================================
     2. DETERMINISTIC SVG AVATARS
     ===================================================================== */
  function hashStr(s) {
    let h = 2166136261;
    for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
    return h >>> 0;
  }

  function escapeXml(s) {
    return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' }[c]));
  }

  function initialsOf(name) {
    const words = String(name || '').trim().split(/\s+/).filter(Boolean);
    const first = words[0] ? Array.from(words[0])[0] : '؟';
    const second = words[1] ? Array.from(words[1])[0] : '';
    return (first + (second ? ' ' + second : '')).toUpperCase();
  }

  function makeAvatar(name, key) {
    const h = hashStr(String(key || name));
    const h1 = h % 360;
    const h2 = (h1 + 38 + ((h >>> 9) % 70)) % 360;
    const label = escapeXml(initialsOf(name));
    const size = Array.from(label).length > 2 ? 34 : 42;
    const svg =
      "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 96 96' width='96' height='96'>" +
      "<defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'>" +
      "<stop offset='0' stop-color='hsl(" + h1 + ",68%,46%)'/>" +
      "<stop offset='1' stop-color='hsl(" + h2 + ",72%,32%)'/></linearGradient></defs>" +
      "<rect width='96' height='96' fill='url(#g)'/>" +
      "<text x='48' y='50' text-anchor='middle' dominant-baseline='central' font-family='Vazirmatn,Tahoma,Arial,sans-serif' font-size='" + size + "' font-weight='700' fill='#fff'>" + label + '</text></svg>';
    return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
  }

  /* =====================================================================
     3. NOTIFICATION FACTORY
     ===================================================================== */
  function createNotification(o) {
    const type = NOTIF_TYPES.indexOf(o.type) !== -1 ? o.type : 'LIKE';
    const needsLookup = !(o.actorName && o.actorAvatar);
    const actor = needsLookup ? getUser(o.actorHandle) : null;
    return {
      id: o.id || uid('n'),
      type: type,
      actorName: o.actorName || actor.displayName,
      actorHandle: o.actorHandle,
      actorAvatar: o.actorAvatar || actor.avatar,
      postId: type === 'FOLLOW' ? null : (o.postId || null),
      postExcerpt: type === 'FOLLOW' ? '' : (o.postExcerpt || ''),
      commentText: type === 'COMMENT' ? (o.commentText || '') : '',
      isFollowingBack: type === 'FOLLOW' ? !!o.isFollowingBack : false,
      timestamp: o.timestamp || Date.now(),
      read: !!o.read
    };
  }

  /* =====================================================================
     4. SEED DATA
     ===================================================================== */
  const INCOMING_POOL = [
    {
      authorHandle: 'rebin_ahmad', isPoetry: false,
      text: 'پێشنیارێکم هەیە: هەر وشەیەکی ڕەسەن کە لە باپیر و داپیرانمانەوە بیستوومانە، لەگەڵ ناوی ناوچەکە و ماناکەی لە لێدوانەکانی ئەم پۆستەدا تۆمار بکەین. بەم شێوەیە فەرهەنگێکی زیندوو دروست دەبێت.'
    },
    {
      authorHandle: 'shaho_poet', isPoetry: true,
      text: 'بەهار هات و دەشت و کێو ڕازایەوە\nدڵی غەمگین لە ئاسۆ ڕووناک بووەوە\n\nلە هەر گوڵێکدا ڕەنگی وشەیەک دەبینم\nزمانی دایکم لە خاکدا چەکەرەی کردەوە'
    }
  ];

  function buildSeed() {
    const now = Date.now();
    const ago = (ms) => now - ms;

    const mkUser = (username, displayName, bio, extra) => Object.assign({
      username: username, displayName: displayName, bio: bio,
      avatar: makeAvatar(displayName, username), avatarCustom: false,
      country: 'کوردستان', city: '', countryKey: 'kurdistan', cityKey: '',
      joined: '٢٠٢٥', verified: false, followingCount: 0, followersCount: 0
    }, extra || {});

    const currentUser = {
      displayName: 'والی',
      username: 'wali_kurd',
      bio: 'تەلارسازیی وشە و خەیاڵ؛ هەوڵێک بۆ پاراستن و بووژاندنەوەی زمانی ڕەسەنی کوردی و شیعری کلاسیک لە جیهانی دیجیتاڵیدا.',
      country: 'کوردستان', city: 'کەرکووک', countryKey: 'kurdistan', cityKey: 'kirkuk',
      joined: '٢٠٢٦', verified: true, followingCount: 214, followersCount: 1280,
      avatar: makeAvatar('والی', 'wali_kurd'), avatarCustom: false
    };

    const users = {};
    [
      mkUser('rebin_ahmad', 'ڕێبین ئەحمەد', 'توێژەری زمان و ڕێزمانی کوردی. وشە ڕەسەنەکان کۆدەکەمەوە.', { city: 'سلێمانی', cityKey: 'sulaymaniyah', verified: true, followingCount: 188, followersCount: 2310, joined: '٢٠٢٤' }),
      mkUser('dilan_hawrami', 'دیلان هەورامی', 'نووسەر و وەرگێڕ؛ عاشقی چاوگ و زاراوەکانی کوردی.', { city: 'هەولێر', cityKey: 'erbil', followingCount: 301, followersCount: 940 }),
      mkUser('avesta_dev', 'ئاڤێستا کەریم', 'گەشەپێدەری نەرمەکاڵا؛ داتاسێتی کراوە بۆ ژیریی دەستکردی کوردی.', { city: 'دهۆک', cityKey: 'duhok', followingCount: 97, followersCount: 1675 }),
      mkUser('shaho_poet', 'شاهۆ ئەمین', 'شاعیر؛ غەزەل و شیعری نوێ بە زمانی دایک.', { city: 'سنە', cityKey: 'sanandaj', followingCount: 150, followersCount: 802 }),
      mkUser('hana_sher', 'هانا عەلی', 'خوێنەری دیوانە کۆنەکان و کۆکەرەوەی بەیتی جوان.', { city: 'ئامەد', cityKey: 'amed', followingCount: 260, followersCount: 415 }),
      mkUser('nali_diwan', 'دیوانی نالی', 'پەڕاوێزی خوێندنەوەی شیعری نالی. شیعرەکانی ئێرە بە شێوازی نالی نووسراون و دەقی ڕەسەنی شاعیر نین.', { city: 'سلێمانی', cityKey: 'sulaymaniyah', followingCount: 12, followersCount: 3920 }),
      mkUser('mahwi_garden', 'باخچەی مەحوی', 'خوێندنەوەی ڕێبازی سۆفیگەری لە شیعری کوردیدا. شیعرەکانی ئێرە بە شێوازی مەحوین، نەک دەقی ڕەسەنی شاعیر.', { city: 'سلێمانی', cityKey: 'sulaymaniyah', followingCount: 9, followersCount: 2845 })
    ].forEach((u) => { users[u.username] = u; });

    const cm = (handle, text, msAgo) => ({ id: uid('c'), authorHandle: handle, text: text, timestamp: ago(msAgo) });

    const poemWali = 'دڵم لە مەستیی زمانی دایکم پڕە ئەمشەو\nوشەی ڕەسەن وەکوو ئەستێرە گەشە ئەمشەو\n\nقەڵەم بوو بە بالێک بۆ ئاسمانی خەیاڵم\nکاغەزیش ئاوی ڕووبارێکی تەڕە ئەمشەو\n\nهەر پیتێک دەینووسم ئەمانەتی باوانە\nپاراستنی بۆ من ئەرک و قەدەرە ئەمشەو';
    const poemNali = 'شەو درێژە و دڵ بە ئومێدی دیداری ئەو ماوە\nچاو لە ڕێگەی ئەو گەڕاوە، دەرگای هیوا نەکراوەتەوە\n\nبای بەیان بۆنی گوڵی ڕووی یاری هێنا بۆ دەروونم\nجەرگی سووتاوم بەو بۆنە بەڵکو ساڕێژ بکرێتەوە\n\n— بە شێوازی نالی';
    const poemMahwi = 'ئەی دڵ مەگەڕێ لە دوای ئەو شتەی لە دەرەوەیە\nخوا لە ناو خۆتە، بەڵام تۆ لێی بێ‌ئاگایە\n\nئاوێنەی دڵت پاک بکە لە ژەنگی خۆپەرستی\nهەر کە ڕووناک بوو، هەموو شتێک تێیدا دیارە\n\n— بە شێوازی مەحوی';

    const posts = [
      {
        id: 'p_101', authorHandle: 'wali_kurd', text: poemWali, isPoetry: true, timestamp: ago(25 * MINUTE),
        likes: 142, likedByMe: true, reposts: 11, scriptMode: 'arab', media: [],
        comments: [
          cm('rebin_ahmad', 'غەزەلێکی پاراو و ڕەسەنە، دەستت خۆش بێت والی گیان.', 18 * MINUTE),
          cm('dilan_hawrami', 'قافیە و ڕەدیف زۆر ڕێک هاتوون. بەردەوام بە!', 9 * MINUTE)
        ]
      },
      {
        id: 'p_102', authorHandle: 'nali_diwan', text: poemNali, isPoetry: true, timestamp: ago(2 * HOUR + 10 * MINUTE),
        likes: 389, likedByMe: false, reposts: 54, scriptMode: 'arab', media: [],
        comments: [
          cm('hana_sher', 'خوێندنەوەی ئەم جۆرە شیعرە ئاسوودەییەکی تایبەت دەدات.', 95 * MINUTE),
          cm('wali_kurd', 'ئاوازی شێوازی نالی بە باشی پارێزراوە.', 70 * MINUTE)
        ]
      },
      {
        id: 'p_103', authorHandle: 'rebin_ahmad', isPoetry: false, timestamp: ago(55 * MINUTE),
        text: 'وشەی «ئاوەز» یەکێکە لەو وشە ڕەسەنانەی کە مانای عەقڵ و ژیری دەگەیەنێت. ئەگەر لە قسەکردن و نووسیندا زیاتر بەکاری بهێنین، پێویستمان بە قەرزکردنی هەموو وشەیەک نابێت.\n\nتۆ کام وشە ڕەسەنەکانت زیاتر خۆشدەوێت؟',
        likes: 96, likedByMe: true, reposts: 8, scriptMode: 'arab', media: [],
        comments: [
          cm('avesta_dev', 'من «ئاوەز»م لە داتاسێتەکەماندا بە چەندین مانا تۆمار کردووە.', 30 * MINUTE),
          cm('hana_sher', 'منیش زۆر دڵخۆشم بەم وشەیە، ئاوازێکی جوانی هەیە.', 22 * MINUTE),
          cm('wali_kurd', 'سوپاس ڕێبین گیان، پێشنیارەکەت زۆر بەجێیە.', 15 * MINUTE)
        ]
      },
      {
        id: 'p_104', authorHandle: 'avesta_dev', isPoetry: false, timestamp: ago(4 * HOUR),
        text: 'بۆ ئەوەی ژیریی دەستکرد کوردی ڕاست فێر بێت، پێویستمان بە دەقی یەکگرتووە: کۆدکردنی UTF-8، پیتی کوردیی دروست (ی، ک، ە، ڵ، ڕ، ۆ، ێ) و بێ تێکەڵکردنی پیتی عەرەبی و فارسی.\n\nمەکۆ هەموو پۆستەکان بە مۆڵەتی CC-BY-4.0 وەک داتاسێتێکی کراوە ئامادە دەکات.',
        likes: 211, likedByMe: false, reposts: 37, scriptMode: 'arab', media: [],
        comments: [
          cm('rebin_ahmad', 'ئەمە بنەمای هەر کۆرپەسێکی باشە؛ سوپاس بۆ ڕوونکردنەوەکە.', 3 * HOUR),
          cm('dilan_hawrami', 'دەکرێ نموونەی ناڕێکی پیتەکانیش لە ماڵپەڕەکەدا نیشان بدرێت؟', 2 * HOUR + 20 * MINUTE)
        ]
      },
      {
        id: 'p_105', authorHandle: 'mahwi_garden', text: poemMahwi, isPoetry: true, timestamp: ago(7 * HOUR),
        likes: 274, likedByMe: true, reposts: 29, scriptMode: 'arab', media: [],
        comments: [
          cm('shaho_poet', 'ئاوێنەی دڵ: وێنەیەکی زۆر کاریگەر.', 6 * HOUR)
        ]
      },
      {
        id: 'p_106', authorHandle: 'dilan_hawrami', isPoetry: false, timestamp: ago(11 * HOUR),
        text: 'لە زمانی کوردیدا «چاوگ» ناوی بنەڕەتیی کردارە، وەک «نووسین»، «خوێندن» و «کردن». کاتەکانی کردار لە چاوگەوە دروست دەبن: لە «نووسین»ەوە دەبێتە «دەنووسم» و «نووسیم».\n\nئەگەر ئەم گۆڕانکارییانە بە شێوەیەکی ڕێکخراو تۆمار بکرێن، یارمەتیدەر دەبن بۆ فێرخوازان و مۆدێلە زمانییەکان.',
        likes: 128, likedByMe: false, reposts: 16, scriptMode: 'arab', media: [],
        comments: [
          cm('wali_kurd', 'باشترین ڕێگا ئەوەیە بۆ هەر چاوگێک خشتەیەکی تەواو دروست بکەین.', 9 * HOUR),
          cm('avesta_dev', 'ئامادەم خشتەکان بکەمە فۆرماتێکی خوێندراو بۆ ئامێر.', 8 * HOUR)
        ]
      },
      {
        id: 'p_107', authorHandle: 'wali_kurd', isPoetry: false, timestamp: ago(1 * DAY + 3 * HOUR),
        text: 'ئەمڕۆ لە ئەرشیڤی وشەکاندا چاوم بە وشەی «داڤین» کەوت. ئەم وشەیە لە کام ناوچە و کام زاراوەدا دەبیستن؟ ماناکەی چییە؟\n\nبا لە لێدوانەکاندا کۆی بکەینەوە و وەک بەشێک لە فەرهەنگی کراوەی کوردی تۆماری بکەین.',
        likes: 73, likedByMe: false, reposts: 5, scriptMode: 'arab', media: [],
        comments: [
          cm('hana_sher', 'لە ناوچەکەی ئێمەدا هەندێک جار بیستوومە، بەڵام دڵنیا نیم لە ماناکەی. با پێکەوە بیدۆزینەوە.', 1 * DAY),
          cm('rebin_ahmad', 'ناوچە و نموونەی ڕستە بنووسن، ئەمە بۆ تۆمارکردن زۆر گرنگە.', 22 * HOUR)
        ]
      },
      {
        id: 'p_108', authorHandle: 'hana_sher', isPoetry: false, timestamp: ago(2 * DAY + 5 * HOUR),
        text: 'خوێندنەوەی دیوانە کۆنەکان وەک گەڕان بە ناو شارێکی کۆندا وایە؛ هەر وشەیەک کۆڵانێکە و هەر بەیتێک دەرگایەکە بۆ ڕۆژگارێکی تر.\n\nئەمشەو بەیتێکی جوانم دۆزییەوە و دەمەوێت لەگەڵ ئێوە بەشی بکەم.',
        likes: 58, likedByMe: false, reposts: 3, scriptMode: 'arab', media: [],
        comments: [
          cm('shaho_poet', 'چاوەڕێی بەیتەکەتم، هانا گیان.', 2 * DAY)
        ]
      }
    ];

    const find = (id) => posts.find((p) => p.id === id);
    const nUser = (h) => users[h];
    const notifications = [
      createNotification({ id: 'n_1', type: 'LIKE', actorName: nUser('rebin_ahmad').displayName, actorHandle: 'rebin_ahmad', actorAvatar: nUser('rebin_ahmad').avatar, postId: 'p_101', postExcerpt: excerpt(find('p_101').text, 70), timestamp: ago(12 * MINUTE), read: false }),
      createNotification({ id: 'n_2', type: 'COMMENT', actorName: nUser('dilan_hawrami').displayName, actorHandle: 'dilan_hawrami', actorAvatar: nUser('dilan_hawrami').avatar, postId: 'p_101', postExcerpt: excerpt(find('p_101').text, 70), commentText: 'قافیە و ڕەدیف زۆر ڕێک هاتوون. بەردەوام بە!', timestamp: ago(9 * MINUTE), read: false }),
      createNotification({ id: 'n_3', type: 'FOLLOW', actorName: nUser('hana_sher').displayName, actorHandle: 'hana_sher', actorAvatar: nUser('hana_sher').avatar, isFollowingBack: false, timestamp: ago(2 * HOUR), read: false }),
      createNotification({ id: 'n_4', type: 'LIKE', actorName: nUser('avesta_dev').displayName, actorHandle: 'avesta_dev', actorAvatar: nUser('avesta_dev').avatar, postId: 'p_107', postExcerpt: excerpt(find('p_107').text, 70), timestamp: ago(5 * HOUR), read: true }),
      createNotification({ id: 'n_5', type: 'COMMENT', actorName: nUser('rebin_ahmad').displayName, actorHandle: 'rebin_ahmad', actorAvatar: nUser('rebin_ahmad').avatar, postId: 'p_107', postExcerpt: excerpt(find('p_107').text, 70), commentText: 'ناوچە و نموونەی ڕستە بنووسن، ئەمە بۆ تۆمارکردن زۆر گرنگە.', timestamp: ago(22 * HOUR), read: false }),
      createNotification({ id: 'n_6', type: 'FOLLOW', actorName: nUser('shaho_poet').displayName, actorHandle: 'shaho_poet', actorAvatar: nUser('shaho_poet').avatar, isFollowingBack: true, timestamp: ago(1 * DAY + 4 * HOUR), read: true })
    ];

    const m = (from, text, msAgo, status) => ({ id: uid('m'), from: from, text: text, ts: ago(msAgo), status: status || 'read' });
    const groupAvatar = (name) => makeAvatar(name, 'group:' + name);
    const gName1 = 'ئەنجومەنی زمان و ژیریی دەستکردی کوردی';
    const gName2 = 'دیوانی شیعری کلاسیک';

    const chats = [
      {
        id: 'chat_1', type: 'dm', handle: 'rebin_ahmad', online: true, lastSeen: '', unread: 2, muted: false,
        messages: [
          m('rebin_ahmad', 'سڵاو والی گیان، پۆستە شیعرییەکەت زۆر جوان بوو.', 1 * DAY + 2 * HOUR),
          m('me', 'سوپاس ڕێبین گیان، خۆشحاڵم کە پێت خۆش بووە.', 1 * DAY + 90 * MINUTE),
          m('rebin_ahmad', 'دەمەوێت وشەی «ئاوەز» و هاوتاکانی بخەینە ناو فەرهەنگە کراوەکەوە.', 1 * DAY + 80 * MINUTE),
          m('me', 'بیرۆکەیەکی زۆر باشە؛ با لیستێکی هاوبەش دروست بکەین.', 50 * MINUTE),
          m('rebin_ahmad', 'باشە، ئەمشەو چەند نموونەیەک لە دەقە کۆنەکانەوە دەنێرم.', 35 * MINUTE, 'sent'),
          m('rebin_ahmad', 'ئەگەر کاتت هەبوو، سەیری ئەو لیستەش بکە.', 20 * MINUTE, 'sent')
        ]
      },
      {
        id: 'chat_2', type: 'dm', handle: 'dilan_hawrami', online: false, lastSeen: 'دوایین بینین: ٢ کاتژمێر لەمەوبەر', unread: 0, muted: false,
        messages: [
          m('dilan_hawrami', 'والی گیان، نووسینی چاوگەکانت خوێندەوە، زۆر ڕێکخراو بوو.', 2 * DAY + 4 * HOUR),
          m('me', 'سوپاس دیلان، ئەگەر ڕات هەبێت زیادی بکەین.', 2 * DAY + 3 * HOUR),
          m('dilan_hawrami', 'ئەگەر ڕێک بکەوێت بۆ هەفتەی داهاتوو کۆبوونەوەیەکی بچووک دەکەین.', 2 * DAY + 2 * HOUR),
          m('me', 'ئامادەم، کاتەکەی بنووسە.', 2 * DAY + 1 * HOUR),
          m('dilan_hawrami', 'پێنجشەممە شەو کاتژمێر ٨ باشە؟', 1 * DAY + 6 * HOUR),
          m('me', 'باشە، دەبینمەوە.', 1 * DAY + 5 * HOUR)
        ]
      },
      {
        id: 'chat_3', type: 'dm', handle: 'avesta_dev', online: true, lastSeen: '', unread: 1, muted: false,
        messages: [
          m('avesta_dev', 'والی، فایلی JSONL ی ئەم هەفتەم تاقیکردەوە، هیچ کێشەیەکی پیتی تێدا نییە.', 5 * HOUR),
          m('me', 'ئافەرین! پیتەکان هەموو بە ستانداردی کوردی نووسراون؟', 4 * HOUR + 40 * MINUTE),
          m('avesta_dev', 'بەڵێ، ی و ک و ە هەموو یەکگرتوون.', 4 * HOUR + 30 * MINUTE),
          m('me', 'زۆر باشە، دەتوانین بڵاوی بکەینەوە.', 4 * HOUR),
          m('avesta_dev', 'خۆشحاڵم. ئەگەر پێویست بوو سکریپتی پشکنینەکەشت بۆ دەنێرم.', 3 * HOUR, 'sent')
        ]
      },
      {
        id: 'chat_4', type: 'group', name: gName1, avatar: groupAvatar(gName1), members: ['rebin_ahmad', 'avesta_dev', 'dilan_hawrami', 'wali_kurd'], online: false, unread: 3, muted: false,
        messages: [
          m('avesta_dev', 'بەخێربێن بۆ ئەنجومەنی زمان و ژیریی دەستکردی کوردی. ئامانجمان کۆکردنەوەی دەقی پاک و کراوەیە.', 2 * DAY + 2 * HOUR),
          m('rebin_ahmad', 'پێشنیار دەکەم هەموو دەقەکان پێش بڵاوکردنەوە بە ئامرازی ڕێکخستنی پیتەکان تێپەڕێنین.', 2 * DAY + 1 * HOUR),
          m('dilan_hawrami', 'من چەند نموونەی چاوگی ناڕێک و لقی ناوچەیم کۆکردووەتەوە.', 1 * DAY + 5 * HOUR),
          m('me', 'زۆر باشە. با لە هەر دەقێکدا ناوچەی قسەکەرەکەش تۆمار بکەین.', 1 * DAY + 4 * HOUR),
          m('avesta_dev', 'پشتگیریی دەکەم؛ بۆ ئەمە خانەیەکی نوێ لە داتاسێتەکەدا زیاد دەکەم.', 2 * HOUR + 30 * MINUTE, 'sent'),
          m('rebin_ahmad', 'هەروەها لیستی وشە دەگمەنەکانیش دەخەمە ناو بەڵگەنامەی هاوبەشەوە.', 2 * HOUR, 'sent'),
          m('dilan_hawrami', 'منیش هەفتەی داهاتوو نموونە ڕێزمانییەکان زیاد دەکەم.', 100 * MINUTE, 'sent')
        ]
      },
      {
        id: 'chat_5', type: 'group', name: gName2, avatar: groupAvatar(gName2), members: ['shaho_poet', 'hana_sher', 'dilan_hawrami', 'wali_kurd'], online: false, unread: 0, muted: false,
        messages: [
          m('hana_sher', 'ئەمڕۆ دیوانێکی کۆنم دۆزییەوە و دەمەوێت بەیتەکانی لێرە بەشی بکەم.', 3 * DAY),
          m('shaho_poet', 'ئاگاداربە سەرچاوەکەی بنووسی، بۆ ئەوەی لە ئەرشیڤەکەدا ڕاست تۆمار بکرێت.', 3 * DAY - 20 * MINUTE),
          m('me', 'ڕاستە، ناو و سەرچاوە گرنگن.', 3 * DAY - 40 * MINUTE),
          m('hana_sher', 'بێگومان، لە هەموو بەیتێکدا ناوی شاعیر و دیوانەکەی دەنووسم.', 3 * DAY - 1 * HOUR),
          m('shaho_poet', 'ئەمشەو بەیتێکی نوێ بۆ ئێوە نووسیوە، کاتێک تەواو بوو دەیخەمە ڕوو.', 1 * DAY + 2 * HOUR),
          m('me', 'چاوەڕێی دەکەین.', 1 * DAY + 1 * HOUR)
        ]
      }
    ];

    return {
      version: 2,
      currentUser: currentUser,
      users: users,
      posts: posts,
      savedPostIds: ['p_102', 'p_106', 'p_104'],
      notifications: notifications,
      chats: chats,
      followingHandles: ['rebin_ahmad', 'dilan_hawrami', 'nali_diwan', 'mahwi_garden', 'shaho_poet'],
      followerHandles: ['rebin_ahmad', 'avesta_dev', 'dilan_hawrami', 'shaho_poet', 'hana_sher'],
      draft: null,
      settings: defaultSettings(),
      viewingUserHandle: 'wali_kurd'
    };
  }

  function defaultSettings() {
    return { notifLikes: true, notifReplies: true, notifFollows: true, notifMessages: true, privateAccount: false, readReceipts: true };
  }

  /* =====================================================================
     5. STATE LOAD / SAVE
     ===================================================================== */
  let state = null;
  let quotaWarned = false;

  function hydrate(p) {
    const base = buildSeed();
    const s = Object.assign({}, base, p);
    s.currentUser = Object.assign({}, base.currentUser, p.currentUser);
    s.users = isObj(p.users) ? p.users : base.users;
    s.settings = Object.assign(defaultSettings(), isObj(p.settings) ? p.settings : {});
    ['savedPostIds', 'notifications', 'chats', 'followingHandles', 'followerHandles'].forEach((k) => {
      if (!Array.isArray(s[k])) s[k] = base[k];
    });
    s.posts = p.posts.filter((x) => x && x.id && x.authorHandle).map((x) => Object.assign({
      text: '', isPoetry: false, likes: 0, likedByMe: false, reposts: 0, scriptMode: 'arab', media: [], comments: [], timestamp: Date.now()
    }, x, { comments: Array.isArray(x.comments) ? x.comments : [], media: Array.isArray(x.media) ? x.media : [] }));
    if (!s.currentUser.avatar) s.currentUser.avatar = makeAvatar(s.currentUser.displayName, s.currentUser.username);
    Object.keys(s.users).forEach((h) => { if (!s.users[h].avatar) s.users[h].avatar = makeAvatar(s.users[h].displayName, h); });
    s.chats.forEach((c) => {
      if (!Array.isArray(c.messages)) c.messages = [];
      if (c.type === 'group' && !c.avatar) c.avatar = makeAvatar(c.name, 'group:' + c.name);
    });
    s.viewingUserHandle = s.currentUser.username;
    return s;
  }

  function loadState() {
    let raw = null;
    try { raw = localStorage.getItem(STATE_KEY); } catch (e) { raw = null; }
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (isObj(parsed) && isObj(parsed.currentUser) && Array.isArray(parsed.posts)) return hydrate(parsed);
      } catch (e) { /* corrupted JSON falls back to seed */ }
    }
    return buildSeed();
  }

  function saveState() {
    try {
      localStorage.setItem(STATE_KEY, JSON.stringify(state));
    } catch (e) {
      if (!quotaWarned) {
        quotaWarned = true;
        showToast('بیرگەی وێبگەڕەکە پڕە؛ هەندێک گۆڕانکاری پاشەکەوت نەکرا.', 'circle-alert');
      }
    }
  }

  function getUser(handle) {
    if (state && handle === state.currentUser.username) return state.currentUser;
    if (state && state.users[handle]) return state.users[handle];
    return { username: handle, displayName: handle, bio: '', avatar: makeAvatar(handle, handle), verified: false, followingCount: 0, followersCount: 0, joined: '', country: '', city: '' };
  }

  const isMe = (handle) => handle === state.currentUser.username;
  const findPost = (id) => state.posts.find((p) => p.id === id);
  const isFollowing = (handle) => state.followingHandles.indexOf(handle) !== -1;
  const isSaved = (id) => state.savedPostIds.indexOf(id) !== -1;
  const locationOf = (u) => [u.city, u.country].filter(Boolean).join('، ');

  /* =====================================================================
     6. TOASTS, POPOVERS, EMOJI PICKER, FOCUS TRAP
     ===================================================================== */
  function showToast(message, icon) {
    const region = $('toast-region');
    const tpl = $('tpl-toast');
    if (!region || !tpl) return;
    const node = tpl.content.firstElementChild.cloneNode(true);
    qs('.toast-message', node).textContent = message;
    qs('.toast-icon', node).setAttribute('data-lucide', icon || 'info');
    node.style.transition = 'opacity .25s ease, transform .25s ease';
    node.style.opacity = '0';
    node.style.transform = 'translateY(-8px)';
    region.appendChild(node);
    refreshIcons();
    requestAnimationFrame(() => { node.style.opacity = '1'; node.style.transform = 'none'; });
    setTimeout(() => {
      node.style.opacity = '0';
      node.style.transform = 'translateY(-8px)';
      setTimeout(() => node.remove(), 280);
    }, 2600);
    while (region.children.length > 3) region.firstElementChild.remove();
  }

  let activePopover = null;

  function closePopover() {
    if (!activePopover) return false;
    activePopover.remove();
    activePopover = null;
    return true;
  }

  function positionNear(node, anchor) {
    const r = anchor.getBoundingClientRect();
    const w = node.offsetWidth;
    const h = node.offsetHeight;
    const left = clamp(r.left, 8, Math.max(8, window.innerWidth - w - 8));
    let top = r.bottom + 6;
    if (top + h > window.innerHeight - 8) top = r.top - h - 6;
    node.style.left = left + 'px';
    node.style.top = clamp(top, 8, Math.max(8, window.innerHeight - h - 8)) + 'px';
  }

  function openMenu(anchor, items) {
    closePopover();
    const menu = el('div', 'fixed z-[80] w-56 rounded-2xl bg-white p-1.5 text-sm shadow-2xl ring-1 ring-slate-200 dark:bg-night-800 dark:ring-white/10');
    menu.setAttribute('role', 'menu');
    items.forEach((it) => {
      const b = el('button', 'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-start font-semibold transition hover:bg-slate-100 dark:hover:bg-white/10 ' + (it.danger ? 'text-rose-500' : 'text-slate-700 dark:text-slate-200'));
      b.type = 'button';
      b.setAttribute('role', 'menuitem');
      const icon = document.createElement('i');
      icon.setAttribute('data-lucide', it.icon || 'dot');
      icon.className = 'h-4 w-4 shrink-0';
      b.append(icon, el('span', 'flex-1', it.label));
      b.addEventListener('click', () => { closePopover(); it.onClick(); });
      menu.appendChild(b);
    });
    document.body.appendChild(menu);
    refreshIcons();
    positionNear(menu, anchor);
    activePopover = menu;
  }

  function openEmojiPicker(anchor, onPick) {
    closePopover();
    const box = el('div', 'fixed z-[80] grid w-[264px] grid-cols-6 gap-1 rounded-2xl bg-white p-2 shadow-2xl ring-1 ring-slate-200 dark:bg-night-800 dark:ring-white/10');
    box.setAttribute('role', 'listbox');
    box.setAttribute('aria-label', 'ئیمۆجی');
    EMOJIS.forEach((em) => {
      const b = el('button', 'inline-flex h-10 w-10 items-center justify-center rounded-xl text-xl transition hover:bg-slate-100 active:scale-90 dark:hover:bg-white/10', em);
      b.type = 'button';
      b.addEventListener('click', () => { onPick(em); closePopover(); });
      box.appendChild(b);
    });
    document.body.appendChild(box);
    positionNear(box, anchor);
    activePopover = box;
  }

  function insertAtCaret(field, text) {
    const start = field.selectionStart == null ? field.value.length : field.selectionStart;
    const end = field.selectionEnd == null ? field.value.length : field.selectionEnd;
    field.value = field.value.slice(0, start) + text + field.value.slice(end);
    const pos = start + text.length;
    try { field.setSelectionRange(pos, pos); } catch (e) { /* not supported */ }
    field.focus();
    field.dispatchEvent(new Event('input', { bubbles: true }));
  }

  function trapTab(e, container) {
    const nodes = qsa('a[href],button:not([disabled]),textarea:not([disabled]),input:not([disabled]):not([type="hidden"]),select:not([disabled]),[tabindex]:not([tabindex="-1"])', container)
      .filter((n) => n.getClientRects().length > 0);
    if (!nodes.length) return;
    const first = nodes[0];
    const last = nodes[nodes.length - 1];
    if (e.shiftKey && (document.activeElement === first || !container.contains(document.activeElement))) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && (document.activeElement === last || !container.contains(document.activeElement))) { e.preventDefault(); first.focus(); }
  }

  /* =====================================================================
     7. THEME MANAGEMENT
     ===================================================================== */
  const mql = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;
  let themeMode = 'system';

  function isDarkNow() { return themeMode === 'dark' || (themeMode === 'system' && !!mql && mql.matches); }

  function applyTheme(mode, persist) {
    themeMode = ['light', 'dark', 'system'].indexOf(mode) !== -1 ? mode : 'system';
    const dark = isDarkNow();
    [document.documentElement, document.body].forEach((n) => {
      n.classList.toggle('dark', dark);
      n.classList.toggle('light', !dark);
    });
    document.documentElement.style.colorScheme = dark ? 'dark' : 'light';
    const toggle = $('theme-toggle');
    if (toggle) toggle.setAttribute('aria-checked', String(dark));
    qsa('input[name="theme"]').forEach((r) => { r.checked = r.value === themeMode; });
    if (persist !== false) { try { localStorage.setItem(THEME_KEY, themeMode); } catch (e) { /* storage unavailable */ } }
  }

  function loadTheme() {
    let v = null;
    try { v = localStorage.getItem(THEME_KEY); } catch (e) { v = null; }
    applyTheme(v, false);
  }

  /* =====================================================================
     8. VIEW ROUTER, SKELETONS, BOTTOM BAR & SIDEBAR DRAWER
     ===================================================================== */
  const VIEWS = {
    home: 'view-home', profile: 'view-profile', saved: 'view-saved', settings: 'view-settings',
    'chat-list': 'view-chat-list', 'chat-room': 'view-chat-room', notifications: 'view-notifications'
  };
  const ui = { feedTab: 'for-you', profileTab: 'posts', notifFilter: 'all', activeChatId: null };
  const navHistory = [];
  let currentView = 'home';

  function hideSkeletons() {
    ['feed-skeleton', 'profile-skeleton', 'saved-skeleton', 'chat-list-skeleton', 'chat-messages-skeleton', 'notif-skeleton']
      .forEach((id) => { const n = $(id); if (n) n.classList.add('hidden'); });
    const feed = $('feed-list');
    if (feed) feed.setAttribute('aria-busy', 'false');
  }

  function navigateTo(view, opts) {
    opts = opts || {};
    if (!VIEWS[view]) view = 'home';
    if (opts.reset) navHistory.length = 0;
    else if (!opts.back && currentView !== view) { navHistory.push(currentView); if (navHistory.length > 20) navHistory.shift(); }
    currentView = view;
    hideSkeletons();

    qsa('.app-view').forEach((sec) => {
      const active = sec.id === VIEWS[view];
      sec.classList.toggle('hidden', !active);
      if (sec.id === 'view-chat-room') sec.classList.toggle('flex', active);
    });
    const bar = $('bottom-bar');
    if (bar) bar.classList.toggle('hidden', view === 'chat-room');

    const current = { 'nav-home': view === 'home', 'nav-notifications': view === 'notifications', 'nav-chat': view === 'chat-list' || view === 'chat-room' };
    Object.keys(current).forEach((id) => {
      const b = $(id);
      if (!b) return;
      if (current[id]) b.setAttribute('aria-current', 'page'); else b.removeAttribute('aria-current');
    });

    if (view === 'home') renderFeed();
    else if (view === 'profile') renderProfile();
    else if (view === 'saved') renderSaved();
    else if (view === 'settings') syncSettingsUI();
    else if (view === 'chat-list') renderChatList();
    else if (view === 'notifications') renderNotifications();
    refreshIcons();
    if (!opts.keepScroll) window.scrollTo(0, 0);
  }

  function goBack(fallback) {
    navigateTo(navHistory.pop() || fallback || 'home', { back: true });
  }

  let drawerReturnFocus = null;

  function isDrawerOpen() { const d = $('sidebar-drawer'); return !!d && d.dataset.state === 'open'; }

  function openDrawer() {
    const d = $('sidebar-drawer');
    if (!d || isDrawerOpen()) return;
    drawerReturnFocus = document.activeElement;
    d.dataset.state = 'open';
    d.setAttribute('aria-hidden', 'false');
    d.classList.add('drawer-open');
    d.classList.remove('drawer-closed');
    document.body.classList.add('drawer-lock');
    $('nav-menu').setAttribute('aria-expanded', 'true');
    setTimeout(() => { const c = $('sidebar-close'); if (c) c.focus(); }, 60);
  }

  function closeDrawer(restoreFocus) {
    const d = $('sidebar-drawer');
    if (!d || !isDrawerOpen()) return;
    d.dataset.state = 'closed';
    d.setAttribute('aria-hidden', 'true');
    d.classList.remove('drawer-open');
    d.classList.add('drawer-closed');
    document.body.classList.remove('drawer-lock');
    $('nav-menu').setAttribute('aria-expanded', 'false');
    if (restoreFocus !== false && drawerReturnFocus && document.contains(drawerReturnFocus)) drawerReturnFocus.focus();
    drawerReturnFocus = null;
  }

  /* =====================================================================
     9. IDENTITY (sidebar, bottom bar, composers)
     ===================================================================== */
  function renderIdentity() {
    const u = state.currentUser;
    const set = (id, fn) => { const n = $(id); if (n) fn(n); };
    set('sidebar-avatar', (n) => { n.src = u.avatar; n.alt = u.displayName; });
    set('sidebar-display-name', (n) => { n.textContent = u.displayName; });
    set('sidebar-handle', (n) => { n.textContent = '@' + u.username; });
    set('sidebar-following-count', (n) => { n.textContent = fmtCount(u.followingCount); });
    set('sidebar-followers-count', (n) => { n.textContent = fmtCount(u.followersCount); });
    set('bottom-avatar', (n) => { n.src = u.avatar; n.alt = u.displayName; });
    set('home-composer-avatar', (n) => { n.src = u.avatar; n.alt = u.displayName; });
    set('creator-avatar', (n) => { n.src = u.avatar; n.alt = u.displayName; });
  }

  /* =====================================================================
     10. POST CARDS (#tpl-post), POETRY MODE, SCRIPT CONVERTER, COMMENTS
     ===================================================================== */
  const openDrawers = new Set();

  function setPostText(node, post) {
    node.classList.remove('text-poetry', 'text-prose');
    node.classList.add(post.isPoetry ? 'text-poetry' : 'text-prose');
    if (post.scriptMode === 'latin') {
      node.textContent = toLatin(post.text);
      node.setAttribute('dir', 'ltr');
      node.setAttribute('lang', 'ku-Latn');
    } else {
      node.textContent = post.text;
      node.setAttribute('dir', 'rtl');
      node.setAttribute('lang', 'ckb');
    }
  }

  function buildScriptPill() {
    const b = el('button', 'post-script-toggle inline-flex items-center rounded-full border border-slate-200 px-3 py-1 text-xs font-bold text-slate-600 transition hover:bg-brand-50 hover:text-brand-600 active:scale-95 dark:border-white/15 dark:text-slate-300 dark:hover:bg-white/10');
    b.type = 'button';
    b.dataset.action = 'toggle-script';
    return b;
  }

  function buildCommentItem(c) {
    const u = getUser(c.authorHandle);
    const row = el('div', 'post-comment flex items-start gap-2.5');
    const img = el('img', 'h-8 w-8 shrink-0 rounded-full bg-slate-200 object-cover dark:bg-night-700');
    img.src = u.avatar;
    img.alt = '';
    const body = el('div', 'min-w-0 flex-1');
    const head = el('div', 'flex items-center gap-2 text-xs');
    head.append(el('span', 'truncate font-extrabold', u.displayName), el('time', 'text-slate-400', timeAgo(c.timestamp)));
    const text = el('p', 'mt-0.5 whitespace-pre-wrap break-words text-sm leading-6', c.text);
    text.setAttribute('dir', 'auto');
    body.append(head, text);
    row.append(img, body);
    return row;
  }

  function renderComments(card, post) {
    const list = qs('.post-comments-list', card);
    if (!list) return;
    list.replaceChildren();
    if (!post.comments.length) {
      list.appendChild(el('p', 'text-center text-xs text-slate-400', 'هێشتا لێدوانێک نییە. یەکەم کەس بە کە دەنووسێت.'));
      return;
    }
    post.comments.slice().sort((a, b) => a.timestamp - b.timestamp).forEach((c) => list.appendChild(buildCommentItem(c)));
  }

  function buildCommentsDrawer(post) {
    const drawer = el('div', 'post-comments-drawer hidden mt-2 rounded-2xl bg-slate-50 p-3 dark:bg-white/5');
    drawer.appendChild(el('div', 'post-comments-list space-y-3'));
    const form = el('form', 'post-comment-form mt-3 flex items-center gap-2');
    form.setAttribute('autocomplete', 'off');
    const input = el('input', 'min-w-0 flex-1 rounded-full bg-white px-4 py-2 text-sm outline-none ring-1 ring-slate-200 transition placeholder:text-slate-400 focus:ring-2 focus:ring-brand-500/50 dark:bg-night-800 dark:ring-white/10');
    input.type = 'text';
    input.name = 'comment';
    input.maxLength = 280;
    input.placeholder = 'لێدوانێک بنووسە...';
    input.setAttribute('dir', 'auto');
    input.setAttribute('aria-label', 'لێدوان');
    const send = el('button', 'shrink-0 rounded-full bg-brand-600 px-4 py-2 text-sm font-bold text-white transition active:scale-95 disabled:opacity-50', 'ناردن');
    send.type = 'submit';
    send.disabled = true;
    input.addEventListener('input', () => { send.disabled = !input.value.trim(); });
    form.append(input, send);
    drawer.appendChild(form);
    return drawer;
  }

  function updateCard(card, post) {
    const like = qs('[data-action="like"]', card);
    like.setAttribute('aria-pressed', String(!!post.likedByMe));
    qs('.post-like-count', card).textContent = fmtCount(post.likes);
    qs('[data-action="bookmark"]', card).setAttribute('aria-pressed', String(isSaved(post.id)));
    qs('.post-reply-count', card).textContent = fmtCount(post.comments.length);
    const pill = qs('[data-action="toggle-script"]', card);
    if (pill) {
      const latin = post.scriptMode === 'latin';
      pill.textContent = latin ? 'ئارامی' : 'لاتینی';
      pill.setAttribute('aria-label', latin ? 'گۆڕین بۆ نووسینی ئارامی' : 'گۆڕین بۆ نووسینی لاتینی');
      pill.setAttribute('aria-pressed', String(latin));
    }
    setPostText(qs('.post-text', card), post);
  }

  function updatePostEverywhere(postId) {
    const post = findPost(postId);
    if (!post) return;
    qsa('.post-card[data-post-id="' + postId + '"]').forEach((card) => updateCard(card, post));
  }

  function buildPostCard(post) {
    const node = $('tpl-post').content.firstElementChild.cloneNode(true);
    const user = getUser(post.authorHandle);
    node.dataset.postId = post.id;
    node.setAttribute('aria-label', user.displayName);
    const avatar = qs('.post-avatar', node);
    avatar.src = user.avatar;
    avatar.alt = user.displayName;
    qs('.post-author', node).textContent = user.displayName;
    qs('.post-handle', node).textContent = '@' + user.username;
    qs('.post-verified', node).classList.toggle('hidden', !user.verified);
    const time = qs('.post-time', node);
    time.textContent = timeAgo(post.timestamp);
    time.dateTime = new Date(post.timestamp).toISOString();
    time.title = shortDate(post.timestamp, true) + ' ' + clockTime(post.timestamp);
    time.dataset.ts = String(post.timestamp);

    const mediaBox = qs('.post-media', node);
    if (post.media && post.media.length) {
      show(mediaBox, 'grid');
      post.media.forEach((src, i, arr) => {
        const img = el('img', 'h-full w-full object-cover ' + (arr.length === 1 || (arr.length === 3 && i === 0) ? 'col-span-2 aspect-video' : 'aspect-square'));
        img.src = src;
        img.alt = '';
        img.loading = 'lazy';
        mediaBox.appendChild(img);
      });
    }

    const repost = qs('[data-action="repost"]', node);
    if (repost) repost.replaceWith(buildScriptPill());

    const content = qs('.post-actions', node).parentElement;
    const drawer = buildCommentsDrawer(post);
    content.appendChild(drawer);
    renderComments(node, post);
    if (openDrawers.has(post.id)) {
      drawer.classList.remove('hidden');
      qs('[data-action="reply"]', node).setAttribute('aria-expanded', 'true');
    }
    updateCard(node, post);
    return node;
  }

  function renderPostList(container, posts) {
    const frag = document.createDocumentFragment();
    posts.forEach((p) => frag.appendChild(buildPostCard(p)));
    container.replaceChildren(frag);
    refreshIcons();
  }

  function copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) return navigator.clipboard.writeText(text);
    return new Promise((resolve, reject) => {
      const ta = el('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.cssText = 'position:fixed;opacity:0;top:0;left:0';
      document.body.appendChild(ta);
      ta.select();
      let ok = false;
      try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
      ta.remove();
      if (ok) resolve(); else reject(new Error('copy failed'));
    });
  }

  function toggleLike(post) {
    post.likedByMe = !post.likedByMe;
    post.likes = Math.max(0, post.likes + (post.likedByMe ? 1 : -1));
    saveState();
    updatePostEverywhere(post.id);
  }

  function toggleBookmark(post) {
    const i = state.savedPostIds.indexOf(post.id);
    if (i === -1) { state.savedPostIds.unshift(post.id); showToast('پۆستەکە پاشەکەوت کرا', 'bookmark'); }
    else { state.savedPostIds.splice(i, 1); showToast('لە پاشەکەوتکراوەکان لابرا', 'bookmark'); }
    saveState();
    updatePostEverywhere(post.id);
    if (currentView === 'saved') renderSaved();
  }

  function toggleScript(post) {
    post.scriptMode = post.scriptMode === 'latin' ? 'arab' : 'latin';
    saveState();
    updatePostEverywhere(post.id);
  }

  function sharePost(card, post) {
    const textEl = qs('.post-text', card);
    const author = getUser(post.authorHandle);
    const payload = (textEl ? textEl.textContent : post.text) + '\n\n— ' + author.displayName + ' (@' + author.username + ') · مەکۆ';
    copyText(payload).then(
      () => showToast('دەقەکە کۆپی کرا', 'copy'),
      () => showToast('کۆپیکردن سەرکەوتوو نەبوو', 'circle-alert')
    );
  }

  function toggleCommentsDrawer(card, post) {
    const drawer = qs('.post-comments-drawer', card);
    if (!drawer) return;
    const opening = drawer.classList.contains('hidden');
    drawer.classList.toggle('hidden', !opening);
    qs('[data-action="reply"]', card).setAttribute('aria-expanded', String(opening));
    if (opening) { openDrawers.add(post.id); const inp = qs('input', drawer); if (inp) inp.focus(); }
    else openDrawers.delete(post.id);
  }

  function submitComment(form) {
    const card = form.closest('.post-card');
    const post = card && findPost(card.dataset.postId);
    if (!post) return;
    const input = qs('input[name="comment"]', form);
    const text = normalize(input.value).trim();
    if (!text) return;
    post.comments.push({ id: uid('c'), authorHandle: state.currentUser.username, text: text, timestamp: Date.now() });
    saveState();
    input.value = '';
    qs('button[type="submit"]', form).disabled = true;
    qsa('.post-card[data-post-id="' + post.id + '"]').forEach((c) => { renderComments(c, post); updateCard(c, post); });
    updateJsonLd();
    showToast('لێدوانەکەت نێردرا', 'message-circle');
  }

  function deletePost(post) {
    if (!window.confirm('ئەم پۆستە بسڕدرێتەوە؟')) return;
    state.posts = state.posts.filter((p) => p.id !== post.id);
    state.savedPostIds = state.savedPostIds.filter((id) => id !== post.id);
    state.notifications = state.notifications.filter((n) => n.postId !== post.id);
    openDrawers.delete(post.id);
    saveState();
    renderAllLists();
    updateJsonLd();
    showToast('پۆستەکە سڕایەوە', 'trash-2');
  }

  function openPostMenu(anchor, post) {
    const author = getUser(post.authorHandle);
    const items = [{ label: 'کۆپیکردنی دەق', icon: 'copy', onClick: () => copyText(post.text).then(() => showToast('دەقەکە کۆپی کرا', 'copy'), () => {}) }];
    if (isMe(post.authorHandle)) {
      items.push({ label: 'سڕینەوەی پۆست', icon: 'trash-2', danger: true, onClick: () => deletePost(post) });
    } else {
      items.push({ label: 'بینینی پرۆفایلی ' + author.displayName, icon: 'user', onClick: () => openProfile(author.username) });
      items.push({ label: isFollowing(author.username) ? 'ڕاگرتنی شوێنکەوتن' : 'شوێنکەوتن', icon: isFollowing(author.username) ? 'user-minus' : 'user-plus', onClick: () => { toggleFollow(author.username); renderAllLists(); } });
    }
    openMenu(anchor, items);
  }

  function onPostListClick(e) {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;
    const card = btn.closest('.post-card');
    const post = card && findPost(card.dataset.postId);
    if (!post) return;
    switch (btn.dataset.action) {
      case 'open-profile': openProfile(post.authorHandle); break;
      case 'like': toggleLike(post); break;
      case 'bookmark': toggleBookmark(post); break;
      case 'share': sharePost(card, post); break;
      case 'reply': toggleCommentsDrawer(card, post); break;
      case 'toggle-script': toggleScript(post); break;
      case 'more': openPostMenu(btn, post); break;
      default: break;
    }
  }

  function bindPostList(list) {
    if (!list) return;
    list.addEventListener('click', onPostListClick);
    list.addEventListener('submit', (e) => {
      const form = e.target.closest('.post-comment-form');
      if (!form) return;
      e.preventDefault();
      submitComment(form);
    });
  }

  function tickTimes() {
    qsa('.post-time[data-ts]').forEach((t) => { t.textContent = timeAgo(Number(t.dataset.ts)); });
    qsa('.notif-time[data-ts]').forEach((t) => { t.textContent = timeAgo(Number(t.dataset.ts)); });
  }

  /* =====================================================================
     11. HOME FEED, TABS, REFRESH, NEW-POSTS PILL
     ===================================================================== */
  let pendingPosts = [];
  let poolIndex = 0;

  function feedPosts() {
    const list = ui.feedTab === 'following'
      ? state.posts.filter((p) => isFollowing(p.authorHandle) || isMe(p.authorHandle))
      : state.posts.slice();
    return list.sort((a, b) => b.timestamp - a.timestamp);
  }

  function renderFeed() {
    const list = $('feed-list');
    if (!list) return;
    const posts = feedPosts();
    renderPostList(list, posts);
    const empty = $('feed-empty');
    const none = posts.length === 0;
    if (none) show(empty, 'flex'); else hide(empty, 'flex');
    hide($('feed-error'), 'flex');
    const end = $('feed-end');
    if (end) end.classList.toggle('hidden', none);
    qsa('#feed-tabs [data-feed]').forEach((b) => b.setAttribute('aria-selected', String(b.dataset.feed === ui.feedTab)));
    list.setAttribute('aria-busy', 'false');
  }

  function setPill(count) {
    const pill = $('new-posts-pill');
    if (!pill) return;
    if (count > 0) {
      show(pill, 'inline-flex');
      const label = qs('span', pill);
      if (label) label.textContent = count === 1 ? 'پۆستی نوێ' : toKu(count) + ' پۆستی نوێ';
    } else hide(pill, 'inline-flex');
  }

  function queueIncomingPost() {
    if (poolIndex >= INCOMING_POOL.length) return;
    const tpl = INCOMING_POOL[poolIndex++];
    pendingPosts.push(Object.assign({
      id: uid('p'), likes: 0, likedByMe: false, reposts: 0, scriptMode: 'arab', media: [], comments: [], timestamp: Date.now()
    }, tpl));
    if (currentView === 'home') setPill(pendingPosts.length);
  }

  function mergePendingPosts() {
    if (!pendingPosts.length) return false;
    pendingPosts.forEach((p) => { p.timestamp = Date.now(); state.posts.unshift(p); });
    pendingPosts = [];
    saveState();
    setPill(0);
    updateJsonLd();
    return true;
  }

  function refreshFeed() {
    const btn = $('feed-refresh');
    const icon = btn && qs('svg', btn);
    if (icon) icon.classList.add('animate-spin');
    $('feed-list').setAttribute('aria-busy', 'true');
    setTimeout(() => {
      if (icon) icon.classList.remove('animate-spin');
      const merged = mergePendingPosts();
      renderFeed();
      if (merged) window.scrollTo({ top: 0, behavior: 'smooth' });
      else showToast('هیچ پۆستێکی نوێ نییە', 'check');
    }, 700);
  }

  function scrollToPost(postId) {
    const card = qs('#feed-list .post-card[data-post-id="' + postId + '"]');
    if (!card) return false;
    card.scrollIntoView({ behavior: 'smooth', block: 'center' });
    card.classList.add('bg-brand-50', 'dark:bg-brand-500/10');
    setTimeout(() => card.classList.remove('bg-brand-50', 'dark:bg-brand-500/10'), 1800);
    return true;
  }

  /* =====================================================================
     12. SAVED VIEW
     ===================================================================== */
  function renderSaved() {
    const list = $('saved-list');
    const posts = state.savedPostIds.map(findPost).filter(Boolean);
    renderPostList(list, posts);
    if (posts.length) hide($('saved-empty'), 'flex'); else show($('saved-empty'), 'flex');
  }

  /* =====================================================================
     13. PROFILE VIEW
     ===================================================================== */
  function openProfile(handle) {
    state.viewingUserHandle = handle || state.currentUser.username;
    ui.profileTab = 'posts';
    navigateTo('profile');
  }

  function profilePosts(handle, tab) {
    const mine = isMe(handle);
    let list;
    if (tab === 'replies') list = state.posts.filter((p) => p.authorHandle !== handle && p.comments.some((c) => c.authorHandle === handle));
    else if (tab === 'media') list = state.posts.filter((p) => p.authorHandle === handle && p.media && p.media.length);
    else if (tab === 'likes') list = mine ? state.posts.filter((p) => p.likedByMe) : [];
    else list = state.posts.filter((p) => p.authorHandle === handle);
    return list.sort((a, b) => b.timestamp - a.timestamp);
  }

  function renderProfile() {
    const handle = state.viewingUserHandle;
    const user = getUser(handle);
    const mine = isMe(handle);
    $('profile-header-title').textContent = user.displayName;
    $('profile-posts-count').textContent = toKu(state.posts.filter((p) => p.authorHandle === handle).length);
    const avatar = $('profile-avatar');
    avatar.src = user.avatar;
    avatar.alt = user.displayName;
    $('profile-display-name').textContent = user.displayName;
    $('profile-verified').classList.toggle('hidden', !user.verified);
    $('profile-handle').textContent = '@' + user.username;
    $('profile-bio').textContent = user.bio || '';
    const loc = locationOf(user);
    $('profile-location').textContent = loc;
    if (loc) show($('profile-location-wrap'), 'inline-flex'); else hide($('profile-location-wrap'), 'inline-flex');
    $('profile-joined').textContent = user.joined || '—';
    $('profile-following-count').textContent = fmtCount(user.followingCount);
    $('profile-followers-count').textContent = fmtCount(user.followersCount);

    $('profile-edit-btn').classList.toggle('hidden', !mine);
    const msg = $('profile-message-btn');
    if (mine) hide(msg, 'inline-flex'); else show(msg, 'inline-flex');
    const follow = $('profile-follow-btn');
    follow.classList.toggle('hidden', mine);
    updateFollowButton(follow, handle);

    qsa('#profile-tabs [data-profile-tab]').forEach((b) => b.setAttribute('aria-selected', String(b.dataset.profileTab === ui.profileTab)));
    const posts = profilePosts(handle, ui.profileTab);
    renderPostList($('profile-posts-list'), posts);
    if (posts.length) hide($('profile-empty'), 'flex'); else show($('profile-empty'), 'flex');
  }

  function updateFollowButton(btn, handle) {
    const on = isFollowing(handle);
    btn.setAttribute('aria-pressed', String(on));
    btn.textContent = on ? 'شوێنکەوتوو' : 'شوێنکەوتن';
  }

  function toggleFollow(handle) {
    if (!handle || isMe(handle)) return;
    const user = getUser(handle);
    const i = state.followingHandles.indexOf(handle);
    if (i === -1) {
      state.followingHandles.push(handle);
      state.currentUser.followingCount += 1;
      user.followersCount = (user.followersCount || 0) + 1;
    } else {
      state.followingHandles.splice(i, 1);
      state.currentUser.followingCount = Math.max(0, state.currentUser.followingCount - 1);
      user.followersCount = Math.max(0, (user.followersCount || 0) - 1);
    }
    state.notifications.forEach((n) => { if (n.type === 'FOLLOW' && n.actorHandle === handle) n.isFollowingBack = isFollowing(handle); });
    saveState();
    renderIdentity();
  }

  let userSheet = null;

  function closeUserSheet() {
    if (!userSheet) return false;
    userSheet.remove();
    userSheet = null;
    unlockScroll();
    return true;
  }

  function openUserList(kind) {
    closeUserSheet();
    const mine = isMe(state.viewingUserHandle);
    const handles = mine ? (kind === 'following' ? state.followingHandles : state.followerHandles) : [];
    const overlay = el('div', 'fixed inset-0 z-[75] flex items-end justify-center bg-black/50');
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    const panel = el('div', 'flex max-h-[80dvh] w-full max-w-[600px] flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl dark:bg-night-900');
    const head = el('div', 'flex items-center justify-between border-b border-slate-200 px-4 py-3 dark:border-white/10');
    head.appendChild(el('h3', 'text-base font-extrabold', kind === 'following' ? 'شوێنکەوتراوەکان' : 'شوێنکەوتووەکان'));
    const close = el('button', 'inline-flex h-9 w-9 items-center justify-center rounded-full transition hover:bg-slate-100 dark:hover:bg-white/10');
    close.type = 'button';
    close.setAttribute('aria-label', 'داخستن');
    const x = document.createElement('i');
    x.setAttribute('data-lucide', 'x');
    x.className = 'h-5 w-5';
    close.appendChild(x);
    close.addEventListener('click', closeUserSheet);
    head.appendChild(close);
    const body = el('div', 'overflow-y-auto pb-[calc(1rem+env(safe-area-inset-bottom))]');
    if (!handles.length) body.appendChild(el('p', 'px-6 py-10 text-center text-sm text-slate-500 dark:text-slate-400', 'لیستەکە بەردەست نییە.'));
    handles.forEach((h) => {
      const u = getUser(h);
      const row = el('button', 'flex w-full items-center gap-3 px-4 py-3 text-start transition hover:bg-slate-50 dark:hover:bg-white/5');
      row.type = 'button';
      const img = el('img', 'h-11 w-11 rounded-full bg-slate-200 object-cover dark:bg-night-700');
      img.src = u.avatar;
      img.alt = '';
      const names = el('span', 'min-w-0 flex-1');
      names.append(el('span', 'block truncate text-[15px] font-extrabold', u.displayName), el('span', 'block truncate text-sm text-slate-500 dark:text-slate-400', '@' + u.username));
      names.lastChild.setAttribute('dir', 'ltr');
      row.append(img, names);
      row.addEventListener('click', () => { closeUserSheet(); openProfile(h); });
      body.appendChild(row);
    });
    panel.append(head, body);
    overlay.appendChild(panel);
    overlay.addEventListener('click', (ev) => { if (ev.target === overlay) closeUserSheet(); });
    document.body.appendChild(overlay);
    userSheet = overlay;
    lockScroll();
    refreshIcons();
    close.focus();
  }

  function renderAllLists() {
    renderFeed();
    if (currentView === 'profile') renderProfile();
    if (currentView === 'saved') renderSaved();
  }

  /* =====================================================================
     14. IMAGE COMPRESSION (FileReader + offscreen canvas)
     ===================================================================== */
  function compressImage(file, maxSide, quality, square) {
    return new Promise((resolve, reject) => {
      if (!file || !/^image\//.test(file.type)) { reject(new Error('not-image')); return; }
      const reader = new FileReader();
      reader.onerror = () => reject(reader.error || new Error('read-failed'));
      reader.onload = () => {
        const img = new Image();
        img.onerror = () => reject(new Error('decode-failed'));
        img.onload = () => {
          const w = img.naturalWidth || img.width;
          const h = img.naturalHeight || img.height;
          let sx = 0, sy = 0, sw = w, sh = h, dw, dh;
          if (square) {
            const s = Math.min(w, h);
            sx = (w - s) / 2; sy = (h - s) / 2; sw = s; sh = s; dw = maxSide; dh = maxSide;
          } else {
            const scale = Math.min(1, maxSide / Math.max(w, h));
            dw = Math.max(1, Math.round(w * scale));
            dh = Math.max(1, Math.round(h * scale));
          }
          const canvas = document.createElement('canvas');
          canvas.width = dw;
          canvas.height = dh;
          const ctx = canvas.getContext('2d');
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, dw, dh);
          ctx.drawImage(img, sx, sy, sw, sh, 0, 0, dw, dh);
          resolve(canvas.toDataURL('image/jpeg', quality));
        };
        img.src = reader.result;
      };
      reader.readAsDataURL(file);
    });
  }

  /* =====================================================================
     15. CREATOR CANVAS (#creator-canvas)
     ===================================================================== */
  const creator = { isPoetry: false, media: [] };

  const isCreatorOpen = () => { const c = $('creator-canvas'); return !!c && !c.classList.contains('hidden'); };
  const creatorHasContent = () => $('creator-textarea').value.trim().length > 0 || creator.media.length > 0;

  function ensurePoetryToggle() {
    if ($('creator-poetry-toggle')) return;
    const group = qs('#creator-canvas footer > div:first-child');
    if (!group) return;
    const btn = el('button', 'ms-1 inline-flex h-10 items-center gap-1.5 rounded-full px-3 text-sm font-semibold transition hover:bg-brand-50 active:scale-95 aria-pressed:bg-brand-600 aria-pressed:text-white dark:hover:bg-white/10');
    btn.type = 'button';
    btn.id = 'creator-poetry-toggle';
    btn.setAttribute('aria-pressed', 'false');
    const icon = document.createElement('i');
    icon.setAttribute('data-lucide', 'feather');
    icon.className = 'h-5 w-5';
    btn.append(icon, el('span', '', 'شێوازی شیعر'));
    btn.addEventListener('click', () => { creator.isPoetry = !creator.isPoetry; updateCreatorUI(); $('creator-textarea').focus(); });
    group.appendChild(btn);
    refreshIcons();
  }

  function updateCreatorUI() {
    const ta = $('creator-textarea');
    const len = ta.value.length;
    const progress = $('creator-counter-progress');
    progress.setAttribute('stroke-dashoffset', String(RING_LENGTH - RING_LENGTH * Math.min(len, MAX_CHARS) / MAX_CHARS));
    const remaining = MAX_CHARS - len;
    progress.classList.toggle('stroke-brand-500', remaining > 20);
    progress.classList.toggle('stroke-rose-500', remaining <= 20);
    const count = $('creator-char-count');
    count.textContent = toKu(remaining);
    count.classList.toggle('hidden', len === 0);
    count.classList.toggle('text-rose-500', remaining <= 20);
    $('creator-submit').disabled = !(ta.value.trim() || creator.media.length);
    ta.classList.toggle('text-poetry', creator.isPoetry);
    const toggle = $('creator-poetry-toggle');
    if (toggle) toggle.setAttribute('aria-pressed', String(creator.isPoetry));
  }

  function renderCreatorMedia() {
    const grid = $('creator-media-grid');
    grid.replaceChildren();
    creator.media.forEach((m) => {
      const node = $('tpl-creator-media').content.firstElementChild.cloneNode(true);
      node.dataset.mediaId = m.id;
      qs('.creator-media-img', node).src = m.src;
      qs('.creator-media-remove', node).addEventListener('click', () => {
        creator.media = creator.media.filter((x) => x.id !== m.id);
        renderCreatorMedia();
        updateCreatorUI();
      });
      grid.appendChild(node);
    });
    if (creator.media.length) show(grid, 'grid'); else hide(grid, 'grid');
    refreshIcons();
  }

  function openCreator() {
    const c = $('creator-canvas');
    if (isCreatorOpen()) return;
    ensurePoetryToggle();
    $('creator-textarea').maxLength = MAX_CHARS;
    hide($('creator-reply-context'), 'flex');
    hide($('creator-discard-sheet'), 'flex');
    if (state.draft) {
      $('creator-textarea').value = state.draft.text || '';
      creator.isPoetry = !!state.draft.isPoetry;
      creator.media = (state.draft.media || []).map((src) => ({ id: uid('img'), src: src }));
      state.draft = null;
      saveState();
      renderCreatorMedia();
      showToast('ڕەشنووسەکەت گەڕایەوە', 'file-text');
    }
    show(c, 'flex');
    c.setAttribute('aria-hidden', 'false');
    lockScroll();
    updateCreatorUI();
    setTimeout(() => $('creator-textarea').focus(), 60);
  }

  function closeCreator() {
    const c = $('creator-canvas');
    if (!isCreatorOpen()) return;
    hide(c, 'flex');
    c.setAttribute('aria-hidden', 'true');
    hide($('creator-discard-sheet'), 'flex');
    unlockScroll();
  }

  function resetCreator() {
    $('creator-textarea').value = '';
    creator.isPoetry = false;
    creator.media = [];
    renderCreatorMedia();
    updateCreatorUI();
  }

  function requestCloseCreator() {
    if (creatorHasContent()) { show($('creator-discard-sheet'), 'flex'); $('creator-discard-cancel').focus(); }
    else { resetCreator(); closeCreator(); }
  }

  async function handleCreatorFiles(files) {
    const list = Array.from(files || []);
    let failed = 0;
    for (const file of list) {
      if (creator.media.length >= MAX_IMAGES) { showToast('زۆرترین ' + toKu(MAX_IMAGES) + ' وێنە دەتوانیت زیاد بکەیت', 'image'); break; }
      try {
        const src = await compressImage(file, 720, 0.82, false);
        creator.media.push({ id: uid('img'), src: src });
      } catch (err) { failed += 1; }
    }
    if (failed) showToast('هەندێک وێنە نەخوێندرانەوە', 'circle-alert');
    renderCreatorMedia();
    updateCreatorUI();
  }

  function submitPost() {
    const ta = $('creator-textarea');
    const text = normalize(ta.value).trim();
    if (!text && !creator.media.length) return;
    const post = {
      id: uid('p'), authorHandle: state.currentUser.username, text: text, isPoetry: creator.isPoetry,
      timestamp: Date.now(), likes: 0, likedByMe: false, reposts: 0, scriptMode: 'arab',
      media: creator.media.map((m) => m.src), comments: []
    };
    state.posts.unshift(post);
    saveState();
    resetCreator();
    closeCreator();
    ui.feedTab = 'for-you';
    navigateTo('home', { reset: true });
    updateJsonLd();
    showToast('پۆستەکەت بڵاوکرایەوە', 'circle-check');
    scheduleFriendlyLike(post);
  }

  function scheduleFriendlyLike(post) {
    setTimeout(() => {
      const pool = Object.keys(state.users).filter((h) => isFollowing(h));
      if (!pool.length || !findPost(post.id)) return;
      const actor = state.users[pool[Math.floor(Math.random() * pool.length)]];
      post.likes += 1;
      state.notifications.unshift(createNotification({
        type: 'LIKE', actorName: actor.displayName, actorHandle: actor.username, actorAvatar: actor.avatar,
        postId: post.id, postExcerpt: excerpt(post.text || 'وێنە', 70), timestamp: Date.now(), read: false
      }));
      saveState();
      updatePostEverywhere(post.id);
      updateBadge();
      if (currentView === 'notifications') renderNotifications();
    }, 7000);
  }

  /* =====================================================================
     16. EDIT PROFILE MODAL (#edit-profile-modal)
     ===================================================================== */
  let cityMaster = [];
  let editAvatarData = null;

  const isEditOpen = () => { const m = $('edit-profile-modal'); return !!m && !m.classList.contains('hidden'); };

  function prepareEditModal() {
    cityMaster = qsa('#edit-city option[data-country]').map((o) => ({ value: o.value, label: o.textContent.trim(), country: o.dataset.country }));
    EXTRA_CITIES.forEach((c) => { if (!cityMaster.some((x) => x.value === c.value)) cityMaster.push(c); });

    const country = $('edit-country');
    if (country && !qs('option[value="kurdistan"]', country)) {
      const opt = new Option('کوردستان', 'kurdistan');
      country.insertBefore(opt, country.children[1] || null);
    }

    const holder = qs('#edit-profile-form > div');
    if (holder && !$('edit-avatar-preview')) {
      const row = el('div', 'flex items-center gap-4');
      const trigger = el('button', 'relative h-20 w-20 shrink-0 overflow-hidden rounded-full ring-2 ring-brand-500/40 transition active:scale-95');
      trigger.type = 'button';
      trigger.id = 'edit-avatar-trigger';
      trigger.setAttribute('aria-label', 'گۆڕینی وێنەی پرۆفایل');
      const img = el('img', 'h-full w-full bg-slate-200 object-cover dark:bg-night-700');
      img.id = 'edit-avatar-preview';
      img.alt = '';
      const veil = el('span', 'absolute inset-0 flex items-center justify-center bg-black/35 text-white');
      const cam = document.createElement('i');
      cam.setAttribute('data-lucide', 'camera');
      cam.className = 'h-6 w-6';
      veil.appendChild(cam);
      trigger.append(img, veil);
      const file = el('input', 'hidden');
      file.type = 'file';
      file.accept = 'image/*';
      file.id = 'edit-avatar-file';
      const hint = el('p', 'text-sm text-slate-500 dark:text-slate-400', 'وێنەی پرۆفایل بگۆڕە');
      row.append(trigger, file, hint);
      holder.insertBefore(row, holder.firstChild);
      trigger.addEventListener('click', () => file.click());
      file.addEventListener('change', async () => {
        const f = file.files && file.files[0];
        file.value = '';
        if (!f) return;
        try {
          editAvatarData = await compressImage(f, 250, 0.85, true);
          img.src = editAvatarData;
        } catch (err) { showToast('وێنەکە نەخوێندرایەوە', 'circle-alert'); }
      });
      refreshIcons();
    }
  }

  function citiesFor(country) {
    if (!country) return [];
    if (country === 'iraq' || country === 'kurdistan') return cityMaster.filter((c) => KURDISH_COUNTRY_GROUP.indexOf(c.country) !== -1);
    return cityMaster.filter((c) => c.country === country);
  }

  function populateCities(country, selected) {
    const sel = $('edit-city');
    const list = citiesFor(country);
    sel.replaceChildren(new Option('هەڵبژێرە...', ''));
    list.forEach((c) => { const o = new Option(c.label, c.value); o.dataset.country = c.country; sel.appendChild(o); });
    sel.disabled = !country || !list.length;
    sel.value = list.some((c) => c.value === selected) ? selected : '';
  }

  function updateEditCounters() {
    $('edit-name-count').textContent = $('edit-display-name').value.length + '/40';
    $('edit-username-count').textContent = $('edit-username').value.length + '/20';
    $('edit-bio-count').textContent = $('edit-bio').value.length + '/160';
  }

  function validateEdit() {
    const name = $('edit-display-name').value.trim();
    const handle = $('edit-username').value.trim();
    let ok = true;
    const nameErr = $('edit-name-error');
    const userErr = $('edit-username-error');
    if (!name) { nameErr.textContent = 'ناوی پیشاندراو پێویستە.'; show(nameErr); ok = false; } else hide(nameErr);
    let msg = '';
    if (!/^[A-Za-z0-9_]{3,20}$/.test(handle)) msg = 'تەنها پیتی ئینگلیزی، ژمارە و _ بەکاربهێنە (لە ٣ بۆ ٢٠ پیت).';
    else if (Object.keys(state.users).some((h) => h.toLowerCase() === handle.toLowerCase())) msg = 'ئەم ناوی بەکارهێنەرە پێشتر گیراوە.';
    if (msg) { userErr.textContent = msg; show(userErr); ok = false; } else hide(userErr);
    $('edit-profile-save').disabled = !ok;
    return ok;
  }

  function openEditProfile() {
    const u = state.currentUser;
    editAvatarData = null;
    $('edit-display-name').value = u.displayName;
    $('edit-username').value = u.username;
    $('edit-bio').value = u.bio || '';
    const countrySel = $('edit-country');
    let key = u.countryKey || '';
    if (!key && u.country) {
      const hit = qsa('option', countrySel).find((o) => o.textContent.trim() === u.country);
      key = hit ? hit.value : '';
    }
    countrySel.value = key;
    populateCities(key, u.cityKey || '');
    $('edit-avatar-preview').src = u.avatar;
    updateEditCounters();
    validateEdit();
    const modal = $('edit-profile-modal');
    show(modal, 'flex');
    modal.setAttribute('aria-hidden', 'false');
    lockScroll();
    setTimeout(() => $('edit-display-name').focus(), 60);
  }

  function closeEditProfile() {
    if (!isEditOpen()) return;
    const modal = $('edit-profile-modal');
    hide(modal, 'flex');
    modal.setAttribute('aria-hidden', 'true');
    unlockScroll();
  }

  function saveProfile() {
    if (!validateEdit()) return;
    const u = state.currentUser;
    const oldHandle = u.username;
    const name = $('edit-display-name').value.trim();
    const handle = $('edit-username').value.trim();
    const countrySel = $('edit-country');
    const citySel = $('edit-city');
    u.displayName = name;
    u.username = handle;
    u.bio = $('edit-bio').value.trim();
    u.countryKey = countrySel.value;
    u.country = countrySel.value ? countrySel.options[countrySel.selectedIndex].textContent.trim() : '';
    u.cityKey = citySel.value;
    u.city = citySel.value ? citySel.options[citySel.selectedIndex].textContent.trim() : '';
    if (editAvatarData) { u.avatar = editAvatarData; u.avatarCustom = true; }
    else if (!u.avatarCustom) u.avatar = makeAvatar(name, handle);
    if (oldHandle !== handle) {
      state.posts.forEach((p) => {
        if (p.authorHandle === oldHandle) p.authorHandle = handle;
        p.comments.forEach((c) => { if (c.authorHandle === oldHandle) c.authorHandle = handle; });
      });
      if (state.viewingUserHandle === oldHandle) state.viewingUserHandle = handle;
      state.chats.forEach((c) => { if (Array.isArray(c.members)) c.members = c.members.map((h) => (h === oldHandle ? handle : h)); });
    }
    saveState();
    closeEditProfile();
    renderIdentity();
    renderAllLists();
    if (currentView === 'chat-list') renderChatList();
    updateJsonLd();
    showToast('پرۆفایلەکەت نوێکرایەوە', 'circle-check');
  }

  /* =====================================================================
     17. NOTIFICATIONS (#view-notifications)
     ===================================================================== */
  function upgradeNotifTabs() {
    const tabs = $('notif-tabs');
    if (!tabs) return;
    const first = qs('button', tabs);
    const cls = first ? first.className : '';
    const defs = [['all', 'هەموو'], ['LIKE', 'پەسەندکردن'], ['COMMENT', 'لێدوانەکان'], ['FOLLOW', 'شوێنکەوتن']];
    tabs.replaceChildren.apply(tabs, defs.map((d, i) => {
      const b = el('button', cls, d[1]);
      b.type = 'button';
      b.setAttribute('role', 'tab');
      b.dataset.notifFilter = d[0];
      b.setAttribute('aria-selected', String(i === 0));
      return b;
    }));
  }

  const notifVisible = (n) => state.settings[NOTIF_SETTING_KEY[n.type]] !== false;

  function updateBadge() {
    const count = state.notifications.filter((n) => !n.read && notifVisible(n)).length;
    const badge = $('notif-badge');
    if (!badge) return;
    badge.textContent = count > 9 ? toKu(9) + '+' : toKu(count);
    badge.classList.toggle('hidden', count === 0);
  }

  function buildNotification(n) {
    const node = $('tpl-notification').content.firstElementChild.cloneNode(true);
    const item = qs('.notif-item', node);
    item.dataset.notificationId = n.id;
    item.dataset.type = n.type;
    qs('.notif-icon', node).setAttribute('data-lucide', NOTIF_ICON[n.type]);
    const avatar = qs('.notif-avatar', node);
    avatar.src = n.actorAvatar;
    avatar.alt = n.actorName;
    const text = qs('.notif-text', node);
    text.replaceChildren(el('strong', 'font-extrabold', n.actorName));
    const preview = qs('.notif-preview', node);
    if (n.type === 'LIKE') {
      text.append(' پۆستەکەتی پەسەند کرد.');
      preview.textContent = n.postExcerpt;
    } else if (n.type === 'COMMENT') {
      text.append(' لێدوانێکی نووسی: «' + n.commentText + '»');
      preview.textContent = n.postExcerpt;
    } else {
      text.append(' دەستی کرد بە شوێنکەوتنت.');
      preview.remove();
      const follow = isFollowing(n.actorHandle);
      const pill = el('span', 'notif-follow-btn mt-2 inline-flex items-center rounded-full px-4 py-1.5 text-xs font-bold transition active:scale-95 ' + (follow ? 'border border-slate-300 text-slate-700 dark:border-white/20 dark:text-slate-200' : 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'), follow ? 'شوێنکەوتوو' : 'شوێنکەوتنەوە');
      pill.setAttribute('role', 'button');
      pill.setAttribute('tabindex', '0');
      pill.setAttribute('aria-pressed', String(follow));
      pill.dataset.actor = n.actorHandle;
      text.parentElement.insertBefore(pill, qs('.notif-time', node));
    }
    const time = qs('.notif-time', node);
    time.textContent = timeAgo(n.timestamp);
    time.dataset.ts = String(n.timestamp);
    time.dateTime = new Date(n.timestamp).toISOString();
    if (!n.read) {
      item.classList.add('bg-brand-50/60', 'dark:bg-brand-500/5');
      qs('.notif-unread-dot', node).classList.remove('hidden');
    }
    return node;
  }

  function renderNotifications() {
    upgradeNotifTabsIfNeeded();
    const list = $('notif-list');
    const items = state.notifications
      .filter((n) => notifVisible(n) && (ui.notifFilter === 'all' || n.type === ui.notifFilter))
      .sort((a, b) => b.timestamp - a.timestamp);
    const frag = document.createDocumentFragment();
    items.forEach((n) => frag.appendChild(buildNotification(n)));
    list.replaceChildren(frag);
    if (items.length) hide($('notif-empty'), 'flex'); else show($('notif-empty'), 'flex');
    qsa('#notif-tabs [data-notif-filter]').forEach((b) => b.setAttribute('aria-selected', String(b.dataset.notifFilter === ui.notifFilter)));
    updateBadge();
    refreshIcons();
  }

  function upgradeNotifTabsIfNeeded() {
    if (!qs('#notif-tabs [data-notif-filter="LIKE"]')) upgradeNotifTabs();
  }

  function onNotifClick(e) {
    const pill = e.target.closest('.notif-follow-btn');
    if (pill) {
      e.stopPropagation();
      toggleFollow(pill.dataset.actor);
      renderNotifications();
      return;
    }
    const item = e.target.closest('.notif-item');
    if (!item) return;
    const n = state.notifications.find((x) => x.id === item.dataset.notificationId);
    if (!n) return;
    if (!n.read) { n.read = true; saveState(); updateBadge(); }
    if (n.type === 'FOLLOW') { openProfile(n.actorHandle); return; }
    ui.feedTab = 'for-you';
    navigateTo('home', { reset: true });
    setTimeout(() => { if (!scrollToPost(n.postId)) showToast('ئەم پۆستە ئیتر بەردەست نییە', 'circle-alert'); }, 80);
  }

  /* =====================================================================
     18. CHAT LIST & CHAT ROOM
     ===================================================================== */
  const pendingReplyChats = new Set();

  function markRead(icon) {
    const fresh = document.createElement('i');
    fresh.setAttribute('data-lucide', 'check-check');
    fresh.className = 'message-status h-3.5 w-3.5 text-brand-500';
    icon.replaceWith(fresh);
  }

  const getChat = (id) => state.chats.find((c) => c.id === id);
  const lastMessage = (c) => c.messages[c.messages.length - 1] || null;

  function chatMeta(c) {
    if (c.type === 'dm') { const u = getUser(c.handle); return { name: u.displayName, avatar: u.avatar }; }
    return { name: c.name, avatar: c.avatar };
  }

  function chatStatusText(c) {
    if (c.type === 'group') return toKu(c.members.length) + ' ئەندام';
    return c.online ? 'ئۆنلاین' : (c.lastSeen || 'دوایین بینین: ماوەیەک لەمەوبەر');
  }

  function renderChatList() {
    const list = $('chat-list');
    const rawQuery = $('chat-search').value || '';
    const q = normalize(rawQuery).trim().toLowerCase();
    const sorted = state.chats.slice().sort((a, b) => ((lastMessage(b) || {}).ts || 0) - ((lastMessage(a) || {}).ts || 0));
    const filtered = sorted.filter((c) => {
      if (!q) return true;
      const meta = chatMeta(c);
      const last = lastMessage(c);
      return normalize(meta.name).toLowerCase().indexOf(q) !== -1 || (last && normalize(last.text).toLowerCase().indexOf(q) !== -1);
    });
    const frag = document.createDocumentFragment();
    filtered.forEach((c) => {
      const node = $('tpl-chat-item').content.firstElementChild.cloneNode(true);
      const meta = chatMeta(c);
      const last = lastMessage(c);
      qs('.chat-item', node).dataset.chatId = c.id;
      const av = qs('.chat-item-avatar', node);
      av.src = meta.avatar;
      av.alt = '';
      qs('.chat-item-name', node).textContent = meta.name;
      qs('.chat-item-time', node).textContent = last ? chatListTime(last.ts) : '';
      qs('.chat-item-preview', node).textContent = last ? (last.from === 'me' ? 'تۆ: ' : '') + last.text : 'گفتوگۆیەک دەستپێبکە';
      const unread = qs('.chat-item-unread', node);
      if (c.unread > 0) { unread.textContent = toKu(c.unread); unread.classList.remove('hidden'); }
      qs('.chat-item-online', node).classList.toggle('hidden', !(c.type === 'dm' && c.online));
      frag.appendChild(node);
    });
    list.replaceChildren(frag);
    if (state.chats.length === 0) show($('chat-list-empty'), 'flex'); else hide($('chat-list-empty'), 'flex');
    $('chat-list-no-results').classList.toggle('hidden', !(state.chats.length > 0 && filtered.length === 0));
    refreshIcons();
  }

  function buildMessageNode(chat, m) {
    const mine = m.from === 'me';
    const node = $(mine ? 'tpl-message-outgoing' : 'tpl-message-incoming').content.firstElementChild.cloneNode(true);
    node.dataset.messageId = m.id;
    const text = qs('.message-text', node);
    text.textContent = m.text;
    qs('.message-time', node).textContent = clockTime(m.ts);
    if (mine) {
      const icon = qs('.message-status', node);
      const read = m.status === 'read' && state.settings.readReceipts;
      icon.setAttribute('data-lucide', read ? 'check-check' : 'check');
      if (read) icon.classList.add('text-brand-500');
    } else if (chat.type === 'group') {
      const sender = getUser(m.from);
      const tag = el('span', 'mb-0.5 block text-xs font-extrabold text-brand-600 dark:text-brand-400', sender.displayName);
      text.parentElement.insertBefore(tag, text);
    }
    return node;
  }

  function messagesBox() { return $('chat-messages'); }

  function scrollChatToBottom(smooth) {
    const box = messagesBox();
    box.scrollTo({ top: box.scrollHeight, behavior: smooth ? 'smooth' : 'auto' });
  }

  function appendMessage(chat, m, prev) {
    const box = messagesBox();
    const placeholder = qs('.chat-empty-note', box);
    if (placeholder) placeholder.remove();
    if (!prev || dayKey(prev.ts) !== dayKey(m.ts)) {
      const d = $('tpl-chat-date-divider').content.firstElementChild.cloneNode(true);
      qs('.chat-date-label', d).textContent = dayLabel(m.ts);
      box.appendChild(d);
    }
    box.appendChild(buildMessageNode(chat, m));
    refreshIcons();
  }

  function renderChatMessages(chat) {
    const box = messagesBox();
    box.replaceChildren();
    if (!chat.messages.length) {
      box.appendChild(el('p', 'chat-empty-note m-auto text-center text-sm text-slate-400', 'گفتوگۆیەک دەستپێبکە و یەکەم نامە بنێرە.'));
    }
    chat.messages.forEach((m, i) => appendMessage(chat, m, chat.messages[i - 1]));
    scrollChatToBottom(false);
    updateScrollButton();
  }

  function updateScrollButton() {
    const box = messagesBox();
    const far = box.scrollHeight - box.scrollTop - box.clientHeight > 140;
    const btn = $('chat-scroll-bottom');
    if (far) show(btn, 'inline-flex'); else hide(btn, 'inline-flex');
  }

  function renderChatHeader(chat) {
    const meta = chatMeta(chat);
    $('chat-room-name').textContent = meta.name;
    $('chat-room-status').textContent = chatStatusText(chat);
    const av = $('chat-room-avatar');
    av.src = meta.avatar;
    av.alt = meta.name;
    $('chat-room-online-dot').classList.toggle('hidden', !(chat.type === 'dm' && chat.online));
  }

  function hideTyping() {
    hide($('chat-typing'), 'flex');
  }

  function openChat(id) {
    const chat = getChat(id);
    if (!chat) return;
    hideTyping();
    ui.activeChatId = id;
    chat.unread = 0;
    saveState();
    const input = $('chat-input');
    input.value = '';
    input.style.height = 'auto';
    $('chat-send').disabled = true;
    closePopover();
    navigateTo('chat-room');
    renderChatHeader(chat);
    renderChatMessages(chat);
    setTimeout(() => input.focus(), 120);
  }

  function openChatWithUser(handle) {
    let chat = state.chats.find((c) => c.type === 'dm' && c.handle === handle);
    if (!chat) {
      chat = { id: uid('chat'), type: 'dm', handle: handle, online: Math.random() > 0.5, lastSeen: 'دوایین بینین: ئەمڕۆ', unread: 0, muted: false, messages: [] };
      state.chats.push(chat);
      saveState();
    }
    openChat(chat.id);
  }

  const REPLY_RULES = [
    { re: /سڵاو|ساڵاو|بەیانی باش|ئێوارە باش/, out: ['سڵاو و ڕێزت! چۆنی؟', 'سڵاو گیان، بەخێربێیت. چی نوێ هەیە؟'] },
    { re: /سوپاس|سپاس|دەستت خۆش|ماندوو/, out: ['هیچ نییە، ئەرکمانە.', 'قوربانت بم، هەمیشە سەرکەوتوو بیت.'] },
    { re: /شیعر|غەزەل|بەیت|دیوان|نالی|مەحوی/, out: ['شیعری کلاسیک هەمیشە دەرگای خەیاڵمان لێ دەکاتەوە.', 'بەیتێکی جوانە؛ با سەرچاوەکەشی بنووسین بۆ ئەرشیڤ.'] },
    { re: /چاوگ|ڕێزمان|وشە|فەرهەنگ|ئاوەز|داڤین/, out: ['بۆ وشە و چاوگەکان با لیستێکی هاوبەش دروست بکەین.', 'باشە، نموونەی ڕستەشی لەگەڵ بنووسە بۆ ئەوەی تۆمار بکرێت.'] },
    { re: /داتا|کۆرپەس|ژیریی دەستکرد|jsonl|مۆدێل/, out: ['داتاسێتەکە دەبێت پاک و یەکگرتوو بێت؛ پیتەکان پێویستە بە ستانداردی کوردی بن.', 'پێشنیارێکی باشە، دەیخەمە ناو لیستی کارەکانی ئەم هەفتەیەوە.'] }
  ];
  const REPLY_DM = ['باشە، با لێی بڕوانم و بۆت بنووسمەوە.', 'ڕاستە، منیش هەمان ڕام هەیە.', 'زۆر باشە، دەستت خۆش بێت!', 'کەمێکی تر وەڵامت دەدەمەوە، چاوەڕێم بکە.', 'ئەمە بیرۆکەیەکی جوانە، با پەرەی پێ بدەین.'];
  const REPLY_GROUP = ['پشتگیریی دەکەم، با لە کۆبوونەوەی داهاتوودا باسی بکەین.', 'ڕاستە، پێویستە هەموومان بەشداری بکەین.', 'بیرۆکەیەکی باشە؛ با بەڵگەنامەی هاوبەشەکە نوێ بکەینەوە.', 'منیش ئامادەم یارمەتی بدەم.'];

  function pickReply(chat, text) {
    const t = normalize(text).toLowerCase();
    let pool = null;
    for (let i = 0; i < REPLY_RULES.length; i++) { if (REPLY_RULES[i].re.test(t)) { pool = REPLY_RULES[i].out; break; } }
    if (!pool && /[؟?]/.test(t)) pool = ['پرسیارێکی باشە؛ با کەمێک بیری لێ بکەمەوە و وەڵامێکی ورد بدەمەوە.'];
    if (!pool) pool = chat.type === 'group' ? REPLY_GROUP : REPLY_DM;
    const lastIn = chat.messages.slice().reverse().find((m) => m.from !== 'me');
    const fresh = pool.filter((p) => !lastIn || p !== lastIn.text);
    const choices = fresh.length ? fresh : pool;
    return choices[Math.floor(Math.random() * choices.length)];
  }

  function sendChatMessage() {
    const chat = getChat(ui.activeChatId);
    const input = $('chat-input');
    if (!chat) return;
    const text = normalize(input.value).trim();
    if (!text) return;
    const prev = lastMessage(chat);
    const msg = { id: uid('m'), from: 'me', text: text, ts: Date.now(), status: 'sent' };
    chat.messages.push(msg);
    input.value = '';
    input.style.height = 'auto';
    $('chat-send').disabled = true;
    saveState();
    appendMessage(chat, msg, prev);
    scrollChatToBottom(true);

    show($('chat-typing'), 'flex');
    scrollChatToBottom(true);
    const chatId = chat.id;
    if (pendingReplyChats.has(chatId)) return;
    pendingReplyChats.add(chatId);
    setTimeout(() => {
      pendingReplyChats.delete(chatId);
      const c = getChat(chatId);
      if (!c) { hideTyping(); return; }
      const lastMine = c.messages.slice().reverse().find((m) => m.from === 'me');
      const others = c.type === 'dm' ? [c.handle] : c.members.filter((h) => h !== state.currentUser.username);
      const sender = others.length ? others[Math.floor(Math.random() * others.length)] : (c.handle || c.members[0]);
      const reply = { id: uid('m'), from: sender, text: pickReply(c, lastMine ? lastMine.text : ''), ts: Date.now(), status: 'sent' };
      c.messages.forEach((m) => { if (m.from === 'me') m.status = 'read'; });
      const before = lastMessage(c);
      c.messages.push(reply);
      const viewing = ui.activeChatId === chatId && currentView === 'chat-room';
      if (!viewing) c.unread += 1;
      saveState();
      if (viewing) {
        hideTyping();
        if (state.settings.readReceipts) qsa('.chat-message-outgoing .message-status', messagesBox()).forEach(markRead);
        appendMessage(c, reply, before);
        scrollChatToBottom(true);
        renderChatHeader(c);
      }
    }, 1100);
  }

  function openChatMenu(anchor) {
    const chat = getChat(ui.activeChatId);
    if (!chat) return;
    const items = [];
    if (chat.type === 'dm') items.push({ label: 'بینینی پرۆفایل', icon: 'user', onClick: () => openProfile(chat.handle) });
    items.push({
      label: chat.muted ? 'لابردنی بێدەنگی' : 'بێدەنگکردن', icon: chat.muted ? 'bell' : 'bell-off',
      onClick: () => { chat.muted = !chat.muted; saveState(); showToast(chat.muted ? 'گفتوگۆکە بێدەنگ کرا' : 'بێدەنگییەکە لابرا', chat.muted ? 'bell-off' : 'bell'); }
    });
    items.push({
      label: 'پاککردنەوەی گفتوگۆ', icon: 'trash-2', danger: true,
      onClick: () => {
        if (!window.confirm('هەموو نامەکانی ئەم گفتوگۆیە بسڕدرێنەوە؟')) return;
        chat.messages = [];
        saveState();
        hideTyping();
        renderChatMessages(chat);
        showToast('گفتوگۆکە پاک کرایەوە', 'trash-2');
      }
    });
    openMenu(anchor, items);
  }

  /* =====================================================================
     19. SETTINGS, OPEN KURDISH AI CORPUS EXPORT, JSON-LD
     ===================================================================== */
  const SETTING_INPUTS = {
    'setting-notif-likes': 'notifLikes', 'setting-notif-replies': 'notifReplies', 'setting-notif-follows': 'notifFollows',
    'setting-notif-messages': 'notifMessages', 'setting-private-account': 'privateAccount', 'setting-read-receipts': 'readReceipts'
  };

  function syncSettingsUI() {
    Object.keys(SETTING_INPUTS).forEach((id) => { const n = $(id); if (n) n.checked = !!state.settings[SETTING_INPUTS[id]]; });
    qsa('input[name="theme"]').forEach((r) => { r.checked = r.value === themeMode; });
  }

  function injectCorpusSection() {
    const host = qs('#view-settings > div');
    if (!host || $('export-jsonl-btn')) return;
    const sec = el('section');
    sec.setAttribute('aria-labelledby', 'settings-corpus-title');
    const title = el('h3', 'mb-2 px-1 text-sm font-extrabold text-brand-700 dark:text-brand-400', 'ژێرخانی کراوەی ژیریی دەستکرد (Open Kurdish AI Corpus)');
    title.id = 'settings-corpus-title';
    const card = el('div', 'space-y-3 rounded-2xl border border-slate-200 p-4 dark:border-white/10');
    card.appendChild(el('p', 'text-sm leading-7 text-slate-600 dark:text-slate-300', 'هەموو پۆستەکان بە مۆڵەتی CC-BY-4.0 وەک داتاسێتێکی کراوە بۆ پەروەردەکردنی مۆدێلە زمانییەکان دابەزێنە.'));
    const exp = el('button', 'flex w-full items-center justify-center gap-2 rounded-full bg-brand-600 px-5 py-3 text-sm font-bold text-white shadow-md shadow-brand-600/25 transition active:scale-[0.98]');
    exp.type = 'button';
    exp.id = 'export-jsonl-btn';
    const dl = document.createElement('i');
    dl.setAttribute('data-lucide', 'download');
    dl.className = 'h-5 w-5';
    exp.append(dl, el('span', '', 'داگرتنی داتاسێت بە فۆرماتی JSONL'));
    const reset = el('button', 'flex w-full items-center justify-center gap-2 rounded-full border border-slate-300 px-5 py-3 text-sm font-bold transition hover:bg-slate-100 active:scale-[0.98] dark:border-white/20 dark:hover:bg-white/10');
    reset.type = 'button';
    reset.id = 'reset-seed-btn';
    const rs = document.createElement('i');
    rs.setAttribute('data-lucide', 'rotate-ccw');
    rs.className = 'h-5 w-5';
    reset.append(rs, el('span', '', 'گەڕاندنەوەی داتای بنەڕەتی'));
    card.append(exp, reset);
    sec.append(title, card);
    const about = qs('section[aria-labelledby="settings-about-title"]', host);
    host.insertBefore(sec, about || null);
    exp.addEventListener('click', exportCorpus);
    reset.addEventListener('click', resetToSeed);
    refreshIcons();
  }

  function exportCorpus() {
    if (!state.posts.length) { showToast('هیچ پۆستێک بۆ داگرتن نییە', 'circle-alert'); return; }
    const lines = state.posts.slice().sort((a, b) => a.timestamp - b.timestamp).map((p) => {
      const author = getUser(p.authorHandle);
      return JSON.stringify({
        id: p.id,
        text: p.text,
        text_latin: toLatin(p.text),
        language: 'ckb',
        script: 'Arab',
        word_count: countWords(p.text),
        genre: p.isPoetry ? 'poetry' : 'prose',
        author: author.displayName,
        author_handle: author.username,
        created_at: new Date(p.timestamp).toISOString(),
        license: 'CC-BY-4.0',
        source: 'Meko'
      });
    });
    const blob = new Blob([lines.join('\n') + '\n'], { type: 'application/x-ndjson;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = el('a');
    a.href = url;
    a.download = 'meko_kurdish_corpus.jsonl';
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    setTimeout(() => { a.remove(); URL.revokeObjectURL(url); }, 1500);
    showToast('داتاسێتەکە ئامادە کرا (' + toKu(lines.length) + ' پۆست)', 'download');
  }

  function resetToSeed() {
    if (!window.confirm('هەموو داتاکانی مەکۆ بۆ دۆخی یەکەم دەگەڕێنرێنەوە. دڵنیایت؟')) return;
    try { localStorage.removeItem(STATE_KEY); } catch (e) { /* storage unavailable */ }
    hideTyping();
    pendingReplyChats.clear();
    openDrawers.clear();
    pendingPosts = [];
    poolIndex = 0;
    setPill(0);
    state = buildSeed();
    ui.feedTab = 'for-you';
    ui.profileTab = 'posts';
    ui.notifFilter = 'all';
    ui.activeChatId = null;
    saveState();
    renderIdentity();
    updateBadge();
    updateJsonLd();
    navigateTo('home', { reset: true });
    showToast('داتای بنەڕەتی گەڕایەوە', 'rotate-ccw');
  }

  function updateJsonLd() {
    const node = $('meko-jsonld');
    if (!node) return;
    const graph = state.posts.slice().sort((a, b) => b.timestamp - a.timestamp).map((p) => {
      const author = getUser(p.authorHandle);
      return {
        '@type': 'SocialMediaPosting',
        '@id': '#' + p.id,
        headline: excerpt(p.text, 80),
        articleBody: p.text,
        inLanguage: 'ku',
        genre: p.isPoetry ? 'poetry' : 'prose',
        datePublished: new Date(p.timestamp).toISOString(),
        license: 'https://creativecommons.org/licenses/by/4.0/',
        author: { '@type': 'Person', name: author.displayName, alternateName: '@' + author.username },
        interactionStatistic: [
          { '@type': 'InteractionCounter', interactionType: 'https://schema.org/LikeAction', userInteractionCount: p.likes },
          { '@type': 'InteractionCounter', interactionType: 'https://schema.org/CommentAction', userInteractionCount: p.comments.length }
        ],
        comment: p.comments.slice(0, 5).map((c) => ({
          '@type': 'Comment', text: c.text, inLanguage: 'ku',
          dateCreated: new Date(c.timestamp).toISOString(),
          author: { '@type': 'Person', name: getUser(c.authorHandle).displayName }
        }))
      };
    });
    node.textContent = JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }).replace(/</g, '\\u003c');
  }

  /* =====================================================================
     20. EVENT BINDING
     ===================================================================== */
  function bindEvents() {
    /* --- navigation, drawer, theme --- */
    document.addEventListener('click', (e) => {
      const b = e.target.closest('[data-nav-target]');
      if (!b) return;
      const target = b.dataset.navTarget;
      const inDrawer = !!b.closest('#sidebar-panel');
      const inBar = !!b.closest('#bottom-bar');
      if (inDrawer) closeDrawer(false);
      if (target === 'profile') { openProfile(state.currentUser.username); return; }
      if (target === 'chat-list') hideTyping();
      navigateTo(target, { reset: inBar });
    });
    $('nav-menu').addEventListener('click', () => (isDrawerOpen() ? closeDrawer() : openDrawer()));
    $('sidebar-close').addEventListener('click', () => closeDrawer());
    $('sidebar-backdrop').addEventListener('click', () => closeDrawer());
    $('theme-toggle').addEventListener('click', () => applyTheme(isDarkNow() ? 'light' : 'dark'));
    qsa('input[name="theme"]').forEach((r) => r.addEventListener('change', () => { if (r.checked) applyTheme(r.value); }));
    if (mql) {
      const onScheme = () => { if (themeMode === 'system') applyTheme('system', false); };
      if (mql.addEventListener) mql.addEventListener('change', onScheme); else if (mql.addListener) mql.addListener(onScheme);
    }
    $('profile-back').addEventListener('click', () => goBack('home'));
    $('saved-back').addEventListener('click', () => goBack('home'));
    $('settings-back').addEventListener('click', () => goBack('home'));
    $('chat-back').addEventListener('click', () => { hideTyping(); goBack('chat-list'); });

    /* --- feed --- */
    [$('feed-list'), $('profile-posts-list'), $('saved-list')].forEach(bindPostList);
    $('feed-tabs').addEventListener('click', (e) => {
      const t = e.target.closest('[data-feed]');
      if (!t) return;
      ui.feedTab = t.dataset.feed;
      renderFeed();
    });
    $('feed-refresh').addEventListener('click', refreshFeed);
    $('feed-retry').addEventListener('click', () => { hide($('feed-error'), 'flex'); renderFeed(); });
    $('new-posts-pill').addEventListener('click', () => {
      mergePendingPosts();
      ui.feedTab = 'for-you';
      renderFeed();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    /* --- creator --- */
    ['nav-create', 'home-composer-trigger', 'feed-empty-create'].forEach((id) => $(id).addEventListener('click', openCreator));
    $('home-composer-image').addEventListener('click', () => { openCreator(); $('creator-file-input').click(); });
    $('creator-close').addEventListener('click', requestCloseCreator);
    $('creator-textarea').addEventListener('input', updateCreatorUI);
    $('creator-submit').addEventListener('click', submitPost);
    $('creator-add-image').addEventListener('click', () => $('creator-file-input').click());
    $('creator-file-input').addEventListener('change', (e) => { const files = Array.from(e.target.files || []); e.target.value = ''; handleCreatorFiles(files); });
    $('creator-add-emoji').addEventListener('click', (e) => openEmojiPicker(e.currentTarget, (em) => insertAtCaret($('creator-textarea'), em)));
    $('creator-add-location').addEventListener('click', () => {
      const u = state.currentUser;
      const place = u.city || u.country;
      if (!place) { showToast('یەکەم شوێنەکەت لە پرۆفایلدا دیاری بکە', 'map-pin'); return; }
      insertAtCaret($('creator-textarea'), '📍 ' + place);
    });
    $('creator-discard-confirm').addEventListener('click', () => { resetCreator(); closeCreator(); });
    $('creator-save-draft').addEventListener('click', () => {
      state.draft = { text: $('creator-textarea').value, isPoetry: creator.isPoetry, media: creator.media.map((m) => m.src) };
      saveState();
      resetCreator();
      closeCreator();
      showToast('وەک ڕەشنووس پاشەکەوت کرا', 'file-text');
    });
    $('creator-discard-cancel').addEventListener('click', () => { hide($('creator-discard-sheet'), 'flex'); $('creator-textarea').focus(); });

    /* --- profile --- */
    $('profile-tabs').addEventListener('click', (e) => {
      const t = e.target.closest('[data-profile-tab]');
      if (!t) return;
      ui.profileTab = t.dataset.profileTab;
      renderProfile();
    });
    $('profile-edit-btn').addEventListener('click', openEditProfile);
    $('settings-edit-profile').addEventListener('click', openEditProfile);
    $('profile-follow-btn').addEventListener('click', () => { toggleFollow(state.viewingUserHandle); renderProfile(); });
    $('profile-message-btn').addEventListener('click', () => openChatWithUser(state.viewingUserHandle));
    $('profile-following-btn').addEventListener('click', () => openUserList('following'));
    $('profile-followers-btn').addEventListener('click', () => openUserList('followers'));

    /* --- edit profile --- */
    $('edit-profile-close').addEventListener('click', closeEditProfile);
    $('edit-profile-cancel').addEventListener('click', closeEditProfile);
    $('edit-profile-backdrop').addEventListener('click', closeEditProfile);
    ['edit-display-name', 'edit-username', 'edit-bio'].forEach((id) => $(id).addEventListener('input', () => { updateEditCounters(); validateEdit(); }));
    $('edit-country').addEventListener('change', (e) => populateCities(e.target.value, ''));
    $('edit-profile-form').addEventListener('submit', (e) => { e.preventDefault(); saveProfile(); });

    /* --- notifications --- */
    $('notif-tabs').addEventListener('click', (e) => {
      const t = e.target.closest('[data-notif-filter]');
      if (!t) return;
      ui.notifFilter = t.dataset.notifFilter;
      renderNotifications();
    });
    $('notif-list').addEventListener('click', onNotifClick);
    $('notif-list').addEventListener('keydown', (e) => {
      const pill = e.target.closest('.notif-follow-btn');
      if (pill && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); e.stopPropagation(); toggleFollow(pill.dataset.actor); renderNotifications(); }
    });
    $('notif-mark-all').addEventListener('click', () => {
      const had = state.notifications.some((n) => !n.read);
      state.notifications.forEach((n) => { n.read = true; });
      saveState();
      renderNotifications();
      if (had) showToast('هەموو ئاگادارکردنەوەکان وەک خوێندراو دیاری کران', 'check-check');
    });

    /* --- chat --- */
    $('chat-search').addEventListener('input', renderChatList);
    $('chat-list').addEventListener('click', (e) => {
      const item = e.target.closest('.chat-item');
      if (item) openChat(item.dataset.chatId);
    });
    const input = $('chat-input');
    input.addEventListener('input', () => {
      input.style.height = 'auto';
      input.style.height = Math.min(input.scrollHeight, 120) + 'px';
      $('chat-send').disabled = !input.value.trim();
    });
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey && !e.isComposing && window.matchMedia && window.matchMedia('(pointer: fine)').matches) {
        e.preventDefault();
        sendChatMessage();
      }
    });
    $('chat-form').addEventListener('submit', (e) => { e.preventDefault(); sendChatMessage(); });
    $('chat-messages').addEventListener('scroll', updateScrollButton, { passive: true });
    $('chat-scroll-bottom').addEventListener('click', () => scrollChatToBottom(true));
    $('chat-emoji-btn').addEventListener('click', (e) => openEmojiPicker(e.currentTarget, (em) => insertAtCaret(input, em)));
    $('chat-room-menu').addEventListener('click', (e) => openChatMenu(e.currentTarget));
    $('chat-room-profile').addEventListener('click', () => {
      const chat = getChat(ui.activeChatId);
      if (!chat) return;
      if (chat.type === 'dm') openProfile(chat.handle);
      else showToast(chat.name + ' · ' + toKu(chat.members.length) + ' ئەندام', 'users');
    });

    /* --- settings toggles --- */
    Object.keys(SETTING_INPUTS).forEach((id) => {
      const n = $(id);
      if (!n) return;
      n.addEventListener('change', () => {
        state.settings[SETTING_INPUTS[id]] = n.checked;
        saveState();
        updateBadge();
        if (currentView === 'notifications') renderNotifications();
      });
    });

    /* --- global: popovers, keyboard --- */
    document.addEventListener('pointerdown', (e) => { if (activePopover && !activePopover.contains(e.target)) closePopover(); }, true);
    window.addEventListener('scroll', () => { closePopover(); }, { passive: true, capture: true });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        if (closePopover()) return;
        if (closeUserSheet()) return;
        const sheet = $('creator-discard-sheet');
        if (sheet && !sheet.classList.contains('hidden')) { hide(sheet, 'flex'); return; }
        if (isCreatorOpen()) { requestCloseCreator(); return; }
        if (isEditOpen()) { closeEditProfile(); return; }
        if (isDrawerOpen()) { closeDrawer(); return; }
        return;
      }
      if (e.key === 'Tab') {
        const box = isEditOpen() ? $('edit-profile-modal') : isCreatorOpen() ? $('creator-canvas') : isDrawerOpen() ? $('sidebar-panel') : null;
        if (box) trapTab(e, box);
      }
    });
  }

  /* =====================================================================
     21. BOOT
     ===================================================================== */
  function init() {
    state = loadState();
    loadTheme();
    hideSkeletons();
    const drawer = $('sidebar-drawer');
    if (drawer) { drawer.classList.add('drawer-closed'); drawer.dataset.state = 'closed'; drawer.setAttribute('aria-hidden', 'true'); }
    upgradeNotifTabs();
    prepareEditModal();
    injectCorpusSection();
    ensurePoetryToggle();
    bindEvents();
    renderIdentity();
    updateBadge();
    updateJsonLd();
    saveState();
    navigateTo('home', { reset: true, keepScroll: true });
    refreshIcons();
    setInterval(tickTimes, 60000);
    setTimeout(queueIncomingPost, 30000);
    setTimeout(queueIncomingPost, 90000);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
