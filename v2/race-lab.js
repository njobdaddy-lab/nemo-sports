import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

const stage = document.querySelector('#stage');
const renderer = new THREE.WebGLRenderer({ antialias:true, powerPreference:'high-performance' });
renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;
stage.appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xcfeafa);
scene.fog = new THREE.Fog(0xcfeafa, 38, 78);

const camera = new THREE.PerspectiveCamera(48, 1, .1, 160);
camera.position.set(-4, 5.5, -8);

scene.add(new THREE.HemisphereLight(0xffffff, 0xa7b88e, 2.3));
const sun = new THREE.DirectionalLight(0xfff5df, 4.1);
sun.position.set(-10, 18, -8);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
sun.shadow.camera.left = -28;
sun.shadow.camera.right = 28;
sun.shadow.camera.top = 28;
sun.shadow.camera.bottom = -28;
scene.add(sun);

const grass = new THREE.Mesh(
  new THREE.CircleGeometry(44, 128),
  new THREE.MeshStandardMaterial({ color:0xb9d69a, roughness:.96 })
);
grass.rotation.x = -Math.PI / 2;
grass.receiveShadow = true;
scene.add(grass);

const controlPoints = [
  new THREE.Vector3(-9, 0, -5),
  new THREE.Vector3(-3, 0, -5),
  new THREE.Vector3(4, 0, -5),
  new THREE.Vector3(9, 0, -3.2),
  new THREE.Vector3(10, 0, .6),
  new THREE.Vector3(8, 0, 3.4),
  new THREE.Vector3(4.6, 0, 3.6),
  new THREE.Vector3(2.8, 0, 6.2),
  new THREE.Vector3(-2.4, 0, 6.5),
  new THREE.Vector3(-7.2, 0, 5.2),
  new THREE.Vector3(-10, 0, 2.2),
  new THREE.Vector3(-8.8, 0, -.4),
  new THREE.Vector3(-5.1, 0, .2),
  new THREE.Vector3(-2.2, 0, -1.4),
  new THREE.Vector3(-5.2, 0, -3.1),
  new THREE.Vector3(-8.3, 0, -3.0)
];
const trackCurve = new THREE.CatmullRomCurve3(controlPoints, true, 'centripetal', .45);
const trackWidth = 3.35;
const halfTrack = trackWidth * .5;
const TRACK_SAMPLES = 360;
const trackSamples = [];
const trackNormals = [];
for (let i = 0; i < TRACK_SAMPLES; i++) {
  const t = i / TRACK_SAMPLES;
  const p = trackCurve.getPointAt(t);
  const tangent = trackCurve.getTangentAt(t).normalize();
  trackSamples.push(p);
  trackNormals.push(new THREE.Vector3(tangent.z, 0, -tangent.x).normalize());
}
const trackLength = trackCurve.getLength();

function sampleTrack(t, lane = 0) {
  const wrapped = ((t % 1) + 1) % 1;
  const p = trackCurve.getPointAt(wrapped);
  const tangent = trackCurve.getTangentAt(wrapped).normalize();
  const normal = new THREE.Vector3(tangent.z, 0, -tangent.x).normalize();
  return { p:p.addScaledVector(normal, lane), tangent, normal, wrapped };
}

function buildRibbon(width, y, material) {
  const vertices = [];
  const indices = [];
  for (let i = 0; i < TRACK_SAMPLES; i++) {
    const p = trackSamples[i];
    const n = trackNormals[i];
    vertices.push(p.x + n.x * width/2, y, p.z + n.z * width/2);
    vertices.push(p.x - n.x * width/2, y, p.z - n.z * width/2);
  }
  for (let i = 0; i < TRACK_SAMPLES; i++) {
    const j = (i + 1) % TRACK_SAMPLES;
    const a = i * 2, b = a + 1, c = j * 2, d = c + 1;
    indices.push(a, c, b, b, c, d);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  const mesh = new THREE.Mesh(geo, material);
  mesh.receiveShadow = true;
  return mesh;
}

const roadMat = new THREE.MeshStandardMaterial({ color:0x59616b, roughness:.9, side:THREE.DoubleSide });
const road = buildRibbon(trackWidth, .03, roadMat);
scene.add(road);

function makeBoundary(side) {
  const pts = trackSamples.map((p, i) => p.clone().addScaledVector(trackNormals[i], side * (halfTrack - .06)).setY(.07));
  return new THREE.LineLoop(
    new THREE.BufferGeometry().setFromPoints(pts),
    new THREE.LineBasicMaterial({ color:0xf7f1e7 })
  );
}
scene.add(makeBoundary(1), makeBoundary(-1));

const dashMat = new THREE.MeshStandardMaterial({ color:0xffefd0, roughness:.8 });
for (let i = 0; i < 54; i += 2) {
  const t = i / 54;
  const s = sampleTrack(t, 0);
  const dash = new THREE.Mesh(new THREE.BoxGeometry(.58, .025, .085), dashMat);
  dash.position.copy(s.p).setY(.07);
  dash.rotation.y = Math.atan2(s.tangent.x, s.tangent.z);
  dash.receiveShadow = true;
  scene.add(dash);
}

const start = sampleTrack(0);
const startAngle = Math.atan2(start.tangent.x, start.tangent.z);
const startMat = new THREE.MeshStandardMaterial({ color:0xffffff, roughness:.75 });
for (let i = -3; i <= 3; i++) {
  const tile = new THREE.Mesh(new THREE.BoxGeometry(.42, .03, .44), startMat);
  tile.position.copy(start.p).addScaledVector(start.normal, i * .46).setY(.075);
  tile.rotation.y = startAngle;
  tile.receiveShadow = true;
  scene.add(tile);
}

const coneMat = new THREE.MeshStandardMaterial({ color:0xf5b45f, roughness:.7 });
for (const t of [.165, .205, .37, .405, .51, .555, .69, .745, .84]) {
  const s = sampleTrack(t, halfTrack + .48);
  const cone = new THREE.Mesh(new THREE.ConeGeometry(.14, .45, 12), coneMat);
  cone.position.copy(s.p).setY(.24);
  cone.castShadow = true;
  scene.add(cone);
}

const mats = {
  sugar:new THREE.MeshStandardMaterial({color:0xf3e8cf,roughness:.9}),
  black:new THREE.MeshStandardMaterial({color:0x17191e,roughness:.48}),
  wheel:new THREE.MeshStandardMaterial({color:0x202329,roughness:.62}),
  rim:new THREE.MeshStandardMaterial({color:0xcbd4dc,roughness:.3,metalness:.6}),
  chrome:new THREE.MeshStandardMaterial({color:0x88939c,roughness:.25,metalness:.8}),
  eye:new THREE.MeshPhysicalMaterial({color:0x090a0d,roughness:.12,clearcoat:.75}),
  white:new THREE.MeshBasicMaterial({color:0xffffff})
};
function mesh(g,m,c=true){const o=new THREE.Mesh(g,m);o.castShadow=c;o.receiveShadow=c;return o;}

function makeRacer(color=0xf3e8cf,isPlayer=false){
  const root=new THREE.Group(), visual=new THREE.Group();
  root.add(visual);
  const body=mesh(new RoundedBoxGeometry(1.18,.98,1.34,6,.13),isPlayer?mats.sugar:new THREE.MeshStandardMaterial({color,roughness:.82}));
  body.position.y=.88; visual.add(body);
  const face=new THREE.Group(); face.position.set(0,.94,.69); visual.add(face);
  for(const x of[-.2,.2]){
    const eye=mesh(new THREE.SphereGeometry(.095,18,14),mats.eye); eye.scale.set(.85,1.15,.32); eye.position.set(x,.08,.015); face.add(eye);
    const shine=mesh(new THREE.SphereGeometry(.022,10,8),mats.white,false); shine.position.set(x-.025,.115,.052); face.add(shine);
  }
  const mouth=mesh(new THREE.TorusGeometry(.09,.018,8,24,Math.PI),mats.black,false); mouth.rotation.z=Math.PI; mouth.position.set(0,-.12,.03); face.add(mouth);
  const wheelGeo=new THREE.CylinderGeometry(.19,.19,.16,18);
  for(const sx of[-1,1]) for(const sz of[-1,1]){
    const wheel=mesh(wheelGeo,mats.wheel); wheel.rotation.z=Math.PI/2; wheel.position.set(sx*.58,.36,sz*.42); visual.add(wheel);
    const rim=mesh(new THREE.CylinderGeometry(.095,.095,.164,18),mats.rim); rim.rotation.z=Math.PI/2; rim.position.copy(wheel.position); visual.add(rim);
  }
  for(const x of[-.25,.25]){
    const pipe=mesh(new THREE.CylinderGeometry(.07,.09,.34,14),mats.chrome);
    pipe.rotation.x=Math.PI/2; pipe.position.set(x,.52,-.78); visual.add(pipe);
  }
  const spoiler=mesh(new RoundedBoxGeometry(.72,.08,.12,4,.03),mats.black); spoiler.position.set(0,1.18,-.66); visual.add(spoiler);
  root.userData.visual=visual;
  root.userData.impactOffset=new THREE.Vector3();
  root.userData.speedPenalty=0;
  scene.add(root);
  return root;
}

const player=makeRacer(0xf3e8cf,true);
const aiDefs=[
  {color:0xb95d48,speed:8.15,lane:-.5,offset:-.018},
  {color:0xf48ab1,speed:8.45,lane:.1,offset:-.036},
  {color:0xc99c62,speed:8.75,lane:.52,offset:-.054}
];
const ais=aiDefs.map((d,i)=>{
  const o=makeRacer(d.color,false);
  o.userData.def=d;
  o.userData.progress=d.offset;
  o.userData.lapProgress=d.offset;
  o.userData.seed=i*2.1;
  o.userData.prevPos=new THREE.Vector3();
  o.userData.velocity=new THREE.Vector3();
  return o;
});

const input={left:false,right:false,gas:false,drift:false};
const velocity=new THREE.Vector3();
let yaw=startAngle, boostTimer=0, wasDrifting=false, collisionCooldown=0;
let boostGauge=0, boostStock=0, driftPending=0, driftClean=true, currentDrifting=false;
let playerProgress=0, lastTrackProgress=0, raceState='countdown', raceStart=0, countdownStart=performance.now()/1000;

const lapEl=document.querySelector('#lap'),rankEl=document.querySelector('#rank'),speedEl=document.querySelector('#speed');
const msg=document.querySelector('#message'),mini=document.querySelector('#mini'),finish=document.querySelector('#finish'),finishRank=document.querySelector('#finishRank'),finishTime=document.querySelector('#finishTime');
const boostBtn=document.querySelector('#boost'),boostPctEl=document.querySelector('#boostPct'),boostStockEl=document.querySelector('#boostStock'),boostFillEl=document.querySelector('#boostFill'),boostPendingEl=document.querySelector('#boostPending');

function normalizeAngle(a){while(a>Math.PI)a-=Math.PI*2;while(a<-Math.PI)a+=Math.PI*2;return a;}
function nearestTrackState(x,z){
  let bestI=0,bestD2=Infinity;
  for(let i=0;i<TRACK_SAMPLES;i++){
    const p=trackSamples[i];
    const dx=x-p.x,dz=z-p.z,d2=dx*dx+dz*dz;
    if(d2<bestD2){bestD2=d2;bestI=i;}
  }
  const p=trackSamples[bestI],n=trackNormals[bestI];
  const dx=x-p.x,dz=z-p.z;
  const signed=dx*n.x+dz*n.z;
  const distance=Math.sqrt(bestD2);
  return {on:distance<=halfTrack,distance,signed,progress:bestI/TRACK_SAMPLES,index:bestI};
}
function showMini(text){mini.textContent=text;mini.classList.add('show');clearTimeout(showMini.t);showMini.t=setTimeout(()=>mini.classList.remove('show'),650);}
function updateBoostUI(){
  const committed=THREE.MathUtils.clamp(boostGauge,0,100);
  const preview=THREE.MathUtils.clamp(boostGauge+driftPending,0,100);
  boostPctEl.textContent=Math.floor(preview);
  boostStockEl.textContent=boostStock;
  boostFillEl.style.width=`${committed}%`;
  boostPendingEl.style.left=`${committed}%`;
  boostPendingEl.style.width=`${Math.max(0,preview-committed)}%`;
  const ready=boostStock>0&&raceState==='racing';
  boostBtn.disabled=!ready;
  boostBtn.classList.toggle('ready',ready);
}
function awardDrift(){
  if(!driftClean||driftPending<4||boostStock>=1){driftPending=0;updateBoostUI();return;}
  boostGauge=Math.min(100,boostGauge+driftPending);
  driftPending=0;
  if(boostGauge>=100){boostGauge=0;boostStock=1;showMini('BOOST READY!');}
  else showMini(`DRIFT ${Math.round(boostGauge)}%`);
  updateBoostUI();
}
function cancelDriftReward(){
  if(currentDrifting||wasDrifting){driftClean=false;driftPending=0;updateBoostUI();}
}
function useBoost(){
  if(raceState!=='racing'||boostStock<=0)return;
  boostStock-=1; boostTimer=1.05;
  const f=new THREE.Vector3(Math.sin(yaw),0,Math.cos(yaw));
  velocity.addScaledVector(f,3.2);
  showMini('BOOST!');
  updateBoostUI();
}
function bindHold(id,key){
  const el=document.querySelector(id);
  const on=e=>{e.preventDefault();input[key]=true;el.classList.add('on');};
  const off=e=>{e.preventDefault();input[key]=false;el.classList.remove('on');};
  el.addEventListener('pointerdown',on);
  el.addEventListener('pointerup',off);
  el.addEventListener('pointercancel',off);
  el.addEventListener('pointerleave',off);
}
bindHold('#left','left');bindHold('#right','right');bindHold('#gas','gas');bindHold('#drift','drift');
boostBtn.addEventListener('pointerdown',e=>{e.preventDefault();useBoost();});

addEventListener('keydown',e=>{
  if(['ArrowLeft','a','A'].includes(e.key))input.left=true;
  if(['ArrowRight','d','D'].includes(e.key))input.right=true;
  if(['ArrowUp','w','W'].includes(e.key))input.gas=true;
  if(e.code==='Space'){input.drift=true;e.preventDefault();}
  if(e.key==='Shift'||e.key==='x'||e.key==='X'){useBoost();e.preventDefault();}
  if(e.key==='r'||e.key==='R')resetRace();
});
addEventListener('keyup',e=>{
  if(['ArrowLeft','a','A'].includes(e.key))input.left=false;
  if(['ArrowRight','d','D'].includes(e.key))input.right=false;
  if(['ArrowUp','w','W'].includes(e.key))input.gas=false;
  if(e.code==='Space')input.drift=false;
});

function resetRace(){
  const s=sampleTrack(0,0);
  player.position.copy(s.p).setY(.02);
  yaw=Math.atan2(s.tangent.x,s.tangent.z);
  player.rotation.y=yaw;
  player.userData.visual.rotation.set(0,0,0);
  player.userData.visual.position.set(0,0,0);
  velocity.set(0,0,0);
  boostTimer=0; wasDrifting=false; collisionCooldown=0;
  boostGauge=0; boostStock=0; driftPending=0; driftClean=true; currentDrifting=false;
  playerProgress=0; lastTrackProgress=0;
  raceState='countdown'; countdownStart=performance.now()/1000; raceStart=0;
  finish.classList.remove('show');
  ais.forEach((a,i)=>{
    a.userData.progress=aiDefs[i].offset;
    a.userData.lapProgress=aiDefs[i].offset;
    a.userData.impactOffset.set(0,0,0);
    a.userData.speedPenalty=0;
    const as=sampleTrack(a.userData.progress,aiDefs[i].lane);
    a.position.copy(as.p).setY(.02);
    a.rotation.y=Math.atan2(as.tangent.x,as.tangent.z);
    a.userData.prevPos.copy(a.position);
  });
  updateBoostUI();
}
document.querySelector('#retry').addEventListener('click',resetRace);
document.querySelector('#resetTop').addEventListener('click',resetRace);

function updateCountdown(now){
  if(raceState!=='countdown')return;
  const e=now-countdownStart;
  let text='';
  if(e<1)text='3'; else if(e<2)text='2'; else if(e<3)text='1'; else if(e<3.7)text='GO!';
  else{msg.classList.remove('show');raceState='racing';raceStart=now;return;}
  msg.textContent=text;msg.classList.add('show');
}

function updatePlayerProgress(trackInfo){
  let delta=trackInfo.progress-lastTrackProgress;
  if(delta>0.5)delta-=1;
  if(delta<-0.5)delta+=1;
  if(Math.abs(delta)<.08)playerProgress+=delta;
  lastTrackProgress=trackInfo.progress;
}

function updatePlayer(dt,now){
  const active=raceState==='racing';
  const steer=(input.left?1:0)+(input.right?-1:0);
  const speedNow=velocity.length();
  const t=nearestTrackState(player.position.x,player.position.z);
  const drifting=active&&input.drift&&Math.abs(steer)>.1&&speedNow>3.2;

  let forward=new THREE.Vector3(Math.sin(yaw),0,Math.cos(yaw));
  if(active&&input.gas){
    const accel=boostTimer>0?12.5:7.8;
    velocity.addScaledVector(forward,accel*dt);
  }

  const drag=t.on?(input.gas?.55:1.65):3.8;
  velocity.multiplyScalar(Math.max(0,1-drag*dt*.12));

  if(active&&speedNow>.2){
    const steerRate=drifting?1.92:1.18;
    yaw+=steer*steerRate*dt*(.42+Math.min(speedNow,11)/9);
  }

  forward=new THREE.Vector3(Math.sin(yaw),0,Math.cos(yaw));
  const right=new THREE.Vector3(forward.z,0,-forward.x);
  const forwardSpeed=velocity.dot(forward);
  const lateralSpeed=velocity.dot(right);
  const grip=drifting?2.1:7.8;
  velocity.addScaledVector(right,-lateralSpeed*Math.min(1,grip*dt));
  if(forwardSpeed<0) velocity.addScaledVector(forward,-forwardSpeed*Math.min(1,5*dt));

  if(drifting&&!wasDrifting){driftClean=true;driftPending=0;}
  currentDrifting=drifting;
  if(drifting){
    if(!t.on){driftClean=false;driftPending=0;}
    else if(driftClean&&boostStock<1){
      const speedQuality=THREE.MathUtils.clamp((speedNow-3.0)/7.0,.15,1);
      const slideQuality=.72+THREE.MathUtils.clamp(Math.abs(lateralSpeed)/4.5,0,.55);
      driftPending=Math.min(100-boostGauge,driftPending+dt*(15+17*speedQuality)*slideQuality);
    }
    updateBoostUI();
  }
  if(wasDrifting&&!drifting)awardDrift();
  wasDrifting=drifting;
  if(boostTimer>0)boostTimer=Math.max(0,boostTimer-dt);
  if(collisionCooldown>0)collisionCooldown=Math.max(0,collisionCooldown-dt);

  const cap=boostTimer>0?14.2:(t.on?10.8:4.7);
  if(velocity.length()>cap)velocity.setLength(cap);
  if(!t.on)velocity.multiplyScalar(Math.max(.82,1-2.3*dt));

  player.position.addScaledVector(velocity,dt);
  const after=nearestTrackState(player.position.x,player.position.z);
  if(!after.on&&currentDrifting)cancelDriftReward();
  if(after.distance>halfTrack+2.6){
    velocity.multiplyScalar(Math.max(.6,1-4.0*dt));
    cancelDriftReward();
  }

  player.rotation.y=yaw;
  const visual=player.userData.visual;
  visual.rotation.z=THREE.MathUtils.lerp(visual.rotation.z,-steer*(drifting?.24:.09),.14);
  visual.rotation.x=THREE.MathUtils.lerp(visual.rotation.x,boostTimer>0?-.08:0,.12);
  visual.rotation.y=THREE.MathUtils.lerp(visual.rotation.y,drifting?steer*.12:0,.14);
  visual.position.y=Math.sin(now*19)*Math.min(velocity.length()/10,.05);

  if(active)updatePlayerProgress(after);
  lapEl.textContent=`${THREE.MathUtils.clamp(Math.floor(Math.max(0,playerProgress))+1,1,2)} / 2`;
  speedEl.textContent=Math.round(velocity.length()*13.2);

  if(active&&playerProgress>=2){
    raceState='finished';
    velocity.multiplyScalar(.5);
    const r=computeRank();
    finishRank.textContent=`${r}위`;
    finishTime.textContent=formatTime(now-raceStart);
    finish.classList.add('show');
  }
}

function updateAI(dt,now){
  const active=raceState==='racing';
  for(const ai of ais){
    const d=ai.userData.def;
    if(active){
      const wobble=1+Math.sin(now*.85+ai.userData.seed)*.028;
      ai.userData.speedPenalty=Math.max(0,ai.userData.speedPenalty-dt*.55);
      const speedScale=1-ai.userData.speedPenalty*.55;
      ai.userData.progress+=(d.speed*wobble*speedScale/trackLength)*dt;
      ai.userData.lapProgress=ai.userData.progress;
    }
    const s=sampleTrack(ai.userData.progress,d.lane);
    ai.userData.impactOffset.multiplyScalar(Math.max(.84,1-4.2*dt));
    const pos=s.p.clone().add(ai.userData.impactOffset).setY(.02);
    ai.userData.velocity.copy(pos).sub(ai.userData.prevPos).divideScalar(Math.max(dt,.001));
    ai.userData.prevPos.copy(pos);
    ai.position.copy(pos);
    ai.rotation.y=Math.atan2(s.tangent.x,s.tangent.z);
    ai.userData.visual.rotation.z=THREE.MathUtils.lerp(ai.userData.visual.rotation.z,ai.userData.impactOffset.x*.11+Math.sin(now*2.2+ai.userData.seed)*.025,.2);
    ai.userData.visual.position.y=Math.sin(now*15+ai.userData.seed)*.025;
  }
}

function resolveCarCollisions(){
  if(raceState!=='racing')return;
  const minDist=1.34;
  for(const ai of ais){
    const delta=player.position.clone().sub(ai.position); delta.y=0;
    const dist=delta.length();
    if(dist>=minDist)continue;

    const normal=dist>.001?delta.multiplyScalar(1/dist):new THREE.Vector3(1,0,0);
    const penetration=minDist-dist;
    player.position.addScaledVector(normal,penetration*.72);
    ai.userData.impactOffset.addScaledVector(normal,-penetration*.28);

    const relative=velocity.clone().sub(ai.userData.velocity);
    const closing=-relative.dot(normal);
    const impact=Math.max(2.0,closing);

    if(collisionCooldown<=0 || closing>1.2){
      velocity.addScaledVector(normal,impact*.72);
      velocity.multiplyScalar(.72);
      const forward=new THREE.Vector3(Math.sin(yaw),0,Math.cos(yaw));
      const side=Math.sign(forward.x*normal.z-forward.z*normal.x)||1;
      yaw=normalizeAngle(yaw-side*(.10+Math.min(.22,impact*.018)));
      ai.userData.impactOffset.addScaledVector(normal,-Math.min(.48,.12+impact*.025));
      ai.userData.speedPenalty=Math.min(.75,ai.userData.speedPenalty+.36);
      collisionCooldown=.18;
      cancelDriftReward();
      showMini('BUMP!');
    }
  }
}

function computeRank(){
  const p=Math.max(0,playerProgress);
  const vals=[p,...ais.map(a=>Math.max(0,a.userData.lapProgress))];
  const sorted=[...vals].sort((a,b)=>b-a);
  return sorted.indexOf(p)+1;
}
function updateRank(){rankEl.textContent=`${computeRank()} / 4`;}

function updateCamera(dt){
  const f=new THREE.Vector3(Math.sin(yaw),0,Math.cos(yaw));
  const speedNow=velocity.length();
  const desired=player.position.clone().addScaledVector(f,-6.2-Math.min(1.0,speedNow*.045)).add(new THREE.Vector3(0,4.2,0));
  const alpha=1-Math.pow(.001,dt);
  camera.position.lerp(desired,alpha);
  camera.lookAt(player.position.clone().addScaledVector(f,3.1).add(new THREE.Vector3(0,.8,0)));
}

function formatTime(sec){
  const m=Math.floor(sec/60),s=Math.floor(sec%60),cs=Math.floor((sec-Math.floor(sec))*100);
  return `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}.${String(cs).padStart(2,'0')}`;
}

function resize(){
  const w=stage.clientWidth,h=stage.clientHeight;
  renderer.setSize(w,h,false);
  camera.aspect=w/h;
  camera.updateProjectionMatrix();
}
new ResizeObserver(resize).observe(stage);
resize();

const clock=new THREE.Clock();
function animate(){
  requestAnimationFrame(animate);
  const dt=Math.min(clock.getDelta(),.033),now=performance.now()/1000;
  updateCountdown(now);
  updateAI(dt,now);
  updatePlayer(dt,now);
  resolveCarCollisions();
  updateBoostUI();
  updateRank();
  updateCamera(dt);
  renderer.render(scene,camera);
}

resetRace();
animate();