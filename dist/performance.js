/* Gentle, cancellable counter performance. Eye changes never mask the character silhouette. */
(()=>{
const actor=document.querySelector('.lenny'),world=document.querySelector('#world'),viewport=document.querySelector('#viewport'),scene=document.querySelector('#counter'),media=matchMedia('(prefers-reduced-motion: reduce)');
actor.innerHTML='<div class="actor-rig"><img class="actor-base" src="assets/lenny.png" alt="Lenny holds his phone and blue slushie"><img class="blink-patch" src="assets/lenny-blink.png" alt="" aria-hidden="true"></div>';
const rig=actor.querySelector('.actor-rig');let timers=[],blinkTimer=null,running=false,scriptIndex=0;let targetX=0,targetY=0,x=0,y=0,frame=null,lastTime=0;
function enabled(){return !media.matches&&!document.body.classList.contains('motion-paused')&&!document.hidden}
function later(fn,ms){const id=setTimeout(fn,ms);timers.push(id);return id}
function stop(){timers.forEach(clearTimeout);timers=[];running=false;actor.classList.remove('phone-check','performance-active');rig.classList.remove('blinking');scene.classList.remove('phone-beat');}
function blink(){if(!enabled()||scene.classList.contains('hidden'))return;rig.classList.add('blinking');later(()=>rig.classList.remove('blinking'),145)}
function scheduleBlink(){clearTimeout(blinkTimer);blinkTimer=setTimeout(()=>{blink();scheduleBlink()},4400+Math.random()*3200)}
const exchanges=[['Dale. I’m up twelve cents.','Good. You can cover the register shortage.'],['Bro. I think this is my last shift.','You said that yesterday. And Tuesday.'],['I’m calling this a business expense.','That is your fourth slushie.']];
function perform(){if(scene.classList.contains('hidden'))return;stop();running=true;actor.classList.add('performance-active');if(!enabled()){say('LENNY',exchanges[scriptIndex++%exchanges.length][0]);running=false;return}const pair=exchanges[scriptIndex++%exchanges.length];blink();later(()=>{scene.classList.add('phone-beat');actor.classList.add('phone-check')},240);later(()=>{scene.classList.remove('phone-beat');say('LENNY',pair[0])},1250);later(()=>{blink();say('DALE',pair[1])},3750);later(()=>{actor.classList.remove('phone-check','performance-active');running=false},6200)}
// Capture replaces the old immediate line with one coherent timed exchange.
actor.addEventListener('click',e=>{e.stopImmediatePropagation();perform()},true);actor.setAttribute('aria-label','Watch Lenny check his phone and banter with Dale');
function update(now){frame=null;if(!enabled()){x=y=targetX=targetY=0;world.style.setProperty('--mx','0px');world.style.setProperty('--my','0px');return}const dt=Math.min(50,now-(lastTime||now));lastTime=now;const k=1-Math.exp(-dt/110);x+=(targetX-x)*k;y+=(targetY-y)*k;world.style.setProperty('--mx',x.toFixed(3)+'px');world.style.setProperty('--my',y.toFixed(3)+'px');if(Math.abs(targetX-x)>.015||Math.abs(targetY-y)>.015)frame=requestAnimationFrame(update)}
function request(){if(!frame){lastTime=0;frame=requestAnimationFrame(update)}}
viewport.addEventListener('pointermove',e=>{if(e.pointerType!=='mouse'||!enabled())return;const r=viewport.getBoundingClientRect();targetX=((e.clientX-r.left)/r.width-.5)*8;targetY=((e.clientY-r.top)/r.height-.5)*4;request()});viewport.addEventListener('pointerleave',()=>{targetX=targetY=0;request()});
document.querySelector('#motion').addEventListener('click',()=>{if(!enabled())stop();targetX=targetY=0;request()});media.addEventListener('change',()=>{stop();request()});document.addEventListener('visibilitychange',()=>{if(document.hidden){stop();if(frame)cancelAnimationFrame(frame);frame=null}else{scheduleBlink();request()}});
// Avoid idle scripts talking over navigation or another interaction.
document.addEventListener('click',e=>{if(running&&!actor.contains(e.target)&&!e.target.closest('#sound'))stop()});
window.lennyPerformance={stop,play:perform};scheduleBlink();
})();
