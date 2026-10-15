/* Parking-lot smoke: a small canvas particle system (soft curling wisps, big exhale clouds, glowing embers, ash sparks).
   Coordinates are "u" units: fractions of the lot's width (both axes), so everything scales with the scene. */
(()=>{
const rnd=(a,b)=>a+Math.random()*(b-a);
const media=matchMedia('(prefers-reduced-motion: reduce)');

function sprite(rgb){
 const c=document.createElement('canvas');c.width=c.height=128;const g=c.getContext('2d');
 const gr=g.createRadialGradient(64,64,0,64,64,64);
 gr.addColorStop(0,`rgba(${rgb},1)`);gr.addColorStop(.45,`rgba(${rgb},0.78)`);gr.addColorStop(.75,`rgba(${rgb},0.28)`);gr.addColorStop(1,`rgba(${rgb},0)`);
 g.fillStyle=gr;g.fillRect(0,0,128,128);return c;
}
const SPR={cig:sprite('236,239,243'),joint:sprite('218,230,240')};

// Presets (velocities in u/s, radii in u, life in seconds)
const KIND={
 wisp:{r0:[.0024,.0036],r1:[.009,.014],life:[2.8,4.0],alpha:[.26,.38],vx:[-.004,.004],vy:[-.050,-.030],drag:.35,buoy:-.006,amp:[.003,.008],freq:[1.1,2.3]},
 cloud:{r0:[.006,.009],r1:[.028,.046],life:[3.0,4.6],alpha:[.44,.60],vx:[.030,.075],vy:[-.030,-.008],drag:.9,buoy:-.0065,amp:[.003,.007],freq:[.7,1.5]},
 puffsmall:{r0:[.003,.005],r1:[.014,.023],life:[2.2,3.2],alpha:[.34,.48],vx:[.012,.04],vy:[-.03,-.012],drag:.8,buoy:-.005,amp:[.002,.005],freq:[1,2]}
};

function create(lot){
 const cv=document.createElement('canvas');cv.className='lot-smoke-canvas';cv.setAttribute('aria-hidden','true');lot.append(cv);
 const ctx=cv.getContext('2d');let W=1,H=1,dpr=1;
 function fit(){const r=lot.getBoundingClientRect();dpr=Math.min(2,window.devicePixelRatio||1);W=Math.max(1,r.width);H=Math.max(1,r.height);cv.width=Math.round(W*dpr);cv.height=Math.round(H*dpr)}
 if('ResizeObserver' in window)new ResizeObserver(fit).observe(lot);fit();

 const parts=[],sparks=[],glows=[];
 const active=()=>!media.matches&&!document.hidden&&!document.body.classList.contains('motion-paused')&&!lot.classList.contains('hidden')&&lot.getBoundingClientRect().width>10;

 function emit(kind,pt,o={}){
  if(!active()||!pt)return;const k=Object.assign({},KIND[kind]||KIND.wisp,o);
  const sp=(o.tint==='cig')?SPR.cig:SPR.joint;
  const pick=a=>Array.isArray(a)?rnd(a[0],a[1]):a;
  parts.push({x:pt.x+rnd(-.002,.002),y:pt.y+rnd(-.002,.002),vx:pick(k.vx),vy:pick(k.vy),r0:pick(k.r0),r1:pick(k.r1),life:pick(k.life),age:0,alpha:pick(k.alpha),
   drag:k.drag,buoy:k.buoy,amp:pick(k.amp),freq:pick(k.freq),phase:rnd(0,6.28),spr:sp});
  while(parts.length>170)parts.shift();
 }
 function burst(kind,pt,n,gap,o){for(let i=0;i<n;i++)setTimeout(()=>emit(kind,typeof pt==='function'?pt():pt,o),i*gap)}
 function spark(pt,n=7){
  if(!active()||!pt)return;
  for(let i=0;i<n;i++)sparks.push({x:pt.x,y:pt.y,vx:rnd(-.05,.012),vy:rnd(.012,.05),life:rnd(.5,.95),age:0,size:rnd(.0011,.0022)});
 }
 // glow(): register an ember; get() returns {x,y,level} (level 0..1) each frame
 function glow(get){glows.push(get)}

 let last=0,raf=0;
 function frame(now){
  raf=0;
  if(!active()){parts.length=0;sparks.length=0;ctx.clearRect(0,0,cv.width,cv.height);raf=setTimeout(()=>{raf=0;kick()},400);return}
  const dt=Math.min(.05,last?(now-last)/1000:.016);last=now;
  ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,W,H);

  // smoke
  ctx.globalCompositeOperation='source-over';
  for(let i=parts.length-1;i>=0;i--){
   const p=parts[i];p.age+=dt;const t=p.age/p.life;if(t>=1){parts.splice(i,1);continue}
   p.vx*=Math.exp(-p.drag*dt);p.vy+=p.buoy*dt;
   p.x+=(p.vx+Math.sin(p.age*p.freq+p.phase)*p.amp+.004)*dt;   // curl + a faint breeze to the right
   p.y+=p.vy*dt;
   const env=t<.14?t/.14:Math.pow(1-t,1.35);
   const e=1-Math.pow(1-t,2.2),r=(p.r0+(p.r1-p.r0)*e)*W;
   ctx.globalAlpha=Math.max(0,p.alpha*env);
   ctx.drawImage(p.spr,p.x*W-r,p.y*W-r,r*2,r*2);
  }

  // embers + sparks (additive)
  ctx.globalCompositeOperation='lighter';
  for(const g of glows){
   const e=g();if(!e)continue;const lv=Math.max(0,Math.min(1,e.level)),fl=.85+.15*Math.sin(now/90+e.x*40);
   const r=W*(.0062+lv*.011)*fl,x=e.x*W,y=e.y*W;
   const gr=ctx.createRadialGradient(x,y,0,x,y,r);
   gr.addColorStop(0,`rgba(255,${150+lv*70|0},60,${.55+lv*.4})`);gr.addColorStop(.45,`rgba(255,110,30,${.22+lv*.28})`);gr.addColorStop(1,'rgba(255,90,20,0)');
   ctx.globalAlpha=1;ctx.fillStyle=gr;ctx.beginPath();ctx.arc(x,y,r,0,6.283);ctx.fill();
  }
  for(let i=sparks.length-1;i>=0;i--){
   const s=sparks[i];s.age+=dt;if(s.age>=s.life){sparks.splice(i,1);continue}
   s.vy+=.35*dt;s.x+=s.vx*dt;s.y+=s.vy*dt;const a=1-s.age/s.life;
   ctx.globalAlpha=a;ctx.fillStyle='rgb(255,170,70)';ctx.beginPath();ctx.arc(s.x*W,s.y*W,Math.max(.8,s.size*W),0,6.283);ctx.fill();
  }
  ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';
  raf=requestAnimationFrame(frame);
 }
 function kick(){if(!raf&&!media.matches){last=0;raf=requestAnimationFrame(frame)}}
 kick();
 return {emit,burst,spark,glow,active};
}
window.LotSmoke={create};
})();
