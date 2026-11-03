/* Meko — silent Kurdish Unicode engine. No UI; works through document-level delegation. */
(function () {
  'use strict';
  var MAP = { 'ك': 'ک', 'ي': 'ی', 'ى': 'ی', 'ة': 'ە', 'ؤ': 'ۆ', 'إ': 'ئ', 'أ': 'ئ' };
  var PERSIAN = '۰۱۲۳۴۵۶۷۸۹', ARABIC = '٠١٢٣٤٥٦٧٨٩';
  var PRES = /[\uFB50-\uFDFF\uFE70-\uFEFE]/g;
  var JUNK = /[\uFEFF\u200E\u200F\u202A-\u202E\u0000-\u0008\u000B\u000C\u000E-\u001F]/g;

  /* Legacy (Ali-style) fonts store glyph shapes as Arabic Presentation Forms;
     NFKC folds every shape back to its real base letter. */
  function legacy(s) {
    return s.replace(PRES, function (c) { return c.normalize('NFKC'); });
  }

  function clean(s) {
    var t = legacy(String(s == null ? '' : s)).replace(JUNK, '');
    t = t.replace(/[كيىةؤإأ]/g, function (c) { return MAP[c]; });
    t = t.replace(/[۰-۹]/g, function (c) { return ARABIC[PERSIAN.indexOf(c)]; });
    return t.normalize('NFC');
  }

  function isText(el) {
    if (!el || !el.matches) return false;
    return el.matches('textarea, input:not([type=file]):not([type=checkbox]):not([type=radio]):not([type=range])');
  }

  document.addEventListener('input', function (e) {
    var el = e.target;
    if (!isText(el) || e.isComposing) return;
    var v = el.value, c = clean(v);
    if (v === c) return;
    var fromEnd = v.length - (el.selectionEnd == null ? v.length : el.selectionEnd);
    el.value = c;
    try { var p = Math.max(0, c.length - fromEnd); el.setSelectionRange(p, p); } catch (err) {}
  }, true);

  document.addEventListener('paste', function (e) {
    var el = e.target;
    if (!isText(el)) return;
    e.preventDefault();
    var raw = (e.clipboardData || window.clipboardData).getData('text/plain');
    var txt = clean(raw);
    var s = el.selectionStart, n = el.selectionEnd;
    if (s == null) { el.value += txt; } else { el.setRangeText(txt, s, n, 'end'); }
    el.dispatchEvent(new Event('input', { bubbles: true }));
  }, true);

  document.addEventListener('drop', function (e) {
    var el = e.target;
    if (!isText(el) || !e.dataTransfer) return;
    var raw = e.dataTransfer.getData('text/plain');
    if (!raw) return;
    e.preventDefault();
    el.setRangeText(clean(raw), el.selectionStart || 0, el.selectionEnd || 0, 'end');
    el.dispatchEvent(new Event('input', { bubbles: true }));
  }, true);

  /* Read an uploaded .txt as UTF-8 and return cleaned plain text. */
  function readTxt(file) {
    return new Promise(function (res, rej) {
      var r = new FileReader();
      r.onload = function () { res(clean(r.result)); };
      r.onerror = function () { rej(r.error); };
      r.readAsText(file, 'utf-8');
    });
  }

  window.UnicodeEngine = { clean: clean, readTxt: readTxt };
})();
