(()=>{
'use strict';
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const canvas=$('#canvas'),ctx=canvas.getContext('2d');
const W=1280,H=720,LEN=50; canvas.width=W;canvas.height=H;

const chars=[
{id:'sugar',name:'각설탕',c:'#f7efe2',type:'sugar',quote:'통통 뛰는 기본 마스코트'},
{id:'brown',name:'흑설탕',c:'#8a4f2c',type:'brown',quote:'진하게, 끝까지 간다'},
{id:'brick',name:'벽돌',c:'#cb563b',type:'brick',quote:'대화보다 돌진'},
{id:'safe',name:'금고',c:'#717a86',type:'safe',quote:'무뚝뚝한 허당'},
{id:'apt',name:'아파트',c:'#e7d5b8',type:'apt',quote:'덩치는 커도 순둥이'}
];
const diffs={easy:{label:'느긋',base:7.0,var:.52},normal:{label:'보통',base:7.65,var:.40},hard:{label:'빡셈',base:8.18,var:.32},hell:{label:'악마',base:8.68,var:.24}};
const aiStumble={easy:{rate:.18,ms:900},normal:{rate:.10,ms:780},hard:{rate:.06,ms:680},hell:{rate:.025,ms:580}};
const S={char:'sugar',diff:'normal',sound:true,phase:'home',last:0,go:0,lastFoot:null,lastStepAt:0,firstStep:false,combo:0,speed:0,stumbleUntil:0,shake:0,flash:0,runners:[],dust:[],confetti:[],raf:0,finishPulse:0,prevRank:1,reactCooldown:0};

const svgBody=`<svg xmlns="http://www.w3.org/2000/svg" width="220" height="220" viewBox="0 0 220 220"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#fffef9"/><stop offset=".55" stop-color="#f5ead7"/><stop offset="1" stop-color="#d8c8b4"/></linearGradient><filter id="n" x="-10%" y="-10%" width="120%" height="120%"><feTurbulence type="fractalNoise" baseFrequency=".085" numOctaves="3" seed="7"/><feColorMatrix values="1 0 0 0 .9 0 1 0 0 .87 0 0 1 0 .78 0 0 0 .32 0"/><feBlend mode="multiply" in2="SourceGraphic"/></filter></defs><rect x="10" y="10" width="200" height="200" rx="34" fill="url(#g)" stroke="#fff" stroke-width="5"/><rect x="13" y="13" width="194" height="194" rx="31" fill="#fff" opacity=".22" filter="url(#n)"/><path d="M28 38 Q55 20 96 21" fill="none" stroke="#fff" stroke-width="9" stroke-linecap="round" opacity=".62"/></svg>`;
const svgArm=`<svg xmlns="http://www.w3.org/2000/svg" width="88" height="126" viewBox="0 0 88 126"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#fffdf8"/><stop offset="1" stop-color="#dccab6"/></linearGradient></defs><path d="M44 8 C22 24 18 48 28 67 C35 81 52 83 58 69 C62 59 56 51 50 47 C68 42 75 53 75 70 C75 92 60 112 38 116 C19 120 8 106 12 91 C16 74 27 64 37 59" fill="url(#g)" stroke="#fff" stroke-width="4" stroke-linejoin="round"/></svg>`;
const svgLeg=`<svg xmlns="http://www.w3.org/2000/svg" width="90" height="120" viewBox="0 0 90 120"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#fffdf7"/><stop offset="1" stop-color="#d9c6b1"/></linearGradient></defs><path d="M35 7 Q50 7 53 22 L55 65 Q72 66 79 80 Q86 96 72 107 Q60 115 35 113 Q14 112 10 99 Q6 85 17 76 Q25 69 31 68 L30 23 Q30 11 35 7Z" fill="url(#g)" stroke="#fff" stroke-width="4"/></svg>`;
const svgEyes=`<svg xmlns="http://www.w3.org/2000/svg" width="120" height="72" viewBox="0 0 120 72"><defs><radialGradient id="e" cx=".35" cy=".25"><stop stop-color="#7a4027"/><stop offset=".45" stop-color="#24130e"/><stop offset="1" stop-color="#080707"/></radialGradient></defs><path d="M19 12 Q31 2 43 10" fill="none" stroke="#2b211e" stroke-width="6" stroke-linecap="round"/><path d="M77 10 Q90 2 101 12" fill="none" stroke="#2b211e" stroke-width="6" stroke-linecap="round"/><ellipse cx="34" cy="40" rx="16" ry="22" fill="url(#e)"/><ellipse cx="86" cy="40" rx="16" ry="22" fill="url(#e)"/><circle cx="28" cy="31" r="5" fill="#fff"/><circle cx="80" cy="31" r="5" fill="#fff"/></svg>`;
const svgMouth=`<svg xmlns="http://www.w3.org/2000/svg" width="70" height="50" viewBox="0 0 70 50"><path d="M12 13 Q35 40 58 13 Q55 45 35 46 Q15 44 12 13Z" fill="#321516" stroke="#201014" stroke-width="3"/><ellipse cx="35" cy="36" rx="13" ry="7" fill="#ef6764"/></svg>`;
function img(svg){const i=new Image();i.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svg);return i}
const A={body:img(svgBody),arm:img(svgArm),leg:img(svgLeg),eyes:img(svgEyes),mouth:img(svgMouth)};

function ensureExtras(){
 if(!$('#timingJudge')){$('.stage').insertAdjacentHTML('beforeend','<div id="timingJudge" class="timingJudge"></div>')}
 if(!$('#portraitTip')){$('#game').insertAdjacentHTML('beforeend','<div id="portraitTip" class="portraitTip">세로는 표정·리액션을 가까이 · <b>가로로 돌리면 경기장을 더 넓고 시원하게!</b></div><div id="portraitReaction" class="portraitReaction"><span id="portraitFace">•ᴗ•</span><div><small>REACTION</small><b id="portraitReactText">출발 준비!</b></div></div>')}
}
ensureExtras();

function renderHome(){
 $('#difficulty').innerHTML=Object.entries(diffs).map(([k,d])=>`<button class="${S.diff===k?'sel':''}" data-d="${k}"><strong>${d.label}</strong><small>${k==='normal'?'첫 플레이 추천':'AI 속도 차이'}</small></button>`).join('');
 $$('#difficulty button').forEach(b=>b.onclick=()=>{S.diff=b.dataset.d;renderHome()});
 $('#chars').innerHTML=chars.map(c=>`<button class="charCard ${S.char===c.id?'sel':''}" data-c="${c.id}"><div class="charPreview">${c.id==='sugar'?'<span class="sugarHome">●ᴗ●</span>':`<i class="miniNemo" style="background:${c.c}"></i>`}</div><b>${c.name}</b><small>${c.quote}</small></button>`).join('');
 $$('#chars .charCard').forEach(b=>b.onclick=()=>{S.char=b.dataset.c;renderHome()});
}
renderHome();
$('#sound').onclick=()=>{S.sound=!S.sound;$('#sound').textContent=S.sound?'🔊':'🔇'};
$('#startBtn').onclick=start;$('#retry').onclick=start;$('#back').onclick=home;$('#homeBtn').onclick=home;
$('#left').onclick=()=>step('L');$('#right').onclick=()=>step('R');

function home(){stop();$('#result').hidden=true;$('#game').hidden=true;$('#home').hidden=false;document.body.classList.remove('race076');S.phase='home'}
function stop(){cancelAnimationFrame(S.raf);S.raf=0;clearTimeout(S._res);clearTimeout(S._tick)}
function msg(t,ms=560){const e=$('#msg');e.textContent=t;e.classList.add('show');clearTimeout(e._t);e._t=setTimeout(()=>e.classList.remove('show'),ms)}
function judge(t,kind='good'){const e=$('#timingJudge');e.textContent=t;e.className=`timingJudge show ${kind}`;clearTimeout(e._t);e._t=setTimeout(()=>e.className='timingJudge',420)}
function reactionProfile(c,type){
 const map={
  overtake:{face:'😏',text:c.type==='brick'?'...지나간다.':c.type==='safe'?'못 막아!':'간다~!'},
  passed:{face:'😳',text:c.type==='brick'?'뭐지?':c.type==='safe'?'어? 잠깐!':'어?!'},
  lead:{face:'😎',text:'1위다!'},
  stumble:{face:'😵',text:'발이 꼬였어!'},
  perfect:{face:'🤩',text:'리듬 좋다!'},
  finish:{face:'😆',text:'도착!'}
 };
 return map[type]||{face:'•ᴗ•',text:'가자!'};
}
function react(r,type,now=performance.now(),force=false){
 if(!r)return;if(!force&&r.reactUntil&&r.reactUntil>now+250)return;
 const p=reactionProfile(r.char,type);r.reactType=type;r.reactFace=p.face;r.reactText=p.text;r.reactUntil=now+900;
 if(r===S.runners[0]){
  const face=$('#portraitFace'),text=$('#portraitReactText'),panel=$('#portraitReaction');
  if(face)face.textContent=p.face;if(text)text.textContent=p.text;if(panel){panel.classList.add('active');clearTimeout(panel._t);panel._t=setTimeout(()=>panel.classList.remove('active'),950)}
 }
}
function start(){
 stop();$('#result').hidden=true;$('#home').hidden=true;$('#game').hidden=false;document.body.classList.add('race076');
 S.phase='count';S.lastFoot=null;S.lastStepAt=0;S.firstStep=false;S.combo=0;S.speed=0;S.stumbleUntil=0;S.shake=0;S.flash=0;S.dust=[];S.confetti=[];S.finishPulse=0;S.prevRank=1;
 const me=chars.find(c=>c.id===S.char),pool=chars.filter(c=>c!==me).sort(()=>Math.random()-.5).slice(0,3);
 const lanes=[500,350,425,575];
 S.runners=[me,...pool].map((c,i)=>({char:c,name:['나','민수','지현','철수'][i],dist:0,vel:0,y:lanes[i],target:i?diffs[S.diff].base+(Math.random()-.5)*diffs[S.diff].var:0,finish:null,phase:Math.random()*6,hurtStart:0,stumble:0,kick:0,reactUntil:0,reactType:null,reactFace:'',reactText:'',_ahead:null,aiFell:false}));
 $('#round').textContent=`AI ${diffs[S.diff].label} · RHYTHM SPRINT`;$('#timer').textContent='3';hud();draw(performance.now());
 const pf=$('#portraitFace'),pt=$('#portraitReactText');if(pf)pf.textContent='😤';if(pt)pt.textContent='스타트에 집중!';
 let n=3;const tick=()=>{n--;if(n>0){$('#timer').textContent=n;msg(String(n),430);S._tick=setTimeout(tick,600)}else{S.phase='run';S.go=performance.now();S.last=S.go;$('#timer').textContent='GO!';msg('GO! 첫 발 타이밍! 🔥',650);next('L');S.raf=requestAnimationFrame(loop)}};S._tick=setTimeout(tick,600);
}
function next(f){const lock=S.phase!=='run'||performance.now()<S.stumbleUntil;$('#left').disabled=lock;$('#right').disabled=lock;$('#left').classList.toggle('next',!lock&&f==='L');$('#right').classList.toggle('next',!lock&&f==='R')}
function step(f){
 if(S.phase!=='run'||performance.now()<S.stumbleUntil)return;
 const me=S.runners[0],now=performance.now();
 if(S.lastFoot===f){
  S.combo=0;S.speed*=.42;me.vel*=.35;S.stumbleUntil=now+850;me.stumble=S.stumbleUntil;me.hurtStart=now;S.lastFoot=null;S.lastStepAt=0;S.shake=10;burst(me,16,true);msg('발 꼬임! 😵',830);judge('MISS','miss');react(me,'stumble',now,true);next(null);
  setTimeout(()=>{if(S.phase==='run'){next('L');msg('다시 리듬 잡기! ⚡',380)}},850);return;
 }

 let accel=0;
 if(!S.firstStep){
  const rt=now-S.go;S.firstStep=true;S.combo=1;
  if(rt<=220){accel=2.45;judge('PERFECT START!','perfect');react(me,'perfect',now,true)}
  else if(rt<=380){accel=1.9;judge('GOOD START','good')}
  else if(rt<=600){accel=1.25;judge('LATE START','late')}
  else{accel=.8;judge('SLOW START','miss')}
 }else{
  const interval=now-S.lastStepAt;
  const target=Math.max(155,265-S.speed*9);
  const diff=Math.abs(interval-target);
  if(interval<85){S.combo=0;S.speed*=.95;accel=.08;judge('TOO FAST!','miss')}
  else if(diff<=45){S.combo++;accel=1.28+Math.min(.28,S.combo*.012);judge('PERFECT','perfect');if(S.combo%8===0)react(me,'perfect',now)}
  else if(diff<=95){S.combo++;accel=.88+Math.min(.18,S.combo*.008);judge('GOOD','good')}
  else if(diff<=155){S.combo=Math.max(1,S.combo-1);accel=.48;judge('OK','late')}
  else{S.combo=0;S.speed*=.91;accel=.22;judge('LATE','miss')}
 }
 S.lastStepAt=now;S.lastFoot=f;S.speed=Math.min(11.2,S.speed+accel);me.vel=Math.max(me.vel,S.speed);me.kick=now;next(f==='L'?'R':'L');burst(me,S.speed>8?5:3,false);hud();
}
function loop(now){if(!['run','coast'].includes(S.phase))return;const dt=Math.min(.032,(now-S.last)/1000||.016);S.last=now;physics(dt,now);draw(now);S.raf=requestAnimationFrame(loop)}
function physics(dt,now){
 const me=S.runners[0];
 if(S.phase==='run'){
  if(now<S.stumbleUntil)me.vel=Math.max(0,me.vel-7.8*dt);else{
   const idle=S.lastStepAt?now-S.lastStepAt:9999;
   const decay=idle>430?2.7:.72;S.speed=Math.max(0,S.speed-decay*dt);me.vel+=(S.speed-me.vel)*Math.min(1,5.4*dt);
  }
  me.dist+=me.vel*dt;me.phase+=me.vel*dt*2.5;
 }
 for(let i=1;i<S.runners.length;i++){
  const r=S.runners[i];if(r.finish)continue;
  const fallCfg=aiStumble[S.diff];
  if(S.phase==='run'&&!r.aiFell&&now>S.go+1200&&r.dist>6&&r.dist<43&&Math.random()<dt*fallCfg.rate){
   r.aiFell=true;r.hurtStart=now;r.stumble=now+fallCfg.ms;r.vel*=.28;burst(r,12,true);react(r,'stumble',now,true);
  }
  if(now<r.stumble){
   r.vel=Math.max(0,r.vel-9.5*dt);r.dist+=r.vel*dt*.12;
  }else{
   r.vel+=(r.target+Math.sin(now*.0017+i)*.13-r.vel)*Math.min(1,2.5*dt);r.dist+=r.vel*dt;r.phase+=r.vel*dt*2.08;
   if(Math.random()<dt*2.5)burst(r,1,false);
  }
  if(now>S.go+500){const ahead=r.dist>me.dist+.03;if(r._ahead===null)r._ahead=ahead;else if(ahead!==r._ahead){if(ahead){react(me,'passed',now,true);react(r,'overtake',now,true)}else{react(me,'overtake',now,true);react(r,'passed',now,true)}r._ahead=ahead}}
 }
 const order=[...S.runners].sort((a,b)=>b.dist-a.dist),rank=order.indexOf(me)+1;if(rank===1&&S.prevRank>1)react(me,'lead',now,true);S.prevRank=rank;
 S.runners.forEach((r,i)=>{if(!r.finish&&r.dist>=LEN){r.dist=LEN;r.finish=now;if(i===0){S.phase='coast';S.flash=1;S.finishPulse=1;S.shake=7;$('#timer').textContent=((now-S.go)/1000).toFixed(2)+'s';msg('FINISH! 🏁',800);judge('FINISH!','perfect');react(me,'finish',now,true);next(null);celebrate();S._res=setTimeout(result,2200)}}});
 if(S.phase==='coast'&&S.runners.every(r=>r.finish))result();
 for(const p of S.dust){p.life-=dt;p.x+=p.vx*dt;p.vy+=25*dt;p.y+=p.vy*dt}S.dust=S.dust.filter(p=>p.life>0);
 for(const p of S.confetti){p.life-=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=18*dt;p.rot+=p.vr*dt}S.confetti=S.confetti.filter(p=>p.life>0);
 S.shake*=Math.pow(.025,dt);S.flash=Math.max(0,S.flash-dt*2.7);S.finishPulse*=Math.pow(.08,dt);hud();
}
function hud(){const me=S.runners[0];$('#combo').textContent=S.combo;const sp=Math.round(Math.min(100,S.speed/11.2*100));$('#speed').textContent=sp+'%';$('#speedBar').style.width=sp+'%';const m=Math.min(50,me?.dist||0);$('#progressBar').style.width=(m*2)+'%';$('#progressText').textContent=m.toFixed(1)+'m / 50m';const order=[...S.runners].sort((a,b)=>b.dist-a.dist);$('#rankBadge').textContent=(order.indexOf(me)+1)+'위'}
function result(){if(S.phase==='result')return;S.phase='result';stop();const a=[...S.runners].sort((x,y)=>(x.finish||Infinity)-(y.finish||Infinity)),me=S.runners[0],rank=a.indexOf(me)+1,t=(me.finish-S.go)/1000;$('#resultTitle').textContent=rank===1?'🏆 네모 스프린트 우승!':`${rank}위! 다음 판은 간다`;$('#record').textContent=t.toFixed(2)+'s';$('#rows').innerHTML=a.map((r,i)=>`<div class="row ${r===me?'me':''}"><span><strong>${i+1}위</strong> · ${r.name} (${r.char.name})</span><strong>${((r.finish-S.go)/1000).toFixed(2)}s</strong></div>`).join('');$('#podium').innerHTML='';$('#result').hidden=false}

function cam(){const me=S.runners[0];const raw=Math.max(0,(me?.dist||0)-8)*35;return Math.min(1470,raw)}
function wx(d){return 180+d*35-cam()}
function burst(r,n,impact){for(let i=0;i<n;i++)S.dust.push({x:wx(r.dist)-24-Math.random()*22,y:r.y+36,life:.25+Math.random()*.35,size:(impact?5:3)+Math.random()*(impact?8:5),vx:-36-Math.random()*70,vy:-12-Math.random()*34,c:r.char.type==='sugar'?'#fff1da':r.char.c})}
function celebrate(){for(let i=0;i<60;i++)S.confetti.push({x:Math.random()*W,y:-20-Math.random()*160,vx:-20+Math.random()*40,vy:65+Math.random()*90,life:1.4+Math.random()*1.0,rot:Math.random()*6.2,vr:-4+Math.random()*8,c:['#ffd84d','#ff5e6d','#5ee6ad','#62c9ff','#ffffff'][i%5]})}
function fall(r,now){const end=r===S.runners[0]?S.stumbleUntil:r.stumble,dur=Math.max(1,end-r.hurtStart),t=Math.max(0,Math.min(1,(now-r.hurtStart)/dur));if(t<.34)return 1.08*(1-Math.pow(1-t/.34,3));if(t<.67)return 1.08;return 1.08*Math.pow(1-(t-.67)/.33,3)}
function pimg(im,x,y,s,rot=0,ax=.5,ay=.5){if(!im.naturalWidth)return;ctx.save();ctx.translate(x,y);ctx.rotate(rot);ctx.drawImage(im,-im.naturalWidth*s*ax,-im.naturalHeight*s*ay,im.naturalWidth*s,im.naturalHeight*s);ctx.restore()}
function rr(x,y,w,h,r){ctx.beginPath();if(ctx.roundRect)ctx.roundRect(x,y,w,h,r);else ctx.rect(x,y,w,h)}

function draw(now){const speed=S.runners[0]?.vel||0,tilt=(S.phase==='run'?Math.sin(now*.002)*Math.min(.003,speed*.00025):0);ctx.save();ctx.translate((Math.random()-.5)*S.shake,(Math.random()-.5)*S.shake);ctx.translate(W/2,H/2);ctx.rotate(tilt);ctx.translate(-W/2,-H/2);sky(now);mountains();stadium(now);track(now);finishLine(now);[...S.runners].sort((a,b)=>a.y-b.y).forEach(r=>runner(r,now,r===S.runners[0]));particles();speedLines(now);bottomFade();ctx.restore();if(S.flash>0){ctx.fillStyle=`rgba(255,255,255,${S.flash*.38})`;ctx.fillRect(0,0,W,H)}}
function sky(now){const g=ctx.createLinearGradient(0,0,0,190);g.addColorStop(0,'#36bdf7');g.addColorStop(.62,'#8bdcfb');g.addColorStop(1,'#dff8ff');ctx.fillStyle=g;ctx.fillRect(0,0,W,200);ctx.fillStyle='rgba(255,255,255,.82)';for(let i=0;i<5;i++){const x=((i*310-now*.004)%1650)-160,y=45+(i%2)*52;ctx.beginPath();ctx.ellipse(x,y,48,14,0,0,7);ctx.ellipse(x+36,y+4,34,12,0,0,7);ctx.ellipse(x-28,y+5,30,10,0,0,7);ctx.fill()}ctx.fillStyle='#fff7a8';ctx.globalAlpha=.5;ctx.beginPath();ctx.arc(1090,58,44,0,7);ctx.fill();ctx.globalAlpha=1}
function mountains(){const shift=cam()*.055;ctx.fillStyle='#67b6ae';ctx.beginPath();ctx.moveTo(0,190);for(let x=-150;x<W+200;x+=130){const y=145+Math.sin((x+shift)*.008)*27;ctx.lineTo(x,y)}ctx.lineTo(W,235);ctx.lineTo(0,235);ctx.fill();ctx.fillStyle='#3e9d90';ctx.beginPath();ctx.moveTo(0,210);for(let x=-150;x<W+200;x+=95){const y=185+Math.sin((x+shift*.6)*.013)*17;ctx.lineTo(x,y)}ctx.lineTo(W,245);ctx.lineTo(0,245);ctx.fill()}
function stadium(now){ctx.fillStyle='#253a5b';ctx.fillRect(0,180,W,120);ctx.fillStyle='#314c70';ctx.fillRect(0,185,W,14);for(let row=0;row<4;row++)for(let x=4;x<W;x+=16){ctx.fillStyle=['#ffd84d','#ff6c6a','#5ee6ad','#fff','#8ea7ff'][(x/16+row|0)%5];ctx.beginPath();ctx.arc(x+(row%2)*5,215+row*22+Math.sin(x*.06+now*.004+row)*3,3.6,0,7);ctx.fill()}ctx.fillStyle='#0f1c31';rr(W/2-190,198,380,54,13);ctx.fill();ctx.strokeStyle='#ffffff30';ctx.lineWidth=2;ctx.stroke();ctx.fillStyle='#fff';ctx.font='900 24px system-ui';ctx.textAlign='center';ctx.fillText('NEMO SPORTS · 50M',W/2,233);for(let i=0;i<7;i++){const x=68+i*188;ctx.strokeStyle='#e7eff9';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(x,145);ctx.lineTo(x,198);ctx.stroke();ctx.fillStyle=['#ffd84d','#ff5e6d','#5ee6ad','#62c9ff'][i%4];ctx.beginPath();ctx.moveTo(x,146);ctx.quadraticCurveTo(x+31,151+Math.sin(now*.007+i)*6,x+62,148);ctx.lineTo(x+62,171);ctx.quadraticCurveTo(x+31,166+Math.sin(now*.007+i)*6,x,170);ctx.closePath();ctx.fill()}ctx.fillStyle='#f1d8ab';ctx.fillRect(0,294,W,9)}
function track(){const top=303,bottom=650;const g=ctx.createLinearGradient(0,top,0,bottom);g.addColorStop(0,'#dc7151');g.addColorStop(1,'#ae4635');ctx.fillStyle=g;ctx.fillRect(0,top,W,bottom-top);const laneYs=[315,390,465,540,615];for(let i=0;i<laneYs.length;i++){ctx.strokeStyle='rgba(255,255,255,.72)';ctx.lineWidth=i===0||i===laneYs.length-1?4:2.5;ctx.beginPath();ctx.moveTo(0,laneYs[i]);ctx.lineTo(W,laneYs[i]);ctx.stroke()}for(let m=0;m<=50;m+=5){const x=wx(m);if(x<-50||x>W+50)continue;ctx.strokeStyle='rgba(255,255,255,.16)';ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(x,top);ctx.lineTo(x,bottom);ctx.stroke();ctx.fillStyle='rgba(255,255,255,.72)';ctx.font='800 13px system-ui';ctx.textAlign='left';ctx.fillText(m+'m',x+6,322)}for(let i=0;i<22;i++){const x=((i*74-cam()*.45)%1550)-110;ctx.strokeStyle='#ffffff16';ctx.beginPath();ctx.moveTo(x,top);ctx.lineTo(x-62,bottom);ctx.stroke()}ctx.fillStyle='#318955';ctx.fillRect(0,bottom,W,8)}
function finishLine(now){const x=wx(50);if(x<-32||x>W+40)return;for(let y=303;y<650;y+=22){ctx.fillStyle=((y/22)|0)%2?'#fff':'#151923';ctx.fillRect(x-9,y,18,22)}ctx.fillStyle='#0c1729';rr(x-58,266,116,31,10);ctx.fill();ctx.fillStyle='#fff';ctx.font='900 16px system-ui';ctx.textAlign='center';ctx.fillText('FINISH',x,287);if(S.finishPulse>0){ctx.strokeStyle=`rgba(255,216,77,${S.finishPulse})`;ctx.lineWidth=7;ctx.beginPath();ctx.arc(x,486,68+58*(1-S.finishPulse),0,7);ctx.stroke()}}
function runner(r,now,me){const x=wx(r.dist),running=['run','coast'].includes(S.phase)&&!r.finish,hurt=(r===S.runners[0]?now<S.stumbleUntil:now<r.stumble),bounce=running&&!hurt?Math.abs(Math.sin(r.phase))*5:0;ctx.save();ctx.translate(x,r.y+bounce);if(me){ctx.fillStyle='rgba(255,216,77,.14)';ctx.beginPath();ctx.arc(0,5,56+Math.sin(now*.01)*3,0,7);ctx.fill()}if(r.char.type==='sugar')sugar(r,now,me,running,hurt);else simple(r,now,me,running,hurt);ctx.fillStyle=me?'#ffd84d':'rgba(255,255,255,.94)';rr(-34,-72,68,19,9);ctx.fill();ctx.fillStyle='#101928';ctx.font='900 10px system-ui';ctx.textAlign='center';ctx.fillText(me?'1P · 나':r.name,0,-58);if(r.reactUntil>now)reactionBubble(r,now);ctx.restore()}
function reactionBubble(r,now){const a=Math.min(1,(r.reactUntil-now)/180);ctx.globalAlpha=Math.max(.25,a);ctx.fillStyle='#071426e8';rr(-48,-116,96,34,13);ctx.fill();ctx.fillStyle='#fff';ctx.font='900 13px system-ui';ctx.textAlign='center';ctx.fillText(`${r.reactFace} ${r.reactText}`,-0,-94);ctx.globalAlpha=1}
function sugar(r,now,me,running,hurt){const s=me?.42:.36,bw=220*s,bh=220*s,stride=running&&!hurt?Math.sin(r.phase):0,ang=hurt?fall(r,now):Math.min(.11,r.vel/78),hit=Math.max(0,1-(now-(r.kick||0))/120);ctx.save();ctx.rotate(ang);ctx.fillStyle='rgba(0,0,0,.22)';ctx.beginPath();ctx.ellipse(-5,bh*.5+8,bw*.42,7,0,0,7);ctx.fill();const armS=s*.66,legS=s*.62,sy=-bh*.03,sx=bw*.44,hy=bh*.35,hx=bw*.18;let al=-stride*.78,ar=stride*.78,ll=stride*.7,lr=-stride*.7;if(hurt){al=-1.05;ar=.92;ll=.18;lr=-.22}pimg(A.leg,-hx,hy,legS,ll,.5,.12);pimg(A.leg,hx,hy,legS,lr,.5,.12);pimg(A.arm,-sx,sy,armS,al,.52,.16);ctx.save();ctx.scale(-1,1);pimg(A.arm,-sx,sy,armS,-ar,.52,.16);ctx.restore();ctx.save();ctx.scale(1+hit*.028,1-hit*.036);pimg(A.body,0,0,s);ctx.restore();if(hurt){ctx.strokeStyle='#20191a';ctx.lineWidth=3.5;for(const q of [-1,1]){const ex=q*bw*.15,ey=-bh*.05;ctx.beginPath();ctx.moveTo(ex-4,ey-4);ctx.lineTo(ex+4,ey+4);ctx.moveTo(ex+4,ey-4);ctx.lineTo(ex-4,ey+4);ctx.stroke()}ctx.fillStyle='#b6282d';ctx.beginPath();ctx.ellipse(0,bh*.14,7,5,0,0,7);ctx.fill()}else{pimg(A.eyes,0,-bh*.05,s*.54);pimg(A.mouth,0,bh*.12,s*.48);ctx.fillStyle='#ff7d88aa';ctx.beginPath();ctx.ellipse(-bw*.27,bh*.08,4,2.7,0,0,7);ctx.ellipse(bw*.27,bh*.08,4,2.7,0,0,7);ctx.fill();emotionMarks(r,now,bw,bh)}ctx.restore()}
function simple(r,now,me,running,hurt){const c=r.char,s=me?1.05:.92,w=66*s,h=(c.type==='apt'?88:62)*s,stride=running&&!hurt?Math.sin(r.phase):0,ang=hurt?fall(r,now):Math.min(.09,r.vel/86);ctx.save();ctx.rotate(ang);ctx.fillStyle='rgba(0,0,0,.21)';ctx.beginPath();ctx.ellipse(0,h*.54,w*.5,6,0,0,7);ctx.fill();ctx.strokeStyle=c.type==='safe'?'#8d96a1':c.type==='brown'?'#683820':c.type==='brick'?'#973b2e':'#e7d8c2';ctx.lineWidth=9;ctx.lineCap='round';for(const [sx,sgn] of [[-1,-1],[1,1]]){ctx.beginPath();ctx.moveTo(sx*w*.22,h*.34);ctx.lineTo(sx*w*.22+sgn*stride*7,h*.52);ctx.stroke();ctx.beginPath();ctx.moveTo(sx*w*.5,0);ctx.lineTo(sx*w*.5-sgn*stride*8,8);ctx.stroke()}ctx.fillStyle=c.c;rr(-w/2,-h/2,w,h,13);ctx.fill();detail(c,w,h);face(hurt,w,h);if(!hurt)emotionMarks(r,now,w,h);ctx.restore()}
function emotionMarks(r,now,w,h){if(!(r.reactUntil>now))return;ctx.strokeStyle='#20191a';ctx.fillStyle='#20191a';ctx.lineWidth=2.8;ctx.lineCap='round';if(r.reactType==='passed'){ctx.beginPath();ctx.moveTo(-16,-16);ctx.lineTo(-7,-20);ctx.moveTo(16,-16);ctx.lineTo(7,-20);ctx.stroke();ctx.beginPath();ctx.arc(0,12,6,0,Math.PI*2);ctx.fill()}else if(r.reactType==='overtake'||r.reactType==='lead'){ctx.beginPath();ctx.moveTo(-17,-18);ctx.lineTo(-8,-15);ctx.moveTo(17,-18);ctx.lineTo(8,-15);ctx.stroke()} }
function detail(c,w,h){if(c.type==='brick'){ctx.strokeStyle='#8d3428';ctx.lineWidth=2;for(let y=-h*.25;y<h*.3;y+=14){ctx.beginPath();ctx.moveTo(-w/2+5,y);ctx.lineTo(w/2-5,y);ctx.stroke()}}else if(c.type==='safe'){ctx.strokeStyle='#2d333b';ctx.lineWidth=3;ctx.beginPath();ctx.arc(0,7,13,0,7);ctx.stroke();ctx.fillStyle='#d0a451';ctx.beginPath();ctx.arc(0,7,4,0,7);ctx.fill()}else if(c.type==='apt'){ctx.fillStyle='#62b9e7';for(let y=-h*.3;y<h*.15;y+=17)for(let x=-w*.23;x<w*.28;x+=16)ctx.fillRect(x-3,y,7,8);ctx.fillStyle='#315f61';ctx.fillRect(-7,h*.17,14,14)}}
function face(hurt,w,h){if(hurt){ctx.strokeStyle='#17191d';ctx.lineWidth=3;for(const x of [-11,11]){ctx.beginPath();ctx.moveTo(x-4,-7);ctx.lineTo(x+4,1);ctx.moveTo(x+4,-7);ctx.lineTo(x-4,1);ctx.stroke()}return}for(const x of [-11,11]){ctx.fillStyle='#111';ctx.beginPath();ctx.ellipse(x,-5,5.2,7,0,0,7);ctx.fill();ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(x-1.5,-7,1.6,0,7);ctx.fill()}ctx.fillStyle='#391617';ctx.beginPath();ctx.arc(0,8,7,0,Math.PI);ctx.fill()}
function particles(){for(const p of S.dust){ctx.globalAlpha=Math.max(0,p.life/.6);ctx.fillStyle=p.c;ctx.beginPath();ctx.arc(p.x,p.y,p.size,0,7);ctx.fill()}for(const p of S.confetti){ctx.save();ctx.globalAlpha=Math.max(0,p.life/2.2);ctx.translate(p.x,p.y);ctx.rotate(p.rot);ctx.fillStyle=p.c;ctx.fillRect(-4,-7,8,14);ctx.restore()}ctx.globalAlpha=1}
function speedLines(now){const v=S.runners[0]?.vel||0;if(v<7.7||S.phase!=='run')return;const alpha=Math.min(.42,(v-7.7)*.15);ctx.strokeStyle=`rgba(255,255,255,${alpha})`;ctx.lineWidth=2;for(let i=0;i<15;i++){const y=330+(i*23+now*.14)%280,x=120+(i*97)%1050;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x-58-v*7,y);ctx.stroke()}}
function bottomFade(){const g=ctx.createLinearGradient(0,610,0,720);g.addColorStop(0,'rgba(6,16,31,0)');g.addColorStop(1,'rgba(6,16,31,.36)');ctx.fillStyle=g;ctx.fillRect(0,610,W,110)}
})();