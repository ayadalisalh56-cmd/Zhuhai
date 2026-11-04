(function () {
  'use strict';
  var MAP = { '\u0643': '\u06A9', '\u064A': '\u06CC', '\u0649': '\u06CC', '\u0629': '\u06D5', '\u0624': '\u06C6', '\u0625': '\u0626\u06CC', '\u0623': '\u0626\u06D5', '\u0640': '' };
  var TEST = /[\u0643\u064A\u0649\u0629\u0624\u0625\u0623\u0640]/;
  var ALL = /[\u0643\u064A\u0649\u0629\u0624\u0625\u0623\u0640]/g;
  function fix(s) { return s.replace(ALL, function (c) { return MAP[c]; }); }
  function isField(el) { return el && (el.tagName === 'TEXTAREA' || (el.tagName === 'INPUT' && /^(text|search|)$/i.test(el.type || ''))); }

  document.addEventListener('input', function (e) {
    var el = e.target;
    if (!isField(el) || !TEST.test(el.value)) return;
    var a = el.selectionStart, b = el.selectionEnd, v = el.value;
    el.value = fix(v);
    try { el.setSelectionRange(fix(v.slice(0, a)).length, fix(v.slice(0, b)).length); } catch (_) {}
  }, true);

  document.addEventListener('paste', function (e) {
    var el = e.target;
    if (!isField(el) || !e.clipboardData) return;
    var t = e.clipboardData.getData('text');
    if (!t || !TEST.test(t)) return;
    e.preventDefault();
    var a = el.selectionStart, b = el.selectionEnd, c = fix(t);
    el.value = el.value.slice(0, a) + c + el.value.slice(b);
    try { el.setSelectionRange(a + c.length, a + c.length); } catch (_) {}
    el.dispatchEvent(new Event('input', { bubbles: true }));
  }, true);

  window.MekoUnicode = { fix: fix };
})();
