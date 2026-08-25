/* 네모 운동회 0.5.1 hotfix: hidden overlay, AI finish flow, safe retry */
(()=>{
  const clearResultContent=()=>{
    const a=document.querySelector('#resultTitle');
    const b=document.querySelector('#recordBig');
    const c=document.querySelector('#resultList');
    if(a)a.textContent=''; if(b)b.textContent=''; if(c)c.innerHTML='';
  };

  const retry=document.querySelector('#retryBtn');
  if(retry){
    retry.onclick=()=>{
      const type=S.event;
      retry.disabled=true;
      const panel=document.querySelector('#resultPanel');
      if(panel)panel.hidden=true;
      clearResultContent();
      destroyGame();
      S.phase='idle'; S.locked=false; S.lastFoot=null; S.combo=0; S.power=0;
      requestAnimationFrame(()=>setTimeout(()=>{
        openGame(type);
        retry.disabled=false;
      },80));
    };
  }

  // Sprint: 내가 결승선을 통과해도 AI는 끝까지 달린다.
  if(typeof Sprint!=='undefined'){
    Sprint.prototype.finish=function(i){
      const r=this.runners[i];
      if(!r||r.finish)return;
      r.finish=this.time.now;
      r.x=this.finishX;
      r.n.x=this.finishX;

      if(i===0){
        S.phase='coast';
        const l=document.querySelector('#leftBtn'), rr=document.querySelector('#rightBtn');
        if(l)l.disabled=true; if(rr)rr.disabled=true;
        showMsg('내 결승! AI 들어오는 중…',900);
        vibrate([25,20,55]);
        this._queueSprintResult(false);
      }else if(S.phase==='coast' && this.runners.every(x=>x.finish)){
        this._queueSprintResult(true);
      }
    };

    Sprint.prototype._queueSprintResult=function(allFinished){
      if(this._resultShown)return;
      if(allFinished){
        if(this._resultTimer){this._resultTimer.remove(false);this._resultTimer=null;}
        this._resultTimer=this.time.delayedCall(300,()=>this._showSprintResult());
        return;
      }
      if(!this._resultTimer)this._resultTimer=this.time.delayedCall(2400,()=>this._showSprintResult());
    };

    Sprint.prototype._showSprintResult=function(){
      if(this._resultShown)return;
      this._resultShown=true;
      S.phase='result';
      this.result();
    };

    Sprint.prototype.update=function(time){
      if(!['run','coast'].includes(S.phase))return;
      this.runners.forEach((r,i)=>{
        if(r.finish)return;
        runAnim(r.n,time,1.3+r.rate+(i===0?S.power/130:0));
        if(i===0)return;
        if(S.phase==='run' && Math.random()<diffs[S.difficulty].stumble*.01){
          r.n.angle=55;
          this.time.delayedCall(130,()=>{if(r.n)r.n.angle=0});
          return;
        }
        const catchup=S.phase==='coast'?3.6:0;
        r.x=Math.min(this.finishX,r.x+1.7+r.rate*2.1+catchup);
        r.n.x=r.x;
        if(r.x>=this.finishX)this.finish(i);
      });
    };
  }

  // Reaction: 부정출발/내 결승 뒤에도 AI가 결승선까지 간다.
  if(typeof Reaction!=='undefined'){
    Reaction.prototype.press=function(){
      const b=document.querySelector('#reactionBtn');
      if(S.phase==='red'){
        S.phase='false';
        this.runners[0].reaction=9999;
        if(b){b.textContent='부정출발! AI 결승까지 보는 중…';b.classList.add('false');}
        document.querySelector('#timer').textContent='FALSE';
        showMsg('너무 빨랐다! 😵',800);
        vibrate([70,40,70]);
        const [lo,hi]=diffs[S.difficulty].reaction;
        this.runners.slice(1).forEach(r=>{
          r.reaction=lo+Math.random()*(hi-lo);
          this.time.delayedCall(r.reaction,()=>{r.started=true});
        });
        this._queueReactionResult(false);
      }else if(S.phase==='green'){
        S.phase='race';
        this.runners[0].reaction=performance.now()-this.goAt;
        this.runners[0].started=true;
        if(b)b.textContent=Math.round(this.runners[0].reaction)+'ms · 달린다!';
        setHud('반응',Math.round(this.runners[0].reaction)+'ms','레이스','진행 중',0);
      }
    };

    Reaction.prototype._queueReactionResult=function(allFinished){
      if(this._reactionResultShown)return;
      if(allFinished){
        if(this._reactionResultTimer){this._reactionResultTimer.remove(false);this._reactionResultTimer=null;}
        this._reactionResultTimer=this.time.delayedCall(300,()=>this._showReactionResult());
        return;
      }
      if(!this._reactionResultTimer)this._reactionResultTimer=this.time.delayedCall(2600,()=>this._showReactionResult());
    };

    Reaction.prototype._showReactionResult=function(){
      if(this._reactionResultShown)return;
      this._reactionResultShown=true;
      S.phase='result';
      this.result();
    };

    Reaction.prototype.update=function(time){
      if(!['green','race','coast','false'].includes(S.phase))return;
      this.runners.forEach((r,i)=>{
        if(!r.started||r.finish)return;
        runAnim(r.n,time,1.5);
        const catchup=(S.phase==='coast'||S.phase==='false')&&i>0?3.6:0;
        r.x+=i===0?4.6:4.15+diffs[S.difficulty].speed*.55+catchup;
        r.n.x=r.x;
        if(r.x>=this.finishX){
          r.x=this.finishX; r.n.x=this.finishX; r.finish=this.time.now;
          if(i===0&&S.phase==='race'){
            S.phase='coast';
            showMsg('내 결승! AI 들어오는 중…',850);
            this._queueReactionResult(false);
          }
        }
      });

      const aiDone=this.runners.slice(1).every(r=>r.finish);
      if(S.phase==='false'&&aiDone)this._queueReactionResult(true);
      if(S.phase==='coast'&&this.runners.every(r=>r.finish))this._queueReactionResult(true);
    };
  }
})();
