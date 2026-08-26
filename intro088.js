(()=>{
'use strict';
const startBtn=document.getElementById('startBtn');
if(!startBtn)return;

const profiles={
  sugar:{name:'각설탕',face:'•ᴗ•',quote:'가볍게 튀고, 끝까지 간다!',fx:'통! 통!',motion:'sugar',bg:'#f7efe2',fg:'#44362c',accent:'#ffd84d'},
  brown:{name:'흑설탕',face:'•̀ᴗ•́',quote:'조용히 간다. 묵직하게 간다.',fx:'꾹… 툭!',motion:'brown',bg:'#8a4f2c',fg:'#fff3e8',accent:'#ffb36b'},
  brick:{name:'벽돌',face:'ㅡ_ㅡ',quote:'흔들림 없이 직진.',fx:'쿵! 쿵!',motion:'brick',bg:'#cb563b',fg:'#fff7ef',accent:'#ff8d75'},
  safe:{name:'금고',face:'•_•',quote:'한번 붙으면 못 막는다.',fx:'덜컹!',motion:'safe',bg:'#717a86',fg:'#f5fbff',accent:'#9fd7ff'},
  apt:{name:'아파트',face:'•ω•',quote:'덩치는 커도 질주는 진심!',fx:'뒤뚱! 뒤뚱!',motion:'apt',bg:'#e7d5b8',fg:'#4f4234',accent:'#ffd28f'}
};
let busy=false;

function selectedProfile(){
  const card=document.querySelector('#chars .charCard.sel');
  const key=card?.dataset.c||'sugar';
  return {key,...(profiles[key]||profiles.sugar)};
}

function ensureOverlay(){
  let el=document.getElementById('raceIntro088');
  if(el)return el;
  el=document.createElement('div');
  el.id='raceIntro088';
  el.className='raceIntro088';
  el.setAttribute('aria-hidden','true');
  el.innerHTML=`<div class="raceIntroBackdrop088"></div><div class="raceIntroCard088"><div class="raceIntroTop088"><span>PLAYER 1</span><b>100M ENTRY</b></div><div class="raceIntroBody088"><div class="raceIntroStage088"><div id="raceIntroChar088" class="raceIntroChar088"><span id="raceIntroFace088">•ᴗ•</span></div><em id="raceIntroFx088" class="raceIntroFx088">통! 통!</em></div><div class="raceIntroCopy088"><small>오늘의 선수</small><h2 id="raceIntroName088">각설탕</h2><p id="raceIntroQuote088">가볍게 튀고, 끝까지 간다!</p><strong class="raceIntroEntry088">🏁 100m 출전!</strong></div></div><div class="raceIntroSkip088">화면을 누르면 바로 시작</div><div class="raceIntroSweep088"></div></div>`;
  document.body.appendChild(el);
  return el;
}

function playIntro(done){
  const p=selectedProfile(),el=ensureOverlay();
  const char=document.getElementById('raceIntroChar088');
  const fx=document.getElementById('raceIntroFx088');
  document.getElementById('raceIntroFace088').textContent=p.face;
  document.getElementById('raceIntroName088').textContent=p.name;
  document.getElementById('raceIntroQuote088').textContent=p.quote;
  if(fx)fx.textContent=p.fx;
  if(char){
    char.className=`raceIntroChar088 motion-${p.motion}`;
    char.style.setProperty('--intro-bg',p.bg);
    char.style.setProperty('--intro-fg',p.fg);
    char.style.setProperty('--intro-accent',p.accent);
  }
  el.style.setProperty('--intro-accent',p.accent);
  el.classList.remove('ready','action','launch','leave');
  el.classList.add('show');
  el.setAttribute('aria-hidden','false');
  if(navigator.vibrate)navigator.vibrate(10);

  const timers=[];
  let finished=false;
  const finish=()=>{
    if(finished)return;
    finished=true;
    timers.forEach(clearTimeout);
    el.onclick=null;
    el.classList.add('leave');
    setTimeout(()=>{
      el.classList.remove('show','ready','action','launch','leave');
      el.setAttribute('aria-hidden','true');
      done();
    },260);
  };

  el.onclick=finish;
  timers.push(setTimeout(()=>el.classList.add('ready'),260));
  timers.push(setTimeout(()=>{el.classList.add('action');if(navigator.vibrate&&p.key==='brick')navigator.vibrate([12,70,12])},560));
  timers.push(setTimeout(()=>el.classList.add('launch'),1420));
  timers.push(setTimeout(finish,2200));
}

function tryWrap(){
  if(startBtn.dataset.intro088==='1')return true;
  if(startBtn.disabled||typeof startBtn.onclick!=='function')return false;
  const baseStart=startBtn.onclick;
  startBtn.onclick=function(e){
    if(busy)return;
    busy=true;
    playIntro(()=>{
      busy=false;
      baseStart.call(startBtn,e);
    });
  };
  startBtn.dataset.intro088='1';
  return true;
}

if(!tryWrap()){
  const timer=setInterval(()=>{if(tryWrap())clearInterval(timer)},80);
  setTimeout(()=>clearInterval(timer),12000);
}
})();