/* Speech bubbles: anchored to the speaker's head in whichever room is showing, and kept inside the viewport
   on every screen size (the scene covers the screen, so a fixed % position no longer lines up with the characters). */
(()=>{
const bub=document.querySelector('#bubble'),vp=document.querySelector('#viewport');
if(!bub||!vp||typeof window.say!=='function')return;
const orig=window.say;
// Where the tail points: [selector inside the room, x fraction, y fraction] of the speaker's layer (top of the head).
const ANCHOR={
 counter:  {lenny:['.lenny',.48,.05],            dale:['.dale',.56,.10]},
 parking:  {lenny:['.lot-lenny',.50,.02],        dale:['.lot-dale',.46,.03]},
 stockroom:{lenny:['.stock-lenny-layer',.44,.20],dale:['.stock-dale-layer',.60,.07]}
};
let speaker='lenny';
const roomId=()=>document.body.dataset.room||'counter';
const clamp=(v,a,b)=>Math.min(Math.max(v,a),Math.max(a,b));

function place(){
 const spec=(ANCHOR[roomId()]||ANCHOR.counter)[speaker];
 const el=document.querySelector('#'+roomId()+' '+spec[0]);
 const v=vp.getBoundingClientRect();if(!v.width)return;
 const m=12,bw=bub.offsetWidth,bh=bub.offsetHeight;
 let left,top,tx=bw/2,tail=0;
 const r=el&&el.getBoundingClientRect();
 const ax=r?r.left-v.left+r.width*spec[1]:-1,ay=r?r.top-v.top+r.height*spec[2]:-1;
 const onScreen=r&&ax>m&&ax<v.width-m&&ay>m&&ay<v.height-m;
 if(onScreen){
  left=clamp(ax-bw*.5,m,v.width-bw-m);
  top=ay-bh-26;                                     // sit above the head, tail points down at it
  if(top<m)top=m;                                   // not enough room above: stay on screen, lengthen the tail instead
  tail=clamp(ay-(top+bh)+6,14,90);
  tx=clamp(ax-left,34,bw-34);
 }else{                                              // speaker panned off-screen (phones): float at the top, no tail
  left=(v.width-bw)/2;top=Math.max(m,v.height*.12);
 }
 bub.style.left=Math.round(left+v.left)+'px';bub.style.top=Math.round(top+v.top)+'px';   // fixed positioning: screen coordinates, immune to the scene's scroll
 bub.style.setProperty('--tail-x',Math.round(tx)+'px');
 bub.style.setProperty('--tail-h',Math.round(tail)+'px');
 bub.classList.toggle('no-tail',!onScreen||tail<=0);
}

window.say=function(name,text){
 speaker=/dale|research/i.test(String(name))?'dale':'lenny';
 bub.style.setProperty('--tilt',(Math.random()*3-1.5).toFixed(2)+'deg');   // a little hand-drawn wobble, different each time
 orig.call(this,name,text);                        // fills the bubble and shows it
 place();
};
const again=()=>{if(bub.classList.contains('on'))place()};
window.addEventListener('resize',again);vp.addEventListener('scroll',again,{passive:true});
if('ResizeObserver' in window)new ResizeObserver(again).observe(vp);
})();
