const stateKey='nemo-home-v1';
const defaultState={coin:320,gem:12,level:1,xp:18,power:1240,skin:'cream',hat:'none'};
let state={...defaultState,...loadState()};

const $=s=>document.querySelector(s);
const coin=$('#coin'),gem=$('#gem'),level=$('#level'),xp=$('#xp'),xpNeed=$('#xpNeed'),xpFill=$('#xpFill'),power=$('#power');
const nemo=$('#nemo'),hat=$('#hat'),toast=$('#toast');
const playSheet=$('#playSheet'),dressSheet=$('#dressSheet');

function loadState(){
  try{return JSON.parse(localStorage.getItem(stateKey)||'{}');}catch{return {};}
}
function saveState(){localStorage.setItem(stateKey,JSON.stringify(state));}
function needXp(){return 100+(state.level-1)*45;}
function render(){
  coin.textContent=state.coin.toLocaleString();
  gem.textContent=state.gem.toLocaleString();
  level.textContent=state.level;
  xp.textContent=state.xp;
  xpNeed.textContent=needXp();
  xpFill.style.width=`${Math.min(100,state.xp/needXp()*100)}%`;
  power.textContent=state.power.toLocaleString();
  nemo.className=`nemo skin-${state.skin}`;
  hat.className=`hat hat-${state.hat}`;
  document.querySelectorAll('[data-skin]').forEach(b=>b.classList.toggle('active',b.dataset.skin===state.skin));
  document.querySelectorAll('[data-hat]').forEach(b=>b.classList.toggle('active',b.dataset.hat===state.hat));
}
function showToast(text){
  toast.textContent=text;toast.classList.add('show');clearTimeout(showToast.t);showToast.t=setTimeout(()=>toast.classList.remove('show'),1200);
}
function addXp(amount){
  state.xp+=amount;
  while(state.xp>=needXp()){
    state.xp-=needXp();state.level+=1;state.power+=180+state.level*22;showToast(`Lv.${state.level} 레벨업!`);
  }
}
function openSheet(el){el.classList.add('show');el.setAttribute('aria-hidden','false');}
function closeSheet(el){el.classList.remove('show');el.setAttribute('aria-hidden','true');}

$('#playBtn').addEventListener('click',()=>openSheet(playSheet));
$('#dressBtn').addEventListener('click',()=>openSheet(dressSheet));
document.querySelectorAll('[data-close="play"]').forEach(b=>b.addEventListener('click',()=>closeSheet(playSheet)));
document.querySelectorAll('[data-close="dress"]').forEach(b=>b.addEventListener('click',()=>closeSheet(dressSheet)));

document.querySelectorAll('[data-skin]').forEach(b=>b.addEventListener('click',()=>{
  state.skin=b.dataset.skin;saveState();render();showToast('몸 색을 바꿨어요');
}));
document.querySelectorAll('[data-hat]').forEach(b=>b.addEventListener('click',()=>{
  state.hat=b.dataset.hat;saveState();render();showToast(state.hat==='none'?'모자를 벗었어요':'모자를 바꿨어요');
}));

$('#growBtn').addEventListener('click',()=>{
  const cost=100;
  if(state.coin<cost){showToast('코인이 부족해요');return;}
  state.coin-=cost;state.power+=55;addXp(32);saveState();render();showToast('성장 완료! POWER +55');
});

$('#idleReward').addEventListener('click',()=>{
  state.coin+=85;addXp(14);saveState();render();showToast('방치 보상 +85 코인 · +14 EXP');
});

$('#collectionBtn').addEventListener('click',()=>showToast('보유 네모 화면은 다음 단계에서'));
document.querySelectorAll('.bottom-nav button:not(.active)').forEach(b=>b.addEventListener('click',()=>showToast('지금은 메인 구조만 테스트 중')));

document.querySelectorAll('.mode-card.locked').forEach(b=>b.addEventListener('click',()=>showToast('새 종목은 아직 만들지 않아요')));

render();