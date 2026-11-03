/* Meko — Kurdish Unicode Engine
   1) Plain-text stripper  2) Arabic -> Kurdish normalizer  3) Legacy (non-Unicode) converter */
(function (g) {
  'use strict';
  const STATUS = 'پارێزەری یونیکۆد چالاکە (UTF-8 Pure)';
  const AR = '\\u0600-\\u06FF\\u0750-\\u077F';
  const CH = { 'ك': 'ک', 'ي': 'ی', 'ى': 'ی', 'ې': 'ێ', 'ة': 'ە', 'ۀ': 'ە', 'ہ': 'ە', 'ھ': 'ه', 'ؤ': 'ۆ', 'إ': 'ئ', 'أ': 'ئ', 'ٱ': 'ا', 'ـ': '',
    '\u064B': '', '\u064C': '', '\u064D': '', '\u064E': '', '\u064F': '', '\u0650': '', '\u0651': '', '\u0652': '' };
  const CH_RE = new RegExp('[' + Object.keys(CH).join('') + ']', 'g');
  const LEGACY = {};              // font-specific tables (Ali-K etc.) via registerLegacyMap()
  let rev1252 = null;

  /* --- 1. strip rich text / hidden marks --- */
  function strip(s) {
    s = String(s || '');
    if (/<\/?[a-z][^>]*>/i.test(s)) {
      const html = s.replace(/<br\s*\/?>|<\/(p|div|li|h\d|tr)>/gi, '\n');
      s = new DOMParser().parseFromString(html, 'text/html').body.textContent || '';
    }
    return s.replace(/\r\n?/g, '\n').replace(/\u00A0/g, ' ').replace(/[\u200B\u200E\u200F\u202A-\u202E\uFEFF]/g, '');
  }

  /* --- 2. normalize Arabic letters to standard Kurdish Unicode --- */
  function enforce(s) {
    s = String(s || '').normalize('NFKC');          // also repairs presentation forms (ﻻ, ﺑ, ...)
    s = s.replace(CH_RE, c => CH[c]);
    s = s.replace(/[\u06F0-\u06F9]/g, c => String.fromCharCode(c.charCodeAt(0) - 0x6F0 + 0x660));
    const a = new RegExp('([' + AR + '])');
    s = s.replace(new RegExp(a.source + '\\?', 'g'), '$1؟')
         .replace(new RegExp(a.source + ',', 'g'), '$1،')
         .replace(new RegExp(a.source + ';', 'g'), '$1؛');
    return s;
  }

  /* --- 3. legacy (non-Unicode) detection & conversion --- */
  function looksLegacy(t) {
    const letters = (t.replace(/[\s\d\p{P}\p{S}]/gu, '') || ' ').length;
    const latinHi = (t.match(/[\u00C0-\u00FF\u0152\u0153\u0160\u0161\u0178\u017D\u017E\u0192\u02C6\u02DC\u2013-\u203A]/g) || []).length;
    const arabic = (t.match(new RegExp('[' + AR + ']', 'g')) || []).length;
    return latinHi / letters > 0.3 && arabic / letters < 0.1;
  }
  function registerLegacyMap(map) { Object.assign(LEGACY, map); }
  function convertLegacy(t) {
    if (!looksLegacy(t)) return t;
    if (Object.keys(LEGACY).length) {                 // custom font table first
      const m = [...t].map(c => LEGACY[c] ?? c).join('');
      if (m !== t) return m;
    }
    try {                                             // windows-1256 text mis-read as Latin
      if (!rev1252) {
        rev1252 = {};
        const d = new TextDecoder('windows-1252');
        for (let i = 0; i < 256; i++) rev1252[d.decode(new Uint8Array([i]))] = i;
      }
      const bytes = [...t].map(c => rev1252[c]);
      if (bytes.some(b => b === undefined)) return t;
      return new TextDecoder('windows-1256').decode(new Uint8Array(bytes));
    } catch (e) { return t; }
  }

  const clean = s => enforce(strip(convertLegacy(strip(s))));

  function decodeBuffer(buf) {                        // .txt upload: UTF-8, else windows-1256
    let t;
    try { t = new TextDecoder('utf-8', { fatal: true }).decode(buf); }
    catch (e) { t = new TextDecoder('windows-1256').decode(buf); }
    return clean(t);
  }

  const badge = () => `<div class="uni-status"><i data-lucide="shield-check"></i><span class="uni-txt">${STATUS}</span></div>`;

  /* --- live binding (event delegation, works for dynamic inputs) --- */
  function flash(el, changed) {
    const t = el.closest('[data-uni-wrap]') && el.closest('[data-uni-wrap]').querySelector('.uni-txt');
    if (!t || !changed) return;
    t.textContent = 'دەق پاک کرایەوە و بوو بە یونیکۆدی ستانداردی کوردی';
    t.parentElement.classList.add('on');
    clearTimeout(t._h);
    t._h = setTimeout(() => { t.textContent = STATUS; t.parentElement.classList.remove('on'); }, 2000);
  }
  function insert(el, txt) {
    el.setRangeText(txt, el.selectionStart, el.selectionEnd, 'end');
    el.dispatchEvent(new Event('input', { bubbles: true }));
  }
  function bind() {
    const ok = e => e.target && e.target.matches && e.target.matches('[data-uni]');
    document.addEventListener('paste', e => {
      if (!ok(e)) return;
      e.preventDefault();
      const cd = e.clipboardData, raw = cd.getData('text/plain') || cd.getData('text/html') || '';
      const out = clean(raw);
      insert(e.target, out); flash(e.target, out !== raw);
    });
    document.addEventListener('drop', e => {
      if (!ok(e)) return;
      const raw = e.dataTransfer.getData('text/plain');
      if (!raw) return;
      e.preventDefault(); insert(e.target, clean(raw));
    });
    document.addEventListener('input', e => {
      if (!ok(e) || e.isComposing) return;
      const t = e.target, p = t.selectionStart;
      const a = enforce(t.value.slice(0, p)), v = a + enforce(t.value.slice(p));
      if (v !== t.value) { t.value = v; t.setSelectionRange(a.length, a.length); flash(t, true); }
    });
  }

  g.UnicodeEngine = { STATUS, strip, enforce, clean, looksLegacy, convertLegacy, registerLegacyMap, decodeBuffer, badge, bind };
})(window);
