const characters = [
  {id:"sugar", name:"각설탕", cls:"sugar", quote:"달지만 승부는 쓰다"},
  {id:"brown", name:"흑설탕", cls:"brown", quote:"묵직하게 간다"},
  {id:"salt", name:"소금덩어리", cls:"salt", quote:"지는 건 짜다"},
  {id:"tofu", name:"두부", cls:"tofu", quote:"부서져도 달린다"},
  {id:"brick", name:"벽돌", cls:"brick", quote:"대화보다 돌진"},
  {id:"box", name:"택배상자", cls:"box", quote:"내용물은 비밀"},
  {id:"apartment", name:"아파트", cls:"apartment", quote:"관리비 걸고 뛴다"},
  {id:"gold", name:"금괴", cls:"gold", quote:"몸값부터 다름"},
  {id:"safe", name:"금고", cls:"safe", quote:"마음은 잠금"},
];

const state = {
  selected: "sugar",
  event: "sprint",
  players: [],
  running: false,
  timers: [],
  lastFoot: null,
  distance: 0,
  speed: 0,
  jumpMarker: 0,
  jumpDir: 1,
  jumpPhase: "charge",
  reactionReady: false,
  reactionGoAt: 0,
  sound: true
};

const $ = (q) => document.querySelector(q);
const $$ = (q) => [...document.querySelectorAll(q)];

const screens = {
  home: $("#homeScreen"),
  game: $("#gameScreen"),
  result: $("#resultScreen")
};

function showScreen(name){
  Object.values(screens).forEach(x=>x.classList.remove("active"));
  screens[name].classList.add("active");
}
function toast(msg){
  const t=$("#toast"); t.textContent=msg; t.classList.add("show");
  clearTimeout(t._h); t._h=setTimeout(()=>t.classList.remove("show"),1300);
}
function nemoHTML(c, face="•ᴗ•"){
  return `<div class="nemo ${c.cls}"><span class="face">${face}</span><i class="arm l"></i><i class="arm r"></i><i class="leg l"></i><i class="leg r"></i></div>`;
}
function renderCharacters(){
  const grid=$("#characterGrid");
  grid.innerHTML=characters.map(c=>`
    <button class="char-card ${state.selected===c.id?"selected":""}" data-char="${c.id}">
      <div class="mini-char">${nemoHTML(c)}</div>
      <strong>${c.name}</strong><small>${c.quote}</small>
    </button>`).join("");
  $$(".char-card").forEach(btn=>btn.onclick=()=>{
    state.selected=btn.dataset.char;
    renderCharacters();
    toast(`${characters.find(c=>c.id===state.selected).name} 선택!`);
  });
}
renderCharacters();

const eventMeta = {
  sprint:{title:"50m 광클 달리기", hint:"왼발 → 오른발 → 왼발 → 오른발! 번갈아 눌러야 빨라져."},
  reaction:{title:"반응속도", hint:"READY 중에 누르면 실격! 초록색 GO!가 뜨는 순간 눌러."},
  jump:{title:"멀리뛰기", hint:"RUN을 연타해 속도를 채운 뒤 JUMP 타이밍을 맞춰!"}
};

function clearTimers(){
  state.timers.forEach(t=>{clearTimeout(t);clearInterval(t)});
  state.timers=[];
}
function buildPlayers(){
  const mine = characters.find(c=>c.id===state.selected);
  const pool = characters.filter(c=>c.id!==mine.id).sort(()=>Math.random()-.5).slice(0,3);
  state.players=[
    {name:"나", char:mine, me:true, score:0},
    ...pool.map((c,i)=>({name:["민수","지현","철수"][i],char:c,me:false,score:0}))
  ];
}

function startEvent(type){
  clearTimers();
  state.event=type;
  buildPlayers();
  state.running=false;
  $("#gameTitle").textContent=eventMeta[type].title;
  $("#gameHint").textContent=eventMeta[type].hint;
  $("#roundLabel").textContent="네모 운동회 · 4인전";
  $("#timer").textContent="READY";
  showScreen("game");
  if(type==="sprint") setupSprint();
  if(type==="reaction") setupReaction();
  if(type==="jump") setupJump();
}
$$(".event-card").forEach(b=>b.onclick=()=>startEvent(b.dataset.event));
$("#randomBtn").onclick=()=>{
  const keys=Object.keys(eventMeta);
  startEvent(keys[Math.floor(Math.random()*keys.length)]);
};
$("#backBtn").onclick=()=>{clearTimers();showScreen("home")};

function setupSprint(){
  state.lastFoot=null; state.distance=0;
  $("#arena").innerHTML=`<div class="finish-line"></div>`+
    state.players.map((p,i)=>`
      <div class="lane" style="top:${38+i*15}%"></div>
      <div id="runner${i}" class="runner" style="top:${35+i*15}%">${nemoHTML(p.char,i===0?"•̀ᴗ•́":"•ᴗ•")}<span class="name-tag">${p.name} · ${p.char.name}</span></div>
    `).join("");
  $("#gameControls").innerHTML=`
    <div class="foot-controls">
      <button id="leftFoot" class="tap-btn">👈 왼발</button>
      <button id="rightFoot" class="tap-btn">오른발 👉</button>
    </div>`;
  $("#leftFoot").disabled=true; $("#rightFoot").disabled=true;
  let count=3;
  $("#timer").textContent=count;
  const cd=setInterval(()=>{
    count--;
    if(count>0) $("#timer").textContent=count;
    else{
      clearInterval(cd); state.running=true; $("#timer").textContent="GO!";
      $("#leftFoot").disabled=false; $("#rightFoot").disabled=false;
      state.players.forEach((p,i)=>$("#runner"+i).classList.add("running"));
      sprintBots();
      const end=setTimeout(()=>finishSprint(),8000); state.timers.push(end);
      let remain=8;
      const clock=setInterval(()=>{remain--; $("#timer").textContent=remain>0?remain+"s":"끝!"; if(remain<=0) clearInterval(clock)},1000);
      state.timers.push(clock);
    }
  },700); state.timers.push(cd);

  const hit=(foot)=>{
    if(!state.running)return;
    if(state.lastFoot===foot){state.distance=Math.max(0,state.distance-.7);toast("발 꼬임!");}
    else{state.distance+=2.25; state.lastFoot=foot;}
    state.distance=Math.min(100,state.distance);
    updateRunner(0,state.distance);
    if(state.distance>=100) finishSprint();
  };
  $("#leftFoot").onclick=()=>hit("L");
  $("#rightFoot").onclick=()=>hit("R");
}
function sprintBots(){
  state.players.slice(1).forEach((p,idx)=>{
    let d=0;
    const speed=1.25+Math.random()*.35;
    const loop=setInterval(()=>{
      if(!state.running){clearInterval(loop);return}
      d+=speed*(.75+Math.random()*.55);
      p.botDistance=d;
      updateRunner(idx+1,Math.min(100,d));
    },145+Math.random()*35);
    state.timers.push(loop);
  });
}
function updateRunner(i,d){
  const el=$("#runner"+i); if(el) el.style.left=(5+d*.78)+"%";
}
function finishSprint(){
  if(!state.running)return;
  state.running=false; clearTimers();
  state.players[0].score=state.distance;
  state.players.slice(1).forEach(p=>p.score=p.botDistance||0);
  state.players.forEach((p,i)=>{const r=$("#runner"+i); if(r)r.classList.remove("running")});
  setTimeout(()=>showResults("거리",v=>`${Math.min(50,v/2).toFixed(1)}m`,true),450);
}

function setupReaction(){
  $("#arena").innerHTML=`
    <div style="position:absolute;inset:0;display:grid;place-items:center;padding:20px">
      <div style="display:flex;gap:10px;align-items:flex-end">${state.players.map((p,i)=>`<div style="text-align:center">${nemoHTML(p.char,i===0?"•̀_•́":"•_•")}<small style="display:block;margin-top:8px">${p.name}</small></div>`).join("")}</div>
    </div>`;
  $("#gameControls").innerHTML=`<button id="reactionBtn" class="big-tap">READY…</button>`;
  const b=$("#reactionBtn");
  state.reactionReady=true; state.reactionGoAt=0;
  const wait=1400+Math.random()*2600;
  const go=setTimeout(()=>{
    state.reactionGoAt=performance.now();
    b.textContent="GO!"; b.classList.add("go");
    $("#timer").textContent="GO!";
    state.players.slice(1).forEach(p=>p.score=185+Math.random()*310);
  },wait); state.timers.push(go);
  b.onclick=()=>{
    if(!state.reactionReady)return;
    if(!state.reactionGoAt){
      state.reactionReady=false; clearTimers();
      state.players[0].score=9999;
      state.players.slice(1).forEach(p=>p.score=185+Math.random()*310);
      b.textContent="실격!";b.classList.add("false");
      $("#timer").textContent="FALSE";
      setTimeout(()=>showResults("반응시간",v=>v>9000?"실격":`${Math.round(v)}ms`,false),700);
    }else{
      state.reactionReady=false;
      state.players[0].score=performance.now()-state.reactionGoAt;
      b.textContent=`${Math.round(state.players[0].score)}ms`;
      setTimeout(()=>showResults("반응시간",v=>`${Math.round(v)}ms`,false),600);
    }
  }
}

function setupJump(){
  state.speed=0; state.jumpMarker=0; state.jumpDir=1; state.jumpPhase="charge";
  $("#arena").innerHTML=`
    <div style="position:absolute;left:50%;top:48%;transform:translate(-50%,-50%);text-align:center">
      <div id="jumper" style="display:inline-block;transform:scale(1.45)">${nemoHTML(state.players[0].char,"•̀ᴗ•́")}</div>
      <p style="margin-top:28px;color:#17202c;font-weight:900">속도를 최대한 끌어올려!</p>
    </div>`;
  $("#gameControls").innerHTML=`
    <div class="speed-bar"><div id="speedFill" class="speed-fill"></div></div>
    <button id="runBtn" class="big-tap" style="min-height:130px">RUN! RUN!</button>
    <div id="jumpUI" style="display:none">
      <div class="jump-zone"><div id="jumpMarker" class="jump-marker"></div></div>
      <button id="jumpBtn" class="tap-btn" style="width:100%;min-height:100px">JUMP!</button>
    </div>`;
  $("#timer").textContent="4s";
  state.running=true;
  $("#runBtn").onclick=()=>{
    if(state.jumpPhase!=="charge")return;
    state.speed=Math.min(100,state.speed+3.8);
    $("#speedFill").style.width=state.speed+"%";
  };
  let remain=4;
  const charge=setInterval(()=>{
    remain--;
    $("#timer").textContent=remain>0?remain+"s":"JUMP";
    if(remain<=0){
      clearInterval(charge);
      state.jumpPhase="aim";
      $("#runBtn").style.display="none"; $("#jumpUI").style.display="block";
      animateJumpMarker();
    }
  },1000); state.timers.push(charge);
  $("#jumpBtn").onclick=()=>finishJump();
}
function animateJumpMarker(){
  const loop=setInterval(()=>{
    if(state.jumpPhase!=="aim"){clearInterval(loop);return}
    state.jumpMarker+=state.jumpDir*3.2;
    if(state.jumpMarker>=100){state.jumpMarker=100;state.jumpDir=-1}
    if(state.jumpMarker<=0){state.jumpMarker=0;state.jumpDir=1}
    $("#jumpMarker").style.left=`calc(${state.jumpMarker}% - 4px)`;
  },28); state.timers.push(loop);
}
function finishJump(){
  if(state.jumpPhase!=="aim")return;
  state.jumpPhase="done"; clearTimers();
  const timing=Math.max(0,100-Math.abs(50-state.jumpMarker)*2);
  const mine=2.5 + (state.speed/100)*4.3 + (timing/100)*2.1;
  state.players[0].score=mine;
  state.players.slice(1).forEach(p=>p.score=5.1+Math.random()*3.3);
  $("#jumper").style.transform=`translate(${80+timing}px,-${40+timing/2}px) rotate(${20+timing/3}deg) scale(1.45)`;
  $("#gameHint").textContent=`속도 ${Math.round(state.speed)}% · 타이밍 ${Math.round(timing)}%`;
  setTimeout(()=>showResults("기록",v=>`${v.toFixed(2)}m`,true),700);
}

function showResults(label,format,higherBetter){
  clearTimers();
  const sorted=[...state.players].sort((a,b)=>higherBetter?b.score-a.score:a.score-b.score);
  $("#resultTitle").textContent=sorted[0].me?"🏆 네가 1등!":"😵 아쉽다! "+sorted[0].name+" 우승";
  const top=sorted.slice(0,3);
  const order=top.length>=3?[top[1],top[0],top[2]]:top;
  $("#podium").innerHTML=order.map((p,i)=>{
    const realRank=sorted.indexOf(p)+1;
    return `<div class="podium-slot">${nemoHTML(p.char,realRank===1?"⌐■ᴗ■":"•ᴗ•")}<strong style="display:block;margin:8px 0">${p.name}</strong><div class="podium-box">${realRank}위<br><small>${format(p.score)}</small></div></div>`;
  }).join("");
  $("#resultList").innerHTML=sorted.map((p,i)=>`
    <div class="result-row ${p.me?"me":""}">
      <span><strong>${i+1}위</strong> · ${p.name} <small style="color:var(--muted)">(${p.char.name})</small></span>
      <strong>${format(p.score)}</strong>
    </div>`).join("");
  const myRank=sorted.findIndex(p=>p.me)+1;
  $("#rewardText").textContent=`🪙 ${myRank===1?30:myRank===2?20:10}`;
  showScreen("result");
}
$("#retryBtn").onclick=()=>startEvent(state.event);
$("#homeBtn").onclick=()=>showScreen("home");
$("#soundBtn").onclick=()=>{
  state.sound=!state.sound;
  $("#soundBtn").textContent=state.sound?"🔊":"🔇";
};