(function(){
  var MAP={'\u0643':'\u06A9','\u064A':'\u06CC','\u0649':'\u06CC','\u0629':'\u06D5','\u0624':'\u06C6','\u0625':'\u0626\u06CC','\u0623':'\u0626\u06D5','\u0640':''};
  var RE=/[\u0643\u064A\u0649\u0629\u0624\u0625\u0623\u0640]/g;
  var TEST=/[\u0643\u064A\u0649\u0629\u0624\u0625\u0623\u0640]/;
  var SKIP=/^(file|checkbox|radio|button|submit|range|color|number|date|time)$/;
  function fix(s){return s.replace(RE,function(c){return MAP[c];});}
  function ok(el){
    if(!el||!el.matches||!el.matches('input,textarea'))return false;
    return !(el.tagName==='INPUT'&&SKIP.test(el.type));
  }
  function convert(el){
    var v=el.value;
    if(!TEST.test(v))return;
    var s=el.selectionStart,e=el.selectionEnd;
    var ns=fix(v.slice(0,s)).length,ne=fix(v.slice(0,e)).length;
    el.value=fix(v);
    try{el.setSelectionRange(ns,ne);}catch(_){}
  }
  document.addEventListener('input',function(ev){
    if(ok(ev.target))convert(ev.target);
  },true);
  document.addEventListener('paste',function(ev){
    var el=ev.target;
    if(!ok(el)||!ev.clipboardData)return;
    var txt=ev.clipboardData.getData('text');
    if(!TEST.test(txt))return;
    ev.preventDefault();
    var s=el.selectionStart,e=el.selectionEnd,out=fix(txt);
    el.value=el.value.slice(0,s)+out+el.value.slice(e);
    var p=s+out.length;
    try{el.setSelectionRange(p,p);}catch(_){}
    el.dispatchEvent(new Event('input',{bubbles:true}));
  },true);
})();
