(()=>{
'use strict';
const startBtn=document.querySelector('#startBtn');
if(startBtn){startBtn.disabled=true;startBtn.textContent='⏳ 100m 준비 중...';}
function loadScript(src){return new Promise((resolve,reject)=>{const s=document.createElement('script');s.src=src;s.onload=resolve;s.onerror=()=>reject(new Error('script load failed: '+src));document.body.appendChild(s);});}
function replaceBlock(src,name,nextName,code){
 const start=src.indexOf('function '+name+'(');
 const end=src.indexOf('function '+nextName+'(',start+1);
 if(start<0||end<0){console.warn('[NEMO 102] optional block missing:',name);return src;}
 return src.slice(0,start)+code+'\n'+src.slice(end);
}
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
   ["const x=wx(50)","const x=wx(LEN)"],
   ["ctx.fillText(`${r.reactFace} ${r.reactText}`,-0,-94);","ctx.fillText(r.reactText,-0,-94);"]
  ];
  for(const [from,to] of patches){if(!src.includes(from))throw new Error('102 patch target missing: '+from.slice(0,48));src=src.replace(from,to);}

  const quotePatches=[
   ["quote:'통통 뛰는 기본 마스코트'","quote:'통통 튀는 리듬 마스코트'"],
   ["quote:'진하게, 끝까지 간다'","quote:'낮고 빠르게 타닥타닥'"],
   ["quote:'대화보다 돌진'","quote:'쿵쿵 찍고 가는 직진형'"],
   ["quote:'무뚝뚝한 허당'","quote:'덜컹거리지만 끈질기다'"],
   ["quote:'덩치는 커도 순둥이'","quote:'뒤뚱뒤뚱 큰 보폭의 거인'"]
  ];
  for(const [from,to] of quotePatches){if(src.includes(from))src=src.replace(from,to);}

  src=replaceBlock(src,'reactionProfile','react',`function reactionProfile(c,type){
 const set={
  sugar:{overtake:{face:'😏',text:'간다~! 통통!'},passed:{face:'😳',text:'어?! 잠깐!'},lead:{face:'😎',text:'1위다! 통통!'},stumble:{face:'😵',text:'발이 꼬였어! 데굴!'},perfect:{face:'🤩',text:'리듬 좋다! 통!'},finish:{face:'😆',text:'도착! 통통!'}},
  brown:{overtake:{face:'😏',text:'간다~! 타닥!'},passed:{face:'😳',text:'어?! 따라붙네.'},lead:{face:'😎',text:'1위다. 그대로.'},stumble:{face:'😵',text:'발이 꼬였어! 미끄덩!'},perfect:{face:'🤩',text:'리듬 좋다. 타닥!'},finish:{face:'😆',text:'도착! 조용히 끝.'}},
  brick:{overtake:{face:'😏',text:'간다~! 쿵.'},passed:{face:'😳',text:'어?! 뭐지?'},lead:{face:'😎',text:'1위다. 직진.'},stumble:{face:'😵',text:'발이 꼬였어! 쿵!'},perfect:{face:'🤩',text:'리듬 좋다. 쿵.'},finish:{face:'😆',text:'도착! ...끝.'}},
  safe:{overtake:{face:'😏',text:'간다~! 덜컹!'},passed:{face:'😳',text:'어?! 잠깐!'},lead:{face:'😎',text:'1위다! 잠금 완료!'},stumble:{face:'😵',text:'발이 꼬였어! 덜컹!'},perfect:{face:'🤩',text:'리듬 좋다! 덜컹!'},finish:{face:'😆',text:'도착! 철컥!'}},
  apt:{overtake:{face:'😏',text:'간다~! 뒤뚱!'},passed:{face:'😳',text:'어?! 기다려!'},lead:{face:'😎',text:'1위다! 거대한 질주!'},stumble:{face:'😵',text:'발이 꼬였어! 휘청!'},perfect:{face:'🤩',text:'리듬 좋다! 뒤뚱!'},finish:{face:'😆',text:'도착! 건물도 달린다!'}}
 };
 return set[c.type]?.[type]||{face:'•ᴗ•',text:'가자!'};
}`);

  src=replaceBlock(src,'fall','pimg',`function fall(r,now){
 const end=r===S.runners[0]?S.stumbleUntil:r.stumble,dur=Math.max(1,end-r.hurtStart),t=Math.max(0,Math.min(1,(now-r.hurtStart)/dur));
 const c=r.char?.type||'sugar';
 const peak={sugar:1.55,brown:.92,brick:1.18,safe:1.42,apt:.84}[c]||1.08;
 const hit={sugar:.30,brown:.24,brick:.18,safe:.25,apt:.36}[c]||.34;
 const hold={sugar:.66,brown:.58,brick:.74,safe:.68,apt:.72}[c]||.67;
 if(t<hit)return peak*(1-Math.pow(1-t/hit,3));
 if(t<hold)return peak;
 return peak*Math.pow(1-(t-hold)/(1-hold),3);
}`);

  src=replaceBlock(src,'motionStyle','drawMotionCue',`function motionStyle(r,running,hurt){
 if(!running||hurt)return{x:0,y:0,rot:0,stride:1,squash:0};
 const p=r.phase,c=r.char.type;
 if(c==='sugar')return{x:Math.sin(p*.52)*.55,y:-Math.abs(Math.sin(p))*1.4,rot:Math.sin(p*.52)*.018,stride:1.00,squash:Math.max(0,Math.cos(p*2))*.010};
 if(c==='brown')return{x:Math.sin(p*1.05)*1.1,y:-Math.abs(Math.sin(p*1.36))*3.4,rot:Math.sin(p*1.18)*.024,stride:1.20,squash:Math.max(0,Math.cos(p*2.72))*.024};
 if(c==='brick')return{x:Math.sin(p*.72)*.25,y:-Math.abs(Math.sin(p*.72))*1.35,rot:Math.sin(p*.72)*.018,stride:.52,squash:Math.max(0,Math.cos(p*1.44))*.052};
 if(c==='safe')return{x:Math.sin(p*.70)*3.4,y:-Math.abs(Math.sin(p*.68))*2.0,rot:Math.sin(p*.70)*.105,stride:.62,squash:.012};
 if(c==='apt')return{x:Math.sin(p*.48)*5.8,y:-Math.abs(Math.sin(p*.55))*1.5,rot:Math.sin(p*.48)*.138,stride:.46,squash:.008};
 return{x:0,y:-Math.abs(Math.sin(p))*4,rot:0,stride:1,squash:0};
}`);

  src=replaceBlock(src,'drawMotionCue','draw',`function drawMotionCue(r,m,now){
 if(!['run','coast'].includes(S.phase)||r.finish||r.stumble>now)return;
 const c=r.char.type,p=r.phase,hit=now-(r.kick||0)<115;
 ctx.save();
 if(c==='sugar'){
  if(hit){ctx.globalAlpha=.45;ctx.strokeStyle='#fff6d8';ctx.lineWidth=3;ctx.beginPath();ctx.ellipse(-4,38,31,7,0,0,Math.PI*2);ctx.stroke();}
 }else if(c==='brown'){
  ctx.globalAlpha=.20;ctx.strokeStyle='#ffe0c7';ctx.lineWidth=3;for(let i=0;i<3;i++){ctx.beginPath();ctx.moveTo(-48-i*12,-8+i*11);ctx.lineTo(-22-i*6,-8+i*11);ctx.stroke();}
  if(hit){ctx.globalAlpha=.32;ctx.fillStyle='#fff1df';ctx.font='900 13px system-ui';ctx.textAlign='center';ctx.fillText('타닥!',-6,48);}
 }else if(c==='brick'){
  if(Math.abs(Math.cos(p*.72))>.93||hit){ctx.globalAlpha=.34;ctx.strokeStyle='#ffd0b8';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(-28,39);ctx.lineTo(-10,33);ctx.lineTo(0,40);ctx.lineTo(12,32);ctx.lineTo(29,39);ctx.stroke();ctx.fillStyle='#fff0df';ctx.font='900 14px system-ui';ctx.textAlign='center';ctx.fillText('쿵!',0,55);}
 }else if(c==='safe'){
  ctx.globalAlpha=.26;ctx.strokeStyle='#e4f0ff';ctx.lineWidth=2.5;for(const q of [-1,1]){ctx.beginPath();ctx.arc(q*34,2,10,Math.PI*.55,Math.PI*1.45);ctx.stroke();}if(hit){ctx.fillStyle='#fff';ctx.font='900 13px system-ui';ctx.textAlign='center';ctx.fillText('덜컹!',0,52);}
 }else if(c==='apt'){
  ctx.globalAlpha=.23;ctx.strokeStyle='#fff5d5';ctx.lineWidth=2.5;ctx.beginPath();ctx.moveTo(-40,-40);ctx.lineTo(-48,-14);ctx.moveTo(40,-40);ctx.lineTo(48,-14);ctx.stroke();if(hit){ctx.fillStyle='#fff';ctx.font='900 13px system-ui';ctx.textAlign='center';ctx.fillText('뒤뚱!',0,60);}
 }
 ctx.restore();
}`);

  src=replaceBlock(src,'sugar','simple',`function sugar(r,now,me,running,hurt,m){
 const bodyS=me?.38:.33,bw=220*bodyS,bh=220*bodyS,p=r.phase;
 const rigW=me?92:80,rigH=me?82:72;
 const stride=running&&!hurt?Math.sin(p)*(m?.stride||1):0;
 const leftLift=running&&!hurt?Math.max(0,Math.sin(p))*5.5:0;
 const rightLift=running&&!hurt?Math.max(0,-Math.sin(p))*5.5:0;
 const ang=hurt?fall(r,now):0;
 const hit=Math.max(0,1-(now-(r.kick||0))/120);
 ctx.save();ctx.rotate(ang);
 ctx.fillStyle='rgba(0,0,0,.20)';ctx.beginPath();ctx.ellipse(-2,rigH*.72,rigW*.34,6,0,0,Math.PI*2);ctx.fill();
 const hipX=rigW*.20,hipY=bh*.32,footY=rigH*.63;
 const shoulderX=bw*.50,shoulderY=-bh*.02;
 const legTravel=stride*9;
 ctx.strokeStyle='#161719';ctx.fillStyle='#161719';ctx.lineWidth=me?3.6:3.2;ctx.lineCap='round';ctx.lineJoin='round';
 const legs=[[-hipX,-1,leftLift],[hipX,1,rightLift]];
 for(const [hx,sgn,lift] of legs){
  const fx=hx+sgn*legTravel,fy=footY-lift;
  ctx.beginPath();ctx.moveTo(hx,hipY);ctx.lineTo(fx,fy-1);ctx.stroke();
  ctx.beginPath();ctx.ellipse(fx+sgn*1.8,fy+1,me?6.3:5.5,me?4.3:3.8,sgn*stride*.08,0,Math.PI*2);ctx.fill();
 }
 for(const sgn of [-1,1]){
  const ax=sgn*shoulderX;
  const handX=sgn*(bw*.50+6)-sgn*stride*6;
  const handY=shoulderY+12-sgn*stride*4;
  ctx.beginPath();ctx.moveTo(ax,shoulderY);ctx.lineTo(handX,handY);ctx.stroke();
  ctx.beginPath();ctx.arc(handX,handY,me?4.9:4.3,0,Math.PI*2);ctx.fill();
 }
 ctx.save();ctx.scale(1+hit*.026,1-hit*.034);pimg(A.body,0,0,bodyS);ctx.restore();
 if(hurt){
  ctx.strokeStyle='#20191a';ctx.lineWidth=3.5;for(const q of [-1,1]){const ex=q*bw*.15,ey=-bh*.05;ctx.beginPath();ctx.moveTo(ex-4,ey-4);ctx.lineTo(ex+4,ey+4);ctx.moveTo(ex+4,ey-4);ctx.lineTo(ex-4,ey+4);ctx.stroke()}
  ctx.fillStyle='#b6282d';ctx.beginPath();ctx.ellipse(0,bh*.14,7,5,0,0,Math.PI*2);ctx.fill();
 }else{
  pimg(A.eyes,0,-bh*.05,bodyS*.54);pimg(A.mouth,0,bh*.12,bodyS*.48);
  ctx.fillStyle='#ff7d88aa';ctx.beginPath();ctx.ellipse(-bw*.27,bh*.08,4,2.7,0,0,Math.PI*2);ctx.ellipse(bw*.27,bh*.08,4,2.7,0,0,Math.PI*2);ctx.fill();
  emotionMarks(r,now,bw,bh);
 }
 ctx.restore();
}`);

  src=replaceBlock(src,'simple','emotionMarks',`function simple(r,now,me,running,hurt,m){
 const c=r.char,s=me?1.06:.92;
 let w=64*s,h=60*s,rad=14;
 if(c.type==='brown'){w=64*s;h=56*s;rad=15;}
 else if(c.type==='brick'){w=82*s;h=52*s;rad=7;}
 else if(c.type==='safe'){w=72*s;h=70*s;rad=11;}
 else if(c.type==='apt'){w=58*s;h=100*s;rad=9;}
 const stride=running&&!hurt?Math.sin(r.phase)*(m?.stride||1):0;
 const baseAng=c.type==='brown'?Math.min(.13,r.vel/66):c.type==='brick'?Math.min(.035,r.vel/210):0;
 const ang=hurt?fall(r,now):baseAng;
 ctx.save();ctx.rotate(ang);
 ctx.fillStyle='rgba(0,0,0,.21)';ctx.beginPath();ctx.ellipse(0,h*.54,w*.5,6,0,0,Math.PI*2);ctx.fill();
 ctx.strokeStyle=c.type==='safe'?'#8d96a1':c.type==='brown'?'#683820':c.type==='brick'?'#973b2e':'#d5c6af';
 ctx.lineWidth=c.type==='brick'?10:c.type==='apt'?8:9;ctx.lineCap='round';
 const legY=c.type==='apt'?h*.40:h*.34,footY=h*.54,armY=c.type==='apt'?-h*.08:0;
 for(const [sx,sgn] of [[-1,-1],[1,1]]){
  ctx.beginPath();ctx.moveTo(sx*w*.22,legY);ctx.lineTo(sx*w*.22+sgn*stride*(c.type==='brown'?10:7),footY);ctx.stroke();
  ctx.beginPath();ctx.moveTo(sx*w*.49,armY);ctx.lineTo(sx*w*.49-sgn*stride*(c.type==='apt'?6:8),armY+10);ctx.stroke();
 }
 ctx.fillStyle=c.c;rr(-w/2,-h/2,w,h,rad);ctx.fill();
 if(c.type==='brick'){ctx.strokeStyle='#7f2f26';ctx.lineWidth=2;rr(-w/2+3,-h/2+3,w-6,h-6,5);ctx.stroke();}
 if(c.type==='safe'){ctx.strokeStyle='#c3ccd7';ctx.lineWidth=2;rr(-w/2+4,-h/2+4,w-8,h-8,8);ctx.stroke();}
 detail(c,w,h);face(hurt,w,h);if(!hurt)emotionMarks(r,now,w,h);ctx.restore();
}`);

  (0,eval)(src);
  await loadScript('./input078.js?v=078');
  await loadScript('./challenge079.js?v=079');
  await loadScript('./final-sprint100.js?v=100');
  if(startBtn){startBtn.disabled=false;startBtn.textContent='🏁 100m 경기 시작';}
 }catch(err){
  console.error('[NEMO 102]',err);
  if(startBtn){startBtn.disabled=false;startBtn.textContent='⚠️ 다시 불러오기';startBtn.onclick=()=>location.reload();}
 }
})();
})();