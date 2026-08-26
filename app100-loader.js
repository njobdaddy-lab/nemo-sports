(()=>{
'use strict';
const startBtn=document.querySelector('#startBtn');
if(startBtn){startBtn.disabled=true;startBtn.textContent='⏳ 100m 준비 중...';}
function loadScript(src){return new Promise((resolve,reject)=>{const s=document.createElement('script');s.src=src;s.onload=resolve;s.onerror=()=>reject(new Error('script load failed: '+src));document.body.appendChild(s);});}
(async()=>{
 try{
  const res=await fetch('./app083.js?v=083',{cache:'no-store'});
  if(!res.ok)throw new Error('base game fetch failed');
  let src=await res.text();
  const patches=[
   ["const W=1280,H=720,LEN=50;","const W=1280,H=720,LEN=100;"],
   ["r.dist>6&&r.dist<43","r.dist>6&&r.dist<93"],
   ["const m=Math.min(50,me?.dist||0);$('#progressBar').style.width=(m*2)+'%';$('#progressText').textContent=m.toFixed(1)+'m / 50m';","const m=Math.min(LEN,me?.dist||0);$('#progressBar').style.width=(m/LEN*100)+'%';$('#progressText').textContent=m.toFixed(1)+'m / '+LEN+'m';"],
   ["return Math.min(1470,raw)","return Math.min((LEN-8)*35,raw)"],
   ["ctx.fillText('NEMO SPORTS · 50M',W/2,233)","ctx.fillText('NEMO SPORTS · 100M',W/2,233)"],
   ["for(let m=0;m<=50;m+=5)","for(let m=0;m<=LEN;m+=10)"],
   ["const x=wx(50)","const x=wx(LEN)"]
  ];
  for(const [from,to] of patches){if(!src.includes(from))throw new Error('100m patch target missing: '+from.slice(0,48));src=src.replace(from,to);}
  (0,eval)(src);
  await loadScript('./input078.js?v=078');
  await loadScript('./challenge079.js?v=079');
  await loadScript('./final-sprint100.js?v=100');
  if(startBtn){startBtn.disabled=false;startBtn.textContent='🏁 100m 경기 시작';}
 }catch(err){
  console.error('[NEMO 100M]',err);
  if(startBtn){startBtn.disabled=false;startBtn.textContent='⚠️ 다시 불러오기';startBtn.onclick=()=>location.reload();}
 }
})();
})();