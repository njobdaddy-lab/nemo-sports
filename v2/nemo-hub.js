const NEMOS = [
  {
    id:'sugar',
    name:'각설탕 네모',
    tag:'가볍고 빠른 밸런스형',
    desc:'레이싱과 달리기 둘 다 무난하게 써볼 수 있는 첫 테스트 네모.',
    color:'#efe2c3',
    race:3,
    run:2
  },
  {
    id:'brick',
    name:'벽돌 네모',
    tag:'묵직한 힘·충돌형',
    desc:'레이싱에서는 몸싸움에 강하지만, 달리기에서는 가속이 조금 답답한 타입.',
    color:'#b85f4f',
    race:3,
    run:1
  },
  {
    id:'eraser',
    name:'지우개 네모',
    tag:'민첩한 리듬·코너형',
    desc:'달리기와 민첩한 조작에 강하고, 레이싱에서도 코너링 쪽이 좋은 타입.',
    color:'#82b9d6',
    race:2,
    run:3
  }
];

const KEY='nemoMetaV1';
const defaultState={
  selected:'sugar',
  coin:0,
  growth:{
    sugar:{level:1,xp:0},
    brick:{level:1,xp:0},
    eraser:{level:1,xp:0}
  }
};

function loadState(){
  try{
    const raw=localStorage.getItem(KEY);
    if(!raw)return structuredClone(defaultState);
    const parsed=JSON.parse(raw);
    return {
      selected:parsed.selected||'sugar',
      coin:Number(parsed.coin)||0,
      growth:{
        sugar:{...defaultState.growth.sugar,...parsed.growth?.sugar},
        brick:{...defaultState.growth.brick,...parsed.growth?.brick},
        eraser:{...defaultState.growth.eraser,...parsed.growth?.eraser}
      }
    };
  }catch{
    return structuredClone(defaultState);
  }
}

let state=loadState();

const list=document.querySelector('#nemoList');
const coinEl=document.querySelector('#coin');
const selectedIcon=document.querySelector('#selectedIcon');
const selectedName=document.querySelector('#selectedName');
const selectedDesc=document.querySelector('#selectedDesc');
const levelEl=document.querySelector('#level');
const xpEl=document.querySelector('#xp');
const xpNeedEl=document.querySelector('#xpNeed');
const xpFill=document.querySelector('#xpFill');
const raceFit=document.querySelector('#raceFit');
const runFit=document.querySelector('#runFit');
const toast=document.querySelector('#toast');

function save(){localStorage.setItem(KEY,JSON.stringify(state));}
function stars(n){return '★'.repeat(n)+'☆'.repeat(3-n);}
function fitText(n){return n===3?'주특기 · 효율 높음':n===2?'보통 · 충분히 가능':'가능 · 효율 낮음';}
function current(){return NEMOS.find(n=>n.id===state.selected)||NEMOS[0];}
function needXp(level){return 100+(level-1)*40;}
function cubeHtml(n){return `<div class="cube" style="background:${n.color}"></div>`;}

function renderList(){
  list.innerHTML=NEMOS.map(n=>`
    <button class="nemo-card ${n.id===state.selected?'selected':''}" type="button" data-id="${n.id}">
      <div class="nemo-visual">${cubeHtml(n)}</div>
      <div>
        <div class="nemo-name">${n.name}</div>
        <div class="nemo-tag">${n.tag}</div>
      </div>
      <div class="stars"><span>레이싱 <b>${stars(n.race)}</b></span><span>달리기 <b>${stars(n.run)}</b></span></div>
    </button>`).join('');

  list.querySelectorAll('.nemo-card').forEach(btn=>{
    btn.addEventListener('click',()=>{
      state.selected=btn.dataset.id;
      save();
      render();
      flash(`${current().name} 선택`);
    });
  });
}

function renderSelected(){
  const n=current();
  const g=state.growth[n.id];
  const need=needXp(g.level);
  coinEl.textContent=state.coin;
  selectedIcon.innerHTML=cubeHtml(n);
  selectedName.textContent=n.name;
  selectedDesc.textContent=n.desc;
  levelEl.textContent=g.level;
  xpEl.textContent=g.xp;
  xpNeedEl.textContent=need;
  xpFill.style.width=`${Math.min(100,g.xp/need*100)}%`;
  raceFit.textContent=`${fitText(n.race)} · ${stars(n.race)}`;
  runFit.textContent=`${fitText(n.run)} · ${stars(n.run)}`;
}

function render(){renderList();renderSelected();}

function flash(text){
  toast.textContent=text;
  clearTimeout(flash.t);
  flash.t=setTimeout(()=>toast.textContent='',1800);
}

function addReward(xp,coin,label){
  const n=current();
  const g=state.growth[n.id];
  g.xp+=xp;
  state.coin+=coin;
  let levelUps=0;
  while(g.xp>=needXp(g.level)){
    g.xp-=needXp(g.level);
    g.level+=1;
    levelUps+=1;
  }
  save();
  renderSelected();
  flash(`${label} · EXP +${xp} / COIN +${coin}${levelUps?` · Lv.${g.level}!`:''}`);
}

document.querySelector('#goRace').addEventListener('click',()=>{
  const id=current().id;
  save();
  location.href=`./race-lab.html?v=9&nemo=${encodeURIComponent(id)}&from=hub`;
});

document.querySelector('#goRun').addEventListener('click',()=>{
  const id=current().id;
  save();
  location.href=`../?v=110&nemo=${encodeURIComponent(id)}&from=hub`;
});

document.querySelectorAll('[data-reward]').forEach(btn=>{
  btn.addEventListener('click',()=>{
    if(btn.dataset.reward==='win')addReward(70,30,'1위 보상');
    else addReward(35,15,'완주 보상');
  });
});

document.querySelector('#resetMeta').addEventListener('click',()=>{
  state=structuredClone(defaultState);
  save();
  render();
  flash('성장 데이터 초기화');
});

render();
