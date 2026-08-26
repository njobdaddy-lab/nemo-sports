(()=>{
'use strict';
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const canvas=$('#canvas'),ctx=canvas.getContext('2d');
const W=1080,H=1150,LEN=50; canvas.width=W;canvas.height=H;

const chars=[
{id:'sugar',name:'각설탕',c:'#f7efe2',type:'sugar',quote:'통통 뛰는 기본 마스코트'},
{id:'brown',name:'흑설탕',c:'#8a4f2c',type:'brown',quote:'진하게, 끝까지 간다'},
{id:'brick',name:'벽돌',c:'#cb563b',type:'brick',quote:'대화보다 돌진'},
{id:'safe',name:'금고',c:'#717a86',type:'safe',quote:'무뚝뚝한 허당'},
{id:'apt',name:'아파트',c:'#e7d5b8',type:'apt',quote:'덩치는 커도 순둥이'}
];
const diffs={easy:{label:'느긋',base:7.0,var:.52},normal:{label:'보통',base:7.65,var:.40},hard:{label:'빡셈',base:8.18,var:.32},hell:{label:'악마',base:8.68,var:.24}};
const S={char:'sugar',diff:'normal',sound:true,phase:'home',last:0,go:0,lastFoot:null,combo:0,speed:0,stumbleUntil:0,shake:0,flash:0,runners:[],dust:[],confetti:[],raf:0,finishPulse:0};

const svgBody=`<svg xmlns="http://www.w3.org/2000/svg" width="220" height="220" viewBox="0 0 220 220"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#fffef9"/><stop offset=".55" stop-color="#f5ead7"/><stop offset="1" stop-color="#d8c8b4"/></linearGradient><filter id="n" x="-10%" y="-10%" width="120%" height="120%"><feTurbulence type="fractalNoise" baseFrequency=".085" numOctaves="3" seed="7"/><feColorMatrix values="1 0 0 0 .9 0 1 0 0 .87 0 0 1 0 .78 0 0 0 .32 0"/><feBlend mode="multiply" in2="SourceGraphic"/></filter></defs><rect x="10" y="10" width="200" height="200" rx="34" fill="url(#g)" stroke="#fff" stroke-width="5"/><rect x="13" y="13" width="194" height="194" rx="31" fill="#fff" opacity=".22" filter="url(#n)"/><path d="M28 38 Q55 20 96 21" fill="none" stroke="#fff" stroke-width="9" stroke-linecap="round" opacity=".62"/></svg>`;
const svgArm=`<svg xmlns="http://www.w3.org/2000/svg" width="88" height="126" viewBox="0 0 88 126"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#fffdf8"/><stop offset="1" stop-color="#dccab6"/></linearGradient></defs><path d="M44 8 C22 24 18 48 28 67 C35 81 52 83 58 69 C62 59 56 51 50 47 C68 42 75 53 75 70 C75 92 60 112 38 116 C19 120 8 106 12 91 C16 74 27 64 37 59" fill="url(#g)" stroke="#fff" stroke-width="4" stroke-linejoin="round"/></svg>`;
const svgLeg=`<svg xmlns="http://www.w3.org/2000/svg" width="90" height="120" viewBox="0 0 90 120"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#fffdf7"/><stop offset="1" stop-color="#d9c6b1"/></linearGradient></defs><path d="M35 7 Q50 7 53 22 L55 65 Q72 66 79 80 Q86 96 72 107 Q60 115 35 113 Q14 112 10 99 Q6 85 17 76 Q25 69 31 68 L30 23 Q30 11 35 7Z" fill="url(#g)" stroke="#fff" stroke-width="4"/></svg>`;
const svgEyes=`<svg xmlns="http://www.w3.org/2000/svg" width="120" height="72" viewBox="0 0 120 72"><defs><radialGradient id="e" cx=".35" cy=".25"><stop stop-color="#7a4027"/><stop offset=".45" stop-color="#24130e"/><stop offset="1" stop-color="#080707"/></radialGradient></defs><path d="M19 12 Q31 2 43 10" fill="none" stroke="#2b211e" stroke-width="6" stroke-linecap="round"/><path d="M77 10 Q90 2 101 12" fill="none" stroke="#2b211e" stroke-width="6" stroke-linecap="round"/><ellipse cx="34" cy="40" rx="16" ry="22" fill="url(#e)"/><ellipse cx="86" cy="40" rx="16" ry="22" fill="url(#e)"/><circle cx="28" cy="31" r="5" fill="#fff"/><circle cx="80" cy="31" r="5" fill="#fff"/></svg>`;
const svgMouth=`<svg xmlns="http://www.w3.org/2000/svg" width="70" height="50" viewBox="0 0 70 50"><path d="M12 13 Q35 40 58 13 Q55 45 35 46 Q15 44 12 13Z" fill="#321516" stroke="#201014" stroke-width="3"/><ellipse cx="35" cy="36" rx="13" ry="7" fill="#ef6764"/></svg>`;
function img(svg){const i=new Image();i.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svg);return i}
const A={body:img(svgBody),arm:img(svgArm),leg:img(svgLeg),eyes:img(svgEyes),mouth:img(svgMouth)};

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

function home(){stop();$('#result').hidden=true;$('#game').hidden=true;$('#home').hidden=false;document.body.classList.remove('race074');S.phase='home'}
function stop(){cancelAnimationFrame(S.raf);S.raf=0;clearTimeout(S._res);clearTimeout(S._tick)}
function msg(t,ms=560){const e=$('#msg');e.textContent=t;e.classList.add('show');clearTimeout(e._t);e._t=setTimeout(()=>e.classList.remove('show'),ms)}
function start(){
 stop();$('#result').hidden=true;$('#home').hidden=true;$('#game').hidden=false;document.body.classList.add('race074');
 S.phase='count';S.lastFoot=null;S.combo=0;S.speed=0;S.stumbleUntil=0;S.shake=0;S.flash=0;S.dust=[];S.confetti=[];S.finishPulse=0;
 const me=chars.find(c=>c.id===S.char),pool=chars.filter(c=>c!==me).sort(()=>Math.random()-.5).slice(0,3);
 const lanes=[745,535,650,860];
 S.runners=[me,...pool].map((c,i)=>({char:c,name:['나','민수','지현','철수'][i],dist:0,vel:0,y:lanes[i],target:i?diffs[S.diff].base+(Math.random()-.5)*diffs[S.diff].var:0,finish:null,phase:Math.random()*6,hurtStart:0,stumble:0,kick:0}));
 $('#round').textContent=`AI ${diffs[S.diff].label} · 0.7.4 STADIUM`;$('#timer').textContent='3';hud();draw(performance.now());
 let n=3;const tick=()=>{n--;if(n>0){$('#timer').textContent=n;msg(String(n),430);S._tick=setTimeout(tick,600)}else{S.phase='run';S.go=performance.now();S.last=S.go;$('#timer').textContent='GO!';msg('GO! 🔥',650);next('L');S.raf=requestAnimationFrame(loop)}};S._tick=setTimeout(tick,600);
}
function next(f){const lock=S.phase!=='run'||performance.now()<S.stumbleUntil;$('#left').disabled=lock;$('#right').disabled=lock;$('#left').classList.toggle('next',!lock&&f==='L');$('#right').classList.toggle('next',!lock&&f==='R')}
function step(f){
 if(S.phase!=='run'||performance.now()<S.stumbleUntil)return;
 const me=S.runners[0],now=performance.now();
 if(S.lastFoot===f){
  S.combo=0;S.speed*=.42;me.vel*=.35;S.stumbleUntil=now+850;me.stumble=S.stumbleUntil;me.hurtStart=now;S.lastFoot=null;S.shake=18;burst(me,22,true);msg('발 꼬임! 😵',830);next(null);
  setTimeout(()=>{if(S.phase==='run'){next('L');msg('다시! ⚡',380)}},850);return;
 }
 S.lastFoot=f;S.combo++;S.speed=Math.min(10.9,S.speed+1.24+Math.min(1.8,S.combo*.055)*.26);me.vel=Math.max(me.vel,S.speed);me.kick=now;next(f==='L'?'R':'L');burst(me,S.speed>8?7:4,false);
 if(S.combo===8)msg('8 COMBO! ⚡',380);if(S.combo===16)msg('16 COMBO! 🔥',420);hud();
}
function loop(now){if(!['run','coast'].includes(S.phase))return;const dt=Math.min(.032,(now-S.last)/1000||.016);S.last=now;physics(dt,now);draw(now);S.raf=requestAnimationFrame(loop)}
function physics(dt,now){
 const me=S.runners[0];
 if(S.phase==='run'){
  if(now<S.stumbleUntil)me.vel=Math.max(0,me.vel-7.8*dt);else{S.speed=Math.max(3.15,S.speed-1.08*dt);me.vel+=(S.speed-me.vel)*Math.min(1,5.2*dt)}
  me.dist+=me.vel*dt;me.phase+=me.vel*dt*2.5;
 }
 for(let i=1;i<S.runners.length;i++){
  const r=S.runners[i];if(r.finish)continue;
  r.vel+=(r.target+Math.sin(now*.0017+i)*.13-r.vel)*Math.min(1,2.5*dt);r.dist+=r.vel*dt;r.phase+=r.vel*dt*2.08;
  if(Math.random()<dt*3.2)burst(r,1,false);
 }
 S.runners.forEach((r,i)=>{if(!r.finish&&r.dist>=LEN){r.dist=LEN;r.finish=now;if(i===0){S.phase='coast';S.flash=1;S.finishPulse=1;S.shake=10;$('#timer').textContent=((now-S.go)/1000).toFixed(2)+'s';msg('FINISH! 🏁',800);next(null);celebrate();S._res=setTimeout(result,2350)}}});
 if(S.phase==='coast'&&S.runners.every(r=>r.finish))result();
 for(const p of S.dust){p.life-=dt;p.x+=p.vx*dt;p.vy+=30*dt;p.y+=p.vy*dt}
 S.dust=S.dust.filter(p=>p.life>0);
 for(const p of S.confetti){p.life-=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=20*dt;p.rot+=p.vr*dt}
 S.confetti=S.confetti.filter(p=>p.life>0);
 S.shake*=Math.pow(.025,dt);S.flash=Math.max(0,S.flash-dt*2.7);S.finishPulse*=Math.pow(.08,dt);hud();
}
function hud(){
 const me=S.runners[0];$('#combo').textContent=S.combo;const sp=Math.round(Math.min(100,S.speed/10.9*100));$('#speed').textContent=sp+'%';$('#speedBar').style.width=sp+'%';
 const m=Math.min(50,me?.dist||0);$('#progressBar').style.width=(m*2)+'%';$('#progressText').textContent=m.toFixed(1)+'m / 50m';
 const order=[...S.runners].sort((a,b)=>b.dist-a.dist);$('#rankBadge').textContent=(order.indexOf(me)+1)+'위';
}
function result(){
 if(S.phase==='result')return;S.phase='result';stop();const a=[...S.runners].sort((x,y)=>(x.finish||Infinity)-(y.finish||Infinity)),me=S.runners[0],rank=a.indexOf(me)+1,t=(me.finish-S.go)/1000;
 $('#resultTitle').textContent=rank===1?'🏆 네모 스프린트 우승!':`${rank}위! 다음 판은 간다`;$('#record').textContent=t.toFixed(2)+'s';
 $('#rows').innerHTML=a.map((r,i)=>`<div class="row ${r===me?'me':''}"><span><strong>${i+1}위</strong> · ${r.name} (${r.char.name})</span><strong>${((r.finish-S.go)/1000).toFixed(2)}s</strong></div>`).join('');
 $('#podium').innerHTML='';$('#result').hidden=false;
}
function cam(){const me=S.runners[0];const raw=Math.max(0,(me?.dist||0)-9)*22;return Math.min(780,raw)}
function wx(d){return 145+d*29-cam()}
function burst(r,n,impact){for(let i=0;i<n;i++){S.dust.push({d:r.dist,x:wx(r.dist)-35-Math.random()*25,y:r.y+64,life:.28+Math.random()*.4,size:(impact?7:4)+Math.random()*(impact?12:7),vx:-45-Math.random()*90,vy:-20-Math.random()*55,c:r.char.type==='sugar'?'#fff1da':r.char.c})}}
function celebrate(){for(let i=0;i<75;i++)S.confetti.push({x:Math.random()*W,y:-20-Math.random()*280,vx:-25+Math.random()*50,vy:75+Math.random()*115,life:1.5+Math.random()*1.2,rot:Math.random()*6.2,vr:-4+Math.random()*8,c:['#ffd84d','#ff5e6d','#5ee6ad','#62c9ff','#ffffff'][i%5]})}
function fall(r,now){const end=r===S.runners[0]?S.stumbleUntil:r.stumble,dur=Math.max(1,end-r.hurtStart),t=Math.max(0,Math.min(1,(now-r.hurtStart)/dur));if(t<.34)return 1.16*(1-Math.pow(1-t/.34,3));if(t<.67)return 1.16;return 1.16*Math.pow(1-(t-.67)/.33,3)}
function pimg(im,x,y,s,rot=0,ax=.5,ay=.5){ctx.save();ctx.translate(x,y);ctx.rotate(rot);ctx.drawImage(im,-im.naturalWidth*s*ax,-im.naturalHeight*s*ay,im.naturalWidth*s,im.naturalHeight*s);ctx.restore()}
function rr(x,y,w,h,r){ctx.beginPath();if(ctx.roundRect)ctx.roundRect(x,y,w,h,r);else ctx.rect(x,y,w,h)}
function draw(now){
 const speed=S.runners[0]?.vel||0,tilt=(S.phase==='run'?Math.sin(now*.002)*Math.min(.004,speed*.00035):0);
 ctx.save();ctx.translate((Math.random()-.5)*S.shake,(Math.random()-.5)*S.shake);ctx.translate(W/2,H/2);ctx.rotate(tilt);ctx.translate(-W/2,-H/2);
 sky(now);mountains();stadium(now);track(now);finishLine(now);
 [...S.runners].sort((a,b)=>a.y-b.y).forEach(r=>runner(r,now,r===S.runners[0]));
 particles();speedLines(now);ctx.restore();
 if(S.flash>0){ctx.fillStyle=`rgba(255,255,255,${S.flash*.42})`;ctx.fillRect(0,0,W,H)}
}
function sky(now){
 const g=ctx.createLinearGradient(0,0,0,430);g.addColorStop(0,'#39bdf8');g.addColorStop(.58,'#92defd');g.addColorStop(1,'#e7f9ff');ctx.fillStyle=g;ctx.fillRect(0,0,W,430);
 ctx.fillStyle='rgba(255,255,255,.83)';for(let i=0;i<6;i++){const x=((i*235-now*.006)%1450)-150,y=70+(i%3)*58;ctx.beginPath();ctx.ellipse(x,y,54,18,0,0,7);ctx.ellipse(x+42,y+5,40,15,0,0,7);ctx.ellipse(x-34,y+8,34,13,0,0,7);ctx.fill()}
 ctx.fillStyle='#fff7a8';ctx.globalAlpha=.55;ctx.beginPath();ctx.arc(900,82,55,0,7);ctx.fill();ctx.globalAlpha=1;
}
function mountains(){
 const shift=cam()*.08;ctx.fillStyle='#65b5ae';ctx.beginPath();ctx.moveTo(0,330);for(let x=-150;x<W+200;x+=120){const y=250+Math.sin((x+shift)*.009)*45;ctx.lineTo(x,y)}ctx.lineTo(W,430);ctx.lineTo(0,430);ctx.fill();
 ctx.fillStyle='#3f9f91';ctx.beginPath();ctx.moveTo(0,360);for(let x=-150;x<W+200;x+=90){const y=315+Math.sin((x+shift*.6)*.014)*24;ctx.lineTo(x,y)}ctx.lineTo(W,440);ctx.lineTo(0,440);ctx.fill();
}
function stadium(now){
 ctx.fillStyle='#253a5b';ctx.fillRect(0,350,W,205);ctx.fillStyle='#314c70';ctx.fillRect(0,360,W,18);
 for(let row=0;row<5;row++)for(let x=4;x<W;x+=15){ctx.fillStyle=['#ffd84d','#ff6c6a','#5ee6ad','#fff','#8ea7ff'][(x/15+row|0)%5];ctx.beginPath();ctx.arc(x+(row%2)*5,397+row*27+Math.sin(x*.07+now*.004+row)*4,4,0,7);ctx.fill()}
 ctx.fillStyle='#0f1c31';rr(305,335,470,80,16);ctx.fill();ctx.strokeStyle='#ffffff35';ctx.lineWidth=3;ctx.stroke();ctx.fillStyle='#fff';ctx.font='1000 36px system-ui';ctx.textAlign='center';ctx.fillText('NEMO SPORTS · 50M',540,384);
 for(let i=0;i<6;i++){const x=55+i*190;ctx.strokeStyle='#e7eff9';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(x,295);ctx.lineTo(x,365);ctx.stroke();ctx.fillStyle=['#ffd84d','#ff5e6d','#5ee6ad','#62c9ff'][i%4];ctx.beginPath();ctx.moveTo(x,296);ctx.quadraticCurveTo(x+38,304+Math.sin(now*.007+i)*9,x+74,299);ctx.lineTo(x+74,331);ctx.quadraticCurveTo(x+38,322+Math.sin(now*.007+i)*9,x,328);ctx.closePath();ctx.fill()}
 ctx.fillStyle='#f1d8ab';ctx.fillRect(0,547,W,14);
}
function track(now){
 const g=ctx.createLinearGradient(0,560,0,H);g.addColorStop(0,'#d86c4d');g.addColorStop(1,'#a94332');ctx.fillStyle=g;ctx.fillRect(0,560,W,H-560);
 for(let i=0;i<5;i++){const y=575+i*145;ctx.strokeStyle='rgba(255,255,255,.72)';ctx.lineWidth=i===0||i===4?5:3;ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke()}
 for(let m=0;m<=50;m+=5){const x=wx(m);if(x<-50||x>W+50)continue;ctx.strokeStyle='rgba(255,255,255,.18)';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x,560);ctx.lineTo(x,H);ctx.stroke();ctx.fillStyle='rgba(255,255,255,.7)';ctx.font='800 18px system-ui';ctx.textAlign='left';ctx.fillText(m+'m',x+7,594)}
 const near=H-18;ctx.fillStyle='#318955';ctx.fillRect(0,near,W,18);
 for(let i=0;i<18;i++){const x=((i*79-cam()*.55)%1300)-100;ctx.strokeStyle='#ffffff20';ctx.beginPath();ctx.moveTo(x,560);ctx.lineTo(x-120,near);ctx.stroke()}
}
function finishLine(now){
 const x=wx(50);if(x<-35||x>W+50)return;
 for(let y=560;y<H-18;y+=26){ctx.fillStyle=((y/26)|0)%2?'#fff':'#151923';ctx.fillRect(x-12,y,24,26)}
 ctx.fillStyle='#0c1729';rr(x-80,508,160,45,13);ctx.fill();ctx.fillStyle='#fff';ctx.font='1000 23px system-ui';ctx.textAlign='center';ctx.fillText('FINISH',x,538);
 if(S.finishPulse>0){ctx.strokeStyle=`rgba(255,216,77,${S.finishPulse})`;ctx.lineWidth=12;ctx.beginPath();ctx.arc(x,760,110+100*(1-S.finishPulse),0,7);ctx.stroke()}
}
function runner(r,now,me){
 const x=wx(r.dist),running=['run','coast'].includes(S.phase)&&!r.finish,hurt=(r===S.runners[0]?now<S.stumbleUntil:now<r.stumble),bounce=running&&!hurt?Math.abs(Math.sin(r.phase))*9:0;
 ctx.save();ctx.translate(x,r.y+bounce);
 if(me){ctx.fillStyle='rgba(255,216,77,.18)';ctx.beginPath();ctx.arc(0,15,82+Math.sin(now*.01)*6,0,7);ctx.fill()}
 if(r.char.type==='sugar')sugar(r,now,me,running,hurt);else simple(r,now,me,running,hurt);
 ctx.fillStyle=me?'#ffd84d':'rgba(255,255,255,.94)';rr(-42,-112,84,25,12);ctx.fill();ctx.fillStyle='#101928';ctx.font='1000 13px system-ui';ctx.textAlign='center';ctx.fillText(me?'1P · 나':r.name,0,-94);ctx.restore();
}
function sugar(r,now,me,running,hurt){
 const s=me?.67:.49,bw=220*s,bh=220*s,stride=running&&!hurt?Math.sin(r.phase):0,ang=hurt?fall(r,now):Math.min(.16,r.vel/60),hit=Math.max(0,1-(now-(r.kick||0))/120);
 ctx.save();ctx.rotate(ang);ctx.fillStyle='rgba(0,0,0,.25)';ctx.beginPath();ctx.ellipse(-8,bh*.5+14,bw*.45,12,0,0,7);ctx.fill();
 const armS=s*.70,legS=s*.66,sy=-bh*.03,sx=bw*.45,hy=bh*.37,hx=bw*.19;
 let al=-stride*.92,ar=stride*.92,ll=stride*.82,lr=-stride*.82;if(hurt){al=-1.18;ar=.98;ll=.2;lr=-.25}
 pimg(A.leg,-hx,hy,legS,ll,.5,.12);pimg(A.leg,hx,hy,legS,lr,.5,.12);pimg(A.arm,-sx,sy,armS,al,.52,.16);ctx.save();ctx.scale(-1,1);pimg(A.arm,-sx,sy,armS,-ar,.52,.16);ctx.restore();
 ctx.save();ctx.scale(1+hit*.035,1-hit*.045);pimg(A.body,0,0,s);ctx.restore();
 if(hurt){ctx.strokeStyle='#20191a';ctx.lineWidth=5;for(const q of [-1,1]){const ex=q*bw*.15,ey=-bh*.05;ctx.beginPath();ctx.moveTo(ex-6,ey-6);ctx.lineTo(ex+6,ey+6);ctx.moveTo(ex+6,ey-6);ctx.lineTo(ex-6,ey+6);ctx.stroke()}ctx.fillStyle='#b6282d';ctx.beginPath();ctx.ellipse(0,bh*.14,10,7,0,0,7);ctx.fill()}
 else{pimg(A.eyes,0,-bh*.05,s*.56);pimg(A.mouth,0,bh*.12,s*.5);ctx.fillStyle='#ff7d88aa';ctx.beginPath();ctx.ellipse(-bw*.27,bh*.08,5,3.5,0,0,7);ctx.ellipse(bw*.27,bh*.08,5,3.5,0,0,7);ctx.fill()}
 ctx.restore();
}
function simple(r,now,me,running,hurt){
 const c=r.char,s=me?1.35:1.12,w=76*s,h=(c.type==='apt'?105:72)*s,stride=running&&!hurt?Math.sin(r.phase):0,ang=hurt?fall(r,now):Math.min(.14,r.vel/62);
 ctx.save();ctx.rotate(ang);ctx.fillStyle='rgba(0,0,0,.24)';ctx.beginPath();ctx.ellipse(0,h*.55,w*.54,10,0,0,7);ctx.fill();
 ctx.strokeStyle=c.type==='safe'?'#8d96a1':c.type==='brown'?'#683820':c.type==='brick'?'#973b2e':'#e7d8c2';ctx.lineWidth=13;ctx.lineCap='round';
 for(const [sx,sgn] of [[-1,-1],[1,1]]){ctx.beginPath();ctx.moveTo(sx*w*.22,h*.35);ctx.lineTo(sx*w*.22+sgn*stride*9,h*.53);ctx.stroke();ctx.beginPath();ctx.moveTo(sx*w*.5,0);ctx.lineTo(sx*w*.5-sgn*stride*12,12);ctx.stroke()}
 ctx.fillStyle=c.c;rr(-w/2,-h/2,w,h,16);ctx.fill();detail(c,w,h);face(hurt,w,h);ctx.restore();
}
function detail(c,w,h){
 if(c.type==='brick'){ctx.strokeStyle='#8d3428';ctx.lineWidth=3;for(let y=-h*.25;y<h*.3;y+=18){ctx.beginPath();ctx.moveTo(-w/2+6,y);ctx.lineTo(w/2-6,y);ctx.stroke()}}
 else if(c.type==='safe'){ctx.strokeStyle='#2d333b';ctx.lineWidth=4;ctx.beginPath();ctx.arc(0,9,17,0,7);ctx.stroke();ctx.fillStyle='#d0a451';ctx.beginPath();ctx.arc(0,9,5,0,7);ctx.fill()}
 else if(c.type==='apt'){ctx.fillStyle='#62b9e7';for(let y=-h*.32;y<h*.18;y+=21)for(let x=-w*.25;x<w*.3;x+=19)ctx.fillRect(x-4,y,9,11);ctx.fillStyle='#315f61';ctx.fillRect(-10,h*.18,20,20)}
}
function face(hurt,w,h){
 if(hurt){ctx.strokeStyle='#17191d';ctx.lineWidth=4;for(const x of [-14,14]){ctx.beginPath();ctx.moveTo(x-5,-10);ctx.lineTo(x+5,0);ctx.moveTo(x+5,-10);ctx.lineTo(x-5,0);ctx.stroke()}return}
 for(const x of [-14,14]){ctx.fillStyle='#111';ctx.beginPath();ctx.ellipse(x,-6,7,9,0,0,7);ctx.fill();ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(x-2,-9,2,0,7);ctx.fill()}ctx.fillStyle='#391617';ctx.beginPath();ctx.arc(0,11,9,0,Math.PI);ctx.fill();
}
function particles(){
 for(const p of S.dust){ctx.globalAlpha=Math.max(0,p.life/.7);ctx.fillStyle=p.c;ctx.beginPath();ctx.arc(p.x,p.y,p.size,0,7);ctx.fill()}
 for(const p of S.confetti){ctx.save();ctx.globalAlpha=Math.max(0,p.life/2.4);ctx.translate(p.x,p.y);ctx.rotate(p.rot);ctx.fillStyle=p.c;ctx.fillRect(-5,-9,10,18);ctx.restore()}
 ctx.globalAlpha=1;
}
function speedLines(now){
 const v=S.runners[0]?.vel||0;if(v<7.7||S.phase!=='run')return;const alpha=Math.min(.52,(v-7.7)*.18);ctx.strokeStyle=`rgba(255,255,255,${alpha})`;ctx.lineWidth=3;
 for(let i=0;i<20;i++){const y=590+(i*29+now*.16)%510,x=80+(i*83)%880;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x-90-v*10,y);ctx.stroke()}
}
})();