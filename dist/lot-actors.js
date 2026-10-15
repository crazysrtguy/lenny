/* Parking lot: clean background + separate car / Lenny / Dale layers (replaces the characters painted into the scene).
   Dale smokes a cigarette: idle -> drag -> exhale -> idle (ash flick with sparks every 3rd cycle).
   Lenny smokes a joint:   idle -> drag -> hold -> exhale -> giggle -> idle.
   Both share an "exhale slot" so their big clouds never land on the same beat.
   Market reaction (big trade / "Check the bags"): coin up -> Lenny hype + Dale shock; coin down -> Lenny rage + Dale smug.
   Smoke, glowing embers and sparks are drawn by lot-smoke.js (canvas). */
(()=>{
const lot=document.querySelector('#parking');if(!lot)return;
const back=lot.querySelector('.backdrop');
const media=matchMedia('(prefers-reduced-motion: reduce)');
const rnd=(a,b)=>a+Math.random()*(b-a);
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const ok=()=>!media.matches&&!document.hidden&&!document.body.classList.contains('motion-paused')&&!lot.classList.contains('hidden');
const V='?v=3';

// Positions are percent of the scene (1672x941). Tweak here to move or scale a layer.
const POS={
 car:   {x:22.0,  y:40.4,  w:39.8,  z:2},
 lenny: {x:32.38, y:33.86, w:18.12, z:3},
 dale:  {x:69.56, y:40.4,  w:15.81, z:2}
};
// Each actor's frames share one crop. Points are pixels of the original 1086x1448 canvas; (ox,oy) is the crop offset.
// ember = the burning tip; mouth = where smoke leaves; glow = resting ember brightness for that pose (0..1).
const DALE={cls:'lot-dale',cw:852,ch:1448,ox:123,oy:0,tint:'cig',alt:'Dale smokes and studies a very long receipt',F:{
 idle:  {src:'assets/lot-dale-smoke-idle.webp'+V,   ember:[712,310], glow:.30},
 drag:  {src:'assets/lot-dale-smoke-drag.webp'+V,   ember:[716,288], glow:.30},
 exhale:{src:'assets/lot-dale-smoke-exhale.webp'+V, ember:[309,235], mouth:[650,132], glow:.35},
 flick: {src:'assets/lot-dale-smoke-flick.webp'+V,  ember:[138,607], glow:.40},
 shockA:{src:'assets/lot-dale-react-shock-a.webp'+V,ember:[686,418], mouth:[585,300], glow:.55},
 shockB:{src:'assets/lot-dale-react-shock-b.webp'+V,ember:[652,402], mouth:[540,285], glow:.55},
 smugA: {src:'assets/lot-dale-react-smug-a.webp'+V, ember:[718,265], mouth:[672,257], glow:.45},
 smugB: {src:'assets/lot-dale-react-smug-b.webp'+V, ember:[679,186], mouth:[624,186], glow:.45}}};
const LENNY={cls:'lot-lenny',cw:931,ch:1448,ox:65,oy:0,tint:'joint',alt:'Lenny sits on the hood, smoking a joint and scrolling his phone',F:{
 idle:  {src:'assets/lot-lenny-joint-idle.webp'+V,   ember:[647,389], glow:.32},
 drag:  {src:'assets/lot-lenny-joint-drag.webp'+V,   ember:[665,363], glow:.32},
 hold:  {src:'assets/lot-lenny-joint-hold.webp'+V,   ember:[326,313], glow:.45},
 exhale:{src:'assets/lot-lenny-joint-exhale.webp'+V, ember:[614,794], mouth:[578,135], glow:.38},
 giggle:{src:'assets/lot-lenny-joint-giggle.webp'+V, ember:[205,973], glow:.40},
 hypeA: {src:'assets/lot-lenny-react-hype-a.webp'+V, ember:[636,321], mouth:[565,300], glow:.55},
 hypeB: {src:'assets/lot-lenny-react-hype-b.webp'+V, ember:[549,253], mouth:[445,265], glow:.55},
 rageA: {src:'assets/lot-lenny-react-rage-a.webp'+V, ember:[659,403], mouth:[595,365], glow:.60},
 rageB: {src:'assets/lot-lenny-react-rage-b.webp'+V, ember:[679,432], mouth:[595,370], glow:.60}}};
const CAR={src:'assets/lot-car.webp'};

let exhaleUntil=0;                                   // shared slot: one big cloud at a time
async function exhaleSlot(ms){while(Date.now()<exhaleUntil)await wait(200);exhaleUntil=Date.now()+ms+700}
let reacting=false;                                  // market-reaction scene is playing: the smoking loops pause

const preload=[CAR.src,...Object.values(DALE.F).map(f=>f.src),...Object.values(LENNY.F).map(f=>f.src)].map(s=>{const i=new Image();i.src=s;return i.decode().catch(()=>{})});
Promise.all(preload).then(()=>{
 if(back)back.src='assets/parking-clean.webp?v=2';
 const smoke=window.LotSmoke?window.LotSmoke.create(lot):null;

 function build(def,pos){
  const el=document.createElement('div');el.className='lot-layer '+def.cls;
  el.style.cssText=`left:${pos.x}%;top:${pos.y}%;width:${pos.w}%;aspect-ratio:${def.cw}/${def.ch};z-index:${pos.z}`;
  const img=document.createElement('img');img.src=def.F.idle.src;img.alt=def.alt;img.draggable=false;img.className='lot-actor-img';
  el.append(img);lot.append(el);
  const a={el,img,def,pose:'idle',flare:0,flareT:0};
  // a point of this actor in "u" units (fractions of the lot width), following the layer's idle bob / bass bounce
  a.at=(px,py)=>{const r=el.getBoundingClientRect(),L=lot.getBoundingClientRect();if(!L.width)return null;
   return {x:(r.left-L.left+(px-def.ox)/def.cw*r.width)/L.width,y:(r.top-L.top+(py-def.oy)/def.ch*r.height)/L.width}};
  a.ember=()=>a.at(...def.F[a.pose].ember);
  a.mouth=()=>{const m=def.F[a.pose].mouth||def.F.exhale.mouth;return m?a.at(...m):null};
  a.show=n=>{a.pose=n;img.dataset.p=n;img.src=def.F[n].src};
  // hold a frame for ms; pauses while hidden or while the reaction scene owns the actors, and re-shows its frame afterwards
  a.hold=async(name,ms)=>{while(reacting)await wait(150);a.show(name);const end=Date.now()+ms;
   while(Date.now()<end){if(!ok()||reacting){await wait(200);continue}
    if(img.dataset.p!==name)a.show(name);await wait(100)}};
  a.flareUp=()=>{a.flare=1;a.flareT=performance.now()};      // ember flares on a drag, then settles
  if(smoke)smoke.glow(()=>{
   const base=def.F[a.pose].glow||.3,age=(performance.now()-a.flareT)/1300,f=a.flare?Math.max(0,1-age):0;
   const p=a.ember();if(!p)return null;return {x:p.x,y:p.y,level:Math.max(base,f)}});
  return a;
 }

 // car first (behind), then Lenny, then Dale. The car is a wrapper so its headlight glows ride its bob / bass bounce.
 const car=document.createElement('div');car.className='lot-layer lot-car';
 car.style.cssText=`left:${POS.car.x}%;top:${POS.car.y}%;width:${POS.car.w}%;aspect-ratio:1448/1043;z-index:${POS.car.z}`;
 const carImg=document.createElement('img');carImg.src=CAR.src;carImg.alt='Rusty red sedan';carImg.draggable=false;carImg.className='lot-actor-img';car.append(carImg);
 // lens boxes measured on lot-car.webp (px of the 1448x1043 art): [x0,y0,x1,y1]; amber = turn signals
 const LENS=[[100,575,164,638],[178,580,243,643],[658,597,731,670],[745,600,819,672]],AMBER=[[55,570,81,636],[831,603,873,683]];
 const lamps=document.createElement('div');lamps.className='lot-car-lamps';lamps.setAttribute('aria-hidden','true');
 for(const [list,cls] of [[LENS,'lens'],[AMBER,'amber']])for(const [x0,y0,x1,y1] of list){
  const i=document.createElement('i');i.className=cls;
  i.style.cssText=`left:${x0/1448*100}%;top:${y0/1043*100}%;width:${(x1-x0)/1448*100}%;height:${(y1-y0)/1043*100}%`;lamps.append(i)}
 car.append(lamps);lot.append(car);
 const lenny=build(LENNY,POS.lenny),dale=build(DALE,POS.dale);
 lot.classList.add('lot-layered');
 if(media.matches||!smoke)return;                    // reduced motion: idle frames, no smoke

 // ---- thin curling wisps off every lit tip, all the time ----
 const wispers=[[dale,{idle:.6,drag:.3,exhale:.3,flick:.4,shockA:.5,shockB:.5,smugA:.5,smugB:.5}],[lenny,{idle:.6,drag:.3,hold:.5,exhale:.3,giggle:.45,hypeA:.5,hypeB:.5,rageA:.6,rageB:.6}]];
 setInterval(()=>{for(const [a,prob] of wispers){if(Math.random()<(prob[a.pose]||0))smoke.emit('wisp',a.ember(),{tint:a.def.tint})}},170);

 // ---- Dale: cigarette ----
 (async function daleLoop(){
  let cycles=0;
  for(;;){
   dale.pose='idle';await dale.hold('idle',rnd(3500,6500));
   dale.flareUp();await dale.hold('drag',rnd(1000,1300));
   await exhaleSlot(2100);while(reacting)await wait(150);
   smoke.burst('cloud',dale.mouth,12,115,{tint:'cig'});
   setTimeout(()=>smoke.burst('puffsmall',dale.mouth,4,260,{tint:'cig'}),1100);
   await dale.hold('exhale',2000);
   if(++cycles%3===0){setTimeout(()=>smoke.spark(dale.ember(),8),260);await dale.hold('flick',1400)}
  }
 })();

 // ---- Lenny: joint (starts a beat later so the two don't sync up) ----
 (async function lennyLoop(){
  await wait(2200);
  for(;;){
   lenny.pose='idle';await lenny.hold('idle',rnd(4000,7000));
   lenny.flareUp();await lenny.hold('drag',rnd(1100,1500));
   await lenny.hold('hold',rnd(1300,1900));                              // holding it in: no cloud
   await exhaleSlot(2500);while(reacting)await wait(150);
   smoke.burst('cloud',lenny.mouth,15,120,{tint:'joint'});
   setTimeout(()=>smoke.burst('puffsmall',lenny.mouth,4,260,{tint:'joint'}),1300);
   await lenny.hold('exhale',2400);
   smoke.burst('puffsmall',lenny.mouth,3,300,{tint:'joint'});            // stoned giggle leaks a few small puffs
   await lenny.hold('giggle',rnd(1800,2400));
  }
 })();

 // ---- market reaction ----
 // up:   Lenny hype A/B (fast), Dale shock A/B, a nervous burst of puffs.
 // down: Lenny rage A/B (fast), Dale smug A/B (slow), a long sigh of smoke.
 const timers=[];const later=(fn,ms)=>timers.push(setTimeout(fn,ms));
 let lastAuto=0;
 function endReaction(){timers.forEach(clearTimeout);timers.length=0;reacting=false;lenny.show('idle');dale.show('idle')}
 function react(dir){
  if(reacting||!ok())return false;
  reacting=true;lenny.flare=0;dale.flare=0;
  const up=dir==='up',T=up?6200:6800;
  const L=up?['hypeA','hypeB']:['rageA','rageB'],D=up?['shockA','shockB']:['smugA','smugB'];
  lenny.show(L[0]);dale.show(D[0]);
  for(let t=330,k=1;t<T;t+=up?330:290,k++)later(()=>lenny.show(L[k%2]),t);
  const dStep=up?480:1250;for(let t=dStep,k=1;t<T;t+=dStep,k++)later(()=>dale.show(D[k%2]),t);
  if(up){
   smoke.burst('puffsmall',lenny.mouth,7,260,{tint:'joint'});smoke.burst('puffsmall',dale.mouth,6,300,{tint:'cig'});
   for(let t=300;t<T-800;t+=900)later(()=>{smoke.burst('puffsmall',lenny.mouth,3,200,{tint:'joint'})},t);
  }else{
   later(()=>smoke.burst('cloud',dale.mouth,16,170,{tint:'cig'}),700);
   later(()=>smoke.burst('cloud',lenny.mouth,10,190,{tint:'joint'}),1500);
   later(()=>{smoke.spark(dale.ember(),5)},2600);
  }
  later(endReaction,T);
  return true;
 }
 window.lotReact=react;

 // triggers: a big live trade (2 min cooldown) and the dock's "Check the bags" button while you're in the lot
 window.addEventListener('bigtrade',e=>{const d=e.detail||{};if(lot.classList.contains('hidden')||reacting)return;
  const now=Date.now();if(now-lastAuto<120000)return;if(react(d.buy?'up':'down'))lastAuto=now});
 document.addEventListener('click',e=>{
  if(!e.target.closest||!e.target.closest('#coin-gag')||lot.classList.contains('hidden'))return;
  e.stopImmediatePropagation();e.preventDefault();
  const m=window.tokenMood&&window.tokenMood();react(m?m.dir:(Math.random()<.5?'up':'down'))},true);
});
window.lotLayout=POS;
})();
