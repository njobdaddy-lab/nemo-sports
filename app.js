(()=>{
'use strict';
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const canvas=$('#canvas'),ctx=canvas.getContext('2d');
const W=1280,H=720,START_X=130,FINISH_X=1160,WORLD_LEN=50;
const chars=[
{id:'sugar',name:'각설탕',c:'#f4edcf',w:56,h:56,detail:'sugar'},
{id:'brown',name:'흑설탕',c:'#8b5732',w:56,h:56,detail:'brown'},
{id:'salt',name:'소금',c:'#daf4ff',w:56,h:56,detail:'salt'},
{id:'tofu',name:'두부',c:'#ffe8ae',w:64,h:52,detail:'tofu'},
{id:'brick',name:'벽돌',c:'#b9513a',w:72,h:50,detail:'brick'},
{id:'box',name:'택배상자',c:'#b9854d',w:64,h:58,detail:'box'},
{id:'apt',name:'아파트',c:'#b7a07d',w:52,h:84,detail:'apt'},
{id:'gold',name:'금괴',c:'#e8bd31',w:72,h:46,detail:'gold'},
{id:'safe',name:'금고',c:'#707987',w:62,h:62,detail:'safe'}
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
function renderHome(){
 $('#difficulty').innerHTML=Object.entries(diffs).map(([k,d])=>`<button class="${S.diff===k?'sel':''}" data-d="${k}"><strong>${d.label}</strong><small>${d.subtitle}</small></button>`).join('');
 $$('#difficulty button').forEach(b=>b.onclick=()=>{S.diff=b.dataset.d;renderHome()});
 $('#chars').innerHTML=chars.map(c=>`<button class="charCard ${S.char===c.id?'sel':''}" data-c="${c.id}"><div class="charPreview"><i class="miniNemo" style="background:${c.c};width:${Math.max(46,c.w*.78)}px;height:${Math.max(42,c.h*.72)}px"></i></div><b>${c.name}</b><small>${quote(c.id)}</small></button>`).join('');
 $$('#chars .charCard').forEach(b=>b.onclick=()=>{S.char=b.dataset.c;renderHome()});
}
function quote(id){return {sugar:'달지만 승부는 쓰다',brown:'묵직하게 간다',salt:'지는 건 짜다',tofu:'부서져도 달린다',brick:'대화보다 돌진',box:'배송보다 빠르게',apt:'관리비 걸고 뛴다',gold:'몸값부터 다름',safe:'마음은 잠금'}[id]||'네모 선수'}
renderHome();
$('#sound').onclick=()=>{S.sound=!S.sound;$('#sound').textContent=S.sound?'🔊':'🔇'};
$('#startBtn').onclick=startRace;$('#retry').onclick=startRace;$('#homeBtn').onclick=goHome;$('#back').onclick=goHome;
function goHome(){stop();$('#result').hidden=true;$('#game').hidden=true;$('#home').hidden=false;S.phase='home'}
function stop(){if(S.raf)cancelAnimationFrame(S.raf);S.raf=0;clearTimeout(S.resultTimer)}
function startRace(){
 stop();$('#result').hidden=true;$('#home').hidden=true;$('#game').hidden=false;
 S.phase='count';S.lastFoot=null;S.combo=0;S.speed=0;S.stumbleUntil=0;S.particles=[];S.shake=0;S.flash=0;S.lastFrame=performance.now();try{S.best=parseFloat(localStorage.getItem('nemo50best_'+S.diff)||'0')||null}catch(e){S.best=null;}
 const me=chars.find(c=>c.id===S.char),others=chars.filter(c=>c.id!==S.char).sort(()=>Math.random()-.5).slice(0,3),names=['나','민수','지현','철수'];
 const roster=[me,...others];
 S.runners=roster.map((c,i)=>({char:c,name:names[i],x:START_X,y:310+i*100,dist:0,vel:0,target:i===0?0:(diffs[S.diff].base+(Math.random()-.5)*diffs[S.diff].var),finish:null,stumble:0,stumbleAngle:0,stepPhase:Math.random()*Math.PI*2,emotion:'normal',place:4}));
 $('#round').textContent=`AI ${diffs[S.diff].label} · PLAYTEST 0.7`;$('#timer').textContent='3';updateHud();paintNext(null);message('3',500);snd(430,.07);draw(performance.now());
 let c=3;const tick=()=>{c--;if(c>0){$('#timer').textContent=c;message(String(c),480);snd(430,.07);setTimeout(tick,650)}else{S.phase='run';S.goAt=performance.now();$('#timer').textContent='GO!';message('GO! 🔥',650);snd(920,.1);vibrate(35);paintNext('L');S.lastFrame=performance.now();S.raf=requestAnimationFrame(loop)}};setTimeout(tick,650);
}
function paintNext(n){$('#left').classList.toggle('next',n==='L');$('#right').classList.toggle('next',n==='R');const locked=S.phase!=='run'||performance.now()<S.stumbleUntil;$('#left').disabled=locked;$('#right').disabled=locked;$('#left').classList.toggle('locked',locked);$('#right').classList.toggle('locked',locked)}
$('#left').onclick=()=>step('L');$('#right').onclick=()=>step('R');
function step(f){if(S.phase!=='run'||performance.now()<S.stumbleUntil)return;const me=S.runners[0];if(S.lastFoot===f){stumblePlayer();return}S.lastFoot=f;S.combo++;const rhythmBonus=Math.min(1.8,S.combo*.055);S.speed=Math.min(10.6,S.speed+1.25+rhythmBonus*.25);me.vel=Math.max(me.vel,S.speed);paintNext(f==='L'?'R':'L');kick();spawnDust(me,true);if(S.combo===10)message('10 COMBO! ⚡',500);if(S.combo===20)message('20 COMBO! 🔥',500);if(S.speed>9.8&&S.combo%7===0)message('MAX SPEED!',350);updateHud()}
function stumblePlayer(){const me=S.runners[0];S.combo=0;S.speed*=.44;me.vel*=.42;S.stumbleUntil=performance.now()+620;me.stumble=1;me.emotion='hurt';S.lastFoot=null;S.shake=10;message('발 꼬임! 🤦',750);snd(120,.14,'sawtooth',.04);vibrate([45,35,70]);paintNext(null);setTimeout(()=>{if(S.phase==='run'){me.stumble=0;me.emotion='normal';paintNext('L')}},620);updateHud()}
function updateHud(){const me=S.runners[0];$('#combo').textContent=S.combo;const sp=Math.round(Math.min(100,S.speed/10.6*100));$('#speed').textContent=sp+'%';$('#speedBar').style.width=sp+'%';const m=Math.min(50,me?me.dist:0);$('#progressBar').style.width=(m/50*100)+'%';$('#progressText').textContent=m.toFixed(1)+'m / 50m';const order=[...S.runners].sort((a,b)=>b.dist-a.dist);const rank=order.findIndex(r=>r===me)+1;$('#rankBadge').textContent=rank+'위'}
function loop(now){if(!['run','coast'].includes(S.phase))return;const dt=Math.min(.032,(now-S.lastFrame)/1000||.016);S.lastFrame=now;updatePhysics(dt,now);draw(now);S.raf=requestAnimationFrame(loop)}
function updatePhysics(dt,now){
 const me=S.runners[0];if(S.phase==='run'){
   const recovering=now<S.stumbleUntil;if(!recovering){S.speed=Math.max(3.05,S.speed-1.15*dt);me.vel+=(S.speed-me.vel)*Math.min(1,4.8*dt)}else me.vel=Math.max(0,me.vel-6.5*dt);
   me.dist+=me.vel*dt;me.stepPhase+=me.vel*dt*2.2;
 }
 const d=diffs[S.diff];for(let i=1;i<S.runners.length;i++){const r=S.runners[i];if(r.finish)continue;if(now<r.stumble) {r.vel=Math.max(0,r.vel-7*dt);r.stepPhase+=dt*6;continue;}if(S.phase==='run'&&Math.random()<d.stumble*dt*.42){r.stumble=now+d.recover*1000;r.emotion='hurt';r.vel*=.5;setTimeout(()=>{r.emotion='normal'},d.recover*1000)}const wobble=Math.sin(now*.0017+i*2.4)*.16;r.vel+=(r.target+wobble-r.vel)*Math.min(1,2.5*dt);r.dist+=r.vel*dt;r.stepPhase+=r.vel*dt*2.05;if(Math.random()<dt*5)spawnDust(r,false)}
 S.runners.forEach((r,i)=>{if(!r.finish&&r.dist>=WORLD_LEN){r.dist=WORLD_LEN;r.finish=now;r.emotion=i===0?'win':'normal';snd(i===0?1050:700,.06,'square',i===0?.035:.012);if(i===0){S.phase='coast';S.flash=1;S.shake=6;$('#timer').textContent=((r.finish-S.goAt)/1000).toFixed(2)+'s';message('FINISH! 🏁',700);vibrate([30,20,70]);paintNext(null);clearTimeout(S.resultTimer);S.resultTimer=setTimeout(()=>finishRace(),2600)}}});
 if(S.phase==='coast'&&S.runners.every(r=>r.finish))finishRace();
 updateHud();updateParticles(dt);S.shake*=Math.pow(.03,dt);S.flash=Math.max(0,S.flash-dt*2.5)
}
function finishRace(){if(S.phase==='result')return;S.phase='result';stop();const sorted=[...S.runners].sort((a,b)=>(a.finish||Infinity)-(b.finish||Infinity));const me=S.runners[0];const t=(me.finish-S.goAt)/1000;if(!S.best||t<S.best){S.best=t;try{localStorage.setItem('nemo50best_'+S.diff,t.toFixed(3))}catch(e){}}const rank=sorted.indexOf(me)+1;$('#resultTitle').textContent=rank===1?'🏆 네모 스프린트 우승!':`${rank}위! 다음 판은 간다`;$('#record').textContent=t.toFixed(2)+'s';$('#rows').innerHTML=sorted.map((r,i)=>`<div class="row ${r===me?'me':''}"><span><strong>${i+1}위</strong> · ${r.name} (${r.char.name})</span><strong>${((r.finish-S.goAt)/1000).toFixed(2)}s</strong></div>`).join('');const top=sorted.slice(0,3),order=[top[1],top[0],top[2]].filter(Boolean);$('#podium').innerHTML=order.map((r,idx)=>{const place=idx===0?2:idx===1?1:3;return `<div class="pod p${place}"><div class="avatar" style="background:${r.char.c}">•ᴗ•</div><b>${r.name}</b><div class="block">${place}</div></div>`}).join('');$('#result').hidden=false;if(rank===1)confetti()}
function confetti(){for(let i=0;i<45;i++){const e=document.createElement('i');e.style.cssText=`position:fixed;z-index:60;left:${Math.random()*100}vw;top:-20px;width:8px;height:13px;background:hsl(${Math.random()*360} 90% 60%);animation:fall ${1.2+Math.random()*.8}s ease-in forwards;transform:rotate(${Math.random()*180}deg)`;document.body.appendChild(e);setTimeout(()=>e.remove(),2100)}if(!document.querySelector('#fallStyle')){const s=document.createElement('style');s.id='fallStyle';s.textContent='@keyframes fall{to{transform:translateY(110vh) rotate(720deg)}}';document.head.appendChild(s)}}
function spawnDust(r,big){if(S.particles.length>90)return;const laneY=r.y+40;for(let i=0;i<(big?3:1);i++)S.particles.push({x:r.dist,y:laneY,life:.35+Math.random()*.25,size:(big?6:4)+Math.random()*6,dx:-.5-Math.random()*1.2,dy:-10-Math.random()*18})}
function updateParticles(dt){for(const p of S.particles){p.life-=dt;p.x+=p.dx*dt;p.dy+=22*dt}S.particles=S.particles.filter(p=>p.life>0)}
function worldToScreen(dist){const me=S.runners[0];const worldX=START_X+(dist/WORLD_LEN)*(FINISH_X-START_X);const meWorld=START_X+(Math.min(me?.dist||0,45)/WORLD_LEN)*(FINISH_X-START_X);const desired=360;const cam=Math.max(0,Math.min(FINISH_X-920,meWorld-desired));return worldX-cam}
function draw(now){ctx.save();const sx=(Math.random()-.5)*S.shake,sy=(Math.random()-.5)*S.shake;ctx.translate(sx,sy);drawSky(now);drawStadium(now);drawTrack(now);drawFinish();for(let i=S.runners.length-1;i>=0;i--)drawRunner(S.runners[i],now,i===0);drawParticles();drawSpeedLines();ctx.restore();if(S.flash>0){ctx.fillStyle=`rgba(255,255,255,${S.flash*.45})`;ctx.fillRect(0,0,W,H)}if(S.phase==='count'){drawCountdown()}}
function drawSky(now){const g=ctx.createLinearGradient(0,0,0,260);g.addColorStop(0,'#67c8ff');g.addColorStop(1,'#b9ecff');ctx.fillStyle=g;ctx.fillRect(0,0,W,260);ctx.fillStyle='rgba(255,255,255,.75)';for(let i=0;i<7;i++){const x=((i*220-now*.006)%1500)-100, y=45+(i%3)*42;ctx.beginPath();ctx.ellipse(x,y,42,15,0,0,Math.PI*2);ctx.ellipse(x+35,y+4,32,12,0,0,Math.PI*2);ctx.fill()}}
function drawStadium(now){ctx.fillStyle='#263755';ctx.fillRect(0,180,W,120);ctx.fillStyle='#344969';ctx.fillRect(0,190,W,18);for(let x=5;x<W;x+=15){const cols=['#ffd84d','#ff6c6a','#5ee6ad','#fff','#8ea7ff'];ctx.fillStyle=cols[(x/15|0)%cols.length];ctx.beginPath();ctx.arc(x+(x%7),230+Math.sin(x*.1+now*.003)*6,3.2,0,Math.PI*2);ctx.fill()}ctx.fillStyle='#f2d7a6';ctx.fillRect(0,294,W,14);for(let x=60;x<W;x+=190){ctx.fillStyle='#111827';ctx.fillRect(x,160,125,38);ctx.fillStyle='#ffd84d';ctx.font='900 17px system-ui';ctx.textAlign='center';ctx.fillText(['NEMO!','GO! GO!','50M','RUN!'][(x/190|0)%4],x+62,185)}}
function drawTrack(){ctx.fillStyle='#bf5b3e';ctx.fillRect(0,308,W,412);for(let i=0;i<5;i++){const y=320+i*94;ctx.strokeStyle='rgba(255,255,255,.42)';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke()}for(let m=0;m<=50;m+=5){const x=worldToScreen(m);if(x<-40||x>W+40)continue;ctx.strokeStyle='rgba(255,255,255,.18)';ctx.beginPath();ctx.moveTo(x,308);ctx.lineTo(x,720);ctx.stroke();ctx.fillStyle='rgba(255,255,255,.65)';ctx.font='800 12px system-ui';ctx.fillText(m+'m',x+4,332)}}
function drawFinish(){const x=worldToScreen(50);if(x<-30||x>W+40)return;for(let y=308;y<720;y+=18){ctx.fillStyle=((y/18)|0)%2?'#fff':'#151923';ctx.fillRect(x-8,y,16,18)}ctx.fillStyle='#fff';ctx.font='1000 19px system-ui';ctx.textAlign='center';ctx.fillText('FINISH',x,292);ctx.textAlign='left'}
function drawRunner(r,now,isMe){const x=worldToScreen(r.dist),y=r.y;const c=r.char;const running=['run','coast'].includes(S.phase)&&!r.finish;const hurt=(r===S.runners[0]?now<S.stumbleUntil:now<r.stumble)||r.emotion==='hurt';let phase=r.stepPhase;let bob=running?Math.abs(Math.sin(phase))*5:0;let lean=Math.min(.16,r.vel/60);if(hurt)lean=.85;ctx.save();ctx.translate(x,y+bob);ctx.rotate(lean);if(isMe){ctx.fillStyle='rgba(255,216,77,.20)';ctx.beginPath();ctx.arc(0,12,48+Math.sin(now*.008)*5,0,Math.PI*2);ctx.fill()}ctx.fillStyle='rgba(0,0,0,.25)';ctx.beginPath();ctx.ellipse(-6,47,c.w*.6,11,0,0,Math.PI*2);ctx.fill();const stride=running?Math.sin(phase)*28:0;drawLimb(-c.w*.25,c.h*.35,-stride*.5,c.h*.55,'#3b3030',9);drawLimb(c.w*.25,c.h*.35,stride*.5,c.h*.55,'#3b3030',9);drawLimb(-c.w*.55,0,stride*.45,8,c.c,8);drawLimb(c.w*.55,0,-stride*.45,8,c.c,8);ctx.fillStyle=c.c;roundRect(-c.w/2,-c.h/2,c.w,c.h,Math.min(12,c.h*.22));ctx.fill();ctx.strokeStyle='rgba(255,255,255,.42)';ctx.lineWidth=3;ctx.stroke();drawDetail(c);ctx.fillStyle='#20242d';ctx.textAlign='center';ctx.font='1000 19px Arial';ctx.fillText(hurt?'×﹏×':r.finish&&isMe?'⌐■ᴗ■':'•ᴗ•',0,7);ctx.textAlign='left';ctx.rotate(-lean);ctx.fillStyle=isMe?'#ffd84d':'#fff';roundRect(-34,-c.h/2-34,68,20,8);ctx.fill();ctx.fillStyle='#121826';ctx.font='900 12px system-ui';ctx.textAlign='center';ctx.fillText(r.name,0,-c.h/2-20);ctx.textAlign='left';ctx.restore()}
function drawLimb(x,y,dx,dy,color,w){ctx.strokeStyle=color;ctx.lineWidth=w;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+dx,y+dy);ctx.stroke()}
function drawDetail(c){ctx.save();ctx.globalAlpha=.65;if(c.detail==='brick'){ctx.strokeStyle='#7b3027';ctx.lineWidth=2;for(let y=-14;y<20;y+=15){ctx.beginPath();ctx.moveTo(-c.w/2+4,y);ctx.lineTo(c.w/2-4,y);ctx.stroke()}for(let x=-20;x<25;x+=22){ctx.beginPath();ctx.moveTo(x,-c.h/2+4);ctx.lineTo(x,c.h/2-4);ctx.stroke()}}else if(c.detail==='box'){ctx.fillStyle='#e5c088';ctx.fillRect(-6,-c.h/2,12,c.h);ctx.strokeStyle='#795832';ctx.strokeRect(-c.w/2+5,-c.h/2+5,c.w-10,c.h-10)}else if(c.detail==='apt'){ctx.fillStyle='#6a8290';for(let y=-27;y<28;y+=17)for(let x=-14;x<=14;x+=14)ctx.fillRect(x-4,y,8,9)}else if(c.detail==='gold'){const g=ctx.createLinearGradient(-c.w/2,0,c.w/2,0);g.addColorStop(0,'#b98100');g.addColorStop(.45,'#ffe96a');g.addColorStop(1,'#bd8700');ctx.fillStyle=g;roundRect(-c.w/2+4,-c.h/2+4,c.w-8,c.h-8,7);ctx.fill()}else if(c.detail==='safe'){ctx.strokeStyle='#29313b';ctx.lineWidth=3;ctx.beginPath();ctx.arc(0,1,15,0,Math.PI*2);ctx.stroke();for(let a=0;a<Math.PI*2;a+=Math.PI/2){ctx.beginPath();ctx.moveTo(Math.cos(a)*8,1+Math.sin(a)*8);ctx.lineTo(Math.cos(a)*17,1+Math.sin(a)*17);ctx.stroke()}}else if(c.detail==='sugar'||c.detail==='salt'){ctx.fillStyle='rgba(255,255,255,.75)';for(let i=0;i<6;i++){ctx.beginPath();ctx.arc(-20+i*8,-18+(i%2)*12,2,0,Math.PI*2);ctx.fill()}}ctx.restore()}
function roundRect(x,y,w,h,r){ctx.beginPath();ctx.roundRect(x,y,w,h,r)}
function drawParticles(){for(const p of S.particles){const x=worldToScreen(p.x),a=Math.max(0,p.life/.6);ctx.fillStyle=`rgba(230,198,163,${a*.55})`;ctx.beginPath();ctx.arc(x,p.y+p.dy*(.6-p.life),p.size*(1.3-a*.3),0,Math.PI*2);ctx.fill()}}
function drawSpeedLines(){if(S.runners[0].vel<8.5||S.phase!=='run')return;ctx.strokeStyle='rgba(255,255,255,.27)';ctx.lineWidth=2;for(let i=0;i<12;i++){const y=340+(i*31+performance.now()*.09)%330;const x=90+(i*97)%800;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x-60-S.speed*7,y);ctx.stroke()}}
function drawCountdown(){ctx.fillStyle='rgba(6,10,18,.28)';ctx.fillRect(0,0,W,H)}
})();