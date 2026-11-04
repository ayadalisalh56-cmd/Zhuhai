/**
 * MEKO (مەکۆ) — CORE APPLICATION ENGINE
 * Open Digital Infrastructure for the Kurdish Language
 */
(function () {
  'use strict';

  const STORAGE_KEY = 'meko_state_v2';
  const THEME_KEY = 'meko_theme';

  // Exact unified, alphabetical Greater Kurdistan city list (ZERO political/regional partitions)
  const KURDISTAN_CITIES = [
    'ئاکرێ', 'ئامەد', 'ئامێدی', 'ئورفا', 'ئیلام', 'باتمان', 'بانە', 'بێدلیس', 'بۆکان', 'پاوە',
    'پێنجوێن', 'پیرانشار', 'تەقتەق', 'تکریت', 'جۆلەمێرگ', 'جوانڕۆ', 'چەمچەماڵ', 'چۆمان', 'حەسەکە',
    'خانەقین', 'خۆی', 'خورماتوو', 'دێرسیم', 'دهۆک', 'دیواندەرە', 'ڕانیە', 'ڕەواندز', 'زاخۆ',
    'زەڕایەن', 'سەردەشت', 'سەرپێڵی زەهاو', 'سەرێکانی', 'سەقز', 'سلێمانی', 'سنە', 'سۆران', 'سێرت',
    'شنگال', 'شنۆ', 'شرنەخ', 'شەقڵاوە', 'عەفرین', 'قارس', 'قامیشلۆ', 'قەڵادزێ', 'قوچان', 'کرماشان',
    'کەرکووک', 'کەلار', 'کۆبانێ', 'کۆیە', 'کفری', 'ماردین', 'ماکۆ', 'مەریوان', 'مەهاباد',
    'مەلاطیە', 'مووش', 'نەغەدە', 'هەڵەبجە', 'هەولێر', 'وان'
  ];

  const OTHER_CITIES = {
    'ئەڵمانیا': ['بەرلین', 'میونشن', 'کۆڵن', 'فرانکفۆرت', 'هامبۆرگ'],
    'سوید': ['ستۆکهۆڵم', 'ئۆپسالا', 'یۆتۆبۆری', 'ماڵمۆ'],
    'بەریتانیا': ['لەندەن', 'مانچستەر', 'بێرمینگهام', 'گلاسگۆ'],
    'فەڕەنسا': ['پاریس', 'لیۆن', 'مارسیلیا'],
    'ئەمریکا': ['واشنتن', 'ناشڤیل', 'لۆس ئەنجلس', 'نیویۆرک'],
    'کەنەدا': ['تۆرۆنتۆ', 'ئۆتاوا', 'ڤانکوڤەر']
  };

  // ====================================================================
  // KURDISH NUMERALS & FORMATTING HELPERS
  // ====================================================================
  const KURDISH_DIGITS = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];

  function toKurdishNumber(num) {
    if (num === null || num === undefined) return '٠';
    return String(num).replace(/\d/g, (d) => KURDISH_DIGITS[Number(d)]);
  }

  function formatIndexBadge(idx) {
    const padded = String(idx).padStart(2, '0');
    return toKurdishNumber(padded);
  }

  function countWords(text) {
    if (!text) return 0;
    return text.trim().split(/\s+/).filter(Boolean).length;
  }

  function getByteSizeKB(text) {
    const bytes = new Blob(['\uFEFF' + (text || '')], { type: 'text/plain;charset=utf-8' }).size;
    return Math.max(1, Math.round(bytes / 1024));
  }

  // ====================================================================
  // KURDISH ARAMAIC-TO-LATIN (HAWAR) TRANSLITERATION ENGINE
  // ====================================================================
  function transliterateKurdishToLatin(text) {
    if (!text || typeof text !== 'string') return '';

    const vowelsAramaic = 'ائەێۆوی';
    let s = text;

    // 1. Convert Kurdish/Arabic digits to standard Latin digits
    s = s.replace(/[٠-٩]/g, (d) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d)));
    s = s.replace(/[۰-۹]/g, (d) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d)));

    // 2. Multi-character sequences & word-initial rules
    s = s.replace(/وو/g, 'û');
    s = s.replace(/وێ/g, 'wê');
    s = s.replace(/وا/g, 'wa');
    s = s.replace(/وان/g, 'wan');

    // Word-initial Hamza (ئ) before vowels -> clean vowel onset
    s = s.replace(/(^|[\s«"(\[،؛.؟!])ئا/g, '$1a');
    s = s.replace(/(^|[\s«"(\[،؛.؟!])ئە/g, '$1e');
    s = s.replace(/(^|[\s«"(\[،؛.؟!])ئێ/g, '$1ê');
    s = s.replace(/(^|[\s«"(\[،؛.؟!])ئۆ/g, '$1o');
    s = s.replace(/(^|[\s«"(\[،؛.؟!])ئو/g, '$1u');
    s = s.replace(/(^|[\s«"(\[،؛.؟!])ئی/g, '$1î');
    s = s.replace(/(^|[\s«"(\[،؛.؟!])ئ/g, '$1');

    // Medial Hamza
    s = s.replace(/ئ/g, "'");

    // 3. Contextual و (\u0648) and ی (\u06CC)
    const chars = Array.from(s);
    const out = [];

    const singleMap = {
      'ا': 'a',
      'ە': 'e',
      'ێ': 'ê',
      'ۆ': 'o',
      'ب': 'b',
      'پ': 'p',
      'ت': 't',
      'ج': 'c',
      'چ': 'ç',
      'ح': 'h',
      'خ': 'x',
      'د': 'd',
      'ر': 'r',
      'ڕ': 'r',
      'ز': 'z',
      'ژ': 'j',
      'س': 's',
      'ش': 'ş',
      'ع': "'",
      'غ': 'x',
      'ف': 'f',
      'ڤ': 'v',
      'ق': 'q',
      'ک': 'k',
      'ك': 'k',
      'گ': 'g',
      'ل': 'l',
      'ڵ': 'l',
      'م': 'm',
      'ن': 'n',
      'ه': 'h',
      'ھ': 'h',
      '؟': '?',
      '،': ',',
      '؛': ';',
      '«': '“',
      '»': '”'
    };

    for (let i = 0; i < chars.length; i++) {
      const ch = chars[i];
      const prev = i > 0 ? chars[i - 1] : ' ';
      const next = i < chars.length - 1 ? chars[i + 1] : ' ';

      if (ch === 'و') {
        const prevIsVowel = vowelsAramaic.includes(prev);
        const nextIsVowel = vowelsAramaic.includes(next);
        const isWordStart = /[\s،؛.؟!«"(\[]/.test(prev);
        if (isWordStart || prevIsVowel || nextIsVowel) {
          out.push('w');
        } else {
          out.push('u');
        }
      } else if (ch === 'ی' || ch === 'ي') {
        const prevIsVowel = vowelsAramaic.includes(prev);
        const nextIsVowel = vowelsAramaic.includes(next);
        const isWordStart = /[\s،؛.؟!«"(\[]/.test(prev);
        if (isWordStart || prevIsVowel || nextIsVowel) {
          out.push('y');
        } else {
          out.push('î');
        }
      } else if (singleMap[ch] !== undefined) {
        out.push(singleMap[ch]);
      } else {
        out.push(ch);
      }
    }

    let result = out.join('');

    // Capitalize first letter of sentences and poetic lines
    result = result.replace(/(^|[\n.!?]\s*)([a-zçêîşû])/g, (_, prefix, letter) => {
      return prefix + letter.toUpperCase();
    });

    return result;
  }

  // ====================================================================
  // SVG AVATAR GENERATOR (CLEAN DATA URIs FOR RELIABLE OFFLINE/CDN USE)
  // ====================================================================
  function createSvgAvatar(initials, bgHex, fgHex = '#ffffff') {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
      <rect width="200" height="200" rx="100" fill="${bgHex}"/>
      <text x="50%" y="54%" dominant-baseline="middle" text-anchor="middle" fill="${fgHex}" font-family="Vazirmatn, sans-serif" font-weight="700" font-size="76">${initials}</text>
    </svg>`;
    return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
  }

  // ====================================================================
  // RICH KURDISH SEED DATA (MANDATORY IN app.js)
  // ====================================================================
  function getInitialSeedState() {
    const waliAvatar = createSvgAvatar('و', '#18181b');
    const naliAvatar = createSvgAvatar('ن', '#1e3a8a');
    const asoAvatar = createSvgAvatar('ئـ', '#065f46');
    const shilanAvatar = createSvgAvatar('ش', '#7c2d12');
    const diyakoAvatar = createSvgAvatar('د', '#4c1d95');
    const rojnaAvatar = createSvgAvatar('ڕ', '#831843');

    return {
      activeTab: 'feed',
      notifFilter: 'هەموو',
      profileTab: 'all',
      chatSubTab: 'dm',
      activeChatId: null,
      libraryCategory: 'هەموو',
      librarySearch: '',
      readingFontScale: 1,
      savedPostIds: ['post-2', 'post-4'],

      currentUser: {
        name: 'والی',
        handle: 'wali_kurd',
        country: 'کوردستان',
        city: 'کەرکووک',
        bio: 'تەلارسازیی وشە و خەیاڵ؛ هەوڵێک بۆ پاراستن و بوژاندنەوەی زمانی ڕەسەنی کوردی لە جیهانی دیجیتاڵیدا.',
        avatar: waliAvatar,
        followers: 1280,
        following: 142
      },

      posts: [
        {
          id: 'post-1',
          authorName: 'والی',
          authorHandle: 'wali_kurd',
          authorAvatar: waliAvatar,
          timestamp: '٢ کاتژمێر لەمەوبەر',
          isoDate: '2025-05-10T14:30:00Z',
          isPoetry: true,
          text: `شەوی یەڵدایە یا دەیجوورە ئەمشەو
کە دیدەم دوور لە تۆ بێنوورە ئەمشەو؟
دڵم وەک حاکمی مەعزوولە قوربان!
خەڵاتی وەسڵی تۆی مەنزوورە ئەمشەو`,
          latinMode: false,
          likes: 214,
          liked: false,
          shares: 39,
          commentsOpen: false,
          comments: [
            {
              id: 'c-101',
              authorName: 'شیلان هەورامی',
              authorAvatar: shilanAvatar,
              text: 'نالی مەزن هەمیشە لە لووتکەی ڕەوانبێژی و وێنەی شیعریدایە.',
              timestamp: '١ کاتژمێر لەمەوبەر'
            },
            {
              id: 'c-102',
              authorName: 'دیاکۆ زەند',
              authorAvatar: diyakoAvatar,
              text: 'هاوسەنگیی نێوان شەوی یەڵدا و بێنووریی دیدە شاکارێکی نەمرە.',
              timestamp: '٤٥ خولەک لەمەوبەر'
            }
          ]
        },
        {
          id: 'post-2',
          authorName: 'د. ئاسۆ شارەزووری',
          authorHandle: 'aso_linguist',
          authorAvatar: asoAvatar,
          timestamp: '٥ کاتژمێر لەمەوبەر',
          isoDate: '2025-05-10T11:00:00Z',
          isPoetry: false,
          text: `بوونی کۆرپەسێکی کراوە و پاکژ بە ڕێنووسی ستانداردی کوردی، بنەمای سەرەکییە بۆ پەرەپێدانی مۆدێلەکانی ژیریی دەستکرد و وەرگێڕانی ئامێری. هەر دەقێکی ڕەسەن کە بە شێوەیەکی زانستی لەسەر تۆڕی جیهانی بڵاو دەکرێتەوە، خشتێکی نوێیە لە تەلاری مانەوەی زمانەکەماندا.`,
          latinMode: false,
          likes: 186,
          liked: true,
          shares: 54,
          commentsOpen: false,
          comments: [
            {
              id: 'c-103',
              authorName: 'والی',
              authorAvatar: waliAvatar,
              text: 'دەستخۆش دکتۆر گیان، ئامانجی سەرەکیی مەکۆ ڕێک دابینکردنی ئەم ژێرخانە کراوەیەیە.',
              timestamp: '٤ کاتژمێر لەمەوبەر'
            }
          ]
        },
        {
          id: 'post-3',
          authorName: 'شیلان هەورامی',
          authorHandle: 'shilan_adab',
          authorAvatar: shilanAvatar,
          timestamp: 'دوێنێ',
          isoDate: '2025-05-09T19:20:00Z',
          isPoetry: true,
          text: `بە نووری بادە کەشفی زوڵمەتی تەقوا نەکەم، چبکەم!
بە شەمعی مەی چرای عومری خۆم ئەحیا نەکەم، چبکەم!
لە خەڵوەتگەی فەنادا حەزرەتی مەحوی دەفەرمووێ:
لە ناو بازاڕی عیشقدا خۆم ڕیسوا نەکەم، چبکەم!`,
          latinMode: false,
          likes: 342,
          liked: false,
          shares: 71,
          commentsOpen: false,
          comments: []
        },
        {
          id: 'post-4',
          authorName: 'والی',
          authorHandle: 'wali_kurd',
          authorAvatar: waliAvatar,
          timestamp: '٢ ڕۆژ لەمەوبەر',
          isoDate: '2025-05-08T16:10:00Z',
          isPoetry: false,
          text: `زمان تەنها ئامرازی پەیوەندیکردنی ڕۆژانە نییە؛ زمان ماڵی بوون و یادەوەرییەکی هاوبەشی نەتەوەیە. کاتێک وشەیەکی ڕەسەنی کوردی لە فەرهەنگی ئاخاوتن و نووسیندا زیندوو دەکەینەوە، لە ڕاستیدا پەنجەرەیەکی نوێ بەسەر جیهانبینیی باوباپیرانماندا دەکەینەوە.`,
          latinMode: false,
          likes: 279,
          liked: true,
          shares: 63,
          commentsOpen: false,
          comments: [
            {
              id: 'c-104',
              authorName: 'ڕۆژنا سۆران',
              authorAvatar: rojnaAvatar,
              text: 'ڕستەی «زمان ماڵی بوونە» چەندە قووڵ و پڕمانایە لەم سەردەمەدا.',
              timestamp: '١ ڕۆژ لەمەوبەر'
            }
          ]
        },
        {
          id: 'post-5',
          authorName: 'دیاکۆ زەند',
          authorHandle: 'diyako_zand',
          authorAvatar: diyakoAvatar,
          timestamp: '٣ ڕۆژ لەمەوبەر',
          isoDate: '2025-05-07T09:45:00Z',
          isPoetry: true,
          text: `لە خەو هەستن درەنگە میللەتی کورد
خەوێکی قورس و گران ئێوەی برد
بەسە بێباکی و سستی لە ڕێی عیلم
کە عالەم گەییە لووتکەی چەرخی گەردوون`,
          latinMode: false,
          likes: 410,
          liked: false,
          shares: 95,
          commentsOpen: false,
          comments: []
        }
      ],

      // Strictly-Typed Notifications (LIKE, COMMENT, FOLLOW)
      notifications: [
        {
          id: 'notif-1',
          type: 'COMMENT',
          actorName: 'شیلان هەورامی',
          actorHandle: 'shilan_adab',
          actorAvatar: shilanAvatar,
          postId: 'post-1',
          postExcerpt: 'شەوی یەڵدایە یا دەیجوورە ئەمشەو کە دیدەم دوور لە تۆ بێنوورە ئەمشەو؟',
          commentText: 'نالی مەزن هەمیشە لە لووتکەی ڕەوانبێژی و وێنەی شیعریدایە.',
          isFollowingBack: false,
          timestamp: '١٥ خولەک لەمەوبەر',
          read: false
        },
        {
          id: 'notif-2',
          type: 'LIKE',
          actorName: 'د. ئاسۆ شارەزووری',
          actorHandle: 'aso_linguist',
          actorAvatar: asoAvatar,
          postId: 'post-4',
          postExcerpt: 'زمان تەنها ئامرازی پەیوەندیکردنی ڕۆژانە نییە؛ زمان ماڵی بوون و یادەوەرییەکی هاوبەشی نەتەوەیە.',
          commentText: null,
          isFollowingBack: false,
          timestamp: '١ کاتژمێر لەمەوبەر',
          read: false
        },
        {
          id: 'notif-3',
          type: 'FOLLOW',
          actorName: 'دیاکۆ زەند',
          actorHandle: 'diyako_zand',
          actorAvatar: diyakoAvatar,
          postId: null,
          postExcerpt: null,
          commentText: null,
          isFollowingBack: false,
          timestamp: '٢ کاتژمێر لەمەوبەر',
          read: false
        },
        {
          id: 'notif-4',
          type: 'COMMENT',
          actorName: 'ڕۆژنا سۆران',
          actorHandle: 'rojna_soran',
          actorAvatar: rojnaAvatar,
          postId: 'post-4',
          postExcerpt: 'زمان تەنها ئامرازی پەیوەندیکردنی ڕۆژانە نییە؛ زمان ماڵی بوون و یادەوەرییەکی هاوبەشی نەتەوەیە.',
          commentText: 'ڕستەی «زمان ماڵی بوونە» چەندە قووڵ و پڕمانایە لەم سەردەمەدا.',
          isFollowingBack: false,
          timestamp: '٥ کاتژمێر لەمەوبەر',
          read: true
        },
        {
          id: 'notif-5',
          type: 'LIKE',
          actorName: 'شیلان هەورامی',
          actorHandle: 'shilan_adab',
          actorAvatar: shilanAvatar,
          postId: 'post-1',
          postExcerpt: 'شەوی یەڵدایە یا دەیجوورە ئەمشەو کە دیدەم دوور لە تۆ بێنوورە ئەمشەو؟',
          commentText: null,
          isFollowingBack: false,
          timestamp: 'دوێنێ',
          read: true
        },
        {
          id: 'notif-6',
          type: 'FOLLOW',
          actorName: 'ڕۆژنا سۆران',
          actorHandle: 'rojna_soran',
          actorAvatar: rojnaAvatar,
          postId: null,
          postExcerpt: null,
          commentText: null,
          isFollowingBack: true,
          timestamp: '٢ ڕۆژ لەمەوبەر',
          read: true
        }
      ],

      // 3 Private DMs and 2 Large Groups in Chat
      chats: [
        {
          id: 'chat-dm-1',
          type: 'dm',
          name: 'د. ئاسۆ شارەزووری',
          avatar: asoAvatar,
          status: 'چالاکە',
          timestamp: '١٠:٤٢',
          messages: [
            {
              id: 'm-1',
              sender: 'theirs',
              text: 'سڵاو کاک والی، فایلە دەقییەکانی دیوانی نالی و مەحویم بە تەواوی پێداچوونەوە کردووە.',
              time: '١٠:٣٨'
            },
            {
              id: 'm-2',
              sender: 'yours',
              text: 'زۆر سپاس دکتۆر گیان، دەستەکانت خۆش بێت. لە بەشی کتێبخانەی کراوەدا جێگیریان دەکەین.',
              time: '١٠:٤٠'
            },
            {
              id: 'm-3',
              sender: 'theirs',
              text: 'زۆر باشە، فەرهەنگی ڕیشەناسییەکەش ئامادەیە بۆ داگرتنی ڕاستەوخۆ.',
              time: '١٠:٤٢'
            }
          ]
        },
        {
          id: 'chat-dm-2',
          type: 'dm',
          name: 'شیلان هەورامی',
          avatar: shilanAvatar,
          status: 'چالاکە',
          timestamp: 'دوێنێ',
          messages: [
            {
              id: 'm-4',
              sender: 'theirs',
              text: 'ئەمڕۆ تایبەتمەندیی گۆڕینی ڕێنووسی ئارامی بۆ لاتینیم تاقی کردەوە، زۆر ورد و خێرایە!',
              time: '١٩:١٥'
            },
            {
              id: 'm-5',
              sender: 'yours',
              text: 'خۆشحاڵم کە بەدڵت بوو، هەوڵمان داوە یاساکانی ئەلفوبێی هاوار بە وردی جێبەجێ بکەین.',
              time: '١٩:٢٢'
            }
          ]
        },
        {
          id: 'chat-dm-3',
          type: 'dm',
          name: 'دیاکۆ زەند',
          avatar: diyakoAvatar,
          status: 'چالاکە',
          timestamp: '٣ ڕۆژ',
          messages: [
            {
              id: 'm-6',
              sender: 'theirs',
              text: 'کاک والی، ئایا دەتوانین دەقی دەستنووسە کۆنەکانی موکریانیش زیاد بکەین؟',
              time: '١٤:٠٠'
            }
          ]
        },
        {
          id: 'chat-grp-1',
          type: 'group',
          name: 'ئەنجومەنی کۆرپەس و زمانەوانیی کوردی',
          avatar: naliAvatar,
          status: '١,٨٥٠ ئەندام',
          timestamp: '١٢:١٥',
          messages: [
            {
              id: 'm-7',
              sender: 'theirs',
              text: 'پێویستمان بە کۆکردنەوەی دەقی خاوی زاراوەکانی هەورامی و کەڵهوڕییە بۆ مۆدێلی زمانەوانیی نوێ.',
              time: '١٢:١٠'
            },
            {
              id: 'm-8',
              sender: 'yours',
              text: 'لە بەشی کتێبخانەی مەکۆ بەشێکی تایبەتمان بۆ لێکۆڵینەوەی زاراوەناسی کردووەتەوە.',
              time: '١٢:١٥'
            }
          ]
        },
        {
          id: 'chat-grp-2',
          type: 'group',
          name: 'دیوەخانی ئەدەب و شیعری کلاسیک',
          avatar: rojnaAvatar,
          status: '٣,٤٢٠ ئەندام',
          timestamp: 'دوێنێ',
          messages: [
            {
              id: 'm-9',
              sender: 'theirs',
              text: 'ئەمشەو شیکردنەوەیەکی تایبەتمان دەبێت لەسەر غەزەلە عیرفانییەکانی حەزرەتی مەحوی.',
              time: '٢١:٠٠'
            }
          ]
        }
      ],

      // 6 Complete, Multi-Paragraph Editorial Library Works
      libraryWorks: [
        {
          id: 'lib-1',
          featured: true,
          title: 'دیوانی نالی (دەقی کامل و پێداچووکراو)',
          author: 'مەلا خدری ئەحمەدی شاوەیسی میکایەڵی (نالی)',
          era: 'سەدەی نۆزدەیەم · قوتابخانەی بابان',
          category: 'دیوانی شیعر',
          isPoetry: true,
          excerpt: 'شەوی یەڵدایە یا دەیجوورە ئەمشەو / کە دیدەم دوور لە تۆ بێنوورە ئەمشەو؟',
          content: `شەوی یەڵدایە یا دەیجوورە ئەمشەو
کە دیدەم دوور لە تۆ بێنوورە ئەمشەو؟
دڵم وەک حاکمی مەعزوولە قوربان!
خەڵاتی وەسڵی تۆی مەنزوورە ئەمشەو
دڵیش مایل بە دیدەی تۆیە، بۆیە
لە من وەحشی و ڕەمیدە و دوورە ئەمشەو
کە تۆی شای کەچکولاهی دیدەمەستان
چ باکم قەیسەر و فەغفوورە ئەمشەو!
لە خەو هەڵساوە یا ئاڵۆزە چاوت؟
هەمیشە وایە یا مەخموورە ئەمشەو؟
سوروشکم نەقشی چاوی تۆ دەکێشێ
جێگەم سەر دارە یا مەنسوورە ئەمشەو؟
موسوڵمانان دەپرسن حاڵی «نالی»
لە کونجی بێکەسی مەهجوورە ئەمشەو

***

قوربانی تۆزی ڕێگەتم ئەی بادی خۆش مروور!
ئەی پەیکی شارەزا بە هەموو شاری شارەزوور!
ئەی لوتفەکەت خەفی و هەوا خواهـ و هەمدەمە!
وەی سروەکەت بەشارەتی سەر گۆشەیی حوزوور!
تۆ میهرەبانی گشت کەسی، دڵسۆزی گشت کەسی
بۆ من لە دەوری شەمعی ڕوخت بوویتە نووری توور
ئەحواڵی من بە خزمەتی یاران بڵێ بەزار
تا تێبگەن کە چۆنە لە غوربەت دڵی سەبوور`
        },
        {
          id: 'lib-2',
          featured: false,
          title: 'دیوانی حەزرەتی مەحوی — غەزەلە عیرفانییەکان',
          author: 'مەلا مەحموودی باڵخیی (مەحوی)',
          era: 'سەدەی نۆزدەیەم · سلێمانی',
          category: 'دیوانی شیعر',
          isPoetry: true,
          excerpt: 'بە نووری بادە کەشفی زوڵمەتی تەقوا نەکەم، چبکەم! / بە شەمعی مەی چرای عومری خۆم ئەحیا نەکەم، چبکەم!',
          content: `بە نووری بادە کەشفی زوڵمەتی تەقوا نەکەم، چبکەم!
بە شەمعی مەی چرای عومری خۆم ئەحیا نەکەم، چبکەم!
لە خەڵوەتگەی فەنادا حەزرەتی مەحوی دەفەرمووێ:
لە ناو بازاڕی عیشقدا خۆم ڕیسوا نەکەم، چبکەم!

شوکر تۆ لە فکرم ناچی، ئەگەرچی من لە فکرت چووم
لە دڵ دەرناچی تۆ، گەرچی لە دڵ دەرچووم و بێکەس بووم
بە یادی ڕووتە چاوم پڕ لە خوێناوی جگەر دایم
لە تاو هیجرانی باڵاتە کە وا سەرگەشتە و مەجنوونم

کە دڵ بوو بە کەبابی ئاگری عیشقت، مەپرسە چۆن
لە ناو ئەم ئاگرە سۆزەندەدا بێدەنگ و حەیرانم
ئەسیر و بەندەیی زوڵفت لە هەردوو عالەما «مەحوی»
ئەگەر ڕۆژێ تەماشای نووری دیدارت نەکەم، دەمرم`
        },
        {
          id: 'lib-3',
          featured: false,
          title: 'دیوانی حاجی قادری کۆیی — بانگەوازی ڕۆشنگەری و زمان',
          author: 'حاجی قادری کۆیی',
          era: 'سەدەی نۆزدەیەم · کۆیە و ئەستەمبوڵ',
          category: 'دیوانی شیعر',
          isPoetry: true,
          excerpt: 'کتێب و دەفتەر و تەئریخ و کاغەز / بە کوردی گەر بنووسرایە زوبانمان...',
          content: `کتێب و دەفتەر و تەئریخ و کاغەز
بە کوردی گەر بنووسرایە زوبانمان
مەلا و شێخ و میر و پادشامان
هەتا مەحشەر دەما ناو و نیشانمان

لە خەو هەستن درەنگە میللەتی کورد
خەوێکی قورس و گران ئێوەی برد
بەسە بێباکی و سستی لە ڕێی عیلم
کە عالەم گەییە لووتکەی چەرخی گەردوون

زوبانی کوردی ئەگەرچی لە لای هەندێ کەس بێقەدرە
بەڵام لە دیدی حەقیقەتدا شیرین و پڕ لە گەوهەرە
ئەوەی بە زمانی خۆی نەنووسێ و نەخوێنێتەوە
لە کاروانی شارستانیەتدا بێبەش و سەرگەردان دەمێنێتەوە`
        },
        {
          id: 'lib-4',
          featured: false,
          title: 'فەرهەنگی ڕیشەناسیی وشەی ڕەسەنی کوردی',
          author: 'ئەنستیتۆی زمانەوانی و کەلەپووری کوردی',
          era: 'چاپی ستانداردی دیجیتاڵی · ٢٠٢٥',
          category: 'فەرهەنگ و زمان',
          isPoetry: false,
          excerpt: 'توێژینەوەیەکی بەراوردکاری لەسەر ڕەگ و ڕیشەی وشە هیندۆئەورووپییەکان لە زمانی کوردی و گۆڕانکارییە دەنگسازییەکان.',
          content: `بەشی یەکەم: بنەماکانی ڕیشەناسی (Etymology) لە زمانی کوردیدا

زمانی کوردی وەک یەکێک لە زمانە دێرینەکانی لقی باکووری ڕۆژئاوای زمانە ئێرانییەکان لە خێزانی گەورەی هیندۆئەورووپی، خاوەنی گەنجینەیەکی بێهاوتای وشەی ڕەسەنە. لەم توێژینەوە و فەرهەنگە کراوەیەدا، ڕیشەی سەدان وشەی بنەڕەتی لە ئاڤێستا و میدیی کۆنەوە تا دەگاتە دیالێکتە هاوچەرخەکانی کوردی خراوەتە ڕوو.

١. ئاگر (Agir / Awir):
لە ڕەگی ئاڤێستایی «آتەر» (Atar) و هیندۆئەورووپیی کۆنەوە هاتووە. لە شێوەزاری سۆرانیدا بووەتە «ئاگر»، لە هەورامیدا «ئاویر» و لە کورمانجیی ژووروودا «ئاگر». گۆڕانی دەنگی (t) بۆ (g) یان (w) یەکێکە لە یاسا دەنگسازییە ناسراوەکانی زمانی کوردی.

٢. خۆر / هۆر / ڕۆژ (Xor / Roj):
وشەی «خۆر» هاوڕیشەی «هوەر»ی ئاڤێستاییە کە لە شێوەزارەکانی باشوور و هەورامیدا بە شێوەی «هۆر» و «وەروە» ماوەتەوە. هەروەها وشەی «ڕۆژ» لە ڕەگی «ڕەئوچە» بە واتای ڕووناکی و درەوشانەوە سەرچاوەی گرتووە.

٣. ئاو (Aw / Av):
لە وشەی کۆنی «ئاپ» (Ap) وەرگیراوە. گۆڕانی دەنگی لێویی (p) بۆ (w) و (v) لە تایبەتمەندییە سەرەکییەکانی قۆناغی گەشەکردنی زمانی کوردییە.`
        },
        {
          id: 'lib-5',
          featured: false,
          title: 'لێکۆڵینەوەی زاراوەناسیی هەورامی و کەڵهوڕی لە زمانی ستاندارددا',
          author: 'د. ئاسۆ شارەزووری و هاوکاران',
          era: 'زنجیرە لێکۆڵینەوەی ئەکادیمی · ٢٠٢٤',
          category: 'لێکۆڵینەوە',
          isPoetry: false,
          excerpt: 'شیکردنەوەی پێکهاتەی ڕێزمانی، مۆرفۆلۆژی و دەوڵەمەندیی وشەسازیی هەورامی و کەڵهوڕی و ڕۆڵیان لە پەرەپێدانی کۆرپەسی کوردی.',
          content: `پێشەکیی لێکۆڵینەوە:
فرەچەشنیی شێوەزارەکانی زمانی کوردی سەرچاوەیەکی بێسنوورە بۆ دەوڵەمەندکردنی زمانی نووسین و زانستی. هەردوو شێوەزاری دێرینی هەورامی (گۆرانی) و کەڵهوڕی (کوردیی باشووری) پارێزەری ژمارەیەکی زۆر لە تایبەتمەندییە مۆرفۆلۆژی و فۆنۆلۆژییە کۆنەکانی کوردین.

تایبەتمەندییە ڕێزمانییەکانی هەورامی:
لە شێوەزاری هەورامیدا، پاراستنی ڕەگەزی ڕێزمانی (نێر و مێ) لە ناو و ئاوەڵناو و فرماندا بە شێوەیەکی سیستماتیک ماوەتەوە. ئەم تایبەتمەندییە یارمەتیی زمانەوانان دەدات بۆ تێگەیشتن لە مێژووی پەرەسەندنی دۆخی ئێرگاتیڤ (Ergativity) لە زمانە کوردییەکاندا.

وشەسازیی زیندوو لە کەڵهوڕیدا:
شێوەزاری کەڵهوڕی لە کرماشان، ئیلام و خانەقین خاوەنی سەدان چاوگ و فرمانی لێکدراوی ڕەسەنە کە دەتوانرێت لە زاراوەسازیی زانستی و فەلسەفیی هاوچەرخدا سوودیان لێ وەربگیرێت بۆ پڕکردنەوەی بۆشاییە واتاییەکان.`
        },
        {
          id: 'lib-6',
          featured: false,
          title: 'فەلسەفەی جوانیناسی و میتافۆر لە ئەدەبی کوردیدا',
          author: 'پرۆفیسۆر کامەران بەرزنجی',
          era: 'کتێبخانەی ڕەخنەی ئەدەبی · ٢٠٢٥',
          category: 'دەقی خاو TXT',
          isPoetry: false,
          excerpt: 'خوێندنەوەیەکی فەلسەفی بۆ چەمکی جوانی، سروشت و وجود لە شیعری کلاسیک و نوێی کوردیدا لە نالییەوە تا گۆران.',
          content: `دەروازەیەک بۆ جوانیناسیی کوردی:
جوانیناسی لە ئەدەبیاتی کوردیدا تەنها بریتی نییە لە ڕازاندنەوەی ڕواڵەتیی وشە و سەروا، بەڵکو شێوازێکە لە تێڕامانی وجودی و پەیوەندیی مرۆڤی کورد بە سروشت و گەردوونەوە. لە قوتابخانەی شیعری باباندا، میتافۆر و خوازە دەبنە پردێک لە نێوان جیهانی هەستپێکراو و جیهانی مانا باڵاکاندا.

نوێگەریی عەبدوڵڵا گۆران و گەڕانەوە بۆ سروشت:
لە سەدەی بیستەمدا، گۆران شۆڕشێکی بنەڕەتیی لە ستاتیکای شیعری کوردیدا بەرپا کرد. بە گەڕانەوە بۆ کێشی پەنجەیی خۆماڵی و بەکارهێنانی وێنەی زیندووی سروشتی کوردستان، شیعری لە چوارچێوەی داخراوی عەرووزەوە گواستەوە بۆ فەزایەکی کراوەی مۆسیقایی و ڕۆمانسی.

ئەم دەقە خاوە وەک بەشێک لە پڕۆژەی مەکۆ بە شێوەی سەرچاوەی کراوە ئامادە کراوە تا توێژەران و خوێندکارانی زانکۆ و سیستەمەکانی شیکردنەوەی دەق بتوانن ڕاستەوخۆ سوودی لێ وەربگرن.`
        }
      ]
    };
  }

  // ====================================================================
  // STATE MANAGEMENT & INITIALIZATION
  // ====================================================================
  let state = loadState();
  let creatorIsPoetry = false;
  let activeReaderBookId = null;
  let activeReaderSurface = 'white';
  let activeReaderFontSize = 21;
  let activeReaderLatinMode = false;

  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && parsed.currentUser && Array.isArray(parsed.posts) && Array.isArray(parsed.notifications)) {
          return parsed;
        }
      }
    } catch (_) {
      // Fallback to seed state
    }
    const seed = getInitialSeedState();
    saveState(seed);
    return seed;
  }

  function saveState(customState) {
    const target = customState || state;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(target));
    } catch (_) {
      // Storage quota safeguard
    }
    updateDynamicJsonLd(target);
  }

  // ====================================================================
  // DYNAMIC JSON-LD SCHEMA INJECTION (SEO & NLP INFRASTRUCTURE)
  // ====================================================================
  function updateDynamicJsonLd(currentState) {
    const scriptEl = document.getElementById('meko-jsonld');
    if (!scriptEl || !currentState) return;

    const postings = (currentState.posts || []).map((post) => ({
      '@type': post.isPoetry ? 'CreativeWork' : 'SocialMediaPosting',
      '@id': `https://meko.kurd/posts/${post.id}`,
      inLanguage: 'ku',
      author: {
        '@type': 'Person',
        name: post.authorName,
        alternateName: `@${post.authorHandle}`
      },
      datePublished: post.isoDate || new Date().toISOString(),
      text: post.text,
      genre: post.isPoetry ? 'Poetry' : 'Prose',
      interactionStatistic: [
        {
          '@type': 'InteractionCounter',
          interactionType: 'https://schema.org/LikeAction',
          userInteractionCount: post.likes
        },
        {
          '@type': 'InteractionCounter',
          interactionType: 'https://schema.org/CommentAction',
          userInteractionCount: (post.comments || []).length
        }
      ]
    }));

    const books = (currentState.libraryWorks || []).map((work) => ({
      '@type': 'Book',
      '@id': `https://meko.kurd/library/${work.id}`,
      inLanguage: 'ku',
      name: work.title,
      author: {
        '@type': 'Person',
        name: work.author
      },
      genre: work.category,
      abstract: work.excerpt,
      text: work.content,
      wordCount: countWords(work.content)
    }));

    const schemaGraph = {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'WebSite',
          name: 'مەکۆ (Meko)',
          inLanguage: 'ku',
          description: 'ژێرخانی کراوەی دیجیتاڵی زمانی کوردی'
        },
        ...postings,
        ...books
      ]
    };

    scriptEl.textContent = JSON.stringify(schemaGraph, null, 2);
  }

  // ====================================================================
  // STRICTLY-TYPED NOTIFICATION FACTORY (`LIKE`, `COMMENT`, `FOLLOW`)
  // ====================================================================
  function createNotification(type, payload) {
    const validTypes = ['LIKE', 'COMMENT', 'FOLLOW'];
    if (!validTypes.includes(type)) {
      throw new Error(`Invalid notification type: ${type}`);
    }

    const base = {
      id: 'notif-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6),
      type: type,
      actorName: payload.actorName || 'بەکارهێنەری مەکۆ',
      actorHandle: payload.actorHandle || 'kurd_user',
      actorAvatar: payload.actorAvatar || createSvgAvatar('م', '#0f766e'),
      postId: null,
      postExcerpt: null,
      commentText: null,
      isFollowingBack: false,
      timestamp: 'ئێستا',
      read: false
    };

    if (type === 'LIKE') {
      base.postId = payload.postId || 'post-1';
      base.postExcerpt = payload.postExcerpt || '';
      base.commentText = null;
    } else if (type === 'COMMENT') {
      base.postId = payload.postId || 'post-1';
      base.postExcerpt = payload.postExcerpt || '';
      base.commentText = payload.commentText || '';
    } else if (type === 'FOLLOW') {
      base.postId = null;
      base.postExcerpt = null;
      base.commentText = null;
      base.isFollowingBack = Boolean(payload.isFollowingBack);
    }

    state.notifications.unshift(base);
    saveState();
    syncGlobalChrome();
    return base;
  }

  // ====================================================================
  // THEME ENGINE (LIGHT / DARK + FONT SCALING)
  // ====================================================================
  function initTheme() {
    const savedTheme = localStorage.getItem(THEME_KEY) || 'light';
    applyTheme(savedTheme);
    applyFontScale(state.readingFontScale || 1);
  }

  function applyTheme(mode) {
    const html = document.documentElement;
    if (mode === 'dark') {
      html.classList.add('dark');
      html.classList.remove('light');
    } else {
      html.classList.add('light');
      html.classList.remove('dark');
    }
    localStorage.setItem(THEME_KEY, mode);
    updateDrawerThemeUI();
  }

  function toggleTheme() {
    const isDark = document.documentElement.classList.contains('dark');
    applyTheme(isDark ? 'light' : 'dark');
  }

  function applyFontScale(scale) {
    state.readingFontScale = scale;
    document.documentElement.style.setProperty('--reading-font-scale', String(scale));
    saveState();
  }

  function updateDrawerThemeUI() {
    const isDark = document.documentElement.classList.contains('dark');
    const label = document.getElementById('drawer-theme-label');
    if (label) {
      label.textContent = isDark ? 'دۆخی تاریک (چالاکە)' : 'دۆخی تاریک';
    }
  }

  // ====================================================================
  // GLOBAL CHROME SYNC (5 AVATAR PLACES, BADGES, DRAWER SUMMARY)
  // ====================================================================
  function syncGlobalChrome() {
    const u = state.currentUser;

    // 1. Bottom bar avatar
    const bottomAvatar = document.getElementById('bottom-bar-avatar');
    if (bottomAvatar) bottomAvatar.src = u.avatar;

    // 2. Left Drawer summary card
    const drawerAvatar = document.getElementById('drawer-avatar');
    if (drawerAvatar) drawerAvatar.src = u.avatar;

    const drawerName = document.getElementById('drawer-display-name');
    if (drawerName) drawerName.textContent = u.name;

    const drawerHandle = document.getElementById('drawer-handle');
    if (drawerHandle) drawerHandle.textContent = '@' + u.handle;

    const drawerLoc = document.getElementById('drawer-location-text');
    if (drawerLoc) drawerLoc.textContent = `${u.country}، ${u.city}`;

    const drawerFollowing = document.getElementById('drawer-following-count');
    if (drawerFollowing) drawerFollowing.textContent = toKurdishNumber(u.following);

    const drawerFollowers = document.getElementById('drawer-followers-count');
    if (drawerFollowers) drawerFollowers.textContent = toKurdishNumber(u.followers);

    const drawerSavedCount = document.getElementById('drawer-saved-count');
    if (drawerSavedCount) drawerSavedCount.textContent = toKurdishNumber(state.savedPostIds.length);

    // 3. Creator Canvas avatar
    const creatorAvatar = document.getElementById('creator-avatar');
    if (creatorAvatar) creatorAvatar.src = u.avatar;

    // 4. Unread notifications badge on bottom bar
    const unreadCount = state.notifications.filter((n) => !n.read).length;
    const badgeEl = document.getElementById('nav-notif-badge');
    if (badgeEl) {
      if (unreadCount > 0) {
        badgeEl.textContent = toKurdishNumber(unreadCount);
        badgeEl.classList.remove('hidden');
      } else {
        badgeEl.classList.add('hidden');
      }
    }

    // 5. Bottom nav active icon highlight
    document.querySelectorAll('.nav-icon-btn').forEach((btn) => {
      const target = btn.getAttribute('data-nav');
      if (target === state.activeTab) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  }

  function showToast(message) {
    const container = document.getElementById('toast-container');
    if (!container) return;
    const pill = document.createElement('div');
    pill.className = 'toast-pill';
    pill.textContent = message;
    container.appendChild(pill);
    setTimeout(() => {
      pill.remove();
    }, 2400);
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  // ====================================================================
  // POST CARD RENDERER (SHARED ACROSS FEED, PROFILE, AND SAVED VIEWS)
  // ====================================================================
  function renderPostHTML(post) {
    const isSaved = state.savedPostIds.includes(post.id);
    const displayBody = post.latinMode ? transliterateKurdishToLatin(post.text) : post.text;
    const bodyClasses = post.isPoetry
      ? `fb-post-body fb-post-poetry ${post.latinMode ? 'latin-mode' : ''}`
      : `fb-post-body fb-post-prose ${post.latinMode ? 'latin-mode' : ''}`;
    const bodyDir = post.latinMode && !post.isPoetry ? 'dir="ltr"' : '';
    const converterLabel = post.latinMode ? 'ئارامی' : 'لاتینی';

    const commentsHtml = post.commentsOpen
      ? `<section class="inline-comments-box" aria-label="لێدوانەکان">
          <div class="space-y-2.5 mb-3">
            ${
              post.comments.length === 0
                ? `<p class="text-xs muted-text py-1">هێشتا هیچ لێدوانێک نەنووسراوە. یەکەم کەس بە!</p>`
                : post.comments
                    .map(
                      (c) => `
                  <div class="flex items-start gap-2.5">
                    <img src="${c.authorAvatar}" alt="${escapeHtml(c.authorName)}" class="avatar-xs mt-0.5" />
                    <div class="flex-1 bg-white dark:bg-zinc-900 px-3 py-2 rounded-2xl border hairline-border">
                      <div class="flex items-center justify-between gap-2">
                        <span class="text-xs font-bold">${escapeHtml(c.authorName)}</span>
                        <time class="text-[10.5px] muted-text">${escapeHtml(c.timestamp)}</time>
                      </div>
                      <p class="text-xs mt-1 leading-relaxed">${escapeHtml(c.text)}</p>
                    </div>
                  </div>`
                    )
                    .join('')
            }
          </div>
          <form class="comment-submit-form flex items-center gap-2" data-post-id="${post.id}">
            <img src="${state.currentUser.avatar}" alt="${escapeHtml(state.currentUser.name)}" class="avatar-xs" />
            <input
              type="text"
              name="commentText"
              class="flex-1 text-xs px-3.5 py-2 rounded-full bg-white dark:bg-zinc-900 border hairline-border outline-none"
              placeholder="لێدوانێک بنووسە..."
              required
            />
            <button type="submit" class="px-3.5 py-1.5 rounded-full text-xs font-bold bg-zinc-900 text-white dark:bg-white dark:text-zinc-900">
              ناردن
            </button>
          </form>
        </section>`
      : '';

    return `
      <article id="post-dom-${post.id}" class="fb-post-article" itemscope itemtype="https://schema.org/SocialMediaPosting">
        <meta itemprop="inLanguage" content="ku" />
        <!-- Post Header (Strictly NO city/location on timeline headers) -->
        <header class="fb-post-header">
          <div class="flex items-center gap-2.5">
            <img src="${post.authorAvatar}" alt="${escapeHtml(post.authorName)}" class="avatar-sm" />
            <div>
              <h3 class="text-[15px] font-bold leading-snug" itemprop="author">${escapeHtml(post.authorName)}</h3>
              <time datetime="${post.isoDate || ''}" class="text-xs muted-text block mt-0.5">${escapeHtml(post.timestamp)}</time>
            </div>
          </div>
          <button type="button" class="post-more-btn p-1.5 rounded-full muted-text hover:bg-black/5 dark:hover:bg-white/5" data-post-id="${post.id}" aria-label="هەڵبژاردەی زیاتر">
            <i data-lucide="more-horizontal" class="w-5 h-5"></i>
          </button>
        </header>

        <!-- Post Body -->
        <div class="${bodyClasses}" ${bodyDir} itemprop="articleBody">${escapeHtml(displayBody)}</div>

        <!-- Seamless Icon-Only Interaction Bar (NO Top Border, NO Text Labels) -->
        <footer class="fb-interaction-bar">
          <!-- Right Side Group: Like, Comment, Share (ICONS + NUMERIC COUNTS ONLY) -->
          <div class="fb-actions-right">
            <button type="button" class="post-icon-action like-post-btn ${post.liked ? 'liked' : ''}" data-post-id="${post.id}" aria-label="پەسەندکردن">
              <i data-lucide="heart"></i>
              <span>${toKurdishNumber(post.likes)}</span>
            </button>

            <button type="button" class="post-icon-action comment-toggle-btn" data-post-id="${post.id}" aria-label="لێدوانەکان">
              <i data-lucide="message-circle"></i>
              <span>${toKurdishNumber(post.comments.length)}</span>
            </button>

            <button type="button" class="post-icon-action share-post-btn" data-post-id="${post.id}" aria-label="هاوبەشیکردن">
              <i data-lucide="share-2"></i>
              <span>${toKurdishNumber(post.shares || 0)}</span>
            </button>
          </div>

          <!-- Left Side Group: Script Converter & Bookmark -->
          <div class="fb-actions-left">
            <button type="button" class="script-converter-btn ${post.latinMode ? 'active' : ''}" data-post-id="${post.id}" title="گۆڕینی ڕێنووس">
              <i data-lucide="languages"></i>
              <span>${converterLabel}</span>
            </button>

            <button type="button" class="post-icon-action bookmark-post-btn ${isSaved ? 'bookmarked' : ''}" data-post-id="${post.id}" aria-label="پاشەکەوتکردن">
              <i data-lucide="bookmark"></i>
            </button>
          </div>
        </footer>

        ${commentsHtml}
      </article>
      <div class="fb-post-divider" role="separator"></div>
    `;
  }

  // ====================================================================
  // VIEW 1: FACEBOOK-STYLE TIMELINE FEED
  // ====================================================================
  function renderFeedView() {
    const postsHtml = state.posts.map((p) => renderPostHTML(p)).join('');

    return `
      <header class="top-sticky-header">
        <div class="flex items-center gap-2.5">
          <h1 class="font-serif text-2xl font-bold tracking-tight">مەکۆ</h1>
          <span class="text-[11px] px-2.5 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 muted-text font-medium">تۆڕی ئەدەبی و زمانەوانی</span>
        </div>
        <div class="flex items-center gap-2">
          <button type="button" id="header-open-library-btn" class="script-converter-btn" title="کتێبخانە و ئەرشیف">
            <i data-lucide="book-open"></i>
            <span>کتێبخانە</span>
          </button>
        </div>
      </header>

      <!-- Quick Compose Prompt Row -->
      <section class="px-4 py-3 flex items-center gap-3 bg-white dark:bg-zinc-950" aria-label="نووسینی پۆستی نوێ">
        <img src="${state.currentUser.avatar}" alt="${escapeHtml(state.currentUser.name)}" class="avatar-sm cursor-pointer" id="feed-avatar-profile-trigger" />
        <button type="button" id="feed-quick-compose-btn" class="flex-1 text-right px-4 py-2.5 rounded-full text-sm muted-text bg-slate-100 dark:bg-zinc-900 border hairline-border">
          چی لە دڵتدایە، ${escapeHtml(state.currentUser.name)}؟ شیعر یان بیرۆکەیەک بنووسە...
        </button>
      </section>
      <div class="fb-post-divider" role="separator"></div>

      <section aria-label="زنجیرەی بڵاوکراوەکان">
        ${postsHtml}
      </section>
    `;
  }

  // ====================================================================
  // VIEW 2: STRICTLY-TYPED NOTIFICATIONS VIEW (`LIKE`, `COMMENT`, `FOLLOW`)
  // ====================================================================
  function renderNotificationsView() {
    const filters = ['هەموو', 'پەسەندکردن', 'لێدوانەکان', 'شوێنکەوتن'];
    const filtered = state.notifications.filter((n) => {
      if (state.notifFilter === 'پەسەندکردن') return n.type === 'LIKE';
      if (state.notifFilter === 'لێدوانەکان') return n.type === 'COMMENT';
      if (state.notifFilter === 'شوێنکەوتن') return n.type === 'FOLLOW';
      return true;
    });

    const rowsHtml =
      filtered.length === 0
        ? `<div class="py-16 text-center muted-text text-sm">هیچ ئاگادارییەک لەم بەشەدا نییە.</div>`
        : filtered
            .map((notif) => {
              // STRICT switch (notif.type) Renderer — NEVER mix templates
              switch (notif.type) {
                case 'LIKE':
                  return `
                    <article class="notif-row ${notif.read ? '' : 'unread'}" data-notif-id="${notif.id}" data-target-post="${notif.postId || ''}">
                      <div class="flex items-start gap-3.5 flex-1 min-w-0">
                        <div class="relative flex-shrink-0">
                          <img src="${notif.actorAvatar}" alt="${escapeHtml(notif.actorName)}" class="avatar-sm" />
                          <span class="notif-type-badge badge-like">
                            <i data-lucide="heart" class="w-3 h-3 fill-current"></i>
                          </span>
                        </div>
                        <div class="flex-1 min-w-0">
                          <p class="text-sm leading-snug">
                            <strong>${escapeHtml(notif.actorName)}</strong> پۆستەکەتی پەسەند کرد.
                          </p>
                          <p class="text-xs muted-text truncate mt-1">${escapeHtml(notif.postExcerpt || '')}</p>
                          <time class="text-[11px] muted-text block mt-1">${escapeHtml(notif.timestamp)}</time>
                        </div>
                      </div>
                    </article>`;

                case 'COMMENT':
                  return `
                    <article class="notif-row ${notif.read ? '' : 'unread'}" data-notif-id="${notif.id}" data-target-post="${notif.postId || ''}" data-expand-comment="true">
                      <div class="flex items-start gap-3.5 flex-1 min-w-0">
                        <div class="relative flex-shrink-0">
                          <img src="${notif.actorAvatar}" alt="${escapeHtml(notif.actorName)}" class="avatar-sm" />
                          <span class="notif-type-badge badge-comment">
                            <i data-lucide="message-circle" class="w-3 h-3 fill-current"></i>
                          </span>
                        </div>
                        <div class="flex-1 min-w-0">
                          <p class="text-sm leading-snug">
                            <strong>${escapeHtml(notif.actorName)}</strong> لێدوانێکی نووسی لەسەر پۆستەکەت:
                          </p>
                          <div class="notif-comment-quote">«${escapeHtml(notif.commentText || '')}»</div>
                          <p class="text-xs muted-text truncate mt-1.5">${escapeHtml(notif.postExcerpt || '')}</p>
                          <time class="text-[11px] muted-text block mt-1">${escapeHtml(notif.timestamp)}</time>
                        </div>
                      </div>
                    </article>`;

                case 'FOLLOW':
                  return `
                    <article class="notif-row ${notif.read ? '' : 'unread'}" data-notif-id="${notif.id}">
                      <div class="flex items-center gap-3.5 flex-1 min-w-0">
                        <div class="relative flex-shrink-0">
                          <img src="${notif.actorAvatar}" alt="${escapeHtml(notif.actorName)}" class="avatar-sm" />
                          <span class="notif-type-badge badge-follow">
                            <i data-lucide="user-plus" class="w-3 h-3"></i>
                          </span>
                        </div>
                        <div class="flex-1 min-w-0">
                          <p class="text-sm leading-snug">
                            <strong>${escapeHtml(notif.actorName)}</strong> دەستی کرد بە شوێنکەوتنت.
                          </p>
                          <time class="text-[11px] muted-text block mt-1">${escapeHtml(notif.timestamp)}</time>
                        </div>
                      </div>
                      <button type="button" class="follow-back-pill ${notif.isFollowingBack ? 'following' : ''}" data-follow-notif-id="${notif.id}">
                        ${notif.isFollowingBack ? 'شوێنکەوتوو' : 'شوێنکەوتنەوە'}
                      </button>
                    </article>`;

                default:
                  return '';
              }
            })
            .join('');

    return `
      <header class="top-sticky-header">
        <h1 class="text-lg font-bold">ئاگادارییەکان</h1>
        <button type="button" id="mark-all-notifs-read-btn" class="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline">
          خوێندنەوەی هەموو
        </button>
      </header>

      <!-- Filter Pill Tabs -->
      <nav class="px-4 py-3 flex items-center gap-2 overflow-x-auto no-scrollbar border-b hairline-border" aria-label="پاڵاوتنی ئاگادارییەکان">
        ${filters
          .map(
            (f) => `
          <button
            type="button"
            class="notif-filter-tab px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition ${
              state.notifFilter === f
                ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900'
                : 'bg-slate-100 dark:bg-zinc-900 muted-text'
            }"
            data-filter="${f}"
          >
            ${f}
          </button>`
          )
          .join('')}
      </nav>

      <section aria-label="لیستی ئاگادارییەکان">
        ${rowsHtml}
      </section>
    `;
  }

  // ====================================================================
  // VIEW 3: INSTAGRAM PROFILE (NO SAVED POSTS TAB HERE — STRICTLY PRIVATE IN DRAWER)
  // ====================================================================
  function renderProfileView() {
    const u = state.currentUser;
    const myPosts = state.posts.filter((p) => p.authorHandle === u.handle);
    const filteredPosts = state.profileTab === 'poetry' ? myPosts.filter((p) => p.isPoetry) : myPosts;

    return `
      <!-- Top Bar with @username handle (dir="ltr") -->
      <header class="top-sticky-header">
        <div class="flex items-center gap-2">
          <span dir="ltr" class="text-base font-bold tracking-tight">@${escapeHtml(u.handle)}</span>
        </div>
        <button type="button" id="profile-top-edit-btn" class="icon-circle-btn" aria-label="دەستکاریکردنی پڕۆفایل">
          <i data-lucide="sliders-horizontal" class="w-4 h-4"></i>
        </button>
      </header>

      <section class="px-4 pt-5 pb-4 border-b hairline-border">
        <!-- Header Row: .avatar-lg (84px) on right; 3 stat columns on left -->
        <div class="flex items-center justify-between gap-4">
          <img src="${u.avatar}" alt="${escapeHtml(u.name)}" class="avatar-lg ring-2 ring-black/5 dark:ring-white/10" />
          <div class="flex-1 flex items-center justify-around text-center">
            <div>
              <div class="text-base font-extrabold">${toKurdishNumber(myPosts.length)}</div>
              <div class="text-xs muted-text">پۆست</div>
            </div>
            <div>
              <div class="text-base font-extrabold">${toKurdishNumber(u.followers)}</div>
              <div class="text-xs muted-text">شوێنکەوتووان</div>
            </div>
            <div>
              <div class="text-base font-extrabold">${toKurdishNumber(u.following)}</div>
              <div class="text-xs muted-text">شوێنکەوتوو</div>
            </div>
          </div>
        </div>

        <!-- Bio Section -->
        <div class="mt-4">
          <h1 class="text-base font-bold">${escapeHtml(u.name)}</h1>
          <p class="text-sm mt-1 leading-relaxed">${escapeHtml(u.bio)}</p>
          <p class="text-xs muted-text mt-2 flex items-center gap-1">
            <span>📍 ${escapeHtml(u.country)}، ${escapeHtml(u.city)}</span>
          </p>
        </div>

        <!-- Action Buttons: Side by Side -->
        <div class="grid grid-cols-2 gap-2.5 mt-4">
          <button type="button" id="open-edit-profile-btn" class="py-2 px-3 rounded-xl text-xs font-bold bg-slate-100 dark:bg-zinc-900 border hairline-border hover:opacity-90">
            دەستکاریکردنی پڕۆفایل
          </button>
          <button type="button" id="share-profile-btn" class="py-2 px-3 rounded-xl text-xs font-bold bg-slate-100 dark:bg-zinc-900 border hairline-border hover:opacity-90">
            هاوبەشیکردنی پڕۆفایل
          </button>
        </div>
      </section>

      <!-- Profile Feed Tabs (Strictly NO Saved tab on public Profile!) -->
      <nav class="grid grid-cols-2 border-b hairline-border text-center" aria-label="بڵاوکراوەکانی من">
        <button
          type="button"
          class="profile-feed-tab py-3 text-xs font-bold border-b-2 transition ${
            state.profileTab === 'all'
              ? 'border-zinc-900 dark:border-white text-zinc-900 dark:text-white'
              : 'border-transparent muted-text'
          }"
          data-profile-tab="all"
        >
          هەموو بڵاوکراوەکانم
        </button>
        <button
          type="button"
          class="profile-feed-tab py-3 text-xs font-bold border-b-2 transition ${
            state.profileTab === 'poetry'
              ? 'border-zinc-900 dark:border-white text-zinc-900 dark:text-white'
              : 'border-transparent muted-text'
          }"
          data-profile-tab="poetry"
        >
          شیعرەکانم
        </button>
      </nav>

      <section aria-label="پۆستەکانی بەکارهێنەر">
        ${
          filteredPosts.length === 0
            ? `<div class="py-16 text-center muted-text text-sm">هیچ بڵاوکراوەیەک لەم بەشەدا نییە.</div>`
            : filteredPosts.map((p) => renderPostHTML(p)).join('')
        }
      </section>
    `;
  }

  // ====================================================================
  // VIEW 4: PRIVATE SAVED POSTS VIEW (ACCESSIBLE ONLY VIA LEFT DRAWER)
  // ====================================================================
  function renderSavedPostsView() {
    const savedPosts = state.posts.filter((p) => state.savedPostIds.includes(p.id));

    return `
      <header class="top-sticky-header">
        <div>
          <h1 class="text-lg font-bold flex items-center gap-2">
            <i data-lucide="bookmark" class="w-5 h-5"></i>
            <span>پاشەکەوتکراوەکان</span>
          </h1>
          <p class="text-xs muted-text flex items-center gap-1 mt-0.5">
            <i data-lucide="lock" class="w-3 h-3"></i>
            <span>تەنها خۆت دەیبینیت</span>
          </p>
        </div>
        <button type="button" id="saved-back-home-btn" class="icon-circle-btn" aria-label="گەڕانەوە">
          <i data-lucide="arrow-left" class="w-4 h-4"></i>
        </button>
      </header>

      <section aria-label="لیستی پۆستە پاشەکەوتکراوەکان">
        ${
          savedPosts.length === 0
            ? `<div class="py-20 px-6 text-center">
                <p class="text-sm font-bold">هیچ پۆستێکت پاشەکەوت نەکردووە</p>
                <p class="text-xs muted-text mt-1">لەسەر هەر پۆستێک کرتە لە نیشانەی پاشەکەوتکردن بکە بۆ هەڵگرتنی لەم بەشە تایبەتەدا.</p>
              </div>`
            : savedPosts.map((p) => renderPostHTML(p)).join('')
        }
      </section>
    `;
  }

  // ====================================================================
  // VIEW 5: HYBRID CHAT (INSTAGRAM LIST + TELEGRAM GROUPS + MESSENGER BUBBLES + CLAUDE INPUT)
  // ====================================================================
  function renderChatView() {
    if (state.activeChatId) {
      const room = state.chats.find((c) => c.id === state.activeChatId);
      if (room) {
        return renderActiveChatRoom(room);
      }
      state.activeChatId = null;
    }

    const filteredChats = state.chats.filter((c) => c.type === state.chatSubTab);

    return `
      <header class="top-sticky-header">
        <h1 class="text-lg font-bold">گفتوگۆ و گرووپەکان</h1>
        <!-- Top-left square-pen button to start DM or Group -->
        <button type="button" id="open-new-chat-modal-btn" class="icon-circle-btn" aria-label="گفتوگۆی نوێ">
          <i data-lucide="square-pen" class="w-4 h-4"></i>
        </button>
      </header>

      <!-- Tabs: چاتەکان (Private DMs) & گرووپەکان (Telegram-style groups) -->
      <nav class="grid grid-cols-2 border-b hairline-border text-center" aria-label="جۆری گفتوگۆکان">
        <button
          type="button"
          class="chat-tab-btn py-3 text-xs font-bold border-b-2 transition ${
            state.chatSubTab === 'dm'
              ? 'border-zinc-900 dark:border-white text-zinc-900 dark:text-white'
              : 'border-transparent muted-text'
          }"
          data-chat-tab="dm"
        >
          چاتەکان
        </button>
        <button
          type="button"
          class="chat-tab-btn py-3 text-xs font-bold border-b-2 transition ${
            state.chatSubTab === 'group'
              ? 'border-zinc-900 dark:border-white text-zinc-900 dark:text-white'
              : 'border-transparent muted-text'
          }"
          data-chat-tab="group"
        >
          گرووپەکان
        </button>
      </nav>

      <!-- Instagram DM Style List -->
      <section class="divide-y hairline-border" aria-label="لیستی گفتوگۆکان">
        ${filteredChats
          .map((chat) => {
            const lastMsg = chat.messages[chat.messages.length - 1];
            const snippet = lastMsg ? lastMsg.text : 'گفتوگۆ دەست پێ بکە...';
            return `
              <article class="chat-list-item px-4 py-3.5 flex items-center justify-between gap-3.5 cursor-pointer hover:bg-slate-50 dark:hover:bg-zinc-900/60 transition" data-chat-id="${chat.id}">
                <div class="relative flex-shrink-0">
                  <img src="${chat.avatar}" alt="${escapeHtml(chat.name)}" class="avatar-md" />
                  <span class="absolute bottom-0.5 right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white dark:border-zinc-950"></span>
                </div>
                <div class="flex-1 min-w-0">
                  <h2 class="text-sm font-bold truncate">${escapeHtml(chat.name)}</h2>
                  <p class="text-xs muted-text truncate mt-1">${escapeHtml(snippet)}</p>
                </div>
                <div class="text-left flex-shrink-0">
                  <time class="text-[11px] muted-text block">${escapeHtml(chat.timestamp)}</time>
                  <span class="text-[10px] muted-text block mt-1">${escapeHtml(chat.status)}</span>
                </div>
              </article>
            `;
          })
          .join('')}
      </section>
    `;
  }

  function renderActiveChatRoom(room) {
    const bubblesHtml = room.messages
      .map((m) => {
        if (m.sender === 'yours') {
          // Yours on the RIGHT (#0084ff Messenger Blue, white text, NO avatar)
          return `
            <div class="msg-row-yours">
              <div class="bubble-yours">${escapeHtml(m.text)}</div>
            </div>
          `;
        } else {
          // Theirs on the LEFT (#f0f2f5 light / #27272a dark, accompanied by .avatar-xs 28px)
          return `
            <div class="msg-row-theirs">
              <img src="${room.avatar}" alt="${escapeHtml(room.name)}" class="avatar-xs" />
              <div class="bubble-theirs">${escapeHtml(m.text)}</div>
            </div>
          `;
        }
      })
      .join('');

    return `
      <div class="chat-room-container">
        <!-- Active Chat Header: Back button, avatar, bold Name, status. ZERO phone/video/mic/attachment icons -->
        <header class="top-sticky-header">
          <div class="flex items-center gap-3">
            <button type="button" id="chat-room-back-btn" class="icon-circle-btn" aria-label="گەڕانەوە بۆ لیست">
              <i data-lucide="arrow-right" class="w-4 h-4"></i>
            </button>
            <img src="${room.avatar}" alt="${escapeHtml(room.name)}" class="avatar-sm" />
            <div>
              <h2 class="text-sm font-bold leading-snug">${escapeHtml(room.name)}</h2>
              <p class="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">${escapeHtml(room.status)}</p>
            </div>
          </div>
        </header>

        <!-- Messenger Bubbles Area -->
        <div id="chat-messages-scroll" class="chat-messages-scroll">
          ${bubblesHtml}
        </div>

        <!-- Claude / ChatGPT Smart Auto-Expanding Input -->
        <form id="chat-send-form" class="claude-input-bar" autocomplete="off">
          <textarea
            id="claude-chat-input"
            rows="1"
            class="claude-textarea"
            placeholder="نامەیەک بنووسە..."
          ></textarea>
          <button type="submit" id="claude-send-btn" class="claude-send-btn" aria-label="ناردنی نامە">
            <i data-lucide="arrow-up" class="w-4 h-4"></i>
          </button>
        </form>
      </div>
    `;
  }

  // ====================================================================
  // VIEW 6: REDESIGNED FLAGSHIP EDITORIAL LIBRARY & RAW TEXT ARCHIVE
  // ====================================================================
  function renderLibraryView() {
    const categories = ['هەموو', 'دەقی خاو TXT', 'دیوانی شیعر', 'لێکۆڵینەوە', 'فەرهەنگ و زمان'];
    const totalWorks = state.libraryWorks.length;
    const totalWords = state.libraryWorks.reduce((acc, w) => acc + countWords(w.content), 0);

    const featuredWork = state.libraryWorks.find((w) => w.featured) || state.libraryWorks[0];

    const query = (state.librarySearch || '').trim().toLowerCase();
    const filteredWorks = state.libraryWorks.filter((w) => {
      const catMatch = state.libraryCategory === 'هەموو' || w.category === state.libraryCategory;
      const searchMatch =
        !query ||
        w.title.toLowerCase().includes(query) ||
        w.author.toLowerCase().includes(query) ||
        w.content.toLowerCase().includes(query);
      return catMatch && searchMatch;
    });

    const featuredWordsCount = featuredWork ? countWords(featuredWork.content) : 0;
    const featuredSizeKB = featuredWork ? getByteSizeKB(featuredWork.content) : 1;

    return `
      <!-- 10.1. Library Header -->
      <header style="padding: 20px 16px 12px;" class="flex items-start justify-between gap-3">
        <div>
          <h1 class="text-xl font-extrabold tracking-tight">کتێبخانە و ئەرشیفی کراوە</h1>
          <p class="text-xs muted-text mt-1">ژێرخانی دەقی خاوی کوردی بە ستانداردی UTF-8</p>
        </div>
        <button type="button" id="open-submit-text-modal-btn" class="publish-pill-btn flex items-center gap-1.5 whitespace-nowrap">
          <i data-lucide="plus" class="w-4 h-4"></i>
          <span>+ ناردنی دەق</span>
        </button>
      </header>

      <!-- Corpus Live Stats Strip -->
      <section class="library-stats-strip" aria-label="ئاماری کۆرپەسی زمانی کوردی">
        <div>
          <div class="text-base font-extrabold">${toKurdishNumber(totalWorks)}</div>
          <div class="text-[11px] muted-text">کۆی بەرهەمەکان</div>
        </div>
        <div class="border-x hairline-border px-6">
          <div class="text-base font-extrabold">${toKurdishNumber(totalWords)}</div>
          <div class="text-[11px] muted-text">کۆی وشەکان</div>
        </div>
        <div>
          <div class="text-base font-extrabold text-emerald-600 dark:text-emerald-400">100% UTF-8</div>
          <div class="text-[11px] muted-text">ستاندارد</div>
        </div>
      </section>

      <!-- Search & Filter Bar -->
      <div class="px-4 mb-2">
        <div class="relative">
          <i data-lucide="search" class="w-4 h-4 muted-text absolute right-3.5 top-1/2 -translate-y-1/2"></i>
          <input
            type="search"
            id="library-search-input"
            value="${escapeHtml(state.librarySearch)}"
            class="w-full pr-10 pl-4 py-2.5 rounded-2xl text-xs bg-slate-100 dark:bg-zinc-900 border hairline-border outline-none"
            placeholder="گەڕان لە ناونیشان، نووسەر، یان ناوەڕۆکی دەق..."
          />
        </div>
      </div>

      <!-- Horizontal Scrollable Pill Tabs -->
      <nav style="padding: 10px 16px; gap: 8px;" class="flex items-center overflow-x-auto no-scrollbar mb-2" aria-label="هاوپۆلەکانی کتێبخانە">
        ${categories
          .map(
            (cat) => `
          <button
            type="button"
            class="library-cat-pill px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition ${
              state.libraryCategory === cat
                ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900'
                : 'bg-slate-100 dark:bg-zinc-900 muted-text border hairline-border'
            }"
            data-lib-cat="${cat}"
          >
            ${cat}
          </button>`
          )
          .join('')}
      </nav>

      <!-- 10.2. Featured Masterpiece Hero Card (شاکاری هەڵبژێردراو) -->
      ${
        featuredWork
          ? `<section class="library-hero-wrapper" aria-label="شاکاری هەڵبژێردراو">
              <article class="library-hero-card" itemscope itemtype="https://schema.org/Book">
                <meta itemprop="inLanguage" content="ku" />
                <div class="library-hero-watermark" aria-hidden="true">مەکۆ</div>
                <span class="inline-block text-[11px] font-bold tracking-wide px-3 py-1 rounded-full bg-white/10 text-amber-300 border border-white/15">
                  شاکاری هەڵبژێردراو · UTF-8 TXT
                </span>
                <h2 class="font-serif text-[24px] font-bold text-amber-100 mt-3 leading-snug" itemprop="name">
                  ${escapeHtml(featuredWork.title)}
                </h2>
                <p class="text-xs text-zinc-300 mt-1" itemprop="author">${escapeHtml(featuredWork.author)} · ${escapeHtml(featuredWork.era || '')}</p>
                <p class="font-serif text-base text-zinc-200 mt-3.5 leading-relaxed line-clamp-2">
                  «${escapeHtml(featuredWork.excerpt)}»
                </p>
                <div class="mt-5 pt-4 border-t border-white/10 flex items-center justify-between gap-2">
                  <div class="text-xs text-zinc-300">
                    <span>${toKurdishNumber(featuredWordsCount)} وشە</span> · <span>${toKurdishNumber(featuredSizeKB)} کیلۆبایت</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <button
                      type="button"
                      class="open-reader-btn px-4 py-1.5 rounded-full bg-white text-zinc-950 text-xs font-extrabold hover:opacity-95"
                      data-work-id="${featuredWork.id}"
                    >
                      خوێندنەوە
                    </button>
                    <button
                      type="button"
                      class="download-txt-btn w-8 h-8 rounded-full bg-white/15 text-white flex items-center justify-center hover:bg-white/25"
                      data-work-id="${featuredWork.id}"
                      aria-label="داگرتنی دەقی خاو"
                    >
                      <i data-lucide="download" class="w-4 h-4"></i>
                    </button>
                  </div>
                </div>
              </article>
            </section>`
          : ''
      }

      <!-- 10.3. Ultra-Clean Editorial List Index (Master Archive Rows) -->
      <section class="library-list-container" aria-label="پێڕستی بەرهەمەکانی ئەرشیف">
        ${
          filteredWorks.length === 0
            ? `<div class="py-12 text-center muted-text text-sm">هیچ بەرهەمێک هاوتای گەڕانەکەت نەبوو.</div>`
            : filteredWorks
                .map((work, idx) => {
                  const wCount = countWords(work.content);
                  const kb = getByteSizeKB(work.content);
                  return `
                    <article class="archive-item-card" itemscope itemtype="https://schema.org/Book">
                      <meta itemprop="inLanguage" content="ku" />
                      <!-- 1. Right Index Badge -->
                      <div class="archive-index-badge">
                        <span>${formatIndexBadge(idx + 1)}</span>
                        <span class="archive-index-sub">TXT</span>
                      </div>

                      <!-- 2. Center Editorial Info -->
                      <div class="archive-center-info">
                        <div class="text-[11px] font-bold muted-text mb-1">${escapeHtml(work.category)} · دەقی خاو</div>
                        <h3 class="archive-title-link open-reader-btn" data-work-id="${work.id}" itemprop="name">
                          ${escapeHtml(work.title)}
                        </h3>
                        <p class="text-[13.5px] font-medium mt-0.5" itemprop="author">${escapeHtml(work.author)}</p>
                        <p class="archive-preview-snippet" itemprop="abstract">${escapeHtml(work.content)}</p>
                        <div class="archive-meta-pills">
                          <span>${toKurdishNumber(wCount)} وشە</span>
                          <span>•</span>
                          <span>${toKurdishNumber(kb)} کیلۆبایت</span>
                          <span>•</span>
                          <span>UTF-8</span>
                        </div>
                      </div>

                      <!-- 3. Left Action Column -->
                      <div class="archive-action-col">
                        <button type="button" class="archive-icon-btn primary open-reader-btn" data-work-id="${work.id}" title="خوێندنەوەی دەق">
                          <i data-lucide="book-open" class="w-4 h-4"></i>
                        </button>
                        <button type="button" class="archive-icon-btn download-txt-btn" data-work-id="${work.id}" title="داگرتنی فایلی TXT">
                          <i data-lucide="download" class="w-4 h-4"></i>
                        </button>
                      </div>
                    </article>
                  `;
                })
                .join('')
        }
      </section>
    `;
  }

  // ====================================================================
  // VIEW 7: SETTINGS VIEW (INCLUDING SELF-TEST NOTIFICATION TRIGGER)
  // ====================================================================
  function renderSettingsView() {
    const isDark = document.documentElement.classList.contains('dark');
    const currentScale = state.readingFontScale || 1;

    return `
      <header class="top-sticky-header">
        <h1 class="text-lg font-bold">ڕێکخستنەکان</h1>
        <button type="button" id="settings-back-home-btn" class="icon-circle-btn" aria-label="گەڕانەوە">
          <i data-lucide="arrow-left" class="w-4 h-4"></i>
        </button>
      </header>

      <div class="p-4 space-y-4">
        <!-- Theme Toggle Card -->
        <section class="p-4 rounded-2xl border hairline-border bg-slate-50/60 dark:bg-zinc-900/50 flex items-center justify-between">
          <div>
            <h2 class="text-sm font-bold">ڕووکاری تاریک (Dark Mode)</h2>
            <p class="text-xs muted-text mt-0.5">گۆڕینی ڕەنگی پاشبنەما بۆ خوێندنەوەی شەوانە</p>
          </div>
          <button type="button" id="settings-theme-toggle-btn" class="px-4 py-2 rounded-xl text-xs font-bold bg-zinc-900 text-white dark:bg-white dark:text-zinc-900">
            ${isDark ? 'چالاکە (گۆڕین بۆ ڕووناک)' : 'ناچالاکە (گۆڕین بۆ تاریک)'}
          </button>
        </section>

        <!-- Reading Font Scale -->
        <section class="p-4 rounded-2xl border hairline-border bg-slate-50/60 dark:bg-zinc-900/50">
          <h2 class="text-sm font-bold">قەبارەی فۆنتی خوێندنەوە</h2>
          <p class="text-xs muted-text mt-0.5 mb-3">ڕێکخستنی قەبارەی دەقی پۆست و شیعرەکان لەسەر پەڕەی سەرەکی</p>
          <div class="grid grid-cols-3 gap-2">
            <button type="button" class="font-scale-btn py-2 rounded-xl text-xs font-bold border hairline-border ${currentScale === 0.92 ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900' : ''}" data-scale="0.92">بچووک</button>
            <button type="button" class="font-scale-btn py-2 rounded-xl text-xs font-bold border hairline-border ${currentScale === 1 ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900' : ''}" data-scale="1">مامناوەند (بنەڕەتی)</button>
            <button type="button" class="font-scale-btn py-2 rounded-xl text-xs font-bold border hairline-border ${currentScale === 1.12 ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900' : ''}" data-scale="1.12">گەورە</button>
          </div>
        </section>

        <!-- Live Notification Self-Test Section -->
        <section class="p-4 rounded-2xl border hairline-border bg-slate-50/60 dark:bg-zinc-900/50">
          <h2 class="text-sm font-bold">تاقیکردنەوەی ئاگاداری</h2>
          <p class="text-xs muted-text mt-0.5 mb-3">دروستکردنی ئاگاداریی ڕاستەوخۆ بە هەر سێ جۆری ستاندارد (پەسەندکردن، لێدوان، شوێنکەوتن)</p>
          <div class="flex flex-wrap gap-2">
            <button type="button" id="test-notif-like-btn" class="px-3.5 py-2 rounded-xl text-xs font-bold bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20">
              + تاقیکردنەوەی ئاگاداری (پەسەندکردن)
            </button>
            <button type="button" id="test-notif-comment-btn" class="px-3.5 py-2 rounded-xl text-xs font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
              + تاقیکردنەوەی ئاگاداری (لێدوان)
            </button>
            <button type="button" id="test-notif-follow-btn" class="px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              + تاقیکردنەوەی ئاگاداری (شوێنکەوتن)
            </button>
          </div>
        </section>

        <!-- Reset Demo Data -->
        <section class="p-4 rounded-2xl border hairline-border bg-slate-50/60 dark:bg-zinc-900/50 flex items-center justify-between">
          <div>
            <h2 class="text-sm font-bold">گەڕاندنەوەی داتای سەرەتایی</h2>
            <p class="text-xs muted-text mt-0.5">پاککردنەوەی گۆڕانکارییەکان و گەڕانەوە بۆ دۆخی بنەڕەتی</p>
          </div>
          <button type="button" id="reset-demo-data-btn" class="px-4 py-2 rounded-xl text-xs font-bold bg-red-600 text-white">
            ڕیسێتکردنەوە
          </button>
        </section>
      </div>
    `;
  }

  // ====================================================================
  // MASTER VIEW ROUTER
  // ====================================================================
  function renderApp() {
    const container = document.getElementById('app-view');
    if (!container) return;

    switch (state.activeTab) {
      case 'feed':
        container.innerHTML = renderFeedView();
        break;
      case 'notifications':
        container.innerHTML = renderNotificationsView();
        break;
      case 'profile':
        container.innerHTML = renderProfileView();
        break;
      case 'saved':
        container.innerHTML = renderSavedPostsView();
        break;
      case 'chat':
        container.innerHTML = renderChatView();
        break;
      case 'library':
        container.innerHTML = renderLibraryView();
        break;
      case 'settings':
        container.innerHTML = renderSettingsView();
        break;
      default:
        container.innerHTML = renderFeedView();
    }

    syncGlobalChrome();
    if (window.lucide) {
      window.lucide.createIcons();
    }

    // If inside an active chat room, scroll to bottom
    const chatScroll = document.getElementById('chat-messages-scroll');
    if (chatScroll) {
      chatScroll.scrollTop = chatScroll.scrollHeight;
    }
  }

  function navigateTo(tabName) {
    state.activeTab = tabName;
    if (tabName !== 'chat') {
      state.activeChatId = null;
    }
    saveState();
    renderApp();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // ====================================================================
  // LEFT SLIDE-OUT NAVIGATION DRAWER CONTROLS
  // ====================================================================
  function openLeftDrawer() {
    const drawer = document.getElementById('left-drawer');
    const backdrop = document.getElementById('drawer-backdrop');
    if (!drawer || !backdrop) return;
    backdrop.classList.remove('hidden');
    requestAnimationFrame(() => {
      backdrop.classList.add('open');
      drawer.classList.add('open');
      drawer.setAttribute('aria-hidden', 'false');
    });
  }

  function closeLeftDrawer() {
    const drawer = document.getElementById('left-drawer');
    const backdrop = document.getElementById('drawer-backdrop');
    if (!drawer || !backdrop) return;
    backdrop.classList.remove('open');
    drawer.classList.remove('open');
    drawer.setAttribute('aria-hidden', 'true');
    setTimeout(() => {
      backdrop.classList.add('hidden');
    }, 260);
  }

  // ====================================================================
  // FULL-SCREEN CREATOR CANVAS CONTROLS
  // ====================================================================
  function openCreatorModal() {
    const modal = document.getElementById('creator-modal');
    const textarea = document.getElementById('creator-textarea');
    if (!modal || !textarea) return;
    modal.classList.remove('hidden');
    textarea.focus();
  }

  function closeCreatorModal() {
    const modal = document.getElementById('creator-modal');
    if (modal) modal.classList.add('hidden');
  }

  function publishNewPost() {
    const textarea = document.getElementById('creator-textarea');
    if (!textarea) return;
    const rawText = window.MekoUnicode ? window.MekoUnicode.normalize(textarea.value.trim()) : textarea.value.trim();
    if (!rawText) {
      showToast('تکایە سەرەتا دەقێک بنووسە');
      return;
    }

    const newPost = {
      id: 'post-' + Date.now(),
      authorName: state.currentUser.name,
      authorHandle: state.currentUser.handle,
      authorAvatar: state.currentUser.avatar,
      timestamp: 'ئێستا',
      isoDate: new Date().toISOString(),
      isPoetry: creatorIsPoetry,
      text: rawText,
      latinMode: false,
      likes: 0,
      liked: false,
      shares: 0,
      commentsOpen: false,
      comments: []
    };

    state.posts.unshift(newPost);
    textarea.value = '';
    const counter = document.getElementById('creator-char-counter');
    if (counter) counter.textContent = '٠ پیت';

    closeCreatorModal();
    navigateTo('feed');
    showToast('بڵاوکراوەکەت بە سەرکەوتوویی بڵاو کرایەوە');
  }

  // ====================================================================
  // EDIT PROFILE MODAL & GLOBAL 5-PLACE AVATAR/HANDLE SYNC
  // ====================================================================
  function populateCityDropdown(country, selectedCity) {
    const citySelect = document.getElementById('edit-city');
    if (!citySelect) return;
    const list = country === 'کوردستان' ? KURDISTAN_CITIES : OTHER_CITIES[country] || ['ناوەند'];
    citySelect.innerHTML = list
      .map((city) => `<option value="${city}" ${city === selectedCity ? 'selected' : ''}>${city}</option>`)
      .join('');
  }

  function openEditProfileModal() {
    const modal = document.getElementById('edit-profile-modal');
    if (!modal) return;

    const u = state.currentUser;
    const avatarPrev = document.getElementById('edit-profile-avatar-preview');
    const nameInput = document.getElementById('edit-display-name');
    const handleInput = document.getElementById('edit-username-handle');
    const bioInput = document.getElementById('edit-bio');
    const countrySelect = document.getElementById('edit-country');
    const bioCount = document.getElementById('edit-bio-count');

    if (avatarPrev) avatarPrev.src = u.avatar;
    if (nameInput) nameInput.value = u.name;
    if (handleInput) handleInput.value = u.handle;
    if (bioInput) bioInput.value = u.bio;
    if (bioCount) bioCount.textContent = `${toKurdishNumber(u.bio.length)} / ١٦٠`;
    if (countrySelect) {
      countrySelect.value = u.country;
      populateCityDropdown(u.country, u.city);
    }

    modal.classList.remove('hidden');
  }

  function closeEditProfileModal() {
    const modal = document.getElementById('edit-profile-modal');
    if (modal) modal.classList.add('hidden');
  }

  function resizeImageToBase64(file, callback) {
    const reader = new FileReader();
    reader.onload = function (e) {
      const img = new Image();
      img.onload = function () {
        const canvas = document.createElement('canvas');
        canvas.width = 250;
        canvas.height = 250;
        const ctx = canvas.getContext('2d');
        const minSide = Math.min(img.width, img.height);
        const sx = (img.width - minSide) / 2;
        const sy = (img.height - minSide) / 2;
        ctx.drawImage(img, sx, sy, minSide, minSide, 0, 0, 250, 250);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        callback(dataUrl);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  function saveProfileChanges() {
    const oldName = state.currentUser.name;
    const oldHandle = state.currentUser.handle;

    const avatarPrev = document.getElementById('edit-profile-avatar-preview');
    const nameInput = document.getElementById('edit-display-name');
    const handleInput = document.getElementById('edit-username-handle');
    const bioInput = document.getElementById('edit-bio');
    const countrySelect = document.getElementById('edit-country');
    const citySelect = document.getElementById('edit-city');

    const newName = (nameInput ? nameInput.value.trim() : '') || state.currentUser.name;
    const cleanedHandle = (handleInput ? handleInput.value.trim().toLowerCase().replace(/[^a-z0-9_]/g, '') : '') || state.currentUser.handle;
    const newBio = bioInput ? bioInput.value.trim() : state.currentUser.bio;
    const newCountry = countrySelect ? countrySelect.value : state.currentUser.country;
    const newCity = citySelect ? citySelect.value : state.currentUser.city;
    const newAvatar = avatarPrev ? avatarPrev.src : state.currentUser.avatar;

    state.currentUser.name = newName;
    state.currentUser.handle = cleanedHandle;
    state.currentUser.bio = newBio;
    state.currentUser.country = newCountry;
    state.currentUser.city = newCity;
    state.currentUser.avatar = newAvatar;

    // Global Sync across all user posts and comments
    state.posts.forEach((p) => {
      if (p.authorHandle === oldHandle || p.authorName === oldName) {
        p.authorName = newName;
        p.authorHandle = cleanedHandle;
        p.authorAvatar = newAvatar;
      }
      (p.comments || []).forEach((c) => {
        if (c.authorName === oldName) {
          c.authorName = newName;
          c.authorAvatar = newAvatar;
        }
      });
    });

    saveState();
    closeEditProfileModal();
    renderApp();
    showToast('پڕۆفایلەکەت بە سەرکەوتوویی نوێ کرایەوە');
  }

  // ====================================================================
  // DISTRACTION-FREE READER & UTF-8 BOM TXT DOWNLOAD
  // ====================================================================
  function openReaderModal(workId) {
    const work = state.libraryWorks.find((w) => w.id === workId);
    if (!work) return;

    activeReaderBookId = work.id;
    activeReaderLatinMode = false;

    const modal = document.getElementById('reader-modal');
    const catBadge = document.getElementById('reader-category-badge');
    const titleEl = document.getElementById('reader-book-title');
    const authorEl = document.getElementById('reader-book-author');
    const statsEl = document.getElementById('reader-book-stats');
    const scriptLabel = document.getElementById('reader-script-label');

    if (catBadge) catBadge.textContent = work.category;
    if (titleEl) titleEl.textContent = work.title;
    if (authorEl) authorEl.textContent = work.author;
    if (statsEl) {
      const words = countWords(work.content);
      const kb = getByteSizeKB(work.content);
      statsEl.textContent = `${toKurdishNumber(words)} وشە · ${toKurdishNumber(kb)} کیلۆبایت · UTF-8`;
    }
    if (scriptLabel) scriptLabel.textContent = 'لاتینی';

    renderReaderBodyContent(work);
    if (modal) modal.classList.remove('hidden');
  }

  function renderReaderBodyContent(work) {
    const bodyEl = document.getElementById('reader-body-text');
    if (!bodyEl || !work) return;

    const displayContent = activeReaderLatinMode ? transliterateKurdishToLatin(work.content) : work.content;
    bodyEl.textContent = displayContent;
    bodyEl.style.fontSize = `${activeReaderFontSize}px`;

    bodyEl.classList.toggle('poetry-layout', Boolean(work.isPoetry));
    bodyEl.classList.toggle('latin-mode', activeReaderLatinMode);
  }

  function closeReaderModal() {
    const modal = document.getElementById('reader-modal');
    if (modal) modal.classList.add('hidden');
    activeReaderBookId = null;
  }

  function downloadRawTxtFile(work) {
    if (!work) return;
    const header = `${work.title}\nنووسەر: ${work.author}\nهاوپۆل: ${work.category}\nژێرخانی کراوەی مەکۆ (Meko Open Kurdish Corpus)\n========================================\n\n`;
    const fullText = '\uFEFF' + header + work.content;
    const blob = new Blob([fullText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const safeName = work.title.replace(/\s+/g, '_').slice(0, 45);
    a.download = `${safeName}.txt`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    showToast('فایلی دەقی خاو (.txt) داگیرا');
  }

  // ====================================================================
  // EVENT DELEGATION & INTERACTION HANDLERS
  // ====================================================================
  function bindEvents() {
    // Bottom Navigation Bar
    document.querySelectorAll('.nav-icon-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const target = btn.getAttribute('data-nav');
        if (target) navigateTo(target);
      });
    });

    // Center + Button -> Creator Canvas
    const openCreatorBtn = document.getElementById('open-creator-btn');
    if (openCreatorBtn) openCreatorBtn.addEventListener('click', openCreatorModal);

    const closeCreatorBtn = document.getElementById('close-creator-btn');
    if (closeCreatorBtn) closeCreatorBtn.addEventListener('click', closeCreatorModal);

    const publishPostBtn = document.getElementById('publish-post-btn');
    if (publishPostBtn) publishPostBtn.addEventListener('click', publishNewPost);

    const creatorTextarea = document.getElementById('creator-textarea');
    if (creatorTextarea) {
      creatorTextarea.addEventListener('input', () => {
        const counter = document.getElementById('creator-char-counter');
        if (counter) counter.textContent = `${toKurdishNumber(creatorTextarea.value.length)} پیت`;
      });
    }

    const poetryToggleBtn = document.getElementById('toggle-poetry-mode-btn');
    if (poetryToggleBtn) {
      poetryToggleBtn.addEventListener('click', () => {
        creatorIsPoetry = !creatorIsPoetry;
        poetryToggleBtn.classList.toggle('active', creatorIsPoetry);
        poetryToggleBtn.setAttribute('aria-pressed', String(creatorIsPoetry));
        if (creatorTextarea) {
          creatorTextarea.classList.toggle('poetry-active', creatorIsPoetry);
        }
      });
    }

    // Leftmost Avatar Button -> Left Slide-Out Drawer
    const openDrawerBtn = document.getElementById('open-drawer-btn');
    if (openDrawerBtn) openDrawerBtn.addEventListener('click', openLeftDrawer);

    const drawerBackdrop = document.getElementById('drawer-backdrop');
    if (drawerBackdrop) drawerBackdrop.addEventListener('click', closeLeftDrawer);

    const drawerProfileCard = document.getElementById('drawer-profile-card');
    if (drawerProfileCard) {
      drawerProfileCard.addEventListener('click', () => {
        closeLeftDrawer();
        navigateTo('profile');
      });
    }

    document.querySelectorAll('[data-drawer-nav]').forEach((item) => {
      item.addEventListener('click', () => {
        const target = item.getAttribute('data-drawer-nav');
        closeLeftDrawer();
        if (target) navigateTo(target);
      });
    });

    const drawerThemeToggle = document.getElementById('drawer-theme-toggle');
    if (drawerThemeToggle) {
      drawerThemeToggle.addEventListener('click', toggleTheme);
    }

    // Edit Profile Modal Controls
    const closeEditProfileBtn = document.getElementById('close-edit-profile-btn');
    if (closeEditProfileBtn) closeEditProfileBtn.addEventListener('click', closeEditProfileModal);

    const saveProfileBtn = document.getElementById('save-profile-btn');
    if (saveProfileBtn) saveProfileBtn.addEventListener('click', saveProfileChanges);

    const editCountrySelect = document.getElementById('edit-country');
    if (editCountrySelect) {
      editCountrySelect.addEventListener('change', (e) => {
        populateCityDropdown(e.target.value, '');
      });
    }

    const editBio = document.getElementById('edit-bio');
    if (editBio) {
      editBio.addEventListener('input', () => {
        const countEl = document.getElementById('edit-bio-count');
        if (countEl) countEl.textContent = `${toKurdishNumber(editBio.value.length)} / ١٦٠`;
      });
    }

    const editUsernameInput = document.getElementById('edit-username-handle');
    if (editUsernameInput) {
      editUsernameInput.addEventListener('input', () => {
        editUsernameInput.value = editUsernameInput.value.toLowerCase().replace(/[^a-z0-9_]/g, '');
      });
    }

    const avatarUploadBtn = document.getElementById('avatar-upload-btn');
    const avatarTrigger = document.getElementById('avatar-upload-trigger');
    const avatarFileInput = document.getElementById('avatar-file-input');

    if (avatarUploadBtn && avatarFileInput) {
      avatarUploadBtn.addEventListener('click', () => avatarFileInput.click());
    }
    if (avatarTrigger && avatarFileInput) {
      avatarTrigger.addEventListener('click', () => avatarFileInput.click());
    }
    if (avatarFileInput) {
      avatarFileInput.addEventListener('change', (e) => {
        const file = e.target.files && e.target.files[0];
        if (!file) return;
        resizeImageToBase64(file, (base64) => {
          const prev = document.getElementById('edit-profile-avatar-preview');
          if (prev) prev.src = base64;
        });
      });
    }

    // Distraction-Free Reader Controls
    const closeReaderBtn = document.getElementById('close-reader-btn');
    if (closeReaderBtn) closeReaderBtn.addEventListener('click', closeReaderModal);

    const fontIncBtn = document.getElementById('reader-font-inc');
    if (fontIncBtn) {
      fontIncBtn.addEventListener('click', () => {
        activeReaderFontSize = Math.min(30, activeReaderFontSize + 2);
        const work = state.libraryWorks.find((w) => w.id === activeReaderBookId);
        if (work) renderReaderBodyContent(work);
      });
    }

    const fontDecBtn = document.getElementById('reader-font-dec');
    if (fontDecBtn) {
      fontDecBtn.addEventListener('click', () => {
        activeReaderFontSize = Math.max(15, activeReaderFontSize - 2);
        const work = state.libraryWorks.find((w) => w.id === activeReaderBookId);
        if (work) renderReaderBodyContent(work);
      });
    }

    document.querySelectorAll('.surface-dot').forEach((dot) => {
      dot.addEventListener('click', () => {
        const surf = dot.getAttribute('data-surface') || 'white';
        activeReaderSurface = surf;
        const modal = document.getElementById('reader-modal');
        if (modal) {
          modal.classList.remove('surface-white', 'surface-sepia', 'surface-night');
          modal.classList.add(`surface-${surf}`);
        }
        document.querySelectorAll('.surface-dot').forEach((d) => d.classList.remove('active'));
        dot.classList.add('active');
      });
    });

    const readerScriptToggle = document.getElementById('reader-script-toggle');
    if (readerScriptToggle) {
      readerScriptToggle.addEventListener('click', () => {
        const work = state.libraryWorks.find((w) => w.id === activeReaderBookId);
        if (!work) return;
        activeReaderLatinMode = !activeReaderLatinMode;
        const label = document.getElementById('reader-script-label');
        if (label) label.textContent = activeReaderLatinMode ? 'ئارامی' : 'لاتینی';
        renderReaderBodyContent(work);
      });
    }

    const readerCopyBtn = document.getElementById('reader-copy-btn');
    if (readerCopyBtn) {
      readerCopyBtn.addEventListener('click', () => {
        const work = state.libraryWorks.find((w) => w.id === activeReaderBookId);
        if (!work) return;
        const textToCopy = activeReaderLatinMode ? transliterateKurdishToLatin(work.content) : work.content;
        navigator.clipboard.writeText(textToCopy).then(() => {
          showToast('دەقی بەرهەمەکە کۆپی کرا');
        });
      });
    }

    const readerDownloadBtn = document.getElementById('reader-download-btn');
    if (readerDownloadBtn) {
      readerDownloadBtn.addEventListener('click', () => {
        const work = state.libraryWorks.find((w) => w.id === activeReaderBookId);
        if (work) downloadRawTxtFile(work);
      });
    }

    // Submit New Raw Text to Library Modal
    const closeSubmitTextBtn = document.getElementById('close-submit-text-btn');
    if (closeSubmitTextBtn) {
      closeSubmitTextBtn.addEventListener('click', () => {
        document.getElementById('submit-text-modal').classList.add('hidden');
      });
    }

    const saveLibraryTextBtn = document.getElementById('save-library-text-btn');
    if (saveLibraryTextBtn) {
      saveLibraryTextBtn.addEventListener('click', () => {
        const titleEl = document.getElementById('lib-input-title');
        const authorEl = document.getElementById('lib-input-author');
        const catEl = document.getElementById('lib-input-category');
        const contentEl = document.getElementById('lib-input-content');

        const title = titleEl ? titleEl.value.trim() : '';
        const author = authorEl ? authorEl.value.trim() : '';
        const category = catEl ? catEl.value : 'دەقی خاو TXT';
        const content = contentEl ? contentEl.value.trim() : '';

        if (!title || !content) {
          showToast('تکایە ناونیشان و دەقی بەرهەمەکە پڕ بکەرەوە');
          return;
        }

        const newWork = {
          id: 'lib-' + Date.now(),
          featured: false,
          title: title,
          author: author || state.currentUser.name,
          era: 'بەشداریی کراوە · ٢٠٢٥',
          category: category,
          isPoetry: category === 'دیوانی شیعر',
          excerpt: content.split('\n')[0].slice(0, 120),
          content: content
        };

        state.libraryWorks.unshift(newWork);
        saveState();

        if (titleEl) titleEl.value = '';
        if (authorEl) authorEl.value = '';
        if (contentEl) contentEl.value = '';

        document.getElementById('submit-text-modal').classList.add('hidden');
        renderApp();
        showToast('دەقەکەت خرایە ناو کتێبخانەی کراوەی مەکۆ');
      });
    }

    // New Chat / Group Modal
    const closeNewChatBtn = document.getElementById('close-new-chat-btn');
    if (closeNewChatBtn) {
      closeNewChatBtn.addEventListener('click', () => {
        document.getElementById('new-chat-modal').classList.add('hidden');
      });
    }

    const createChatSubmitBtn = document.getElementById('create-chat-submit-btn');
    if (createChatSubmitBtn) {
      createChatSubmitBtn.addEventListener('click', () => {
        const typeEl = document.getElementById('new-chat-type');
        const nameEl = document.getElementById('new-chat-name');
        const msgEl = document.getElementById('new-chat-first-msg');

        const chatType = typeEl ? typeEl.value : 'dm';
        const name = nameEl ? nameEl.value.trim() : '';
        const firstMsg = msgEl ? msgEl.value.trim() : 'سڵاو و ڕێز!';

        if (!name) {
          showToast('تکایە ناوێک بنووسە');
          return;
        }

        const newRoom = {
          id: 'chat-' + Date.now(),
          type: chatType,
          name: name,
          avatar: createSvgAvatar(name.slice(0, 1), chatType === 'group' ? '#312e81' : '#0f766e'),
          status: chatType === 'group' ? '١ ئەندام' : 'چالاکە',
          timestamp: 'ئێستا',
          messages: [
            {
              id: 'm-' + Date.now(),
              sender: 'yours',
              text: firstMsg,
              time: 'ئێستا'
            }
          ]
        };

        state.chats.unshift(newRoom);
        state.chatSubTab = chatType;
        state.activeChatId = newRoom.id;
        saveState();

        if (nameEl) nameEl.value = '';
        if (msgEl) msgEl.value = '';
        document.getElementById('new-chat-modal').classList.add('hidden');
        renderApp();
      });
    }

    // Delegated Events on #app-view
    const appView = document.getElementById('app-view');
    if (!appView) return;

    appView.addEventListener('click', (e) => {
      // 1. Like Button
      const likeBtn = e.target.closest('.like-post-btn');
      if (likeBtn) {
        const postId = likeBtn.getAttribute('data-post-id');
        const post = state.posts.find((p) => p.id === postId);
        if (post) {
          post.liked = !post.liked;
          post.likes += post.liked ? 1 : -1;
          if (post.liked) {
            createNotification('LIKE', {
              actorName: state.currentUser.name,
              actorHandle: state.currentUser.handle,
              actorAvatar: state.currentUser.avatar,
              postId: post.id,
              postExcerpt: post.text.slice(0, 90)
            });
          } else {
            saveState();
          }
          renderApp();
        }
        return;
      }

      // 2. Comment Toggle Button
      const commentBtn = e.target.closest('.comment-toggle-btn');
      if (commentBtn) {
        const postId = commentBtn.getAttribute('data-post-id');
        const post = state.posts.find((p) => p.id === postId);
        if (post) {
          post.commentsOpen = !post.commentsOpen;
          saveState();
          renderApp();
        }
        return;
      }

      // 3. Share Button
      const shareBtn = e.target.closest('.share-post-btn');
      if (shareBtn) {
        const postId = shareBtn.getAttribute('data-post-id');
        const post = state.posts.find((p) => p.id === postId);
        if (post) {
          post.shares = (post.shares || 0) + 1;
          saveState();
          if (navigator.clipboard) {
            navigator.clipboard.writeText(`${post.authorName}:\n${post.text}`);
          }
          renderApp();
          showToast('دەق و بەستەری پۆستەکە کۆپی کرا');
        }
        return;
      }

      // 4. Kurdish Script Converter Button (Aramaic <-> Latin Hawar)
      const scriptBtn = e.target.closest('.script-converter-btn');
      if (scriptBtn && scriptBtn.hasAttribute('data-post-id')) {
        const postId = scriptBtn.getAttribute('data-post-id');
        const post = state.posts.find((p) => p.id === postId);
        if (post) {
          post.latinMode = !post.latinMode;
          saveState();
          renderApp();
        }
        return;
      }

      // 5. Save / Bookmark Button (Syncs to Private Saved Posts in Left Drawer)
      const bookmarkBtn = e.target.closest('.bookmark-post-btn');
      if (bookmarkBtn) {
        const postId = bookmarkBtn.getAttribute('data-post-id');
        const idx = state.savedPostIds.indexOf(postId);
        if (idx === -1) {
          state.savedPostIds.unshift(postId);
          showToast('لە پاشەکەوتکراوەکان هەڵگیرا');
        } else {
          state.savedPostIds.splice(idx, 1);
          showToast('لە پاشەکەوتکراوەکان لادرا');
        }
        saveState();
        renderApp();
        return;
      }

      // 6. Post More Options (...)
      const moreBtn = e.target.closest('.post-more-btn');
      if (moreBtn) {
        const postId = moreBtn.getAttribute('data-post-id');
        const post = state.posts.find((p) => p.id === postId);
        if (post && navigator.clipboard) {
          navigator.clipboard.writeText(post.text);
          showToast('دەقی پۆستەکە کۆپی کرا');
        }
        return;
      }

      // 7. Quick Compose & Header Shortcuts
      if (e.target.closest('#feed-quick-compose-btn')) {
        openCreatorModal();
        return;
      }
      if (e.target.closest('#feed-avatar-profile-trigger')) {
        navigateTo('profile');
        return;
      }
      if (e.target.closest('#header-open-library-btn')) {
        navigateTo('library');
        return;
      }

      // 8. Notifications Filter Tabs & Actions
      const notifTab = e.target.closest('.notif-filter-tab');
      if (notifTab) {
        state.notifFilter = notifTab.getAttribute('data-filter') || 'هەموو';
        saveState();
        renderApp();
        return;
      }

      if (e.target.closest('#mark-all-notifs-read-btn')) {
        state.notifications.forEach((n) => (n.read = true));
        saveState();
        renderApp();
        showToast('هەموو ئاگادارییەکان خوێندرانەوە');
        return;
      }

      const followBackBtn = e.target.closest('.follow-back-pill');
      if (followBackBtn) {
        e.stopPropagation();
        const notifId = followBackBtn.getAttribute('data-follow-notif-id');
        const notif = state.notifications.find((n) => n.id === notifId && n.type === 'FOLLOW');
        if (notif) {
          notif.isFollowingBack = !notif.isFollowingBack;
          notif.read = true;
          state.currentUser.following += notif.isFollowingBack ? 1 : -1;
          saveState();
          renderApp();
        }
        return;
      }

      const notifRow = e.target.closest('.notif-row');
      if (notifRow) {
        const notifId = notifRow.getAttribute('data-notif-id');
        const targetPostId = notifRow.getAttribute('data-target-post');
        const expandComment = notifRow.getAttribute('data-expand-comment') === 'true';
        const notif = state.notifications.find((n) => n.id === notifId);
        if (notif) notif.read = true;

        if (targetPostId) {
          const targetPost = state.posts.find((p) => p.id === targetPostId);
          if (targetPost && expandComment) {
            targetPost.commentsOpen = true;
          }
          state.activeTab = 'feed';
          saveState();
          renderApp();
          setTimeout(() => {
            const postEl = document.getElementById(`post-dom-${targetPostId}`);
            if (postEl) postEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }, 80);
        } else {
          saveState();
          renderApp();
        }
        return;
      }

      // 9. Profile View Actions
      if (e.target.closest('#open-edit-profile-btn') || e.target.closest('#profile-top-edit-btn')) {
        openEditProfileModal();
        return;
      }

      if (e.target.closest('#share-profile-btn')) {
        if (navigator.clipboard) {
          navigator.clipboard.writeText(`https://meko.kurd/@${state.currentUser.handle}`);
        }
        showToast(`بەستەری پڕۆفایلی @${state.currentUser.handle} کۆپی کرا`);
        return;
      }

      const profileTabBtn = e.target.closest('.profile-feed-tab');
      if (profileTabBtn) {
        state.profileTab = profileTabBtn.getAttribute('data-profile-tab') || 'all';
        saveState();
        renderApp();
        return;
      }

      // 10. Saved & Settings Back Buttons
      if (e.target.closest('#saved-back-home-btn') || e.target.closest('#settings-back-home-btn')) {
        navigateTo('feed');
        return;
      }

      // 11. Chat View Actions
      const chatTabBtn = e.target.closest('.chat-tab-btn');
      if (chatTabBtn) {
        state.chatSubTab = chatTabBtn.getAttribute('data-chat-tab') || 'dm';
        saveState();
        renderApp();
        return;
      }

      const chatItem = e.target.closest('.chat-list-item');
      if (chatItem) {
        state.activeChatId = chatItem.getAttribute('data-chat-id');
        saveState();
        renderApp();
        return;
      }

      if (e.target.closest('#chat-room-back-btn')) {
        state.activeChatId = null;
        saveState();
        renderApp();
        return;
      }

      if (e.target.closest('#open-new-chat-modal-btn')) {
        document.getElementById('new-chat-modal').classList.remove('hidden');
        return;
      }

      // 12. Library Archive Actions
      const libCatPill = e.target.closest('.library-cat-pill');
      if (libCatPill) {
        state.libraryCategory = libCatPill.getAttribute('data-lib-cat') || 'هەموو';
        saveState();
        renderApp();
        return;
      }

      const openReaderTrigger = e.target.closest('.open-reader-btn');
      if (openReaderTrigger) {
        const workId = openReaderTrigger.getAttribute('data-work-id');
        openReaderModal(workId);
        return;
      }

      const downloadTxtTrigger = e.target.closest('.download-txt-btn');
      if (downloadTxtTrigger) {
        const workId = downloadTxtTrigger.getAttribute('data-work-id');
        const work = state.libraryWorks.find((w) => w.id === workId);
        if (work) downloadRawTxtFile(work);
        return;
      }

      if (e.target.closest('#open-submit-text-modal-btn')) {
        document.getElementById('submit-text-modal').classList.remove('hidden');
        return;
      }

      // 13. Settings Actions & Self-Test Notification Buttons
      if (e.target.closest('#settings-theme-toggle-btn')) {
        toggleTheme();
        renderApp();
        return;
      }

      const fontScaleBtn = e.target.closest('.font-scale-btn');
      if (fontScaleBtn) {
        const scale = parseFloat(fontScaleBtn.getAttribute('data-scale') || '1');
        applyFontScale(scale);
        renderApp();
        showToast('قەبارەی فۆنتی خوێندنەوە نوێ کرایەوە');
        return;
      }

      if (e.target.closest('#test-notif-like-btn')) {
        const target = state.posts[0];
        createNotification('LIKE', {
          actorName: 'ئارام گەرمیانی',
          actorHandle: 'aram_garmyani',
          actorAvatar: createSvgAvatar('ئـ', '#dc2626'),
          postId: target ? target.id : 'post-1',
          postExcerpt: target ? target.text.slice(0, 80) : ''
        });
        showToast('ئاگاداریی نوێی پەسەندکردن دروست کرا');
        return;
      }

      if (e.target.closest('#test-notif-comment-btn')) {
        const target = state.posts[0];
        createNotification('COMMENT', {
          actorName: 'هێمن موکریانی',
          actorHandle: 'hemin_mukriyani',
          actorAvatar: createSvgAvatar('هـ', '#2563eb'),
          postId: target ? target.id : 'post-1',
          postExcerpt: target ? target.text.slice(0, 80) : '',
          commentText: 'زۆر نایابە، زمان و وێنەیەکی شیعریی بێوێنەیە!'
        });
        showToast('ئاگاداریی نوێی لێدوان دروست کرا');
        return;
      }

      if (e.target.closest('#test-notif-follow-btn')) {
        createNotification('FOLLOW', {
          actorName: 'ژوان سلێمانی',
          actorHandle: 'zhwan_suli',
          actorAvatar: createSvgAvatar('ژ', '#059669'),
          isFollowingBack: false
        });
        showToast('ئاگاداریی نوێی شوێنکەوتن دروست کرا');
        return;
      }

      if (e.target.closest('#reset-demo-data-btn')) {
        localStorage.removeItem(STORAGE_KEY);
        state = getInitialSeedState();
        saveState();
        navigateTo('feed');
        showToast('داتای سەرەتایی گەڕێندرایەوە');
        return;
      }
    });

    // Delegated Input Events inside #app-view (Library Search + Claude Auto-Expanding Chat Input)
    appView.addEventListener('input', (e) => {
      if (e.target.id === 'library-search-input') {
        state.librarySearch = e.target.value;
        const pos = e.target.selectionStart;
        renderApp();
        const newSearchInput = document.getElementById('library-search-input');
        if (newSearchInput) {
          newSearchInput.focus();
          try {
            newSearchInput.setSelectionRange(pos, pos);
          } catch (_) {}
        }
        return;
      }

      if (e.target.id === 'claude-chat-input') {
        const textarea = e.target;
        const sendBtn = document.getElementById('claude-send-btn');
        textarea.style.height = 'auto';
        textarea.style.height = Math.min(96, textarea.scrollHeight) + 'px';
        if (sendBtn) {
          const hasText = textarea.value.trim().length > 0;
          sendBtn.classList.toggle('visible', hasText);
        }
      }
    });

    // Enter key inside Claude Chat Input submits on Enter (without Shift)
    appView.addEventListener('keydown', (e) => {
      if (e.target.id === 'claude-chat-input' && e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        const form = document.getElementById('chat-send-form');
        if (form) form.requestSubmit();
      }
    });

    // Delegated Form Submissions inside #app-view (Inline Comments + Chat Room Messages)
    appView.addEventListener('submit', (e) => {
      const commentForm = e.target.closest('.comment-submit-form');
      if (commentForm) {
        e.preventDefault();
        const postId = commentForm.getAttribute('data-post-id');
        const input = commentForm.querySelector('input[name="commentText"]');
        const text = input ? input.value.trim() : '';
        if (!text) return;

        const post = state.posts.find((p) => p.id === postId);
        if (post) {
          post.comments.push({
            id: 'c-' + Date.now(),
            authorName: state.currentUser.name,
            authorAvatar: state.currentUser.avatar,
            text: text,
            timestamp: 'ئێستا'
          });

          createNotification('COMMENT', {
            actorName: state.currentUser.name,
            actorHandle: state.currentUser.handle,
            actorAvatar: state.currentUser.avatar,
            postId: post.id,
            postExcerpt: post.text.slice(0, 80),
            commentText: text
          });

          renderApp();
        }
        return;
      }

      if (e.target.id === 'chat-send-form') {
        e.preventDefault();
        const input = document.getElementById('claude-chat-input');
        const text = input ? input.value.trim() : '';
        if (!text || !state.activeChatId) return;

        const room = state.chats.find((c) => c.id === state.activeChatId);
        if (room) {
          room.messages.push({
            id: 'm-' + Date.now(),
            sender: 'yours',
            text: text,
            time: 'ئێستا'
          });
          room.timestamp = 'ئێستا';
          saveState();
          renderApp();
        }
      }
    });
  }

  // ====================================================================
  // BOOTSTRAP APPLICATION
  // ====================================================================
  document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    updateDynamicJsonLd(state);
    bindEvents();
    renderApp();
  });
})();
