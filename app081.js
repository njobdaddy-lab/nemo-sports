(()=>{
'use strict';

const SOURCE='./app077.js?v=077';

function loadScript(src){
  return new Promise((resolve,reject)=>{
    const s=document.createElement('script');
    s.src=src;
    s.onload=resolve;
    s.onerror=reject;
    document.head.appendChild(s);
  });
}

function replaceOnce(src,from,to,label){
  if(!src.includes(from)) throw new Error(`patch target missing: ${label}`);
  return src.replace(from,to);
}

async function bootAddons(){
  await loadScript('./input078.js?v=078');
  await loadScript('./challenge079.js?v=079');
}

async function fallback(reason){
  console.warn('AI stumble patch fallback:',reason);
  await loadScript(SOURCE);
  await bootAddons();
}

(async()=>{
  try{
    const response=await fetch(SOURCE,{cache:'no-cache'});
    if(!response.ok) throw new Error(`source ${response.status}`);
    let src=await response.text();

    src=replaceOnce(
      src,
      "const diffs={easy:{label:'느긋',base:7.0,var:.52},normal:{label:'보통',base:7.65,var:.40},hard:{label:'빡셈',base:8.18,var:.32},hell:{label:'악마',base:8.68,var:.24}};",
      "const diffs={easy:{label:'느긋',base:7.0,var:.52,fallChance:.68,fallMs:1050},normal:{label:'보통',base:7.65,var:.40,fallChance:.48,fallMs:920},hard:{label:'빡셈',base:8.18,var:.32,fallChance:.32,fallMs:790},hell:{label:'악마',base:8.68,var:.24,fallChance:.14,fallMs:650}};",
      'difficulty stumble profile'
    );

    src=replaceOnce(
      src,
      "S.runners=[me,...pool].map((c,i)=>({char:c,name:['나','민수','지현','철수'][i],dist:0,vel:0,y:lanes[i],target:i?diffs[S.diff].base+(Math.random()-.5)*diffs[S.diff].var:0,finish:null,phase:Math.random()*6,hurtStart:0,stumble:0,kick:0,reactUntil:0,reactType:null,reactFace:'',reactText:'',_ahead:null}));",
      "S.runners=[me,...pool].map((c,i)=>({char:c,name:['나','민수','지현','철수'][i],dist:0,vel:0,y:lanes[i],target:i?diffs[S.diff].base+(Math.random()-.5)*diffs[S.diff].var:0,finish:null,phase:Math.random()*6,hurtStart:0,stumble:0,kick:0,reactUntil:0,reactType:null,reactFace:'',reactText:'',_ahead:null,aiFell:false,aiFallAt:i&&Math.random()<diffs[S.diff].fallChance?9+Math.random()*32:null}));",
      'runner stumble state'
    );

    src=replaceOnce(
      src,
      "  const r=S.runners[i];if(r.finish)continue;\n  r.vel+=(r.target+Math.sin(now*.0017+i)*.13-r.vel)*Math.min(1,2.5*dt);r.dist+=r.vel*dt;r.phase+=r.vel*dt*2.08;\n  if(Math.random()<dt*2.5)burst(r,1,false);",
      "  const r=S.runners[i];if(r.finish)continue;\n  const aiCfg=diffs[S.diff];\n  if(!r.aiFell&&r.aiFallAt!==null&&r.dist>=r.aiFallAt&&r.dist<LEN-4){\n   r.aiFell=true;r.hurtStart=now;r.stumble=now+aiCfg.fallMs*(.9+Math.random()*.2);r.vel*=.28;burst(r,14,true);react(r,'stumble',now,true);\n  }\n  if(now<r.stumble){r.vel=Math.max(0,r.vel-8.8*dt);r.dist+=r.vel*dt*.28;r.phase+=r.vel*dt*.55;continue;}\n  r.vel+=(r.target+Math.sin(now*.0017+i)*.13-r.vel)*Math.min(1,2.5*dt);r.dist+=r.vel*dt;r.phase+=r.vel*dt*2.08;\n  if(Math.random()<dt*2.5)burst(r,1,false);",
      'AI stumble physics'
    );

    const blob=new Blob([src+'\n//# sourceURL=app081-patched-game.js'],{type:'text/javascript'});
    const url=URL.createObjectURL(blob);
    try{
      await loadScript(url);
    }finally{
      URL.revokeObjectURL(url);
    }
    await bootAddons();
    document.documentElement.dataset.gameBuild='081';
  }catch(error){
    await fallback(error);
  }
})();
