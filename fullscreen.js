(()=>{
  'use strict';

  async function enterGameFullscreen(){
    const root=document.documentElement;
    try{
      if(!document.fullscreenElement && root.requestFullscreen){
        await root.requestFullscreen({navigationUI:'hide'});
      }
    }catch(_){
      // Browser may refuse fullscreen; gameplay should continue normally.
    }
  }

  function bind(id){
    const el=document.getElementById(id);
    if(!el) return;
    el.addEventListener('click',()=>{ enterGameFullscreen(); },{capture:true});
  }

  bind('startBtn');
  bind('retry');
})();
