/* Fully drawn expression swaps; no head/face silhouette clipping. */
(()=>{
const actor=document.querySelector('.dale'),image=actor.querySelector('img'),scene=document.querySelector('#counter'),media=matchMedia('(prefers-reduced-motion: reduce)');
const paths=['assets/dale.webp','assets/dale-blink-final.webp','assets/dale-side-eye-final.webp','assets/dale-talk-final.webp','assets/dale-notice-final.webp','assets/dale-smug-a-final.webp','assets/dale-smug-b-final.webp','assets/dale-shock-a-final.webp','assets/dale-shock-b-final.webp','assets/dale-eyeroll-final.webp'];let scripted=false;let ready=false,running=false,timers=[],idleTimer=null,line=0;
function enabled(){return !media.matches&&!document.hidden&&!document.body.classList.contains('motion-paused')&&!scene.classList.contains('hidden')}
function pose(i){if(ready)image.src=paths[i]}
function later(fn,ms){const id=setTimeout(fn,ms);timers.push(id);return id}
function stop(){timers.forEach(clearTimeout);timers=[];running=false;scripted=false;actor.classList.remove('dale-performing');pose(0)}
function load(src){const im=new Image();im.src=src;return im.decode().then(()=>{if(im.naturalWidth!==1328||im.naturalHeight!==1184)throw Error('Dale frame dimensions');return im})}
Promise.all(paths.map(load)).then(images=>{window.dalePoseImages=images;ready=true}).catch(()=>{ready=false});
function reply(){if(scripted)return;stop();if(!ready||!enabled())return;running=true;actor.classList.add('dale-performing');pose(3);later(()=>pose(2),160);later(()=>pose(3),320);later(()=>pose(2),550);later(()=>pose(3),770);later(()=>pose(2),980);later(()=>pose(3),1190);later(()=>pose(2),1390);later(()=>pose(1),2250);later(()=>pose(0),2460);later(()=>{running=false;actor.classList.remove('dale-performing')},2600)}
const responses=['Lenny calls this headquarters. The mop has seniority.','The hot dogs have been rotating since 2009. Explain that.','That’s not a roadmap. That’s a pizza box.','I’m not paranoid. The security cameras started it.'];
function play(){window.lennyPerformance?.stop();stop();const text=responses[line++%responses.length];if(!ready||!enabled()){say('DALE',text);return}running=true;actor.classList.add('dale-performing');pose(1);later(()=>pose(2),320);later(()=>say('DALE',text),1100)}
actor.addEventListener('click',e=>{e.stopImmediatePropagation();play()},true);actor.setAttribute('aria-label','Watch Dale slowly blink, give Lenny a side-eye, and reply');
function scheduleBlink(){clearTimeout(idleTimer);idleTimer=setTimeout(()=>{if(ready&&enabled()&&!running){pose(1);later(()=>pose(0),210)}scheduleBlink()},6500+Math.random()*5000)}scheduleBlink();
document.querySelector('#motion').addEventListener('click',()=>{if(!enabled())stop()});media.addEventListener('change',stop);document.addEventListener('visibilitychange',()=>{if(document.hidden)stop()});document.addEventListener('click',e=>{if(running&&!actor.contains(e.target)&&!e.target.closest('#sound')&&!e.target.closest('.lenny'))stop()},true);

// Dale's half of Lenny's coin-check scene: notices the spill, then shock (market up) or smug (market down).
function coinReact(mood){
 stop();if(!ready||!enabled())return;
 running=true;scripted=true;actor.classList.add('dale-performing');
 later(()=>pose(4),900);                                       // notices the spill
 if(mood==='up'){
  for(let t=3600,k=0;t<5400;t+=300,k++)later(()=>pose(k%2?8:7),t);   // disbelief
  later(()=>pose(9),5500);                                      // eye-roll at Lenny's celebration
 }else{
  later(()=>pose(5),3500);later(()=>pose(6),4300);later(()=>pose(5),5300);later(()=>pose(6),6000); // told you so
 }
 later(()=>pose(1),7200);later(()=>pose(0),7400);
 later(()=>{running=false;scripted=false;actor.classList.remove('dale-performing')},7700);
}
window.dalePerformance={play,reply,stop,coinReact};
})();
