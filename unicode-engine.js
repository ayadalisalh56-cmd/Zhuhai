/**
 * MEKO SILENT KURDISH UNICODE ENGINE
 * Intercepts all input/paste events globally and normalizes legacy Arabic chars
 * to standard Kurdish UTF-8 without disrupting cursor position or showing UI.
 */
(function() {
    'use strict';

    const CHAR_MAP = {
        '\u0643': '\u06A9', // ك -> ک
        '\u064A': '\u06CC', // ي -> ی
        '\u0649': '\u06CC', // ى -> ی
        '\u0629': '\u06D5', // ة -> ە
        '\u0624': '\u06C6', // ؤ -> ۆ
        '\u0625': '\u0626\u06CC', // إ -> ئی
        '\u0623': '\u0626\u06D5', // أ -> ئە
        '\u0640': ''          // ـ (Tatweel) -> remove
    };

    const REGEX = new RegExp(Object.keys(CHAR_MAP).join('|'), 'g');

    function normalizeKurdish(text) {
        if (!text || typeof text !== 'string') return text;
        return text.replace(REGEX, (char) => CHAR_MAP[char]);
    }

    function handleInputEvent(e) {
        const target = e.target;
        if (!target || !(target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) return;
        
        // Only process if value actually contains problematic chars
        if (!REGEX.test(target.value)) return;
        
        // Reset regex lastIndex since we use global flag
        REGEX.lastIndex = 0;

        const start = target.selectionStart;
        const end = target.selectionEnd;
        const originalValue = target.value;
        const newValue = normalizeKurdish(originalValue);

        if (originalValue !== newValue) {
            // Calculate cursor shift based on length difference before cursor
            const beforeCursor = originalValue.substring(0, start);
            const normalizedBefore = normalizeKurdish(beforeCursor);
            const diff = normalizedBefore.length - beforeCursor.length;

            target.value = newValue;
            
            // Restore cursor position adjusted for character expansion/removal
            try {
                target.setSelectionRange(start + diff, end + diff);
            } catch (err) {
                // Fallback for inputs that don't support setSelectionRange (e.g. email/number)
                console.warn('Unicode Engine: Could not restore cursor', err);
            }
            
            // Dispatch a synthetic input event so frameworks/state managers pick up the change
            // Use bubbles: true but mark it to avoid infinite loops if needed
            const syntheticEvent = new Event('input', { bubbles: true });
            Object.defineProperty(syntheticEvent, '_mekoNormalized', { value: true });
            target.dispatchEvent(syntheticEvent);
        }
    }

    // Attach globally using capture phase to intercept before other handlers
    document.addEventListener('input', handleInputEvent, true);
    document.addEventListener('paste', (e) => {
        // Allow paste to complete, then normalize on next tick
        setTimeout(() => handleInputEvent(e), 0);
    }, true);

    // Expose utility for programmatic use in app.js
    window.MekoUnicode = { normalize: normalizeKurdish };
})();
