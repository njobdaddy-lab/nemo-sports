(()=>{
'use strict';
const chars=document.getElementById('chars');
const playerPanel=document.querySelector('.playerPanel');
if(!chars||!playerPanel)return;

const STAR_KEY='nemo-stars-100m';
const COLLECTION=[
 {id:'sugar',name:'각설탕',need:0},
 {id:'brown',name:'흑설탕',need:5},
 {id:'brick',name:'벽돌',need:10},
 {id:'safe',name:'금고',need:18},
 {id:'apt',name:'아파트',need:25}
];
let lastStars=readStars();
let applying=false;

function readStars(){const n=parseInt(localStorage.getItem(STAR_KEY)||'0',10);return Number.isFinite(n)?Math.max(0,n):0}
function unlockedCount(total){return COLLECTION.filter(c=>total>=c.need).length}
function profile(id){return COLLECTION.find(c=>c.id===id)||COLLECTION[0]}

function ensureSummary(){
 let box=document.getElementById('collectionSummary093');if(box)return box;
 box=document.createElement('div');box.id='collectionSummary093';box.className='collectionSummary093';
 box.innerHTML='<div><small>NEMO COLLECTION</small><strong id="collectionCount093">1 / 5 네모 해금</strong></div><div class="collectionProgress093"><i id="collectionBar093"></i></div><b id="collectionNext093">다음 · 흑설탕 5⭐</b>';
 const strip=playerPanel.querySelector('.charStrip');
 if(strip)strip.insertAdjacentElement('afterend',box);else playerPanel.appendChild(box);
 return box;
}
function ensureToast(){
 let t=document.getElementById('collectionToast093');if(t)return t;
 t=document.createElement('div');t.id='collectionToast093';t.className='collectionToast093';document.body.appendChild(t);return t;
}
function toast(title,sub='',unlock=false){
 const t=ensureToast();t.className=`collectionToast093${unlock?' unlock':''}`;t.innerHTML=`${title}${sub?`<small>${sub}</small>`:''}`;
 requestAnimationFrame(()=>t.classList.add('show'));clearTimeout(t._t);t._t=setTimeout(()=>t.classList.remove('show'),1600);
}
function updateSummary(total){
 ensureSummary();const count=unlockedCount(total),next=COLLECTION.find(c=>total<c.need);
 const countEl=document.getElementById('collectionCount093'),bar=document.getElementById('collectionBar093'),nextEl=document.getElementById('collectionNext093');
 if(countEl)countEl.textContent=`${count} / ${COLLECTION.length} 네모 해금`;
 if(bar)bar.style.width=`${count/COLLECTION.length*100}%`;
 if(nextEl)nextEl.textContent=next?`다음 · ${next.name} ${next.need}⭐`:'도감 1차 완성!';
}
function applyCards(){
 if(applying)return;applying=true;
 const total=readStars();
 for(const card of chars.querySelectorAll('.charCard[data-c]')){
  const c=profile(card.dataset.c),ok=total>=c.need;
  card.classList.toggle('nemoLocked093',!ok);card.classList.toggle('collectionUnlocked093',ok&&c.need>0);
  card.setAttribute('aria-disabled',String(!ok));
  let tag=card.querySelector('.collectionTag093');if(!tag){tag=document.createElement('em');tag.className='collectionTag093';card.appendChild(tag)}
  tag.textContent=c.need===0?'기본 네모':ok?'해금 ✓':`🔒 ${c.need-total}⭐ 남음`;
 }
 const selected=chars.querySelector('.charCard.sel.nemoLocked093');
 if(selected){const sugar=chars.querySelector('.charCard[data-c="sugar"]');if(sugar)sugar.click()}
 updateSummary(total);applying=false;
}
function handleStarChange(){
 const now=readStars();
 if(now>lastStars){
  const newly=COLLECTION.filter(c=>c.need>lastStars&&c.need<=now);
  if(newly.length){const names=newly.map(c=>c.name).join(' · ');setTimeout(()=>toast(`🎉 새 네모 해금! ${names}`,'이제 선수 선택에서 바로 출전할 수 있어.',true),250)}
 }
 lastStars=now;applyCards();
}

chars.addEventListener('click',e=>{
 const card=e.target.closest('.charCard[data-c]');if(!card)return;
 const c=profile(card.dataset.c),total=readStars();
 if(total<c.need){e.preventDefault();e.stopPropagation();toast(`🔒 ${c.name} · ${c.need-total}⭐ 더 필요`,`미션을 클리어해서 네모별을 모아봐.`);return}
},true);

new MutationObserver(()=>requestAnimationFrame(applyCards)).observe(chars,{childList:true,subtree:true});

function watchWallet(){
 const wallet=document.getElementById('rewardWalletCount092');if(!wallet)return false;
 new MutationObserver(()=>requestAnimationFrame(handleStarChange)).observe(wallet,{childList:true,subtree:true,characterData:true});return true;
}
if(!watchWallet()){const wait=setInterval(()=>{if(watchWallet())clearInterval(wait)},100);setTimeout(()=>clearInterval(wait),12000)}
window.addEventListener('storage',e=>{if(!e.key||e.key===STAR_KEY)handleStarChange()});

ensureSummary();applyCards();
})();
