/**
 * ============================================================================
 * MEKO (مەکۆ) — CORE APPLICATION ARCHITECTURE & STATE ENGINE
 * Phase 4 of 4 · File: app.js
 * ============================================================================
 * Features:
 * 1. Persistent State Management (localStorage: meko_state_v2) + Rich Seed Data
 * 2. View Router, 5-Icon Glass Bottom Bar & Left Slide-Out Drawer Controller
 * 3. Dynamic Post & Classical Poetry Renderer + Live Script Converter (Hawar)
 * 4. Inline Comments System, Likes, Bookmarks, Share & Search Filter
 * 5. Strictly-Typed Notifications Engine (LIKE, COMMENT, FOLLOW)
 * 6. Hybrid Messenger-Style Chat (DMs + Groups + Auto-Expanding Input + Replies)
 * 7. Profile Customization (Canvas Avatar Upload + Unified Kurdistan Cities)
 * 8. Open Kurdish AI Corpus Exporter (.JSONL) & Live Schema.org JSON-LD Sync
 * ============================================================================
 */

(function () {
  'use strict';

  const STORAGE_KEY = 'meko_state_v2';

  /* ==========================================================================
   * 1. DETERMINISTIC INLINE SVG AVATAR GENERATOR (100% OFFLINE/ONLINE SAFE)
   * ========================================================================== */

  /**
   * Generates a crisp SVG Data-URI avatar with Kurdish initials and gradient.
   * @param {string} label
   * @param {string} colorStart
   * @param {string} colorEnd
   * @returns {string}
   */
  function createSvgAvatar(label, colorStart, colorEnd) {
    const initial = (label || 'م').trim().charAt(0);
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
      <defs>
        <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${colorStart}"/>
          <stop offset="100%" stop-color="${colorEnd}"/>
        </linearGradient>
      </defs>
      <rect width="120" height="120" rx="60" fill="url(#g)"/>
      <text x="60" y="76" font-family="Vazirmatn, Amiri, sans-serif" font-size="52" font-weight="800" fill="#ffffff" text-anchor="middle">${initial}</text>
    </svg>`;
    return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
  }

  /* ==========================================================================
   * 2. DEFAULT SEED DATA (AUTHENTIC KURDISH LITERARY & LINGUISTIC CORPUS)
   * ========================================================================== */

  function createSeedState() {
    const avatars = {
      wali: createSvgAvatar('و', '#0084ff', '#1e40af'),
      dilara: createSvgAvatar('د', '#db2777', '#831843'),
      aro: createSvgAvatar('ئ', '#059669', '#064e3b'),
      hemin: createSvgAvatar('ه', '#7c3aed', '#3b0764'),
      rojin: createSvgAvatar('ڕ', '#ea580c', '#7c2d12'),
      groupLang: createSvgAvatar('ز', '#0284c7', '#0f172a'),
      groupPoetry: createSvgAvatar('ش', '#4f46e5', '#1e1b4b')
    };

    return {
      theme: 'light',
      activeView: 'home',
      previousView: 'home',
      activeFeedTab: 'for-you',
      activeProfileTab: 'posts',
      activeNotifFilter: 'all',
      activeChatFilter: 'all',
      activeChatId: null,
      viewingUserHandle: 'wali_kurd',
      feedSearchQuery: '',

      preferences: {
        notifLikes: true,
        notifReplies: true,
        notifFollows: true
      },

      currentUser: {
        displayName: 'والی',
        username: 'wali_kurd',
        avatar: avatars.wali,
        bio: 'تەلارسازیی وشە و خەیاڵ؛ هەوڵێک بۆ پاراستن و بووژاندنەوەی زمانی ڕەسەنی کوردی و شیعری کلاسیک لە جیهانی دیجیتاڵیدا.',
        country: 'کوردستان',
        city: 'کەرکووک',
        joined: '٢٠٢٦',
        verified: true,
        followingCount: 214,
        followersCount: 1280
      },

      users: {
        wali_kurd: {
          displayName: 'والی',
          username: 'wali_kurd',
          avatar: avatars.wali,
          bio: 'تەلارسازیی وشە و خەیاڵ؛ هەوڵێک بۆ پاراستن و بووژاندنەوەی زمانی ڕەسەنی کوردی و شیعری کلاسیک لە جیهانی دیجیتاڵیدا.',
          country: 'کوردستان',
          city: 'کەرکووک',
          joined: '٢٠٢٦',
          verified: true,
          followingCount: 214,
          followersCount: 1280,
          isFollowing: false
        },
        dilara_lit: {
          displayName: 'دلارا',
          username: 'dilara_lit',
          avatar: avatars.dilara,
          bio: 'ئاوێنەی ئەدەبیات و شیعری کلاسیکی کوردی و فارسی. جوانی لە نێوان دێڕەکاندا دەژیت.',
          country: 'کوردستان',
          city: 'سلێمانی',
          joined: '٢٠٢٦',
          verified: true,
          followingCount: 185,
          followersCount: 3420,
          isFollowing: true
        },
        aro_linguistic: {
          displayName: 'ئارۆ کامەران',
          username: 'aro_linguistic',
          avatar: avatars.aro,
          bio: 'توێژەری زمانەوانی و پرۆسێسکردنی زمانی سروشتیی کوردی (Kurdish NLP & Corpus Linguistics).',
          country: 'کوردستان',
          city: 'هەولێر',
          joined: '٢٠٢٦',
          verified: true,
          followingCount: 310,
          followersCount: 890,
          isFollowing: true
        },
        hemin_mukriyani: {
          displayName: 'کاروان موکریانی',
          username: 'hemin_mukriyani',
          avatar: avatars.hemin,
          bio: 'عاشقی وشەی ڕەسەن و فەرهەنگی زاراوەکانی زمانی کوردی لە مەهابادەوە تا ئامەد.',
          country: 'کوردستان',
          city: 'مەهاباد',
          joined: '٢٠٢٦',
          verified: false,
          followingCount: 142,
          followersCount: 640,
          isFollowing: true
        },
        rojin_amed: {
          displayName: 'ڕۆژین دیاربەکر',
          username: 'rojin_amed',
          avatar: avatars.rojin,
          bio: 'خوێنەری فەلسەفەی جوانیناسی و کۆکەرەوەی دەستنووس و بەیتە کۆنەکانی کوردستان.',
          country: 'کوردستان',
          city: 'ئامەد',
          joined: '٢٠٢٦',
          verified: false,
          followingCount: 275,
          followersCount: 1120,
          isFollowing: false
        }
      },

      posts: [
        {
          id: 'post_101',
          authorName: 'والی',
          authorHandle: 'wali_kurd',
          authorAvatar: avatars.wali,
          verified: true,
          isPoetry: true,
          text: 'لە میحرابی خەیاڵی تۆدا دڵم هەر سوجدە دەبات\nبە تیری غەمزەکەت قوربان، برینم قەت شەفا نادات\nشەوانی تار و بێدەنگیم بە یادی ڕووت ڕۆشن بوو\nکەچی چەرخی فەلەک هەرگیز بە کەیفی دڵ خولێ نادات',
          media: [],
          likes: 94,
          likedByMe: true,
          timestamp: '٢ کاتژمێر لەمەوبەر',
          createdAt: '2026-11-05T19:00:00Z',
          scriptMode: 'arab',
          comments: [
            {
              id: 'c_1',
              authorName: 'دلارا',
              authorHandle: 'dilara_lit',
              text: 'دەست و خامەت ڕەنگین بێت، ڕۆحی قوتابخانەی بابان لەم دێڕانەدا دەدرەوشێتەوە.',
              time: '١ کاتژمێر لەمەوبەر'
            },
            {
              id: 'c_2',
              authorName: 'کاروان موکریانی',
              authorHandle: 'hemin_mukriyani',
              text: 'کێش و قافیەیەکی زۆر پتەو و ڕەوانە، هەربژیت.',
              time: '٤٥ خولەک لەمەوبەر'
            }
          ]
        },
        {
          id: 'post_102',
          authorName: 'والی',
          authorHandle: 'wali_kurd',
          authorAvatar: avatars.wali,
          verified: true,
          isPoetry: false,
          text: 'وشەی «داڤین» وەک زاراوەیەکی ڕەسەنی کوردی لە لێکدانی (دانا + ئەڤین) داتاشراوە، کە بە واتای «خۆشەویستیی دانایی و حیکمەت» دێت؛ ڕێک هاوتای ڕەسەنی وشەی (Philosophy) لە زمانی یۆنانیدا. کاتی ئەوە هاتووە لە نووسینە فەلسەفی و ئەکادیمییەکانماندا زاراوەی خۆماڵیی کوردی ببووژێنینەوە.',
          media: [],
          likes: 142,
          likedByMe: true,
          timestamp: '٥ کاتژمێر لەمەوبەر',
          createdAt: '2026-11-05T16:00:00Z',
          scriptMode: 'arab',
          comments: [
            {
              id: 'c_3',
              authorName: 'ئارۆ کامەران',
              authorHandle: 'aro_linguistic',
              text: 'داڕشتنێکی مۆرفۆلۆژیی یەکجار زیرەکانەیە! لە داتاسێتی زمانەوانیی مەکۆدا تۆمارمان کرد.',
              time: '٣ کاتژمێر لەمەوبەر'
            }
          ]
        },
        {
          id: 'post_103',
          authorName: 'دلارا',
          authorHandle: 'dilara_lit',
          authorAvatar: avatars.dilara,
          verified: true,
          isPoetry: true,
          text: 'بە ئاوی تێغی خۆت مەحوی کە تەشریفی حەیاتت دا\nلە سەر خاکی دەرت سەد جارە قوربانی سەری تۆ بم\nئەگەرچی کوشتمی عەشقت، بەڵام زیندووی ئەبەد ماوم\nکە من شەهیدی شمشێری برۆی پەیوەستەیی تۆ بم',
          media: [],
          likes: 218,
          likedByMe: false,
          timestamp: 'دوێنێ',
          createdAt: '2026-11-04T20:30:00Z',
          scriptMode: 'arab',
          comments: []
        },
        {
          id: 'post_104',
          authorName: 'ئارۆ کامەران',
          authorHandle: 'aro_linguistic',
          authorAvatar: avatars.aro,
          verified: true,
          isPoetry: false,
          text: 'گرنگیی پلاتفۆرمی «مەکۆ» لەوەدایە کە هەموو دەقێک ڕاستەوخۆ بە ستانداردی یونیکۆد (UTF-8) پاکسازی دەکات و هاوکات وێنە لاتینییەکەی (Hawar)یشی لەگەڵدا بەرهەم دەهێنێت. ئەمە گەنجینەیەکی زێڕینە بۆ ڕاهێنانی مۆدێلە گەورەکانی ژیریی دەستکردی کوردی.',
          media: [],
          likes: 87,
          likedByMe: true,
          timestamp: '٢ ڕۆژ لەمەوبەر',
          createdAt: '2026-11-03T14:15:00Z',
          scriptMode: 'arab',
          comments: []
        },
        {
          id: 'post_105',
          authorName: 'کاروان موکریانی',
          authorHandle: 'hemin_mukriyani',
          authorAvatar: avatars.hemin,
          verified: false,
          isPoetry: false,
          text: 'لە لێکۆڵینەوەی چاوگەکانی زمانی کوردیدا، کۆمەڵێک چاوگ هەن کە لە ڕووی واتایی و ڕێزمانییەوە شێوەی داخوازایی (ئەمر) و هیواخوازایی وەرناگرن، چونکە ڕوودانیان لە دەرەوەی ئیرادەی ڕاستەوخۆی بکەرە. کۆکردنەوەی ئەم چاوگانە لە هەموو شێوەزارەکاندا پڕۆژەیەکی مێژووییە.',
          media: [],
          likes: 65,
          likedByMe: false,
          timestamp: '٣ ڕۆژ لەمەوبەر',
          createdAt: '2026-11-02T11:00:00Z',
          scriptMode: 'arab',
          comments: []
        },
        {
          id: 'post_106',
          authorName: 'ڕۆژین دیاربەکر',
          authorHandle: 'rojin_amed',
          authorAvatar: avatars.rojin,
          verified: false,
          isPoetry: true,
          text: 'شەو هات و ئەمن مەستی خەیاڵاتی کەسێکم\nمەشغووڵی نەفەس گرتنی موشکین نەفەسێکم\nلەم حوجرە، لەبەر پەنجەرە کەوتووم و دەخوێنم\nبێچارە تەماشاکەری مانگی قەفەسێکم',
          media: [],
          likes: 176,
          likedByMe: true,
          timestamp: '٤ ڕۆژ لەمەوبەر',
          createdAt: '2026-11-01T21:40:00Z',
          scriptMode: 'arab',
          comments: []
        }
      ],

      savedPostIds: ['post_101', 'post_103', 'post_104'],

      notifications: [
        {
          id: 'notif_1',
          type: 'LIKE',
          actorName: 'دلارا',
          actorHandle: 'dilara_lit',
          actorAvatar: avatars.dilara,
          postId: 'post_101',
          postExcerpt: 'لە میحرابی خەیاڵی تۆدا دڵم هەر سوجدە دەبات...',
          commentText: null,
          isFollowingBack: true,
          timestamp: '١٥ خولەک لەمەوبەر',
          read: false
        },
        {
          id: 'notif_2',
          type: 'COMMENT',
          actorName: 'ئارۆ کامەران',
          actorHandle: 'aro_linguistic',
          actorAvatar: avatars.aro,
          postId: 'post_102',
          postExcerpt: 'وشەی «داڤین» وەک زاراوەیەکی ڕەسەنی کوردی...',
          commentText: 'داڕشتنێکی مۆرفۆلۆژیی یەکجار زیرەکانەیە! لە داتاسێتی زمانەوانیی مەکۆدا تۆمارمان کرد.',
          isFollowingBack: true,
          timestamp: '١ کاتژمێر لەمەوبەر',
          read: false
        },
        {
          id: 'notif_3',
          type: 'FOLLOW',
          actorName: 'ڕۆژین دیاربەکر',
          actorHandle: 'rojin_amed',
          actorAvatar: avatars.rojin,
          postId: null,
          postExcerpt: null,
          commentText: null,
          isFollowingBack: false,
          timestamp: '٣ کاتژمێر لەمەوبەر',
          read: false
        },
        {
          id: 'notif_4',
          type: 'COMMENT',
          actorName: 'کاروان موکریانی',
          actorHandle: 'hemin_mukriyani',
          actorAvatar: avatars.hemin,
          postId: 'post_101',
          postExcerpt: 'لە میحرابی خەیاڵی تۆدا دڵم هەر سوجدە دەبات...',
          commentText: 'کێش و قافیەیەکی زۆر پتەو و ڕەوانە، هەربژیت.',
          isFollowingBack: true,
          timestamp: '٥ کاتژمێر لەمەوبەر',
          read: true
        },
        {
          id: 'notif_5',
          type: 'LIKE',
          actorName: 'ڕۆژین دیاربەکر',
          actorHandle: 'rojin_amed',
          actorAvatar: avatars.rojin,
          postId: 'post_102',
          postExcerpt: 'وشەی «داڤین» وەک زاراوەیەکی ڕەسەنی کوردی...',
          commentText: null,
          isFollowingBack: false,
          timestamp: 'دوێنێ',
          read: true
        },
        {
          id: 'notif_6',
          type: 'FOLLOW',
          actorName: 'کاروان موکریانی',
          actorHandle: 'hemin_mukriyani',
          actorAvatar: avatars.hemin,
          postId: null,
          postExcerpt: null,
          commentText: null,
          isFollowingBack: true,
          timestamp: '٢ ڕۆژ لەمەوبەر',
          read: true
        }
      ],

      chats: [
        {
          id: 'chat_1',
          type: 'dm',
          name: 'دلارا',
          handle: 'dilara_lit',
          avatar: avatars.dilara,
          online: true,
          statusText: 'ئێستا لەسەر هێڵە',
          unread: 1,
          messages: [
            {
              id: 'm_101',
              sender: 'theirs',
              text: 'سڵاو والی، ئەو غەزەلە نوێیەت کە بڵاوت کردەوە زۆر کاریگەر بوو.',
              time: '٠٩:٣٠ د.ن'
            },
            {
              id: 'm_102',
              sender: 'mine',
              text: 'زۆر سوپاس دلارا خان، خۆشحاڵم کە بە دڵت بووە. بۆ ڤیدیۆی داهاتووی کەناڵەکەش ئامادەی دەکەین.',
              time: '٠٩:٣٤ د.ن'
            },
            {
              id: 'm_103',
              sender: 'theirs',
              text: 'بەدڵنیاییەوە! ئاوازێکی عود و نەی زۆر هێمنم بۆ هەڵبژاردووە.',
              time: '٠٩:٣٦ د.ن'
            }
          ]
        },
        {
          id: 'chat_2',
          type: 'group',
          name: 'ئەنجومەنی زمان و ژیریی دەستکردی کوردی',
          handle: 'kurdish_nlp_group',
          avatar: avatars.groupLang,
          online: true,
          statusText: '٤٨ ئەندام · ١٢ لەسەر هێڵن',
          unread: 2,
          messages: [
            {
              id: 'm_201',
              sender: 'theirs',
              text: 'ئارۆ: هاوڕێیان فایلی JSONLی پۆستەکانی مەکۆم تاقیکردەوە، هەموو دەقەکان بە بێ هیچ هەڵەیەکی یونیکۆد ئامادەن.',
              time: '٠٨:١٥ د.ن'
            },
            {
              id: 'm_202',
              sender: 'mine',
              text: 'ئامانجی سەرەکیمان ئەوەیە مەکۆ ببێتە سەرچاوەیەکی کراوە و خاوێن بۆ هەموو مۆدێلەکانی زمانی کوردی.',
              time: '٠٨:٢٠ د.ن'
            },
            {
              id: 'm_203',
              sender: 'theirs',
              text: 'کاروان: بزوێنەری گۆڕینی ڕێنووسی ئارامی بۆ لاتینیی هاوار زۆر بە وردی بزرۆکەکان دەناسێتەوە!',
              time: '٠٨:٢٥ د.ن'
            }
          ]
        },
        {
          id: 'chat_3',
          type: 'dm',
          name: 'ئارۆ کامەران',
          handle: 'aro_linguistic',
          avatar: avatars.aro,
          online: true,
          statusText: 'ئێستا لەسەر هێڵە',
          unread: 0,
          messages: [
            {
              id: 'm_301',
              sender: 'theirs',
              text: 'کاك والی، پەڕگەی فەرهەنگی چاوگە کوردییەکان گەیشتە کوێ؟',
              time: 'دوێنێ'
            },
            {
              id: 'm_302',
              sender: 'mine',
              text: 'بەشی سۆرانی و کەڵهوڕی تەواو بووە، ئێستا سەرقاڵی بەراوردکردنی شێوەزاری هەورامی و کورمانجیم.',
              time: 'دوێنێ'
            }
          ]
        },
        {
          id: 'chat_4',
          type: 'group',
          name: 'دیوانی شیعری کلاسیک و قوتابخانەی بابان',
          handle: 'baban_poetry_club',
          avatar: avatars.groupPoetry,
          online: true,
          statusText: '١٢٠ ئەندام · کۆڕی ئەدەبی',
          unread: 0,
          messages: [
            {
              id: 'm_401',
              sender: 'theirs',
              text: 'ڕۆژین: شەوی هەینی داهاتوو خوێندنەوەیەکمان دەبێت لەسەر وێنەی شیعری لە دیوانی نالی و مەحویدا.',
              time: '٢ ڕۆژ لەمەوبەر'
            }
          ]
        },
        {
          id: 'chat_5',
          type: 'dm',
          name: 'کاروان موکریانی',
          handle: 'hemin_mukriyani',
          avatar: avatars.hemin,
          online: false,
          statusText: 'دوایین دەرکەوتن ٣ کاتژمێر لەمەوبەر',
          unread: 0,
          messages: [
            {
              id: 'm_501',
              sender: 'theirs',
              text: 'سڵاو بۆ کەرکووکی دڵ و هەموو دۆستانی زمان و ئەدەب.',
              time: '٣ ڕۆژ لەمەوبەر'
            }
          ]
        }
      ]
    };
  }

  /* ==========================================================================
   * 3. STATE MANAGEMENT & PERSISTENCE
   * ========================================================================== */

  let state = loadState();
  let creatorDraft = {
    isPoetry: false,
    media: []
  };
  let pendingAvatarDataUrl = null;

  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && parsed.currentUser && Array.isArray(parsed.posts)) {
          return parsed;
        }
      }
    } catch (_) {
      // Fallback to seed state if storage is corrupted
    }
    const seed = createSeedState();
    saveState(seed);
    return seed;
  }

  function saveState(customState) {
    const target = customState || state;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(target));
    } catch (_) {
      // Ignore quota exceeded errors gracefully
    }
    updateStructuredDataJsonLd(target);
  }

  /* ==========================================================================
   * 4. DYNAMIC SCHEMA.ORG JSON-LD SYNC (FOR AI CRAWLERS & SEARCH ENGINES)
   * ========================================================================== */

  function updateStructuredDataJsonLd(currentState) {
    const scriptEl = document.getElementById('meko-jsonld');
    if (!scriptEl || !currentState) return;

    const blogPosts = (currentState.posts || []).map(function (post) {
      const latinVersion = window.kurdishToLatin
        ? window.kurdishToLatin(post.text)
        : '';

      return {
        '@type': 'SocialMediaPosting',
        '@id': 'https://meko.kurd/post/' + post.id,
        headline: post.isPoetry ? 'شیعری کوردی — ' + post.authorName : 'پۆستی کوردی — ' + post.authorName,
        inLanguage: 'ku',
        genre: post.isPoetry ? 'Poetry' : 'Prose',
        articleBody: post.text,
        alternateName: latinVersion,
        datePublished: post.createdAt || new Date().toISOString(),
        author: {
          '@type': 'Person',
          name: post.authorName,
          alternateName: '@' + post.authorHandle
        },
        interactionStatistic: [
          {
            '@type': 'InteractionCounter',
            interactionType: 'https://schema.org/LikeAction',
            userInteractionCount: post.likes || 0
          },
          {
            '@type': 'InteractionCounter',
            interactionType: 'https://schema.org/CommentAction',
            userInteractionCount: Array.isArray(post.comments) ? post.comments.length : 0
          }
        ]
      };
    });

    const schemaPayload = {
      '@context': 'https://schema.org',
      '@type': 'DataFeed',
      name: 'مەکۆ | Meko Open Kurdish Linguistic & Literary Corpus',
      inLanguage: 'ku',
      encodingFormat: 'UTF-8',
      license: 'https://creativecommons.org/licenses/by/4.0/',
      creator: {
        '@type': 'Person',
        name: currentState.currentUser.displayName,
        homeLocation: currentState.currentUser.country + '، ' + currentState.currentUser.city
      },
      dataFeedElement: blogPosts
    };

    scriptEl.textContent = JSON.stringify(schemaPayload, null, 2);
  }

  /* ==========================================================================
   * 5. ICON REFRESH & TOAST NOTIFICATION HELPER
   * ========================================================================== */

  function refreshIcons(root) {
    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      window.lucide.createIcons({
        root: root || document,
        attrs: { 'stroke-width': 1.85 }
      });
    }
  }

  function showToast(message, iconName) {
    const region = document.getElementById('toast-region');
    const tpl = document.getElementById('tpl-toast');
    if (!region || !tpl) return;

    const clone = tpl.content.cloneNode(true);
    const toastEl = clone.querySelector('.toast');
    const iconEl = clone.querySelector('.toast-icon');
    const msgEl = clone.querySelector('.toast-message');

    if (iconEl && iconName) {
      iconEl.setAttribute('data-lucide', iconName);
    }
    if (msgEl) {
      msgEl.textContent = message;
    }

    region.appendChild(clone);
    refreshIcons(region);

    setTimeout(function () {
      if (toastEl) {
        toastEl.classList.add('is-leaving');
        setTimeout(function () {
          if (toastEl.parentNode) toastEl.parentNode.removeChild(toastEl);
        }, 220);
      }
    }, 2800);
  }

  /* ==========================================================================
   * 6. THEME ENGINE (LIGHT / TRUE OLED DARK / SYSTEM)
   * ========================================================================== */

  function applyTheme(mode) {
    state.theme = mode || 'light';
    saveState();

    const prefersDark =
      window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const isDark = mode === 'dark' || (mode === 'system' && prefersDark);

    const html = document.documentElement;
    const body = document.body;

    html.classList.toggle('dark', isDark);
    html.classList.toggle('light', !isDark);
    body.classList.toggle('dark', isDark);
    body.classList.toggle('light', !isDark);

    const metaTheme = document.getElementById('meta-theme-color');
    if (metaTheme) {
      metaTheme.setAttribute('content', isDark ? '#09090b' : '#ffffff');
    }

    const sidebarToggle = document.getElementById('theme-toggle');
    const sidebarLabel = document.getElementById('theme-toggle-label');
    if (sidebarToggle) {
      sidebarToggle.setAttribute('aria-checked', isDark ? 'true' : 'false');
    }
    if (sidebarLabel) {
      sidebarLabel.textContent = isDark ? 'دۆخی تاریک (چالاکە)' : 'دۆخی تاریک';
    }

    const radios = document.querySelectorAll('input[name="theme"]');
    radios.forEach(function (radio) {
      radio.checked = radio.value === state.theme;
    });
  }

  /* ==========================================================================
   * 7. LEFT SLIDE-OUT SIDEBAR DRAWER CONTROLLER
   * ========================================================================== */

  function openSidebarDrawer() {
    const drawer = document.getElementById('sidebar-drawer');
    const menuBtn = document.getElementById('nav-menu');
    if (!drawer) return;

    drawer.setAttribute('data-state', 'open');
    drawer.setAttribute('aria-hidden', 'false');
    drawer.classList.remove('drawer-closed');
    drawer.classList.add('drawer-open');
    document.body.classList.add('drawer-lock');

    if (menuBtn) menuBtn.setAttribute('aria-expanded', 'true');
  }

  function closeSidebarDrawer() {
    const drawer = document.getElementById('sidebar-drawer');
    const menuBtn = document.getElementById('nav-menu');
    if (!drawer) return;

    drawer.setAttribute('data-state', 'closed');
    drawer.setAttribute('aria-hidden', 'true');
    drawer.classList.remove('drawer-open');
    drawer.classList.add('drawer-closed');
    document.body.classList.remove('drawer-lock');

    if (menuBtn) menuBtn.setAttribute('aria-expanded', 'false');
  }

  function toggleSidebarDrawer() {
    const drawer = document.getElementById('sidebar-drawer');
    if (!drawer) return;
    if (drawer.getAttribute('data-state') === 'open') {
      closeSidebarDrawer();
    } else {
      openSidebarDrawer();
    }
  }

  /* ==========================================================================
   * 8. VIEW ROUTER & 5-ICON GLASS BOTTOM BAR SYNC
   * ========================================================================== */

  function navigateTo(viewName, options) {
    const opts = options || {};
    closeSidebarDrawer();

    if (viewName === 'profile' && !opts.preserveUser) {
      state.viewingUserHandle = state.currentUser.username;
    }

    if (state.activeView !== viewName && state.activeView !== 'chat-room') {
      state.previousView = state.activeView;
    }
    state.activeView = viewName;
    saveState();

    const views = document.querySelectorAll('.app-view');
    views.forEach(function (sec) {
      const isMatch = sec.getAttribute('data-view') === viewName;
      if (sec.id === 'view-chat-room') {
        sec.classList.toggle('hidden', !isMatch);
        sec.classList.toggle('flex', isMatch);
      } else {
        sec.classList.toggle('hidden', !isMatch);
      }
    });

    // Sync Bottom Bar Active State
    const bottomButtons = document.querySelectorAll('#bottom-bar button[data-nav-target]');
    bottomButtons.forEach(function (btn) {
      const target = btn.getAttribute('data-nav-target');
      if (target === viewName) {
        btn.setAttribute('aria-current', 'page');
      } else {
        btn.removeAttribute('aria-current');
      }
    });

    // Hide or Show Bottom Bar when inside full-screen Chat Room
    const bottomBar = document.getElementById('bottom-bar');
    if (bottomBar) {
      bottomBar.classList.toggle('hidden', viewName === 'chat-room');
    }

    // Trigger View-Specific Renders
    if (viewName === 'home') {
      renderTimelineFeed();
    } else if (viewName === 'profile') {
      renderProfileView();
    } else if (viewName === 'saved') {
      renderSavedPostsView();
    } else if (viewName === 'notifications') {
      renderNotificationsView();
    } else if (viewName === 'chat-list') {
      renderChatListView();
    } else if (viewName === 'chat-room') {
      renderActiveChatRoom();
    }

    if (!opts.skipScroll) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  /* ==========================================================================
   * 9. GLOBAL USER IDENTITY SYNC (5 PLACES ACROSS THE DOM)
   * ========================================================================== */

  function syncUserIdentityAcrossDOM() {
    const user = state.currentUser;
    const myPostsCount = state.posts.filter(function (p) {
      return p.authorHandle === user.username;
    }).length;

    // 1. Sidebar Drawer Card
    const sbAvatar = document.getElementById('sidebar-avatar');
    const sbName = document.getElementById('sidebar-display-name');
    const sbHandle = document.getElementById('sidebar-handle');
    const sbLoc = document.getElementById('sidebar-location');
    const sbPosts = document.getElementById('sidebar-posts-count');
    const sbFollowing = document.getElementById('sidebar-following-count');
    const sbFollowers = document.getElementById('sidebar-followers-count');
    const sbSavedBadge = document.getElementById('sidebar-saved-badge');

    if (sbAvatar) sbAvatar.src = user.avatar;
    if (sbName) sbName.textContent = user.displayName;
    if (sbHandle) sbHandle.textContent = '@' + user.username;
    if (sbLoc) {
      sbLoc.innerHTML = `<i data-lucide="map-pin" class="h-3 w-3"></i><span>${user.country}، ${user.city}</span>`;
    }
    if (sbPosts) sbPosts.textContent = String(myPostsCount);
    if (sbFollowing) sbFollowing.textContent = String(user.followingCount);
    if (sbFollowers) sbFollowers.textContent = user.followersCount.toLocaleString('en-US');
    if (sbSavedBadge) sbSavedBadge.textContent = String(state.savedPostIds.length);

    // 2. Bottom Bar Avatar
    const bottomAvatar = document.getElementById('bottom-avatar');
    if (bottomAvatar) bottomAvatar.src = user.avatar;

    // 3. Home Composer Row Avatar
    const homeAvatar = document.getElementById('home-composer-avatar');
    if (homeAvatar) homeAvatar.src = user.avatar;

    // 4. Creator Modal Avatar & Name
    const creatorAvatar = document.getElementById('creator-avatar');
    const creatorName = document.getElementById('creator-author-name');
    if (creatorAvatar) creatorAvatar.src = user.avatar;
    if (creatorName) creatorName.textContent = user.displayName;

    // 5. Unread Badges on Bottom Bar
    updateUnreadBadges();
    refreshIcons();
  }

  function updateUnreadBadges() {
    const unreadNotifs = state.notifications.filter(function (n) {
      return !n.read;
    }).length;
    const notifBadge = document.getElementById('notif-badge');
    if (notifBadge) {
      notifBadge.textContent = String(unreadNotifs);
      notifBadge.classList.toggle('hidden', unreadNotifs === 0);
    }

    const unreadChats = state.chats.reduce(function (sum, c) {
      return sum + (c.unread || 0);
    }, 0);
    const chatBadge = document.getElementById('chat-badge');
    if (chatBadge) {
      chatBadge.textContent = String(unreadChats);
      chatBadge.classList.toggle('hidden', unreadChats === 0);
    }
  }

  /* ==========================================================================
   * 10. POST CARD BUILDER (WITH LIVE SCRIPT CONVERTER & INLINE COMMENTS)
   * ========================================================================== */

  function buildPostCardElement(post) {
    const tpl = document.getElementById('tpl-post');
    if (!tpl) return document.createElement('div');

    const fragment = tpl.content.cloneNode(true);
    const article = fragment.querySelector('.post-card');
    article.setAttribute('data-post-id', post.id);

    const avatarImg = article.querySelector('.post-avatar');
    const authorBtn = article.querySelector('.post-author');
    const verifiedIcon = article.querySelector('.post-verified');
    const poetryBadge = article.querySelector('.post-poetry-badge');
    const handleSpan = article.querySelector('.post-handle');
    const timeEl = article.querySelector('.post-time');
    const deleteBtn = article.querySelector('.post-delete');
    const textEl = article.querySelector('.post-text');
    const mediaGrid = article.querySelector('.post-media');

    if (avatarImg) {
      avatarImg.src = post.authorAvatar;
      avatarImg.alt = post.authorName;
    }
    if (authorBtn) authorBtn.textContent = post.authorName;
    if (verifiedIcon) verifiedIcon.classList.toggle('hidden', !post.verified);
    if (poetryBadge) poetryBadge.classList.toggle('hidden', !post.isPoetry);
    if (handleSpan) handleSpan.textContent = '@' + post.authorHandle;
    if (timeEl) {
      timeEl.textContent = post.timestamp;
      if (post.createdAt) timeEl.setAttribute('datetime', post.createdAt);
    }

    // Show delete button if authored by currentUser
    if (deleteBtn && post.authorHandle === state.currentUser.username) {
      deleteBtn.classList.remove('hidden');
      deleteBtn.classList.add('inline-flex');
    }

    // Render Text (Aramaic or Latin Hawar + Prose vs Centered Classical Poetry)
    const isLatin = post.scriptMode === 'latn';
    const displayedText =
      isLatin && window.kurdishToLatin ? window.kurdishToLatin(post.text) : post.text;

    if (textEl) {
      textEl.textContent = displayedText;
      textEl.setAttribute('dir', isLatin ? 'ltr' : 'rtl');
      textEl.classList.toggle('text-poetry', Boolean(post.isPoetry));
      textEl.classList.toggle('text-prose', !post.isPoetry);
    }

    // Render Media Attachments if any
    if (mediaGrid && Array.isArray(post.media) && post.media.length > 0) {
      mediaGrid.classList.remove('hidden');
      mediaGrid.classList.add('grid');
      if (post.media.length > 1) {
        mediaGrid.classList.replace('grid-cols-1', 'grid-cols-2');
      }
      post.media.forEach(function (src) {
        const img = document.createElement('img');
        img.src = src;
        img.alt = 'وێنەی هاوپێچکراوی پۆست';
        img.className = 'max-h-80 w-full object-cover';
        mediaGrid.appendChild(img);
      });
    }

    // Action Buttons State
    const likeBtn = article.querySelector('[data-action="like"]');
    const likeCount = article.querySelector('.post-like-count');
    const replyBtn = article.querySelector('[data-action="reply"]');
    const replyCount = article.querySelector('.post-reply-count');
    const scriptBtn = article.querySelector('[data-action="toggle-script"]');
    const scriptLabel = article.querySelector('.script-label');
    const bookmarkBtn = article.querySelector('[data-action="bookmark"]');

    if (likeBtn) likeBtn.setAttribute('aria-pressed', post.likedByMe ? 'true' : 'false');
    if (likeCount) likeCount.textContent = String(post.likes || 0);
    if (replyCount) {
      replyCount.textContent = String(Array.isArray(post.comments) ? post.comments.length : 0);
    }

    if (scriptBtn && scriptLabel) {
      scriptBtn.setAttribute('aria-pressed', isLatin ? 'true' : 'false');
      scriptLabel.textContent = isLatin ? 'ئارامی' : 'لاتینی';
    }

    const isBookmarked = state.savedPostIds.includes(post.id);
    if (bookmarkBtn) {
      bookmarkBtn.setAttribute('aria-pressed', isBookmarked ? 'true' : 'false');
    }

    // Inline Comments Drawer
    const commentsDrawer = article.querySelector('.post-comments-drawer');
    const commentsList = article.querySelector('.post-comments-list');
    const commentForm = article.querySelector('.post-comment-form');

    function renderCommentsInsideCard() {
      if (!commentsList) return;
      commentsList.innerHTML = '';
      const list = Array.isArray(post.comments) ? post.comments : [];

      if (list.length === 0) {
        const emptyLi = document.createElement('li');
        emptyLi.className = 'text-xs text-zinc-400 py-1';
        emptyLi.textContent = 'هێشتا هیچ لێدوانێک نەنووسراوە. یەکەم لێدوان بنووسە.';
        commentsList.appendChild(emptyLi);
        return;
      }

      list.forEach(function (c) {
        const li = document.createElement('li');
        li.className = 'rounded-xl bg-zinc-50 px-3 py-2 text-xs dark:bg-zinc-900';
        li.innerHTML = `
          <div class="flex items-center justify-between">
            <span class="font-extrabold text-[#0084ff]">${escapeHtml(c.authorName)}</span>
            <span class="text-[10px] text-zinc-400">${escapeHtml(c.time || 'ئێستا')}</span>
          </div>
          <p class="mt-1 leading-relaxed text-zinc-700 dark:text-zinc-200" dir="auto">${escapeHtml(c.text)}</p>
        `;
        commentsList.appendChild(li);
      });
    }

    renderCommentsInsideCard();

    // Event Listeners on Card
    article.querySelectorAll('[data-action="open-profile"]').forEach(function (el) {
      el.addEventListener('click', function () {
        state.viewingUserHandle = post.authorHandle;
        navigateTo('profile', { preserveUser: true });
      });
    });

    if (likeBtn) {
      likeBtn.addEventListener('click', function () {
        post.likedByMe = !post.likedByMe;
        post.likes = Math.max(0, (post.likes || 0) + (post.likedByMe ? 1 : -1));
        likeBtn.setAttribute('aria-pressed', post.likedByMe ? 'true' : 'false');
        if (likeCount) likeCount.textContent = String(post.likes);
        saveState();
      });
    }

    if (replyBtn && commentsDrawer) {
      replyBtn.addEventListener('click', function () {
        commentsDrawer.classList.toggle('hidden');
        if (!commentsDrawer.classList.contains('hidden')) {
          const input = commentsDrawer.querySelector('input[name="comment"]');
          if (input) input.focus();
        }
      });
    }

    if (commentForm) {
      commentForm.addEventListener('submit', function (e) {
        e.preventDefault();
        const input = commentForm.querySelector('input[name="comment"]');
        if (!input) return;
        const rawText = input.value.trim();
        if (!rawText) return;

        const cleanText = window.normalizeKurdishText
          ? window.normalizeKurdishText(rawText)
          : rawText;

        if (!Array.isArray(post.comments)) post.comments = [];
        post.comments.push({
          id: 'c_' + Date.now(),
          authorName: state.currentUser.displayName,
          authorHandle: state.currentUser.username,
          text: cleanText,
          time: 'ئێستا'
        });

        input.value = '';
        if (replyCount) replyCount.textContent = String(post.comments.length);
        renderCommentsInsideCard();
        saveState();
        showToast('لێدوانەکەت بە سەرکەوتوویی بڵاوکرایەوە', 'message-circle');
      });
    }

    // Live Aramaic <-> Latin Hawar Script Converter
    if (scriptBtn && textEl && scriptLabel) {
      scriptBtn.addEventListener('click', function () {
        post.scriptMode = post.scriptMode === 'latn' ? 'arab' : 'latn';
        const nowLatin = post.scriptMode === 'latn';
        const converted =
          nowLatin && window.kurdishToLatin ? window.kurdishToLatin(post.text) : post.text;

        textEl.textContent = converted;
        textEl.setAttribute('dir', nowLatin ? 'ltr' : 'rtl');
        scriptBtn.setAttribute('aria-pressed', nowLatin ? 'true' : 'false');
        scriptLabel.textContent = nowLatin ? 'ئارامی' : 'لاتینی';
        saveState();
      });
    }

    // Bookmark Toggle
    if (bookmarkBtn) {
      bookmarkBtn.addEventListener('click', function () {
        const idx = state.savedPostIds.indexOf(post.id);
        if (idx === -1) {
          state.savedPostIds.unshift(post.id);
          bookmarkBtn.setAttribute('aria-pressed', 'true');
          showToast('پۆستەکە خرایە لیستی پاشەکەوتکراوەکان', 'bookmark');
        } else {
          state.savedPostIds.splice(idx, 1);
          bookmarkBtn.setAttribute('aria-pressed', 'false');
          showToast('لە لیستی پاشەکەوتکراوەکان لابرا', 'bookmark');
          if (state.activeView === 'saved') {
            renderSavedPostsView();
          }
        }
        saveState();
        syncUserIdentityAcrossDOM();
      });
    }

    // Share Post
    const shareBtn = article.querySelector('[data-action="share"]');
    if (shareBtn) {
      shareBtn.addEventListener('click', function () {
        const shareText = `${post.authorName} (@${post.authorHandle}):\n${post.text}`;
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(shareText).catch(function () {});
        }
        showToast('دەقی پۆستەکە کۆپی کرا بۆ هاوبەشیکردن', 'share-2');
      });
    }

    // Delete Own Post
    if (deleteBtn) {
      deleteBtn.addEventListener('click', function () {
        state.posts = state.posts.filter(function (p) {
          return p.id !== post.id;
        });
        state.savedPostIds = state.savedPostIds.filter(function (id) {
          return id !== post.id;
        });
        saveState();
        syncUserIdentityAcrossDOM();
        if (state.activeView === 'home') renderTimelineFeed();
        if (state.activeView === 'profile') renderProfileView();
        if (state.activeView === 'saved') renderSavedPostsView();
        showToast('پۆستەکە بە تەواوی سڕایەوە', 'trash-2');
      });
    }

    return article;
  }

  /* ==========================================================================
   * 11. TIMELINE, PROFILE & SAVED POSTS RENDERERS
   * ========================================================================== */

  function renderTimelineFeed() {
    const feedList = document.getElementById('feed-list');
    const feedEmpty = document.getElementById('feed-empty');
    if (!feedList) return;

    feedList.innerHTML = '';

    let filtered = state.posts.slice();

    // Filter by Tab
    if (state.activeFeedTab === 'poetry') {
      filtered = filtered.filter(function (p) {
        return p.isPoetry;
      });
    } else if (state.activeFeedTab === 'following') {
      filtered = filtered.filter(function (p) {
        if (p.authorHandle === state.currentUser.username) return true;
        const u = state.users[p.authorHandle];
        return u ? u.isFollowing : true;
      });
    }

    // Filter by Search Query
    const q = (state.feedSearchQuery || '').trim().toLowerCase();
    if (q) {
      filtered = filtered.filter(function (p) {
        return (
          p.text.toLowerCase().includes(q) ||
          p.authorName.toLowerCase().includes(q) ||
          p.authorHandle.toLowerCase().includes(q)
        );
      });
    }

    if (filtered.length === 0) {
      if (feedEmpty) {
        feedEmpty.classList.remove('hidden');
        feedEmpty.classList.add('flex');
      }
    } else {
      if (feedEmpty) {
        feedEmpty.classList.add('hidden');
        feedEmpty.classList.remove('flex');
      }
      filtered.forEach(function (post) {
        feedList.appendChild(buildPostCardElement(post));
      });
    }

    refreshIcons(feedList);
  }

  function renderProfileView() {
    const handle = state.viewingUserHandle || state.currentUser.username;
    const isMe = handle === state.currentUser.username;
    const profileUser = isMe
      ? state.currentUser
      : state.users[handle] || state.currentUser;

    const headerTitle = document.getElementById('profile-header-title');
    const postsCountEl = document.getElementById('profile-posts-count');
    const avatarEl = document.getElementById('profile-avatar');
    const nameEl = document.getElementById('profile-display-name');
    const verifiedEl = document.getElementById('profile-verified');
    const handleEl = document.getElementById('profile-handle');
    const bioEl = document.getElementById('profile-bio');
    const locEl = document.getElementById('profile-location');
    const joinedEl = document.getElementById('profile-joined');
    const followingEl = document.getElementById('profile-following-count');
    const followersEl = document.getElementById('profile-followers-count');

    const editBtn = document.getElementById('profile-edit-btn');
    const msgBtn = document.getElementById('profile-message-btn');
    const followBtn = document.getElementById('profile-follow-btn');

    const userPosts = state.posts.filter(function (p) {
      return p.authorHandle === profileUser.username;
    });

    if (headerTitle) headerTitle.textContent = profileUser.displayName;
    if (postsCountEl) postsCountEl.textContent = String(userPosts.length);
    if (avatarEl) avatarEl.src = profileUser.avatar;
    if (nameEl) nameEl.textContent = profileUser.displayName;
    if (verifiedEl) verifiedEl.classList.toggle('hidden', !profileUser.verified);
    if (handleEl) handleEl.textContent = '@' + profileUser.username;
    if (bioEl) bioEl.textContent = profileUser.bio || '';
    if (locEl) locEl.textContent = `${profileUser.country || 'کوردستان'}، ${profileUser.city || 'کەرکووک'}`;
    if (joinedEl) joinedEl.textContent = profileUser.joined || '٢٠٢٦';
    if (followingEl) followingEl.textContent = String(profileUser.followingCount || 0);
    if (followersEl) {
      followersEl.textContent = (profileUser.followersCount || 0).toLocaleString('en-US');
    }

    if (editBtn) editBtn.classList.toggle('hidden', !isMe);
    if (msgBtn) {
      msgBtn.classList.toggle('hidden', isMe);
      msgBtn.classList.toggle('inline-flex', !isMe);
    }
    if (followBtn) {
      followBtn.classList.toggle('hidden', isMe);
      if (!isMe) {
        const following = Boolean(profileUser.isFollowing);
        followBtn.setAttribute('aria-pressed', following ? 'true' : 'false');
        followBtn.textContent = following ? 'شوێنکەوتوو' : 'شوێنکەوتن';
        followBtn.className = following
          ? 'rounded-full border border-black/20 px-5 py-2 text-xs font-extrabold transition dark:border-white/20'
          : 'rounded-full bg-[#0084ff] px-5 py-2 text-xs font-extrabold text-white transition active:scale-95';
      }
    }

    // Filter Profile Posts by Active Profile Tab (posts | poetry | likes)
    const listContainer = document.getElementById('profile-posts-list');
    const emptyEl = document.getElementById('profile-empty');
    if (!listContainer) return;

    listContainer.innerHTML = '';
    let tabPosts = [];

    if (state.activeProfileTab === 'posts') {
      tabPosts = userPosts;
    } else if (state.activeProfileTab === 'poetry') {
      tabPosts = userPosts.filter(function (p) {
        return p.isPoetry;
      });
    } else if (state.activeProfileTab === 'likes') {
      tabPosts = state.posts.filter(function (p) {
        return p.likedByMe;
      });
    }

    if (tabPosts.length === 0) {
      if (emptyEl) {
        emptyEl.classList.remove('hidden');
        emptyEl.classList.add('flex');
      }
    } else {
      if (emptyEl) {
        emptyEl.classList.add('hidden');
        emptyEl.classList.remove('flex');
      }
      tabPosts.forEach(function (post) {
        listContainer.appendChild(buildPostCardElement(post));
      });
    }

    refreshIcons(listContainer);
  }

  function renderSavedPostsView() {
    const savedList = document.getElementById('saved-list');
    const savedEmpty = document.getElementById('saved-empty');
    if (!savedList) return;

    savedList.innerHTML = '';

    const savedPosts = state.savedPostIds
      .map(function (id) {
        return state.posts.find(function (p) {
          return p.id === id;
        });
      })
      .filter(Boolean);

    if (savedPosts.length === 0) {
      if (savedEmpty) {
        savedEmpty.classList.remove('hidden');
        savedEmpty.classList.add('flex');
      }
    } else {
      if (savedEmpty) {
        savedEmpty.classList.add('hidden');
        savedEmpty.classList.remove('flex');
      }
      savedPosts.forEach(function (post) {
        savedList.appendChild(buildPostCardElement(post));
      });
    }

    refreshIcons(savedList);
  }

  /* ==========================================================================
   * 12. STRICTLY-TYPED NOTIFICATIONS ENGINE (LIKE, COMMENT, FOLLOW)
   * ========================================================================== */

  function renderNotificationsView() {
    const listEl = document.getElementById('notif-list');
    const emptyEl = document.getElementById('notif-empty');
    if (!listEl) return;

    listEl.innerHTML = '';
    const filter = state.activeNotifFilter || 'all';

    const items = state.notifications.filter(function (n) {
      if (filter === 'all') return true;
      return n.type === filter;
    });

    if (items.length === 0) {
      if (emptyEl) {
        emptyEl.classList.remove('hidden');
        emptyEl.classList.add('flex');
      }
      return;
    }

    if (emptyEl) {
      emptyEl.classList.add('hidden');
      emptyEl.classList.remove('flex');
    }

    const tpl = document.getElementById('tpl-notification');

    items.forEach(function (notif) {
      const clone = tpl.content.cloneNode(true);
      const root = clone.querySelector('.notif-item');
      const iconSlot = clone.querySelector('.notif-icon-slot');
      const iconEl = clone.querySelector('.notif-icon');
      const avatarEl = clone.querySelector('.notif-avatar');
      const timeEl = clone.querySelector('.notif-time');
      const textEl = clone.querySelector('.notif-text');
      const previewEl = clone.querySelector('.notif-preview');
      const actionSlot = clone.querySelector('.notif-action-slot');
      const followBackBtn = clone.querySelector('.notif-follow-back-btn');
      const unreadDot = clone.querySelector('.notif-unread-dot');

      root.setAttribute('data-notification-id', notif.id);
      root.setAttribute('data-type', notif.type);

      if (avatarEl) avatarEl.src = notif.actorAvatar;
      if (timeEl) timeEl.textContent = notif.timestamp;
      if (unreadDot) unreadDot.classList.toggle('hidden', Boolean(notif.read));

      // Strict Type Switch: LIKE | COMMENT | FOLLOW
      switch (notif.type) {
        case 'LIKE':
          if (iconSlot) {
            iconSlot.className =
              'notif-icon-slot mt-0.5 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-500 dark:bg-red-500/15';
          }
          if (iconEl) iconEl.setAttribute('data-lucide', 'heart');
          if (textEl) {
            textEl.innerHTML = `<strong class="font-extrabold">${escapeHtml(notif.actorName)}</strong> پۆستەکەتی پەسەند کرد.`;
          }
          if (previewEl && notif.postExcerpt) {
            previewEl.textContent = notif.postExcerpt;
            previewEl.classList.remove('hidden');
          }
          break;

        case 'COMMENT':
          if (iconSlot) {
            iconSlot.className =
              'notif-icon-slot mt-0.5 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-50 text-[#0084ff] dark:bg-[#0084ff]/15';
          }
          if (iconEl) iconEl.setAttribute('data-lucide', 'message-circle');
          if (textEl) {
            textEl.innerHTML = `<strong class="font-extrabold">${escapeHtml(notif.actorName)}</strong> لێدوانێکی لەسەر پۆستەکەت نووسی: <span class="font-semibold text-[#0084ff]">«${escapeHtml(notif.commentText || '')}»</span>`;
          }
          if (previewEl && notif.postExcerpt) {
            previewEl.textContent = notif.postExcerpt;
            previewEl.classList.remove('hidden');
          }
          break;

        case 'FOLLOW':
          if (iconSlot) {
            iconSlot.className =
              'notif-icon-slot mt-0.5 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400';
          }
          if (iconEl) iconEl.setAttribute('data-lucide', 'user-plus');
          if (textEl) {
            textEl.innerHTML = `<strong class="font-extrabold">${escapeHtml(notif.actorName)}</strong> دەستی کرد بە شوێنکەوتنت.`;
          }
          if (actionSlot && followBackBtn) {
            actionSlot.classList.remove('hidden');
            const updateFollowBtnUI = function () {
              if (notif.isFollowingBack) {
                followBackBtn.textContent = 'شوێنکەوتوو ✓';
                followBackBtn.className =
                  'notif-follow-back-btn rounded-full border border-black/15 px-4 py-1 text-xs font-extrabold text-zinc-700 transition dark:border-white/20 dark:text-zinc-200';
              } else {
                followBackBtn.textContent = 'شوێنکەوتنەوە';
                followBackBtn.className =
                  'notif-follow-back-btn rounded-full bg-[#0084ff] px-4 py-1 text-xs font-extrabold text-white transition active:scale-95';
              }
            };
            updateFollowBtnUI();

            followBackBtn.addEventListener('click', function (e) {
              e.stopPropagation();
              notif.isFollowingBack = !notif.isFollowingBack;
              notif.read = true;
              if (state.users[notif.actorHandle]) {
                state.users[notif.actorHandle].isFollowing = notif.isFollowingBack;
              }
              state.currentUser.followingCount += notif.isFollowingBack ? 1 : -1;
              updateFollowBtnUI();
              saveState();
              syncUserIdentityAcrossDOM();
            });
          }
          break;
      }

      root.addEventListener('click', function () {
        notif.read = true;
        saveState();
        updateUnreadBadges();
        if (notif.postId) {
          navigateTo('home');
          setTimeout(function () {
            const targetCard = document.querySelector(`[data-post-id="${notif.postId}"]`);
            if (targetCard) {
              targetCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
              if (notif.type === 'COMMENT') {
                const drawer = targetCard.querySelector('.post-comments-drawer');
                if (drawer) drawer.classList.remove('hidden');
              }
            }
          }, 120);
        } else if (notif.actorHandle) {
          state.viewingUserHandle = notif.actorHandle;
          navigateTo('profile', { preserveUser: true });
        }
      });

      listEl.appendChild(clone);
    });

    refreshIcons(listEl);
  }

  /* ==========================================================================
   * 13. MESSENGER-STYLE HYBRID CHAT ENGINE (DMs + GROUPS + SMART INPUT)
   * ========================================================================== */

  function renderChatListView() {
    const listEl = document.getElementById('chat-list');
    const emptyEl = document.getElementById('chat-list-empty');
    const searchInput = document.getElementById('chat-search');
    if (!listEl) return;

    listEl.innerHTML = '';
    const query = searchInput ? searchInput.value.trim().toLowerCase() : '';
    const filter = state.activeChatFilter || 'all';

    const chats = state.chats.filter(function (c) {
      if (filter !== 'all' && c.type !== filter) return false;
      if (query) {
        const lastMsg =
          c.messages && c.messages.length > 0
            ? c.messages[c.messages.length - 1].text
            : '';
        return (
          c.name.toLowerCase().includes(query) ||
          lastMsg.toLowerCase().includes(query)
        );
      }
      return true;
    });

    if (chats.length === 0) {
      if (emptyEl) {
        emptyEl.classList.remove('hidden');
        emptyEl.classList.add('flex');
      }
      return;
    }

    if (emptyEl) {
      emptyEl.classList.add('hidden');
      emptyEl.classList.remove('flex');
    }

    const tpl = document.getElementById('tpl-chat-item');

    chats.forEach(function (chat) {
      const clone = tpl.content.cloneNode(true);
      const btn = clone.querySelector('.chat-item');
      const avatar = clone.querySelector('.chat-item-avatar');
      const onlineDot = clone.querySelector('.chat-item-online');
      const nameEl = clone.querySelector('.chat-item-name');
      const groupBadge = clone.querySelector('.chat-item-group-badge');
      const timeEl = clone.querySelector('.chat-item-time');
      const previewEl = clone.querySelector('.chat-item-preview');
      const unreadEl = clone.querySelector('.chat-item-unread');

      btn.setAttribute('data-chat-id', chat.id);
      if (avatar) avatar.src = chat.avatar;
      if (onlineDot) onlineDot.classList.toggle('hidden', !chat.online);
      if (nameEl) nameEl.textContent = chat.name;
      if (groupBadge) groupBadge.classList.toggle('hidden', chat.type !== 'group');

      const lastMessage =
        chat.messages && chat.messages.length > 0
          ? chat.messages[chat.messages.length - 1]
          : null;

      if (timeEl) timeEl.textContent = lastMessage ? lastMessage.time : '';
      if (previewEl) {
        previewEl.textContent = lastMessage
          ? (lastMessage.sender === 'mine' ? 'تۆ: ' : '') + lastMessage.text
          : 'گفتوگۆ دەست پێ بکە...';
      }

      if (unreadEl) {
        unreadEl.textContent = String(chat.unread || 0);
        unreadEl.classList.toggle('hidden', !chat.unread || chat.unread <= 0);
      }

      btn.addEventListener('click', function () {
        state.activeChatId = chat.id;
        chat.unread = 0;
        saveState();
        updateUnreadBadges();
        navigateTo('chat-room');
      });

      listEl.appendChild(clone);
    });

    refreshIcons(listEl);
  }

  function renderActiveChatRoom() {
    const chat = state.chats.find(function (c) {
      return c.id === state.activeChatId;
    });
    if (!chat) {
      navigateTo('chat-list');
      return;
    }

    const avatarEl = document.getElementById('chat-room-avatar');
    const onlineDot = document.getElementById('chat-room-online-dot');
    const nameEl = document.getElementById('chat-room-name');
    const statusEl = document.getElementById('chat-room-status');
    const messagesContainer = document.getElementById('chat-messages');

    if (avatarEl) avatarEl.src = chat.avatar;
    if (onlineDot) onlineDot.classList.toggle('hidden', !chat.online);
    if (nameEl) nameEl.textContent = chat.name;
    if (statusEl) statusEl.textContent = chat.statusText || 'لەسەر هێڵە';

    if (!messagesContainer) return;
    messagesContainer.innerHTML = '';

    // Date Divider
    const dividerTpl = document.getElementById('tpl-chat-date-divider');
    if (dividerTpl) {
      const divClone = dividerTpl.content.cloneNode(true);
      const label = divClone.querySelector('.chat-date-label');
      if (label) label.textContent = 'ئەمڕۆ';
      messagesContainer.appendChild(divClone);
    }

    const incomingTpl = document.getElementById('tpl-message-incoming');
    const outgoingTpl = document.getElementById('tpl-message-outgoing');

    (chat.messages || []).forEach(function (msg) {
      const isMine = msg.sender === 'mine';
      const tpl = isMine ? outgoingTpl : incomingTpl;
      if (!tpl) return;

      const clone = tpl.content.cloneNode(true);
      const textEl = clone.querySelector('.message-text');
      const timeEl = clone.querySelector('.message-time');

      if (textEl) textEl.textContent = msg.text;
      if (timeEl) timeEl.textContent = msg.time || 'ئێستا';

      messagesContainer.appendChild(clone);
    });

    refreshIcons(messagesContainer);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  /* ==========================================================================
   * 14. IMAGE COMPRESSION UTILITY VIA OFFSCREEN HTML5 CANVAS
   * ========================================================================== */

  function compressImageFile(file, maxSize, callback) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function (e) {
      const img = new Image();
      img.onload = function () {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > height && width > maxSize) {
          height = Math.round((height * maxSize) / width);
          width = maxSize;
        } else if (height > maxSize) {
          width = Math.round((width * maxSize) / height);
          height = maxSize;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.84);
        callback(dataUrl);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  /* ==========================================================================
   * 15. POST & POETRY CREATOR MODAL CONTROLLER
   * ========================================================================== */

  function openCreatorModal(options) {
    const opts = options || {};
    const modal = document.getElementById('creator-canvas');
    const textarea = document.getElementById('creator-textarea');
    const poetryToggle = document.getElementById('creator-poetry-toggle');
    const modeBadge = document.getElementById('creator-mode-badge');
    const mediaGrid = document.getElementById('creator-media-grid');

    if (!modal || !textarea) return;

    creatorDraft.isPoetry = Boolean(opts.poetryMode);
    creatorDraft.media = [];

    textarea.value = '';
    textarea.classList.toggle('text-poetry', creatorDraft.isPoetry);
    if (poetryToggle) {
      poetryToggle.setAttribute('aria-pressed', creatorDraft.isPoetry ? 'true' : 'false');
    }
    if (modeBadge) {
      modeBadge.textContent = creatorDraft.isPoetry ? 'شێوازی شیعری کلاسیک / نوێ' : 'پەخشان / دەق';
    }
    if (mediaGrid) {
      mediaGrid.innerHTML = '';
      mediaGrid.classList.add('hidden');
    }

    updateCreatorSubmitState();

    modal.classList.remove('hidden');
    modal.classList.add('flex');
    modal.setAttribute('aria-hidden', 'false');

    setTimeout(function () {
      textarea.focus();
      if (opts.openFilePicker) {
        const fileInput = document.getElementById('creator-file-input');
        if (fileInput) fileInput.click();
      }
    }, 60);
  }

  function closeCreatorModal() {
    const modal = document.getElementById('creator-canvas');
    if (!modal) return;
    modal.classList.add('hidden');
    modal.classList.remove('flex');
    modal.setAttribute('aria-hidden', 'true');
  }

  function updateCreatorSubmitState() {
    const textarea = document.getElementById('creator-textarea');
    const submitBtn = document.getElementById('creator-submit');
    const charCount = document.getElementById('creator-char-count');
    if (!textarea || !submitBtn) return;

    const len = textarea.value.trim().length;
    if (charCount) charCount.textContent = `${textarea.value.length}/1000`;
    submitBtn.disabled = len === 0 && creatorDraft.media.length === 0;
  }

  function renderCreatorMediaPreviews() {
    const grid = document.getElementById('creator-media-grid');
    const tpl = document.getElementById('tpl-creator-media');
    if (!grid || !tpl) return;

    grid.innerHTML = '';
    if (creatorDraft.media.length === 0) {
      grid.classList.add('hidden');
      grid.classList.remove('grid');
      return;
    }

    grid.classList.remove('hidden');
    grid.classList.add('grid');

    creatorDraft.media.forEach(function (src, index) {
      const clone = tpl.content.cloneNode(true);
      const img = clone.querySelector('.creator-media-img');
      const removeBtn = clone.querySelector('.creator-media-remove');

      if (img) img.src = src;
      if (removeBtn) {
        removeBtn.addEventListener('click', function () {
          creatorDraft.media.splice(index, 1);
          renderCreatorMediaPreviews();
          updateCreatorSubmitState();
        });
      }
      grid.appendChild(clone);
    });

    refreshIcons(grid);
  }

  /* ==========================================================================
   * 16. EDIT PROFILE MODAL & UNIFIED KURDISTAN CITIES FILTER
   * ========================================================================== */

  function filterCityDropdownByCountry(selectedCountry, selectedCity) {
    const citySelect = document.getElementById('edit-city');
    if (!citySelect) return;

    const options = Array.from(citySelect.querySelectorAll('option'));
    let firstVisibleValue = '';

    options.forEach(function (opt) {
      const optCountry = opt.getAttribute('data-country');
      const matches = !optCountry || optCountry === selectedCountry;
      opt.hidden = !matches;
      opt.disabled = !matches;
      if (matches && !firstVisibleValue) {
        firstVisibleValue = opt.value;
      }
    });

    if (selectedCity) {
      const matchOption = options.find(function (o) {
        return !o.disabled && o.value === selectedCity;
      });
      citySelect.value = matchOption ? selectedCity : firstVisibleValue;
    } else {
      citySelect.value = firstVisibleValue;
    }
  }

  function openEditProfileModal() {
    const modal = document.getElementById('edit-profile-modal');
    if (!modal) return;

    const user = state.currentUser;
    pendingAvatarDataUrl = null;

    const avatarPreview = document.getElementById('edit-avatar-preview');
    const nameInput = document.getElementById('edit-display-name');
    const userInput = document.getElementById('edit-username');
    const bioInput = document.getElementById('edit-bio');
    const countrySelect = document.getElementById('edit-country');

    if (avatarPreview) avatarPreview.src = user.avatar;
    if (nameInput) nameInput.value = user.displayName;
    if (userInput) userInput.value = user.username;
    if (bioInput) bioInput.value = user.bio || '';
    if (countrySelect) {
      countrySelect.value = user.country || 'کوردستان';
      filterCityDropdownByCountry(countrySelect.value, user.city || 'کەرکووک');
    }

    updateEditProfileCounters();

    modal.classList.remove('hidden');
    modal.classList.add('flex');
    modal.setAttribute('aria-hidden', 'false');
  }

  function closeEditProfileModal() {
    const modal = document.getElementById('edit-profile-modal');
    if (!modal) return;
    modal.classList.add('hidden');
    modal.classList.remove('flex');
    modal.setAttribute('aria-hidden', 'true');
  }

  function updateEditProfileCounters() {
    const nameInput = document.getElementById('edit-display-name');
    const userInput = document.getElementById('edit-username');
    const bioInput = document.getElementById('edit-bio');

    const nameCount = document.getElementById('edit-name-count');
    const userCount = document.getElementById('edit-username-count');
    const bioCount = document.getElementById('edit-bio-count');

    if (nameInput && nameCount) nameCount.textContent = `${nameInput.value.length}/40`;
    if (userInput && userCount) userCount.textContent = `${userInput.value.length}/20`;
    if (bioInput && bioCount) bioCount.textContent = `${bioInput.value.length}/160`;
  }

  /* ==========================================================================
   * 17. OPEN KURDISH AI CORPUS JSONL DOWNLOADER
   * ========================================================================== */

  function downloadKurdishCorpusJSONL() {
    const jsonlContent = window.buildCorpusJSONL
      ? window.buildCorpusJSONL(state.posts)
      : state.posts
          .map(function (p) {
            return JSON.stringify({
              id: p.id,
              author: p.authorName,
              text_ku: p.text,
              genre: p.isPoetry ? 'poetry' : 'prose',
              encoding: 'UTF-8'
            });
          })
          .join('\n');

    const blob = new Blob([jsonlContent], {
      type: 'application/x-jsonlines;charset=utf-8'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'meko_kurdish_ai_corpus_utf8.jsonl';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showToast('داتاسێتی کوردی بە فۆرماتی JSONL دابەزێندرا', 'download');
  }

  /* ==========================================================================
   * 18. UTILITIES & EVENT BINDINGS
   * ========================================================================== */

  function escapeHtml(str) {
    return String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function bindAllApplicationEvents() {
    // 1. Navigation Buttons (Bottom Bar & Sidebar Drawer)
    document.querySelectorAll('[data-nav-target]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        const targetView = btn.getAttribute('data-nav-target');
        if (targetView) navigateTo(targetView);
      });
    });

    // 2. Sidebar Drawer Triggers
    const navMenuBtn = document.getElementById('nav-menu');
    const sidebarCloseBtn = document.getElementById('sidebar-close');
    const sidebarBackdrop = document.getElementById('sidebar-backdrop');

    if (navMenuBtn) navMenuBtn.addEventListener('click', toggleSidebarDrawer);
    if (sidebarCloseBtn) sidebarCloseBtn.addEventListener('click', closeSidebarDrawer);
    if (sidebarBackdrop) sidebarBackdrop.addEventListener('click', closeSidebarDrawer);

    // 3. Theme Toggle (Sidebar & Settings Radios)
    const themeToggleBtn = document.getElementById('theme-toggle');
    if (themeToggleBtn) {
      themeToggleBtn.addEventListener('click', function () {
        const nextTheme = document.documentElement.classList.contains('dark')
          ? 'light'
          : 'dark';
        applyTheme(nextTheme);
      });
    }

    document.querySelectorAll('input[name="theme"]').forEach(function (radio) {
      radio.addEventListener('change', function () {
        if (radio.checked) applyTheme(radio.value);
      });
    });

    // 4. Home Timeline Tabs, Search & Refresh
    document.querySelectorAll('#feed-tabs button[data-feed]').forEach(function (tab) {
      tab.addEventListener('click', function () {
        state.activeFeedTab = tab.getAttribute('data-feed') || 'for-you';
        document.querySelectorAll('#feed-tabs button[data-feed]').forEach(function (t) {
          t.setAttribute('aria-selected', t === tab ? 'true' : 'false');
        });
        renderTimelineFeed();
      });
    });

    const searchToggle = document.getElementById('feed-search-toggle');
    const searchBar = document.getElementById('feed-search-bar');
    const searchInput = document.getElementById('feed-search-input');

    if (searchToggle && searchBar) {
      searchToggle.addEventListener('click', function () {
        searchBar.classList.toggle('hidden');
        if (!searchBar.classList.contains('hidden') && searchInput) {
          searchInput.focus();
        }
      });
    }

    if (searchInput) {
      searchInput.addEventListener('input', function () {
        state.feedSearchQuery = searchInput.value;
        renderTimelineFeed();
      });
    }

    const refreshBtn = document.getElementById('feed-refresh');
    if (refreshBtn) {
      refreshBtn.addEventListener('click', function () {
        renderTimelineFeed();
        showToast('پۆستەکان نوێکرانەوە', 'refresh-cw');
      });
    }

    // 5. Creator Modal Triggers
    const navCreateBtn = document.getElementById('nav-create');
    const homeComposerTrigger = document.getElementById('home-composer-trigger');
    const homeComposerPoetry = document.getElementById('home-composer-poetry');
    const homeComposerImage = document.getElementById('home-composer-image');
    const feedEmptyCreate = document.getElementById('feed-empty-create');
    const creatorClose = document.getElementById('creator-close');
    const creatorTextarea = document.getElementById('creator-textarea');
    const creatorPoetryToggle = document.getElementById('creator-poetry-toggle');
    const creatorAddImage = document.getElementById('creator-add-image');
    const creatorFileInput = document.getElementById('creator-file-input');
    const creatorSubmit = document.getElementById('creator-submit');

    if (navCreateBtn) {
      navCreateBtn.addEventListener('click', function () {
        openCreatorModal({ poetryMode: false });
      });
    }
    if (homeComposerTrigger) {
      homeComposerTrigger.addEventListener('click', function () {
        openCreatorModal({ poetryMode: false });
      });
    }
    if (homeComposerPoetry) {
      homeComposerPoetry.addEventListener('click', function () {
        openCreatorModal({ poetryMode: true });
      });
    }
    if (homeComposerImage) {
      homeComposerImage.addEventListener('click', function () {
        openCreatorModal({ poetryMode: false, openFilePicker: true });
      });
    }
    if (feedEmptyCreate) {
      feedEmptyCreate.addEventListener('click', function () {
        openCreatorModal({ poetryMode: false });
      });
    }
    if (creatorClose) creatorClose.addEventListener('click', closeCreatorModal);

    if (creatorTextarea) {
      creatorTextarea.addEventListener('input', updateCreatorSubmitState);
    }

    if (creatorPoetryToggle && creatorTextarea) {
      creatorPoetryToggle.addEventListener('click', function () {
        creatorDraft.isPoetry = !creatorDraft.isPoetry;
        creatorPoetryToggle.setAttribute(
          'aria-pressed',
          creatorDraft.isPoetry ? 'true' : 'false'
        );
        creatorTextarea.classList.toggle('text-poetry', creatorDraft.isPoetry);
        const modeBadge = document.getElementById('creator-mode-badge');
        if (modeBadge) {
          modeBadge.textContent = creatorDraft.isPoetry
            ? 'شێوازی شیعری کلاسیک / نوێ'
            : 'پەخشان / دەق';
        }
      });
    }

    if (creatorAddImage && creatorFileInput) {
      creatorAddImage.addEventListener('click', function () {
        creatorFileInput.click();
      });
      creatorFileInput.addEventListener('change', function () {
        const files = Array.from(creatorFileInput.files || []).slice(0, 2);
        files.forEach(function (file) {
          compressImageFile(file, 720, function (dataUrl) {
            if (creatorDraft.media.length < 2) {
              creatorDraft.media.push(dataUrl);
              renderCreatorMediaPreviews();
              updateCreatorSubmitState();
            }
          });
        });
        creatorFileInput.value = '';
      });
    }

    if (creatorSubmit && creatorTextarea) {
      creatorSubmit.addEventListener('click', function () {
        const rawText = creatorTextarea.value.trim();
        if (!rawText && creatorDraft.media.length === 0) return;

        const normalizedText = window.normalizeKurdishText
          ? window.normalizeKurdishText(rawText)
          : rawText;

        const newPost = {
          id: 'post_' + Date.now(),
          authorName: state.currentUser.displayName,
          authorHandle: state.currentUser.username,
          authorAvatar: state.currentUser.avatar,
          verified: true,
          isPoetry: creatorDraft.isPoetry,
          text: normalizedText,
          media: creatorDraft.media.slice(),
          likes: 0,
          likedByMe: false,
          timestamp: 'ئێستا',
          createdAt: new Date().toISOString(),
          scriptMode: 'arab',
          comments: []
        };

        state.posts.unshift(newPost);
        saveState();
        closeCreatorModal();
        syncUserIdentityAcrossDOM();
        navigateTo('home');
        showToast(
          creatorDraft.isPoetry
            ? 'شیعرەکەت بە ستانداردی یونیکۆد بڵاوکرایەوە'
            : 'پۆستەکەت بە سەرکەوتوویی بڵاوکرایەوە',
          'feather'
        );
      });
    }

    // 6. Back Buttons on Secondary Views
    ['profile-back', 'saved-back', 'settings-back'].forEach(function (id) {
      const btn = document.getElementById(id);
      if (btn) {
        btn.addEventListener('click', function () {
          navigateTo('home');
        });
      }
    });

    // 7. Profile Tabs & Actions
    document.querySelectorAll('#profile-tabs button[data-profile-tab]').forEach(function (tab) {
      tab.addEventListener('click', function () {
        state.activeProfileTab = tab.getAttribute('data-profile-tab') || 'posts';
        document
          .querySelectorAll('#profile-tabs button[data-profile-tab]')
          .forEach(function (t) {
            t.setAttribute('aria-selected', t === tab ? 'true' : 'false');
          });
        renderProfileView();
      });
    });

    const profileShareBtn = document.getElementById('profile-share-btn');
    if (profileShareBtn) {
      profileShareBtn.addEventListener('click', function () {
        const url = `https://meko.kurd/@${state.viewingUserHandle || state.currentUser.username}`;
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(url).catch(function () {});
        }
        showToast('بەستەری پڕۆفایل کۆپی کرا', 'share-2');
      });
    }

    const profileFollowBtn = document.getElementById('profile-follow-btn');
    if (profileFollowBtn) {
      profileFollowBtn.addEventListener('click', function () {
        const targetUser = state.users[state.viewingUserHandle];
        if (!targetUser) return;
        targetUser.isFollowing = !targetUser.isFollowing;
        targetUser.followersCount += targetUser.isFollowing ? 1 : -1;
        state.currentUser.followingCount += targetUser.isFollowing ? 1 : -1;
        saveState();
        syncUserIdentityAcrossDOM();
        renderProfileView();
      });
    }

    const profileMsgBtn = document.getElementById('profile-message-btn');
    if (profileMsgBtn) {
      profileMsgBtn.addEventListener('click', function () {
        const targetUser = state.users[state.viewingUserHandle];
        if (!targetUser) return;
        let existingChat = state.chats.find(function (c) {
          return c.handle === targetUser.username;
        });
        if (!existingChat) {
          existingChat = {
            id: 'chat_' + Date.now(),
            type: 'dm',
            name: targetUser.displayName,
            handle: targetUser.username,
            avatar: targetUser.avatar,
            online: true,
            statusText: 'ئێستا لەسەر هێڵە',
            unread: 0,
            messages: []
          };
          state.chats.unshift(existingChat);
        }
        state.activeChatId = existingChat.id;
        saveState();
        navigateTo('chat-room');
      });
    }

    // 8. Edit Profile Modal Events
    const profileEditBtn = document.getElementById('profile-edit-btn');
    const settingsEditProfile = document.getElementById('settings-edit-profile');
    const editCloseBtn = document.getElementById('edit-profile-close');
    const editCancelBtn = document.getElementById('edit-profile-cancel');
    const editBackdrop = document.getElementById('edit-profile-backdrop');
    const editForm = document.getElementById('edit-profile-form');
    const editCountry = document.getElementById('edit-country');
    const editAvatarTrigger = document.getElementById('edit-avatar-trigger');
    const editAvatarFile = document.getElementById('edit-avatar-file');

    if (profileEditBtn) profileEditBtn.addEventListener('click', openEditProfileModal);
    if (settingsEditProfile) settingsEditProfile.addEventListener('click', openEditProfileModal);
    if (editCloseBtn) editCloseBtn.addEventListener('click', closeEditProfileModal);
    if (editCancelBtn) editCancelBtn.addEventListener('click', closeEditProfileModal);
    if (editBackdrop) editBackdrop.addEventListener('click', closeEditProfileModal);

    if (editCountry) {
      editCountry.addEventListener('change', function () {
        filterCityDropdownByCountry(editCountry.value, '');
      });
    }

    if (editAvatarTrigger && editAvatarFile) {
      editAvatarTrigger.addEventListener('click', function () {
        editAvatarFile.click();
      });
      editAvatarFile.addEventListener('change', function () {
        const file = editAvatarFile.files && editAvatarFile.files[0];
        if (!file) return;
        compressImageFile(file, 260, function (dataUrl) {
          pendingAvatarDataUrl = dataUrl;
          const preview = document.getElementById('edit-avatar-preview');
          if (preview) preview.src = dataUrl;
        });
      });
    }

    ['edit-display-name', 'edit-username', 'edit-bio'].forEach(function (id) {
      const el = document.getElementById(id);
      if (el) el.addEventListener('input', updateEditProfileCounters);
    });

    if (editForm) {
      editForm.addEventListener('submit', function (e) {
        e.preventDefault();
        const nameInput = document.getElementById('edit-display-name');
        const userInput = document.getElementById('edit-username');
        const bioInput = document.getElementById('edit-bio');
        const countrySelect = document.getElementById('edit-country');
        const citySelect = document.getElementById('edit-city');
        const userError = document.getElementById('edit-username-error');

        const newName = (nameInput ? nameInput.value : '').trim();
        const newUsername = (userInput ? userInput.value : '').trim().replace(/^@+/, '');
        const newBio = (bioInput ? bioInput.value : '').trim();

        if (!/^[A-Za-z0-9_]{3,20}$/.test(newUsername)) {
          if (userError) {
            userError.textContent =
              'ناوی بەکارهێنەر دەبێت ٣ بۆ ٢٠ پیتی ئینگلیزی، ژمارە یان _ بێت.';
            userError.classList.remove('hidden');
          }
          return;
        }
        if (userError) userError.classList.add('hidden');

        const oldUsername = state.currentUser.username;
        state.currentUser.displayName = newName || 'والی';
        state.currentUser.username = newUsername;
        state.currentUser.bio = newBio;
        state.currentUser.country = countrySelect ? countrySelect.value : 'کوردستان';
        state.currentUser.city = citySelect ? citySelect.value : 'کەرکووک';

        if (pendingAvatarDataUrl) {
          state.currentUser.avatar = pendingAvatarDataUrl;
        }

        // Propagate updated identity to all authored posts and comments
        state.posts.forEach(function (p) {
          if (p.authorHandle === oldUsername) {
            p.authorName = state.currentUser.displayName;
            p.authorHandle = state.currentUser.username;
            p.authorAvatar = state.currentUser.avatar;
          }
          if (Array.isArray(p.comments)) {
            p.comments.forEach(function (c) {
              if (c.authorHandle === oldUsername) {
                c.authorName = state.currentUser.displayName;
                c.authorHandle = state.currentUser.username;
              }
            });
          }
        });

        state.users[state.currentUser.username] = Object.assign({}, state.currentUser);
        state.viewingUserHandle = state.currentUser.username;

        saveState();
        closeEditProfileModal();
        syncUserIdentityAcrossDOM();
        renderProfileView();
        renderTimelineFeed();
        showToast('زانیارییەکانی پڕۆفایلەکەت نوێکرانەوە', 'check-circle-2');
      });
    }

    // 9. Notifications Filter Tabs & Mark All Read
    document.querySelectorAll('#notif-tabs button[data-notif-filter]').forEach(function (tab) {
      tab.addEventListener('click', function () {
        state.activeNotifFilter = tab.getAttribute('data-notif-filter') || 'all';
        document
          .querySelectorAll('#notif-tabs button[data-notif-filter]')
          .forEach(function (t) {
            t.setAttribute('aria-selected', t === tab ? 'true' : 'false');
          });
        renderNotificationsView();
      });
    });

    const notifMarkAll = document.getElementById('notif-mark-all');
    if (notifMarkAll) {
      notifMarkAll.addEventListener('click', function () {
        state.notifications.forEach(function (n) {
          n.read = true;
        });
        saveState();
        updateUnreadBadges();
        renderNotificationsView();
        showToast('هەموو ئاگادارکردنەوەکان وەک خوێندراوە دیاری کران', 'check-check');
      });
    }

    // 10. Chat List Filters, Search, New Chat Modal & Active Chat Room
    document.querySelectorAll('#chat-filter-tabs button[data-chat-filter]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        state.activeChatFilter = btn.getAttribute('data-chat-filter') || 'all';
        document
          .querySelectorAll('#chat-filter-tabs button[data-chat-filter]')
          .forEach(function (b) {
            b.setAttribute('aria-selected', b === btn ? 'true' : 'false');
          });
        renderChatListView();
      });
    });

    const chatSearch = document.getElementById('chat-search');
    if (chatSearch) {
      chatSearch.addEventListener('input', renderChatListView);
    }

    const chatBack = document.getElementById('chat-back');
    if (chatBack) {
      chatBack.addEventListener('click', function () {
        navigateTo('chat-list');
      });
    }

    const chatClear = document.getElementById('chat-room-clear');
    if (chatClear) {
      chatClear.addEventListener('click', function () {
        const chat = state.chats.find(function (c) {
          return c.id === state.activeChatId;
        });
        if (!chat) return;
        chat.messages = [];
        saveState();
        renderActiveChatRoom();
        showToast('پەڕەی گفتوگۆکە پاککرایەوە', 'trash-2');
      });
    }

    const chatInput = document.getElementById('chat-input');
    const chatSend = document.getElementById('chat-send');
    const chatForm = document.getElementById('chat-form');

    if (chatInput && chatSend) {
      chatInput.addEventListener('input', function () {
        chatInput.style.height = 'auto';
        chatInput.style.height = Math.min(chatInput.scrollHeight, 120) + 'px';
        chatSend.disabled = chatInput.value.trim().length === 0;
      });

      chatInput.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          if (!chatSend.disabled && chatForm) {
            chatForm.requestSubmit();
          }
        }
      });
    }

    if (chatForm && chatInput && chatSend) {
      chatForm.addEventListener('submit', function (e) {
        e.preventDefault();
        const raw = chatInput.value.trim();
        if (!raw) return;

        const cleanMsg = window.normalizeKurdishText
          ? window.normalizeKurdishText(raw)
          : raw;

        const chat = state.chats.find(function (c) {
          return c.id === state.activeChatId;
        });
        if (!chat) return;

        chat.messages.push({
          id: 'm_' + Date.now(),
          sender: 'mine',
          text: cleanMsg,
          time: 'ئێستا'
        });

        chatInput.value = '';
        chatInput.style.height = '42px';
        chatSend.disabled = true;
        saveState();
        renderActiveChatRoom();

        // Contextual Simulated Kurdish Reply
        const typingEl = document.getElementById('chat-typing');
        if (typingEl) {
          typingEl.classList.remove('hidden');
          typingEl.classList.add('flex');
        }

        setTimeout(function () {
          if (typingEl) {
            typingEl.classList.add('hidden');
            typingEl.classList.remove('flex');
          }
          const replies = [
            'زۆر ڕاستە، دەستت خۆش بێت بۆ ئەو تێبینییە جوانە.',
            'بەدڵنیاییەوە! زمانی کوردی بەم هەوڵە دیجیتاڵییانە زیاتر دەگەشێتەوە.',
            'سەرچاو کاک والی، هەر سەرکەوتوو و تەمەندرێژ بیت.',
            'زۆر نایابە، هەر ئێستا لە بەشی ئەرشیفی زمانەوانی تۆماری دەکەم.'
          ];
          const randomReply = replies[Math.floor(Math.random() * replies.length)];
          chat.messages.push({
            id: 'm_' + (Date.now() + 1),
            sender: 'theirs',
            text: randomReply,
            time: 'ئێستا'
          });
          saveState();
          if (state.activeView === 'chat-room' && state.activeChatId === chat.id) {
            renderActiveChatRoom();
          }
        }, 1150);
      });
    }

    // New Chat Modal
    const newChatBtn = document.getElementById('new-chat-btn');
    const newChatModal = document.getElementById('new-chat-modal');
    const newChatClose = document.getElementById('new-chat-close');
    const newChatBackdrop = document.getElementById('new-chat-backdrop');
    const newChatForm = document.getElementById('new-chat-form');

    function closeNewChatModal() {
      if (!newChatModal) return;
      newChatModal.classList.add('hidden');
      newChatModal.classList.remove('flex');
    }

    if (newChatBtn && newChatModal) {
      newChatBtn.addEventListener('click', function () {
        newChatModal.classList.remove('hidden');
        newChatModal.classList.add('flex');
        const input = document.getElementById('new-chat-name');
        if (input) input.focus();
      });
    }
    if (newChatClose) newChatClose.addEventListener('click', closeNewChatModal);
    if (newChatBackdrop) newChatBackdrop.addEventListener('click', closeNewChatModal);

    if (newChatForm) {
      newChatForm.addEventListener('submit', function (e) {
        e.preventDefault();
        const nameInput = document.getElementById('new-chat-name');
        const typeSelect = document.getElementById('new-chat-type');
        const name = (nameInput ? nameInput.value : '').trim();
        if (!name) return;

        const type = typeSelect ? typeSelect.value : 'dm';
        const newChat = {
          id: 'chat_' + Date.now(),
          type: type,
          name: name,
          handle: 'user_' + Date.now(),
          avatar: createSvgAvatar(
            name,
            type === 'group' ? '#4f46e5' : '#0084ff',
            '#0f172a'
          ),
          online: true,
          statusText: type === 'group' ? 'گرووپی نوێ · لەسەر هێڵە' : 'ئێستا لەسەر هێڵە',
          unread: 0,
          messages: []
        };

        state.chats.unshift(newChat);
        state.activeChatId = newChat.id;
        if (nameInput) nameInput.value = '';
        saveState();
        closeNewChatModal();
        navigateTo('chat-room');
      });
    }

    // 11. Settings: Export AI Corpus JSONL & Reset Seed Data
    const exportBtn = document.getElementById('export-jsonl-btn');
    if (exportBtn) {
      exportBtn.addEventListener('click', downloadKurdishCorpusJSONL);
    }

    const resetBtn = document.getElementById('reset-seed-btn');
    if (resetBtn) {
      resetBtn.addEventListener('click', function () {
        state = createSeedState();
        saveState(state);
        applyTheme(state.theme);
        syncUserIdentityAcrossDOM();
        navigateTo('home');
        showToast('داتای بنەڕەتیی مەکۆ بە سەرکەوتوویی گەڕێندرایەوە', 'rotate-ccw');
      });
    }
  }

  /* ==========================================================================
   * 19. BOOTSTRAP APPLICATION ON DOM READY
   * ========================================================================== */

  function initMekoApp() {
    applyTheme(state.theme || 'light');
    syncUserIdentityAcrossDOM();
    bindAllApplicationEvents();
    updateStructuredDataJsonLd(state);
    navigateTo(state.activeView === 'chat-room' ? 'home' : state.activeView || 'home', {
      skipScroll: true
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMekoApp);
  } else {
    initMekoApp();
  }
})();
