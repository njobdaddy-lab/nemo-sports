(()=>{
'use strict';
const result=document.getElementById('result');
const card=result?.querySelector('.resultCard');
const podium=document.getElementById('podium');
const rows=document.getElementById('rows');
const title=document.getElementById('resultTitle');
const record=document.getElementById('record');
if(!result||!card||!podium||!rows||!title||!record)return;

const charStyle={
 '각설탕':{bg:'#f7efe2',fg:'#44362c',face:'•ᴗ•'},
 '흑설탕':{bg:'#8a4f2c',fg:'#fff3e8',face:'•̀ᴗ•́'},
 '벽돌':{bg:'#cb563b',fg:'#fff7ef',face:'ㅡ_ㅡ'},
 '금고':{bg:'#717a86',fg:'#f5fbff',face:'•_•'},
 '아파트':{bg:'#e7d5b8',fg:'#4f4234',face:'•ω•'}
};
let lastSignature='';

function ensureHero(){
 let hero=document.getElementById('resultHero086');
 if(hero)return hero;
 hero=document.createElement('div');hero.id='resultHero086';hero.className='resultHero086';
 hero.innerHTML='<div class="resultReaction086"><span id="resultFace086" class="bigFace">😤</span><div><small>RACE REACTION</small><b id="resultReactionText086">끝까지 달렸다!</b></div></div><div class="resultStats086"><div class="resultStat086"><small>이번 기록</small><strong id="currentTime086">-</strong></div><div class="resultStat086 best"><small>BEST</small><strong id="bestTime086">-</strong></div><div id="newBest086" class="newBest086" hidden>✨ NEW BEST!</div></div>';
 const top=card.querySelector('.resultTop');top?.insertAdjacentElement('afterend',hero);
 return hero;
}

function parseRows(){
 return [...rows.querySelectorAll('.row')].map((row,idx)=>{
  const label=row.querySelector('span')?.textContent?.trim()||'';
  const timeText=[...row.querySelectorAll('strong')].at(-1)?.textContent?.trim()||'';
  const m=label.match(/(\d+)위\s*·\s*(.*?)\s*\((.*?)\)/);
  const time=parseFloat(timeText);
  return {place:m?Number(m[1]):idx+1,name:m?m[2]:'선수',char:m?m[3]:'네모',time:Number.isFinite(time)?time:null,me:row.classList.contains('me')};
 }).sort((a,b)=>a.place-b.place);
}

function reactionFor(rank){
 if(rank===1)return{face:'🤩',text:'우승! 마지막까지 완벽했어!'};
 if(rank===2)return{face:'😤',text:'아깝다! 다음 판엔 바로 잡는다!'};
 if(rank===3)return{face:'🔥',text:'포디움 입성! 한 번 더 가자!'};
 return{face:'😵‍💫',text:'이번 판은 졌지만 재대결 간다!'};
}

function buildPodium(data){
 const top3=data.slice(0,3);podium.innerHTML='';
 for(const p of top3){
  const st=charStyle[p.char]||{bg:'#dbe5f1',fg:'#203047',face:'•ᴗ•'};
  const slot=document.createElement('div');slot.className=`podiumSlot086 place${p.place}${p.me?' me':''}`;
  slot.innerHTML=`<div class="podiumChar086" style="background:${st.bg};color:${st.fg}">${p.place===1?'<span class="podiumCrown086">👑</span>':''}<span>${st.face}</span></div><div class="podiumBlock086"><em>${p.place}</em><b>${p.name} · ${p.char}</b><small>${p.time!==null?p.time.toFixed(2)+'s':'-'}</small></div>`;
  podium.appendChild(slot);
 }
}

function updateBest(me){
 const current=me?.time;
 if(!Number.isFinite(current))return;
 const key=`nemo-pb-100m-${me.char}`;
 const old=parseFloat(localStorage.getItem(key)||'');
 const isNew=!Number.isFinite(old)||current<old-0.005;
 const best=isNew?current:old;
 if(isNew)localStorage.setItem(key,String(current));
 const currentEl=document.getElementById('currentTime086'),bestEl=document.getElementById('bestTime086'),badge=document.getElementById('newBest086');
 if(currentEl)currentEl.textContent=current.toFixed(2)+'s';
 if(bestEl)bestEl.textContent=best.toFixed(2)+'s';
 if(badge)badge.hidden=!isNew;
}

function enhance(){
 if(result.hidden)return;
 ensureHero();
 const data=parseRows();if(!data.length)return;
 const me=data.find(x=>x.me);if(!me)return;
 const signature=`${me.char}:${me.time}:${data.map(x=>x.place+x.char).join('|')}`;
 buildPodium(data);
 const r=reactionFor(me.place),face=document.getElementById('resultFace086'),text=document.getElementById('resultReactionText086');
 if(face)face.textContent=r.face;if(text)text.textContent=r.text;
 title.textContent=me.place===1?'🏆 100m 우승!':me.place===2?'🥈 2위! 거의 잡았다!':me.place===3?'🥉 3위! 포디움 입성!':'🔥 4위! 다시 붙자!';
 if(signature!==lastSignature){lastSignature=signature;updateBest(me)}
}

new MutationObserver(()=>requestAnimationFrame(enhance)).observe(result,{attributes:true,attributeFilter:['hidden']});
new MutationObserver(()=>{if(!result.hidden)requestAnimationFrame(enhance)}).observe(rows,{childList:true,subtree:true});
})();
