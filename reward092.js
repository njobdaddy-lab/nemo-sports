(()=>{
'use strict';
const result=document.getElementById('result');
const timer=document.getElementById('timer');
const setup=document.querySelector('.setupPanel');
if(!result||!timer||!setup)return;

const STAR_KEY='nemo-stars-100m';
const REWARDS=[
 {need:5,icon:'⭐',name:'스타트 뱃지',className:'rewardBadge092'},
 {need:12,icon:'🏁',name:'레이서 테두리',className:'rewardFrame092'},
 {need:25,icon:'✨',name:'챔피언 오라',className:'rewardAura092'}
];
let raceSerial=0,lastAwardedSerial=-1;

function stars(){const n=parseInt(localStorage.getItem(STAR_KEY)||'0',10);return Number.isFinite(n)?n:0}
function setStars(n){localStorage.setItem(STAR_KEY,String(Math.max(0,n|0)))}
function missionScore(){
 const el=document.getElementById('missionScore091');
 const n=parseInt(el?.textContent||'',10);
 return Number.isFinite(n)?Math.max(0,Math.min(3,n)):null;
}
function unlocked(total){return REWARDS.filter(r=>total>=r.need)}
function nextReward(total){return REWARDS.find(r=>total<r.need)||null}

function ensureWallet(){
 let box=document.getElementById('rewardWallet092');if(box)return box;
 box=document.createElement('div');box.id='rewardWallet092';box.className='rewardWallet092';
 box.innerHTML='<span>⭐</span><div><small>네모별</small><strong id="rewardWalletCount092">0</strong></div>';
 const actions=document.querySelector('.homeActions');
 if(actions)actions.insertBefore(box,actions.firstChild);else document.querySelector('#home .top')?.appendChild(box);
 return box;
}
function ensureTrack(){
 let box=document.getElementById('rewardTrack092');if(box)return box;
 box=document.createElement('div');box.id='rewardTrack092';box.className='rewardTrack092';
 box.innerHTML=`<div class="rewardTrackHead092"><span>🎁 NEMO REWARD</span><b id="rewardNext092">첫 보상까지 5개</b></div><div class="rewardMilestones092">${REWARDS.map(r=>`<div data-need="${r.need}"><i>${r.icon}</i><span><b>${r.name}</b><small>${r.need} ⭐</small></span><em>잠김</em></div>`).join('')}</div>`;
 const mission=document.getElementById('missionHome091');
 const rule=setup.querySelector('.gameRule');
 if(mission)mission.insertAdjacentElement('afterend',box);else if(rule)setup.insertBefore(box,rule);else setup.appendChild(box);
 return box;
}
function ensureResult(){
 let box=document.getElementById('rewardResult092');if(box)return box;
 box=document.createElement('div');box.id='rewardResult092';box.className='rewardResult092';
 box.innerHTML='<div class="rewardEarn092"><span>⭐</span><div><small>이번 경기 보상</small><strong id="rewardEarnText092">+0 네모별</strong></div></div><div class="rewardTotal092"><small>TOTAL</small><b id="rewardTotalText092">0 ⭐</b><span id="rewardUnlockText092"></span></div>';
 const mission=document.getElementById('missionResult091');
 const actions=result.querySelector('.actions');
 if(mission)mission.insertAdjacentElement('afterend',box);else if(actions)actions.insertAdjacentElement('beforebegin',box);else result.querySelector('.resultCard')?.appendChild(box);
 return box;
}
function ensureToast(){
 let t=document.getElementById('rewardToast092');if(t)return t;
 t=document.createElement('div');t.id='rewardToast092';t.className='rewardToast092';document.body.appendChild(t);return t;
}
function showToast(text){const t=ensureToast();t.textContent=text;t.classList.add('show');clearTimeout(t._t);t._t=setTimeout(()=>t.classList.remove('show'),1500)}

function applyCosmetics(total){
 for(const r of REWARDS)document.body.classList.toggle(r.className,total>=r.need);
}
function updateUI(){
 const total=stars();ensureWallet();ensureTrack();applyCosmetics(total);
 const count=document.getElementById('rewardWalletCount092');if(count)count.textContent=total;
 const next=nextReward(total),nextEl=document.getElementById('rewardNext092');
 if(nextEl)nextEl.textContent=next?`${next.name}까지 ${next.need-total}개`:'모든 꾸미기 해금!';
 document.querySelectorAll('#rewardTrack092 .rewardMilestones092>div').forEach(el=>{
  const need=Number(el.dataset.need),ok=total>=need;el.classList.toggle('unlocked',ok);const em=el.querySelector('em');if(em)em.textContent=ok?'해금 ✓':`${Math.max(0,need-total)}개 남음`;
 });
}
function award(){
 if(result.hidden||lastAwardedSerial===raceSerial)return;
 const score=missionScore();if(score===null)return;
 lastAwardedSerial=raceSerial;
 const before=stars(),after=before+score;setStars(after);ensureResult();
 const earn=document.getElementById('rewardEarnText092'),total=document.getElementById('rewardTotalText092'),unlock=document.getElementById('rewardUnlockText092');
 if(earn)earn.textContent=`+${score} 네모별`;
 if(total)total.textContent=`${after} ⭐`;
 const gained=REWARDS.filter(r=>before<r.need&&after>=r.need);
 if(unlock)unlock.textContent=gained.length?`🎉 ${gained.map(r=>r.name).join(' · ')} 해금!`:(nextReward(after)?`다음: ${nextReward(after).name}`:'ALL UNLOCKED');
 updateUI();
 if(score>0)showToast(`미션 보상 +${score} ⭐`);
 if(gained.length)setTimeout(()=>showToast(`🎉 ${gained.map(r=>r.name).join(' · ')} 해금!`),900);
}

ensureWallet();ensureTrack();updateUI();
new MutationObserver(()=>{if((timer.textContent||'').trim()==='3')raceSerial++}).observe(timer,{childList:true,subtree:true,characterData:true});
new MutationObserver(()=>{if(!result.hidden)setTimeout(award,80)}).observe(result,{attributes:true,attributeFilter:['hidden']});
const watchMission=()=>{
 const el=document.getElementById('missionScore091');
 if(!el)return false;
 new MutationObserver(()=>{if(!result.hidden)setTimeout(award,20)}).observe(el,{childList:true,subtree:true,characterData:true});return true;
};
if(!watchMission()){const w=setInterval(()=>{if(watchMission())clearInterval(w)},100);setTimeout(()=>clearInterval(w),12000)}
window.addEventListener('storage',updateUI);
})();
