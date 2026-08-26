(()=>{
'use strict';

const APP_SOURCE='./app077.js?v=077';

function replaceOnce(src,from,to,label){
  if(!src.includes(from)) throw new Error(`patch target missing: ${label}`);
  return src.replace(from,to);
}

function spliceBetween(src,startMarker,endMarker,replacement,label){
  const a=src.indexOf(startMarker);
  const b=a<0?-1:src.indexOf(endMarker,a+startMarker.length);
  if(a<0||b<0) throw new Error(`patch range missing: ${label}`);
  return src.slice(0,a)+replacement+src.slice(b);
}

function loadScript(src){
  return new Promise((resolve,reject)=>{
    const s=document.createElement('script');
    s.src=src;s.onload=resolve;s.onerror=reject;
    document.head.appendChild(s);
  });
}

(async()=>{
  try{
    const response=await fetch(APP_SOURCE,{cache:'no-cache'});
    if(!response.ok) throw new Error(`app source ${response.status}`);
    let src=await response.text();

    src=replaceOnce(
      src,
      "const diffs={easy:{label:'느긋',base:7.0,var:.52},normal:{label:'보통',base:7.65,var:.40},hard:{label:'빡셈',base:8.18,var:.32},hell:{label:'악마',base:8.68,var:.24}};",
      "const diffs={easy:{label:'느긋',base:8.25,var:.65,reactMin:360,reactMax:620,rhythm:.16,mistake:.09,mistakeMs:420,mistakeSlow:.62,accelMs:650,response:3.0,sprintAt:.82,sprint:.25,cadence:280},normal:{label:'보통',base:9.10,var:.50,reactMin:250,reactMax:430,rhythm:.11,mistake:.055,mistakeMs:330,mistakeSlow:.72,accelMs:560,response:3.4,sprintAt:.78,sprint:.50,cadence:250},hard:{label:'빡셈',base:9.85,var:.38,reactMin:150,reactMax:290,rhythm:.07,mistake:.030,mistakeMs:280,mistakeSlow:.78,accelMs:480,response:4.0,sprintAt:.72,sprint:.85,cadence:225},hell:{label:'악마',base:10.55,var:.25,reactMin:90,reactMax:170,rhythm:.035,mistake:.012,mistakeMs:220,mistakeSlow:.84,accelMs:390,response:4.7,sprintAt:.66,sprint:1.15,cadence:205}};",
      'difficulty profiles'
    );

    src=replaceOnce(
      src,
      "finish:{face:'😆',text:'도착!'}",
      "finish:{face:'😆',text:'도착!'},\n  sprint:{face:'🔥',text:'막판 간다!'},\n  aiMiss:{face:'😵',text:'엇박자!'}",
      'AI reactions'
    );

    src=spliceBetween(
      src,
      " const lanes=[500,350,425,575];\n",
      " $('#round').textContent=",
      ` const lanes=[500,350,425,575];\n const ai=diffs[S.diff];\n S.runners=[me,...pool].map((c,i)=>({\n  char:c,name:['나','민수','지현','철수'][i],dist:0,vel:0,y:lanes[i],\n  target:i?ai.base+(Math.random()-.5)*ai.var:0,finish:null,phase:Math.random()*6,hurtStart:0,stumble:0,kick:0,\n  reactUntil:0,reactType:null,reactFace:'',reactText:'',_ahead:null,\n  startDelay:i?ai.reactMin+Math.random()*(ai.reactMax-ai.reactMin):0,\n  aiNextPulse:0,aiCadence:i?ai.cadence*(.92+Math.random()*.16):0,aiRhythm:1,aiMistakeUntil:0,aiSprintShown:false\n }));\n `,
      'runner AI state'
    );

    src=spliceBetween(
      src,
      " for(let i=1;i<S.runners.length;i++){\n",
      " const order=[...S.runners]",
      ` for(let i=1;i<S.runners.length;i++){\n  const r=S.runners[i];if(r.finish)continue;\n  const d=diffs[S.diff],elapsed=now-S.go;\n\n  if(elapsed<r.startDelay){\n   r.vel=Math.max(0,r.vel-5.5*dt);\n   continue;\n  }\n\n  if(!r.aiNextPulse||now>=r.aiNextPulse){\n   r.aiNextPulse=now+r.aiCadence*(.82+Math.random()*.36);\n   r.aiRhythm=1+(Math.random()-.5)*d.rhythm;\n   if(now>r.aiMistakeUntil&&Math.random()<d.mistake){\n    r.aiMistakeUntil=now+d.mistakeMs*(.75+Math.random()*.5);\n    react(r,'aiMiss',now);\n   }\n  }\n\n  const progress=Math.max(0,Math.min(1,r.dist/LEN));\n  const launchAge=Math.max(0,elapsed-r.startDelay);\n  const launch=.34+.66*Math.min(1,launchAge/d.accelMs);\n  let pace=r.target*r.aiRhythm*launch;\n\n  if(now<r.aiMistakeUntil) pace*=d.mistakeSlow;\n\n  if(progress>d.sprintAt){\n   const sprintMix=(progress-d.sprintAt)/(1-d.sprintAt);\n   pace+=d.sprint*Math.min(1,sprintMix);\n   if(!r.aiSprintShown&&sprintMix>.18){r.aiSprintShown=true;react(r,'sprint',now,true)}\n  }\n\n  // No hidden rubber-banding: AI only follows its own reaction, rhythm, mistakes and sprint profile.\n  r.vel+=(pace-r.vel)*Math.min(1,d.response*dt);\n  r.dist+=r.vel*dt;r.phase+=r.vel*dt*2.08;\n\n  if(Math.random()<dt*(1.7+r.vel*.08))burst(r,1,false);\n  if(now>S.go+500){const ahead=r.dist>me.dist+.03;if(r._ahead===null)r._ahead=ahead;else if(ahead!==r._ahead){if(ahead){react(me,'passed',now,true);react(r,'overtake',now,true)}else{react(me,'overtake',now,true);react(r,'passed',now,true)}r._ahead=ahead}}\n }\n `,
      'AI race loop'
    );

    // Run the patched game in the same page. Keeping sourceURL makes browser errors readable.
    (0,eval)(`${src}\n//# sourceURL=app080-patched.js`);

    await loadScript('./input078.js?v=078');
    await loadScript('./challenge079.js?v=079');
    document.documentElement.dataset.aiBuild='080';
  }catch(error){
    console.error('Nemo AI 0.8.0 failed to load',error);
    const box=document.createElement('div');
    box.style.cssText='position:fixed;left:12px;right:12px;bottom:12px;z-index:9999;padding:10px 12px;border-radius:12px;background:#391521;color:white;font:700 13px system-ui';
    box.textContent='게임 AI 로딩에 실패했어요. 새로고침해 주세요.';
    document.body.appendChild(box);
  }
})();
