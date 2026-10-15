/* Fully drawn expression swaps; no head/face silhouette clipping. */
(()=>{
const actor=document.querySelector('.dale'),image=actor.querySelector('img'),scene=document.querySelector('#counter'),media=matchMedia('(prefers-reduced-motion: reduce)');
const paths=['assets/dale.png','assets/dale-blink-final.png','assets/dale-side-eye-final.png','assets/dale-talk-final.png'];let ready=false,running=false,timers=[],idleTimer=null,line=0;
function enabled(){return !media.matches&&!document.hidden&&!document.body.classList.contains('motion-paused')&&!scene.classList.contains('hidden')}
function pose(i){if(ready)image.src=paths[i]}
function later(fn,ms){const id=setTimeout(fn,ms);timers.push(id);return id}
function stop(){timers.forEach(clearTimeout);timers=[];running=false;actor.classList.remove('dale-performing');pose(0)}
function load(src){const im=new Image();im.src=src;return im.decode().then(()=>{if(im.naturalWidth!==1328||im.naturalHeight!==1184)throw Error('Dale frame dimensions');return im})}
Promise.all(paths.map(load)).then(images=>{window.dalePoseImages=images;ready=true}).catch(()=>{ready=false});
function reply(){stop();if(!ready||!enabled())return;running=true;actor.classList.add('dale-performing');pose(3);later(()=>pose(2),160);later(()=>pose(3),320);later(()=>pose(2),550);later(()=>pose(3),770);later(()=>pose(2),980);later(()=>pose(3),1190);later(()=>pose(2),1390);later(()=>pose(1),2250);later(()=>pose(0),2460);later(()=>{running=false;actor.classList.remove('dale-performing')},2600)}
const responses=['Lenny calls this headquarters. The mop has seniority.','The hot dogs have been rotating since 2009. Explain that.','That’s not a roadmap. That’s a pizza box.','I’m not paranoid. The security cameras started it.'];
function play(){window.lennyPerformance?.stop();stop();const text=responses[line++%responses.length];if(!ready||!enabled()){say('DALE',text);return}running=true;actor.classList.add('dale-performing');pose(1);later(()=>pose(2),320);later(()=>say('DALE',text),1100)}
actor.addEventListener('click',e=>{e.stopImmediatePropagation();play()},true);actor.setAttribute('aria-label','Watch Dale slowly blink, give Lenny a side-eye, and reply');
function scheduleBlink(){clearTimeout(idleTimer);idleTimer=setTimeout(()=>{if(ready&&enabled()&&!running){pose(1);later(()=>pose(0),210)}scheduleBlink()},6500+Math.random()*5000)}scheduleBlink();
document.querySelector('#motion').addEventListener('click',()=>{if(!enabled())stop()});media.addEventListener('change',stop);document.addEventListener('visibilitychange',()=>{if(document.hidden)stop()});document.addEventListener('click',e=>{if(running&&!actor.contains(e.target)&&!e.target.closest('#sound')&&!e.target.closest('.lenny'))stop()},true);
window.dalePerformance={play,reply,stop};
})();
