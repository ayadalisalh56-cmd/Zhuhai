/**
 * MEKO APP.JS - COMPLETE PRODUCTION LOGIC
 * ------------------------------------------------------------------
 * Zero truncation. Full seed data. Strict notification schema.
 * Optimized for smooth 60fps performance on mobile.
 */

// ============================================================================
// 1. STATE MANAGEMENT & SEED DATA
// ============================================================================
const STORAGE_KEY = 'meko_state_v2';
const THEME_KEY = 'meko_theme';

const DEFAULT_STATE = {
    currentUser: {
        id: 'user_wali',
        name: 'والی',
        handle: 'wali_kurd',
        avatar: 'https://api.dicebear.com/9.x/notionists/svg?seed=Wali&backgroundColor=b6e3f4',
        country: 'کوردستان',
        city: 'کەرکووک',
        bio: 'تەلارسازیی وشە و خەیاڵ؛ هەوڵێک بۆ پاراستن و بوژاندنەوەی زمانی ڕەسەنی کوردی لە جیهانی دیجیتاڵیدا.',
        followers: 1842,
        following: 326,
        postsCount: 47
    },
    posts: [
        {
            id: 'p1', userId: 'user_wali', authorName: 'والی', authorHandle: 'wali_kurd',
            authorAvatar: 'https://api.dicebear.com/9.x/notionists/svg?seed=Wali&backgroundColor=b6e3f4',
            content: 'زمان تەنها ئامرازی پەیوەندی نییە، بەڵکو ماڵی بوونە. هەر وشەیەک کە لە بیرمان دەچێتەوە، بەشێک لە ڕۆحی گەلەکەمان ون دەبێت. مەکۆ هەوڵێکە بۆ ئەوەی ئەم ماڵە جارێکی تر بنیات بنرێتەوە.',
            isPoetry: false, likes: 214, comments: 18, shares: 42, timestamp: '2026-11-05T08:30:00Z',
            likedByMe: false, savedByMe: true
        },
        {
            id: 'p2', userId: 'user_nali', authorName: 'نالی', authorHandle: 'nali_classic',
            authorAvatar: 'https://api.dicebear.com/9.x/notionists/svg?seed=Nali&backgroundColor=ffd5dc',
            content: 'ئەی دڵ مەگرێ ژان و ئازارم زۆرە\nهەرچی دەیکەم هیچ چارەسەرم نییە\nمن ئەو باغم کە گوڵی تێدا نەماوە\nتەنها خار و گەڵای زەردم هەیە',
            isPoetry: true, likes: 892, comments: 67, shares: 230, timestamp: '2026-11-04T19:15:00Z',
            likedByMe: true, savedByMe: false
        },
        {
            id: 'p3', userId: 'user_ling', authorName: 'ئاکادیمیای زمان', authorHandle: 'kurd_academy',
            authorAvatar: 'https://api.dicebear.com/9.x/notionists/svg?seed=Academy&backgroundColor=c0aede',
            content: 'لە ڕێنووسی لاتینیدا، پیتی "W" و "U" جیاوازن. لە کوردیدا "وو" دەبێتە "û" و "و" لە نێوان دوو بزوێنەردا دەبێتە "w". ئەم وردبینییە بۆ پاراستنی فۆنۆلۆژیای کوردی زۆر گرنگە.',
            isPoetry: false, likes: 156, comments: 24, shares: 88, timestamp: '2026-11-04T14:00:00Z',
            likedByMe: false, savedByMe: false
        },
        {
            id: 'p4', userId: 'user_mahwi', authorName: 'مەحوی', authorHandle: 'mahwi_poet',
            authorAvatar: 'https://api.dicebear.com/9.x/notionists/svg?seed=Mahwi&backgroundColor=d1f4d9',
            content: 'دڵم لە دەستم چوو، ئەی یار بمفرۆشە\nبە نرخێکی گران، یان بە هەرزان\nمن ئەو بازرگانەم کە سەرمایەی نییە\nتەنها خەم و پەژارەیەکی زۆرم هەیە',
            isPoetry: true, likes: 645, comments: 41, shares: 178, timestamp: '2026-11-03T21:45:00Z',
            likedByMe: false, savedByMe: true
        },
        {
            id: 'p5', userId: 'user_wali', authorName: 'والی', authorHandle: 'wali_kurd',
            authorAvatar: 'https://api.dicebear.com/9.x/notionists/svg?seed=Wali&backgroundColor=b6e3f4',
            content: 'ئەمشەو ئاسمانی کەرکووک پڕە لە ئەستێرە. هەر ئەستێرەیەک چیرۆکێکی کۆنی شارەکەمان دەگێڕێتەوە. زمانیش وەک ئەستێرەیە، ئەگەر سەیری نەکەیت، تاریک دەبێت.',
            isPoetry: false, likes: 328, comments: 29, shares: 55, timestamp: '2026-11-03T18:20:00Z',
            likedByMe: false, savedByMe: false
        }
    ],
    notifications: [
        { id: 'n1', type: 'LIKE', actorName: 'شیلان عەبدوڵڵا', actorHandle: 'shilan_a', actorAvatar: 'https://api.dicebear.com/9.x/notionists/svg?seed=Shilan', postId: 'p1', postExcerpt: 'زمان تەنها ئامرازی پەیوەندی نییە...', commentText: null, isFollowingBack: false, timestamp: '2026-11-05T09:00:00Z', read: false },
        { id: 'n2', type: 'COMMENT', actorName: 'هاوکار دەروێش', actorHandle: 'hawkar_d', actorAvatar: 'https://api.dicebear.com/9.x/notionists/svg?seed=Hawkar', postId: 'p1', postExcerpt: 'زمان تەنها ئامرازی پەیوەندی نییە...', commentText: 'زۆر جوان نووسیوتە، مەکۆ پڕۆژەیەکی نەتەوەیییە.', isFollowingBack: false, timestamp: '2026-11-05T08:45:00Z', read: false },
        { id: 'n3', type: 'FOLLOW', actorName: 'ڕۆژین محەمەد', actorHandle: 'rozheen_m', actorAvatar: 'https://api.dicebear.com/9.x/notionists/svg?seed=Rozheen', postId: null, postExcerpt: null, commentText: null, isFollowingBack: false, timestamp: '2026-11-05T07:30:00Z', read: false },
        { id: 'n4', type: 'LIKE', actorName: 'کاروان ساڵح', actorHandle: 'karwan_s', actorAvatar: 'https://api.dicebear.com/9.x/notionists/svg?seed=Karwan', postId: 'p5', postExcerpt: 'ئەمشەو ئاسمانی کەرکووک پڕە لە ئەستێرە...', commentText: null, isFollowingBack: false, timestamp: '2026-11-04T22:10:00Z', read: true },
        { id: 'n5', type: 'COMMENT', actorName: 'نیان عوسمان', actorHandle: 'nyan_o', actorAvatar: 'https://api.dicebear.com/9.x/notionists/svg?seed=Nyan', postId: 'p3', postExcerpt: 'لە ڕێنووسی لاتینیدا، پیتی "W" و "U"...', commentText: 'ئایا بۆ ناوەکانیش هەمان یاسا بەکاردێت؟', isFollowingBack: false, timestamp: '2026-11-04T16:20:00Z', read: true },
        { id: 'n6', type: 'FOLLOW', actorName: 'ئاراس فەتاح', actorHandle: 'aras_f', actorAvatar: 'https://api.dicebear.com/9.x/notionists/svg?seed=Aras', postId: null, postExcerpt: null, commentText: null, isFollowingBack: true, timestamp: '2026-11-04T10:00:00Z', read: true }
    ],
    chats: [
        { id: 'c1', type: 'dm', name: 'شیلان عەبدوڵڵا', handle: 'shilan_a', avatar: 'https://api.dicebear.com/9.x/notionists/svg?seed=Shilan', online: true, lastMsg: 'سوپاس بۆ هاوبەشکردنی ئەو دەقە نایابە.', time: '١٠:٣٠' },
        { id: 'c2', type: 'dm', name: 'هاوکار دەروێش', handle: 'hawkar_d', avatar: 'https://api.dicebear.com/9.x/notionists/svg?seed=Hawkar', online: false, lastMsg: 'کەی کۆبوونەوەی داهاتوو ئەنجام دەدرێت؟', time: 'دوێنێ' },
        { id: 'c3', type: 'dm', name: 'ڕۆژین محەمەد', handle: 'rozheen_m', avatar: 'https://api.dicebear.com/9.x/notionists/svg?seed=Rozheen', online: true, lastMsg: 'وێنەکەت زۆر جوانە!', time: '٢ ڕۆژ' },
        { id: 'g1', type: 'group', name: 'ئەدەبی کوردی کلاسیک', members: 1850, avatar: 'https://api.dicebear.com/9.x/notionists/svg?seed=ClassicLit', online: false, lastMsg: 'شیکاری دیوانی مەولەوی تەواو بوو.', time: '٠٩:١٥' },
        { id: 'g2', type: 'group', name: 'فەرهەنگسازی دیجیتاڵ', members: 420, avatar: 'https://api.dicebear.com/9.x/notionists/svg?seed=DictBuild', online: false, lastMsg: 'پێویستمان بە یارمەتی هەیە لە بەشی وشەی "هەورامی".', time: '٣ ڕۆژ' }
    ],
    library: [
        { id: 'lib1', title: 'دیوانی نالی', author: 'نالی', category: 'دیوانی شیعر', format: 'دەقی خاو TXT', words: 12450, size: '84 KB', excerpt: 'ئەی دڵ مەگرێ ژان و ئازارم زۆرە... ئەم دیوانە یەکێکە لە ستوونەکانی ئەدەبی کوردی.', fullText: 'ئەی دڵ مەگرێ ژان و ئازارم زۆرە\nهەرچی دەیکەم هیچ چارەسەرم نییە\nمن ئەو باغم کە گوڵی تێدا نەماوە\nتەنها خار و گەڵای زەردم هەیە\n\nئەی یار تۆش وەک من بە دەردی من تووشی\nبەڵام من تاقەتم نەماوە بۆ فریاد\nهەرچی دەڵێم کەس گوێی لێ ناگرێت\nتەنها ئاهـ و ناڵەیەکم هەیە بۆ باد' },
        { id: 'lib2', title: 'دیوانی مەحوی', author: 'مەحوی', category: 'دیوانی شیعر', format: 'دەقی خاو TXT', words: 9800, size: '67 KB', excerpt: 'مەحوی شاعیری عیرفان و سۆفیگەرییە. شیعرەکانی پڕن لە مانای قووڵ.', fullText: 'دڵم لە دەستم چوو، ئەی یار بمفرۆشە\nبە نرخێکی گران، یان بە هەرزان\nمن ئەو بازرگانەم کە سەرمایەی نییە\nتەنها خەم و پەژارەیەکی زۆرم هەیە\n\nمەحوی هەموو شتێکم لە دەست داوە\nتەنها ناوت لە دڵمدا ماوەتەوە' },
        { id: 'lib3', title: 'دیوانی حاجی قادری کۆیی', author: 'حاجی قادری کۆیی', category: 'دیوانی شیعر', format: 'دەقی خاو TXT', words: 15200, size: '102 KB', excerpt: 'کۆیی بانگەوازی نەتەوەیی و هۆشیاربوونەوەی کردووەتە ناوەڕۆکی شیعرەکانی.', fullText: 'ئەی کورد! مەخەو، هەستە، کاتی کارە\nخەو لە چاوت برد، ئیدی بەسە\nدوژمن لە هەموو لایەکەوە هاتووە\nبۆ سڕینەوەی ناو و نیشانمان\n\nهەستن براکان! یەکگرتوو بین\nبە یەک دەنگ و یەک ئامانج بڕۆین' },
        { id: 'lib4', title: 'فەرهەنگی ڕیشەناسیی وشەی ڕەسەنی کوردی', author: 'د. جەمال نەبەز', category: 'فەرهەنگ و زمان', format: 'دەقی خاو TXT', words: 45000, size: '310 KB', excerpt: 'لێکۆڵینەوەیەکی قووڵ لە ڕیشەی وشە کوردییەکان و پەیوەندییان بە زمانە ئێرانییە کۆنەکانەوە.', fullText: 'وشەی "ئازاد" لە ڕیشەی ئێرانی کۆن "āzāta" دێت بە مانای "لەدایکبووی ئازاد".\nوشەی "شار" لە سومەرییەوە هاتووە و بە مانای "شوێنی نیشتەجێبوون" دێت.\nئەم فەرهەنگە هەوڵێکە بۆ گەڕانەوە بۆ ڕەچەڵەکی وشەکان.' },
        { id: 'lib5', title: 'لێکۆڵینەوەی زاراوەناسیی هەورامی و کەڵهوڕی', author: 'ئاکادیمیای کوردی', category: 'لێکۆڵینەوە', format: 'دەقی خاو TXT', words: 28000, size: '190 KB', excerpt: 'بەراوردکارییەکی زمانەوانی لە نێوان زاراوەکانی هەورامی و کەڵهوڕی و سۆرانی.', fullText: 'زاراوەی هەورامی یەکێکە لە کۆنترین زاراوەکانی کوردی.\nلە کەڵهوڕیدا پاشگری "-ە" زۆرجار بە "-ە" دەمێنێتەوە بەڵام لە سۆرانیدا دەگۆڕێت.\nئەم لێکۆڵینەوەیە ڕوونی دەکاتەوە کە چۆن ئەم جیاوازییانە دروست بوون.' },
        { id: 'lib6', title: 'فەلسەفەی جوانیناسی لە ئەدەبی کوردیدا', author: 'فەرهاد پیرباڵ', category: 'لێکۆڵینەوە', format: 'دەقی خاو TXT', words: 32000, size: '220 KB', excerpt: 'چۆن کورد جوانی پێناسە دەکات؟ ئایا جوانی لە سروشتدایە یان لە مرۆڤدا؟', fullText: 'جوانیناسی کوردی تێکەڵەیەکە لە سروشت و ئازار.\nهیچ شیعرێکی کوردی نییە کە باسی شاخ و دۆڵ نەکات.\nجوانی لای کورد تەنها دیمەن نییە، بەڵکو هەست و نەستی هاوبەشە.' }
    ],
    savedPostIds: ['p1', 'p4'],
    activeView: 'timeline',
    activeChatId: null,
    notifFilter: 'all'
};

let state = {};

function loadState() {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        state = saved ? JSON.parse(saved) : JSON.parse(JSON.stringify(DEFAULT_STATE));
        if (!saved) saveState();
    } catch (e) {
        console.error('State load failed', e);
        state = JSON.parse(JSON.stringify(DEFAULT_STATE));
        saveState();
    }
}

function saveState() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    updateJsonLd();
}

// ============================================================================
// 2. TRANSLITERATION ENGINE (ARAMAIC <-> LATIN HAWAR)
// ============================================================================
const ARABIC_TO_LATIN_MAP = {
    'ا': 'a', 'ە': 'e', 'ێ': 'ê', 'ۆ': 'o', 'ب': 'b', 'پ': 'p', 'ت': 't',
    'ج': 'c', 'چ': 'ç', 'ح': 'h', 'خ': 'x', 'د': 'd', 'ر': 'r', 'ڕ': 'rr',
    'ز': 'z', 'ژ': 'j', 'س': 's', 'ش': 'ş', 'ع': "'", 'غ': 'x', 'ف': 'f',
    'ڤ': 'v', 'ق': 'q', 'ک': 'k', 'گ': 'g', 'ل': 'l', 'ڵ': 'll', 'م': 'm',
    'ن': 'n', 'ه': 'h', 'ھ': 'h', 'و': 'w', 'ی': 'y', 'ئ': '',
    '؟': '?', '،': ',', '؛': ';',
    '٠': '0', '١': '1', '٢': '2', '٣': '3', '٤': '4',
    '٥': '5', '٦': '6', '٧': '7', '٨': '8', '٩': '9'
};

function transliterateKurdishToLatin(text) {
    if (!text) return '';
    let result = '';
    let i = 0;
    while (i < text.length) {
        const char = text[i];
        const next = text[i + 1];
        
        if (char === 'و' && next === 'و') { result += 'û'; i += 2; continue; }
        if (char === 'و' && next === 'ێ') { result += 'wê'; i += 2; continue; }
        if (char === 'و' && next === 'ا') { result += 'wa'; i += 2; continue; }
        
        if (char === 'و') {
            const prevIsVowel = i > 0 && ['ا','ە','ێ','ۆ','ی','و'].includes(text[i-1]);
            const nextIsVowel = next && ['ا','ە','ێ','ۆ','ی','و'].includes(next);
            result += (prevIsVowel && nextIsVowel) ? 'w' : 'u';
            i++; continue;
        }
        if (char === 'ی') {
            const prevIsVowel = i > 0 && ['ا','ە','ێ','ۆ','ی','و'].includes(text[i-1]);
            const nextIsVowel = next && ['ا','ە','ێ','ۆ','ی','و'].includes(next);
            result += (prevIsVowel || nextIsVowel) ? 'y' : 'î';
            i++; continue;
        }
        
        if (char === 'ئ') {
            if (next === 'ا') { result += 'a'; i += 2; continue; }
            if (next === 'ە') { result += 'e'; i += 2; continue; }
            if (next === 'ی') { result += 'î'; i += 2; continue; }
            if (next === 'ۆ') { result += 'o'; i += 2; continue; }
            if (next === 'و') { result += 'u'; i += 2; continue; }
            i++; continue;
        }

        result += ARABIC_TO_LATIN_MAP[char] || char;
        i++;
    }
    return result.replace(/(^|[.!?]\s+)([a-z])/g, (m, p1, p2) => p1 + p2.toUpperCase());
}

// ============================================================================
// 3. NOTIFICATION FACTORY
// ============================================================================
function createNotification(type, payload) {
    const validTypes = ['LIKE', 'COMMENT', 'FOLLOW'];
    if (!validTypes.includes(type)) return;
    
    const base = {
        id: `n_${Date.now()}_${Math.random().toString(36).substr(2,5)}`,
        type,
        actorName: payload.actorName,
        actorHandle: payload.actorHandle,
        actorAvatar: payload.actorAvatar,
        timestamp: new Date().toISOString(),
        read: false
    };

    if (type === 'LIKE' || type === 'COMMENT') {
        base.postId = payload.postId;
        base.postExcerpt = payload.postExcerpt;
        base.commentText = type === 'COMMENT' ? payload.commentText : null;
        base.isFollowingBack = false;
    } else if (type === 'FOLLOW') {
        base.postId = null;
        base.postExcerpt = null;
        base.commentText = null;
        base.isFollowingBack = payload.isFollowingBack || false;
    }

    state.notifications.unshift(base);
    saveState();
    renderBottomBar();
    if (state.activeView === 'notifications') renderNotificationsView();
}

// ============================================================================
// 4. CORE RENDERERS & NAVIGATION
// ============================================================================
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

function initApp() {
    loadState();
    applyTheme();
    renderBottomBar();
    renderSidebar();
    navigateTo(state.activeView);
    lucide.createIcons({ strokeWidth: 1.75 });
}

function applyTheme() {
    const theme = localStorage.getItem(THEME_KEY) || 'light';
    document.documentElement.className = theme;
}

function toggleTheme() {
    const current = document.documentElement.className;
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.className = next;
    localStorage.setItem(THEME_KEY, next);
    renderSidebar();
}

function navigateTo(view, params = {}) {
    state.activeView = view;
    if (params.chatId) state.activeChatId = params.chatId;
    saveState();
    
    const main = $('#main-content');
    const header = $('#main-header');
    const headerAction = $('#header-action-btn');
    
    // Smooth transition effect
    main.style.opacity = '0';
    setTimeout(() => {
        main.innerHTML = '';
        headerAction.classList.add('hidden');
        headerAction.onclick = null;

        switch(view) {
            case 'timeline': renderTimeline(main, header); break;
            case 'notifications': renderNotificationsView(main, header); break;
            case 'chat': state.activeChatId ? renderChatRoom(main, header) : renderChatList(main, header); break;
            case 'profile': renderProfile(main, header); break;
            case 'library': renderLibrary(main, header); break;
            case 'saved': renderSavedPosts(main, header); break;
            case 'creator': renderCreatorCanvas(); break;
            default: renderTimeline(main, header);
        }
        
        closeDrawer();
        renderBottomBar();
        lucide.createIcons({ strokeWidth: 1.75 });
        main.style.opacity = '1';
    }, 150);
}

// --- BOTTOM BAR ---
function renderBottomBar() {
    const bar = $('#bottom-bar');
    const unreadCount = state.notifications.filter(n => !n.read).length;
    const isActive = (v) => state.activeView === v ? 'text-[var(--text-main)] scale-110' : 'text-[var(--text-muted)]';
    
    bar.innerHTML = `
        <button onclick="navigateTo('timeline')" class="${isActive('timeline')} transition-all duration-200"><i data-lucide="home" class="w-6 h-6"></i></button>
        <button onclick="navigateTo('notifications')" class="${isActive('notifications')} relative transition-all duration-200">
            <i data-lucide="bell" class="w-6 h-6"></i>
            ${unreadCount > 0 ? `<span class="absolute -top-1 -right-1 bg-danger text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-scaleIn">${unreadCount}</span>` : ''}
        </button>
        <button onclick="navigateTo('creator')" class="w-10 h-10 rounded-full flex items-center justify-center transition-transform active:scale-90 hover:scale-105 ${document.documentElement.classList.contains('dark') ? 'bg-white text-black' : 'bg-black text-white'} shadow-lg">
            <i data-lucide="plus" class="w-6 h-6"></i>
        </button>
        <button onclick="navigateTo('chat')" class="${isActive('chat')} transition-all duration-200"><i data-lucide="message-circle" class="w-6 h-6"></i></button>
        <button onclick="openDrawer()" class="relative transition-all duration-200 active:scale-95">
            <img src="${state.currentUser.avatar}" class="avatar-sm border-2 border-transparent hover:border-[var(--text-muted)] transition-colors" alt="Menu">
            <div class="absolute -bottom-0.5 -left-0.5 bg-[var(--bg-secondary)] rounded-full p-0.5 border border-hairline">
                <i data-lucide="menu" class="w-3 h-3"></i>
            </div>
        </button>
    `;
    lucide.createIcons({ strokeWidth: 1.75 });
}

// --- SIDEBAR DRAWER ---
function openDrawer() {
    $('#drawer-backdrop').classList.remove('opacity-0', 'pointer-events-none');
    $('#sidebar-drawer').classList.remove('-translate-x-full');
}

function closeDrawer() {
    $('#drawer-backdrop').classList.add('opacity-0', 'pointer-events-none');
    $('#sidebar-drawer').classList.add('-translate-x-full');
}

$('#drawer-backdrop').addEventListener('click', closeDrawer);

function renderSidebar() {
    const drawer = $('#sidebar-drawer');
    const u = state.currentUser;
    const isDark = document.documentElement.classList.contains('dark');
    
    drawer.innerHTML = `
        <div class="p-6 border-b border-hairline cursor-pointer hover:bg-secondary transition-colors" onclick="navigateTo('profile')">
            <div class="flex items-center gap-4 mb-3">
                <img src="${u.avatar}" class="avatar-md" alt="${u.name}">
                <div>
                    <h3 class="font-bold text-lg">${u.name}</h3>
                    <p class="text-muted text-sm">@${u.handle}</p>
                </div>
            </div>
            <p class="text-sm text-muted line-clamp-2">${u.bio}</p>
            <div class="flex gap-4 mt-3 text-sm font-medium">
                <span>${toKurdishNum(u.followers)} شوێنکەوتوو</span>
                <span>${toKurdishNum(u.following)} شوێنکەوتوو</span>
            </div>
        </div>
        
        <nav class="flex-1 py-4 px-3 space-y-1">
            <button onclick="navigateTo('profile')" class="w-full flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-secondary transition-colors text-right">
                <i data-lucide="user" class="w-5 h-5 text-muted"></i>
                <span class="font-medium">پڕۆفایلەکەم</span>
            </button>
            <button onclick="navigateTo('library')" class="w-full flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-secondary transition-colors text-right">
                <i data-lucide="book-open" class="w-5 h-5 text-muted"></i>
                <span class="font-medium">کتێبخانە و ئەرشیف</span>
            </button>
            <button onclick="navigateTo('saved')" class="w-full flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-secondary transition-colors text-right">
                <i data-lucide="bookmark" class="w-5 h-5 text-muted"></i>
                <div class="flex-1 text-right">
                    <span class="font-medium block">پاشەکەوتکراوەکان</span>
                    <span class="text-xs text-muted">تەنها خۆت دەیبینیت</span>
                </div>
            </button>
            <button onclick="showSettingsModal()" class="w-full flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-secondary transition-colors text-right">
                <i data-lucide="settings" class="w-5 h-5 text-muted"></i>
                <span class="font-medium">ڕێکخستنەکان</span>
            </button>
        </nav>
        
        <div class="p-4 border-t border-hairline flex items-center justify-between">
            <span class="text-xs text-muted">مەکۆ · v2.0.0</span>
            <button onclick="toggleTheme()" class="flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary text-sm font-medium transition-colors hover:opacity-80">
                <i data-lucide="${isDark ? 'sun' : 'moon'}" class="w-4 h-4"></i>
                ${isDark ? 'ڕووناک' : 'تاریک'}
            </button>
        </div>
    `;
    lucide.createIcons({ strokeWidth: 1.75 });
}

// --- TIMELINE ---
function renderTimeline(container, header) {
    header.querySelector('h1').textContent = 'مەکۆ';
    container.innerHTML = state.posts.map(post => createPostHTML(post)).join('<div class="post-divider"></div>');
    attachPostInteractions();
}

function createPostHTML(post, isLatin = false) {
    const content = isLatin ? transliterateKurdishToLatin(post.content) : post.content;
    const bodyClass = post.isPoetry ? 'post-body-poetry' : 'post-body-prose';
    const latinClass = isLatin ? 'post-body-latin' : '';
    const dir = isLatin ? 'ltr' : 'rtl';
    
    return `
        <article class="w-full animate-fadeIn" data-post-id="${post.id}" data-original-content="${encodeURIComponent(post.content)}" data-is-poetry="${post.isPoetry}">
            <header class="px-4 pt-3.5 pb-2 flex items-center justify-between">
                <div class="flex items-center gap-3">
                    <img src="${post.authorAvatar}" class="avatar-sm" alt="${post.authorName}">
                    <div>
                        <h4 class="font-bold text-[15px] leading-tight">${post.authorName}</h4>
                        <time class="text-xs text-muted" datetime="${post.timestamp}">${formatTimeAgo(post.timestamp)}</time>
                    </div>
                </div>
                <button class="p-2 rounded-full hover:bg-secondary text-muted transition-colors"><i data-lucide="more-horizontal" class="w-5 h-5"></i></button>
            </header>
            
            <div class="px-4 py-1.5 pb-3 ${bodyClass} ${latinClass}" dir="${dir}">${content}</div>
            
            <div class="interaction-bar">
                <div class="flex items-center gap-5">
                    <button class="action-icon like-btn ${post.likedByMe ? 'liked' : ''}" data-id="${post.id}">
                        <i data-lucide="heart" class="w-5 h-5" ${post.likedByMe ? 'fill="currentColor"' : ''}></i>
                        <span>${toKurdishNum(post.likes)}</span>
                    </button>
                    <button class="action-icon comment-btn" data-id="${post.id}">
                        <i data-lucide="message-circle" class="w-5 h-5"></i>
                        <span>${toKurdishNum(post.comments)}</span>
                    </button>
                    <button class="action-icon share-btn" data-id="${post.id}">
                        <i data-lucide="share-2" class="w-5 h-5"></i>
                        <span>${toKurdishNum(post.shares)}</span>
                    </button>
                </div>
                <div class="flex items-center gap-4">
                    <button class="action-icon script-toggle-btn" data-id="${post.id}" data-latin="${isLatin}">
                        <span class="text-xs font-bold px-2 py-0.5 rounded bg-secondary border border-hairline transition-opacity hover:opacity-70">${isLatin ? 'ئارامی' : 'لاتینی'}</span>
                    </button>
                    <button class="action-icon save-btn ${post.savedByMe ? 'saved' : ''}" data-id="${post.id}">
                        <i data-lucide="bookmark" class="w-5 h-5" ${post.savedByMe ? 'fill="currentColor"' : ''}></i>
                    </button>
                </div>
            </div>
        </article>
    `;
}

function attachPostInteractions() {
    $$('.like-btn').forEach(btn => btn.onclick = () => toggleLike(btn.dataset.id));
    $$('.save-btn').forEach(btn => btn.onclick = () => toggleSave(btn.dataset.id));
    $$('.share-btn').forEach(btn => btn.onclick = () => sharePost(btn.dataset.id));
    $$('.script-toggle-btn').forEach(btn => btn.onclick = () => toggleScript(btn));
    $$('.comment-btn').forEach(btn => btn.onclick = () => showToast('بەشی لێدوانەکان بەم زووانە زیاد دەکرێت'));
}

function toggleLike(postId) {
    const post = state.posts.find(p => p.id === postId);
    if (!post) return;
    post.likedByMe = !post.likedByMe;
    post.likes += post.likedByMe ? 1 : -1;
    saveState();
    refreshCurrentView();
}

function toggleSave(postId) {
    const idx = state.savedPostIds.indexOf(postId);
    const post = state.posts.find(p => p.id === postId);
    if (idx > -1) {
        state.savedPostIds.splice(idx, 1);
        if (post) post.savedByMe = false;
        showToast('لە پاشەکەوتکراوەکان لابرا');
    } else {
        state.savedPostIds.push(postId);
        if (post) post.savedByMe = true;
        showToast('پاشەکەوت کرا');
    }
    saveState();
    refreshCurrentView();
}

function sharePost(postId) {
    const post = state.posts.find(p => p.id === postId);
    if (post && navigator.clipboard) {
        navigator.clipboard.writeText(post.content);
        showToast('ناوەڕۆکی پۆست کۆپی کرا');
    }
}

function toggleScript(btn) {
    const article = btn.closest('article');
    const isCurrentlyLatin = btn.dataset.latin === 'true';
    const newHtml = createPostHTML(
        state.posts.find(p => p.id === article.dataset.postId),
        !isCurrentlyLatin
    );
    const temp = document.createElement('div');
    temp.innerHTML = newHtml;
    article.replaceWith(temp.firstElementChild);
    attachPostInteractions();
    lucide.createIcons({ strokeWidth: 1.75 });
}

// --- NOTIFICATIONS ---
function renderNotificationsView(container, header) {
    header.querySelector('h1').textContent = 'ئاگادارییەکان';
    const actionBtn = $('#header-action-btn');
    actionBtn.classList.remove('hidden');
    actionBtn.innerHTML = '<span class="text-sm font-medium">خوێندنەوەی هەموو</span>';
    actionBtn.onclick = markAllRead;

    const filters = [
        { key: 'all', label: 'هەموو' },
        { key: 'LIKE', label: 'پەسەندکردن' },
        { key: 'COMMENT', label: 'لێدوانەکان' },
        { key: 'FOLLOW', label: 'شوێنکەوتن' }
    ];

    const filtered = state.notifFilter === 'all' 
        ? state.notifications 
        : state.notifications.filter(n => n.type === state.notifFilter);

    container.innerHTML = `
        <div class="flex gap-2 px-4 py-3 overflow-x-auto hide-scrollbar border-b border-hairline sticky top-14 bg-primary z-30">
            ${filters.map(f => `
                <button onclick="setNotifFilter('${f.key}')" class="px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200 ${state.notifFilter === f.key ? 'bg-[var(--text-main)] text-[var(--bg-primary)] scale-105' : 'bg-secondary text-muted'}">
                    ${f.label}
                </button>
            `).join('')}
        </div>
        <div class="divide-y divide-hairline">
            ${filtered.length === 0 ? '<p class="text-center text-muted py-12 animate-fadeIn">هیچ ئاگادارییەک نییە</p>' : filtered.map(renderNotifItem).join('')}
        </div>
    `;
    lucide.createIcons({ strokeWidth: 1.75 });
}

function renderNotifItem(n) {
    let badgeIcon = '', badgeColor = '', text = '', extra = '', action = '';

    if (n.type === 'LIKE') {
        badgeIcon = 'heart'; badgeColor = 'bg-danger';
        text = `<strong>${n.actorName}</strong> پۆستەکەتی پەسەند کرد.`;
        extra = `<p class="text-xs text-muted mt-1 truncate max-w-[280px]">${n.postExcerpt}</p>`;
    } else if (n.type === 'COMMENT') {
        badgeIcon = 'message-circle'; badgeColor = 'bg-[#0084ff]';
        text = `<strong>${n.actorName}</strong> لێدوانێکی نووسی لەسەر پۆستەکەت:`;
        extra = `<div class="mt-2 px-3 py-2 bg-secondary rounded-lg text-sm italic border-r-2 border-[#0084ff]">"${n.commentText}"</div><p class="text-xs text-muted mt-1 truncate max-w-[280px]">${n.postExcerpt}</p>`;
    } else if (n.type === 'FOLLOW') {
        badgeIcon = 'user-plus'; badgeColor = 'bg-success';
        text = `<strong>${n.actorName}</strong> دەستی کرد بە شوێنکەوتنت.`;
        action = `<button onclick="toggleFollowBack('${n.id}')" class="px-3 py-1 rounded-full text-xs font-bold border border-hairline hover:bg-secondary transition-colors">${n.isFollowingBack ? 'شوێنکەوتوو' : 'شوێنکەوتنەوە'}</button>`;
    }

    return `
        <div class="px-4 py-3 flex gap-3 items-start hover:bg-secondary/50 transition-colors cursor-pointer ${!n.read ? 'bg-secondary/30' : ''} animate-fadeIn" onclick="handleNotifClick('${n.id}')">
            <div class="relative flex-shrink-0">
                <img src="${n.actorAvatar}" class="avatar-sm" alt="${n.actorName}">
                <div class="absolute -bottom-0.5 -right-0.5 ${badgeColor} text-white rounded-full p-0.5 border-2 border-primary">
                    <i data-lucide="${badgeIcon}" class="w-2.5 h-2.5"></i>
                </div>
            </div>
            <div class="flex-1 min-w-0">
                <p class="text-sm leading-snug">${text}</p>
                ${extra}
            </div>
            <div class="flex flex-col items-end gap-2 flex-shrink-0">
                <span class="text-[10px] text-muted whitespace-nowrap">${formatTimeAgo(n.timestamp)}</span>
                ${action}
            </div>
        </div>
    `;
}

window.setNotifFilter = (filter) => { state.notifFilter = filter; renderNotificationsView($('#main-content'), $('#main-header')); };
window.markAllRead = () => { state.notifications.forEach(n => n.read = true); saveState(); renderNotificationsView($('#main-content'), $('#main-header')); renderBottomBar(); showToast('هەموو ئاگادارییەکان خوێندرانەوە'); };
window.handleNotifClick = (id) => {
    const n = state.notifications.find(x => x.id === id);
    if (n && !n.read) { n.read = true; saveState(); renderBottomBar(); }
    if (n && n.postId) navigateTo('timeline');
};
window.toggleFollowBack = (notifId) => {
    const n = state.notifications.find(x => x.id === notifId);
    if (n) { n.isFollowingBack = !n.isFollowingBack; saveState(); renderNotificationsView($('#main-content'), $('#main-header')); }
};

// --- PROFILE ---
function renderProfile(container, header) {
    const u = state.currentUser;
    header.querySelector('h1').textContent = '';
    header.innerHTML = `<div class="flex items-center justify-between w-full px-2"><span class="font-bold text-lg" dir="ltr">@${u.handle}</span><button onclick="showEditProfileModal()" class="p-2 rounded-full hover:bg-secondary transition-colors"><i data-lucide="settings" class="w-5 h-5"></i></button></div>`;

    const myPosts = state.posts.filter(p => p.userId === u.id);

    container.innerHTML = `
        <div class="px-4 pt-4 pb-2 flex items-start gap-5 animate-fadeIn">
            <img src="${u.avatar}" class="avatar-lg" alt="${u.name}">
            <div class="flex-1 grid grid-cols-3 text-center gap-2 pt-1">
                <div><span class="font-bold text-lg block">${toKurdishNum(u.postsCount)}</span><span class="text-xs text-muted">پۆست</span></div>
                <div><span class="font-bold text-lg block">${toKurdishNum(u.followers)}</span><span class="text-xs text-muted">شوێنکەوتووان</span></div>
                <div><span class="font-bold text-lg block">${toKurdishNum(u.following)}</span><span class="text-xs text-muted">شوێنکەوتوو</span></div>
            </div>
        </div>
        <div class="px-4 py-2 animate-fadeIn">
            <h2 class="font-bold text-base">${u.name}</h2>
            <p class="text-sm text-muted mt-0.5 whitespace-pre-wrap">${u.bio}</p>
            <p class="text-sm text-muted mt-1 flex items-center gap-1"><i data-lucide="map-pin" class="w-3 h-3"></i> ${u.country}، ${u.city}</p>
        </div>
        <div class="px-4 py-3 flex gap-3 animate-fadeIn">
            <button onclick="showEditProfileModal()" class="flex-1 py-2 rounded-lg bg-secondary font-medium text-sm hover:opacity-80 transition-opacity">دەستکاریکردنی پڕۆفایل</button>
            <button onclick="shareProfile()" class="flex-1 py-2 rounded-lg bg-secondary font-medium text-sm hover:opacity-80 transition-opacity">هاوبەشیکردنی پڕۆفایل</button>
        </div>
        <div class="flex border-b border-hairline mt-2">
            <button class="flex-1 py-3 text-sm font-bold border-b-2 border-[var(--text-main)]">هەموو بڵاوکراوەکانم</button>
            <button class="flex-1 py-3 text-sm font-medium text-muted hover:text-[var(--text-main)] transition-colors">شیعرەکانم</button>
        </div>
        <div class="flex flex-col">${myPosts.map(p => createPostHTML(p)).join('<div class="post-divider"></div>')}</div>
    `;
    attachPostInteractions();
    lucide.createIcons({ strokeWidth: 1.75 });
}

window.shareProfile = () => showToast('لینکی پڕۆفایل کۆپی کرا');

// --- EDIT PROFILE MODAL ---
window.showEditProfileModal = () => {
    const u = state.currentUser;
    const cities = ['ئاکرێ','ئامەد','ئامێدی','ئورفا','ئیلام','باتمان','بانە','بێدلیس','بۆکان','پاوە','پێنجوێن','پیرانشار','تەقتەق','تکریت','جۆلەمێرگ','جوانڕۆ','چەمچەماڵ','چۆمان','حەسەکە','خانەقین','خۆی','خورماتوو','دێرسیم','دهۆک','دیواندەرە','ڕانیە','ڕەواندز','زاخۆ','زەڕایەن','سەردەشت','سەرپێڵی زەهاو','سەرێکانی','سەقز','سلێمانی','سنە','سۆران','سێرت','شنگال','شنۆ','شرنەخ','شەقڵاوە','عەفرین','قارس','قامیشلۆ','قەڵادزێ','قوچان','کرماشان','کەرکووک','کەلار','کۆبانێ','کۆیە','کفری','ماردین','ماکۆ','مەریوان','مەهاباد','مەلاطیە','مووش','نەغەدە','هەڵەبجە','هەولێر','وان'];
    
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 z-[150] flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm animate-fadeIn';
    modal.onclick = (e) => { if (e.target === modal) modal.remove(); };
    
    modal.innerHTML = `
        <div class="bg-primary w-full max-w-md rounded-t-3xl sm:rounded-3xl max-h-[90vh] overflow-y-auto shadow-2xl animate-slideUp">
            <div class="sticky top-0 bg-primary/90 backdrop-blur-md px-5 py-4 flex items-center justify-between border-b border-hairline z-10">
                <button onclick="this.closest('.fixed').remove()" class="text-muted font-medium">پاشگەزبوونەوە</button>
                <h3 class="font-bold text-lg">دەستکاریکردنی پڕۆفایل</h3>
                <button onclick="saveProfile(this)" class="text-accent font-bold">پاشەکەوت</button>
            </div>
            <div class="p-6 space-y-5">
                <div class="flex flex-col items-center gap-3">
                    <div class="relative">
                        <img id="edit-avatar-preview" src="${u.avatar}" class="avatar-lg border-4 border-secondary">
                        <label class="absolute bottom-0 right-0 bg-accent text-white p-1.5 rounded-full cursor-pointer shadow-lg hover:scale-110 transition-transform">
                            <i data-lucide="camera" class="w-4 h-4"></i>
                            <input type="file" accept="image/*" class="hidden" onchange="handleAvatarUpload(this)">
                        </label>
                    </div>
                    <span class="text-sm text-muted">گۆڕینی وێنەی پڕۆفایل</span>
                </div>
                <div class="space-y-1"><label class="text-xs font-bold text-muted px-1">ناوی پیشاندراو</label><input id="edit-name" value="${u.name}" class="w-full bg-secondary rounded-xl px-4 py-3 text-sm focus:ring-2 ring-accent/30 transition-all"></div>
                <div class="space-y-1"><label class="text-xs font-bold text-muted px-1">نازناو / یوزەرنەیم</label><div class="flex items-center bg-secondary rounded-xl overflow-hidden focus-within:ring-2 ring-accent/30 transition-all"><span class="pr-4 pl-2 text-muted font-bold" dir="ltr">@</span><input id="edit-handle" value="${u.handle}" dir="ltr" pattern="[a-z0-9_]+" class="flex-1 bg-transparent py-3 text-sm lowercase" oninput="this.value=this.value.toLowerCase().replace(/[^a-z0-9_]/g,'')"></div></div>
                <div class="space-y-1"><label class="text-xs font-bold text-muted px-1">ژیاننامە</label><textarea id="edit-bio" maxlength="160" rows="3" class="w-full bg-secondary rounded-xl px-4 py-3 text-sm focus:ring-2 ring-accent/30 transition-all resize-none">${u.bio}</textarea></div>
                <div class="grid grid-cols-2 gap-3">
                    <div class="space-y-1"><label class="text-xs font-bold text-muted px-1">وڵات</label><select id="edit-country" class="w-full bg-secondary rounded-xl px-4 py-3 text-sm appearance-none"><option selected>کوردستان</option></select></div>
                    <div class="space-y-1"><label class="text-xs font-bold text-muted px-1">شار</label><select id="edit-city" class="w-full bg-secondary rounded-xl px-4 py-3 text-sm appearance-none">${cities.map(c => `<option ${c===u.city?'selected':''}>${c}</option>`).join('')}</select></div>
                </div>
            </div>
        </div>
    `;
    $('#modals-container').appendChild(modal);
    lucide.createIcons({ strokeWidth: 1.75 });
};

window.handleAvatarUpload = (input) => {
    const file = input.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = 250; canvas.height = 250;
            const ctx = canvas.getContext('2d');
            const min = Math.min(img.width, img.height);
            ctx.drawImage(img, (img.width-min)/2, (img.height-min)/2, min, min, 0, 0, 250, 250);
            const base64 = canvas.toDataURL('image/jpeg', 0.85);
            $('#edit-avatar-preview').src = base64;
            $('#edit-avatar-preview').dataset.newAvatar = base64;
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
};

window.saveProfile = (btn) => {
    const newName = $('#edit-name').value.trim();
    const newHandle = $('#edit-handle').value.trim();
    const newBio = $('#edit-bio').value.trim();
    const newCity = $('#edit-city').value;
    const newAvatar = $('#edit-avatar-preview').dataset.newAvatar;
    
    if (!newName || !newHandle) return showToast('ناو و یوزەرنەیم پێویستن');
    
    state.currentUser.name = newName;
    state.currentUser.handle = newHandle;
    state.currentUser.bio = newBio;
    state.currentUser.city = newCity;
    if (newAvatar) state.currentUser.avatar = newAvatar;
    
    state.posts.forEach(p => {
        if (p.userId === state.currentUser.id) {
            p.authorName = newName; p.authorHandle = newHandle; p.authorAvatar = state.currentUser.avatar;
        }
    });
    
    saveState();
    btn.closest('.fixed').remove();
    navigateTo('profile');
    renderSidebar();
    renderBottomBar();
    showToast('پڕۆفایل نوێکرایەوە');
};

// --- CREATOR CANVAS ---
function renderCreatorCanvas() {
    const modal = document.createElement('div');
    modal.id = 'creator-canvas';
    modal.className = 'fixed inset-0 z-[100] bg-primary flex flex-col animate-fadeIn';
    modal.innerHTML = `
        <div class="px-4 h-14 flex items-center justify-between border-b border-hairline">
            <button onclick="closeCreator()" class="p-2 rounded-full hover:bg-secondary transition-colors"><i data-lucide="x" class="w-6 h-6"></i></button>
            <h3 class="font-bold text-lg">پۆستی نوێ</h3>
            <button onclick="publishPost()" class="px-4 py-1.5 rounded-full bg-[var(--text-main)] text-[var(--bg-primary)] font-bold text-sm disabled:opacity-50 hover:opacity-90 transition-opacity">بڵاوکردنەوە</button>
        </div>
        <div class="flex-1 p-4 flex gap-3">
            <img src="${state.currentUser.avatar}" class="avatar-sm flex-shrink-0 mt-1">
            <textarea id="creator-text" placeholder="چی لە دڵتدایە؟ لێرە بینووسە..." class="flex-1 bg-transparent text-lg resize-none focus:outline-none placeholder:text-muted/50 leading-relaxed"></textarea>
        </div>
        <div class="px-4 py-3 border-t border-hairline flex items-center gap-3">
            <button id="poetry-toggle" onclick="togglePoetryMode()" class="flex items-center gap-2 px-3 py-1.5 rounded-full border border-hairline text-sm font-medium hover:bg-secondary transition-colors">
                <i data-lucide="feather" class="w-4 h-4"></i> شێوازی شیعر
            </button>
        </div>
    `;
    $('#modals-container').appendChild(modal);
    setTimeout(() => $('#creator-text').focus(), 100);
    lucide.createIcons({ strokeWidth: 1.75 });
}

let isCreatorPoetry = false;
window.togglePoetryMode = () => {
    isCreatorPoetry = !isCreatorPoetry;
    const ta = $('#creator-text');
    const btn = $('#poetry-toggle');
    if (isCreatorPoetry) {
        ta.style.fontFamily = "'Amiri', serif"; ta.style.fontSize = "19px"; ta.style.lineHeight = "2.15"; ta.style.textAlign = "center";
        btn.classList.add('bg-secondary', 'border-[var(--text-main)]');
    } else {
        ta.style.fontFamily = "'Vazirmatn', sans-serif"; ta.style.fontSize = "18px"; ta.style.lineHeight = "1.75"; ta.style.textAlign = "right";
        btn.classList.remove('bg-secondary', 'border-[var(--text-main)]');
    }
};

window.closeCreator = () => { $('#creator-canvas')?.remove(); isCreatorPoetry = false; navigateTo(state.activeView === 'creator' ? 'timeline' : state.activeView); };

window.publishPost = () => {
    const text = $('#creator-text').value.trim();
    if (!text) return showToast('تکایە شتێک بنووسە');
    const newPost = {
        id: `p_${Date.now()}`, userId: state.currentUser.id, authorName: state.currentUser.name, authorHandle: state.currentUser.handle, authorAvatar: state.currentUser.avatar,
        content: text, isPoetry: isCreatorPoetry, likes: 0, comments: 0, shares: 0, timestamp: new Date().toISOString(), likedByMe: false, savedByMe: false
    };
    state.posts.unshift(newPost);
    state.currentUser.postsCount++;
    saveState();
    closeCreator();
    navigateTo('timeline');
    showToast('پۆستەکەت بڵاوکرایەوە');
};

// --- CHAT SYSTEM ---
function renderChatList(container, header) {
    header.querySelector('h1').textContent = 'نامەکان';
    const dms = state.chats.filter(c => c.type === 'dm');
    const groups = state.chats.filter(c => c.type === 'group');
    container.innerHTML = `
        <div class="flex gap-2 px-4 py-3 border-b border-hairline sticky top-14 bg-primary z-30">
            <button class="flex-1 py-2 rounded-lg bg-[var(--text-main)] text-[var(--bg-primary)] font-medium text-sm">چاتەکان</button>
            <button class="flex-1 py-2 rounded-lg bg-secondary text-muted font-medium text-sm">گرووپەکان</button>
        </div>
        <div class="divide-y divide-hairline">
            ${[...dms, ...groups].map(chat => `
                <div onclick="navigateTo('chat', {chatId:'${chat.id}'})" class="px-4 py-3 flex items-center gap-3 hover:bg-secondary/50 transition-colors cursor-pointer animate-fadeIn">
                    <div class="relative"><img src="${chat.avatar}" class="avatar-md">${chat.online ? '<span class="absolute bottom-0 right-0 w-3 h-3 bg-success rounded-full border-2 border-primary"></span>' : ''}</div>
                    <div class="flex-1 min-w-0">
                        <div class="flex justify-between items-baseline"><h4 class="font-bold text-sm truncate">${chat.name}</h4><span class="text-[10px] text-muted flex-shrink-0">${chat.time}</span></div>
                        <p class="text-sm text-muted truncate mt-0.5">${chat.type === 'group' ? `${toKurdishNum(chat.members)} ئەندام` : chat.lastMsg}</p>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
    lucide.createIcons({ strokeWidth: 1.75 });
}

function renderChatRoom(container, header) {
    const chat = state.chats.find(c => c.id === state.activeChatId);
    if (!chat) return navigateTo('chat');
    header.innerHTML = `<div class="flex items-center gap-3 w-full"><button onclick="navigateTo('chat')" class="p-2 -mr-2 rounded-full hover:bg-secondary transition-colors"><i data-lucide="arrow-right" class="w-5 h-5"></i></button><img src="${chat.avatar}" class="avatar-sm"><div><h3 class="font-bold text-base leading-tight">${chat.name}</h3><p class="text-[10px] text-muted">${chat.type === 'group' ? `${toKurdishNum(chat.members)} ئەندام` : 'چالاکە'}</p></div></div>`;
    const msgs = [{ from: 'them', text: 'سڵاو! چۆنیت؟', time: '١٠:٢٨' },{ from: 'me', text: 'سڵاو، سوپاس! خەریکی پڕۆژەی مەکۆم.', time: '١٠:٢٩' },{ from: 'them', text: 'زۆر باشە! پێویستت بە یارمەتی هەیە؟', time: '١٠:٣٠' }];
    container.innerHTML = `
        <div class="flex-1 p-4 flex flex-col gap-3 min-h-[calc(100vh-140px)] animate-fadeIn">
            ${msgs.map(m => `<div class="flex ${m.from === 'me' ? 'justify-end' : 'justify-start gap-2'} items-end">${m.from === 'them' ? `<img src="${chat.avatar}" class="avatar-xs mb-1">` : ''}<div class="${m.from === 'me' ? 'bubble-out' : 'bubble-in'}"><p class="text-sm">${m.text}</p><span class="text-[9px] opacity-60 block text-left mt-1">${m.time}</span></div></div>`).join('')}
        </div>
        <div class="smart-input-container">
            <textarea id="chat-input" class="smart-textarea" placeholder="نامەیەک بنووسە..." rows="1" oninput="autoExpandChat(this)"></textarea>
            <button id="chat-send-btn" class="send-btn" onclick="sendChatMsg()"><i data-lucide="arrow-up" class="w-5 h-5"></i></button>
        </div>
    `;
    lucide.createIcons({ strokeWidth: 1.75 });
}

window.autoExpandChat = (ta) => {
    ta.style.height = 'auto'; ta.style.height = Math.min(ta.scrollHeight, 96) + 'px';
    const btn = $('#chat-send-btn');
    if (ta.value.trim()) btn.classList.add('visible'); else btn.classList.remove('visible');
};
window.sendChatMsg = () => { const ta = $('#chat-input'); if (!ta.value.trim()) return; showToast('نامە نێردرا (دەمو)'); ta.value = ''; autoExpandChat(ta); };

// --- LIBRARY & ARCHIVE ---
function renderLibrary(container, header) {
    header.querySelector('h1').textContent = 'کتێبخانە';
    const totalWords = state.library.reduce((a,b) => a + b.words, 0);
    const hero = state.library[0];
    container.innerHTML = `
        <div class="px-4 pt-5 pb-3 flex items-start justify-between gap-4 animate-fadeIn">
            <div><h2 class="font-bold text-xl leading-tight">کتێبخانە و ئەرشیفی کراوە</h2><p class="text-xs text-muted mt-1">ژێرخانی دەقی خاوی کوردی بە ستانداردی UTF-8</p></div>
            <button class="flex items-center gap-1 px-3 py-1.5 rounded-full bg-[var(--text-main)] text-[var(--bg-primary)] text-xs font-bold flex-shrink-0 hover:opacity-90 transition-opacity"><i data-lucide="plus" class="w-3 h-3"></i> ناردنی دەق</button>
        </div>
        <div class="mx-4 mb-4 p-4 rounded-2xl bg-secondary flex justify-around text-center animate-fadeIn">
            <div><span class="font-bold text-lg block">${toKurdishNum(state.library.length)}</span><span class="text-[10px] text-muted">بەرهەم</span></div>
            <div><span class="font-bold text-lg block">${toKurdishNum(totalWords)}</span><span class="text-[10px] text-muted">وشە</span></div>
            <div><span class="font-bold text-lg block text-success">UTF-8</span><span class="text-[10px] text-muted">ستاندارد</span></div>
        </div>
        <div class="px-4 mb-4 animate-fadeIn">
            <div class="relative"><i data-lucide="search" class="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted"></i><input type="text" placeholder="گەڕان لە ناونیشان، نووسەر، یان ناوەڕۆکی دەق..." class="w-full bg-secondary rounded-xl pr-10 pl-4 py-2.5 text-sm focus:ring-2 ring-accent/30 transition-all"></div>
            <div class="flex gap-2 mt-3 overflow-x-auto hide-scrollbar">${['هەموو','دەقی خاو TXT','دیوانی شیعر','لێکۆڵینەوە','فەرهەنگ و زمان'].map((t,i) => `<button class="px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${i===0?'bg-[var(--text-main)] text-[var(--bg-primary)]':'bg-secondary text-muted hover:opacity-80'}">${t}</button>`).join('')}</div>
        </div>
        <div class="library-hero animate-fadeIn">
            <span class="text-[10px] font-bold uppercase tracking-wider opacity-70">شاکاری هەڵبژێردراو · UTF-8 TXT</span>
            <h3 class="font-serif text-2xl font-bold mt-2 text-[#fafafa]">${hero.title}</h3>
            <p class="text-sm opacity-80 mt-1">${hero.author} · ${hero.category}</p>
            <p class="font-serif text-base mt-3 opacity-90 leading-relaxed line-clamp-2">${hero.excerpt}</p>
            <div class="flex items-center justify-between mt-4 pt-4 border-t border-white/10">
                <span class="text-xs opacity-60">${toKurdishNum(hero.words)} وشە · ${hero.size}</span>
                <div class="flex gap-2">
                    <button onclick="openReader('${hero.id}')" class="px-4 py-1.5 rounded-full bg-white text-black text-xs font-bold hover:opacity-90 transition-opacity">خوێندنەوە</button>
                    <button onclick="downloadTxt('${hero.id}')" class="w-8 h-8 rounded-full border border-white/30 flex items-center justify-center hover:bg-white/10 transition-colors"><i data-lucide="download" class="w-4 h-4"></i></button>
                </div>
            </div>
        </div>
        <div class="px-4 pb-24 space-y-3">
            ${state.library.slice(1).map((item, idx) => `
                <div class="p-4 rounded-2xl border border-hairline bg-primary flex gap-3 hover:border-[var(--text-muted)] transition-all duration-200 animate-fadeIn">
                    <div class="w-11 h-11 rounded-xl bg-secondary flex flex-col items-center justify-center flex-shrink-0"><span class="font-bold text-sm">${toKurdishNum(idx+2).padStart(2,'٠')}</span><span class="text-[8px] text-muted">TXT</span></div>
                    <div class="flex-1 min-w-0">
                        <span class="text-[10px] text-muted">${item.category} · ${item.format}</span>
                        <h4 class="font-serif font-bold text-[19px] leading-tight mt-0.5 cursor-pointer hover:text-accent transition-colors" onclick="openReader('${item.id}')">${item.title}</h4>
                        <p class="text-[13px] text-muted mt-0.5">${item.author}</p>
                        <p class="text-[13px] text-muted/70 mt-1.5 line-clamp-2 leading-relaxed">${item.excerpt}</p>
                        <div class="flex gap-2 mt-2.5 text-[11px] text-muted"><span class="px-2 py-0.5 rounded bg-secondary">${toKurdishNum(item.words)} وشە</span><span class="px-2 py-0.5 rounded bg-secondary">${item.size}</span><span class="px-2 py-0.5 rounded bg-secondary text-success">UTF-8</span></div>
                    </div>
                    <div class="flex flex-col gap-2 flex-shrink-0">
                        <button onclick="openReader('${item.id}')" class="w-9 h-9 rounded-full bg-secondary flex items-center justify-center hover:bg-hairline transition-colors"><i data-lucide="book-open" class="w-4 h-4"></i></button>
                        <button onclick="downloadTxt('${item.id}')" class="w-9 h-9 rounded-full bg-secondary flex items-center justify-center hover:bg-hairline transition-colors"><i data-lucide="download" class="w-4 h-4"></i></button>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
    lucide.createIcons({ strokeWidth: 1.75 });
}

// --- DISTRACTION-FREE READER ---
window.openReader = (libId) => {
    const item = state.library.find(l => l.id === libId);
    if (!item) return;
    const modal = document.createElement('div');
    modal.id = 'reader-modal';
    modal.className = 'fixed inset-0 z-[130] reader-theme-white flex flex-col transition-colors duration-300 animate-fadeIn';
    modal.innerHTML = `
        <div class="sticky top-0 px-4 h-12 flex items-center justify-between bg-inherit/90 backdrop-blur-md border-b border-black/5 z-10">
            <button onclick="closeReader()" class="p-2 rounded-full hover:bg-black/5 transition-colors"><i data-lucide="x" class="w-5 h-5"></i></button>
            <div class="flex items-center gap-1"><button onclick="adjustFontSize(-1)" class="p-2 rounded-full hover:bg-black/5 text-sm font-bold transition-colors">A-</button><button onclick="adjustFontSize(1)" class="p-2 rounded-full hover:bg-black/5 text-base font-bold transition-colors">A+</button></div>
            <div class="flex items-center gap-1"><button onclick="setReaderTheme('white')" class="w-6 h-6 rounded-full bg-white border border-gray-300 hover:scale-110 transition-transform"></button><button onclick="setReaderTheme('sepia')" class="w-6 h-6 rounded-full bg-[#f8f1e5] border border-gray-300 hover:scale-110 transition-transform"></button><button onclick="setReaderTheme('dark')" class="w-6 h-6 rounded-full bg-[#09090b] border border-gray-700 hover:scale-110 transition-transform"></button></div>
            <div class="flex items-center gap-1"><button onclick="toggleReaderScript()" id="reader-script-btn" class="px-2 py-1 rounded text-[10px] font-bold border border-current hover:opacity-70 transition-opacity">لاتینی</button><button onclick="copyReaderText()" class="p-2 rounded-full hover:bg-black/5 transition-colors"><i data-lucide="copy" class="w-4 h-4"></i></button><button onclick="downloadTxt('${item.id}')" class="p-2 rounded-full hover:bg-black/5 transition-colors"><i data-lucide="download" class="w-4 h-4"></i></button></div>
        </div>
        <div id="reader-content" class="flex-1 overflow-y-auto px-6 py-8 font-serif text-lg leading-loose max-w-2xl mx-auto w-full" style="font-size:18px;">
            <h1 class="text-2xl font-bold mb-2 text-center">${item.title}</h1>
            <p class="text-center opacity-60 mb-8 text-sm">${item.author}</p>
            <div id="reader-body" class="whitespace-pre-wrap">${item.fullText}</div>
        </div>
    `;
    $('#modals-container').appendChild(modal);
    lucide.createIcons({ strokeWidth: 1.75 });
};

let readerFontSize = 18;
window.adjustFontSize = (delta) => { readerFontSize = Math.max(14, Math.min(28, readerFontSize + delta)); $('#reader-content').style.fontSize = readerFontSize + 'px'; };
window.setReaderTheme = (theme) => { const modal = $('#reader-modal'); modal.classList.remove('reader-theme-white', 'reader-theme-sepia', 'reader-theme-dark'); modal.classList.add(`reader-theme-${theme}`); };
window.toggleReaderScript = () => {
    const body = $('#reader-body'); const btn = $('#reader-script-btn');
    const libId = $('#reader-modal').querySelector('[onclick*="downloadTxt"]').getAttribute('onclick').match(/'([^']+)'/)[1];
    const item = state.library.find(l => l.id === libId);
    if (body.dir === 'rtl') { body.textContent = transliterateKurdishToLatin(item.fullText); body.dir = 'ltr'; body.style.textAlign = 'left'; btn.textContent = 'ئارامی'; }
    else { body.textContent = item.fullText; body.dir = 'rtl'; body.style.textAlign = 'right'; btn.textContent = 'لاتینی'; }
};
window.copyReaderText = () => { navigator.clipboard.writeText($('#reader-body').textContent); showToast('دەق کۆپی کرا'); };
window.closeReader = () => { $('#reader-modal')?.remove(); };

// --- SAVED POSTS VIEW ---
function renderSavedPosts(container, header) {
    header.querySelector('h1').textContent = 'پاشەکەوتکراوەکان';
    const saved = state.posts.filter(p => state.savedPostIds.includes(p.id));
    container.innerHTML = `<div class="px-4 py-3 border-b border-hairline animate-fadeIn"><p class="text-xs text-muted flex items-center gap-1"><i data-lucide="lock" class="w-3 h-3"></i> تەنها خۆت دەیبینیت</p></div>${saved.length === 0 ? '<p class="text-center text-muted py-12 animate-fadeIn">هیچ پۆستێکت پاشەکەوت نەکردووە</p>' : saved.map(p => createPostHTML(p)).join('<div class="post-divider"></div>')}`;
    attachPostInteractions();
    lucide.createIcons({ strokeWidth: 1.75 });
}

// --- SETTINGS MODAL ---
window.showSettingsModal = () => {
    closeDrawer();
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 z-[150] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fadeIn p-4';
    modal.onclick = (e) => { if (e.target === modal) modal.remove(); };
    modal.innerHTML = `
        <div class="bg-primary w-full max-w-sm rounded-3xl p-6 shadow-2xl animate-scaleIn">
            <h3 class="font-bold text-xl mb-6 text-center">ڕێکخستنەکان</h3>
            <div class="space-y-4">
                <div class="flex items-center justify-between p-3 rounded-xl bg-secondary"><span class="font-medium text-sm">دۆخی تاریک</span><button onclick="toggleTheme(); this.closest('.fixed').remove(); showSettingsModal();" class="w-12 h-7 rounded-full relative transition-colors ${document.documentElement.classList.contains('dark') ? 'bg-success' : 'bg-gray-300'}"><span class="absolute top-1 ${document.documentElement.classList.contains('dark') ? 'right-1' : 'right-6'} w-5 h-5 bg-white rounded-full shadow transition-all duration-300"></span></button></div>
                <button onclick="testNotification()" class="w-full p-3 rounded-xl bg-secondary text-sm font-medium hover:opacity-80 transition-opacity text-right flex items-center justify-between"><span>تاقیکردنەوەی ئاگاداری</span><i data-lucide="bell-ring" class="w-4 h-4 text-muted"></i></button>
                <button onclick="resetDemoData()" class="w-full p-3 rounded-xl bg-danger/10 text-danger text-sm font-medium hover:bg-danger/20 transition-colors text-right flex items-center justify-between"><span>ڕیسێتکردنی داتای دەمو</span><i data-lucide="rotate-ccw" class="w-4 h-4"></i></button>
            </div>
            <button onclick="this.closest('.fixed').remove()" class="w-full mt-6 py-3 rounded-xl font-bold text-muted hover:bg-secondary transition-colors">داخستن</button>
        </div>
    `;
    $('#modals-container').appendChild(modal);
    lucide.createIcons({ strokeWidth: 1.75 });
};

window.testNotification = () => {
    const types = ['LIKE', 'COMMENT', 'FOLLOW'];
    const type = types[Math.floor(Math.random() * types.length)];
    createNotification(type, { actorName: 'تێستی سیستەم', actorHandle: 'test_system', actorAvatar: 'https://api.dicebear.com/9.x/notionists/svg?seed=Test', postId: state.posts[0]?.id, postExcerpt: state.posts[0]?.content?.substring(0,40)+'...', commentText: type==='COMMENT'?'ئەمە لێدوانێکی تاقیکردنەوەیە.':null });
    showToast(`ئاگاداری ${type} دروست کرا`);
};
window.resetDemoData = () => { localStorage.removeItem(STORAGE_KEY); location.reload(); };

// ============================================================================
// 5. UTILITIES
// ============================================================================
function toKurdishNum(num) {
    const kurdishDigits = ['٠','١','٢','٣','٤','٥','٦','٧','٨','٩'];
    return String(num).replace(/\d/g, d => kurdishDigits[d]);
}

function formatTimeAgo(isoString) {
    const diff = Date.now() - new Date(isoString).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'ئێستا';
    if (mins < 60) return `${toKurdishNum(mins)} خولەک`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${toKurdishNum(hrs)} کاتژمێر`;
    const days = Math.floor(hrs / 24);
    if (days < 7) return `${toKurdishNum(days)} ڕۆژ`;
    return new Date(isoString).toLocaleDateString('ckb-IQ');
}

function showToast(msg) {
    const existing = $('.toast-msg');
    if (existing) existing.remove();
    const toast = document.createElement('div');
    toast.className = 'toast-msg fixed top-20 left-1/2 -translate-x-1/2 z-[200] bg-[var(--text-main)] text-[var(--bg-primary)] px-5 py-2.5 rounded-full text-sm font-medium shadow-xl animate-fadeIn pointer-events-none';
    toast.textContent = msg;
    document.body.appendChild(toast);
    setTimeout(() => { toast.style.opacity = '0'; toast.style.transition = 'opacity 0.3s'; setTimeout(() => toast.remove(), 300); }, 2000);
}

function refreshCurrentView() { navigateTo(state.activeView); }
function updateJsonLd() {
    const ld = { "@context": "https://schema.org", "@type": "WebApplication", "name": "Meko", "description": "Open digital infrastructure for Kurdish language corpus", "inLanguage": "ku", "applicationCategory": "SocialMediaPosting" };
    const el = document.getElementById('meko-jsonld');
    if (el) el.textContent = JSON.stringify(ld);
}

// Initialize App
document.addEventListener('DOMContentLoaded', initApp);
