(()=>{
'use strict';
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const canvas=$('#canvas'),ctx=canvas.getContext('2d');
const W=1280,H=720,START_X=130,FINISH_X=1160,WORLD_LEN=50;

const chars=[
{id:'sugar',name:'각설탕',c:'#f6efe0',w:64,h:64,detail:'sugar'},
{id:'brown',name:'흑설탕',c:'#8a4f2c',w:64,h:64,detail:'brown'},
{id:'brick',name:'벽돌',c:'#c85539',w:76,h:54,detail:'brick'},
{id:'safe',name:'금고',c:'#6f7783',w:66,h:66,detail:'safe'},
{id:'apt',name:'아파트',c:'#e5d3b5',w:58,h:88,detail:'apt'},
{id:'salt',name:'소금',c:'#dff6ff',w:62,h:62,detail:'salt'},
{id:'tofu',name:'두부',c:'#ffe6ad',w:68,h:54,detail:'tofu'},
{id:'box',name:'택배상자',c:'#bc8750',w:68,h:60,detail:'box'},
{id:'gold',name:'금괴',c:'#e9bd31',w:76,h:48,detail:'gold'}
];
const diffs={
 easy:{label:'느긋',subtitle:'AI가 꽤 자주 삐끗',base:7.15,var:.55,stumble:.18,recover:.82},
 normal:{label:'보통',subtitle:'첫 플레이 추천',base:7.75,var:.45,stumble:.11,recover:.68},
 hard:{label:'빡셈',subtitle:'리듬 놓치면 추월',base:8.25,var:.35,stumble:.065,recover:.58},
 hell:{label:'악마',subtitle:'거의 안 봐준다',base:8.75,var:.26,stumble:.035,recover:.48}
};
const S={diff:'normal',char:'sugar',sound:true,phase:'home',raf:0,lastFrame:0,goAt:0,lastFoot:null,combo:0,speed:0,stumbleUntil:0,runners:[],particles:[],shake:0,flash:0,resultTimer:0,best:null};
let audio=null;

function snd(freq=440,d=.05,type='square',vol=.025){if(!S.sound)return;try{audio=audio||new(window.AudioContext||window.webkitAudioContext)();const o=audio.createOscillator(),g=audio.createGain();o.type=type;o.frequency.value=freq;g.gain.value=vol;o.connect(g);g.connect(audio.destination);o.start();g.gain.exponentialRampToValueAtTime(.0001,audio.currentTime+d);o.stop(audio.currentTime+d)}catch(e){}}
function kick(){snd(150,.035,'triangle',.018)}
function vibrate(p){if(navigator.vibrate)navigator.vibrate(p)}
function message(t,ms=650){const e=$('#msg');e.textContent=t;e.classList.add('show');clearTimeout(e._t);e._t=setTimeout(()=>e.classList.remove('show'),ms)}
function quote(id){return {sugar:'달지만 승부는 쓰다',brown:'진하게, 끝까지 간다',brick:'대화보다 돌진',safe:'무뚝뚝한 허당',apt:'관리비 걸고 뛴다',salt:'지는 건 짜다',tofu:'말랑하지만 진심',box:'배송보다 빠르게',gold:'몸값부터 다름'}[id]||'네모 선수'}
function renderHome(){
 $('#difficulty').innerHTML=Object.entries(diffs).map(([k,d])=>`<button class="${S.diff===k?'sel':''}" data-d="${k}"><strong>${d.label}</strong><small>${d.subtitle}</small></button>`).join('');
 $$('#difficulty button').forEach(b=>b.onclick=()=>{S.diff=b.dataset.d;renderHome()});
 $('#chars').innerHTML=chars.map(c=>`<button class="charCard ${S.char===c.id?'sel':''}" data-c="${c.id}"><div class="charPreview"><i class="miniNemo" style="background:${c.c};width:${Math.max(46,c.w*.72)}px;height:${Math.max(42,c.h*.66)}px"></i></div><b>${c.name}</b><small>${quote(c.id)}</small></button>`).join('');
 $$('#chars .charCard').forEach(b=>b.onclick=()=>{S.char=b.dataset.c;renderHome()});
}
renderHome();
$('#sound').onclick=()=>{S.sound=!S.sound;$('#sound').textContent=S.sound?'🔊':'🔇'};
$('#startBtn').onclick=startRace;$('#retry').onclick=startRace;$('#homeBtn').onclick=goHome;$('#back').onclick=goHome;
function goHome(){stop();$('#result').hidden=true;$('#game').hidden=true;$('#home').hidden=false;S.phase='home'}
function stop(){if(S.raf)cancelAnimationFrame(S.raf);S.raf=0;clearTimeout(S.resultTimer)}

function startRace(){
 stop();$('#result').hidden=true;$('#home').hidden=true;$('#game').hidden=false;
 S.phase='count';S.lastFoot=null;S.combo=0;S.speed=0;S.stumbleUntil=0;S.particles=[];S.shake=0;S.flash=0;S.lastFrame=performance.now();
 try{S.best=parseFloat(localStorage.getItem('nemo50best_'+S.diff)||'0')||null}catch(e){S.best=null}
 const me=chars.find(c=>c.id===S.char),others=chars.filter(c=>c.id!==S.char).sort(()=>Math.random()-.5).slice(0,3),names=['나','민수','지현','철수'];
 S.runners=[me,...others].map((c,i)=>({char:c,name:names[i],y:310+i*100,dist:0,vel:0,target:i===0?0:(diffs[S.diff].base+(Math.random()-.5)*diffs[S.diff].var),finish:null,stumble:0,hurtStart:0,stepPhase:Math.random()*Math.PI*2,emotion:'normal'}));
 $('#round').textContent=`AI ${diffs[S.diff].label} · PLAYTEST 0.7.2`;$('#timer').textContent='3';updateHud();paintNext(null);message('3',500);snd(430,.07);draw(performance.now());
 let c=3;const tick=()=>{c--;if(c>0){$('#timer').textContent=c;message(String(c),480);snd(430,.07);setTimeout(tick,650)}else{S.phase='run';S.goAt=performance.now();$('#timer').textContent='GO!';message('GO! 🔥',650);snd(920,.1);vibrate(35);paintNext('L');S.lastFrame=performance.now();S.raf=requestAnimationFrame(loop)}};setTimeout(tick,650);
}
function paintNext(n){$('#left').classList.toggle('next',n==='L');$('#right').classList.toggle('next',n==='R');const locked=S.phase!=='run'||performance.now()<S.stumbleUntil;$('#left').disabled=locked;$('#right').disabled=locked;$('#left').classList.toggle('locked',locked);$('#right').classList.toggle('locked',locked)}
$('#left').onclick=()=>step('L');$('#right').onclick=()=>step('R');
function step(f){if(S.phase!=='run'||performance.now()<S.stumbleUntil)return;const me=S.runners[0];if(S.lastFoot===f){stumblePlayer();return}S.lastFoot=f;S.combo++;const rhythmBonus=Math.min(1.8,S.combo*.055);S.speed=Math.min(10.6,S.speed+1.25+rhythmBonus*.25);me.vel=Math.max(me.vel,S.speed);paintNext(f==='L'?'R':'L');kick();spawnTrail(me,true);if(S.combo===10)message('10 COMBO! ⚡',500);if(S.combo===20)message('20 COMBO! 🔥',500);if(S.speed>9.8&&S.combo%7===0)message('MAX SPEED!',350);updateHud()}
function stumblePlayer(){const me=S.runners[0];const now=performance.now();S.combo=0;S.speed*=.44;me.vel*=.42;S.stumbleUntil=now+650;me.stumble=S.stumbleUntil;me.hurtStart=now;me.emotion='hurt';S.lastFoot=null;S.shake=10;message('발 꼬임! 🤦',750);snd(120,.14,'sawtooth',.04);vibrate([45,35,70]);paintNext(null);spawnTrail(me,true,true);setTimeout(()=>{if(S.phase==='run'){me.emotion='normal';paintNext('L')}},650);updateHud()}
function updateHud(){const me=S.runners[0];$('#combo').textContent=S.combo;const sp=Math.round(Math.min(100,S.speed/10.6*100));$('#speed').textContent=sp+'%';$('#speedBar').style.width=sp+'%';const m=Math.min(50,me?me.dist:0);$('#progressBar').style.width=(m/50*100)+'%';$('#progressText').textContent=m.toFixed(1)+'m / 50m';const order=[...S.runners].sort((a,b)=>b.dist-a.dist);$('#rankBadge').textContent=(order.findIndex(r=>r===me)+1)+'위'}
function loop(now){if(!['run','coast'].includes(S.phase))return;const dt=Math.min(.032,(now-S.lastFrame)/1000||.016);S.lastFrame=now;updatePhysics(dt,now);draw(now);S.raf=requestAnimationFrame(loop)}
function updatePhysics(dt,now){
 const me=S.runners[0];if(S.phase==='run'){
  const recovering=now<S.stumbleUntil;if(!recovering){S.speed=Math.max(3.05,S.speed-1.15*dt);me.vel+=(S.speed-me.vel)*Math.min(1,4.8*dt)}else me.vel=Math.max(0,me.vel-6.5*dt);
  me.dist+=me.vel*dt;me.stepPhase+=me.vel*dt*2.2;
 }
 const d=diffs[S.diff];for(let i=1;i<S.runners.length;i++){const r=S.runners[i];if(r.finish)continue;if(now<r.stumble){r.vel=Math.max(0,r.vel-7*dt);r.stepPhase+=dt*6;continue}if(S.phase==='run'&&Math.random()<d.stumble*dt*.42){r.stumble=now+d.recover*1000;r.hurtStart=now;r.emotion='hurt';r.vel*=.5;setTimeout(()=>{r.emotion='normal'},d.recover*1000)}const wobble=Math.sin(now*.0017+i*2.4)*.16;r.vel+=(r.target+wobble-r.vel)*Math.min(1,2.5*dt);r.dist+=r.vel*dt;r.stepPhase+=r.vel*dt*2.05;if(Math.random()<dt*4)spawnTrail(r,false)}
 S.runners.forEach((r,i)=>{if(!r.finish&&r.dist>=WORLD_LEN){r.dist=WORLD_LEN;r.finish=now;r.emotion=i===0?'win':'normal';snd(i===0?1050:700,.06,'square',i===0?.035:.012);if(i===0){S.phase='coast';S.flash=1;S.shake=6;$('#timer').textContent=((r.finish-S.goAt)/1000).toFixed(2)+'s';message('FINISH! 🏁',700);vibrate([30,20,70]);paintNext(null);clearTimeout(S.resultTimer);S.resultTimer=setTimeout(()=>finishRace(),2500)}}});
 if(S.phase==='coast'&&S.runners.every(r=>r.finish))finishRace();
 updateHud();updateParticles(dt);S.shake*=Math.pow(.03,dt);S.flash=Math.max(0,S.flash-dt*2.5)
}
function finishRace(){if(S.phase==='result')return;S.phase='result';stop();const sorted=[...S.runners].sort((a,b)=>(a.finish||Infinity)-(b.finish||Infinity));const me=S.runners[0];const t=(me.finish-S.goAt)/1000;if(!S.best||t<S.best){S.best=t;try{localStorage.setItem('nemo50best_'+S.diff,t.toFixed(3))}catch(e){}}const rank=sorted.indexOf(me)+1;$('#resultTitle').textContent=rank===1?'🏆 네모 스프린트 우승!':`${rank}위! 다음 판은 간다`;$('#record').textContent=t.toFixed(2)+'s';$('#rows').innerHTML=sorted.map((r,i)=>`<div class="row ${r===me?'me':''}"><span><strong>${i+1}위</strong> · ${r.name} (${r.char.name})</span><strong>${((r.finish-S.goAt)/1000).toFixed(2)}s</strong></div>`).join('');const top=sorted.slice(0,3),order=[top[1],top[0],top[2]].filter(Boolean);$('#podium').innerHTML=order.map((r,idx)=>{const place=idx===0?2:idx===1?1:3;return `<div class="pod p${place}"><div class="avatar" style="background:${r.char.c}">•ᴗ•</div><b>${r.name}</b><div class="block">${place}</div></div>`}).join('');$('#result').hidden=false;if(rank===1)confetti()}
function confetti(){for(let i=0;i<45;i++){const e=document.createElement('i');e.style.cssText=`position:fixed;z-index:60;left:${Math.random()*100}vw;top:-20px;width:8px;height:13px;background:hsl(${Math.random()*360} 90% 60%);animation:fall ${1.2+Math.random()*.8}s ease-in forwards;transform:rotate(${Math.random()*180}deg)`;document.body.appendChild(e);setTimeout(()=>e.remove(),2100)}if(!document.querySelector('#fallStyle')){const s=document.createElement('style');s.id='fallStyle';s.textContent='@keyframes fall{to{transform:translateY(110vh) rotate(720deg)}}';document.head.appendChild(s)}}

function particleColor(c){return c.detail==='sugar'?'#f4ead7':c.detail==='brown'?'#784224':c.detail==='brick'?'#a84631':c.detail==='safe'?'#c5ccd4':c.detail==='apt'?'#e8d9c0':'#dec49f'}
function spawnTrail(r,big,impact=false){if(S.particles.length>110)return;const count=impact?10:(big?4:1);for(let i=0;i<count;i++)S.particles.push({x:r.dist,y:r.y+40,life:.28+Math.random()*.32,size:(impact?5:3)+Math.random()*(impact?7:5),dx:-.7-Math.random()*1.6,dy:-8-Math.random()*20,color:particleColor(r.char),spark:r.char.detail==='safe'&&Math.random()>.55})}
function updateParticles(dt){for(const p of S.particles){p.life-=dt;p.x+=p.dx*dt;p.dy+=22*dt}S.particles=S.particles.filter(p=>p.life>0)}
function worldToScreen(dist){const me=S.runners[0];const worldX=START_X+(dist/WORLD_LEN)*(FINISH_X-START_X);const meWorld=START_X+(Math.min(me?.dist||0,45)/WORLD_LEN)*(FINISH_X-START_X);const desired=360;const cam=Math.max(0,Math.min(FINISH_X-920,meWorld-desired));return worldX-cam}

function draw(now){ctx.save();ctx.translate((Math.random()-.5)*S.shake,(Math.random()-.5)*S.shake);drawSky(now);drawStadium(now);drawTrack();drawFinish();for(let i=S.runners.length-1;i>=0;i--)drawRunner(S.runners[i],now,i===0);drawParticles();drawSpeedLines();ctx.restore();if(S.flash>0){ctx.fillStyle=`rgba(255,255,255,${S.flash*.45})`;ctx.fillRect(0,0,W,H)}if(S.phase==='count')drawCountdown()}
function drawSky(now){const g=ctx.createLinearGradient(0,0,0,260);g.addColorStop(0,'#67c8ff');g.addColorStop(1,'#b9ecff');ctx.fillStyle=g;ctx.fillRect(0,0,W,260);ctx.fillStyle='rgba(255,255,255,.75)';for(let i=0;i<7;i++){const x=((i*220-now*.006)%1500)-100,y=45+(i%3)*42;ctx.beginPath();ctx.ellipse(x,y,42,15,0,0,Math.PI*2);ctx.ellipse(x+35,y+4,32,12,0,0,Math.PI*2);ctx.fill()}}
function drawStadium(now){ctx.fillStyle='#263755';ctx.fillRect(0,180,W,120);ctx.fillStyle='#344969';ctx.fillRect(0,190,W,18);for(let x=5;x<W;x+=15){const cols=['#ffd84d','#ff6c6a','#5ee6ad','#fff','#8ea7ff'];ctx.fillStyle=cols[(x/15|0)%cols.length];ctx.beginPath();ctx.arc(x+(x%7),230+Math.sin(x*.1+now*.003)*6,3.2,0,Math.PI*2);ctx.fill()}ctx.fillStyle='#f2d7a6';ctx.fillRect(0,294,W,14);for(let x=60;x<W;x+=190){ctx.fillStyle='#111827';ctx.fillRect(x,160,125,38);ctx.fillStyle='#ffd84d';ctx.font='900 17px system-ui';ctx.textAlign='center';ctx.fillText(['NEMO!','GO! GO!','50M','RUN!'][(x/190|0)%4],x+62,185)}}
function drawTrack(){ctx.fillStyle='#bf5b3e';ctx.fillRect(0,308,W,412);for(let i=0;i<5;i++){const y=320+i*94;ctx.strokeStyle='rgba(255,255,255,.42)';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke()}for(let m=0;m<=50;m+=5){const x=worldToScreen(m);if(x<-40||x>W+40)continue;ctx.strokeStyle='rgba(255,255,255,.18)';ctx.beginPath();ctx.moveTo(x,308);ctx.lineTo(x,720);ctx.stroke();ctx.fillStyle='rgba(255,255,255,.65)';ctx.font='800 12px system-ui';ctx.fillText(m+'m',x+4,332)}}
function drawFinish(){const x=worldToScreen(50);if(x<-30||x>W+40)return;for(let y=308;y<720;y+=18){ctx.fillStyle=((y/18)|0)%2?'#fff':'#151923';ctx.fillRect(x-8,y,16,18)}ctx.fillStyle='#fff';ctx.font='1000 19px system-ui';ctx.textAlign='center';ctx.fillText('FINISH',x,292);ctx.textAlign='left'}

function rr(c,x,y,w,h,r){c.beginPath();if(c.roundRect)c.roundRect(x,y,w,h,r);else c.rect(x,y,w,h)}
function capsule(x1,y1,x2,y2,width,color){ctx.strokeStyle=color;ctx.lineWidth=width;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke()}
function ellipse(x,y,rx,ry,color){ctx.fillStyle=color;ctx.beginPath();ctx.ellipse(x,y,rx,ry,0,0,Math.PI*2);ctx.fill()}
function drawSoftShadow(w,y=46){ctx.fillStyle='rgba(0,0,0,.24)';ctx.beginPath();ctx.ellipse(0,y,w*.62,9,0,0,Math.PI*2);ctx.fill()}
function bodyGradient(c,w,h){const g=ctx.createLinearGradient(-w/2,-h/2,w/2,h/2);if(c.detail==='safe'){g.addColorStop(0,'#aeb5bd');g.addColorStop(.45,c.c);g.addColorStop(1,'#414852')}else if(c.detail==='gold'){g.addColorStop(0,'#ffe676');g.addColorStop(.55,c.c);g.addColorStop(1,'#a76f00')}else if(c.detail==='brown'){g.addColorStop(0,'#b97446');g.addColorStop(.52,c.c);g.addColorStop(1,'#59301d')}else if(c.detail==='brick'){g.addColorStop(0,'#e77855');g.addColorStop(.5,c.c);g.addColorStop(1,'#8e3528')}else if(c.detail==='apt'){g.addColorStop(0,'#fff0d4');g.addColorStop(.55,c.c);g.addColorStop(1,'#bca98c')}else{g.addColorStop(0,'#fffdf6');g.addColorStop(.55,c.c);g.addColorStop(1,'#d6c8b3')}return g}
function drawRunner(r,now,isMe){
 const x=worldToScreen(r.dist),c=r.char;const running=['run','coast'].includes(S.phase)&&!r.finish;const hurt=(r===S.runners[0]?now<S.stumbleUntil:now<r.stumble)||r.emotion==='hurt';const phase=r.stepPhase;const bounce=running&&!hurt?Math.abs(Math.sin(phase))*4:0;let lean=running?Math.min(.13,r.vel/70):0;let fall=0;if(hurt){const t=Math.max(0,Math.min(1,(now-(r.hurtStart||now))/280));fall=.82*t;lean=fall}
 ctx.save();ctx.translate(x,r.y+bounce);
 if(isMe){ctx.fillStyle='rgba(255,216,77,.19)';ctx.beginPath();ctx.arc(0,12,50+Math.sin(now*.008)*4,0,Math.PI*2);ctx.fill()}
 ctx.rotate(lean);drawSoftShadow(c.w);
 const stride=running&&!hurt?Math.sin(phase):0;drawParts(c,stride,hurt,r,now);ctx.rotate(-lean);
 ctx.fillStyle=isMe?'#ffd84d':'#fff';rr(ctx,-35,-c.h/2-38,70,21,9);ctx.fill();ctx.fillStyle='#121826';ctx.font='900 12px system-ui';ctx.textAlign='center';ctx.fillText(r.name,0,-c.h/2-23);ctx.restore();ctx.textAlign='left'
}
function drawParts(c,stride,hurt,r,now){
 const w=c.w,h=c.h,skin=c.detail==='safe'?'#8c949e':c.detail==='brown'?'#6b3a24':c.detail==='brick'?'#9c3e2f':'#efe3cf';
 const legY=h*.36,legSwing=hurt?0:stride*7,armSwing=hurt?0:stride*10;
 capsule(-w*.22,legY,-w*.22-legSwing*.35,legY+11,10,skin);ellipse(-w*.22-legSwing*.45,legY+16,9,5.5,skin);
 capsule(w*.22,legY,w*.22+legSwing*.35,legY+11,10,skin);ellipse(w*.22+legSwing*.45,legY+16,9,5.5,skin);
 capsule(-w*.48,-h*.02,-w*.48-armSwing*.35,6+armSwing*.18,12,skin);ellipse(-w*.50-armSwing*.38,8+armSwing*.18,7,7,skin);
 capsule(w*.48,-h*.02,w*.48+armSwing*.35,6-armSwing*.18,12,skin);ellipse(w*.50+armSwing*.38,8-armSwing*.18,7,7,skin);
 ctx.fillStyle=bodyGradient(c,w,h);rr(ctx,-w/2,-h/2,w,h,Math.min(14,h*.24));ctx.fill();ctx.strokeStyle='rgba(255,255,255,.46)';ctx.lineWidth=2.5;ctx.stroke();
 drawDetail(c,w,h);drawFace(c,hurt,r,now,w,h)
}
function drawDetail(c,w,h){ctx.save();
 if(c.detail==='sugar'||c.detail==='salt'){ctx.fillStyle='rgba(255,255,255,.8)';for(let i=0;i<12;i++){const x=-w*.36+((i*17)%Math.max(1,w*.7)),y=-h*.34+((i*23)%Math.max(1,h*.66));ctx.beginPath();ctx.arc(x,y,1.1+(i%3)*.35,0,Math.PI*2);ctx.fill()}}
 else if(c.detail==='brown'){ctx.fillStyle='rgba(255,224,183,.30)';for(let i=0;i<13;i++){const x=-w*.36+((i*19)%Math.max(1,w*.7)),y=-h*.34+((i*29)%Math.max(1,h*.66));ctx.beginPath();ctx.arc(x,y,1.2+(i%3)*.35,0,Math.PI*2);ctx.fill()}}
 else if(c.detail==='brick'){ctx.strokeStyle='#8f362a';ctx.lineWidth=2;for(let y=-h*.28;y<h*.3;y+=16){ctx.beginPath();ctx.moveTo(-w/2+5,y);ctx.lineTo(w/2-5,y);ctx.stroke()}ctx.fillStyle='#8f362a';for(let x=-w*.28;x<w*.3;x+=22){rr(ctx,x,-h/2+5,11,5,2);ctx.fill()}}
 else if(c.detail==='safe'){ctx.strokeStyle='#333b45';ctx.lineWidth=2.5;rr(ctx,-w/2+5,-h/2+5,w-10,h-10,8);ctx.stroke();ctx.strokeStyle='#d0a451';ctx.lineWidth=2;ctx.beginPath();ctx.arc(0,8,14,0,Math.PI*2);ctx.stroke();for(let a=0;a<Math.PI*2;a+=Math.PI/4){ctx.beginPath();ctx.moveTo(Math.cos(a)*8,8+Math.sin(a)*8);ctx.lineTo(Math.cos(a)*15,8+Math.sin(a)*15);ctx.stroke()}ctx.fillStyle='#d0a451';ctx.beginPath();ctx.arc(0,8,4,0,Math.PI*2);ctx.fill()}
 else if(c.detail==='apt'){ctx.fillStyle='#315f82';rr(ctx,-w/2,-h/2,w,7,4);ctx.fill();ctx.fillStyle='#66b8e8';for(let yy=-h*.32;yy<h*.20;yy+=19)for(let xx=-w*.28;xx<w*.3;xx+=18){rr(ctx,xx-4,yy,8,10,1);ctx.fill()}ctx.fillStyle='#2d5f61';rr(ctx,-9,h*.18,18,18,2);ctx.fill();ctx.fillStyle='#f4c65d';for(let yy=-h*.32;yy<h*.20;yy+=38){rr(ctx,w*.12,yy,7,9,1);ctx.fill()}}
 else if(c.detail==='box'){ctx.fillStyle='#e9c58c';ctx.fillRect(-6,-h/2,12,h);ctx.strokeStyle='#765332';ctx.strokeRect(-w/2+5,-h/2+5,w-10,h-10)}
 else if(c.detail==='gold'){ctx.fillStyle='rgba(255,255,255,.45)';ctx.beginPath();ctx.moveTo(-w*.33,-h*.28);ctx.lineTo(w*.05,-h*.28);ctx.lineTo(-w*.12,h*.1);ctx.lineTo(-w*.38,h*.1);ctx.closePath();ctx.fill()}
 else if(c.detail==='tofu'){ctx.fillStyle='rgba(196,157,104,.25)';for(let i=0;i<6;i++){ctx.beginPath();ctx.arc(-w*.3+i*10,-h*.25+(i%2)*16,1.7,0,Math.PI*2);ctx.fill()}}
 ctx.restore()}
function drawFace(c,hurt,r,now,w,h){
 const eyeY=c.detail==='apt'?-4:-5,eyeX=c.detail==='safe'?14:13;
 if(hurt){ctx.strokeStyle='#17191d';ctx.lineWidth=3.5;ctx.lineCap='round';for(const sx of [-1,1]){ctx.beginPath();ctx.moveTo(sx*eyeX-4,eyeY-4);ctx.lineTo(sx*eyeX+4,eyeY+4);ctx.moveTo(sx*eyeX+4,eyeY-4);ctx.lineTo(sx*eyeX-4,eyeY+4);ctx.stroke()}ctx.fillStyle='#a92626';ctx.beginPath();ctx.ellipse(0,12,8,5,0,0,Math.PI*2);ctx.fill();return}
 const win=r.finish&&r===S.runners[0];
 if(win){ctx.strokeStyle='#17191d';ctx.lineWidth=3;for(const sx of [-1,1]){ctx.beginPath();ctx.arc(sx*eyeX,eyeY+1,6,0,Math.PI);ctx.stroke()}}
 else{for(const sx of [-1,1]){const gx=ctx.createRadialGradient(sx*eyeX-2,eyeY-4,1,sx*eyeX,eyeY,7);gx.addColorStop(0,'#fff');gx.addColorStop(.24,'#252a31');gx.addColorStop(1,'#0b0c10');ctx.fillStyle=gx;ctx.beginPath();ctx.ellipse(sx*eyeX,eyeY,6.5,8,0,0,Math.PI*2);ctx.fill();ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(sx*eyeX-2,eyeY-3,1.7,0,Math.PI*2);ctx.fill()}}
 ctx.strokeStyle='#27211d';ctx.lineWidth=3;ctx.lineCap='round';if(c.detail==='brick'||c.detail==='brown'){ctx.beginPath();ctx.moveTo(-20,eyeY-13);ctx.lineTo(-9,eyeY-10);ctx.moveTo(20,eyeY-13);ctx.lineTo(9,eyeY-10);ctx.stroke()}else if(c.detail==='safe'){ctx.globalAlpha=.75;ctx.beginPath();ctx.moveTo(-20,eyeY-11);ctx.lineTo(-9,eyeY-11);ctx.moveTo(20,eyeY-11);ctx.lineTo(9,eyeY-11);ctx.stroke();ctx.globalAlpha=1}
 ellipse(-w*.27,8,4.5,3,'rgba(255,116,116,.78)');ellipse(w*.27,8,4.5,3,'rgba(255,116,116,.78)');
 ctx.fillStyle='#321515';ctx.beginPath();ctx.arc(0,10,7,0,Math.PI);ctx.fill();ctx.fillStyle='#ef6c68';ctx.beginPath();ctx.ellipse(0,14,4,2,0,0,Math.PI*2);ctx.fill()
}
function drawParticles(){for(const p of S.particles){const x=worldToScreen(p.x),a=Math.max(0,p.life/.6);ctx.globalAlpha=a;if(p.spark){ctx.fillStyle='#fff8b8';ctx.save();ctx.translate(x,p.y+p.dy*(.6-p.life));ctx.rotate(Math.PI/4);ctx.fillRect(-p.size*.5,-1,p.size,2);ctx.fillRect(-1,-p.size*.5,2,p.size);ctx.restore()}else{ctx.fillStyle=p.color;ctx.beginPath();ctx.arc(x,p.y+p.dy*(.6-p.life),p.size*(1.25-a*.25),0,Math.PI*2);ctx.fill()}ctx.globalAlpha=1}}
function drawSpeedLines(){if(S.runners[0].vel<8.5||S.phase!=='run')return;ctx.strokeStyle='rgba(255,255,255,.27)';ctx.lineWidth=2;for(let i=0;i<12;i++){const y=340+(i*31+performance.now()*.09)%330,x=90+(i*97)%800;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x-60-S.speed*7,y);ctx.stroke()}}
function drawCountdown(){ctx.fillStyle='rgba(6,10,18,.28)';ctx.fillRect(0,0,W,H)}
})();
