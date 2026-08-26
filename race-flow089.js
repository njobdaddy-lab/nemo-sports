(()=>{
'use strict';
const game=document.getElementById('game');
const stage=document.querySelector('.stage');
const progressText=document.getElementById('progressText');
const rankBadge=document.getElementById('rankBadge');
if(!game||!stage||!progressText||!rankBadge)return;

const flow=document.createElement('div');
flow.id='raceFlow089';
flow.className='raceFlow089';
flow.innerHTML='<div id="raceRank089" class="raceRank089"></div><div id="raceSplit089" class="raceSplit089"></div>';
stage.appendChild(flow);

const rankEl=document.getElementById('raceRank089');
const splitEl=document.getElementById('raceSplit089');
let lastRank=null;
let lastMeters=0;
let rankTimer=0;
let splitTimer=0;
let passed25=false,passed50=false,passed75=false;

function meters(){
 const n=parseFloat(progressText.textContent);
 return Number.isFinite(n)?n:0;
}
function rank(){
 const n=parseInt(rankBadge.textContent,10);
 return Number.isFinite(n)?n:null;
}
function reset(){
 lastRank=rank();lastMeters=0;passed25=passed50=passed75=false;
 rankEl.className='raceRank089';splitEl.className='raceSplit089';
}
function showRank(text,kind){
 rankEl.textContent=text;
 rankEl.className=`raceRank089 show ${kind}`;
 clearTimeout(rankTimer);
 rankTimer=setTimeout(()=>rankEl.className='raceRank089',760);
 if(navigator.vibrate)navigator.vibrate(kind==='up'?10:6);
}
function showSplit(text){
 splitEl.textContent=text;
 splitEl.className='raceSplit089 show';
 clearTimeout(splitTimer);
 splitTimer=setTimeout(()=>splitEl.className='raceSplit089',820);
}
function poll(){
 const visible=!game.hidden;
 const m=meters();
 const r=rank();
 if(!visible){requestAnimationFrame(poll);return;}
 if(m<0.5&&lastMeters>2)reset();
 if(lastRank===null)lastRank=r;

 if(m>3&&r!==null&&lastRank!==null&&r!==lastRank){
  if(r<lastRank){
   if(r===1)showRank('🏆 선두 탈환!','up');
   else showRank(`⬆ RANK UP · ${r}위`,'up');
  }else{
   showRank(`⬇ 추월당함 · ${r}위`,'down');
  }
  lastRank=r;
 }

 if(!passed25&&m>=25){passed25=true;showSplit('25m · 리듬 유지!');}
 if(!passed50&&m>=50){passed50=true;showSplit(`50m · 현재 ${r||'-'}위`);}
 if(!passed75&&m>=75){passed75=true;showSplit('75m · 막판 승부!');}

 lastMeters=m;
 requestAnimationFrame(poll);
}
reset();
requestAnimationFrame(poll);
})();