(()=>{
'use strict';
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const canvas=$('#canvas'),ctx=canvas.getContext('2d');
const W=1280,H=860; canvas.width=W; canvas.height=H;
const START=100, FINISH=1160, LEN=50;

const chars=[
{id:'sugar',name:'각설탕',c:'#f7efe2',type:'sugar',quote:'통통 뛰는 기본 마스코트'},
{id:'brown',name:'흑설탕',c:'#8a4f2c',type:'brown',quote:'진하게, 끝까지 간다'},
{id:'brick',name:'벽돌',c:'#cb563b',type:'brick',quote:'대화보다 돌진'},
{id:'safe',name:'금고',c:'#717a86',type:'safe',quote:'무뚝뚝한 허당'},
{id:'apt',name:'아파트',c:'#e7d5b8',type:'apt',quote:'덩치는 커도 순둥이'}
];
const diffs={
easy:{label:'느긋',base:7.0,var:.5},normal:{label:'보통',base:7.7,var:.42},hard:{label:'빡셈',base:8.25,var:.32},hell:{label:'악마',base:8.75,var:.24}
};
const S={char:'sugar',diff:'normal',phase:'home',last:0,go:0,lastFoot:null,combo:0,speed:0,stumbleUntil:0,shake:0,flash:0,runners:[],parts:[],raf:0};

const svgBody=`<svg xmlns="http://www.w3.org/2000/svg" width="220" height="220" viewBox="0 0 220 220"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#fffef9"/><stop offset=".55" stop-color="#f5ead7"/><stop offset="1" stop-color="#d8c8b4"/></linearGradient><filter id="n" x="-10%" y="-10%" width="120%" height="120%"><feTurbulence type="fractalNoise" baseFrequency=".085" numOctaves="3" seed="7"/><feColorMatrix values="1 0 0 0 .9 0 1 0 0 .87 0 0 1 0 .78 0 0 0 .32 0"/><feBlend mode="multiply" in2="SourceGraphic"/></filter><filter id="s" x="-30%" y="-30%" width="160%" height="160%"><feDropShadow dx="0" dy="8" stdDeviation="6" flood-opacity=".25"/></filter></defs><rect x="10" y="10" width="200" height="200" rx="34" fill="url(#g)" stroke="#fff" stroke-width="5" filter="url(#s)"/><rect x="13" y="13" width="194" height="194" rx="31" fill="#fff" opacity=".22" filter="url(#n)"/><path d="M28 38 Q55 20 96 21" fill="none" stroke="#fff" stroke-width="9" stroke-linecap="round" opacity=".62"/></svg>`;
const svgArm=`<svg xmlns="http://www.w3.org/2000/svg" width="88" height="126" viewBox="0 0 88 126"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#fffdf8"/><stop offset="1" stop-color="#dccab6"/></linearGradient><filter id="s"><feDropShadow dx="0" dy="4" stdDeviation="3" flood-opacity=".22"/></filter></defs><path d="M44 8 C22 24 18 48 28 67 C35 81 52 83 58 69 C62 59 56 51 50 47 C68 42 75 53 75 70 C75 92 60 112 38 116 C19 120 8 106 12 91 C16 74 27 64 37 59" fill="url(#g)" stroke="#fff" stroke-width="4" stroke-linejoin="round" filter="url(#s)"/></svg>`;
const svgLeg=`<svg xmlns="http://www.w3.org/2000/svg" width="90" height="120" viewBox="0 0 90 120"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#fffdf7"/><stop offset="1" stop-color="#d9c6b1"/></linearGradient><filter id="s"><feDropShadow dx="0" dy="4" stdDeviation="3" flood-opacity=".22"/></filter></defs><path d="M35 7 Q50 7 53 22 L55 65 Q72 66 79 80 Q86 96 72 107 Q60 115 35 113 Q14 112 10 99 Q6 85 17 76 Q25 69 31 68 L30 23 Q30 11 35 7Z" fill="url(#g)" stroke="#fff" stroke-width="4" filter="url(#s)"/></svg>`;
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
$('#sound').onclick=()=>{};
$('#startBtn').onclick=start; $('#retry').onclick=start; $('#back').onclick=home; $('#homeBtn').onclick=home;
$('#left').onclick=()=>step('L'); $('#right').onclick=()=>step('R');

function home(){stop();$('#result').hidden=true;$('#game').hidden=true;$('#home').hidden=false;document.body.classList.remove('race073');S.phase='home'}
function stop(){cancelAnimationFrame(S.raf);S.raf=0;clearTimeout(S._res)}
function msg(t,ms=550){const e=$('#msg');e.textContent=t;e.classList.add('show');clearTimeout(e._t);e._t=setTimeout(()=>e.classList.remove('show'),ms)}
function start(){
 stop();$('#result').hidden=true;$('#home').hidden=true;$('#game').hidden=false;document.body.classList.add('race073');
 S.phase='count';S.lastFoot=null;S.combo=0;S.speed=0;S.stumbleUntil=0;S.shake=0;S.flash=0;S.parts=[];
 const me=chars.find(c=>c.id===S.char), pool=chars.filter(c=>c!==me).sort(()=>Math.random()-.5).slice(0,3);
 S.runners=[me,...pool].map((c,i)=>({char:c,name:['나','민수','지현','철수'][i],dist:0,vel:0,y:405+i*120,target:i?diffs[S.diff].base+(Math.random()-.5)*diffs[S.diff].var:0,finish:null,phase:Math.random()*6,hurtStart:0,stumble:0}));
 $('#round').textContent=`AI ${diffs[S.diff].label} · PLAYTEST 0.7.3 · 각설탕 실전`; $('#timer').textContent='3'; hud(); draw(performance.now());
 let n=3;const tick=()=>{n--;if(n){$('#timer').textContent=n;msg(n);setTimeout(tick,620)}else{S.phase='run';S.go=performance.now();S.last=performance.now();$('#timer').textContent='GO!';msg('GO! 🔥',700);next('L');S.raf=requestAnimationFrame(loop)}};setTimeout(tick,620)
}
function next(f){const lock=S.phase!=='run'||performance.now()<S.stumbleUntil;$('#left').disabled=lock;$('#right').disabled=lock;$('#left').classList.toggle('next',!lock&&f==='L');$('#right').classList.toggle('next',!lock&&f==='R')}
function step(f){
 if(S.phase!=='run'||performance.now()<S.stumbleUntil)return;const me=S.runners[0];
 if(S.lastFoot===f){const now=performance.now();S.combo=0;S.speed*=.42;me.vel*=.38;S.stumbleUntil=now+820;me.stumble=S.stumbleUntil;me.hurtStart=now;S.lastFoot=null;S.shake=14;burst(me,16);msg('발 꼬임! 🤦',820);next(null);setTimeout(()=>{if(S.phase==='run'){next('L');msg('다시 간다! ⚡',400)}},820);return}
 S.lastFoot=f;S.combo++;S.speed=Math.min(10.8,S.speed+1.25+Math.min(1.6,S.combo*.05)*.25);me.vel=Math.max(me.vel,S.speed);me.kick=performance.now();next(f==='L'?'R':'L');burst(me,4);hud()
}
function loop(now){if(!['run','coast'].includes(S.phase))return;const dt=Math.min(.032,(now-S.last)/1000||.016);S.last=now;physics(dt,now);draw(now);S.raf=requestAnimationFrame(loop)}
function physics(dt,now){
 const me=S.runners[0];
 if(S.phase==='run'){if(now<S.stumbleUntil)me.vel=Math.max(0,me.vel-7*dt);else{S.speed=Math.max(3.1,S.speed-1.1*dt);me.vel+=(S.speed-me.vel)*Math.min(1,5*dt)}me.dist+=me.vel*dt;me.phase+=me.vel*dt*2.35}
 for(let i=1;i<S.runners.length;i++){const r=S.runners[i];if(r.finish)continue;r.vel+=(r.target-r.vel)*Math.min(1,2.4*dt);r.dist+=r.vel*dt;r.phase+=r.vel*dt*2.05;if(Math.random()<dt*3)burst(r,1)}
 S.runners.forEach((r,i)=>{if(!r.finish&&r.dist>=LEN){r.dist=LEN;r.finish=now;if(i===0){S.phase='coast';S.flash=1;S.shake=7;$('#timer').textContent=((now-S.go)/1000).toFixed(2)+'s';msg('FINISH! 🏁',700);next(null);S._res=setTimeout(result,2300)}}});
 if(S.phase==='coast'&&S.runners.every(r=>r.finish))result();
 S.parts.forEach(p=>{p.life-=dt;p.vy+=26*dt});S.parts=S.parts.filter(p=>p.life>0);S.shake*=Math.pow(.025,dt);S.flash=Math.max(0,S.flash-dt*2.5);hud()
}
function hud(){const me=S.runners[0];$('#combo').textContent=S.combo;const sp=Math.round(Math.min(100,S.speed/10.8*100));$('#speed').textContent=sp+'%';$('#speedBar').style.width=sp+'%';const m=Math.min(50,me?.dist||0);$('#progressBar').style.width=(m*2)+'%';$('#progressText').textContent=m.toFixed(1)+'m / 50m';const o=[...S.runners].sort((a,b)=>b.dist-a.dist);$('#rankBadge').textContent=(o.indexOf(me)+1)+'위'}
function result(){
 if(S.phase==='result')return;S.phase='result';stop();const a=[...S.runners].sort((x,y)=>(x.finish||Infinity)-(y.finish||Infinity)),me=S.runners[0],rank=a.indexOf(me)+1,t=(me.finish-S.go)/1000;
 $('#resultTitle').textContent=rank===1?'🏆 우승!':`${rank}위!`;$('#record').textContent=t.toFixed(2)+'s';$('#rows').innerHTML=a.map((r,i)=>`<div class="row ${r===me?'me':''}"><span><strong>${i+1}위</strong> · ${r.name} (${r.char.name})</span><strong>${((r.finish-S.go)/1000).toFixed(2)}s</strong></div>`).join('');$('#podium').innerHTML='';$('#result').hidden=false
}
function wx(d){const me=S.runners[0],x=START+d/LEN*(FINISH-START),mx=START+Math.min(me?.dist||0,44)/LEN*(FINISH-START),cam=Math.max(0,Math.min(210,mx-430));return x-cam}
function burst(r,n){for(let i=0;i<n;i++)S.parts.push({d:r.dist,y:r.y+55,life:.35+Math.random()*.35,vy:-10-Math.random()*23,size:3+Math.random()*8,c:r.char.type==='sugar'?'#fff0d9':r.char.c})}
function fall(r,now){const end=r===S.runners[0]?S.stumbleUntil:r.stumble, dur=Math.max(1,end-r.hurtStart),t=Math.max(0,Math.min(1,(now-r.hurtStart)/dur));if(t<.34)return 1.18*(1-Math.pow(1-t/.34,3));if(t<.66)return 1.18;return 1.18*Math.pow(1-(t-.66)/.34,3)}
function pimg(im,x,y,s,rot=0,ax=.5,ay=.5){ctx.save();ctx.translate(x,y);ctx.rotate(rot);ctx.drawImage(im,-im.naturalWidth*s*ax,-im.naturalHeight*s*ay,im.naturalWidth*s,im.naturalHeight*s);ctx.restore()}
function draw(now){
 ctx.save();ctx.translate((Math.random()-.5)*S.shake,(Math.random()-.5)*S.shake);sky(now);stadium(now);track();finishLine();
 for(let i=S.runners.length-1;i>=0;i--)runner(S.runners[i],now,i===0);
 for(const p of S.parts){ctx.globalAlpha=Math.max(0,p.life/.7);ctx.fillStyle=p.c;ctx.beginPath();ctx.arc(wx(p.d),p.y+p.vy*(.7-p.life),p.size,0,Math.PI*2);ctx.fill()}ctx.globalAlpha=1;speedLines();ctx.restore();
 if(S.flash){ctx.fillStyle=`rgba(255,255,255,${S.flash*.4})`;ctx.fillRect(0,0,W,H)}
}
function sky(now){const g=ctx.createLinearGradient(0,0,0,330);g.addColorStop(0,'#57c9ff');g.addColorStop(1,'#d7f5ff');ctx.fillStyle=g;ctx.fillRect(0,0,W,330);ctx.fillStyle='#ffffffc8';for(let i=0;i<7;i++){const x=((i*220-now*.008)%1500)-100,y=50+(i%3)*50;ctx.beginPath();ctx.ellipse(x,y,45,16,0,0,7);ctx.ellipse(x+35,y+4,33,13,0,0,7);ctx.fill()}}
function stadium(now){ctx.fillStyle='#304a69';ctx.fillRect(0,185,W,145);for(let x=4;x<W;x+=14){ctx.fillStyle=['#ffd84d','#ff6c6a','#5ee6ad','#fff','#8ea7ff'][(x/14|0)%5];ctx.beginPath();ctx.arc(x,245+Math.sin(x*.08+now*.004)*7,3.5,0,7);ctx.fill()}for(let i=0;i<7;i++){const x=90+i*185;ctx.strokeStyle='#e6eef8';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(x,145);ctx.lineTo(x,210);ctx.stroke();ctx.fillStyle=['#ffd84d','#ff6c6a','#5ee6ad','#8ea7ff'][i%4];ctx.beginPath();ctx.moveTo(x,145);ctx.quadraticCurveTo(x+34,154+Math.sin(now*.006+i)*7,x+68,148);ctx.lineTo(x+68,177);ctx.quadraticCurveTo(x+34,168+Math.sin(now*.006+i)*7,x,174);ctx.closePath();ctx.fill()}ctx.fillStyle='#f0d7ac';ctx.fillRect(0,319,W,11)}
function track(){ctx.fillStyle='#bc573e';ctx.fillRect(0,330,W,H-330);for(let i=0;i<5;i++){ctx.strokeStyle='#ffffff75';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(0,350+i*120);ctx.lineTo(W,350+i*120);ctx.stroke()}for(let m=0;m<=50;m+=5){const x=wx(m);ctx.strokeStyle='#ffffff22';ctx.beginPath();ctx.moveTo(x,330);ctx.lineTo(x,H);ctx.stroke()}}
function finishLine(){const x=wx(50);for(let y=330;y<H;y+=20){ctx.fillStyle=((y/20)|0)%2?'#fff':'#151923';ctx.fillRect(x-9,y,18,20)}}
function runner(r,now,me){
 const x=wx(r.dist),running=['run','coast'].includes(S.phase)&&!r.finish,hurt=(r===S.runners[0]?now<S.stumbleUntil:now<r.stumble),bounce=running&&!hurt?Math.abs(Math.sin(r.phase))*7:0;
 ctx.save();ctx.translate(x,r.y+bounce);if(me){ctx.fillStyle='#ffd84d2b';ctx.beginPath();ctx.arc(0,10,67+Math.sin(now*.01)*4,0,7);ctx.fill()}
 if(r.char.type==='sugar')sugar(r,now,me,running,hurt);else simple(r,now,me,running,hurt);
 ctx.fillStyle=me?'#ffd84d':'#fff';round(-38,-92,76,21,9);ctx.fill();ctx.fillStyle='#151923';ctx.font='900 12px system-ui';ctx.textAlign='center';ctx.fillText(r.name,0,-77);ctx.restore()
}
function sugar(r,now,me,running,hurt){
 const s=me?.55:.44,bw=220*s,bh=220*s,stride=running&&!hurt?Math.sin(r.phase):0,ang=hurt?fall(r,now):Math.min(.13,r.vel/70),hit=Math.max(0,1-(now-(r.kick||0))/130);
 ctx.save();ctx.rotate(ang);ctx.fillStyle='#0004';ctx.beginPath();ctx.ellipse(0,bh*.5+14,bw*.46,10,0,0,7);ctx.fill();
 const armS=s*.72,legS=s*.68,sy=-bh*.04,sx=bw*.46,hy=bh*.39,hx=bw*.20;
 let al=-stride*.75,ar=stride*.75,ll=stride*.68,lr=-stride*.68;if(hurt){al=-1.1;ar=.95;ll=.25;lr=-.2}
 pimg(A.leg,-hx,hy,legS,ll,.5,.12);pimg(A.leg,hx,hy,legS,lr,.5,.12);pimg(A.arm,-sx,sy,armS,al,.52,.16);ctx.save();ctx.scale(-1,1);pimg(A.arm,-sx,sy,armS,-ar,.52,.16);ctx.restore();
 ctx.save();ctx.scale(1+hit*.025,1-hit*.035);pimg(A.body,0,0,s);ctx.restore();
 if(hurt){ctx.strokeStyle='#20191a';ctx.lineWidth=4;for(const q of [-1,1]){const ex=q*bw*.15,ey=-bh*.05;ctx.beginPath();ctx.moveTo(ex-5,ey-5);ctx.lineTo(ex+5,ey+5);ctx.moveTo(ex+5,ey-5);ctx.lineTo(ex-5,ey+5);ctx.stroke()}ctx.fillStyle='#b6282d';ctx.beginPath();ctx.ellipse(0,bh*.14,8,6,0,0,7);ctx.fill()}else{pimg(A.eyes,0,-bh*.05,s*.56);pimg(A.mouth,0,bh*.12,s*.5);ctx.fillStyle='#ff7d88aa';ctx.beginPath();ctx.ellipse(-bw*.27,bh*.08,4,3,0,0,7);ctx.ellipse(bw*.27,bh*.08,4,3,0,0,7);ctx.fill()}
 ctx.restore()
}
function simple(r,now,me,running,hurt){const c=r.char,s=me?1.18:1,w=72*s,h=(c.type==='apt'?96:68)*s,stride=running&&!hurt?Math.sin(r.phase):0,ang=hurt?fall(r,now):Math.min(.12,r.vel/70);ctx.save();ctx.rotate(ang);ctx.fillStyle='#0004';ctx.beginPath();ctx.ellipse(0,h*.55,w*.55,9,0,0,7);ctx.fill();ctx.strokeStyle=c.type==='safe'?'#8d96a1':c.type==='brown'?'#683820':c.type==='brick'?'#973b2e':'#e7d8c2';ctx.lineWidth=11;ctx.lineCap='round';for(const [sx,sgn] of [[-1,-1],[1,1]]){ctx.beginPath();ctx.moveTo(sx*w*.22,h*.35);ctx.lineTo(sx*w*.22+sgn*stride*7,h*.52);ctx.stroke();ctx.beginPath();ctx.moveTo(sx*w*.5,0);ctx.lineTo(sx*w*.5-sgn*stride*9,10);ctx.stroke()}ctx.fillStyle=c.c;round(-w/2,-h/2,w,h,14);ctx.fill();detail(c,w,h);face(c,hurt,w,h);ctx.restore()}
function detail(c,w,h){if(c.type==='brick'){ctx.strokeStyle='#8d3428';ctx.lineWidth=2;for(let y=-h*.25;y<h*.3;y+=16){ctx.beginPath();ctx.moveTo(-w/2+5,y);ctx.lineTo(w/2-5,y);ctx.stroke()}}else if(c.type==='safe'){ctx.strokeStyle='#2d333b';ctx.lineWidth=3;ctx.beginPath();ctx.arc(0,8,15,0,7);ctx.stroke();ctx.fillStyle='#d0a451';ctx.beginPath();ctx.arc(0,8,4,0,7);ctx.fill()}else if(c.type==='apt'){ctx.fillStyle='#62b9e7';for(let y=-h*.32;y<h*.18;y+=19)for(let x=-w*.25;x<w*.3;x+=18){ctx.fillRect(x-4,y,8,10)}ctx.fillStyle='#315f61';ctx.fillRect(-9,h*.18,18,18)}}
function face(c,hurt,w,h){if(hurt){ctx.strokeStyle='#17191d';ctx.lineWidth=3;for(const x of [-13,13]){ctx.beginPath();ctx.moveTo(x-4,-9);ctx.lineTo(x+4,-1);ctx.moveTo(x+4,-9);ctx.lineTo(x-4,-1);ctx.stroke()}return}for(const x of [-13,13]){ctx.fillStyle='#111';ctx.beginPath();ctx.ellipse(x,-5,6,8,0,0,7);ctx.fill();ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(x-2,-8,2,0,7);ctx.fill()}ctx.fillStyle='#391617';ctx.beginPath();ctx.arc(0,10,8,0,Math.PI);ctx.fill()}
function round(x,y,w,h,r){ctx.beginPath();ctx.roundRect(x,y,w,h,r)}
function speedLines(){if((S.runners[0]?.vel||0)<8.3||S.phase!=='run')return;ctx.strokeStyle='#ffffff44';ctx.lineWidth=2.5;for(let i=0;i<16;i++){const y=365+(i*31+performance.now()*.13)%445,x=80+(i*91)%930;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x-85-S.speed*7,y);ctx.stroke()}}
})();