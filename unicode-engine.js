(function () {
  'use strict';

  const TARGET_SELECTOR = 'input[type="text"], input[type="search"], textarea';
  const CHARACTER_MAP = new Map([
    ['ك', 'ک'],
    ['ي', 'ی'],
    ['ى', 'ی'],
    ['ة', 'ە'],
    ['ؤ', 'ۆ'],
    ['إ', 'ئی'],
    ['أ', 'ئە']
  ]);
  const STRIP_PATTERN = /[\u0640\u200B\u200E\u200F\u202A-\u202E\u2060\uFEFF]/g;

  function normalizeText(value) {
    if (typeof value !== 'string' || value.length === 0) return value;
    let output = '';
    for (const character of value) {
      if (STRIP_PATTERN.test(character)) {
        STRIP_PATTERN.lastIndex = 0;
        continue;
      }
      STRIP_PATTERN.lastIndex = 0;
      output += CHARACTER_MAP.get(character) || character;
    }
    return output;
  }

  function isSupportedTarget(target) {
    return target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement;
  }

  function normalizeTarget(target) {
    if (!isSupportedTarget(target) || !target.matches(TARGET_SELECTOR)) return;
    const original = target.value;
    const normalized = normalizeText(original);
    if (normalized === original) return;

    const start = typeof target.selectionStart === 'number' ? target.selectionStart : original.length;
    const end = typeof target.selectionEnd === 'number' ? target.selectionEnd : start;
    const direction = typeof target.selectionDirection === 'string' ? target.selectionDirection : 'none';
    const nextStart = normalizeText(original.slice(0, start)).length;
    const nextEnd = normalizeText(original.slice(0, end)).length;

    target.value = normalized;
    try {
      target.setSelectionRange(nextStart, nextEnd, direction);
    } catch (error) {
      // Some browser-managed input types do not expose text selections.
    }
  }

  document.addEventListener('input', function (event) {
    normalizeTarget(event.target);
  }, true);

  document.addEventListener('paste', function (event) {
    const target = event.target;
    if (!isSupportedTarget(target) || !target.matches(TARGET_SELECTOR)) return;
    const clipboard = event.clipboardData;
    if (!clipboard) return;
    const pasted = clipboard.getData('text/plain');
    if (!pasted) return;

    const normalized = normalizeText(pasted);
    if (normalized === pasted) return;

    event.preventDefault();
    const start = typeof target.selectionStart === 'number' ? target.selectionStart : target.value.length;
    const end = typeof target.selectionEnd === 'number' ? target.selectionEnd : start;
    target.setRangeText(normalized, start, end, 'end');
    target.dispatchEvent(new Event('input', { bubbles: true }));
  }, true);
})();
