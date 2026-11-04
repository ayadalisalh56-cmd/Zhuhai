/**
 * MEKO (مەکۆ) — SILENT KURDISH UNICODE ENGINE
 * Silently normalizes legacy Arabic/Ali-font characters into standard Kurdish UTF-8
 * across all <input> and <textarea> elements while preserving cursor positions.
 */
(function () {
  'use strict';

  function normalizeKurdishText(raw) {
    if (!raw || typeof raw !== 'string') return raw;
    return raw
      // Multi-char legacy Arabic hamza combinations first
      .replace(/\u0625/g, 'ئی') // إ -> ئی
      .replace(/\u0623/g, 'ئە') // أ -> ئە
      // Single-char legacy Arabic to Kurdish standard mappings
      .replace(/\u0643/g, '\u06A9') // ك -> ک
      .replace(/[\u064A\u0649]/g, '\u06CC') // ي / ى -> ی
      .replace(/\u0629/g, '\u06D5') // ة -> ە
      .replace(/\u0624/g, '\u06C6') // ؤ -> ۆ
      // Strip Tatweel (Kashida)
      .replace(/\u0640/g, '');
  }

  function shouldBypassElement(el) {
    if (!el) return true;
    const tag = el.tagName ? el.tagName.toLowerCase() : '';
    if (tag !== 'input' && tag !== 'textarea') return true;
    // Do not convert Latin username handle field
    if (el.id === 'edit-username-handle') return true;
    const type = (el.getAttribute('type') || 'text').toLowerCase();
    if (type !== 'text' && type !== 'search' && tag !== 'textarea') return true;
    return false;
  }

  function applySilentNormalization(el) {
    if (shouldBypassElement(el)) return;
    const original = el.value;
    if (!original) return;

    const start = el.selectionStart;
    const end = el.selectionEnd;

    const beforeCursor = original.slice(0, start);
    const normalizedFull = normalizeKurdishText(original);

    if (normalizedFull !== original) {
      const normalizedBefore = normalizeKurdishText(beforeCursor);
      const newCursorPos = normalizedBefore.length;
      el.value = normalizedFull;
      try {
        el.setSelectionRange(newCursorPos, newCursorPos + (end - start));
      } catch (_) {
        // Ignore if input type does not support selection range
      }
    }
  }

  document.addEventListener(
    'input',
    function (e) {
      applySilentNormalization(e.target);
    },
    true
  );

  document.addEventListener(
    'paste',
    function (e) {
      const target = e.target;
      if (shouldBypassElement(target)) return;
      setTimeout(function () {
        applySilentNormalization(target);
      }, 0);
    },
    true
  );

  // Expose helper for programmatic normalization
  window.MekoUnicode = {
    normalize: normalizeKurdishText
  };
})();
