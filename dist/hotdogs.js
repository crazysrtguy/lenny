/* Independent cylindrical food surfaces over a stationary illustrated machine. */
(()=>{
const roller=document.querySelector('#roller'),machine=roller.querySelector('img'),room=document.querySelector('#counter'),media=matchMedia('(prefers-reduced-motion: reduce)');
let skin=null,items=[],frame=null,last=0,elapsed=0,ready=false,speed=.14,mode=0;
// Coordinates measured in the machine artwork: three evenly spaced roller lanes.
const layout=[[300,245,515,64],[870,211,490,64],[345,325,525,66],[920,291,500,66],[395,405,525,68],[975,370,490,68]];
function align(){
 const box=roller.getBoundingClientRect();
 if(!box.width||!box.height)return;
 // Match the illustrated rails even when the scene stretches the prop.
 const slope=-.06*(box.height/887)/(box.width/1774);
 items.forEach(({canvas})=>{canvas.style.transform=`matrix(1,${slope},0,1,0,0)`;canvas.style.transformOrigin='0 0'});
}

function canRun(){return ready&&!media.matches&&!document.hidden&&!document.body.classList.contains('motion-paused')&&!room.classList.contains('hidden')}
function pill(c,w,h){c.beginPath();c.moveTo(h/2,0);c.lineTo(w-h/2,0);c.arc(w-h/2,h/2,h/2,-Math.PI/2,Math.PI/2);c.lineTo(h/2,h);c.arc(h/2,h/2,h/2,Math.PI/2,Math.PI*1.5);c.closePath()}
function draw(item,index){const c=item.context,w=item.canvas.width,h=item.canvas.height,phase=elapsed*speed+index*.147;c.clearRect(0,0,w,h);c.save();pill(c,w,h);c.clip();c.fillStyle='#cb350c';c.fillRect(0,0,w,h);
// The texture travels around the long axis while the capsule contour stays fixed.
for(let y=0;y<h;y+=2){const v=(y+1)/h*2-1;const theta=Math.asin(Math.max(-1,Math.min(1,v)));const t=((theta/(Math.PI*2)+phase)%1+1)%1;const sy=222+t*270;c.drawImage(skin,65,sy,2038,2,0,y,w,2)}
const shade=c.createLinearGradient(0,0,0,h);shade.addColorStop(0,'rgba(255,184,87,.27)');shade.addColorStop(.32,'rgba(255,239,168,.12)');shade.addColorStop(.65,'rgba(0,0,0,.02)');shade.addColorStop(1,'rgba(54,5,0,.6)');c.fillStyle=shade;c.fillRect(0,0,w,h);c.restore();pill(c,w-1,h-1);c.strokeStyle='#25170e';c.lineWidth=1.7;c.stroke();c.strokeStyle='#37180c';c.lineWidth=1;for(const x of [8,w-8]){c.beginPath();c.moveTo(x,h*.28);c.lineTo(x+(x<w/2?3:-3),h*.5);c.lineTo(x,h*.76);c.stroke()}}
function paint(){items.forEach(draw)}
function tick(now){frame=null;if(!canRun())return;if(!last)last=now;const delta=Math.min(90,now-last);if(delta>=1000/24){elapsed+=delta/1000;last=now;paint()}frame=requestAnimationFrame(tick)}
function refresh(){if(canRun()){if(!frame){last=0;frame=requestAnimationFrame(tick)}}else{if(frame)cancelAnimationFrame(frame);frame=null;last=0;if(ready)paint()}}
function load(src){const im=new Image();im.src=src;return im.decode().then(()=>im)}
Promise.all([load('assets/hotdog-skin.png'),load('assets/roller-empty.png')]).then(([texture,base])=>{if(texture.naturalWidth!==2172||texture.naturalHeight!==724||base.naturalWidth!==1774||base.naturalHeight!==887)throw Error('Roller artwork size mismatch');skin=texture;const prepared=layout.map(([x,y,w,h],i)=>{const canvas=document.createElement('canvas');canvas.width=256;canvas.height=48;canvas.className='hotdog-cylinder';canvas.setAttribute('aria-hidden','true');canvas.style.cssText=`left:${x/1774*100}%;top:${y/887*100}%;width:${w/1774*100}%;height:${h/887*100}%;z-index:${2+Math.floor(i/2)}`;const context=canvas.getContext('2d');if(!context)throw Error('Canvas unavailable');return{canvas,context}});items=prepared;machine.src='assets/roller-empty.png';items.forEach(item=>roller.append(item.canvas));roller.classList.add('roller-ready');ready=true;roller.setAttribute('aria-label','Hot dogs rolling. Click to change motor speed.');align();paint();refresh()}).catch(()=>{/* Keep the intact original prop if artwork or Canvas is unavailable. */});
roller.addEventListener('click',()=>{mode=(mode+1)%3;speed=[.14,.32,-.17][mode];roller.setAttribute('aria-label',`Hot-dog roller: ${['normal','fast','reverse'][mode]}. Click to change motor speed.`);refresh()});document.querySelector('#motion').addEventListener('click',refresh);media.addEventListener('change',refresh);document.addEventListener('visibilitychange',refresh);window.addEventListener('resize',align);if(typeof ResizeObserver!=='undefined')new ResizeObserver(align).observe(roller);window.hotdogRoller={refresh};
})();
