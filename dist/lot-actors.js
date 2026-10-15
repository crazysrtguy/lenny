/* Parking lot: clean background + separate car / Lenny / Dale layers (replaces the characters painted into the scene).
   Dale smokes on a loop: idle (cigarette in mouth) -> drag -> exhale (puff) -> idle, with an occasional ash flick. */
(()=>{
const lot=document.querySelector('#parking');if(!lot)return;
const back=lot.querySelector('.backdrop');
const media=matchMedia('(prefers-reduced-motion: reduce)');
const rnd=(a,b)=>a+Math.random()*(b-a);
// Positions are percent of the scene (1672x941). Tweak here to move or scale a layer.
const L={
 car:   {src:'assets/lot-car.webp',   cls:'lot-car',   x:22.0, y:40.4, w:39.8, z:2},
 lenny: {src:'assets/lot-lenny.webp', cls:'lot-lenny', x:31.6, y:34.1, w:20.3, z:3},
 dale:  {src:'assets/lot-dale-smoke-idle.webp', cls:'lot-dale', x:68.0, y:40.4, w:18.3, z:2}
};
// Dale's frames share one crop (986x1401). Points are pixels of the original 1086x1448 canvas minus the crop offset (39,0).
const CW=986,CH=1401,OX=39;
const F={
 idle:  {src:'assets/lot-dale-smoke-idle.webp',   ember:[712,310]},
 drag:  {src:'assets/lot-dale-smoke-drag.webp',   ember:[716,288]},
 exhale:{src:'assets/lot-dale-smoke-exhale.webp', ember:[309,235],mouth:[650,218]},
 flick: {src:'assets/lot-dale-smoke-flick.webp',  ember:[138,607]}
};
const ok=()=>!media.matches&&!document.hidden&&!document.body.classList.contains('motion-paused')&&!lot.classList.contains('hidden');
const pct=([x,y])=>[((x-OX)/CW*100).toFixed(2),(y/CH*100).toFixed(2)];

const imgs=[L.car,L.lenny,...Object.values(F)].map(o=>{const i=new Image();i.src=o.src;return i.decode().catch(()=>{})});
Promise.all(imgs).then(()=>{
 if(back)back.src='assets/parking-clean.webp';
 let daleImg,smoke;
 for(const k of ['car','lenny','dale']){
  const o=L[k];let el;
  if(k==='dale'){
   el=document.createElement('div');el.className='lot-layer '+o.cls;
   el.style.cssText=`left:${o.x}%;top:${o.y}%;width:${o.w}%;aspect-ratio:${CW}/${CH};z-index:${o.z}`;
   daleImg=document.createElement('img');daleImg.src=o.src;daleImg.alt='Dale smokes and studies a very long receipt';daleImg.draggable=false;daleImg.className='lot-dale-img';
   smoke=document.createElement('div');smoke.className='lot-smoke';smoke.setAttribute('aria-hidden','true');
   el.append(daleImg,smoke);
  }else{
   el=document.createElement('img');el.className='lot-layer '+o.cls;el.src=o.src;
   el.alt=k==='car'?'Rusty red sedan':'Lenny sits on the hood, scrolling his phone';el.draggable=false;
   el.style.cssText=`left:${o.x}%;top:${o.y}%;width:${o.w}%;z-index:${o.z}`;
  }
  lot.append(el);
 }
 lot.classList.add('lot-layered');

 // ---- smoke ----
 function puff(at,{dx=[-150,150],dy=[-800,-500],s=[2.4,3.6],o=.5,dur=[2.6,3.8],size=3}={}){
  const [x,y]=pct(at),p=document.createElement('i');p.className='lot-puff';
  p.style.cssText=`left:${x}%;top:${y}%;width:${size}%;--dx:${rnd(dx[0],dx[1]).toFixed(0)}%;--dy:${rnd(dy[0],dy[1]).toFixed(0)}%;--s:${rnd(s[0],s[1]).toFixed(2)};--o:${o};animation-duration:${rnd(dur[0],dur[1]).toFixed(2)}s`;
  p.addEventListener('animationend',()=>p.remove());smoke.append(p);
 }
 const trickle=()=>puff(F.idle.ember);
 const bigExhale=()=>{for(let i=0;i<7;i++)setTimeout(()=>{if(ok())puff(F.exhale.mouth,{dx:[250,700],dy:[-350,-150],s:[4,6.5],o:.6,dur:[2.6,3.6],size:4})},i*170)};
 const ash=()=>{/* ash flecks are painted into the flick frame */};
 const show=n=>{daleImg.src=F[n].src};

 // ---- loop ----
 if(media.matches){show('idle');return}
 let cycles=0,trickleTimer=null;
 const wait=(ms)=>new Promise(r=>setTimeout(r,ms));
 async function hold(name,ms){show(name);const end=Date.now()+ms;while(Date.now()<end){if(!ok()){await wait(500);continue}await wait(100)}}
 (function startTrickle(){clearInterval(trickleTimer);trickleTimer=setInterval(()=>{if(ok()&&lot.dataset.pose==='idle')trickle()},rnd(650,900)|0)})();
 (async function loop(){
  for(;;){
   lot.dataset.pose='idle';await hold('idle',rnd(3500,6500));
   lot.dataset.pose='drag';await hold('drag',rnd(1000,1300));
   lot.dataset.pose='exhale';bigExhale();await hold('exhale',1900);
   cycles++;
   if(cycles%3===0){lot.dataset.pose='flick';ash();await hold('flick',1400)}
  }
 })();
});
window.lotLayout=L;
})();
