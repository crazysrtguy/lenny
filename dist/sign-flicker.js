/* Random neon flicker for the OPEN sign: irregular bursts of stutters, buzzes and dips, then long steady stretches. */
(()=>{
const media=matchMedia('(prefers-reduced-motion: reduce)');
const rnd=(a,b)=>a+Math.random()*(b-a);
// Each pattern is a list of [dim level 0..1, milliseconds]; 0 = fully lit, 1 = tube nearly dead.
const patterns=[
 ()=>[[1,rnd(50,90)],[0,rnd(60,110)],[.9,rnd(40,70)],[0,rnd(90,200)],[.8,rnd(40,60)]],                       // quick stutter
 ()=>Array.from({length:Math.floor(rnd(6,11))},(_,i)=>[i%2?0:rnd(.6,1),rnd(25,65)]),                           // electrical buzz
 ()=>[[.35,rnd(90,160)],[.6,rnd(90,150)],[.9,rnd(120,260)],[.5,rnd(70,120)],[0,60]],                          // slow dying dip
 ()=>[[1,rnd(110,220)]],                                                                                       // single blink
 ()=>[[.7,rnd(50,80)],[0,rnd(40,70)],[1,rnd(60,100)],[0,rnd(50,90)],[.6,rnd(50,90)],[0,rnd(40,80)],[1,rnd(200,420)]] // fault: long drop-out
];
function sign(roomSel,cls,slow=1,gap=1){
 const room=document.querySelector(roomSel);if(!room)return null;
 const el=document.createElement('div');el.className='open-flicker '+cls;el.setAttribute('aria-hidden','true');room.append(el);
 const ok=()=>!media.matches&&!document.hidden&&!document.body.classList.contains('motion-paused')&&!room.classList.contains('hidden');
 const set=v=>el.style.setProperty('--dim',v.toFixed(2));
 function run(steps,done){let i=0;(function next(){if(i>=steps.length||!ok()){set(0);return done()}const [v,ms]=steps[i++];set(v);setTimeout(next,ms*slow)})()}
 function schedule(){const long=Math.random()<.18;setTimeout(()=>{if(!ok())return schedule();run(patterns[Math.floor(Math.random()*patterns.length)](),schedule)},(long?rnd(11000,19000):rnd(2200,8500))*gap)}
 schedule();
 return {now:i=>run(patterns[i??Math.floor(Math.random()*patterns.length)](),()=>{})};
}
window.makeSignFlicker=sign;
// Independent timers so the signs never flicker in sync.
window.signFlicker={store:sign('#counter','store-open'),lotOpen:sign('#parking','lot-open'),motel:sign('#parking','motel')};
// Stockroom hanging bulb: one flicker timer drives the bulb glow AND a soft dimming of the whole room.
window.signFlicker.stock=sign('#stockroom','stock-room',1,2.6);   // same quick flicker as the signs, but far fewer of them
(()=>{const el=document.querySelector('#stockroom .stock-room');if(!el)return;
 const bulb=document.createElement('i');bulb.className='stock-bulb-dim';bulb.setAttribute('aria-hidden','true');el.append(bulb)})();

})();
