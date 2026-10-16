/* Ultra-wide screens: the scene fills the width and you scroll up/down to look around (like the swipe on phones). */
(()=>{
const vp=document.querySelector('#viewport');if(!vp)return;
const mq=matchMedia('(min-aspect-ratio: 19/9) and (min-width: 801px)');
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const bar=document.createElement('div');bar.className='wide-pan';bar.setAttribute('aria-label','Look around the scene');
bar.innerHTML='<button type="button" id="pan-up" aria-label="Look up">▲</button><button type="button" id="pan-down" aria-label="Look down">▼</button>';
document.body.append(bar);
const step=()=>Math.round(vp.clientHeight*.45);
const go=d=>vp.scrollBy({top:d*step(),behavior:reduced.matches?'instant':'smooth'});
bar.querySelector('#pan-up').onclick=()=>go(-1);bar.querySelector('#pan-down').onclick=()=>go(1);
// the characters' heads sit high in each scene and the counter low, so start 30% down rather than dead centre
function centre(){if(!mq.matches)return;vp.scrollTop=Math.max(0,(vp.scrollHeight-vp.clientHeight)*.3)}
function update(){
 bar.classList.toggle('on',mq.matches);
 if(mq.matches)requestAnimationFrame(centre);
}
mq.addEventListener('change',update);window.addEventListener('resize',()=>{const was=vp.scrollTop,max=vp.scrollHeight-vp.clientHeight;if(mq.matches&&max>0)vp.scrollTop=Math.min(max,was)});
// grey out the arrows at either end
vp.addEventListener('scroll',()=>{const max=vp.scrollHeight-vp.clientHeight;bar.querySelector('#pan-up').disabled=vp.scrollTop<=2;bar.querySelector('#pan-down').disabled=vp.scrollTop>=max-2},{passive:true});
// mouse drag to pan (desktop) — only on empty scene, not on buttons/hotspots
let drag=null;
vp.addEventListener('pointerdown',e=>{if(!mq.matches||e.pointerType!=='mouse'||e.button!==0||e.target.closest('button,a,.hotspot,.sprite'))return;drag={y:e.clientY,top:vp.scrollTop}});
window.addEventListener('pointermove',e=>{if(drag){vp.scrollTop=drag.top-(e.clientY-drag.y)}});
window.addEventListener('pointerup',()=>{drag=null});
if(document.readyState==='complete')update();else window.addEventListener('load',update);
})();
