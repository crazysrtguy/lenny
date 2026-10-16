/* Stockroom: clean background + Lenny (on the crate) and Dale (at the escape-plan board) as separate layers.
   Lenny loop:  chew (base) -> bite -> chew ...
   Dale loop:   stern point (base) -> rant A/B -> point ...
   Reaction:    coin up -> Lenny hype + Dale shock;  coin down -> Lenny rage + Dale smug.
   Triggers:    big live trade (2 min cooldown) or "Check the bags" while in the stockroom. */
(()=>{
const room=document.querySelector('#stockroom');if(!room)return;
const back=room.querySelector('.backdrop');
const media=matchMedia('(prefers-reduced-motion: reduce)');
const rnd=(a,b)=>a+Math.random()*(b-a);
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const ok=()=>!media.matches&&!document.hidden&&!document.body.classList.contains('motion-paused')&&!room.classList.contains('hidden');
const V='?v=3';

// Frames of one actor share a crop (cw x ch px of a 1024x1536 template canvas); left/top/width are percent of the 1672x941 scene.
const LENNY={cls:'stock-lenny stock-lenny-layer',base:'chew',alt:'Lenny sits on a milk crate eating pizza',cw:757,ch:1310,left:22.192,top:10.605,width:23.829,
 F:{chew:'assets/stock-lenny-chew.webp'+V,bite:'assets/stock-lenny-bite.webp'+V,hype:'assets/stock-lenny-hype.webp'+V,rage:'assets/stock-lenny-rage.webp'+V}};
const DALE={cls:'stock-dale stock-dale-layer',base:'point',alt:'Dale points angrily at the escape plan',cw:687,ch:1104,left:62.925,top:22.115,width:21.626,
 F:{point:'assets/stock-dale-point.webp'+V,rantA:'assets/stock-dale-rant-a.webp'+V,rantB:'assets/stock-dale-rant-b.webp'+V,shock:'assets/stock-dale-shock.webp'+V,smug:'assets/stock-dale-smug.webp'+V}};

const all=[...Object.values(LENNY.F),...Object.values(DALE.F)];
Promise.all(all.map(s=>{const i=new Image();i.src=s;return i.decode().catch(()=>{})})).then(()=>{
 if(back)back.src='assets/stockroom-clean.webp'+V;          // background with both characters removed
 let reacting=false;

 function actor(def,shadowCls){
  if(shadowCls){const sh=document.createElement('div');sh.className='stock-shadow '+shadowCls;sh.setAttribute('aria-hidden','true');room.append(sh)}
  const el=document.createElement('div');el.className=def.cls;
  el.style.cssText=`left:${def.left}%;top:${def.top}%;width:${def.width}%;aspect-ratio:${def.cw}/${def.ch}`;
  const img=document.createElement('img');img.src=def.F[def.base];img.alt=def.alt;img.draggable=false;el.append(img);room.append(el);
  const a={el,img,def,pose:def.base};
  a.show=n=>{a.pose=n;img.src=def.F[n]};
  a.hold=async(n,ms)=>{while(reacting)await wait(150);a.show(n);const end=Date.now()+ms;
   while(Date.now()<end){if(!ok()||reacting){await wait(200);continue}await wait(100)}};
  return a;
 }
 const lenny=actor(LENNY,'stock-shadow-lenny'),dale=actor(DALE,'stock-shadow-dale');
 if(media.matches)return;

 (async function lennyLoop(){for(;;){await lenny.hold('chew',rnd(3500,6500));await lenny.hold('bite',rnd(1000,1300));await lenny.hold('chew',rnd(1700,2500))}})();
 (async function daleLoop(){
  await wait(1500);
  for(;;){
   await dale.hold('point',rnd(3800,7000));
   const n=2+Math.floor(Math.random()*3);                     // a short rant: A/B jabs
   for(let i=0;i<n*2;i++)await dale.hold(i%2?'rantB':'rantA',rnd(230,330));
  }
 })();

 let lastAuto=0,timer=null;
 function react(dir){
  if(reacting||!ok())return false;
  reacting=true;const up=dir==='up';
  lenny.show(up?'hype':'rage');dale.show(up?'shock':'smug');
  lenny.el.classList.add(up?'stock-hype':'stock-rage');dale.el.classList.add(up?'stock-shock':'stock-smug');
  // Dale's rant frames flicker slightly during a dump so he keeps stewing, but 'smug' dominates
  timer=setTimeout(()=>{['stock-hype','stock-rage'].forEach(c=>lenny.el.classList.remove(c));['stock-shock','stock-smug'].forEach(c=>dale.el.classList.remove(c));
   lenny.show('chew');dale.show('point');reacting=false},up?5400:5800);
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
