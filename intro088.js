(()=>{
'use strict';
const startBtn=document.getElementById('startBtn');
if(!startBtn)return;

const profiles={
  sugar:{name:'각설탕',face:'•ᴗ•',quote:'통통 튀어도 리듬은 정확하게!',bg:'#f7efe2',fg:'#44362c',accent:'#ffd84d'},
  brown:{name:'흑설탕',face:'•̀ᴗ•́',quote:'조용히 간다. 끝까지 간다.',bg:'#8a4f2c',fg:'#fff3e8',accent:'#ffb36b'},
  brick:{name:'벽돌',face:'ㅡ_ㅡ',quote:'말보다 빠르게. 그냥 직진.',bg:'#cb563b',fg:'#fff7ef',accent:'#ff8d75'},
  safe:{name:'금고',face:'•_•',quote:'무거워 보여도 승부는 가볍게.',bg:'#717a86',fg:'#f5fbff',accent:'#9fd7ff'},
  apt:{name:'아파트',face:'•ω•',quote:'덩치는 커도 100m는 진심이다.',bg:'#e7d5b8',fg:'#4f4234',accent:'#ffd28f'}
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
  el.innerHTML=`<div class="raceIntroBackdrop088"></div><div class="raceIntroCard088"><div class="raceIntroTop088"><span>PLAYER 1</span><b>100M ENTRY</b></div><div class="raceIntroBody088"><div id="raceIntroChar088" class="raceIntroChar088"><span id="raceIntroFace088">•ᴗ•</span></div><div class="raceIntroCopy088"><small>오늘의 선수</small><h2 id="raceIntroName088">각설탕</h2><p id="raceIntroQuote088">통통 튀어도 리듬은 정확하게!</p><strong>🏁 100m 출전!</strong></div></div><div class="raceIntroSweep088"></div></div>`;
  document.body.appendChild(el);
  return el;
}

function playIntro(done){
  const p=selectedProfile(),el=ensureOverlay();
  const char=document.getElementById('raceIntroChar088');
  document.getElementById('raceIntroFace088').textContent=p.face;
  document.getElementById('raceIntroName088').textContent=p.name;
  document.getElementById('raceIntroQuote088').textContent=p.quote;
  if(char){char.style.setProperty('--intro-bg',p.bg);char.style.setProperty('--intro-fg',p.fg);char.style.setProperty('--intro-accent',p.accent)}
  el.style.setProperty('--intro-accent',p.accent);
  el.classList.remove('leave');
  el.classList.add('show');
  el.setAttribute('aria-hidden','false');
  if(navigator.vibrate)navigator.vibrate(10);
  setTimeout(()=>el.classList.add('ready'),360);
  setTimeout(()=>{
    el.classList.add('leave');
    setTimeout(()=>{
      el.classList.remove('show','ready','leave');
      el.setAttribute('aria-hidden','true');
      done();
    },230);
  },1050);
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