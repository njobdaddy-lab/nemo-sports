(()=>{
'use strict';
const difficulty=document.getElementById('difficulty');
const result=document.getElementById('result');
const retry=document.getElementById('retry');
const resultTitle=document.getElementById('resultTitle');
const order=['easy','normal','hard','hell'];
const labels={easy:'느긋',normal:'보통',hard:'빡셈',hell:'악마'};
const saved=localStorage.getItem('nemo-ai-difficulty');

function current(){return difficulty?.querySelector('button.sel')?.dataset.d||'normal'}
function choose(key){const btn=difficulty?.querySelector(`[data-d="${key}"]`);if(btn){btn.click();localStorage.setItem('nemo-ai-difficulty',key)}}

// New players start where the race actually feels competitive. Respect a saved manual choice.
requestAnimationFrame(()=>choose(saved&&order.includes(saved)?saved:'hard'));

difficulty?.addEventListener('click',e=>{
 const b=e.target.closest('button[data-d]');
 if(b) localStorage.setItem('nemo-ai-difficulty',b.dataset.d);
});

if(result){
 const actions=result.querySelector('.actions');
 if(actions&&!document.getElementById('harderBtn')){
  const btn=document.createElement('button');
  btn.id='harderBtn';btn.className='harderBtn';btn.type='button';
  actions.insertBefore(btn,actions.firstChild);
  btn.addEventListener('click',()=>{
   const now=current(),idx=order.indexOf(now),next=order[Math.min(order.length-1,idx+1)];
   choose(next);
   retry?.click();
  });
 }
 if(!document.getElementById('challengeNote')){
  const card=result.querySelector('.resultCard');
  const note=document.createElement('div');
  note.id='challengeNote';note.className='challengeNote';
  card?.insertBefore(note,card.querySelector('.actions'));
 }
 const refresh=()=>{
  if(result.hidden)return;
  const now=current(),idx=order.indexOf(now),btn=document.getElementById('harderBtn'),note=document.getElementById('challengeNote');
  const won=(resultTitle?.textContent||'').includes('우승');
  if(btn) btn.textContent=idx>=order.length-1?'👿 악마 재도전':`🔥 더 센 상대 · ${labels[order[idx+1]]}`;
  if(note) note.innerHTML=won
   ? `<b>여유 있었어? ㅋㅋ</b><span>${idx>=order.length-1?'악마 난이도 기록을 더 줄여보자.':'한 단계 강한 AI와 바로 재대결할 수 있어.'}</span>`
   : `<b>이번 판은 접전!</b><span>리듬을 유지하면 막판에 다시 뒤집을 수 있어.</span>`;
 };
 new MutationObserver(refresh).observe(result,{attributes:true,attributeFilter:['hidden']});
}
})();
