(()=>{
  'use strict';

  const style=document.createElement('style');
  style.textContent=`
    body.race076 .foot{
      touch-action:none;
      -webkit-tap-highlight-color:transparent;
      user-select:none;
      -webkit-user-select:none;
      transition:transform .06s ease,filter .06s ease,box-shadow .06s ease;
    }
    body.race076 .foot.touch-pressed{
      transform:translateY(4px) scale(.985);
      filter:brightness(1.12);
    }
  `;
  document.head.appendChild(style);

  function bindImmediateFoot(id){
    const el=document.getElementById(id);
    if(!el || typeof el.onclick!=='function') return;

    // app077의 기존 step() 클로저를 그대로 사용하되,
    // 모바일 click 대신 pointerdown 순간에 실행한다.
    const original=el.onclick;
    el.onclick=null;

    const press=(event)=>{
      if(el.disabled) return;
      if(event.pointerType==='mouse' && event.button!==0) return;
      event.preventDefault();
      el.classList.add('touch-pressed');
      clearTimeout(el._pressTimer);
      el._pressTimer=setTimeout(()=>el.classList.remove('touch-pressed'),85);
      try{ if(navigator.vibrate) navigator.vibrate(7); }catch(_){ }
      original.call(el,event);
    };

    el.addEventListener('pointerdown',press,{passive:false});
    el.addEventListener('pointercancel',()=>el.classList.remove('touch-pressed'));
    el.addEventListener('pointerup',()=>{
      clearTimeout(el._pressTimer);
      el._pressTimer=setTimeout(()=>el.classList.remove('touch-pressed'),45);
    });

    // pointerdown 뒤에 브라우저가 만드는 click은 중복 입력이므로 차단한다.
    el.addEventListener('click',(event)=>{
      event.preventDefault();
      event.stopImmediatePropagation();
    },true);

    // 키보드 테스트도 유지한다.
    el.addEventListener('keydown',(event)=>{
      if(el.disabled) return;
      if(event.key==='Enter' || event.key===' '){
        event.preventDefault();
        original.call(el,event);
      }
    });

    el.addEventListener('contextmenu',(event)=>event.preventDefault());
  }

  bindImmediateFoot('left');
  bindImmediateFoot('right');
})();
