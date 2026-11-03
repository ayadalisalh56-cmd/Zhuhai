(function () {
  'use strict';

  const STATE_KEY = 'meko_state_v1';
  const THEME_KEY = 'meko_theme';
  const KURDISTAN_CITIES = [
    'ئاکرێ', 'ئامەد', 'ئامێدی', 'ئورفا', 'ئیلام', 'باتمان', 'بانە', 'بێدلیس', 'بۆکان', 'پاوە', 'پێنجوێن', 'پیرانشار', 'تەقتەق', 'تکریت', 'جۆلەمێرگ', 'جوانڕۆ', 'چەمچەماڵ', 'چۆمان', 'حەسەکە', 'خانەقین', 'خۆی', 'خورماتوو', 'دێرسیم', 'دهۆک', 'دیواندەرە', 'ڕانیە', 'ڕەواندز', 'زاخۆ', 'زەڕایەن', 'سەردەشت', 'سەرپێڵی زەهاو', 'سەرێکانی', 'سەقز', 'سلێمانی', 'سنە', 'سۆران', 'سێرت', 'شنگال', 'شنۆ', 'شرنەخ', 'شەقڵاوە', 'عەفرین', 'قارس', 'قامیشلۆ', 'قەڵادزێ', 'قوچان', 'کرماشان', 'کەرکووک', 'کەلار', 'کۆبانێ', 'کۆیە', 'کفری', 'ماردین', 'ماکۆ', 'مەریوان', 'مەهاباد', 'مەلاطیە', 'مووش', 'نەغەدە', 'هەڵەبجە', 'هەولێر', 'وان'
  ];
  const COUNTRIES = ['کوردستان', 'ئەڵمانیا', 'سوید', 'بەریتانیا', 'فەڕەنسا', 'ئەمریکا', 'کەنەدا', 'ئوسترالیا', 'هیتر'];
  const OTHER_CITIES = {
    'ئەڵمانیا': ['بەرلین', 'هامبورگ', 'میونخ', 'فرانکفۆرت'],
    'سوید': ['ستۆکهۆڵم', 'گۆتەنبێرگ', 'مالمۆ'],
    'بەریتانیا': ['لەندەن', 'مانچستەر', 'بێرمینگام'],
    'فەڕەنسا': ['پاریس', 'مارسێ', 'لیۆن'],
    'ئەمریکا': ['نیویۆرک', 'لۆس ئانجلەس', 'واشنتن'],
    'کەنەدا': ['تۆرۆنتۆ', 'مۆنتریاڵ', 'ئۆتاوا'],
    'ئوسترالیا': ['سیدنی', 'مەلبۆرن', 'پێرت'],
    'هیتر': ['شارێکی تر']
  };

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));
  const main = $('#main-content');
  const nav = $('#bottom-nav');
  const modalRoot = $('#modal-root');
  const toastRegion = $('#toast-region');

  const makeId = (prefix) => `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
  const escapeHTML = (value) => String(value ?? '').replace(/[&<>"']/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[character]));
  const makeAvatar = (label = 'م') => {
    const initial = String(label || 'م').trim().slice(0, 1) || 'م';
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="250" height="250" viewBox="0 0 250 250"><rect width="250" height="250" rx="125" fill="#e7e7e9"/><circle cx="125" cy="92" r="43" fill="#a1a1aa"/><path d="M42 235c8-48 39-76 83-76s75 28 83 76" fill="#71717a"/><text x="125" y="224" text-anchor="middle" font-family="sans-serif" font-size="1" fill="#fff">${escapeHTML(initial)}</text></svg>`;
    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  };
  const nowIso = () => new Date().toISOString();
  const dateHoursAgo = (hours) => new Date(Date.now() - hours * 3600000).toISOString();
  const formatTime = (iso) => {
    const date = new Date(iso || Date.now());
    if (Number.isNaN(date.getTime())) return '';
    return new Intl.DateTimeFormat('ku-IQ', { hour: '2-digit', minute: '2-digit' }).format(date);
  };
  const formatNumber = (value) => new Intl.NumberFormat('ku-IQ').format(value || 0);
  const estimateKB = (text) => {
    try { return Math.max(1, Math.ceil(new TextEncoder().encode(text || '').length / 1024)); }
    catch (error) { return Math.max(1, Math.ceil(String(text || '').length / 1024)); }
  };

  function createInitialState() {
    const me = {
      id: 'u-me', displayName: 'والی', handle: 'wali_kurd',
      locationCountry: 'کوردستان', city: 'کەرکووک', locationText: 'کوردستان، کەرکووک',
      bio: 'تەلارسازیی وشە و خەیاڵ؛ هەوڵێک بۆ پاراستن و بوژاندنەوەی زمانی ڕەسەنی کوردی لە جیهانی دیجیتاڵیدا.',
      avatar: makeAvatar('و'), followers: 1280, following: 402
    };
    const users = [
      { id: 'u-aw', name: 'ئاوات عەبدولڕەحمان', handle: 'awat_ad', avatar: makeAvatar('ئ'), online: true },
      { id: 'u-dilan', name: 'دیلان هەورامی', handle: 'dilan_h', avatar: makeAvatar('د'), online: true },
      { id: 'u-karwan', name: 'کاروان شارەزووری', handle: 'karwan_sh', avatar: makeAvatar('ک'), online: false },
      { id: 'u-shirin', name: 'شیرین عارف', handle: 'shirin_a', avatar: makeAvatar('ش'), online: true },
      { id: 'u-arman', name: 'ئارام مەریوانی', handle: 'aram_m', avatar: makeAvatar('ئ'), online: false }
    ];
    const posts = [
      {
        id: 'p-001', authorId: 'u-me', createdAt: dateHoursAgo(1), isPoetry: false,
        text: 'زمان تەنها کۆمەڵێک وشە نییە؛ بیرەوەریی گەلێکە کە لە دەنگ، ڕەنگ، ناو و چیرۆکدا دەژی. هەر وشەیەک کە بە دروستی دەینووسین، پردێکە لە نێوان ڕابردوو و داهاتوو.',
        likeCount: 38, likedByMe: false,
        comments: [
          { id: 'c-001', authorId: 'u-aw', text: 'بەڕاستی، هەر وشەیەک شوێنپێی مێژوویە.', createdAt: dateHoursAgo(.7) },
          { id: 'c-002', authorId: 'u-me', text: 'وەک هەڵگرتنی چرایەک لە تاریکیی کاتدا.', createdAt: dateHoursAgo(.5) }
        ]
      },
      {
        id: 'p-002', authorId: 'u-aw', createdAt: dateHoursAgo(4), isPoetry: true,
        text: `سەراپای گوارە زەردی ترس و لەرزە
دەڵێی عاسی بووە لەو جێگە بەرزە!
— نالی، دیوان، پیتی ە`,
        likeCount: 74, likedByMe: true,
        comments: [{ id: 'c-003', authorId: 'u-dilan', text: 'وێنەسازییەکی ناسک و ئارامە.', createdAt: dateHoursAgo(3) }]
      },
      {
        id: 'p-003', authorId: 'u-dilan', createdAt: dateHoursAgo(8), isPoetry: true,
        text: `لە ئولکەی عیشقەدا بێ چوونە سەر دار
بە ئاسانی مەزانە بوونە سەردار
— مەحوی، دیوان، پیتی ر`,
        likeCount: 56, likedByMe: false,
        comments: [{ id: 'c-004', authorId: 'u-me', text: 'ئەو هیوایەی بچووکە زۆرجار گەورەترین هێزە.', createdAt: dateHoursAgo(6) }]
      },
      {
        id: 'p-004', authorId: 'u-me', createdAt: dateHoursAgo(14), isPoetry: true,
        text: `لە باخی وشەدا گوڵێک بە ناوی یاد دەچێنم
بە ئاوی خەون و فرمێسک ڕەگ لە خاک دەکات
ئەگەر با هەڵسا و پەڕەکانی بردنەوە
هەر بۆنی ئەو گوڵە لە هەناسەمدا دەمێنێت`,
        likeCount: 91, likedByMe: false,
        comments: [{ id: 'c-005', authorId: 'u-shirin', text: 'ئەم چوار دێڕە هەستی زۆری تێدایە.', createdAt: dateHoursAgo(12) }]
      },
      {
        id: 'p-005', authorId: 'u-karwan', createdAt: dateHoursAgo(21), isPoetry: false,
        text: 'لە خوێندنەوەی دەقی کۆندا، نابێت تەنها بە وشەی ئەمڕۆ حوکم بدەین. واتای وشە لە سەردەمی خۆیدا، لە دەقە هاوڕێکانیدا و لە شێوازی بەکارهێنانی نووسەرەکەدا دەردەکەوێت. بۆیە کۆکردنەوەی نموونە و بەراوردکردنیان بنەمای لێکۆڵینەوەی زمانە.',
        likeCount: 29, likedByMe: false,
        comments: [{ id: 'c-006', authorId: 'u-aw', text: 'بە تایبەتی لە وشە کۆنەکاندا ئەمە زۆر گرنگە.', createdAt: dateHoursAgo(19) }]
      },
      {
        id: 'p-006', authorId: 'u-me', createdAt: dateHoursAgo(30), isPoetry: false,
        text: 'ئەرشیفێکی دیجیتاڵی کوردی تەنها کۆگای فایل نییە. پێویستە دەقەکان ناونیشان، نووسەر، پۆلێن و سەرچاوەیان هەبێت؛ بتوانرێت بگەڕێین، کۆپییان بکەین و بە شێوەیەکی کراوە بخوێندرێنەوە. ئەم وردەکارییانە بنەمای بەکارهێنانی داهاتووی دەق لە فێرکاری و توێژینەوەدا دادەنێن.',
        likeCount: 43, likedByMe: false, comments: []
      }
    ];
    const chats = [
      {
        id: 'dm-awat', type: 'dm', contactId: 'u-aw', name: 'ئاوات عەبدولڕەحمان', avatar: users[0].avatar, online: true, unread: 2,
        messages: [
          { id: 'm-a1', senderId: 'u-aw', senderName: users[0].name, text: 'سڵاو والی، ئەو بیرۆکەیەی دەربارەی یەکخستنی فۆنت و نووسینی کوردی باسمان کرد، دەستم پێکردووە.', createdAt: dateHoursAgo(5) },
          { id: 'm-a2', senderId: 'u-me', senderName: me.displayName, text: 'زۆر باشە. پێم وایە سەرەتا پێویستە شێوەی پیتەکان و جیاوازیی ک و ك بە وردی تۆمار بکەین.', createdAt: dateHoursAgo(4.8) },
          { id: 'm-a3', senderId: 'u-aw', senderName: users[0].name, text: 'ڕاستە، هەروەها پێویستە نموونەی دەقی کۆن و نوێمان هەبێت بۆ بەراوردکردن.', createdAt: dateHoursAgo(4.6) },
          { id: 'm-a4', senderId: 'u-me', senderName: me.displayName, text: 'ئەمە دەبێتە بنەمای کارەکە. لیستێکی وشەی نموونە ئامادە دەکەم.', createdAt: dateHoursAgo(4.4) }
        ]
      },
      {
        id: 'dm-dilan', type: 'dm', contactId: 'u-dilan', name: 'دیلان هەورامی', avatar: users[1].avatar, online: true, unread: 0,
        messages: [
          { id: 'm-d1', senderId: 'u-dilan', senderName: users[1].name, text: 'لە هەورامان وشەیەکمان هەیە کە لە سنووری گۆڕانکاریی دەنگدا زۆر سەرنجڕاکێشە.', createdAt: dateHoursAgo(11) },
          { id: 'm-d2', senderId: 'u-me', senderName: me.displayName, text: 'تکایە لەگەڵ ڕستەیەکی تەواودا بنێرە، بۆ ئەوەی واتا و بارودۆخەکەشی تۆمار بکەین.', createdAt: dateHoursAgo(10.7) },
          { id: 'm-d3', senderId: 'u-dilan', senderName: users[1].name, text: 'بە دڵنیایی. سبەی نموونەکان ڕێکدەخەم و دەنێرم.', createdAt: dateHoursAgo(10.4) }
        ]
      },
      {
        id: 'dm-karwan', type: 'dm', contactId: 'u-karwan', name: 'کاروان شارەزووری', avatar: users[2].avatar, online: false, unread: 0,
        messages: [
          { id: 'm-k1', senderId: 'u-me', senderName: me.displayName, text: 'سەبارەت بە دەقی دیوانەکە، تۆ پێشنیاری چ چاپێک دەکەیت؟', createdAt: dateHoursAgo(26) },
          { id: 'm-k2', senderId: 'u-karwan', senderName: users[2].name, text: 'باشترە چاپەکە و ژمارەی لاپەڕە لەگەڵ دەقەکەدا تۆمار بکرێت؛ جیاوازیی نوسخەکانیش لەبەرچاو بگرین.', createdAt: dateHoursAgo(25.7) }
        ]
      }
    ];
    const groups = [
      {
        id: 'grp-language', type: 'group', name: 'ئەنجومەنی زمانەوانانی مەکۆ', description: 'کۆڕێک بۆ گفتوگۆی زانستی لە ڕێزمان، دەنگناسی و مێژووی وشە.', category: 'زمانەوانی', memberCount: 1850, avatar: makeAvatar('ز'), unread: 3,
        messages: [
          { id: 'g-l1', senderId: 'u-aw', senderName: users[0].name, avatar: users[0].avatar, text: 'لە بابەتی ئەم هەفتەدا، جیاوازیی نێوان دەنگ و پیت باس دەکەین.', createdAt: dateHoursAgo(2.4) },
          { id: 'g-l2', senderId: 'u-me', senderName: me.displayName, text: 'پێشنیار دەکەم نموونەی وشەکان بە شێوەی نووسراو و دەنگیی تۆمار بکرێن.', createdAt: dateHoursAgo(2.1) },
          { id: 'g-l3', senderId: 'u-dilan', senderName: users[1].name, avatar: users[1].avatar, text: 'بۆ زاراوەکانیش، ناوی شوێن و بارودۆخی بەکارهێنان گرنگە.', createdAt: dateHoursAgo(1.8) }
        ]
      },
      {
        id: 'grp-poetry', type: 'group', name: 'کۆڕی شیعری کلاسیکی کوردی', description: 'خوێندنەوە و گفتوگۆی دەقی کلاسیکی و شێوازی غەزەل.', category: 'شیعر و ئەدەب', memberCount: 3420, avatar: makeAvatar('ش'), unread: 0,
        messages: [
          { id: 'g-p1', senderId: 'u-karwan', senderName: users[2].name, avatar: users[2].avatar, text: 'ئەمڕۆ سەیری وێنەی مانا لە غەزەلەکانی مەحوی دەکەین.', createdAt: dateHoursAgo(8) },
          { id: 'g-p2', senderId: 'u-shirin', senderName: 'شیرین عارف', avatar: users[3].avatar, text: 'لە هەڵبژاردنی دەق، جیاوازیی نوسخەکان نابێت لەبیر بکرێت.', createdAt: dateHoursAgo(7.6) }
        ]
      }
    ];

    const library = [
      {
        id: 'book-nali', title: 'خوێندنەوەیەک لە جیهانی نالی', author: 'نالی؛ پێشەکی و تێبینیی خوێندنەوە', category: 'دیوانی شیعر', format: 'TXT',
        sourceNote: 'بەیتی هەڵبژێردراو لە دیوانی نالی، پیتی ە، لە ویکی‌سەرچاوە وەرگیراوە؛ پێشەکی و ڕوونکردنەوەکان نووسینی ئەرشیفی مەکۆن، نەک دەقی نوسخەیەکی ڕەخنەیی.',
        sourceURL: 'https://wikisource.org/wiki/%D8%AF%DB%8C%D9%88%D8%A7%D9%86%DB%8C_%D9%86%D8%A7%D9%84%DB%8C/%DB%95',
        content: `نالی و هونەری زمان

نالی لە مێژووی شیعری کوردیدا ناوێکی دیارە. لە خوێندنەوەی شیعرەکانی، وشە تەنها ئامرازی گەیاندنی بیر نییە؛ دەبێتە ماددەی وێنەسازی، ئاواز و بیرکردنەوە. زمانی شیعرەکەی بە هەڵبژاردنی وردی وشە و پەیوەندیی نێوان دەنگ و واتا دەوڵەمەند دەبێت.

بەیتی هەڵبژێردراو لە دیوانی نالی، پیتی ە

سەراپای گوارە زەردی ترس و لەرزە
دەڵێی عاسی بووە لەو جێگە بەرزە!

لە شێوازی غەزەلدا، یەک دێڕ دەتوانێت وێنەیەکی تەواو دروست بکات و دێڕی دواتر هەمان وێنە لە ڕوویەکی ترەوە بخاتەڕوو. خوێنەر پێویستە لە هەر بەیتێکدا پەیوەندیی ناوەوەی وشەکان و ئاوازیان بپشکنێت.

تێبینیی خوێندنەوە: لەم دوو دێڕەدا وێنەی ترس و لەرز لەگەڵ بەرزیی شوێن دەبەسترێتەوە. بۆ لێکۆڵینەوەی ئەکادیمی، وەشانی چاپکراو و ژمارەی لاپەڕە پێویستە بەراورد بکرێن. ئەم تێبینییە ڕوونکردنەوەی ئەرشیفی مەکۆیە، نەک بەشێک لە دەقی شاعیر.`
      },
      {
        id: 'book-mahwi', title: 'مەحوی و ڕەنگی عیرفانی لە شیعردا', author: 'مەحوی؛ تێبینیی ئەدەبی', category: 'دیوانی شیعر', format: 'TXT',
        sourceNote: 'بەیتی هەڵبژێردراو لە دیوانی مەحوی، پیتی ر، لە ویکی‌سەرچاوە وەرگیراوە؛ تێبینی و خوێندنەوەی ئەدەبی نووسینی ئەرشیفی مەکۆن.',
        sourceURL: 'https://wikisource.org/wiki/%D8%AF%DB%8C%D9%88%D8%A7%D9%86%DB%8C_%D9%85%DB%95%D8%AD%D9%88%DB%8C/%D8%B1',
        content: `مەحوی و ڕەنگی عیرفانی

لە خوێندنەوەی شیعری مەحوی، دەتوانرێت سەرنج بدرێت بە پەیوەندیی نێوان دڵ، ڕێگا و ناسینی خۆ. وشەی عیرفانی لەم جۆرە دەقەدا تەنها ناوی چەمکێکی ئایینی نییە؛ زۆرجار وێنەی گەڕان و گۆڕانی ناوەوەی مرۆڤە.

بەیتی هەڵبژێردراو لە دیوانی مەحوی، پیتی ر

لە ئولکەی عیشقەدا بێ چوونە سەر دار
بە ئاسانی مەزانە بوونە سەردار

ڕێگای خوێندنەوەی باش ئەوەیە یەکەم جار دەق بە ئاواز بخوێندرێتەوە، پاشان وشە و ئاماژەکان دەستنیشان بکرێن. دووبارەبوونەوەی وێنەی ڕووناکی، تاریکی، مەی و سەفەر لە شیعری کلاسیکدا دەکرێت لە چەند ئاستێکدا واتا هەڵبگرێت.

هەندێک جار وشەیەکی ئاسایی لە ناو دەقێکی عیرفانیدا واتایەکی فراوانتر وەردەگرێت. بۆ نموونە، «ڕێگا» دەتوانێت ڕێگای فیزیکی بێت، بەڵام لە دەقی هەڵبژێردراودا ئاماژە بێت بە پڕۆسەی گەشەی ڕۆحی.

لە لێکۆڵینەوەدا نابێت هەموو ئاماژەیەک بە یەک واتا سنووردار بکرێت. مێژووی وشە، ژینگەی فکری و کۆمەڵە دەقەکە یارمەتیدەرن بۆ تێگەیشتنێکی وردتر.

تێبینیی سەرچاوە: ئەم بەیتە لە دیوانی مەحوی، پیتی ر، هەڵبژێردراوە. بابەتی پێشەکی و خوێندنەوەکە بۆ ئەرشیفی مەکۆ نووسراوە و نابێت بە دەقی شاعیر تێکەڵ بکرێت.`
      },
      {
        id: 'book-haji', title: 'حاجی قادری کۆیی؛ شیعر و بیرەوەری', author: 'خوێندنەوەی مێژوویی', category: 'لێکۆڵینەوە', format: 'TXT',
        sourceNote: 'کورتە لێکۆڵینەوەی خوێندنەوەییە، نەک دەقی کۆکراوەی شیعرەکان.',
        content: `حاجی قادری کۆیی؛ شیعر و بیرەوەری\n\nحاجی قادری کۆیی لەو شاعیرانەیە کە ناوی لەگەڵ بیرکردنەوەی کۆمەڵایەتی و هۆشیاریی نەتەوەیی پەیوەست بووە. لە خوێندنەوەی میراثی ئەدەبیی ئەودا، گرنگە شیعر لە چوارچێوەی سەردەمی خۆیدا ببینرێت؛ چونکە دەق لە ژینگەی سیاسی، کۆمەڵایەتی و فکریی خۆی جیا نابێتەوە.\n\nشیعر دەتوانێت هەمان کات هەست و بیر بگەیەنێت. وشەی نیشتمان، خوێندن، زانست و یەکگرتوویی لە دەقی نەتەوەییدا لە ئاستی واتای فەرهەنگییەوە دەچنە ئاستی داواکاریی کۆمەڵایەتی.\n\nبۆ خوێندنەوەی ڕەخنەیی، ئەم پرسیارانە گرنگن: شاعیر کێی بانگ دەکات؟ کێشەکە چۆن دەناسێنێت؟ وشەی هەڵبژێردراو چ هەستێک دروست دەکات؟ و دەنگی شاعیر لە کوێوە قسە دەکات؟\n\nهەروەها پێویستە جیاوازیی نێوان زمان و شێوازی نووسین لە چاپە جیاوازەکاندا تۆمار بکرێت. ڕێنووسی نوێ نابێت بە بێ تێبینی جێگای ڕەنووسی نوسخەی کۆن بگرێتەوە، چونکە شێوەی نووسین خۆی بەشێکە لە مێژووی دەق.\n\nئەم دەقە پێشەکییەکە بۆ گفتوگۆ و خوێندنەوە؛ بۆ وەشانێکی زانستی، سەرچاوە، چاپ و ژمارەی لاپەڕە پێویستن.`
      },
      {
        id: 'book-etymology', title: 'فەرهەنگی ڕەچەڵەک و وشەی کوردی', author: 'دەستەی زمان و وشە', category: 'فەرهەنگ و زمان', format: 'TXT',
        sourceNote: 'دەقی نموونەیی و ڕێنماییە؛ وشەکان پێویستیان بە پشتڕاستکردنەوەی فەرهەنگی و سەرچاوەیە.',
        content: `فەرهەنگی ڕەچەڵەک و وشەی کوردی\n\nئامانجی فەرهەنگی ڕەچەڵەک ئەوەیە بۆ هەر وشەیەک، شێوەی نووسین، واتا، جۆری وشە، نموونەی بەکارهێنان و ئەگەر بەردەست بوو، مێژووی گۆڕانی تۆمار بکات. ڕەچەڵەک‌زانین تەنها گەڕان بەدوای وشەی هاوشێوەدا نییە؛ پێویستی بە بەڵگەی دەقی و مێژوویی هەیە.\n\nپێشنیاری خانەکانی فەرهەنگ\n\n١. وشە: شێوەی ستاندارد و شێوە جیاوازەکانی نووسین.\n٢. جۆر: ناو، کردار، ئاوەڵناو یان پەیوەندی.\n٣. واتا: واتای سەرەکی و واتا لاوەکییەکان.\n٤. نموونە: ڕستەیەکی سروشتی لە گفتوگۆ یان دەقی نووسراودا.\n٥. زاراوە: شوێنی تۆمارکردن، بەبێ ئەوەی زاراوەیەک بە هەڵە بە هەموو زمانەکە بگشتێندرێت.\n٦. سەرچاوە: فەرهەنگ، دەق، گۆڤار یان تۆماری مەیدانی.\n\nنموونەی شێوازی تۆمارکردن\n\n«ڕێگا» — ناو — ڕێڕەو یان شێوازی گەیشتن بە ئامانج.\nنموونە: ئەم ڕێگایە بۆ گوندەکە دەچێت.\nواتای مەجازی: ڕێگای خوێندن و فێربوون.\n\n«هیوە» — ناو — چاوەڕوانیی باش و باوەڕ بە داهاتوو.\nنموونە: هیوە هێزی بەردەوامبوونە.\n\nئەم نموونانە بۆ ڕوونکردنەوەی شێوازی کارن، نەک پێشنیاری ڕەچەڵەکی وشەکان. لە فەرهەنگی زانستیدا هەر بانگەشەیەکی ڕەچەڵەک دەبێت پشت بە بەڵگە و سەرچاوەی دیاریکراو ببەستێت.`
      },
      {
        id: 'book-dialect', title: 'تێبینیی زاراوەی هەورامی و کەڵهۆڕی', author: 'کۆمەڵەی لێکۆڵینەوەی زاراوە', category: 'لێکۆڵینەوە', format: 'TXT',
        sourceNote: 'ڕێنمایییەکی گشتیی مەیدانییە؛ تێبینییەکان پێویستیان بە داتای دەنگی و پشتڕاستکردنەوەی توێژەر هەیە.',
        content: `تێبینییەک لەسەر تۆمارکردنی زاراوە\n\nهەورامی و کەڵهۆڕی لە ناو چەندین شێوەی قسەکردن و ناوچەی زمانیی جیاوازدا دەژین. بۆ لێکۆڵینەوەی زاراوەیی، باشترە بەجای دانانی سنوورێکی سادە، تایبەتمەندییە دەنگی، ڕێزمانی و وشەییەکان لە داتای ڕاستەقینەدا تۆمار بکرێن.\n\nتۆماری مەیدانی دەبێت زانیارییەکانی بارودۆخی قسەکردن لەخۆ بگرێت: کێ قسە دەکات، لە کوێ، لەگەڵ کێ، لەسەر چ بابەتێک و بە چ شێوەیەک. ئەم زانیارییانە یارمەتیدەدەن نموونەی دەنگی لە دەقی نووسراو جیا بکرێتەوە.\n\nپێنج هەنگاوی تۆمارکردن\n\nیەکەم: ڕستەی سروشتی بەبێ دەستکاری تۆمار بکە.\nدووەم: دەنگە دیارەکان بە ڕێنمایییەکی یەکسان بنووسە.\nسێیەم: واتای وشە و ڕستەکە لە قسەکەر بپرسە.\nچوارەم: نموونەی هاوشێوە لە قسەکەرانی تر کۆبکەرەوە.\nپێنجەم: ناوچە، بەروار و ڕێگای تۆمارکردن لەگەڵ داتا بپارێزە.\n\nلە بەراوردی زاراوەکاندا، هاوشێوەییی وشە بە تەنها بەڵگەی یەک ڕەچەڵەک نییە. دەبێت مێژووی دەنگ، پەیوەندییە کۆمەڵایەتییەکان و گۆڕانی واتاش لەبەرچاو بگیرێن.\n\nئەم تێبینییە بە مەبەستی ڕێنماییی شێوازی توێژینەوە نووسراوە و جێگای پەڕتووکی زاراوەناسی یان تۆماری دەنگیی تایبەت ناگرێتەوە.`
      },
      {
        id: 'book-aesthetics', title: 'جوانیناسی و مانای ئەزموونی هونەری', author: 'وتاری فەلسەفی', category: 'لێکۆڵینەوە', format: 'TXT',
        sourceNote: 'وتارێکی فەلسەفیی نوێیە کە بۆ ئەرشیفی مەکۆ ئامادە کراوە.',
        content: `جوانیناسی و ئەزموونی هونەری\n\nجوانیناسی لێکۆڵینەوە لە سروشتی جوانی، ئەزموونی هونەری و شێوازی تێگەیشتنی مرۆڤە لە بەرهەمی هونەری. پرسیاری سەرەکی ئەوە نییە تەنها «ئەم شتە جوانە؟»؛ بەڵکو ئەوەیە چۆن ئەزموونی جوانی دروست دەبێت و چۆن فەرهەنگ و مێژوو لە پێناسەکردنی جوانیدا بەشدارن.\n\nبەرهەمی هونەری لە نێوان دوو ئاستدا دەجووڵێت: ماددە و مانا. لە تابلۆدا ڕەنگ و هێڵ، لە میوزیکدا دەنگ و کات، و لە ئەدەبدا وشە و ئاواز ماددەی هونەرن. بەڵام ئەم ماددانە کاتێک دەبنە ئەزموونی هونەری کە لە ڕێکخستنێکی واتاداردا پەیوەندییان پێکەوە ببەسترێت.\n\nخوێنەر یان بینەر تەنها وەرگرێکی بێدەنگ نییە. ئەو بە بیرەوەری، زمان، ئەزموونی ژیان و چاوەڕوانییەکانی خۆی بەشداری لە دروستکردنی واتا دەکات. بۆیە دوو کەس دەتوانن هەمان شیعر بخوێننەوە و دوو ئەزموونی جیاواز هەڵبگرن.\n\nلە ئەدەبی کوردیدا، پەیوەندیی نێوان دەنگ، وێنە و بیرەوەری دەتوانێت نموونەیەکی دەوڵەمەند بێت بۆ ئەم پرسیارە. زاراوە، شێوازی دەربڕین و بیرەوەریی شوێن هەموویان کاریگەرییان لەسەر ئەزموونی خوێندنەوە هەیە.\n\nهەڵسەنگاندنی هونەر نابێت بە تامی تاکەکەسی سنووردار بکرێت؛ بەڵام نابێت تامی تاکەکەسیش بە تەواوی لەبەرچاو نەگیرێت. گفتوگۆی ڕەخنەیی دەتوانێت نێوان ئەزموونی کەسی و پێوەرە فەرهەنگییەکان پرد دروست بکات.\n\nلە کۆتاییدا، جوانی وەک پرسیارێکی کراوە دەمێنێتەوە. گرنگیی هونەر لەوەدایە کە مرۆڤ ناچار دەکات زیاتر ببینێت، وردتر بپرسێت و جیهان لە ڕوانگەیەکی نوێوە بخوێنێتەوە.`
      }
    ];

    return {
      currentUser: me,
      users,
      posts,
      bookmarks: ['p-005'],
      chats,
      groups,
      library,
      createdAt: nowIso()
    };
  }

  function loadState() {
    try {
      const stored = localStorage.getItem(STATE_KEY);
      if (!stored) {
        const fresh = createInitialState();
        localStorage.setItem(STATE_KEY, JSON.stringify(fresh));
        return fresh;
      }
      const parsed = JSON.parse(stored);
      const fallback = createInitialState();
      return {
        ...fallback,
        ...parsed,
        currentUser: { ...fallback.currentUser, ...(parsed.currentUser || {}) },
        users: Array.isArray(parsed.users) ? parsed.users : fallback.users,
        posts: Array.isArray(parsed.posts) ? parsed.posts : fallback.posts,
        bookmarks: Array.isArray(parsed.bookmarks) ? parsed.bookmarks : fallback.bookmarks,
        chats: Array.isArray(parsed.chats) ? parsed.chats : fallback.chats,
        groups: Array.isArray(parsed.groups) ? parsed.groups : fallback.groups,
        library: Array.isArray(parsed.library) ? parsed.library : fallback.library
      };
    } catch (error) {
      return createInitialState();
    }
  }

  let state = loadState();
  let currentView = 'timeline';
  let activeChatId = null;
  let chatsTab = 'dm';
  let profileTab = 'posts';
  let timelineSearchOpen = false;
  let timelineSearchText = '';
  let chatSearchText = '';
  let librarySearchText = '';
  let libraryCategory = 'هەموو';
  let menuOpen = false;
  let openPostMenuId = null;
  const openComments = new Set();
  let activeModal = null;
  let readerFontSize = 20;
  let pendingAvatarData = null;

  function persistState() {
    try {
      localStorage.setItem(STATE_KEY, JSON.stringify(state));
      updateJsonLd();
      return true;
    } catch (error) {
      showToast('شوێنی پاشەکەوتکردن پڕ بووە؛ وێنە یان دەقی زۆر گەورە کەم بکەرەوە.');
      return false;
    }
  }

  function showToast(message) {
    if (!toastRegion) return;
    const toast = document.createElement('div');
    toast.className = 'toast-message';
    toast.textContent = message;
    toastRegion.appendChild(toast);
    window.setTimeout(() => toast.remove(), 2600);
  }

  function updateTheme(theme) {
    const resolved = theme === 'dark' ? 'dark' : 'light';
    document.documentElement.classList.toggle('dark', resolved === 'dark');
    document.documentElement.classList.toggle('light', resolved === 'light');
    localStorage.setItem(THEME_KEY, resolved);
    const themeMeta = $('meta[name="theme-color"]');
    if (themeMeta) themeMeta.content = resolved === 'dark' ? '#09090b' : '#ffffff';
  }

  function getTheme() {
    const saved = localStorage.getItem(THEME_KEY);
    return saved === 'dark' ? 'dark' : 'light';
  }

  function findUser(userId) {
    if (userId === state.currentUser.id) {
      return { id: state.currentUser.id, name: state.currentUser.displayName, avatar: state.currentUser.avatar, handle: state.currentUser.handle };
    }
    return state.users.find((user) => user.id === userId) || { id: userId, name: 'بەکارهێنەر', avatar: makeAvatar('ب') };
  }

  function avatarHTML(userId, className = 'avatar-sm', fallback = null) {
    const user = userId ? findUser(userId) : null;
    const source = fallback || (user && user.avatar) || state.currentUser.avatar;
    const alt = user ? user.name : state.currentUser.displayName;
    return `<img class="${className}" src="${escapeHTML(source)}" alt="${escapeHTML(alt)}" loading="lazy">`;
  }

  function renderIcon(name, extraClass = '') {
    return `<i data-lucide="${escapeHTML(name)}"${extraClass ? ` class="${escapeHTML(extraClass)}"` : ''}></i>`;
  }

  function initializeIcons() {
    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      window.lucide.createIcons({ attrs: { 'stroke-width': 1.75 } });
    }
  }

  function getPostAuthorName(post) {
    return findUser(post.authorId).name;
  }

  function getPostSearchText(post) {
    return `${getPostAuthorName(post)} ${post.text}`.toLocaleLowerCase();
  }

  function renderPost(post) {
    const author = findUser(post.authorId);
    const liked = Boolean(post.likedByMe);
    const bookmarked = state.bookmarks.includes(post.id);
    const isCommentOpen = openComments.has(post.id);
    const isMenuOpen = openPostMenuId === post.id;
    const commentRows = (post.comments || []).map((comment) => {
      const commentAuthor = findUser(comment.authorId);
      return `<div class="comment-row">
        ${avatarHTML(comment.authorId, 'avatar-xs')}
        <div class="comment-content"><span class="comment-author">${escapeHTML(commentAuthor.name)}</span>${escapeHTML(comment.text)}</div>
      </div>`;
    }).join('');
    const menu = isMenuOpen ? `<div class="post-more-menu">
      <button class="menu-action" data-action="bookmark-post" data-post-id="${escapeHTML(post.id)}">${renderIcon(bookmarked ? 'bookmark-check' : 'bookmark')}<span>${bookmarked ? 'لابردنی لە پاشەکەوت' : 'پاشەکەوتکردن'}</span></button>
      ${post.authorId === state.currentUser.id ? `<button class="menu-action danger" data-action="delete-post" data-post-id="${escapeHTML(post.id)}">${renderIcon('trash-2')}<span>سڕینەوە</span></button>` : ''}
    </div>` : '';

    return `<article id="${escapeHTML(post.id)}" class="post-item" data-post-id="${escapeHTML(post.id)}" data-search="${escapeHTML(getPostSearchText(post))}" itemscope itemtype="https://schema.org/SocialMediaPosting">
      <div class="post-header">
        ${avatarHTML(post.authorId, 'avatar-sm')}
        <div class="post-author-block">
          <span class="post-author-name" itemprop="author">${escapeHTML(author.name)}</span>
          <time class="post-time" datetime="${escapeHTML(post.createdAt)}" itemprop="datePublished">${formatTime(post.createdAt)}</time>
        </div>
        <div class="post-more-wrap">
          <button class="icon-button" aria-label="هەڵبژاردەکانی پۆست" data-action="post-menu" data-post-id="${escapeHTML(post.id)}">${renderIcon('more-horizontal')}</button>
          ${menu}
        </div>
      </div>
      <div class="post-body${post.isPoetry ? ' poetry' : ''}" itemprop="articleBody">${escapeHTML(post.text)}</div>
      <div class="post-actions">
        <button class="post-action${liked ? ' liked' : ''}" data-action="like-post" data-post-id="${escapeHTML(post.id)}" aria-pressed="${liked}">${renderIcon('heart')}<span>${escapeHTML(formatNumber(post.likeCount || 0))} · پەسەندکردن</span></button>
        <button class="post-action" data-action="toggle-comments" data-post-id="${escapeHTML(post.id)}">${renderIcon('message-square')}<span>${escapeHTML(formatNumber((post.comments || []).length))} · لێدوان</span></button>
        <button class="post-action" data-action="share-post" data-post-id="${escapeHTML(post.id)}">${renderIcon('share-2')}<span>هاوبەشیکردن</span></button>
      </div>
      ${isCommentOpen ? `<section class="comments-drawer" aria-label="لێدوانەکان">
        ${commentRows || '<p class="muted" style="font-size:12px;margin:8px 0">هێشتا لێدوانێک نییە.</p>'}
        <form class="comment-form" data-form="comment" data-post-id="${escapeHTML(post.id)}">
          <input name="commentText" type="text" placeholder="لێدوانێک بنووسە..." autocomplete="off" required>
          <button type="submit" aria-label="ناردنی لێدوان">${renderIcon('arrow-up')}</button>
        </form>
      </section>` : ''}
    </article>`;
  }

  function renderTimeline() {
    const query = timelineSearchText.trim().toLocaleLowerCase();
    const posts = [...state.posts].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    const filtered = query ? posts.filter((post) => getPostSearchText(post).includes(query)) : posts;
    return `<header class="screen-header">
      <h1 class="brand-title">مەکۆ</h1>
      <button class="icon-button" aria-label="گەڕان" data-action="toggle-timeline-search">${renderIcon('search')}</button>
    </header>
    ${timelineSearchOpen ? `<div class="inline-search"><input id="timeline-search" class="pill-input" type="search" placeholder="گەڕان لە دەق یان نووسەر..." value="${escapeHTML(timelineSearchText)}" autocomplete="off"></div>` : ''}
    <section class="feed-list" aria-label="پۆستەکانی مەکۆ">
      ${filtered.length ? filtered.map(renderPost).join('') : '<div class="empty-state">هیچ پۆستێک لەم گەڕانەدا نەدۆزرایەوە.</div>'}
    </section>`;
  }

  function renderProfile() {
    const ownPosts = [...state.posts].filter((post) => post.authorId === state.currentUser.id).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    const selectedPosts = profileTab === 'posts' ? ownPosts : [...state.posts].filter((post) => state.bookmarks.includes(post.id)).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return `<header id="profile-${escapeHTML(state.currentUser.handle)}" class="screen-header profile-topline">
      <span style="font-size:14px;font-weight:700">@${escapeHTML(state.currentUser.handle)}</span>
      <button class="icon-button" aria-label="دەستکاریکردنی پڕۆفایل" data-action="open-profile-edit">${renderIcon('settings-2')}</button>
    </header>
    <section class="profile-head-row">
      <div class="profile-avatar-ring">${avatarHTML(state.currentUser.id, 'avatar-lg')}</div>
      <div class="profile-stats">
        <div class="profile-stat"><strong>${formatNumber(ownPosts.length)}</strong><span>پۆست</span></div>
        <div class="profile-stat"><strong>${formatNumber(state.currentUser.followers || 0)}</strong><span>شوێنکەوتووان</span></div>
        <div class="profile-stat"><strong>${formatNumber(state.currentUser.following || 0)}</strong><span>شوێنکەوتوو</span></div>
      </div>
    </section>
    <section class="profile-bio">
      <div class="profile-display-name">${escapeHTML(state.currentUser.displayName)}</div>
      <p class="profile-bio-text">${escapeHTML(state.currentUser.bio)}</p>
      <div class="profile-location">${renderIcon('map-pin')}<span>${escapeHTML(state.currentUser.locationText || '')}</span></div>
    </section>
    <div class="profile-actions">
      <button class="secondary-button" data-action="open-profile-edit">دەستکاریکردنی پڕۆفایل</button>
      <button class="secondary-button" data-action="share-profile">هاوبەشیکردنی پڕۆفایل</button>
    </div>
    <div class="profile-tabs" role="tablist">
      <button class="profile-tab${profileTab === 'posts' ? ' active' : ''}" role="tab" aria-selected="${profileTab === 'posts'}" data-action="profile-tab" data-tab="posts">بڵاوکراوەکانم</button>
      <button class="profile-tab${profileTab === 'saved' ? ' active' : ''}" role="tab" aria-selected="${profileTab === 'saved'}" data-action="profile-tab" data-tab="saved">پاشەکەوتکراوەکان</button>
    </div>
    <section class="feed-list" aria-label="ناوەڕۆکی پڕۆفایل">
      ${selectedPosts.length ? selectedPosts.map(renderPost).join('') : '<div class="empty-state">ئەم بەشە هێشتا بەتاڵە.</div>'}
    </section>`;
  }

  function renderConversationRow(chat, type) {
    const lastMessage = (chat.messages || []).slice(-1)[0];
    const preview = lastMessage ? lastMessage.text : 'گفتوگۆ دەست پێ بکە';
    const image = type === 'group' ? chat.avatar : (chat.avatar || findUser(chat.contactId).avatar);
    return `<article class="conversation-row" data-action="open-chat" data-chat-id="${escapeHTML(chat.id)}" data-chat-type="${type}" tabindex="0" role="button">
      <div class="conversation-avatar-wrap">
        <img class="avatar-md" src="${escapeHTML(image || makeAvatar(chat.name))}" alt="${escapeHTML(chat.name)}">
        ${type === 'dm' && chat.online ? '<span class="online-dot"></span>' : ''}
      </div>
      <div class="conversation-info">
        <span class="conversation-name">${escapeHTML(chat.name)}</span>
        <span class="conversation-preview">${escapeHTML(preview)}</span>
      </div>
      <div class="conversation-meta"><time datetime="${escapeHTML(lastMessage ? lastMessage.createdAt : nowIso())}">${lastMessage ? formatTime(lastMessage.createdAt) : ''}</time>${chat.unread ? `<span class="unread-count">${formatNumber(chat.unread)}</span>` : ''}</div>
    </article>`;
  }

  function renderChatList() {
    const items = chatsTab === 'dm' ? state.chats : state.groups;
    const query = chatSearchText.trim().toLocaleLowerCase();
    const filtered = items.filter((chat) => {
      const last = (chat.messages || []).slice(-1)[0];
      return !query || `${chat.name} ${last ? last.text : ''}`.toLocaleLowerCase().includes(query);
    });
    return `<header class="screen-header">
      <h1 class="header-title">نامەدان</h1>
      <button class="icon-button" aria-label="دروستکردنی نامە یان گرووپ" data-action="open-chat-composer">${renderIcon('square-pen')}</button>
    </header>
    <div class="chat-search-wrap"><input class="pill-input" id="chat-search" type="search" placeholder="گەڕان لە نامەکان..." value="${escapeHTML(chatSearchText)}" autocomplete="off"></div>
    <div class="segment-tabs" role="tablist">
      <button class="segment-tab${chatsTab === 'dm' ? ' active' : ''}" role="tab" aria-selected="${chatsTab === 'dm'}" data-action="chat-tab" data-tab="dm">چاتەکان</button>
      <button class="segment-tab${chatsTab === 'groups' ? ' active' : ''}" role="tab" aria-selected="${chatsTab === 'groups'}" data-action="chat-tab" data-tab="groups">گرووپەکان</button>
    </div>
    <section aria-label="${chatsTab === 'dm' ? 'چاتە تایبەتییەکان' : 'گرووپەکان'}">
      ${filtered.length ? filtered.map((chat) => renderConversationRow(chat, chatsTab === 'dm' ? 'dm' : 'group')).join('') : '<div class="empty-state">هیچ گفتوگۆیەک نەدۆزرایەوە.</div>'}
    </section>`;
  }

  function getActiveChat() {
    return state.chats.find((chat) => chat.id === activeChatId) || state.groups.find((group) => group.id === activeChatId) || null;
  }

  function renderChatRoom() {
    const chat = getActiveChat();
    if (!chat) {
      activeChatId = null;
      return renderChatList();
    }
    const isGroup = chat.type === 'group';
    const contact = isGroup ? null : findUser(chat.contactId);
    const avatarSource = isGroup ? chat.avatar : (chat.avatar || (contact && contact.avatar));
    const subtitle = isGroup ? `${formatNumber(chat.memberCount || 0)} ئەندام · ${escapeHTML(chat.category || 'کۆمەڵگا')}` : (chat.online ? 'چالاکە لەسەر هێڵ' : 'نامەی تایبەتی');
    const messages = (chat.messages || []).map((message) => {
      const mine = message.senderId === state.currentUser.id;
      const sender = mine ? state.currentUser : findUser(message.senderId);
      const senderAvatar = message.avatar || sender.avatar;
      return `<div class="message-row ${mine ? 'mine' : 'them'}">
        ${mine ? '' : `<img class="avatar-xs" src="${escapeHTML(senderAvatar || makeAvatar(sender.name))}" alt="${escapeHTML(sender.name)}">`}
        <div class="message-bubble">
          ${isGroup && !mine ? `<strong style="display:block;margin-bottom:3px;font-size:10px;opacity:.75">${escapeHTML(message.senderName || sender.name)}</strong>` : ''}
          ${escapeHTML(message.text)}
          <time class="message-time" datetime="${escapeHTML(message.createdAt)}">${formatTime(message.createdAt)}</time>
        </div>
      </div>`;
    }).join('');
    return `<section class="chat-room" aria-label="گفتوگۆ">
      <header class="chat-room-header">
        <button class="icon-button" aria-label="گەڕانەوە بۆ نامەدان" data-action="close-chat">${renderIcon('arrow-right')}</button>
        <img class="avatar-sm" src="${escapeHTML(avatarSource || makeAvatar(chat.name))}" alt="${escapeHTML(chat.name)}">
        <div class="chat-room-title"><strong>${escapeHTML(chat.name)}</strong><span>${subtitle}</span></div>
      </header>
      <section class="message-stream" id="message-stream" aria-label="نامەکان">${messages}</section>
      <form class="chat-input-area" data-form="send-message" data-chat-id="${escapeHTML(chat.id)}">
        <div class="chat-input-shell">
          <textarea id="chat-smart-input" rows="1" placeholder="نامەیەک بنووسە..." aria-label="نامەیەک بنووسە"></textarea>
          <button id="chat-send-btn" type="submit" aria-label="ناردنی نامە">${renderIcon('arrow-up')}</button>
        </div>
      </form>
    </section>`;
  }

  function renderLibrary() {
    const categories = ['هەموو', 'دەقی خاو TXT', 'دیوانی شیعر', 'لێکۆڵینەوە', 'فەرهەنگ و زمان'];
    const featured = state.library.find((item) => item.id === 'book-nali') || state.library[0];
    const query = librarySearchText.trim().toLocaleLowerCase();
    const filtered = state.library.filter((item) => {
      const categoryMatches = libraryCategory === 'هەموو' || (libraryCategory === 'دەقی خاو TXT' ? item.format === 'TXT' : item.category === libraryCategory);
      const searchMatches = !query || `${item.title} ${item.author} ${item.content}`.toLocaleLowerCase().includes(query);
      return categoryMatches && searchMatches;
    });
    return `<header class="screen-header">
      <h1 class="header-title">کتێبخانە و ئەرشیف</h1>
      <button class="icon-button" aria-label="زیادکردنی دەق" data-action="open-library-add">${renderIcon('plus')}</button>
    </header>
    <div class="library-intro"><input id="library-search" class="pill-input" type="search" placeholder="گەڕان لە ناونیشان، نووسەر، یان دەقی خاو..." value="${escapeHTML(librarySearchText)}" autocomplete="off"></div>
    <div class="library-categories" aria-label="پۆلەکانی ئەرشیف">
      ${categories.map((category) => `<button class="category-pill${libraryCategory === category ? ' active' : ''}" data-action="library-category" data-category="${escapeHTML(category)}">${escapeHTML(category)}</button>`).join('')}
    </div>
    ${featured ? `<section class="featured-hero">
      <div class="featured-kicker">دەقی هەڵبژێردراو · ئەرشیفی ئەدەبی کوردی</div>
      <h2 class="featured-title">${escapeHTML(featured.title)}</h2>
      <p class="featured-desc">${escapeHTML(featured.author)} · خوێندنەوەی ڕوون و بێ ئاڵۆزیی دەق</p>
      <button class="primary-button" data-action="open-reader" data-item-id="${escapeHTML(featured.id)}">خوێندنەوەی دەق</button>
    </section>` : ''}
    <section class="editorial-list" aria-label="لیستی دەقە ئەرشیفکراوەکان">
      ${filtered.length ? filtered.map((item) => `<article class="editorial-row" itemscope itemtype="https://schema.org/CreativeWork">
        <span class="format-badge">${escapeHTML(item.format || 'TXT')}</span>
        <div class="editorial-meta"><span class="editorial-title" itemprop="name">${escapeHTML(item.title)}</span><span class="editorial-subtitle">${escapeHTML(item.author)} · ${escapeHTML(item.category)} · ${formatNumber(estimateKB(item.content))} کیلۆبایت</span></div>
        <div class="editorial-actions">
          <button class="icon-button" aria-label="خوێندنەوەی ${escapeHTML(item.title)}" data-action="open-reader" data-item-id="${escapeHTML(item.id)}">${renderIcon('book-open')}</button>
          <button class="icon-button" aria-label="داگرتنی ${escapeHTML(item.title)}" data-action="download-item" data-item-id="${escapeHTML(item.id)}">${renderIcon('download')}</button>
        </div>
      </article>`).join('') : '<div class="empty-state">هیچ دەقێک لەو پۆلەدا نەدۆزرایەوە.</div>'}
    </section>
    <section class="archive-semantic-corpus" aria-label="دەقی تەواوی ئەرشیف بۆ خوێندنەوە و لێکۆڵینەوە">
      ${state.library.map((item) => `<article itemscope itemtype="https://schema.org/CreativeWork"><h2 itemprop="name">${escapeHTML(item.title)}</h2><p>${escapeHTML(item.author)} · ${escapeHTML(item.category)}</p><div itemprop="text">${escapeHTML(item.content)}</div></article>`).join('')}
    </section>`;
  }

  function renderBottomNav() {
    if (currentView === 'chat-room' && activeChatId) {
      nav.style.display = 'none';
      return;
    }
    nav.style.display = 'flex';
    const unreadTotal = state.chats.reduce((sum, chat) => sum + (chat.unread || 0), 0) + state.groups.reduce((sum, group) => sum + (group.unread || 0), 0);
    nav.innerHTML = `
      <button class="nav-icon${currentView === 'timeline' ? ' active' : ''}" aria-label="سەرەکی" data-action="navigate" data-view="timeline">${renderIcon('home')}</button>
      <button class="nav-icon create-nav" aria-label="پۆستی نوێ" data-action="open-creator">${renderIcon('plus')}</button>
      <button class="nav-icon${currentView === 'chats' || currentView === 'chat-room' ? ' active' : ''}" aria-label="نامەدان" data-action="navigate" data-view="chats">${renderIcon('message-circle')}${unreadTotal ? '<span class="unread-dot"></span>' : ''}</button>
      <button class="nav-icon" aria-label="مێنیو" data-action="toggle-menu">
        <span class="nav-avatar-wrap">${avatarHTML(state.currentUser.id, 'nav-avatar')}<span class="nav-menu-mark">${renderIcon('menu')}</span></span>
      </button>`;
  }

  function renderActionPopover() {
    if (!menuOpen) return '';
    const dark = getTheme() === 'dark';
    return `<div class="action-popover" role="menu">
      <button class="menu-action" role="menuitem" data-action="navigate" data-view="profile">${renderIcon('user-round')}<span>پڕۆفایلەکەم</span></button>
      <button class="menu-action" role="menuitem" data-action="navigate" data-view="library">${renderIcon('library')}<span>کتێبخانە و ئەرشیف</span></button>
      <button class="theme-menu-row" role="menuitem" data-action="toggle-theme"><span>${dark ? 'دۆخی ڕووناک' : 'دۆخی تاریک'}</span><span class="theme-switch" aria-hidden="true"></span></button>
    </div>`;
  }

  function render() {
    if (currentView === 'timeline') main.innerHTML = renderTimeline();
    else if (currentView === 'profile') main.innerHTML = renderProfile();
    else if (currentView === 'chats') main.innerHTML = renderChatList();
    else if (currentView === 'chat-room') main.innerHTML = renderChatRoom();
    else if (currentView === 'library') main.innerHTML = renderLibrary();
    else main.innerHTML = renderTimeline();

    renderBottomNav();
    modalRoot.innerHTML = `${renderActionPopover()}${renderModal()}`;
    initializeIcons();

    if (currentView === 'chat-room' && activeChatId) {
      const stream = $('#message-stream');
      if (stream) stream.scrollTop = stream.scrollHeight;
    }
    if (timelineSearchOpen) {
      const search = $('#timeline-search');
      if (search && document.activeElement !== search) search.focus();
    }
  }

  function updateJsonLd() {
    const script = $('#meko-jsonld');
    if (!script) return;
    const postNodes = state.posts.map((post) => ({
      '@type': 'SocialMediaPosting',
      headline: `${getPostAuthorName(post)} · ${post.isPoetry ? 'شیعر' : 'پۆست'}`,
      articleBody: post.text,
      datePublished: post.createdAt,
      inLanguage: 'ku',
      author: { '@type': 'Person', name: getPostAuthorName(post) },
      interactionStatistic: { '@type': 'InteractionCounter', interactionType: 'https://schema.org/LikeAction', userInteractionCount: post.likeCount || 0 }
    }));
    const archiveNodes = state.library.map((item) => ({
      '@type': item.category === 'دیوانی شیعر' ? 'Book' : 'CreativeWork',
      name: item.title,
      author: { '@type': 'Person', name: item.author },
      inLanguage: 'ku',
      genre: item.category,
      text: item.content,
      ...(item.sourceURL ? { citation: item.sourceURL } : {})
    }));
    script.textContent = JSON.stringify({ '@context': 'https://schema.org', '@graph': [...postNodes, ...archiveNodes] });
  }

  function copyText(text, successMessage = 'کۆپی کرا.') {
    const fallbackCopy = () => {
      const helper = document.createElement('textarea');
      helper.value = text;
      helper.setAttribute('readonly', '');
      helper.style.position = 'fixed';
      helper.style.opacity = '0';
      document.body.appendChild(helper);
      helper.select();
      let copied = false;
      try { copied = document.execCommand('copy'); } catch (error) { copied = false; }
      helper.remove();
      showToast(copied ? successMessage : 'کۆپیکردن لەم وێبگەڕەدا بەردەست نییە.');
    };
    if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
      navigator.clipboard.writeText(text).then(() => showToast(successMessage)).catch(fallbackCopy);
    } else fallbackCopy();
  }

  function downloadTextFile(title, content, includeBOM = false) {
    const safeName = String(title || 'meko-text').replace(/[\\/:*?"<>|]/g, '-').trim() || 'meko-text';
    const data = includeBOM ? '\uFEFF' + content : content;
    const blob = new Blob([data], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `${safeName}.txt`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function renderCreatorModal() {
    return `<section class="fullscreen-modal" role="dialog" aria-modal="true" aria-label="پۆستی نوێ">
      <header class="creator-header">
        <button class="icon-button" aria-label="داخستن" data-action="close-modal">${renderIcon('x')}</button>
        <span class="creator-title">پۆستی نوێ</span>
        <button id="publish-post-btn" class="publish-button" data-action="publish-post" disabled>بڵاوکردنەوە</button>
      </header>
      <div class="creator-compose">
        ${avatarHTML(state.currentUser.id, 'avatar-sm')}
        <textarea id="creator-textarea" placeholder="چی لە دڵتدایە؟ لێرە بینووسە..." aria-label="ناوەڕۆکی پۆست"></textarea>
      </div>
      <footer class="creator-toolbar">
        <button class="poetry-toggle" id="poetry-mode-toggle" data-action="toggle-poetry">${renderIcon('feather')}<span>شێوازی شیعر</span></button>
        <span class="muted" style="font-size:11px">مەکۆ</span>
      </footer>
    </section>`;
  }

  function renderProfileEditModal() {
    const user = state.currentUser;
    const cities = user.locationCountry === 'کوردستان' ? KURDISTAN_CITIES : (OTHER_CITIES[user.locationCountry] || ['شارێکی تر']);
    return `<div class="dialog-backdrop" role="presentation">
      <section class="dialog-card" role="dialog" aria-modal="true" aria-labelledby="profile-edit-title">
        <header class="dialog-header"><h2 id="profile-edit-title">دەستکاریکردنی پڕۆفایل</h2><button class="icon-button" aria-label="داخستن" data-action="close-modal">${renderIcon('x')}</button></header>
        <form id="profile-edit-form" data-form="profile-edit">
          <div class="dialog-body">
            <button type="button" class="avatar-edit-trigger" data-action="trigger-avatar-upload">
              ${avatarHTML(user.id, 'avatar-md')}<span>گۆڕینی وێنەی پڕۆفایل</span>
            </button>
            <input class="hidden-file-input" id="avatar-upload-input" type="file" accept="image/*">
            <div class="form-field"><label class="field-label" for="profile-name">ناوی پیشاندان</label><input class="field-input" id="profile-name" name="displayName" value="${escapeHTML(user.displayName)}" required maxlength="60"></div>
            <div class="form-field"><label class="field-label" for="profile-handle">ناوی بەکارهێنەر</label><input class="field-input" id="profile-handle" name="handle" value="${escapeHTML(user.handle)}" required maxlength="30" dir="ltr"></div>
            <div class="form-field"><label class="field-label" for="profile-bio">دەربارەی من</label><textarea class="field-textarea" id="profile-bio" name="bio" rows="3" maxlength="500">${escapeHTML(user.bio)}</textarea></div>
            <div class="form-field"><label class="field-label" for="profile-country">وڵات</label><select class="field-select" id="profile-country" name="country">${COUNTRIES.map((country) => `<option value="${escapeHTML(country)}"${user.locationCountry === country ? ' selected' : ''}>${escapeHTML(country)}</option>`).join('')}</select></div>
            <div class="form-field"><label class="field-label" for="profile-city">شار</label><select class="field-select" id="profile-city" name="city">${cities.map((city) => `<option value="${escapeHTML(city)}"${user.city === city ? ' selected' : ''}>${escapeHTML(city)}</option>`).join('')}</select></div>
          </div>
          <footer class="dialog-footer"><button type="button" class="secondary-button" data-action="close-modal">پاشگەزبوونەوە</button><button type="submit" class="primary-button">پاشەکەوتکردن</button></footer>
        </form>
      </section>
    </div>`;
  }

  function renderChatComposerModal() {
    const groupMode = activeModal.mode === 'group';
    return `<div class="dialog-backdrop" role="presentation">
      <section class="dialog-card" role="dialog" aria-modal="true" aria-labelledby="chat-compose-title">
        <header class="dialog-header"><h2 id="chat-compose-title">نامەی نوێ</h2><button class="icon-button" aria-label="داخستن" data-action="close-modal">${renderIcon('x')}</button></header>
        <div class="dialog-body">
          <div class="modal-mode-tabs">
            <button class="modal-mode-tab${!groupMode ? ' active' : ''}" data-action="composer-mode" data-mode="dm">نامەی تایبەتی نوێ</button>
            <button class="modal-mode-tab${groupMode ? ' active' : ''}" data-action="composer-mode" data-mode="group">دروستکردنی گرووپی نوێ</button>
          </div>
          ${!groupMode ? `<form data-form="create-dm">
            <div class="form-field"><label class="field-label" for="dm-contact-name">ناوی کەسی بەرامبەر</label><input class="field-input" id="dm-contact-name" name="contactName" placeholder="ناوی تەواو" required maxlength="70"></div>
            <div class="form-field"><label class="field-label" for="dm-contact-handle">ناوی بەکارهێنەر (ئارەزوومەندانە)</label><input class="field-input" id="dm-contact-handle" name="contactHandle" placeholder="@username" dir="ltr" maxlength="40"></div>
            <p class="form-note">ئەم گفتوگۆیە لە دیمۆی ناوخۆیی مەکۆ دروست دەبێت؛ پەیوەندی بە هەژماری کەسانی ڕاستەقینەوە ناکات.</p>
            <div class="dialog-footer" style="padding:15px 0 0;margin-top:16px"><button class="primary-button" type="submit">دەستپێکردنی نامە</button></div>
          </form>` : `<form data-form="create-group">
            <div class="form-field"><label class="field-label" for="group-name">ناوی گرووپ</label><input class="field-input" id="group-name" name="groupName" placeholder="ناوی کۆڕ" required maxlength="80"></div>
            <div class="form-field"><label class="field-label" for="group-description">وەسفی گرووپ</label><textarea class="field-textarea" id="group-description" name="groupDescription" rows="3" placeholder="ئامانج و بابەتی کۆڕەکە..." maxlength="400"></textarea></div>
            <div class="form-field"><label class="field-label" for="group-category">پۆل / ناسنامەی گرووپ</label><select class="field-select" id="group-category" name="groupCategory"><option>زمانەوانی</option><option>شیعر و ئەدەب</option><option>لێکۆڵینەوە</option><option>خوێندنەوە</option></select></div>
            <p class="form-note">گرووپەکە لە داتای ناوخۆیی ئەم وێبگەیەدا دروست دەبێت. پشتگیریی ئەندامی زۆر لە ڕووی دیزاینەوە نیشان دەدرێت، بەڵام سێرڤەری هاوبەش و پەیامی نێوان ئامێرەکان نییە.</p>
            <div class="dialog-footer" style="padding:15px 0 0;margin-top:16px"><button class="primary-button" type="submit">دروستکردنی گرووپ</button></div>
          </form>`}
        </div>
      </section>
    </div>`;
  }

  function renderLibraryAddModal() {
    return `<div class="dialog-backdrop" role="presentation">
      <section class="dialog-card" role="dialog" aria-modal="true" aria-labelledby="library-add-title">
        <header class="dialog-header"><h2 id="library-add-title">زیادکردنی دەق بۆ ئەرشیف</h2><button class="icon-button" aria-label="داخستن" data-action="close-modal">${renderIcon('x')}</button></header>
        <form data-form="library-add">
          <div class="dialog-body">
            <div class="form-field"><label class="field-label" for="archive-title">ناونیشان</label><input class="field-input" id="archive-title" name="title" required maxlength="120"></div>
            <div class="form-field"><label class="field-label" for="archive-author">نووسەر</label><input class="field-input" id="archive-author" name="author" required maxlength="100"></div>
            <div class="form-field"><label class="field-label" for="archive-category">پۆلێن</label><select class="field-select" id="archive-category" name="category"><option>دەقی خاو TXT</option><option>دیوانی شیعر</option><option>لێکۆڵینەوە</option><option>فەرهەنگ و زمان</option></select></div>
            <div class="form-field"><label class="field-label" for="archive-content">دەقی تەواو</label><textarea class="field-textarea" id="archive-content" name="content" rows="8" placeholder="دەقی کوردی لێرە دابنێ..." required></textarea></div>
            <div class="form-field"><label class="field-label" for="archive-file">یان هەڵبژاردنی فایلی TXT</label><input class="field-input" id="archive-file" type="file" accept=".txt,text/plain" style="padding:8px"></div>
            <p class="form-note">ئەم وەشانە دەقی خاو (TXT) لەگەڵ زانیاریی ناونیشان و نووسەر پاشەکەوت دەکات. هاوکردنی فایلە PDFییەکان لەم پڕۆتۆتایپەدا جێبەجێ نەکراوە.</p>
          </div>
          <footer class="dialog-footer"><button type="button" class="secondary-button" data-action="close-modal">پاشگەزبوونەوە</button><button type="submit" class="primary-button">زیادکردنی دەق</button></footer>
        </form>
      </section>
    </div>`;
  }

  function renderReaderModal() {
    const item = state.library.find((entry) => entry.id === activeModal.itemId);
    if (!item) return '';
    const paragraphs = escapeHTML(item.content);
    return `<section class="reader-modal" role="dialog" aria-modal="true" aria-label="خوێندنەوەی ${escapeHTML(item.title)}">
      <header class="reader-toolbar">
        <button class="icon-button" aria-label="داخستن" data-action="close-modal">${renderIcon('x')}</button>
        <div class="reader-tools">
          <button class="icon-button" aria-label="گەورەکردنی فۆنت" data-action="reader-font" data-step="1">${renderIcon('plus')}</button>
          <button class="icon-button" aria-label="بچووککردنی فۆنت" data-action="reader-font" data-step="-1">${renderIcon('minus')}</button>
          <button class="icon-button" aria-label="کۆپیکردنی دەق" data-action="copy-item" data-item-id="${escapeHTML(item.id)}">${renderIcon('copy')}</button>
        </div>
        <button class="reader-download" data-action="download-reader-item" data-item-id="${escapeHTML(item.id)}">داگرتنی دەق</button>
      </header>
      <div class="reader-body-wrap"><article class="reader-article" itemscope itemtype="https://schema.org/CreativeWork">
        <h1 itemprop="name">${escapeHTML(item.title)}</h1>
        <div class="reader-byline">${escapeHTML(item.author)} · ${escapeHTML(item.category)}</div>
        <p class="reader-text" id="reader-text" itemprop="text" style="font-size:${readerFontSize}px">${paragraphs}</p>
        ${item.sourceNote ? `<p class="form-note" style="margin-top:30px;padding-top:15px;border-top:1px solid var(--border);font-family:'Vazirmatn',sans-serif">تێبینیی دەق: ${escapeHTML(item.sourceNote)}</p>` : ''}
        ${item.sourceURL ? `<p class="source-link-wrap"><a class="source-link" href="${escapeHTML(item.sourceURL)}" target="_blank" rel="noopener noreferrer">بینینی سەرچاوەی دەق</a></p>` : ''}
      </article></div>
    </section>`;
  }

  function renderModal() {
    if (!activeModal) return '';
    if (activeModal.type === 'creator') return renderCreatorModal();
    if (activeModal.type === 'profile-edit') return renderProfileEditModal();
    if (activeModal.type === 'chat-composer') return renderChatComposerModal();
    if (activeModal.type === 'library-add') return renderLibraryAddModal();
    if (activeModal.type === 'reader') return renderReaderModal();
    return '';
  }

  function openModal(type, data = {}) {
    activeModal = { type, ...data };
    menuOpen = false;
    render();
    if (type === 'creator') {
      const textarea = $('#creator-textarea');
      if (textarea) textarea.focus();
    }
  }

  function closeModal() {
    activeModal = null;
    pendingAvatarData = null;
    render();
  }

  function addPost() {
    const textarea = $('#creator-textarea');
    if (!textarea) return;
    const text = textarea.value.trim();
    if (!text) return;
    const poetry = $('#poetry-mode-toggle')?.classList.contains('active') || false;
    state.posts.unshift({
      id: makeId('post'), authorId: state.currentUser.id, createdAt: nowIso(), isPoetry: poetry,
      text, likeCount: 0, likedByMe: false, comments: []
    });
    persistState();
    activeModal = null;
    currentView = 'timeline';
    timelineSearchOpen = false;
    timelineSearchText = '';
    render();
    window.scrollTo({ top: 0, behavior: 'smooth' });
    showToast('پۆستەکەت بڵاوکرایەوە.');
  }

  function toggleLike(postId) {
    const post = state.posts.find((entry) => entry.id === postId);
    if (!post) return;
    post.likedByMe = !post.likedByMe;
    post.likeCount = Math.max(0, (post.likeCount || 0) + (post.likedByMe ? 1 : -1));
    persistState();
    render();
  }

  function toggleBookmark(postId) {
    if (state.bookmarks.includes(postId)) state.bookmarks = state.bookmarks.filter((id) => id !== postId);
    else state.bookmarks.push(postId);
    persistState();
    openPostMenuId = null;
    render();
    showToast(state.bookmarks.includes(postId) ? 'پۆستەکە پاشەکەوت کرا.' : 'پۆستەکە لە پاشەکەوت لابرا.');
  }

  function deletePost(postId) {
    const post = state.posts.find((entry) => entry.id === postId);
    if (!post || post.authorId !== state.currentUser.id) return;
    state.posts = state.posts.filter((entry) => entry.id !== postId);
    state.bookmarks = state.bookmarks.filter((id) => id !== postId);
    openComments.delete(postId);
    openPostMenuId = null;
    persistState();
    render();
    showToast('پۆستەکە سڕایەوە.');
  }

  function addComment(form) {
    const postId = form.dataset.postId;
    const input = form.elements.commentText;
    const text = input.value.trim();
    if (!text) return;
    const post = state.posts.find((entry) => entry.id === postId);
    if (!post) return;
    post.comments = Array.isArray(post.comments) ? post.comments : [];
    post.comments.push({ id: makeId('comment'), authorId: state.currentUser.id, text, createdAt: nowIso() });
    openComments.add(postId);
    persistState();
    render();
  }

  function sharePost(postId) {
    const post = state.posts.find((entry) => entry.id === postId);
    if (!post) return;
    const link = `${window.location.href.split('#')[0]}#post-${encodeURIComponent(post.id)}`;
    copyText(`${post.text}\n\n${link}`, 'دەق و بەستەر کۆپی کران.');
  }

  function shareProfile() {
    const link = `${window.location.href.split('#')[0]}#profile-${encodeURIComponent(state.currentUser.handle)}`;
    copyText(link, 'بەستەری پڕۆفایل کۆپی کرا.');
  }

  function navigate(view) {
    menuOpen = false;
    activeChatId = null;
    currentView = view;
    if (view === 'chats') chatsTab = 'dm';
    if (window.location && window.location.hash && window.history && window.history.replaceState) {
      window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}`);
    }
    render();
    window.scrollTo({ top: 0, behavior: 'auto' });
  }

  function applyHashRoute() {
    const rawHash = window.location && window.location.hash ? decodeURIComponent(window.location.hash.slice(1)) : '';
    if (rawHash.startsWith('profile-') && rawHash.slice(8) === state.currentUser.handle) {
      currentView = 'profile';
      render();
      return;
    }
    if (rawHash.startsWith('post-')) {
      const postId = rawHash.slice(5);
      if (state.posts.some((post) => post.id === postId)) {
        currentView = 'timeline';
        render();
        window.setTimeout(() => document.getElementById(postId)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 0);
      }
    }
  }

  function openChat(chatId, type) {
    activeChatId = chatId;
    currentView = 'chat-room';
    const chat = type === 'group' ? state.groups.find((entry) => entry.id === chatId) : state.chats.find((entry) => entry.id === chatId);
    if (chat) chat.unread = 0;
    persistState();
    render();
    const input = $('#chat-smart-input');
    if (input) input.focus();
  }

  function sendChatMessage(form) {
    const chat = state.chats.find((entry) => entry.id === form.dataset.chatId) || state.groups.find((entry) => entry.id === form.dataset.chatId);
    const textarea = $('#chat-smart-input');
    if (!chat || !textarea) return;
    const text = textarea.value.trim();
    if (!text) return;
    chat.messages = Array.isArray(chat.messages) ? chat.messages : [];
    chat.messages.push({ id: makeId('message'), senderId: state.currentUser.id, senderName: state.currentUser.displayName, text, createdAt: nowIso() });
    persistState();
    render();
    const stream = $('#message-stream');
    if (stream) stream.scrollTop = stream.scrollHeight;
    const nextInput = $('#chat-smart-input');
    if (nextInput) { nextInput.style.height = 'auto'; nextInput.focus(); }
  }

  function createDirectChat(form) {
    const name = form.elements.contactName.value.trim();
    const handle = (form.elements.contactHandle.value || '').trim().replace(/^@/, '');
    if (!name) return;
    const existing = state.chats.find((chat) => chat.name.toLocaleLowerCase() === name.toLocaleLowerCase() || (handle && String(chat.handle || '').toLocaleLowerCase() === handle.toLocaleLowerCase()));
    if (existing) {
      activeModal = null;
      openChat(existing.id, 'dm');
      return;
    }
    const user = { id: makeId('contact'), name, handle, avatar: makeAvatar(name), online: false };
    state.users.push(user);
    const chat = { id: makeId('dm'), type: 'dm', contactId: user.id, name, handle, avatar: user.avatar, online: false, unread: 0, messages: [] };
    state.chats.unshift(chat);
    persistState();
    activeModal = null;
    openChat(chat.id, 'dm');
    showToast('گفتوگۆی ناوخۆیی دروست کرا.');
  }

  function createGroup(form) {
    const name = form.elements.groupName.value.trim();
    if (!name) return;
    const group = {
      id: makeId('group'), type: 'group', name,
      description: form.elements.groupDescription.value.trim(),
      category: form.elements.groupCategory.value,
      memberCount: 1,
      avatar: makeAvatar(name), unread: 0,
      messages: [{ id: makeId('message'), senderId: state.currentUser.id, senderName: state.currentUser.displayName, text: `بەخێربێن بۆ ${name}. کۆڕەکە ئێستا دەستی پێکرد.`, createdAt: nowIso() }]
    };
    state.groups.unshift(group);
    chatsTab = 'groups';
    persistState();
    activeModal = null;
    openChat(group.id, 'group');
    showToast('گرووپەکە لە دیمۆی ناوخۆیی دروست کرا.');
  }

  function saveProfile(form) {
    const data = new FormData(form);
    const country = String(data.get('country') || 'کوردستان');
    const city = String(data.get('city') || '');
    state.currentUser.displayName = String(data.get('displayName') || '').trim() || state.currentUser.displayName;
    state.currentUser.handle = String(data.get('handle') || '').trim().replace(/^@/, '') || state.currentUser.handle;
    state.currentUser.bio = String(data.get('bio') || '').trim();
    state.currentUser.locationCountry = country;
    state.currentUser.city = city;
    state.currentUser.locationText = city ? `${country}، ${city}` : country;
    if (pendingAvatarData) state.currentUser.avatar = pendingAvatarData;
    persistState();
    activeModal = null;
    pendingAvatarData = null;
    render();
    showToast('پڕۆفایلەکەت نوێ کرایەوە.');
  }

  function updateCityOptions(country) {
    const select = $('#profile-city');
    if (!select) return;
    const options = country === 'کوردستان' ? KURDISTAN_CITIES : (OTHER_CITIES[country] || ['شارێکی تر']);
    select.innerHTML = options.map((city) => `<option value="${escapeHTML(city)}">${escapeHTML(city)}</option>`).join('');
  }

  function processAvatarFile(file) {
    if (!file || !file.type.startsWith('image/')) {
      showToast('تکایە فایلێکی وێنە هەڵبژێرە.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const image = new Image();
      image.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 250;
        canvas.height = 250;
        const context = canvas.getContext('2d');
        if (!context) {
          showToast('نەتوانرا وێنەکە ئامادە بکرێت.');
          return;
        }
        const side = Math.min(image.naturalWidth, image.naturalHeight);
        const sx = (image.naturalWidth - side) / 2;
        const sy = (image.naturalHeight - side) / 2;
        context.drawImage(image, sx, sy, side, side, 0, 0, 250, 250);
        try {
          pendingAvatarData = canvas.toDataURL('image/jpeg', 0.85);
          const preview = $('.avatar-edit-trigger img');
          if (preview) preview.src = pendingAvatarData;
          showToast('وێنەکە ئامادەیە؛ بۆ هەمیشەیی پاشەکەوتکردن دوگمەی پاشەکەوتکردن دابگرە.');
        } catch (error) {
          showToast('ئەم وێنەیە نەتوانرا پاشەکەوت بکرێت.');
        }
      };
      image.onerror = () => showToast('خوێندنەوەی وێنەکە سەرکەوتوو نەبوو.');
      image.src = String(reader.result);
    };
    reader.onerror = () => showToast('خوێندنەوەی فایلەکە سەرکەوتوو نەبوو.');
    reader.readAsDataURL(file);
  }

  function addLibraryItem(form) {
    const title = form.elements.title.value.trim();
    const author = form.elements.author.value.trim();
    const category = form.elements.category.value;
    const content = form.elements.content.value.trim();
    if (!title || !author || !content) return;
    const item = { id: makeId('text'), title, author, category, format: 'TXT', content, sourceNote: 'دەقی زیادکراو لەلایەن بەکارهێنەرەوە لەم وەشانە ناوخۆییەدا.' };
    state.library.unshift(item);
    persistState();
    libraryCategory = 'هەموو';
    librarySearchText = '';
    activeModal = null;
    render();
    showToast('دەقەکە بە سەرکەوتوویی زیاد کرا.');
  }

  function openReader(itemId) {
    const item = state.library.find((entry) => entry.id === itemId);
    if (!item) return;
    readerFontSize = 20;
    openModal('reader', { itemId });
  }

  function handleAction(actionElement) {
    const action = actionElement.dataset.action;
    const postId = actionElement.dataset.postId;
    const itemId = actionElement.dataset.itemId;
    if (action === 'navigate') navigate(actionElement.dataset.view);
    else if (action === 'toggle-menu') { menuOpen = !menuOpen; render(); }
    else if (action === 'toggle-theme') { updateTheme(getTheme() === 'dark' ? 'light' : 'dark'); menuOpen = true; render(); }
    else if (action === 'open-creator') openModal('creator');
    else if (action === 'close-modal') closeModal();
    else if (action === 'toggle-timeline-search') { timelineSearchOpen = !timelineSearchOpen; if (!timelineSearchOpen) timelineSearchText = ''; render(); }
    else if (action === 'post-menu') { openPostMenuId = openPostMenuId === postId ? null : postId; render(); }
    else if (action === 'bookmark-post') toggleBookmark(postId);
    else if (action === 'delete-post') deletePost(postId);
    else if (action === 'like-post') toggleLike(postId);
    else if (action === 'toggle-comments') { if (openComments.has(postId)) openComments.delete(postId); else openComments.add(postId); render(); }
    else if (action === 'share-post') sharePost(postId);
    else if (action === 'publish-post') addPost();
    else if (action === 'toggle-poetry') {
      const button = $('#poetry-mode-toggle');
      const textarea = $('#creator-textarea');
      if (!button || !textarea) return;
      const active = button.classList.toggle('active');
      textarea.classList.toggle('poetry-mode', active);
    }
    else if (action === 'open-profile-edit') openModal('profile-edit');
    else if (action === 'share-profile') shareProfile();
    else if (action === 'profile-tab') { profileTab = actionElement.dataset.tab; render(); }
    else if (action === 'chat-tab') { chatsTab = actionElement.dataset.tab; render(); }
    else if (action === 'open-chat-composer') openModal('chat-composer', { mode: 'dm' });
    else if (action === 'composer-mode') { activeModal = { type: 'chat-composer', mode: actionElement.dataset.mode }; render(); }
    else if (action === 'open-chat') openChat(actionElement.dataset.chatId, actionElement.dataset.chatType);
    else if (action === 'close-chat') { activeChatId = null; currentView = 'chats'; render(); }
    else if (action === 'open-library-add') openModal('library-add');
    else if (action === 'library-category') { libraryCategory = actionElement.dataset.category; render(); }
    else if (action === 'open-reader') openReader(itemId);
    else if (action === 'download-item') {
      const item = state.library.find((entry) => entry.id === itemId);
      if (item) downloadTextFile(item.title, item.content, false);
    }
    else if (action === 'download-reader-item') {
      const item = state.library.find((entry) => entry.id === itemId);
      if (item) downloadTextFile(item.title, item.content, true);
    }
    else if (action === 'copy-item') {
      const item = state.library.find((entry) => entry.id === itemId);
      if (item) copyText(item.content, 'دەقی تەواو کۆپی کرا.');
    }
    else if (action === 'reader-font') {
      readerFontSize = Math.max(15, Math.min(26, readerFontSize + Number(actionElement.dataset.step || 0)));
      const readerText = $('#reader-text');
      if (readerText) readerText.style.fontSize = `${readerFontSize}px`;
    }
    else if (action === 'trigger-avatar-upload') $('#avatar-upload-input')?.click();
  }

  document.addEventListener('click', (event) => {
    const actionElement = event.target.closest('[data-action]');
    let shouldRenderAfterOutsideClick = false;
    if (menuOpen && !event.target.closest('.action-popover') && (!actionElement || actionElement.dataset.action !== 'toggle-menu')) {
      menuOpen = false;
      shouldRenderAfterOutsideClick = true;
    }
    if (openPostMenuId && !event.target.closest('.post-more-wrap')) {
      openPostMenuId = null;
      shouldRenderAfterOutsideClick = true;
    }
    if (actionElement) {
      event.preventDefault();
      handleAction(actionElement);
      return;
    }
    if (shouldRenderAfterOutsideClick) render();
  });

  document.addEventListener('submit', (event) => {
    const form = event.target;
    if (!(form instanceof HTMLFormElement)) return;
    const type = form.dataset.form;
    if (!type) return;
    event.preventDefault();
    if (type === 'comment') addComment(form);
    else if (type === 'send-message') sendChatMessage(form);
    else if (type === 'profile-edit') saveProfile(form);
    else if (type === 'create-dm') createDirectChat(form);
    else if (type === 'create-group') createGroup(form);
    else if (type === 'library-add') addLibraryItem(form);
  });

  document.addEventListener('input', (event) => {
    const target = event.target;
    if (target.id === 'creator-textarea') {
      const publish = $('#publish-post-btn');
      if (publish) publish.disabled = target.value.trim().length === 0;
    } else if (target.id === 'chat-smart-input') {
      target.style.height = 'auto';
      const maxHeight = 96;
      if (target.scrollHeight <= maxHeight) {
        target.style.height = `${target.scrollHeight}px`;
        target.style.overflowY = 'hidden';
      } else {
        target.style.height = `${maxHeight}px`;
        target.style.overflowY = 'auto';
      }
      const send = $('#chat-send-btn');
      if (send) send.classList.toggle('visible', target.value.trim().length > 0);
    } else if (target.id === 'timeline-search') {
      timelineSearchText = target.value;
      const query = timelineSearchText.trim().toLocaleLowerCase();
      $$('.post-item', main).forEach((post) => { post.hidden = query ? !post.dataset.search.includes(query) : false; });
      const hasVisible = $$('.post-item', main).some((post) => !post.hidden);
      const empty = $('.feed-list .empty-state', main);
      if (empty && hasVisible) empty.remove();
      else if (!hasVisible && !empty) { const message = document.createElement('div'); message.className = 'empty-state'; message.textContent = 'هیچ پۆستێک لەم گەڕانەدا نەدۆزرایەوە.'; $('.feed-list', main)?.appendChild(message); }
    } else if (target.id === 'chat-search') {
      chatSearchText = target.value;
      const query = chatSearchText.trim().toLocaleLowerCase();
      $$('.conversation-row', main).forEach((row) => { row.hidden = query && !row.textContent.toLocaleLowerCase().includes(query); });
    } else if (target.id === 'library-search') {
      librarySearchText = target.value;
      const query = librarySearchText.trim().toLocaleLowerCase();
      $$('.editorial-row', main).forEach((row) => { row.hidden = query && !row.textContent.toLocaleLowerCase().includes(query); });
    }
  });

  document.addEventListener('change', (event) => {
    const target = event.target;
    if (target.id === 'profile-country') updateCityOptions(target.value);
    else if (target.id === 'avatar-upload-input') {
      const file = target.files && target.files[0];
      processAvatarFile(file);
      target.value = '';
    } else if (target.id === 'archive-file') {
      const file = target.files && target.files[0];
      const textarea = $('#archive-content');
      if (file && textarea) {
        const reader = new FileReader();
        reader.onload = () => { textarea.value = String(reader.result || '').replace(/^\uFEFF/, ''); };
        reader.onerror = () => showToast('فایلە دەقییەکە نەخوێندرایەوە.');
        reader.readAsText(file, 'UTF-8');
      }
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      if (activeModal) closeModal();
      else if (menuOpen) { menuOpen = false; render(); }
      else if (currentView === 'chat-room') { activeChatId = null; currentView = 'chats'; render(); }
    }
    if ((event.key === 'Enter') && event.target.matches('.conversation-row')) {
      event.preventDefault();
      openChat(event.target.dataset.chatId, event.target.dataset.chatType);
    }
  });

  window.addEventListener('hashchange', applyHashRoute);

  function init() {
    updateTheme(getTheme());
    updateJsonLd();
    render();
    applyHashRoute();
  }

  init();
})();
