(()=>{
const M={'\u0643':'\u06A9','\u064A':'\u06CC','\u0649':'\u06CC','\u0629':'\u06D5','\u0624':'\u06C6','\u0625':'\u0626\u06CC','\u0623':'\u0626\u06D5','\u0640':'','\u200B':'','\u200D':'','\uFEFF':''};
const R=/[\u0643\u064A\u0649\u0629\u0624\u0625\u0623\u0640\u200B\u200D\uFEFF]/g;
const norm=s=>s.replace(R,c=>M[c]);
const ok=e=>e&&(e.tagName==='TEXTAREA'||(e.tagName==='INPUT'&&(e.type==='text'||e.type==='search')));
const fix=e=>{
 if(!ok(e)||e.isComposing)return;
 const v=e.value,nv=norm(v);
 if(nv===v)return;
 const s=e.selectionStart,t=e.selectionEnd;
 e.value=nv;
 if(s!==null)e.setSelectionRange(norm(v.slice(0,s)).length,norm(v.slice(0,t)).length);
};
window.MekoUnicode={normalize:norm};
document.addEventListener('input',e=>fix(e.target),true);
document.addEventListener('paste',e=>{const t=e.target;setTimeout(()=>{fix(t);if(ok(t))t.dispatchEvent(new Event('input',{bubbles:true}))},0)},true);
})();
