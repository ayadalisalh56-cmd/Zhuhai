(function(){
  'use strict';
  const substitutions = [
    [/ك/g, 'ک'], [/ي/g, 'ی'], [/ى/g, 'ی'], [/ة/g, 'ە'], [/ۀ/g, 'ە'], [/ہ/g, 'ە'], [/ھ/g, 'ه'],
    [/ؤ/g, 'ۆ'], [/ئ/g, 'ئ'], [/ـ/g, ''], [/ٱ/g, 'ا'], [/ٲ/g, 'ئ'], [/ٳ/g, 'ئ'], [/ٵ/g, 'ئ'],
    [/ﻙ|ﻚ/g, 'ک'], [/ﻱ|ﻲ|ﻳ|ﻴ/g, 'ی'], [/ﻪ|ﻫ|ﻬ|ﻩ/g, 'ه'], [/ﯙ|ﯚ|ﯛ|ﯜ/g, 'ۆ'],
    [/\u200c/g, '\u200c'], [/\u0640/g, '']
  ];
  function normalize(value){
    let normalized = String(value || '').normalize('NFC');
    substitutions.forEach(([pattern,replacement]) => { normalized = normalized.replace(pattern,replacement); });
    return normalized;
  }
  function normalizeTarget(target){
    if(!target || target.tagName !== 'TEXTAREA') return;
    const start = target.selectionStart;
    const end = target.selectionEnd;
    const next = normalize(target.value);
    if(next !== target.value){
      target.value = next;
      try{ target.setSelectionRange(start,end); }catch(e){}
    }
  }
  document.addEventListener('input', event => normalizeTarget(event.target), true);
  document.addEventListener('paste', event => {
    if(!event.target || event.target.tagName !== 'TEXTAREA') return;
    const clipboard = event.clipboardData;
    if(!clipboard) return;
    const text = clipboard.getData('text');
    if(normalize(text) !== text){
      event.preventDefault();
      const target = event.target;
      const before = target.value.slice(0,target.selectionStart);
      const after = target.value.slice(target.selectionEnd);
      const inserted = normalize(text);
      target.value = before + inserted + after;
      const caret = before.length + inserted.length;
      target.setSelectionRange(caret,caret);
      target.dispatchEvent(new Event('input',{bubbles:true}));
    }
  }, true);
  window.MekoUnicode = { normalize };
})();
