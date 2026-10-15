/* Gentle, cancellable counter performance. Eye changes never mask the character silhouette. */
(()=>{
const actor=document.querySelector('.lenny'),world=document.querySelector('#world'),viewport=document.querySelector('#viewport'),scene=document.querySelector('#counter'),media=matchMedia('(prefers-reduced-motion: reduce)');
actor.innerHTML='<div class="actor-rig"><img class="actor-base" src="assets/lenny.webp" alt="Lenny holds his phone and blue slushie"><img class="blink-patch" src="assets/lenny-blink.webp" alt="" aria-hidden="true"></div>';
const rig=actor.querySelector('.actor-rig');const base=actor.querySelector('.actor-base');const watch=document.querySelector('#watch-gag');const poses=['rest','lift-low','lift-high','sip','freeze','talk-a','talk-b','spill-slip','spill-splat','check','hype-a','hype-b','rage-a','rage-b'].map(n=>'assets/lenny-'+n+'-final.webp');
const puddle=document.createElement('div');puddle.className='lenny-puddle';puddle.setAttribute('aria-hidden','true');scene.append(puddle);
function pose(i){if(framesReady){base.src=poses[i];rig.classList.toggle('is-sipping',i!==0)}}
function loadPose(src){const img=new Image();img.src=src;return img.decode().then(()=>{if(img.naturalWidth!==1145||img.naturalHeight!==1374)throw Error('Frame registration mismatch');return img})}
Promise.all(poses.map(loadPose)).then(images=>{window.lennyPoseImages=images;framesReady=true;pose(0);watch.disabled=false;watch.textContent='WATCH LENNY TAKE A SIP →';document.querySelector('#gag-status').textContent='Animation ready.'}).catch(()=>{watch.disabled=false;watch.textContent='TALK TO LENNY →';document.querySelector('#gag-status').textContent='Animation could not load. Dialogue is still available.'});let timers=[],blinkTimer=null,running=false,scriptIndex=0,framesReady=false;let targetX=0,targetY=0,x=0,y=0,frame=null,lastTime=0;
function enabled(){return !media.matches&&!document.body.classList.contains('motion-paused')&&!document.hidden}
function later(fn,ms){const id=setTimeout(fn,ms);timers.push(id);return id}
function stop(){timers.forEach(clearTimeout);timers=[];running=false;puddle.classList.remove('on');if(window.dalePerformance&&window.dalePerformance.stop&&!stop.fromDale)window.dalePerformance.stop();actor.classList.remove('phone-check','performance-active');rig.classList.remove('blinking');scene.classList.remove('phone-beat');pose(0);}
function blink(){if(!enabled()||running||scene.classList.contains('hidden'))return;rig.classList.add('blinking');later(()=>rig.classList.remove('blinking'),145)}
function scheduleBlink(){clearTimeout(blinkTimer);blinkTimer=setTimeout(()=>{blink();scheduleBlink()},4400+Math.random()*3200)}
const exchanges=[['Dale. I’m up twelve cents.','Good. You can cover the register shortage.'],['Bro. I think this is my last shift.','You said that yesterday. And Tuesday.'],['I’m calling this a business expense.','That is your fourth slushie.']];
function perform(){
if(scene.classList.contains('hidden')){changeRoom('counter');return}
stop();running=true;actor.classList.add('performance-active');
if(!enabled()||!framesReady){say('LENNY',exchanges[scriptIndex++%exchanges.length][0]);running=false;actor.classList.remove('performance-active');return}
// Full registered drawings, instant frame swaps: never crossfade two faces/hands.
pose(0);later(()=>pose(1),320);later(()=>pose(2),450);later(()=>pose(3),580);
later(()=>{pose(4);say('LENNY','Dale. My brain just rugged.')},1850);
later(()=>say('DALE','You’d need a brain for that.'),3450);
later(()=>pose(2),4300);later(()=>pose(1),4420);later(()=>pose(0),4560);
later(()=>{actor.classList.remove('performance-active');running=false},6100);
}

// Slushie spill -> checks the coin on his phone -> excited or furious depending on the market mood.
const MOOD_LINES={
 up:{lenny:['WE ARE SO BACK.','LOOK AT THE CANDLES. LOOK AT THEM.','I TOLD EVERYONE. I TOLD DALE.'],dale:['You spilled your slushie, Lenny.','That is a very green phone.']},
 down:{lenny:['WHO SOLD?! WHO SOLD?!','THIS IS FINE. THIS IS NOT FINE.','I DID NOT SPILL THAT FOR THIS.'],dale:['Told you.','Also, you spilled your slushie.']}
};
let moodIndex=0,lastAuto=0;
function marketMood(){const m=window.tokenMood&&window.tokenMood();return m||{dir:Math.random()<.5?'up':'down',pct:null,sym:'COIN'}}
function coinCheck(forced){
 if(scene.classList.contains('hidden')){changeRoom('counter');return}
 stop();running=true;actor.classList.add('performance-active');
 const m=forced?{...marketMood(),dir:forced}:marketMood(),up=m.dir==='up',L=MOOD_LINES[m.dir];
 if(!enabled()||!framesReady){say('LENNY',up?'We are SO back.':'Who sold?!');running=false;actor.classList.remove('performance-active');return}
 window.dalePerformance&&window.dalePerformance.coinReact(m.dir);
 const n=moodIndex++,pair=up?[10,11]:[12,13],pct=(forced||m.pct==null)?'':' '+(m.pct>=0?'+':'')+m.pct.toFixed(1)+'% today.';
 pose(7);later(()=>pose(8),650);later(()=>puddle.classList.add('on'),760);
 later(()=>{pose(9);say('LENNY','Hold on. Checking the bag...')},1700);
 later(()=>{say('LENNY',(pct?'$'+m.sym+pct+' ':'')+L.lenny[n%L.lenny.length])},3300);
 for(let t=3300,k=0;t<6700;t+=300,k++)later(()=>pose(pair[k%2]),t);
 later(()=>say('DALE',L.dale[n%L.dale.length]),5400);
 later(()=>pose(9),6800);later(()=>pose(0),7300);
 later(()=>{actor.classList.remove('performance-active');running=false},7700);
 later(()=>puddle.classList.remove('on'),11000);
}
window.addEventListener('bigtrade',e=>{
 const d=e.detail||{};if(running||!enabled()||!framesReady||scene.classList.contains('hidden'))return;
 const now=Date.now();if(now-lastAuto<120000)return;lastAuto=now;coinCheck(d.buy?'up':'down')});
const coinBtn=document.querySelector('#coin-gag');if(coinBtn)coinBtn.addEventListener('click',()=>coinCheck());
watch.addEventListener('click',perform);
// Capture replaces the old immediate line with one coherent timed exchange.
actor.addEventListener('click',e=>{e.stopImmediatePropagation();coinCheck()},true);actor.setAttribute('aria-label','Watch Lenny spill his slushie and check his coin');
function update(now){frame=null;if(!enabled()){x=y=targetX=targetY=0;world.style.setProperty('--mx','0px');world.style.setProperty('--my','0px');return}const dt=Math.min(50,now-(lastTime||now));lastTime=now;const k=1-Math.exp(-dt/110);x+=(targetX-x)*k;y+=(targetY-y)*k;world.style.setProperty('--mx',x.toFixed(3)+'px');world.style.setProperty('--my',y.toFixed(3)+'px');if(Math.abs(targetX-x)>.015||Math.abs(targetY-y)>.015)frame=requestAnimationFrame(update)}
function request(){if(!frame){lastTime=0;frame=requestAnimationFrame(update)}}
viewport.addEventListener('pointermove',e=>{if(e.pointerType!=='mouse'||!enabled())return;const r=viewport.getBoundingClientRect();targetX=((e.clientX-r.left)/r.width-.5)*8;targetY=((e.clientY-r.top)/r.height-.5)*4;request()});viewport.addEventListener('pointerleave',()=>{targetX=targetY=0;request()});
document.querySelector('#motion').addEventListener('click',()=>{if(!enabled())stop();targetX=targetY=0;request()});media.addEventListener('change',()=>{stop();request()});document.addEventListener('visibilitychange',()=>{if(document.hidden){stop();if(frame)cancelAnimationFrame(frame);frame=null}else{scheduleBlink();request()}});
// Cancel previous performances before the clicked control starts a new one.
document.addEventListener('click',e=>{if(running&&!actor.contains(e.target)&&!e.target.closest('#sound'))stop()},true);
function talk(name,text){if(!String(name).toLowerCase().includes('lenny')||running||!framesReady||!enabled()||scene.classList.contains('hidden'))return;stop();running=true;actor.classList.add('performance-active');const beats=[5,0,6,5,0,5,6,0,5,0,6,5,0];const duration=Math.min(3100,Math.max(1500,String(text).length*35));beats.forEach((p,i)=>later(()=>pose(p),i*duration/beats.length));later(()=>{pose(0);running=false;actor.classList.remove('performance-active')},duration)}
let talkIndex=0;document.querySelector('#lenny-talk').addEventListener('click',()=>{if(scene.classList.contains('hidden')){changeRoom('counter');return}stop();say('LENNY',exchanges[talkIndex++%exchanges.length][0])});
window.lennyPerformance={stop,play:perform,coinCheck,talk};scheduleBlink();
})();
