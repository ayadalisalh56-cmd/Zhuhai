/**
 * MEKO SILENT KURDISH UNICODE ENGINE
 * ------------------------------------------------------------------
 * Intercepts all input/paste events globally on <input> and <textarea>.
 * Silently converts legacy Arabic/Ali-font characters to standard 
 * Kurdish UTF-8 without disrupting cursor position or showing UI.
 */
(function() {
    'use strict';

    // Mapping of legacy/problematic chars to Standard Central Kurdish
    const CHAR_MAP = {
        '\u0643': '\u06A9', // Arabic Kaf (ك) -> Kurdish Kaf (ک)
        '\u064A': '\u06CC', // Arabic Yeh (ي) -> Kurdish Yeh (ی)
        '\u0649': '\u06CC', // Arabic Alef Maksura (ى) -> Kurdish Yeh (ی)
        '\u0629': '\u06D5', // Arabic Teh Marbuta (ة) -> Kurdish Ae (ە)
        '\u0624': '\u06C6', // Arabic Waw with Hamza (ؤ) -> Kurdish Oe (ۆ)
        '\u0625': '\u0626\u06CC', // Arabic Alef with Hamza Below (إ) -> Kurdish Ee (ئی)
        '\u0623': '\u0626\u06D5', // Arabic Alef with Hamza Above (أ) -> Kurdish Ae (ئە)
        '\u0640': ''          // Tatweel/Kashida (ـ) -> Remove completely
    };

    // Create a single global regex from the map keys
    const REGEX = new RegExp(Object.keys(CHAR_MAP).join('|'), 'g');

    /**
     * Normalizes a string to standard Kurdish UTF-8
     */
    function normalizeKurdish(text) {
        if (!text || typeof text !== 'string') return text;
        return text.replace(REGEX, (char) => CHAR_MAP[char]);
    }

    /**
     * Handles input events while preserving cursor position
     */
    function handleInputEvent(e) {
        const target = e.target;
        
        // Only process text inputs and textareas
        if (!target || !(target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) return;
        
        // Skip if already processed by us to prevent loops
        if (e._mekoNormalized) return;

        // Quick check: does value contain any problematic chars?
        REGEX.lastIndex = 0;
        if (!REGEX.test(target.value)) return;
        
        // Reset regex state
        REGEX.lastIndex = 0;

        // Store current cursor position
        const start = target.selectionStart;
        const end = target.selectionEnd;
        const originalValue = target.value;
        
        // Perform normalization
        const newValue = normalizeKurdish(originalValue);

        // Only update if something actually changed
        if (originalValue !== newValue) {
            // Calculate how much the text before cursor shifted
            const beforeCursor = originalValue.substring(0, start);
            const normalizedBefore = normalizeKurdish(beforeCursor);
            const diff = normalizedBefore.length - beforeCursor.length;

            // Update value
            target.value = newValue;
            
            // Restore cursor position adjusted for character expansion/removal
            try {
                const newStart = Math.max(0, start + diff);
                const newEnd = Math.max(0, end + diff);
                target.setSelectionRange(newStart, newEnd);
            } catch (err) {
                // Some input types (email, number) don't support setSelectionRange
                console.warn('Meko Unicode Engine: Could not restore cursor position', err);
            }
            
            // Dispatch synthetic input event so app state picks up the change
            const syntheticEvent = new Event('input', { bubbles: true });
            Object.defineProperty(syntheticEvent, '_mekoNormalized', { value: true });
            target.dispatchEvent(syntheticEvent);
        }
    }

    /**
     * Attach listeners in CAPTURE phase to intercept before other handlers
     */
    document.addEventListener('input', handleInputEvent, true);
    
    document.addEventListener('paste', (e) => {
        // Allow paste to complete first, then normalize on next tick
        setTimeout(() => handleInputEvent(e), 0);
    }, true);

    // Expose utility globally for programmatic use in app.js
    window.MekoUnicode = { 
        normalize: normalizeKurdish 
    };

})();
