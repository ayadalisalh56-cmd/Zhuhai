(()=>{
const M={'\u0643':'\u06A9','\u064A':'\u06CC','\u0649':'\u06CC','\u0629':'\u06D5','\u0624':'\u06C6','\u0625':'\u0626\u06CC','\u0623':'\u0626\u06D5'};
const fix=s=>s.replace(/[\u0643\u064A\u0649\u0629\u0624\u0625\u0623]/g,c=>M[c])
 .replace(/[\u0640\u200B\u200D\uFEFF]/g,'')
 .replace(/\u200C{2,}/g,'\u200C')
 .replace(/\u200C(?=\s)|(?<=\s)\u200C/g,'');
const ok=t=>t&&(t.tagName==='TEXTAREA'||(t.tagName==='INPUT'&&(t.type==='text'||t.type==='search')));
const run=t=>{
 if(!ok(t))return;
 const v=t.value,f=fix(v);
 if(f===v)return;
 const a=t.selectionStart,b=t.selectionEnd;
 t.value=f;
 try{t.setSelectionRange(fix(v.slice(0,a)).length,fix(v.slice(0,b)).length)}catch(_){}
};
document.addEventListener('input',e=>run(e.target),true);
document.addEventListener('paste',e=>{const t=e.target;setTimeout(()=>{run(t);if(ok(t))t.dispatchEvent(new Event('input',{bubbles:true}))},0)},true);
window.MekoNormalize=fix;
})();
