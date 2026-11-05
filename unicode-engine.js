/**
 * ============================================================================
 * MEKO (مەکۆ) — ADVANCED KURDISH LINGUISTIC, UNICODE & AI CORPUS ENGINE
 * Phase 3 of 4 · File: unicode-engine.js
 * ============================================================================
 * Capabilities:
 * 1. Real-Time Zero-Jump UTF-8 Kurdish Normalizer (Input & Paste)
 * 2. Morphological Stemmer & Context-Aware Aramaic-to-Latin (Hawar) Engine
 * 3. Phonotactic Epenthesis (Automatic Bizroke 'i' Insertion)
 * 4. Proper Noun & Poetic Verse Auto-Capitalizer
 * 5. Prosodic Syllable Counter (کێشی بڕگەیی) & Open AI Corpus JSONL Builder
 * ============================================================================
 */

(function (global) {
  'use strict';

  /* ==========================================================================
   * 1. SILENT REAL-TIME KURDISH UTF-8 NORMALIZER
   * ========================================================================== */

  /**
   * Converts legacy Arabic, Persian, and non-standard keyboard characters
   * into strict, canonical Central Kurdish UTF-8 Unicode.
   * @param {string} input
   * @returns {string}
   */
  function normalizeKurdishText(input) {
    if (!input || typeof input !== 'string') return '';

    let text = input;

    // 1.1 Normalize Arabic Presentation Forms & Lam-Alef Ligatures
    text = text
      .replace(/\uFEFB|\uFEFC/g, 'لا')
      .replace(/\uFEF7|\uFEF8/g, 'لئە')
      .replace(/\uFEF9|\uFEFA/g, 'لئی')
      .replace(/\uFEF5|\uFEF6/g, 'لئا');

    // 1.2 Convert Compound Arabic Hamza / Maddah forms into Kurdish Onsets
    text = text
      .replace(/\u0622/g, 'ئا') // آ -> ئا
      .replace(/\u0623/g, 'ئە') // أ -> ئە
      .replace(/\u0625/g, 'ئی') // إ -> ئی
      .replace(/\u0624/g, 'ۆ')  // ؤ -> ۆ
      .replace(/\u0675/g, 'ئا') // ٵ -> ئا
      .replace(/\u0676/g, 'ئۆ') // ٶ -> ئۆ
      .replace(/\u0677/g, 'ئو') // ٷ -> ئو
      .replace(/\u0678/g, 'ئی'); // ٸ -> ئی

    // 1.3 Normalize Heh + Zero-Width Non-Joiner (ه‍) into standard Kurdish Ae (ە)
    text = text
      .replace(/\u0647\u200C/g, 'ە')
      .replace(/\u06BE\u200C/g, 'ە')
      .replace(/\u06C1\u200C/g, 'ە');

    // 1.4 Canonical Single-Codepoint Replacements
    text = text
      .replace(/\u0643/g, 'ک') // Arabic Kaf (ك) -> Kurdish Ke (ک \u06A9)
      .replace(/\u06AC/g, 'گ') // Old Gaf -> Kurdish Ge (گ \u06AF)
      .replace(/\u06AD/g, 'گ')
      .replace(/\u06AF/g, 'گ')
      .replace(/\u064A/g, 'ی') // Arabic Yeh (ي) -> Kurdish Ye (ی \u06CC)
      .replace(/\u0649/g, 'ی') // Alef Maksura (ى) -> Kurdish Ye (ی \u06CC)
      .replace(/\u06D2/g, 'ێ') // Yeh Barree -> Kurdish Ee (ێ \u06CE)
      .replace(/\u0629/g, 'ە') // Teh Marbuta (ة) -> Kurdish Ae (ە \u06D5)
      .replace(/\u06C0/g, 'ە') // Heh with Yeh above (ۀ) -> Kurdish Ae (ە \u06D5)
      .replace(/\u06C2/g, 'ە')
      .replace(/\u06C1/g, 'ه') // Heh Goal (ہ) -> Kurdish Heh (ه \u0647)
      .replace(/\u06BE/g, 'ه') // Heh Doachashmee (ھ) -> Kurdish Heh (ه \u0647)
      .replace(/\u0695/g, 'ڕ') // Canonical Rre (\u0695)
      .replace(/\u0692/g, 'ڕ')
      .replace(/\u06B5/g, 'ڵ') // Canonical Lle (\u06B5)
      .replace(/\u06B6/g, 'ڵ')
      .replace(/\u06B7/g, 'ڵ')
      .replace(/\u06C6/g, 'ۆ') // Canonical Oe (\u06C6)
      .replace(/\u06CE/g, 'ێ') // Canonical Ee (\u06CE)
      .replace(/\u06A4/g, 'ڤ'); // Canonical Ve (\u06A4)

    // 1.5 Normalize Eastern Persian digits (۰-۹) into standard Kurdish/Arabic-Indic digits (٠-٩)
    const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
    const kurdishDigits = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
    for (let i = 0; i < 10; i++) {
      text = text.replace(new RegExp(persianDigits[i], 'g'), kurdishDigits[i]);
    }

    // 1.6 Clean decorative Tatweel / Kashida (ـ \u0640)
    // Keep only single tatweel after ه when used as standalone phoneme display "هـ", strip everywhere else
    text = text.replace(/([^\u0647])\u0640+/g, '$1');
    text = text.replace(/^\u0640+/g, '');
    text = text.replace(/\u0647\u0640+(?=[\u0621-\u06FF])/g, 'ه');
    text = text.replace(/\u0647\u0640{2,}/g, 'هـ');

    return text;
  }

  /**
   * Normalizes an HTML <input> or <textarea> element in-place while
   * mathematically recalculating selectionStart and selectionEnd so the
   * user's cursor never jumps during live typing or pasting.
   * @param {HTMLInputElement|HTMLTextAreaElement} el
   */
  function normalizeInputElement(el) {
    if (!el || typeof el.value !== 'string') return;

    const inputType = (el.getAttribute('type') || 'text').toLowerCase();
    if (['password', 'email', 'url', 'number', 'date', 'time', 'file', 'color', 'range'].includes(inputType)) {
      return;
    }

    // Respect Latin-only fields (such as @username handles)
    if (
      (el.dataset && (el.dataset.latinOnly === 'true' || el.dataset.noUnicode === 'true')) ||
      el.id === 'edit-username' ||
      el.name === 'username'
    ) {
      return;
    }

    const original = el.value;
    const normalized = normalizeKurdishText(original);

    if (original === normalized) return;

    const selStart = typeof el.selectionStart === 'number' ? el.selectionStart : original.length;
    const selEnd = typeof el.selectionEnd === 'number' ? el.selectionEnd : original.length;

    // Normalize the exact prefix before the cursor to compute the true post-normalization offset
    const nextStart = normalizeKurdishText(original.slice(0, selStart)).length;
    const nextEnd = normalizeKurdishText(original.slice(0, selEnd)).length;

    el.value = normalized;

    try {
      el.setSelectionRange(nextStart, nextEnd);
    } catch (_) {
      // Ignore on inputs that do not support selection ranges
    }
  }

  /**
   * Attaches global capture-phase listeners for all text inputs and textareas.
   */
  function bindGlobalUnicodeListeners() {
    if (typeof document === 'undefined') return;

    document.addEventListener(
      'input',
      function (e) {
        const target = e.target;
        if (!target) return;
        if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
          normalizeInputElement(target);
        }
      },
      true
    );

    document.addEventListener(
      'paste',
      function (e) {
        const target = e.target;
        if (!target) return;
        if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
          requestAnimationFrame(function () {
            normalizeInputElement(target);
          });
        }
      },
      true
    );
  }

  /* ==========================================================================
   * 2. MORPHOLOGICAL & CONTEXTUAL ARAMAIC-TO-LATIN (HAWAR) ENGINE
   * ========================================================================== */

  const VOWEL_CHARS = new Set(['ا', 'ە', 'ێ', 'ۆ', 'ی', 'و']);
  const PURE_VOWELS = new Set(['ا', 'ە', 'ێ', 'ۆ']);

  /**
   * Comprehensive Root & Word Lexicon for Central Kurdish words containing
   * unwritten short 'i' (بزرۆکە / Bizroke), classical poetry terms, philosophical
   * neologisms, and proper nouns.
   */
  const BIZROKE_LEXICON = {
    // Pronouns & Particles
    'من': 'min',
    'منیش': 'minîş',
    'تۆ': 'to',
    'ئەو': 'ew',
    'ئێمە': 'ême',
    'ئێوە': 'êwe',
    'ئەوان': 'ewan',
    'ئەم': 'em',
    'ئەمانە': 'emane',
    'ئەوانە': 'ewane',
    'چۆن': 'çon',
    'چەند': 'çend',
    'کام': 'kam',
    'کێ': 'kê',
    'لە': 'le',
    'بە': 'be',
    'لەگەڵ': 'legel',
    'وەک': 'wek',
    'پێش': 'pêş',
    'دوای': 'dway',
    'ژێر': 'jêr',
    'سەر': 'ser',

    // High-Frequency Nouns & Classical Poetic Vocabulary (Baban School)
    'دڵ': 'dil',
    'دڵم': 'dilim',
    'دڵت': 'dilit',
    'دڵی': 'dilî',
    'دڵدار': 'dildar',
    'دڵداری': 'dildarî',
    'دڵبەر': 'dilber',
    'دڵتەنگ': 'dilteng',
    'دڵشکاو': 'dilşikaw',
    'گوڵ': 'gul',
    'گوڵی': 'gulî',
    'گوڵزار': 'gulzar',
    'گوڵستان': 'gulistan',
    'گوڵشەن': 'gulşen',
    'بلبل': 'bilbil',
    'بولبول': 'bulbul',
    'عەشق': 'eşq',
    'عیشق': 'îşq',
    'عاشق': 'aşiq',
    'مەعشووق': 'meşûq',
    'فیراق': 'fîraq',
    'هیجران': 'hîcran',
    'هیجر': 'hîcir',
    'وەسڵ': 'wesil',
    'ویساڵ': 'wîsal',
    'غەزەل': 'xezel',
    'شیعر': 'şîr',
    'شاعیر': 'şaîr',
    'بەیت': 'beyt',
    'چوارینە': 'çwarîne',
    'کێش': 'kêş',
    'عەرووز': 'erûz',
    'بڕگە': 'birge',
    'بڕگەیی': 'birgeyî',
    'قافیە': 'qafiye',
    'ڕەدیف': 'redîf',
    'مەجاز': 'mecaz',
    'خەیاڵ': 'xeyal',
    'حوجرە': 'hucre',
    'دیوان': 'dîwan',
    'قەڵەم': 'qelem',
    'مەرەکەب': 'merekeb',
    'پەڕە': 'pere',
    'کتێب': 'kitêb',
    'زمان': 'ziman',
    'زمانی': 'zimanî',
    'زاراوە': 'zarawe',
    'ڕێزمان': 'rêziman',
    'ڕێنووس': 'rênûs',
    'چاوگ': 'çawig',
    'فەرهەنگ': 'ferheng',
    'وشە': 'wişe',
    'وشەی': 'wişey',
    'وشەکان': 'wişekan',
    'وشەیەک': 'wişeyek',
    'ڕستە': 'riste',
    'پەخشان': 'pexşan',
    'ئەدەب': 'edeb',
    'ئەدەبیات': 'edebiyat',
    'داڤین': 'davîn',
    'ئاوەز': 'awez',
    'هزر': 'hizir',
    'بیر': 'bîr',
    'ژیری': 'jîrî',
    'ژیریی': 'jîrîy',
    'دەستکرد': 'destkird',
    'جوانی': 'ciwanî',
    'جوان': 'ciwan',
    'حەقیقەت': 'heqîqet',
    'ڕۆح': 'roh',
    'گیان': 'giyan',
    'ژین': 'jîn',
    'ژیان': 'jiyan',
    'مەرگ': 'merg',
    'عومر': 'umir',
    'بەخت': 'bext',
    'چارەنووس': 'çarenûs',
    'زەمانە': 'zemane',
    'چەرخ': 'çerx',
    'گەردوون': 'gerdûn',
    'ئاسمان': 'asman',
    'ئەستێرە': 'estêre',
    'ستێر': 'stêr',
    'مانگ': 'mang',
    'خۆر': 'xor',
    'ڕۆژ': 'roj',
    'شەو': 'şew',
    'شەوان': 'şewan',
    'بەیانی': 'beyanî',
    'ئێوارە': 'êware',
    'فرمێسک': 'firmêsk',
    'گریان': 'giryan',
    'پێکەنین': 'pêkenîn',
    'خەندە': 'xende',
    'برین': 'birîn',
    'بریندار': 'birîndar',
    'ژان': 'jan',
    'ئازار': 'azar',
    'خەم': 'xem',
    'خەفەت': 'xefet',
    'سەبر': 'sebir',
    'ئارام': 'aram',
    'تەمەن': 'temen',
    'وڵات': 'wilat',
    'نیشتمان': 'nîştiman',
    'خاک': 'xak',
    'ئاگر': 'agir',
    'ئاو': 'aw',
    'با': 'ba',
    'باران': 'baran',
    'بەفر': 'befir',
    'شاخ': 'şax',
    'چیا': 'çiya',
    'دەشت': 'deşt',
    'ڕووبار': 'rûbar',
    'دەریا': 'derya',
    'درەخت': 'dirext',
    'گەڵا': 'gela',
    'سێبەر': 'sêber',
    'تریفە': 'tirîfe',
    'شنە': 'şine',
    'نەسیم': 'nesîm',
    'زووڵف': 'zûlf',
    'پرچ': 'pirç',
    'چاو': 'çaw',
    'برۆ': 'biro',
    'مژۆڵ': 'mijol',
    'لێو': 'lêw',
    'ڕووخسار': 'rûxsar',
    'نیگا': 'nîga',
    'باڵا': 'bala',
    'قەد': 'qed',
    'سینگ': 'sîng',
    'مشت': 'mişt',
    'پەنجە': 'pence',
    'مل': 'mil',
    'پشت': 'pişt',
    'ژن': 'jin',
    'پیاو': 'piyaw',
    'مرۆڤ': 'mirov',
    'منداڵ': 'mindal',
    'هاوڕێ': 'hawrê',
    'دۆست': 'dost',
    'دوژمن': 'dujmin',
    'غەریب': 'xerîb',
    'غوربەت': 'xurbet',

    // Adjectives & Adverbs with Bizroke
    'بڵند': 'bilind',
    'بلند': 'bilind',
    'نزم': 'nizim',
    'نزیک': 'nizîk',
    'دوور': 'dûr',
    'درێژ': 'dirêj',
    'کورت': 'kurt',
    'پان': 'pan',
    'تەسک': 'tesk',
    'قووڵ': 'qûl',
    'درەنگ': 'direng',
    'زوو': 'zû',
    'ورد': 'wird',
    'وردە': 'wirde',
    'گەورە': 'gewre',
    'بچووک': 'biçûk',
    'ترس': 'tirs',
    'ترسناک': 'tirsnak',
    'برسی': 'birsî',
    'تینوێتی': 'tînwêtî',
    'سارد': 'sard',
    'گەرم': 'germ',
    'وشک': 'wişk',
    'تەڕ': 'ter',
    'پڕ': 'pir',
    'خاڵی': 'xalî',
    'ڕۆشن': 'roşin',
    'تاریک': 'tarîk',
    'سپی': 'spî',
    'ڕەش': 'reş',
    'سوور': 'sûr',
    'شین': 'şîn',
    'سەوز': 'sewz',
    'زەرد': 'zerd',
    'چل': 'çil',
    'چوار': 'çwar',

    // Infinitives (چاوگەکان) & Common Verb Stems
    'کردن': 'kirdin',
    'کرد': 'kird',
    'کردووە': 'kirdûwe',
    'بکە': 'bike',
    'بکات': 'bikat',
    'مردن': 'mirdin',
    'مرد': 'mird',
    'نەمر': 'nemir',
    'بردن': 'birdin',
    'برد': 'bird',
    'گرتن': 'girtin',
    'گرت': 'girt',
    'خستن': 'xistin',
    'خست': 'xist',
    'وتن': 'witin',
    'وت': 'wit',
    'وتم': 'witim',
    'وتی': 'witî',
    'گوتن': 'gutin',
    'گوت': 'gut',
    'دیتن': 'dîtin',
    'بینین': 'bînîn',
    'نووستن': 'nûstin',
    'خەوتن': 'xewtin',
    'دانیشتن': 'danîştin',
    'هەستان': 'hestan',
    'ڕۆیشتن': 'royştin',
    'هاتن': 'hatin',
    'بوون': 'bûn',
    'نەبوون': 'nebûn',
    'زانین': 'zanîn',
    'نەزانین': 'nezanîn',
    'خوێندن': 'xwêndin',
    'خوێندنەوە': 'xwêndinewe',
    'نووسین': 'nûsîn',
    'بیستن': 'bîstin',
    'پرسیار': 'pirsiyar',
    'پرسی': 'pirsî',
    'ناردن': 'nardin',
    'شکاندن': 'şikandin',
    'شکا': 'şika',
    'سووتان': 'sûtan',
    'ڕژان': 'rijan',
    'فڕین': 'firîn',
    'کەوتن': 'kewtin',

    // Proper Nouns: Poets, Figures, & Greater Kurdistan Cities
    'مەکۆ': 'Meko',
    'والی': 'Walî',
    'نالی': 'Nalî',
    'مەحوی': 'Mehwî',
    'سالم': 'Salim',
    'کوردی': 'Kurdî',
    'مەولەوی': 'Mewlewî',
    'حاجی': 'Hacî',
    'قادر': 'Qadir',
    'کۆیی': 'Koyî',
    'وەفایی': 'Wefayî',
    'ئەدەب': 'Edeb',
    'تاهیر': 'Tahîr',
    'بەگ': 'Beg',
    'پیرەمێرد': 'Pîremêrd',
    'گۆران': 'Goran',
    'هێمن': 'Hêmin',
    'هەژار': 'Hejar',
    'شێرکۆ': 'Şêrko',
    'بێکەس': 'Bêkes',
    'پەشێو': 'Peşêw',
    'دیلان': 'Dîlan',
    'ئاوات': 'Awat',
    'ئەحمەد': 'Ehmed',
    'موحەممەد': 'Muhemmed',
    'خانی': 'Xanî',
    'جزیری': 'Cizîrî',
    'فەقێ': 'Feqê',
    'تەیران': 'Teyran',
    'مەستوورە': 'Mestûre',
    'ئەردەڵان': 'Erdelan',
    'بابان': 'Baban',
    'سۆران': 'Soran',
    'بادینان': 'Badînan',
    'هەورامان': 'Hewraman',
    'هەورامی': 'Hewramî',
    'کەڵهوڕی': 'Kelhurî',
    'کورمانجی': 'Kurmancî',
    'سۆرانی': 'Soranî',
    'زازاکی': 'Zazakî',
    'کورد': 'Kurd',
    'کوردستان': 'Kurdistan',
    'کوردستانی': 'Kurdistanî',
    'کەرکووک': 'Kerkûk',
    'هەولێر': 'Hewlêr',
    'سلێمانی': 'Silêmanî',
    'دهۆک': 'Dihok',
    'هەڵەبجە': 'Helebce',
    'ئامەد': 'Amed',
    'مێردین': 'Mêrdîn',
    'ماردین': 'Mêrdîn',
    'وان': 'Wan',
    'ئورفا': 'Urfa',
    'دێرسیم': 'Dêrsim',
    'بێدلیس': 'Bêdlîs',
    'باتمان': 'Batman',
    'جۆلەمێرگ': 'Colemêrg',
    'شرنەخ': 'Şirnex',
    'سێرت': 'Sêrt',
    'مووش': 'Mûş',
    'قارس': 'Qars',
    'سنە': 'Sine',
    'کرماشان': 'Kirmaşan',
    'مەهاباد': 'Mehabad',
    'ورمێ': 'Wirmê',
    'ئیلام': 'Îlam',
    'بۆکان': 'Bokan',
    'سەقز': 'Seqiz',
    'مەریوان': 'Merîwan',
    'بانە': 'Bane',
    'سەردەشت': 'Serdeşt',
    'پیرانشار': 'Pîranşar',
    'شنۆ': 'Şino',
    'نەغەدە': 'Nexede',
    'جوانڕۆ': 'Ciwanro',
    'پاوە': 'Pawe',
    'قامیشلۆ': 'Qamişlo',
    'کۆبانێ': 'Kobanê',
    'عەفرین': 'Efrîn',
    'حەسەکە': 'Heseke',
    'سەرێکانی': 'Serêkanî',
    'زاخۆ': 'Zaxo',
    'ئاکرێ': 'Akrê',
    'ئامێدی': 'Amêdî',
    'شنگال': 'Şingal',
    'خانەقین': 'Xaneqîn',
    'کەلار': 'Kelar',
    'کفری': 'Kifrî',
    'چەمچەماڵ': 'Çemçemal',
    'کۆیە': 'Koye',
    'ڕانیە': 'Raniye',
    'قەڵادزێ': 'Qeladzê',
    'ڕەواندز': 'Rewandiz',
    'شەقڵاوە': 'Şeqlawe',
    'پێنجوێن': 'Pêncwên',
    'خورماتوو': 'Xurmatû'
  };

  // Set of lowercase proper nouns that should always be capitalized in Latin output
  const PROPER_NOUN_SET = new Set([
    'meko', 'walî', 'nalî', 'mehwî', 'salim', 'kurdî', 'mewlewî', 'wefayî',
    'pîremêrd', 'goran', 'hêmin', 'hejar', 'şêrko', 'bêkes', 'peşêw', 'dîlan',
    'xanî', 'cizîrî', 'mestûre', 'baban', 'erdelan', 'soran', 'badînan', 'hewraman',
    'kurd', 'kurdistan', 'kurdistanî', 'soranî', 'kurmancî', 'hewramî', 'kelhurî', 'zazakî',
    'kerkûk', 'hewlêr', 'silêmanî', 'dihok', 'helebce', 'amed', 'mêrdîn', 'wan', 'urfa',
    'dêrsim', 'bêdlîs', 'batman', 'colemêrg', 'şirnex', 'sêrt', 'mûş', 'qars',
    'sine', 'kirmaşan', 'mehabad', 'wirmê', 'îlam', 'bokan', 'seqiz', 'merîwan',
    'bane', 'serdeşt', 'pîranşar', 'şino', 'nexede', 'ciwanro', 'pawe',
    'qamişlo', 'kobanê', 'efrîn', 'heseke', 'serêkanî', 'zaxo', 'akrê', 'amêdî',
    'şingal', 'xaneqîn', 'kelar', 'kifrî', 'çemçemal', 'koye', 'raniye', 'qeladzê',
    'rewandiz', 'şeqlawe', 'pêncwên', 'xurmatû'
  ]);

  // Common Kurdish agglutinative suffixes (Ordered longest-first for greedy stripping)
  const KURDISH_SUFFIXES = [
    { ar: 'ەکەماندا', lat: 'ekemanda' },
    { ar: 'ەکانمان', lat: 'ekanman' },
    { ar: 'ەکانتان', lat: 'ekantan' },
    { ar: 'ەکانیان', lat: 'ekaniyan' },
    { ar: 'ەکەمان', lat: 'ekeman' },
    { ar: 'ەکەتان', lat: 'eketan' },
    { ar: 'ەکەیان', lat: 'ekeyan' },
    { ar: 'ەکانم', lat: 'ekanim' },
    { ar: 'ەکانت', lat: 'ekanit' },
    { ar: 'ەکانی', lat: 'ekanî' },
    { ar: 'ەکەدا', lat: 'ekeda' },
    { ar: 'ەکان', lat: 'ekan' },
    { ar: 'ەکەم', lat: 'ekem' },
    { ar: 'ەکەت', lat: 'eket' },
    { ar: 'ەکەی', lat: 'ekey' },
    { ar: 'ەکە', lat: 'eke' },
    { ar: 'ێکیان', lat: 'êkiyan' },
    { ar: 'ێکدا', lat: 'êkda' },
    { ar: 'ێکم', lat: 'êkim' },
    { ar: 'ێکت', lat: 'êkit' },
    { ar: 'ێکی', lat: 'êkî' },
    { ar: 'ێکە', lat: 'êke' },
    { ar: 'ێک', lat: 'êk' },
    { ar: 'انە', lat: 'ane' },
    { ar: 'انی', lat: 'anî' },
    { ar: 'انم', lat: 'anim' },
    { ar: 'انت', lat: 'anit' },
    { ar: 'مان', lat: 'man' },
    { ar: 'تان', lat: 'tan' },
    { ar: 'یان', lat: 'yan' },
    { ar: 'ەوە', lat: 'ewe' },
    { ar: 'یشدا', lat: 'îşda' },
    { ar: 'یشە', lat: 'îşe' },
    { ar: 'یشم', lat: 'îşim' },
    { ar: 'یش', lat: 'îş' },
    { ar: 'دا', lat: 'da' },
    { ar: 'تر', lat: 'tir' },
    { ar: 'ترین', lat: 'tirîn' }
  ];

  // Exhaustive Single-Character Map
  const SINGLE_CHAR_MAP = {
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
    'گ': 'g',
    'ل': 'l',
    'ڵ': 'l',
    'م': 'm',
    'ن': 'n',
    'ه': 'h',
    'ھ': 'h',
    'ئ': ''
  };

  const DIGIT_MAP = {
    '٠': '0',
    '١': '1',
    '٢': '2',
    '٣': '3',
    '٤': '4',
    '٥': '5',
    '٦': '6',
    '٧': '7',
    '٨': '8',
    '٩': '9'
  };

  const PUNCTUATION_MAP = {
    '؟': '?',
    '،': ',',
    '؛': ';',
    '«': '«',
    '»': '»',
    'ـ': ''
  };

  /**
   * Phonotactic Epenthesis (Bizroke Insertion):
   * Analyzes Latin output for unpronounceable consonant clusters and inserts
   * short 'i' according to Kurdish syllable structure (CV / CVC / CVCC).
   * @param {string} word
   * @returns {string}
   */
  function applyKurdishPhonotactics(word) {
    if (!word || word.length < 2) return word;

    let w = word;

    // 1. Common verbal/nominal consonant cluster endings
    w = w
      .replace(/krdn$/i, 'kirdin')
      .replace(/mrdn$/i, 'mirdin')
      .replace(/brdn$/i, 'birdin')
      .replace(/grtn$/i, 'girtin')
      .replace(/xstn$/i, 'xistin')
      .replace(/([bcçdfghjklmnpqrstvxwzş])tn$/i, '$1tin')
      .replace(/([bcçdfghjklmnpqrstvxwzş])dn$/i, '$1din')
      .replace(/([bcçdfghjklmnpqrstvxwzş])mn$/i, '$1min')
      .replace(/([bcçdfghjklmnpqrstvxwzş])şn$/i, '$1şin')
      .replace(/([bcçdfghjklmnpqrstvxwzş])rn$/i, '$1rin')
      .replace(/([bcçdfghjklmnpqrstvxwzş])ln$/i, '$1lin');

    // 2. Word-initial 3-consonant clusters (CCC -> CiCC)
    w = w.replace(
      /^([bcçdfghjklmnpqrstvxwzş])([bcçdfghjklmnpqrstvxwzş]{2})/i,
      '$1i$2'
    );

    // 3. Word-initial 2-consonant clusters (CC -> CiC), except valid Kurdish glides (kw, xw, جوان->ciwan handled)
    w = w.replace(
      /^([bcçdfghjklmnpqrstvxzş])([bcçdfghjklmnpqrstvxwzş])(?=[aeêiîouû])/i,
      function (match, c1, c2) {
        const pair = (c1 + c2).toLowerCase();
        if (['xw', 'kw', 'gw', 'dw', 'tw', 'çw', 'şw', 'sp', 'st', 'şk'].includes(pair)) {
          return match;
        }
        return c1 + 'i' + c2;
      }
    );

    // 4. Completely vowelless words (e.g. "dl", "krd", "jrn") -> insert 'i'
    if (!/[aeêiîouûAEÊIÎOUÛ]/.test(w) && /^[bcçdfghjklmnpqrstvxwzş']+$/i.test(w)) {
      if (w.length === 2) {
        w = w[0] + 'i' + w[1];
      } else if (w.length === 3) {
        w = w[0] + 'i' + w.slice(1);
      } else if (w.length >= 4) {
        w = w[0] + 'i' + w.slice(1, -1) + 'i' + w.slice(-1);
      }
    }

    return w;
  }

  /**
   * Core algorithmic converter for a single Kurdish Aramaic stem/word.
   * @param {string} stem
   * @returns {string}
   */
  function convertAramaicStem(stem) {
    if (!stem) return '';

    if (Object.prototype.hasOwnProperty.call(BIZROKE_LEXICON, stem)) {
      return BIZROKE_LEXICON[stem];
    }

    let w = stem;

    // 1. Word-initial Hamza (ئ) + Vowel combinations (Drop glottal stop carrier cleanly)
    w = w
      .replace(/^ئوو/g, 'û')
      .replace(/^ئوا/g, 'wa')
      .replace(/^ئوە/g, 'we')
      .replace(/^ئوێ/g, 'wê')
      .replace(/^ئوی/g, 'wî')
      .replace(/^ئۆ/g, 'o')
      .replace(/^ئا/g, 'a')
      .replace(/^ئە/g, 'e')
      .replace(/^ئێ/g, 'ê')
      .replace(/^ئیا/g, 'ya')
      .replace(/^ئیە/g, 'ye')
      .replace(/^ئیۆ/g, 'yo')
      .replace(/^ئی/g, 'î')
      .replace(/^ئو(?=[بپتجچحخدرڕزژسشعغفڤقکگلڵمنهھ])/g, 'u')
      .replace(/^ئو/g, 'u');

    // 2. Word-initial Waw (و) before a consonant (like وشە, وڵات) -> "wi"
    w = w.replace(/^و(?=[بپتجچحخدرڕزژسشعغفڤقکگلڵمنهھ])/g, 'wi');

    // 3. High-priority multi-character sequences
    w = w
      .replace(/خوا/g, 'xwa')
      .replace(/خوێ/g, 'xwê')
      .replace(/خۆ/g, 'xo')
      .replace(/وێ/g, 'wê')
      .replace(/وا/g, 'wa')
      .replace(/وان/g, 'wan')
      .replace(/ییە/g, 'iye')
      .replace(/یی/g, 'îy')
      .replace(/وو(?=[اەێۆ])/g, 'uw')
      .replace(/وو/g, 'û');

    // 4. Contextual character-by-character scan for remaining letters
    let out = '';
    const chars = Array.from(w);

    for (let i = 0; i < chars.length; i++) {
      const ch = chars[i];
      const prev = i > 0 ? chars[i - 1] : '';
      const next = i < chars.length - 1 ? chars[i + 1] : '';

      // Already converted Latin characters
      if (/^[a-zA-ZêîûçşÊÎÛÇŞ0-9']$/.test(ch)) {
        out += ch;
        continue;
      }

      if (Object.prototype.hasOwnProperty.call(DIGIT_MAP, ch)) {
        out += DIGIT_MAP[ch];
        continue;
      }

      if (Object.prototype.hasOwnProperty.call(PUNCTUATION_MAP, ch)) {
        out += PUNCTUATION_MAP[ch];
        continue;
      }

      // Contextual Waw (و)
      if (ch === 'و') {
        const prevIsVowel = VOWEL_CHARS.has(prev) || /[aeêiîouû]/i.test(prev);
        const nextIsVowel = VOWEL_CHARS.has(next) || /[aeêiîouû]/i.test(next);

        if ((i === 0 && nextIsVowel) || prevIsVowel || nextIsVowel) {
          out += 'w';
        } else {
          out += 'u';
        }
        continue;
      }

      // Contextual Ye (ی)
      if (ch === 'ی') {
        const prevIsPureVowel = PURE_VOWELS.has(prev) || /[aeêoû]/i.test(prev);
        const nextIsPureVowel = PURE_VOWELS.has(next) || /[aeêoû]/i.test(next);

        if ((i === 0 && (nextIsPureVowel || next === 'و')) || prevIsPureVowel || nextIsPureVowel) {
          out += 'y';
        } else {
          out += 'î';
        }
        continue;
      }

      // Medial Hamza (ئ) between vowels acts as syllable boundary
      if (ch === 'ئ') {
        continue;
      }

      if (Object.prototype.hasOwnProperty.call(SINGLE_CHAR_MAP, ch)) {
        out += SINGLE_CHAR_MAP[ch];
      } else {
        out += ch;
      }
    }

    return applyKurdishPhonotactics(out);
  }

  /**
   * Morphological Analyzer + Transliterator for a full Kurdish word token.
   * Strips suffixes/prefixes to check if the root is in BIZROKE_LEXICON.
   * @param {string} rawWord
   * @returns {string}
   */
  function transliterateWordToken(rawWord) {
    if (!rawWord) return '';

    const word = normalizeKurdishText(rawWord).replace(/\u0640/g, '');

    // 1. Standalone conjunction "و" -> "û"
    if (word === 'و') return 'û';

    // 2. Direct match in Lexicon
    if (Object.prototype.hasOwnProperty.call(BIZROKE_LEXICON, word)) {
      return BIZROKE_LEXICON[word];
    }

    // 3. Check if word is a Lexicon Stem + Agglutinative Suffix (e.g. دڵەکەم -> dil + ekem)
    for (let i = 0; i < KURDISH_SUFFIXES.length; i++) {
      const suf = KURDISH_SUFFIXES[i];
      if (word.length > suf.ar.length + 1 && word.endsWith(suf.ar)) {
        const stem = word.slice(0, word.length - suf.ar.length);
        if (Object.prototype.hasOwnProperty.call(BIZROKE_LEXICON, stem)) {
          const baseLat = BIZROKE_LEXICON[stem];
          // Avoid double vowels when joining stem + suffix
          if (/[aeêiîouû]$/i.test(baseLat) && /^[aeêiîouû]/i.test(suf.lat)) {
            return baseLat + 'y' + suf.lat;
          }
          return baseLat + suf.lat;
        }
      }
    }

    // 4. Fallback to full phonological conversion
    return convertAramaicStem(word);
  }

  /* ==========================================================================
   * 3. AUTO-CAPITALIZATION & PROPER NOUN CASING
   * ========================================================================== */

  /**
   * Capitalizes sentence starts, poetry verse lines, and proper nouns in Latin Hawar text.
   * @param {string} text
   * @returns {string}
   */
  function capitalizeLatinKurdish(text) {
    if (!text || typeof text !== 'string') return '';

    // 1. Capitalize proper nouns anywhere in the text
    let formatted = text.replace(
      /\b([a-zêîûçşA-ZÊÎÛÇŞ']+)\b/g,
      function (word) {
        const lower = word.toLowerCase();
        if (PROPER_NOUN_SET.has(lower)) {
          return lower.charAt(0).toUpperCase() + lower.slice(1);
        }
        return word;
      }
    );

    // 2. Capitalize start of text, start of every new line (for poetry couplets), and after . ! ?
    formatted = formatted.replace(
      /(^|[\n\r]+|[.!?؟]+\s+)([a-zêîûçş])/g,
      function (_, prefix, firstChar) {
        return prefix + firstChar.toUpperCase();
      }
    );

    // 3. Capitalize first letter inside opening guillemets/quotes «...» or "..."
    formatted = formatted.replace(
      /(^|\s)([«"“])([a-zêîûçş])/g,
      function (_, space, quote, firstChar) {
        return space + quote + firstChar.toUpperCase();
      }
    );

    return formatted;
  }

  /**
   * Primary Transliteration Entry Point: Converts full Kurdish Aramaic text
   * (prose or multi-line classical poetry) into Latin Hawar script.
   * @param {string} text
   * @returns {string}
   */
  function kurdishToLatin(text) {
    if (!text || typeof text !== 'string') return '';

    const normalized = normalizeKurdishText(text);

    // Tokenize into Kurdish script chunks vs whitespace/punctuation
    const tokenPattern = /([\u0621-\u06FF\u0750-\u077F\uFB50-\uFDFF\uFE70-\uFEFF]+)|([^\u0621-\u06FF\u0750-\u077F\uFB50-\uFDFF\uFE70-\uFEFF]+)/g;
    let match;
    let output = '';

    while ((match = tokenPattern.exec(normalized)) !== null) {
      const kurdishChunk = match[1];
      const otherChunk = match[2];

      if (kurdishChunk) {
        output += kurdishChunk.replace(
          /([٠-٩؟،؛«»ـ]+)|([\u0621-\u06FF]+)/g,
          function (_, digitsOrPunct, wordPart) {
            if (digitsOrPunct) {
              return Array.from(digitsOrPunct)
                .map(function (c) {
                  return DIGIT_MAP[c] || PUNCTUATION_MAP[c] || c;
                })
                .join('');
            }
            return transliterateWordToken(wordPart);
          }
        );
      } else if (otherChunk) {
        output += otherChunk;
      }
    }

    return capitalizeLatinKurdish(output);
  }

  /* ==========================================================================
   * 4. PROSODIC SYLLABIFIER (کێشی بڕگەیی) & AI CORPUS ANALYTICS
   * ========================================================================== */

  /**
   * Counts vowels/syllables in a Latin Hawar string to estimate Kurdish
   * syllabic meter (کێشی بڕگەیی) and provides NLP token metrics for AI indexing.
   * @param {string} rawText
   * @returns {Object}
   */
  function analyzeKurdishText(rawText) {
    const cleanAramaic = normalizeKurdishText(rawText || '').trim();
    const cleanLatin = kurdishToLatin(cleanAramaic);

    const words = cleanAramaic
      ? cleanAramaic.split(/\s+/).filter(Boolean)
      : [];

    const lines = cleanAramaic
      ? cleanAramaic.split(/\r?\n/).map(function (l) { return l.trim(); }).filter(Boolean)
      : [];

    // Count vowel nuclei in the Hawar representation for accurate syllable count
    const syllablesPerLine = lines.map(function (line) {
      const latinLine = kurdishToLatin(line);
      const vowelMatches = latinLine.match(/[aeêiîouûAEÊIÎOUÛ]+/g);
      return vowelMatches ? vowelMatches.length : 0;
    });

    const totalSyllables = syllablesPerLine.reduce(function (a, b) { return a + b; }, 0);

    return {
      text_ku_arab: cleanAramaic,
      text_ku_latn: cleanLatin,
      char_count: cleanAramaic.length,
      word_count: words.length,
      line_count: lines.length,
      syllable_count: totalSyllables,
      syllables_per_line: syllablesPerLine,
      encoding: 'UTF-8',
      language: 'ckb'
    };
  }

  /**
   * Builds a clean, standard JSONL string from an array of Meko posts
   * ready for LLM fine-tuning and NLP dataset export.
   * @param {Array<Object>} posts
   * @returns {string}
   */
  function buildCorpusJSONL(posts) {
    if (!Array.isArray(posts)) return '';

    return posts
      .map(function (post) {
        const metrics = analyzeKurdishText(post.text || '');
        const record = {
          id: post.id,
          author: post.authorName,
          handle: post.authorHandle,
          genre: post.isPoetry ? 'poetry' : 'prose',
          language: 'ckb',
          script_primary: 'Arab',
          text_aramaic: metrics.text_ku_arab,
          text_latin_hawar: metrics.text_ku_latn,
          word_count: metrics.word_count,
          syllable_count: metrics.syllable_count,
          syllables_per_line: metrics.syllables_per_line,
          created_at: post.createdAt || new Date().toISOString(),
          license: 'CC-BY-4.0'
        };
        return JSON.stringify(record);
      })
      .join('\n');
  }

  /* ==========================================================================
   * 5. INITIALIZATION & GLOBAL EXPORTS
   * ========================================================================== */

  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', bindGlobalUnicodeListeners);
    } else {
      bindGlobalUnicodeListeners();
    }
  }

  // Expose functions globally for Phase 4 (app.js)
  global.normalizeKurdishText = normalizeKurdishText;
  global.normalizeInputElement = normalizeInputElement;
  global.kurdishToLatin = kurdishToLatin;
  global.transliterateKurdishToLatin = kurdishToLatin;
  global.capitalizeLatinKurdish = capitalizeLatinKurdish;
  global.analyzeKurdishText = analyzeKurdishText;
  global.buildCorpusJSONL = buildCorpusJSONL;

  global.MekoUnicode = {
    normalize: normalizeKurdishText,
    normalizeElement: normalizeInputElement,
    toLatin: kurdishToLatin,
    capitalizeLatin: capitalizeLatinKurdish,
    analyze: analyzeKurdishText,
    buildJSONL: buildCorpusJSONL
  };
})(typeof window !== 'undefined' ? window : this);
