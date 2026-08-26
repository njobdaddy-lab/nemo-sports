(()=>{
'use strict';
const game=document.getElementById('game');
const result=document.getElementById('result');
const rows=document.getElementById('rows');
const timer=document.getElementById('timer');
const progress=document.getElementById('progressText');
const rankBadge=document.getElementById('rankBadge');
const msg=document.getElementById('msg');
const setup=document.querySelector('.setupPanel');
if(!game||!result||!rows||!timer||!progress||!rankBadge||!msg||!setup)return;

const PERFECT_TARGET=10;
let run={active:false,perfect:0,stumbled:false,sawFourth:false,distance:0,finished:false};
let lastPerfectAt=0;

function meters(){const n=parseFloat(progress.textContent||'');return Number.isFinite(n)?n:0}
function rank(){const n=parseInt(rankBadge.textContent||'',10);return Number.isFinite(n)?n:null}
function meRank(){
 const row=rows.querySelector('.row.me');
 const n=parseInt(row?.querySelector('span strong')?.textContent||'',10);
 return Number.isFinite(n)?n:null;
}
function missionState(){
 return {
  clean:!run.stumbled,
  rhythm:run.perfect>=PERFECT_TARGET,
  comeback:run.sawFourth&&meRank()===1
 };
}

function ensureHome(){
 let box=document.getElementById('missionHome091');if(box)return box;
 box=document.createElement('div');box.id='missionHome091';box.className='missionHome091';
 box.innerHTML=`<div class="missionHead091"><span>🎯 RACE MISSION</span><b>이번 판 도전</b></div><div class="missionList091"><div><i>🛡️</i><span><b>무실수 완주</b><small>발 꼬임 없이 100m 완주</small></span></div><div><i>⚡</i><span><b>리듬 마스터</b><small>PERFECT ${PERFECT_TARGET}회</small></span></div><div><i>🔥</i><span><b>대역전</b><small>15m 이후 4위 → 1위 우승</small></span></div></div>`;
 const medal=document.getElementById('medalHome090');
 const rule=setup.querySelector('.gameRule');
 if(medal)medal.insertAdjacentElement('afterend',box);else if(rule)setup.insertBefore(box,rule);else setup.appendChild(box);
 return box;
}

function ensureHud(){
 let hud=document.getElementById('missionHud091');if(hud)return hud;
 hud=document.createElement('div');hud.id='missionHud091';hud.className='missionHud091';
 hud.innerHTML=`<div id="missionClean091" class="missionHudRow091"><span>🛡️ 무실수</span><b>유지 중</b></div><div id="missionPerfect091" class="missionHudRow091"><span>⚡ PERFECT</span><b>0/${PERFECT_TARGET}</b></div><div id="missionComeback091" class="missionHudRow091"><span>🔥 대역전</span><b>4위 경험 필요</b></div>`;
 game.querySelector('.stage')?.appendChild(hud);
 return hud;
}

function ensureResult(){
 let box=document.getElementById('missionResult091');if(box)return box;
 box=document.createElement('div');box.id='missionResult091';box.className='missionResult091';
 box.innerHTML=`<div class="missionResultHead091"><div><small>RACE MISSION</small><strong id="missionScore091">0 / 3 CLEAR</strong></div><span id="missionStars091">☆☆☆</span></div><div class="missionResultGrid091"><div id="missionResultClean091"></div><div id="missionResultPerfect091"></div><div id="missionResultComeback091"></div></div>`;
 const actions=result.querySelector('.actions');
 const medal=document.getElementById('medalResult090');
 if(medal)medal.insertAdjacentElement('afterend',box);else if(actions)actions.insertAdjacentElement('beforebegin',box);else result.querySelector('.resultCard')?.appendChild(box);
 return box;
}

function resetRun(){
 run={active:true,perfect:0,stumbled:false,sawFourth:false,distance:0,finished:false};
 lastPerfectAt=0;
 ensureHud();
 updateHud();
}

function updateHud(){
 ensureHud();
 const clean=document.getElementById('missionClean091');
 const perfect=document.getElementById('missionPerfect091');
 const comeback=document.getElementById('missionComeback091');
 if(clean){clean.classList.toggle('failed',run.stumbled);clean.classList.toggle('done',false);clean.querySelector('b').textContent=run.stumbled?'실패':'유지 중'}
 if(perfect){const done=run.perfect>=PERFECT_TARGET;perfect.classList.toggle('done',done);perfect.querySelector('b').textContent=`${Math.min(run.perfect,PERFECT_TARGET)}/${PERFECT_TARGET}${done?' ✓':''}`}
 if(comeback){comeback.classList.toggle('armed',run.sawFourth);comeback.querySelector('b').textContent=run.sawFourth?'역전 준비 🔥':'4위 경험 필요'}
}

function showResult(){
 if(result.hidden||run.finished)return;
 const r=meRank();if(!r)return;
 run.finished=true;run.active=false;
 const st=missionState();
 const items=[st.clean,st.rhythm,st.comeback];
 const score=items.filter(Boolean).length;
 ensureResult();
 const scoreEl=document.getElementById('missionScore091'),stars=document.getElementById('missionStars091');
 if(scoreEl)scoreEl.textContent=`${score} / 3 CLEAR`;
 if(stars)stars.textContent='★'.repeat(score)+'☆'.repeat(3-score);
 const set=(id,ok,icon,title,sub)=>{const el=document.getElementById(id);if(!el)return;el.className=ok?'clear':'fail';el.innerHTML=`<span>${ok?'✅':icon}</span><div><b>${title}</b><small>${ok?'MISSION CLEAR':sub}</small></div>`};
 set('missionResultClean091',st.clean,'❌','무실수 완주',run.stumbled?'발 꼬임 발생':'');
 set('missionResultPerfect091',st.rhythm,'⚡','리듬 마스터',`PERFECT ${run.perfect}/${PERFECT_TARGET}`);
 set('missionResultComeback091',st.comeback,'🔥','대역전',run.sawFourth?`${r}위로 완주`:'15m 이후 4위 미경험');
 const best=Number(localStorage.getItem('nemo-mission-best-100m')||0);
 if(score>best)localStorage.setItem('nemo-mission-best-100m',String(score));
}

ensureHome();ensureHud();

new MutationObserver(()=>{
 if((timer.textContent||'').trim()==='3')resetRun();
}).observe(timer,{childList:true,subtree:true,characterData:true});

new MutationObserver(()=>{
 if(!run.active)return;
 if((msg.textContent||'').includes('발 꼬임')){run.stumbled=true;updateHud()}
}).observe(msg,{childList:true,subtree:true,characterData:true});

function attachJudge(){
 const judge=document.getElementById('timingJudge');if(!judge)return false;
 new MutationObserver(()=>{
  if(!run.active)return;
  const t=(judge.textContent||'').trim();
  const now=performance.now();
  if(/^PERFECT/.test(t)&&now-lastPerfectAt>70){lastPerfectAt=now;run.perfect++;updateHud()}
 }).observe(judge,{childList:true,subtree:true,characterData:true});
 return true;
}
if(!attachJudge()){
 const wait=setInterval(()=>{if(attachJudge())clearInterval(wait)},100);
 setTimeout(()=>clearInterval(wait),12000);
}

new MutationObserver(()=>{
 if(!result.hidden)requestAnimationFrame(showResult);
}).observe(result,{attributes:true,attributeFilter:['hidden']});
new MutationObserver(()=>{if(!result.hidden)requestAnimationFrame(showResult)}).observe(rows,{childList:true,subtree:true});

function poll(){
 if(run.active&&!game.hidden){
  const m=meters(),r=rank();run.distance=m;
  if(m>=15&&r===4&&!run.sawFourth){run.sawFourth=true;updateHud()}
 }
 requestAnimationFrame(poll);
}
requestAnimationFrame(poll);
})();