Pure language utilities. This file never renders anything and never looks up
   page elements: its only DOM contact is three global, delegated listeners
   (input / paste / compositionend) that work on the element an event targets.

   PUBLIC API  (all attached to `window`, loaded before app.js)
     normalizeKurdishText(text)        legacy Arabic / Ali-font code points
                                       -> standard Kurdish UTF-8
     kurdishToLatin(text[, options])   Kurdish (Arabic script) -> Hawar Latin
     capitalizeLatinKurdish(text)      capitalise the first letter of sentences
     MekoUnicode                       namespace: the three functions above plus
                                       normalizeControl(el), config, defaults

   kurdishToLatin OPTIONS (all optional)
     strict    false  true = apply ONLY the contract rules, nothing else
     medialRR  true   medial ڕ -> "rr"   (false: always "r")
     doubleLL  false  ڵ -> "ll"          (false: "l")

   JUDGMENT CALLS (active unless { strict: true })
   The contract's contextual rules leave three very common cases wrong, so a
   refinement is applied to each. Pass { strict: true } for the literal rules.
     1. و after a vowel letter (ا ە ێ ۆ) is the semivowel "w", not "u":
        ئاو -> aw, ئەو -> ew, سڵاو -> slaw  (literal rule would give "au")
     2. Word-initial وو is consonant + vowel: ووشە -> wuşe.
        A long û never starts a word in Sorani; it is written ئوو (-> û).
     3. Word-initial ی is the consonant "y": یونان -> yunan.
        A word-initial î is written ئی (-> î).

   KNOWN LIMIT
     Sorani spelling does not write the short vowel /i/, so it cannot appear in
     the Latin output: من -> mn, کتێب -> ktêb. Restoring it needs a dictionary.
   ========================================================================== */
(function (root) {
  'use strict';

  if (root.__MEKO_UNICODE_ENGINE__) { return; }
  root.__MEKO_UNICODE_ENGINE__ = true;

  var engine = {
    version: '1.0.0',
    config: { autoNormalizeInputs: true },
    transliterationDefaults: { strict: false, medialRR: true, doubleLL: false }
  };

  function toStr(value) {
    return value === null || value === undefined ? '' : String(value);
  }


  /* ========================================================================
     1. GLOBAL INVISIBLE UNICODE NORMALIZER
     ======================================================================== */

  var LEGACY_REPLACEMENTS = {
    'ك': 'ک',          // ك  ARABIC KAF            -> ک  KEHEH
    'ي': 'ی',          // ي  ARABIC YEH            -> ی  FARSI YEH
    'ى': 'ی',          // ى  ALEF MAKSURA          -> ی  FARSI YEH
    'ة': 'ە',          // ة  TEH MARBUTA           -> ە  AE
    'ؤ': 'ۆ',          // ؤ  WAW WITH HAMZA ABOVE  -> ۆ  OE
    'إ': 'ئی',    // إ  ALEF WITH HAMZA BELOW -> ئی
    'أ': 'ئە',    // أ  ALEF WITH HAMZA ABOVE -> ئە
    'ـ': ''                 // ـ  TATWEEL (kashida)     -> removed
  };

  var LEGACY_RE = /[كيىةؤإأـ]/g;

  function normalizeKurdishText(text) {
    var s = toStr(text);
    if (!s) { return s; }
    return s.replace(LEGACY_RE, function (ch) { return LEGACY_REPLACEMENTS[ch]; });
  }

  /* Index of `index` inside the normalised text. Normalisation is a per-character
     replacement, so normalising the prefix gives the exact new caret offset even
     when a character expands (إ -> 2 chars) or disappears (tatweel). */
  function mapIndex(original, index) {
    return normalizeKurdishText(original.slice(0, index)).length;
  }


  /* ---- 1.1 Text controls ------------------------------------------------ */

  var TEXT_CONTROL_TYPES = { text: true, search: true, tel: true };

  function isEditableControl(el) {
    if (!el || el.nodeType !== 1) { return false; }
    var tag = el.tagName;
    if (tag !== 'TEXTAREA' && tag !== 'INPUT') { return false; }
    if (el.disabled || el.readOnly) { return false; }
    if (el.hasAttribute('data-no-normalize')) { return false; }
    if (tag === 'INPUT') {
      var type = String(el.type || 'text').toLowerCase();
      if (!TEXT_CONTROL_TYPES[type]) { return false; }   // password, email, number, ...
    }
    return true;
  }

  function readSelection(el) {
    try {
      if (typeof el.selectionStart !== 'number') { return null; }
      return {
        start: el.selectionStart,
        end: el.selectionEnd,
        dir: el.selectionDirection || 'none'
      };
    } catch (err) {
      return null;
    }
  }

  function writeSelection(el, start, end, dir) {
    try { el.setSelectionRange(start, end, dir || 'none'); } catch (err) { /* unsupported type */ }
  }

  function fireInput(el, inputType, data) {
    var ev;
    try {
      ev = new root.InputEvent('input', { bubbles: true, inputType: inputType, data: data || null });
    } catch (err) {
      ev = root.document.createEvent('Event');
      ev.initEvent('input', true, false);
    }
    el.dispatchEvent(ev);
  }

  /* While true, input events are our own edit commands: swallowed so app.js sees
     exactly one `input` event (the original one) carrying the final value. */
  var swallowNested = false;

  /* Replace value[start, end) through the browser's edit pipeline so the native
     undo stack survives. Returns false when the browser refuses. */
  function replaceViaEditCommand(el, start, end, text) {
    var ok = false;
    swallowNested = true;
    try {
      el.setSelectionRange(start, end);
      ok = text
        ? root.document.execCommand('insertText', false, text)
        : root.document.execCommand('delete', false, null);
    } catch (err) {
      ok = false;
    } finally {
      swallowNested = false;
    }
    return ok;
  }

  /* Normalise the live value of one control and put the caret / selection back
     exactly where the user had it. Returns true when the value changed. */
  function normalizeControl(el) {
    var before = el.value;
    var after = normalizeKurdishText(before);
    if (after === before) { return false; }

    var sel = readSelection(el);
    var focused = root.document.activeElement === el;
    var scrollTop = el.scrollTop;
    var scrollLeft = el.scrollLeft;

    // Smallest window that differs (common prefix / suffix are kept untouched).
    var head = 0;
    var headMax = Math.min(before.length, after.length);
    while (head < headMax && before.charCodeAt(head) === after.charCodeAt(head)) { head++; }
    var tailBefore = before.length;
    var tailAfter = after.length;
    while (tailBefore > head && tailAfter > head &&
           before.charCodeAt(tailBefore - 1) === after.charCodeAt(tailAfter - 1)) {
      tailBefore--;
      tailAfter--;
    }
    var replacement = after.slice(head, tailAfter);

    var done = false;
    if (focused && sel) {
      done = replaceViaEditCommand(el, head, tailBefore, replacement) && el.value === after;
    }
    if (!done) { el.value = after; }

    if (sel && focused) {
      writeSelection(el, mapIndex(before, sel.start), mapIndex(before, sel.end), sel.dir);
    }
    el.scrollTop = scrollTop;
    el.scrollLeft = scrollLeft;
    return true;
  }

  /* Insert already-normalised text at the caret (used by the paste handler). */
  function insertTextAtSelection(el, text) {
    var focused = root.document.activeElement === el;
    var ok = false;
    if (focused) {
      try { ok = root.document.execCommand('insertText', false, text); } catch (err) { ok = false; }
    }
    if (ok) { return; }

    // Fallback: splice by hand, honouring maxlength like a native paste would.
    var sel = readSelection(el);
    var value = el.value;
    var start = sel ? sel.start : value.length;
    var end = sel ? sel.end : value.length;
    var max = el.maxLength;
    if (typeof max === 'number' && max >= 0) {
      var room = max - (value.length - (end - start));
      text = room > 0 ? text.slice(0, room) : '';
    }
    if (typeof el.setRangeText === 'function') {
      el.setRangeText(text, start, end, 'end');
    } else {
      el.value = value.slice(0, start) + text + value.slice(end);
      writeSelection(el, start + text.length, start + text.length);
    }
    if (text) { fireInput(el, 'insertFromPaste', text); }
  }

  engine.normalizeControl = normalizeControl;


  /* ---- 1.2 Global listeners (delegated, capture phase) ------------------- */

  if (typeof root.document !== 'undefined' && root.document.addEventListener) {

    // Typing, drop, autocorrect, voice input ...
    root.document.addEventListener('input', function (ev) {
      if (swallowNested) {
        ev.stopImmediatePropagation();
        return;
      }
      if (!engine.config.autoNormalizeInputs) { return; }
      var el = ev.target;
      if (!isEditableControl(el)) { return; }
      if (ev.isComposing) { return; }          // never edit text mid-IME-composition
      normalizeControl(el);
    }, true);

    // Paste: normalise the clipboard text before it reaches the field.
    root.document.addEventListener('paste', function (ev) {
      if (ev.defaultPrevented) { return; }
      if (!engine.config.autoNormalizeInputs) { return; }
      var el = ev.target;
      if (!isEditableControl(el)) { return; }
      var data = ev.clipboardData;
      if (!data || typeof data.getData !== 'function') { return; }

      var raw = '';
      try { raw = data.getData('text/plain'); } catch (err) { raw = ''; }
      if (!raw) { return; }

      var fixed = normalizeKurdishText(raw);
      if (fixed === raw) { return; }            // nothing to fix: native paste runs untouched

      ev.preventDefault();
      if (el.tagName === 'INPUT') { fixed = fixed.replace(/[\r\n]+/g, ' '); }
      insertTextAtSelection(el, fixed);
    }, true);

    // IME: once a composition is committed, normalise what it produced.
    root.document.addEventListener('compositionend', function (ev) {
      var el = ev.target;
      if (!engine.config.autoNormalizeInputs || !isEditableControl(el)) { return; }
      root.setTimeout(function () {
        if (normalizeControl(el)) { fireInput(el, 'insertText', null); }
      }, 0);
    }, true);
  }


  /* ========================================================================
     2. ARAMAIC (KURDISH ARABIC SCRIPT) -> LATIN (HAWAR) TRANSLITERATION
     ======================================================================== */

  // A "word" is a maximal run of Arabic-script letters. Everything else (spaces,
  // digits, punctuation, Latin text) is a word boundary and passes through.
  var WORD_RE = /[ء-ؿف-يٮٯٱ-ۓەݐ-ݿ]+/g;
  var LETTER_RE = /[ء-ؿف-يٮٯٱ-ۓەݐ-ݿ]/g;

  // Invisible / decorative characters that must not leak into Latin output:
  // soft hyphen, ZWNJ, ZWJ, LRM, RLM, bidi embeddings and isolates, BOM, tatweel,
  // and Arabic vowel marks (harakat, superscript alef, Quranic marks).
  var STRIP_RE = /[­‌-‏‪-‮⁦-⁩﻿ـً-ٰٟۖ-ۜ۟-۪ۤۧۨ-ۭ]/g;

  // Arabic presentation forms (copied from PDFs / legacy fonts) -> base letters.
  var PRESENTATION_RE = /[ﭐ-﷿ﹰ-ﻼ]+/g;

  var DIGIT_RE = /[٠-٩۰-۹]/g;        // ٠-٩ and ۰-۹
  var PUNCT_RE = /[،؛؟٪٫٬۔]/g;

  var PUNCT_MAP = {
    '؟': '?',   // ؟
    '،': ',',   // ،
    '؛': ';',   // ؛
    '٪': '%',   // ٪
    '٫': '.',   // ٫  Arabic decimal separator
    '٬': ',',   // ٬  Arabic thousands separator
    '۔': '.'    // ۔  Arabic full stop
  };

  // Single character table (applied LAST, after every contextual rule).
  var SINGLE_MAP = {
    // vowels
    'ا': 'a',          // ا
    'ە': 'e',          // ە
    'ێ': 'ê',     // ێ -> ê
    'ۆ': 'o',          // ۆ
    'و': 'u',          // و  (safety net: resolved earlier by the contextual stage)
    'ی': 'î',     // ی  (safety net: resolved earlier by the contextual stage)

    // consonants
    'ب': 'b',          // ب
    'پ': 'p',          // پ
    'ت': 't',          // ت
    'ج': 'c',          // ج
    'چ': 'ç',     // چ -> ç
    'ح': 'h',          // ح
    'خ': 'x',          // خ
    'د': 'd',          // د
    'ر': 'r',          // ر
    'ڕ': 'r',          // ڕ  (positional: "rr" when medial, see mapSingles)
    'ز': 'z',          // ز
    'ژ': 'j',          // ژ
    'س': 's',          // س
    'ش': 'ş',     // ش -> ş
    'ع': '\'',         // ع
    'غ': 'x',          // غ
    'ف': 'f',          // ف
    'ڤ': 'v',          // ڤ
    'ق': 'q',          // ق
    'ک': 'k',          // ک
    'گ': 'g',          // گ
    'ل': 'l',          // ل
    'ڵ': 'l',          // ڵ  (positional: "ll" when options.doubleLL)
    'م': 'm',          // م
    'ن': 'n',          // ن
    'ه': 'h',          // ه
    'ھ': 'h',          // ھ

    // hamza: word-initial ئ is removed earlier, so any ئ left here is non-initial
    'ئ': '\'',         // ئ
    'ء': '\'',         // ء

    // letters that only occur in Arabic loan words (kept so no Arabic script leaks)
    'آ': 'a',          // آ
    'ٱ': 'a',          // ٱ
    'ث': 's',          // ث
    'ذ': 'z',          // ذ
    'ص': 's',          // ص
    'ض': 'z',          // ض
    'ط': 't',          // ط
    'ظ': 'z',          // ظ
    'ڪ': 'k',          // ڪ
    'ہ': 'h'           // ہ
  };

  var HAS_OWN = Object.prototype.hasOwnProperty;

  // Stage 1 — word-initial ئ. A vowel follows -> the glottal stop is dropped and
  // the vowel is written alone. Any other word-initial ئ is silent as well.
  var INITIAL_HAMZA_RULES = [
    [/^ئوو/, 'û'],   // ئوو -> û
    [/^ئا/,       'a'],        // ئا  -> a
    [/^ئە/,       'e'],        // ئە  -> e
    [/^ئی/,       'î'],   // ئی  -> î
    [/^ئێ/,       'ê'],   // ئێ  -> ê
    [/^ئۆ/,       'o'],        // ئۆ  -> o
    [/^ئ/,             '']          // ئ + anything else -> silent
  ];

  // Stage 2 — double waw.
  var DOUBLE_WAW_INITIAL = /^وو/;     // وو at the start of a word
  var DOUBLE_WAW = /وو/g;             // وو anywhere

  // Stage 3 — fixed waw sequences (longest first).
  var WAW_RULES = [
    [/وان/g, 'wan'],              // وان -> wan
    [/وا/g,       'wa'],               // وا  -> wa
    [/وێ/g,       'wê']           // وێ  -> wê
  ];

  // Letter groups used by the contextual و / ی stage.
  var AR_VOWELS = 'اەێۆ';           // ا ە ێ ۆ
  var WAW_NEXT_VOWELS = 'اەیێۆ'; // ا ە ی ێ ۆ  (contract list for و)
  var LATIN_VOWELS = 'aeoêûî';           // a e o ê û î
  var LATIN_DIPHTHONG_BASE = 'aeoêî';         // vowels that can precede a semivowel w

  function resolveOptions(options) {
    var defaults = engine.transliterationDefaults;
    var out = {
      strict: !!defaults.strict,
      medialRR: defaults.medialRR !== false,
      doubleLL: !!defaults.doubleLL
    };
    // Anything that is not a plain object (e.g. the index argument passed by
    // Array.prototype.map) is ignored.
    if (options && typeof options === 'object') {
      if (typeof options.strict === 'boolean') { out.strict = options.strict; }
      if (typeof options.medialRR === 'boolean') { out.medialRR = options.medialRR; }
      if (typeof options.doubleLL === 'boolean') { out.doubleLL = options.doubleLL; }
    }
    return out;
  }

  // Stage 4 — contextual و and ی, resolved left to right so each letter can see
  // what the previous one became.
  function resolveWawAndYa(word, opts) {
    var roles = {};
    return word.replace(/[وی]/g, function (ch, i, s) {
      var prev = i > 0 ? s.charAt(i - 1) : '';
      var next = i + 1 < s.length ? s.charAt(i + 1) : '';
      var prevRole = i > 0 ? roles[i - 1] : undefined;
      var out;

      if (ch === 'و') {
        // و before a vowel letter -> w, otherwise u
        if (next && WAW_NEXT_VOWELS.indexOf(next) !== -1) {
          out = 'w';
        } else if (!opts.strict && prev &&
                   (AR_VOWELS.indexOf(prev) !== -1 ||
                    LATIN_DIPHTHONG_BASE.indexOf(prev) !== -1 ||
                    prevRole === 'î')) {
          out = 'w';                              // diphthong: aw, ew, êw, ow, îw
        } else {
          out = 'u';
        }
      } else {
        // ی before or after a vowel -> y, otherwise î
        var vowelBefore = !!prev &&
          (AR_VOWELS.indexOf(prev) !== -1 ||
           LATIN_VOWELS.indexOf(prev) !== -1 ||
           prevRole === 'u' || prevRole === 'î');
        var vowelAfter = !!next && AR_VOWELS.indexOf(next) !== -1;
        if (!opts.strict && i === 0) {
          out = 'y';                              // a word never starts with î (that is ئی)
        } else if (vowelBefore || vowelAfter) {
          out = 'y';
        } else {
          out = 'î';
        }
      }

      roles[i] = out;
      return out;
    });
  }

  // Stage 5 — everything that is left, one letter at a time.
  function mapSingles(word, opts) {
    return word.replace(LETTER_RE, function (ch, i, s) {
      if (ch === 'ڕ') {                      // ڕ: r, or rr in the middle of a word
        return (opts.medialRR && i > 0 && i < s.length - 1) ? 'rr' : 'r';
      }
      if (ch === 'ڵ') {                      // ڵ
        return opts.doubleLL ? 'll' : 'l';
      }
      return HAS_OWN.call(SINGLE_MAP, ch) ? SINGLE_MAP[ch] : ch;
    });
  }

  function transliterateWord(word, opts) {
    var w = word;
    var k;

    // 1. word-initial ئ
    for (k = 0; k < INITIAL_HAMZA_RULES.length; k++) {
      w = w.replace(INITIAL_HAMZA_RULES[k][0], INITIAL_HAMZA_RULES[k][1]);
    }

    // 2. double waw
    if (!opts.strict) { w = w.replace(DOUBLE_WAW_INITIAL, 'wu'); }
    w = w.replace(DOUBLE_WAW, 'û');

    // 3. وان / وا / وێ
    for (k = 0; k < WAW_RULES.length; k++) {
      w = w.replace(WAW_RULES[k][0], WAW_RULES[k][1]);
    }

    // 4. contextual و / ی
    w = resolveWawAndYa(w, opts);

    // 5. single character table
    return mapSingles(w, opts);
  }

  function foldPresentationForms(text) {
    if (typeof text.normalize !== 'function') { return text; }
    return text.replace(PRESENTATION_RE, function (run) { return run.normalize('NFKC'); });
  }

  function kurdishToLatin(text, options) {
    var opts = resolveOptions(options);
    var s = toStr(text);
    if (!s) { return s; }

    s = foldPresentationForms(s);
    s = normalizeKurdishText(s);
    s = s.replace(STRIP_RE, '');

    s = s.replace(WORD_RE, function (word) { return transliterateWord(word, opts); });

    s = s.replace(DIGIT_RE, function (digit) {
      var code = digit.charCodeAt(0);
      return String(code >= 0x06F0 ? code - 0x06F0 : code - 0x0660);
    });
    s = s.replace(PUNCT_RE, function (mark) { return PUNCT_MAP[mark]; });

    return s;
  }


  /* ========================================================================
     3. AUTO-CAPITALISATION
     ======================================================================== */

  // A sentence starts at: the start of the text, after . ! ? … followed by
  // whitespace, or after a line break. Opening quotes / brackets are skipped.
  // Requiring whitespace after the full stop keeps "3.5" and "example.com" intact.
  var SENTENCE_START_RE = /(^[ \t ]*|[.!?…]+["'”’»)\]]*[ \t ]+|[\r\n]+[ \t ]*)(["'“‘«(\[¿¡]*)(\S)/g;

  // toUpperCase (not toLocaleUpperCase): on a Turkish-locale device the latter
  // would turn "i" into "İ", which is not a Kurdish letter.
  function capitalizeLatinKurdish(text) {
    var s = toStr(text);
    if (!s) { return s; }
    return s.replace(SENTENCE_START_RE, function (match, lead, opening, letter) {
      return lead + opening + letter.toUpperCase();
    });
  }


  /* ========================================================================
     4. EXPOSE
     ======================================================================== */

  engine.normalizeKurdishText = normalizeKurdishText;
  engine.kurdishToLatin = kurdishToLatin;
  engine.capitalizeLatinKurdish = capitalizeLatinKurdish;

  root.normalizeKurdishText = normalizeKurdishText;
  root.kurdishToLatin = kurdishToLatin;
  root.capitalizeLatinKurdish = capitalizeLatinKurdish;
  root.MekoUnicode = engine;

}(typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : this)));
