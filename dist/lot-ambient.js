/* Parking lot ambient life: twinkling stars, failing streetlamp, buzzing canopy light, motel windows, live-trade pavement pulses. */
(()=>{
const lot=document.querySelector('#parking');if(!lot)return;
const media=matchMedia('(prefers-reduced-motion: reduce)');
const rnd=(a,b)=>a+Math.random()*(b-a);
const add=(cls,css,tag='div')=>{const e=document.createElement(tag);e.className=cls;e.setAttribute('aria-hidden','true');if(css)e.style.cssText=css;lot.append(e);return e};
const ok=()=>!media.matches&&!document.hidden&&!document.body.classList.contains('motion-paused')&&!lot.classList.contains('hidden');

// Stars: positions were measured on real sky pixels of parking.webp (percent of scene).
[[61.0,11.69],[73.92,6.27],[40.01,13.6],[72.91,22.42],[62.5,2.98],[31.82,3.83],[79.72,32.73],[67.22,17.75],[65.61,4.46],[91.93,12.75],[59.03,19.45],[62.2,16.79],[27.69,8.5],[45.81,2.66],[39.35,4.25],[32.36,9.35],[24.58,3.4],[61.72,33.26],[54.19,18.81],[57.12,5.42],[60.83,8.71],[46.65,21.57],[63.16,19.45],[70.81,3.4],[71.77,13.6]]
 .forEach(([x,y],i)=>add('lot-star',`left:${x}%;top:${y}%;--d:${rnd(2.4,6.2).toFixed(2)}s;--dl:${(-rnd(0,6)).toFixed(2)}s;--s:${i%4===0?4:3}px`,'i'));

// Lamps and canopy light reuse the neon flicker engine from sign-flicker.js, each on its own timer.
if(window.makeSignFlicker){['lot-lamp-a','lot-lamp-b','lot-canopy'].forEach(c=>window.makeSignFlicker('#parking',c))}

// Motel windows: a random window goes dark for a while, then comes back.
const wins=[[93.12,46.76,.78,1.7],[90.37,46.97,1.5,3.29],[86.48,48.25,.9,2.55],[83.79,48.67,1.02,2.44],[81.82,48.99,.84,1.38]]
 .map(([x,y,w,h])=>add('lot-win',`left:${x-.12}%;top:${y-.18}%;width:${w+.24}%;height:${h+.36}%`));
(function cycle(){setTimeout(()=>{if(ok()){const w=wins[Math.floor(Math.random()*wins.length)];w.classList.toggle('off');}cycle()},rnd(3500,9000))})();

// Pavement pulse under the car on each buy (green) / sell (red) shown on the register monitor.
const pulse=add('lot-pulse');
window.addEventListener('tradeflash',e=>{
 if(!ok())return;const d=e.detail||{};
 pulse.style.setProperty('--c',d.buy?'106,250,171':'255,107,90');
 pulse.style.setProperty('--a',String(Math.min(.85,.35+Math.log10(Math.max(10,d.usd||10))/6)));
 pulse.classList.remove('go');void pulse.offsetWidth;pulse.classList.add('go')});
})();
