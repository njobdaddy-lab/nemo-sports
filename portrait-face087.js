(()=>{
'use strict';
const FACE={
 sugar:{bg:'#f7efe2',fg:'#44362c',idle:'•ᴗ•',focus:'•̀ᴗ•́',overtake:'•̀ᴗ•́',passed:'•᷄⌓•᷅',stumble:'×_×',perfect:'★ᴗ★',lead:'⌐■ᴗ■',finish:'★ᴗ★'},
 brown:{bg:'#8a4f2c',fg:'#fff3e8',idle:'•̀ᴗ•́',focus:'•̀_•́',overtake:'￣ᴗ￣',passed:'•︵•',stumble:'x_x',perfect:'✦ᴗ✦',lead:'￣▽￣',finish:'✦ᴗ✦'},
 brick:{bg:'#cb563b',fg:'#fff7ef',idle:'ㅡ_ㅡ',focus:'ಠ_ಠ',overtake:'￣ー￣',passed:'ㅡㅅㅡ?',stumble:'x_x',perfect:'•̀_•́',lead:'￣▽￣',finish:'￣▽￣'},
 safe:{bg:'#717a86',fg:'#f5fbff',idle:'•_•',focus:'•̀_•́',overtake:'•̀ᴗ•́',passed:'•︵•',stumble:'@_@',perfect:'★_★',lead:'★_★',finish:'★_★'},
 apt:{bg:'#e7d5b8',fg:'#4f4234',idle:'•ω•',focus:'•̀ω•́',overtake:'•̀ω•́',passed:'•᷄ω•᷅',stumble:'xωx',perfect:'☆ω☆',lead:'☆ω☆',finish:'☆ω☆'}
};
function selected(){return document.querySelector('#chars .charCard.sel')?.dataset.c||'sugar'}
function stateFrom(text=''){
 if(/발이 꼬|꽈당|넘어/.test(text))return 'stumble';
 if(/리듬 좋|PERFECT/.test(text))return 'perfect';
 if(/1위다|선두/.test(text))return 'lead';
 if(/도착|FINISH|우승/.test(text))return 'finish';
 if(/지나간다|못 막아|간다~|간다!/.test(text))return 'overtake';
 if(/뭐지|잠깐|어\?!|따라잡/.test(text))return 'passed';
 if(/스타트|집중|가자/.test(text))return 'focus';
 return 'idle';
}
function paint(){
 const face=document.getElementById('portraitFace'),text=document.getElementById('portraitReactText');
 if(!face)return;
 const key=selected(),set=FACE[key]||FACE.sugar,state=stateFrom(text?.textContent||'');
 face.textContent=set[state]||set.idle;
 face.dataset.char=key;face.dataset.state=state;
 face.style.setProperty('--nemo-face-bg',set.bg);
 face.style.setProperty('--nemo-face-fg',set.fg);
}
function boot(){
 const text=document.getElementById('portraitReactText');
 if(!text){setTimeout(boot,80);return}
 new MutationObserver(()=>requestAnimationFrame(paint)).observe(text,{childList:true,subtree:true,characterData:true});
 const chars=document.getElementById('chars');
 if(chars)new MutationObserver(()=>requestAnimationFrame(paint)).observe(chars,{childList:true,subtree:true,attributes:true,attributeFilter:['class']});
 document.addEventListener('click',e=>{if(e.target.closest?.('#chars .charCard'))setTimeout(paint,0)},true);
 paint();
}
boot();
})();
