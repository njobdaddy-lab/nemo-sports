(()=>{
'use strict';
const game=document.querySelector('#game'),stage=document.querySelector('.stage'),progressText=document.querySelector('#progressText'),rankBadge=document.querySelector('#rankBadge'),judge=document.querySelector('#timingJudge');
if(!game||!stage||!progressText||!rankBadge)return;
const banner=document.createElement('div');banner.className='finalSprintBanner';banner.innerHTML='<strong>🔥 FINAL SPRINT</strong><span>마지막 30m</span><em id="finalRemain">30.0m</em>';stage.appendChild(banner);
const callout=document.createElement('div');callout.className='raceCallout';stage.appendChild(callout);
let active=false,lastRank=null,lastMeters=0,lastCallout=0,bannerTimer=0,flashTimer=0,tenMeterCalled=false;
function meters(){const m=parseFloat(progressText.textContent);return Number.isFinite(m)?m:0}
function rank(){const n=parseInt(rankBadge.textContent,10);return Number.isFinite(n)?n:null}
function showCallout(text,ms=720){const now=performance.now();if(now-lastCallout<360)return;lastCallout=now;callout.textContent=text;callout.classList.add('show');clearTimeout(callout._t);callout._t=setTimeout(()=>callout.classList.remove('show'),ms)}
function showBanner(ms=1250){banner.classList.add('show');clearTimeout(bannerTimer);bannerTimer=setTimeout(()=>banner.classList.remove('show'),ms)}
function enterFinal(m){active=true;tenMeterCalled=false;game.classList.add('finalSprintMode');showBanner(1450);showCallout('🔥 남은 30m! 이제 진짜 승부!',950);if(navigator.vibrate)navigator.vibrate(18);lastRank=rank();lastMeters=m;updateRemain(m)}
function leaveFinal(){active=false;tenMeterCalled=false;game.classList.remove('finalSprintMode');banner.classList.remove('show');callout.classList.remove('show');lastRank=null;lastMeters=0}
function updateRemain(m){const el=document.querySelector('#finalRemain');if(el)el.textContent=Math.max(0,100-m).toFixed(1)+'m'}
function poll(){
 const m=meters(),r=rank(),visible=!game.hidden;
 if(visible&&m>=70&&m<100){
  if(!active)enterFinal(m);updateRemain(m);
  if(!tenMeterCalled&&m>=90){tenMeterCalled=true;showBanner(1000);showCallout('🔥 10m 남았다! 끝까지!',800);if(navigator.vibrate)navigator.vibrate(12)}
  if(lastRank!==null&&r!==null&&r!==lastRank){if(r<lastRank)showCallout(r===1?'🏆 역전! 선두!':'🔥 역전! '+r+'위');else showCallout('😱 따라잡혔다! '+r+'위');lastRank=r}else if(lastRank===null)lastRank=r;
  if(m-lastMeters>4.2&&r!==null){if(r===1&&m>85)showCallout('😤 선두 지켜!');else if(r>1&&m>85)showCallout('💨 잡아! '+r+'위');lastMeters=m}
 }else if(active&&(m<1||m>=100||!visible))leaveFinal();
 requestAnimationFrame(poll)
}
function flash(kind){if(!active)return;stage.classList.remove('finalPerfect','finalDanger');void stage.offsetWidth;stage.classList.add(kind);clearTimeout(flashTimer);flashTimer=setTimeout(()=>stage.classList.remove(kind),220)}
if(judge){new MutationObserver(()=>{const t=judge.textContent||'';if(!active)return;if(/PERFECT/.test(t)){flash('finalPerfect');if(navigator.vibrate)navigator.vibrate(8)}else if(/MISS|TOO FAST|LATE/.test(t)){flash('finalDanger')}}).observe(judge,{childList:true,subtree:true,characterData:true})}
requestAnimationFrame(poll);
})();