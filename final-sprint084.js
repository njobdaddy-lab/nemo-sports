(()=>{
'use strict';
const game=document.querySelector('#game'),stage=document.querySelector('.stage'),progressText=document.querySelector('#progressText'),rankBadge=document.querySelector('#rankBadge'),judge=document.querySelector('#timingJudge');
if(!game||!stage||!progressText||!rankBadge)return;
const banner=document.createElement('div');banner.className='finalSprintBanner';banner.innerHTML='<strong>🔥 FINAL SPRINT</strong><span>마지막 10m</span><em id="finalRemain">10.0m</em>';stage.appendChild(banner);
const callout=document.createElement('div');callout.className='raceCallout';stage.appendChild(callout);
let active=false,lastRank=null,lastMeters=0,lastCallout=0,bannerTimer=0,flashTimer=0;
function meters(){const m=parseFloat(progressText.textContent);return Number.isFinite(m)?m:0}
function rank(){const n=parseInt(rankBadge.textContent,10);return Number.isFinite(n)?n:null}
function showCallout(text,ms=720){const now=performance.now();if(now-lastCallout<360)return;lastCallout=now;callout.textContent=text;callout.classList.add('show');clearTimeout(callout._t);callout._t=setTimeout(()=>callout.classList.remove('show'),ms)}
function enterFinal(m){active=true;game.classList.add('finalSprintMode');banner.classList.add('show');clearTimeout(bannerTimer);bannerTimer=setTimeout(()=>banner.classList.remove('show'),1250);showCallout('🔥 마지막 10m! 리듬 유지!',850);if(navigator.vibrate)navigator.vibrate(18);lastRank=rank();updateRemain(m)}
function leaveFinal(){active=false;game.classList.remove('finalSprintMode');banner.classList.remove('show');callout.classList.remove('show');lastRank=null;lastMeters=0}
function updateRemain(m){const el=document.querySelector('#finalRemain');if(el)el.textContent=Math.max(0,50-m).toFixed(1)+'m'}
function poll(){
 const m=meters(),r=rank(),visible=!game.hidden;
 if(visible&&m>=40&&m<50){if(!active)enterFinal(m);updateRemain(m);if(lastRank!==null&&r!==null&&r!==lastRank){if(r<lastRank)showCallout(r===1?'🏆 역전! 선두!':'🔥 역전! '+r+'위');else showCallout('😱 따라잡혔다! '+r+'위');lastRank=r}else if(lastRank===null)lastRank=r;
  if(m-lastMeters>.85&&r!==null){if(r===1&&m>45)showCallout('😤 선두 지켜!');else if(r>1&&m>45)showCallout('💨 잡아! '+r+'위');lastMeters=m}
 }else if(active&&(m<1||m>=50||!visible))leaveFinal();
 requestAnimationFrame(poll)
}
function flash(kind){if(!active)return;stage.classList.remove('finalPerfect','finalDanger');void stage.offsetWidth;stage.classList.add(kind);clearTimeout(flashTimer);flashTimer=setTimeout(()=>stage.classList.remove(kind),220)}
if(judge){new MutationObserver(()=>{const t=judge.textContent||'';if(!active)return;if(/PERFECT/.test(t)){flash('finalPerfect');if(navigator.vibrate)navigator.vibrate(8)}else if(/MISS|TOO FAST|LATE/.test(t)){flash('finalDanger')}}).observe(judge,{childList:true,subtree:true,characterData:true})}
requestAnimationFrame(poll);
})();