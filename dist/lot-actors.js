/* Parking lot: clean background + separate car / Lenny / Dale layers (replaces the characters painted into the scene).
   Dale smokes a cigarette: idle -> drag -> exhale -> idle (ash flick with sparks every 3rd cycle).
   Lenny smokes a joint:   idle -> drag -> hold -> exhale -> giggle -> idle.
   Both share an "exhale slot" so their big clouds never land on the same beat.
   Smoke, glowing embers and sparks are drawn by lot-smoke.js (canvas). */
(()=>{
const lot=document.querySelector('#parking');if(!lot)return;
const back=lot.querySelector('.backdrop');
const media=matchMedia('(prefers-reduced-motion: reduce)');
const rnd=(a,b)=>a+Math.random()*(b-a);
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const ok=()=>!media.matches&&!document.hidden&&!document.body.classList.contains('motion-paused')&&!lot.classList.contains('hidden');

// Positions are percent of the scene (1672x941). Tweak here to move or scale a layer.
const POS={
 car:   {x:22.0, y:40.4, w:39.8, z:2},
 lenny: {x:31.6, y:34.1, w:20.3, z:3},
 dale:  {x:68.0, y:40.4, w:18.3, z:2}
};
// Each actor's frames share one crop. Points are pixels of the original 1086x1448 canvas; (ox,oy) is the crop offset.
// ember = the burning tip; mouth = where the exhale leaves; glow = resting ember brightness for that pose (0..1).
const DALE={cls:'lot-dale',cw:986,ch:1401,ox:39,oy:0,tint:'cig',alt:'Dale smokes and studies a very long receipt',F:{
 idle:  {src:'assets/lot-dale-smoke-idle.webp?v=2',   ember:[712,310], glow:.30},
 drag:  {src:'assets/lot-dale-smoke-drag.webp?v=2',   ember:[716,288], glow:.30},
 exhale:{src:'assets/lot-dale-smoke-exhale.webp?v=2', ember:[309,235], mouth:[650,218], glow:.35},
 flick: {src:'assets/lot-dale-smoke-flick.webp?v=2',  ember:[138,607], glow:.40}}};
const LENNY={cls:'lot-lenny',cw:1043,ch:1441,ox:25,oy:7,tint:'joint',alt:'Lenny sits on the hood, smoking a joint and scrolling his phone',F:{
 idle:  {src:'assets/lot-lenny-joint-idle.webp',   ember:[647,389], glow:.32},
 drag:  {src:'assets/lot-lenny-joint-drag.webp',   ember:[665,363], glow:.32},
 hold:  {src:'assets/lot-lenny-joint-hold.webp',   ember:[326,313], glow:.45},
 exhale:{src:'assets/lot-lenny-joint-exhale.webp', ember:[614,794], mouth:[578,221], glow:.38},
 giggle:{src:'assets/lot-lenny-joint-giggle.webp', ember:[205,973], glow:.40}}};
const CAR={src:'assets/lot-car.webp'};

let exhaleUntil=0;                                   // shared slot: one big cloud at a time
async function exhaleSlot(ms){while(Date.now()<exhaleUntil)await wait(200);exhaleUntil=Date.now()+ms+700}

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
  a.mouth=()=>def.F.exhale.mouth?a.at(...def.F.exhale.mouth):null;
  a.show=n=>{a.pose=n;img.src=def.F[n].src};
  a.hold=async(name,ms)=>{a.show(name);const end=Date.now()+ms;while(Date.now()<end){if(!ok()){await wait(500);continue}await wait(100)}};
  a.flareUp=()=>{a.flare=1;a.flareT=performance.now()};      // ember flares on a drag, then settles
  if(smoke)smoke.glow(()=>{
   const base=def.F[a.pose].glow||.3,age=(performance.now()-a.flareT)/1300,f=a.flare?Math.max(0,1-age):0;
   const p=a.ember();if(!p)return null;return {x:p.x,y:p.y,level:Math.max(base,f)}});
  return a;
 }

 // car first (behind), then Lenny, then Dale
 const car=document.createElement('img');car.className='lot-layer lot-car';car.src=CAR.src;car.alt='Rusty red sedan';car.draggable=false;
 car.style.cssText=`left:${POS.car.x}%;top:${POS.car.y}%;width:${POS.car.w}%;z-index:${POS.car.z}`;lot.append(car);
 const lenny=build(LENNY,POS.lenny),dale=build(DALE,POS.dale);
 lot.classList.add('lot-layered');
 if(media.matches||!smoke)return;                    // reduced motion: idle frames, no smoke

 // ---- thin curling wisps off every lit tip, all the time ----
 const wispers=[[dale,{idle:.6,drag:.3,exhale:.3,flick:.4}],[lenny,{idle:.6,drag:.3,hold:.5,exhale:.3,giggle:.45}]];
 setInterval(()=>{for(const [a,prob] of wispers){if(Math.random()<(prob[a.pose]||0))smoke.emit('wisp',a.ember(),{tint:a.def.tint})}},170);

 // ---- Dale: cigarette ----
 (async function daleLoop(){
  let cycles=0;
  for(;;){
   dale.pose='idle';await dale.hold('idle',rnd(3500,6500));
   dale.flareUp();await dale.hold('drag',rnd(1000,1300));
   await exhaleSlot(2100);
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
   await exhaleSlot(2500);
   smoke.burst('cloud',lenny.mouth,15,120,{tint:'joint'});
   setTimeout(()=>smoke.burst('puffsmall',lenny.mouth,4,260,{tint:'joint'}),1300);
   await lenny.hold('exhale',2400);
   smoke.burst('puffsmall',lenny.mouth,3,300,{tint:'joint'});            // stoned giggle leaks a few small puffs
   await lenny.hold('giggle',rnd(1800,2400));
  }
 })();
});
window.lotLayout=POS;
})();
