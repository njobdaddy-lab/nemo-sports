(()=>{
'use strict';
const q=s=>document.querySelector(s),qa=s=>[...document.querySelectorAll(s)];
const sprint=q('[data-event="sprint"]')||qa('.eventZone .event').find(b=>b.textContent.includes('100m 달리기'));
const obstacle=q('[data-event="obstacle"]')||qa('.eventZone .event').find(b=>b.textContent.includes('100m 장애물'));
const start=q('#startBtn'),logo=q('.raceLogo'),copy=q('.raceCopy'),scene=q('.raceScene'),rule=q('.gameRule'),hint=q('.appHint');
if(!start||!sprint||!obstacle)return;
let selected='sprint';
const eventButtons=qa('.eventZone .event').filter(b=>!b.disabled);
function selectedChar(){return q('#chars .charCard.sel')?.dataset.c||localStorage.getItem('nemo-obstacle-char')||'sugar'}
function sync(){
 eventButtons.forEach(b=>b.classList.remove('active'));(selected==='obstacle'?obstacle:sprint).classList.add('active');
 if(selected==='obstacle'){
  if(logo)logo.textContent='NEMO SPORTS · OBSTACLE';
  if(copy){const sm=copy.querySelector('small'),st=copy.querySelector('strong');if(sm)sm.textContent="TODAY'S RACE";if(st)st.innerHTML='100m<br>장애물 달리기'}
  if(scene)scene.setAttribute('aria-label','100m 장애물 달리기 경기 미리보기');
  if(rule){const strong=rule.querySelector('strong'),p=rule.querySelector('p'),keys=rule.querySelector('.ruleKeys');if(strong)strong.textContent='왼발 ↔ 오른발 + 점프 타이밍';if(p)p.textContent='리듬을 유지하면서 달리고, 허들·웅덩이·박스벽이 오면 점프! 같은 발을 연속으로 누르면 발이 꼬인다.';if(keys)keys.innerHTML='<span>👈 왼발</span><span>⬆️ 점프</span><span>오른발 👉</span>'}
  if(hint)hint.textContent='장애물전은 달리기 리듬에 점프 타이밍이 추가돼. 경기 시작 버튼을 누르면 바로 출전!';
  if(start.disabled)start.disabled=false;
  if(start.textContent!=='🪽 장애물 경기 시작')start.textContent='🪽 장애물 경기 시작';
 }else{
  if(logo)logo.textContent='NEMO SPORTS · 100M';
  if(copy){const sm=copy.querySelector('small'),st=copy.querySelector('strong');if(sm)sm.textContent="TODAY'S RACE";if(st)st.innerHTML='100m<br>네모 달리기'}
  if(scene)scene.setAttribute('aria-label','100m 네모 달리기 경기 미리보기');
  if(rule){const strong=rule.querySelector('strong'),p=rule.querySelector('p'),keys=rule.querySelector('.ruleKeys');if(strong)strong.textContent='왼발 ↔ 오른발 + 타이밍';if(p)p.textContent='두 발을 번갈아 밟되 너무 막 누르지 마! 좋은 리듬은 가속되고, 같은 발을 연속으로 누르면 발이 꼬인다.';if(keys)keys.innerHTML='<span>👈 왼발</span><span>오른발 👉</span>'}
  if(hint)hint.textContent='세로에서는 캐릭터 표정과 리액션을 더 가까이, 가로에서는 경기장을 더 넓고 시원하게 즐길 수 있어.';
  if(!start.disabled&&start.textContent.includes('장애물'))start.textContent='🏁 100m 경기 시작';
 }
}
[sprint,obstacle].forEach(btn=>btn.addEventListener('click',e=>{e.preventDefault();e.stopImmediatePropagation();selected=btn===obstacle?'obstacle':'sprint';sync()},true));
start.addEventListener('click',e=>{
 if(selected!=='obstacle')return;
 e.preventDefault();e.stopImmediatePropagation();
 const ch=selectedChar();localStorage.setItem('nemo-obstacle-char',ch);
 location.href=`./obstacle.html?autostart=1&char=${encodeURIComponent(ch)}&v=2`;
},true);
const mo=new MutationObserver(()=>{if(selected==='obstacle'&&(start.disabled||start.textContent!=='🪽 장애물 경기 시작'))queueMicrotask(sync)});mo.observe(start,{attributes:true,childList:true,subtree:true});
sync();
})();
