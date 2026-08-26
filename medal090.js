(()=>{
'use strict';
const result=document.getElementById('result');
const rows=document.getElementById('rows');
const setup=document.querySelector('.setupPanel');
const difficulty=document.getElementById('difficulty');
if(!result||!rows||!setup)return;

const CHAR_NAMES={sugar:'각설탕',brown:'흑설탕',brick:'벽돌',safe:'금고',apt:'아파트'};
const MEDALS=[
 {key:'platinum',name:'플래티넘',icon:'💎',time:11.50},
 {key:'gold',name:'골드',icon:'🥇',time:12.50},
 {key:'silver',name:'실버',icon:'🥈',time:14.00},
 {key:'bronze',name:'브론즈',icon:'🥉',time:16.00}
];

function medalFor(time){
 if(!Number.isFinite(time))return null;
 return MEDALS.find(m=>time<=m.time)||{key:'finish',name:'완주',icon:'🏁',time:null};
}
function nextGoal(time){
 if(!Number.isFinite(time))return MEDALS.at(-1);
 const ascending=[...MEDALS].reverse();
 return ascending.find(m=>time>m.time)||null;
}
function selectedChar(){
 const id=document.querySelector('#chars .charCard.sel')?.dataset.c||'sugar';
 return {id,name:CHAR_NAMES[id]||'각설탕'};
}
function pbFor(name){const n=parseFloat(localStorage.getItem(`nemo-pb-100m-${name}`)||'');return Number.isFinite(n)?n:null}
function savePB(name,time){
 const old=pbFor(name);
 if(!Number.isFinite(old)||time<old){localStorage.setItem(`nemo-pb-100m-${name}`,String(time));return time}
 return old;
}
function goalText(best){
 const goal=nextGoal(best);
 if(!Number.isFinite(best))return '<b>첫 목표 · 브론즈 16.00s</b><span>첫 완주 기록부터 만들어보자.</span>';
 if(!goal)return '<b>💎 플래티넘 달성!</b><span>이제는 내 최고기록을 계속 줄여보자.</span>';
 const gap=Math.max(0,best-goal.time);
 return `<b>${goal.icon} 다음 목표 · ${goal.name} ${goal.time.toFixed(2)}s</b><span>${gap.toFixed(2)}초만 줄이면 ${goal.name}!</span>`;
}
function ensureHome(){
 let box=document.getElementById('medalHome090');if(box)return box;
 box=document.createElement('div');box.id='medalHome090';box.className='medalHome090';
 box.innerHTML='<div class="medalHomeHead090"><span>🏅 100M RECORD</span><b id="medalHomeBadge090">첫 기록 도전</b></div><div class="medalHomeMain090"><div><small>내 최고기록</small><strong id="medalHomeBest090">--.--s</strong></div><div id="medalHomeGoal090" class="medalHomeGoal090"></div></div><div class="medalScale090"><span><i>🥉</i>16.00</span><span><i>🥈</i>14.00</span><span><i>🥇</i>12.50</span><span><i>💎</i>11.50</span></div>';
 const rule=setup.querySelector('.gameRule');
 if(rule)setup.insertBefore(box,rule);else setup.appendChild(box);
 return box;
}
function updateHome(){
 ensureHome();
 const c=selectedChar(),best=pbFor(c.name),medal=medalFor(best);
 const bestEl=document.getElementById('medalHomeBest090'),badge=document.getElementById('medalHomeBadge090'),goal=document.getElementById('medalHomeGoal090');
 if(bestEl)bestEl.textContent=Number.isFinite(best)?best.toFixed(2)+'s':'--.--s';
 if(badge){badge.className=`medalBadge090 ${medal?.key||'none'}`;badge.textContent=medal?`${medal.icon} ${medal.name}`:'첫 기록 도전'}
 if(goal)goal.innerHTML=goalText(best);
}
function parseMe(){
 const row=rows.querySelector('.row.me');if(!row)return null;
 const label=row.querySelector('span')?.textContent||'';
 const m=label.match(/\((.*?)\)/);
 const strongs=[...row.querySelectorAll('strong')];
 const time=parseFloat(strongs.at(-1)?.textContent||'');
 if(!Number.isFinite(time))return null;
 return {char:m?.[1]||selectedChar().name,time};
}
function ensureResult(){
 let box=document.getElementById('medalResult090');if(box)return box;
 box=document.createElement('div');box.id='medalResult090';box.className='medalResult090';
 box.innerHTML='<div class="medalResultMedal090"><span id="medalResultIcon090">🏁</span><div><small>이번 기록 등급</small><strong id="medalResultName090">완주</strong></div></div><div class="medalResultGoal090"><small>NEXT TARGET</small><div id="medalResultGoal090Text"></div></div>';
 const actions=result.querySelector('.actions');
 const challenge=document.getElementById('challengeNote');
 if(challenge)challenge.insertAdjacentElement('beforebegin',box);else if(actions)actions.insertAdjacentElement('beforebegin',box);else result.querySelector('.resultCard')?.appendChild(box);
 return box;
}
function updateResult(){
 if(result.hidden)return;
 const me=parseMe();if(!me)return;
 const best=savePB(me.char,me.time),medal=medalFor(me.time),goal=nextGoal(best);
 ensureResult();
 const icon=document.getElementById('medalResultIcon090'),name=document.getElementById('medalResultName090'),goalEl=document.getElementById('medalResultGoal090Text');
 if(icon)icon.textContent=medal?.icon||'🏁';
 if(name){name.className=`medalName090 ${medal?.key||'finish'}`;name.textContent=medal?.name||'완주'}
 if(goalEl){
  if(!goal)goalEl.innerHTML='<b>💎 최고 등급 달성!</b><span>이제 개인 최고기록을 더 줄여보자.</span>';
  else{const gap=Math.max(0,best-goal.time);goalEl.innerHTML=`<b>${goal.icon} ${goal.name} · ${goal.time.toFixed(2)}s</b><span>${gap.toFixed(2)}초 단축하면 다음 메달!</span>`}
 }
 updateHome();
}

updateHome();
document.addEventListener('click',e=>{if(e.target.closest('#chars .charCard'))requestAnimationFrame(updateHome)});
if(difficulty)new MutationObserver(updateHome).observe(difficulty,{childList:true,subtree:true});
new MutationObserver(()=>requestAnimationFrame(updateResult)).observe(result,{attributes:true,attributeFilter:['hidden']});
new MutationObserver(()=>{if(!result.hidden)requestAnimationFrame(updateResult)}).observe(rows,{childList:true,subtree:true});
window.addEventListener('storage',updateHome);
})();