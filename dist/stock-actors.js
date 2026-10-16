/* Stockroom: Lenny is its own layer on the crate (Dale stays painted into the background for now).
   Loop:     chew (base) -> bite -> chew ...
   Reaction: coin up -> hype, coin down -> rage (big live trade with 2 min cooldown, or "Check the bags" while in the stockroom). */
(()=>{
const room=document.querySelector('#stockroom');if(!room)return;
const back=room.querySelector('.backdrop');
const media=matchMedia('(prefers-reduced-motion: reduce)');
const rnd=(a,b)=>a+Math.random()*(b-a);
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const ok=()=>!media.matches&&!document.hidden&&!document.body.classList.contains('motion-paused')&&!room.classList.contains('hidden');
const V='?v=1';

// Frames share one crop (cw x ch px of the 1024x1536 template canvas); geometry is percent of the 1672x941 scene.
const G={cw:757,ch:1310,left:22.192,top:10.605,width:23.829};
const F={
 chew:'assets/stock-lenny-chew.webp'+V, bite:'assets/stock-lenny-bite.webp'+V,
 hype:'assets/stock-lenny-hype.webp'+V, rage:'assets/stock-lenny-rage.webp'+V
};

Promise.all(Object.values(F).map(s=>{const i=new Image();i.src=s;return i.decode().catch(()=>{})})).then(()=>{
 if(back)back.src='assets/stockroom-dale.webp'+V;           // background with Lenny removed (Dale still painted in)
 const shadow=document.createElement('div');shadow.className='stock-shadow';shadow.setAttribute('aria-hidden','true');room.append(shadow);
 const el=document.createElement('div');el.className='stock-lenny stock-lenny-layer';
 el.style.cssText=`left:${G.left}%;top:${G.top}%;width:${G.width}%;aspect-ratio:${G.cw}/${G.ch}`;
 const img=document.createElement('img');img.src=F.chew;img.alt='Lenny sits on a milk crate eating pizza';img.draggable=false;
 el.append(img);room.append(el);

 let pose='chew',reacting=false;
 const show=n=>{pose=n;img.src=F[n]};
 async function hold(n,ms){while(reacting)await wait(150);show(n);const end=Date.now()+ms;
  while(Date.now()<end){if(!ok()||reacting){await wait(200);continue}await wait(100)}}
 if(media.matches)return;

 (async function loop(){
  for(;;){await hold('chew',rnd(3500,6500));await hold('bite',rnd(1000,1300));await hold('chew',rnd(1700,2500))}
 })();

 let lastAuto=0,timer=null;
 function react(dir){
  if(reacting||!ok())return false;
  reacting=true;const up=dir==='up';
  show(up?'hype':'rage');el.classList.add(up?'stock-hype':'stock-rage');
  timer=setTimeout(()=>{el.classList.remove('stock-hype','stock-rage');show('chew');reacting=false},up?5200:5600);
  return true;
 }
 window.stockReact=react;
 window.addEventListener('bigtrade',e=>{const d=e.detail||{};if(room.classList.contains('hidden')||reacting)return;
  const now=Date.now();if(now-lastAuto<120000)return;if(react(d.buy?'up':'down'))lastAuto=now});
 document.addEventListener('click',e=>{
  if(!e.target.closest||!e.target.closest('#coin-gag')||room.classList.contains('hidden'))return;
  e.stopImmediatePropagation();e.preventDefault();
  const m=window.tokenMood&&window.tokenMood();react(m?m.dir:(Math.random()<.5?'up':'down'))},true);
});
})();
