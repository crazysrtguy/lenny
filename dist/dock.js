/* Dock follows the scene: each room shows its own actions (proxying the in-scene controls); shared controls stay everywhere.
   counter:   Talk to Lenny, Check the bags, Watch Lenny take a sip
   parking:   Honk, Stereo, Ask Dale, Check the bags
   stockroom: Fan, Steal a slice, Check the bags */
(()=>{
const dock=document.querySelector('#dock');if(!dock)return;
const $=s=>document.querySelector(s);
const ROOMS=['counter','parking','stockroom'];

// existing controls: tag which rooms they belong to
const scenes={'#lenny-talk':'counter','#watch-gag':'counter'};
for(const [sel,r] of Object.entries(scenes)){const el=$(sel);if(el){el.dataset.scenes=r;el.classList.add('dock-act')}}
const bags=$('#coin-gag');if(bags){bags.dataset.scenes='counter parking stockroom';bags.classList.add('dock-act')}

// new per-room actions: [id, label, rooms, selector of the in-scene control it triggers, aria-pressed mirrored?]
const ACTIONS=[
 ['dock-honk','HONK ♪','parking','#horn'],
 ['dock-stereo','STEREO ♫','parking','#stereo',true],
 ['dock-dale','ASK DALE','parking','#parking [data-person="research"]'],
 ['dock-fan','FAN','stockroom','#fan'],
 ['dock-slice','STEAL A SLICE','stockroom','#stockroom [data-person="pizza"]']
];
const anchor=$('#lenny-talk')||dock.lastElementChild;const mirrors=[];
for(const [id,label,rooms,target,mirror] of ACTIONS){
 const b=document.createElement('button');b.type='button';b.id=id;b.className='dock-act';b.dataset.scenes=rooms;b.textContent=label;b.hidden=true;
 anchor.before(b);
 b.addEventListener('click',()=>{const t=$(target);if(t)t.click()});
 if(mirror)mirrors.push([b,target]);
}
// the in-scene controls may be created after this script runs, so link the pressed state lazily
function linkMirrors(){for(const m of mirrors){if(m.done)continue;const t=$(m[1]);if(!t)continue;m.done=true;
 const sync=()=>m[0].setAttribute('aria-pressed',t.getAttribute('aria-pressed')||'false');sync();
 new MutationObserver(sync).observe(t,{attributes:true,attributeFilter:['aria-pressed']})}}

function apply(room){
 linkMirrors();
 if(!ROOMS.includes(room))room='counter';
 dock.dataset.room=room;
 dock.querySelectorAll('[data-scenes]').forEach(el=>{el.hidden=!el.dataset.scenes.split(' ').includes(room)});
 dock.querySelectorAll('.rooms button').forEach(b=>b.classList.toggle('active',b.dataset.room===room));
 // "Check the bags" means something different in each room
 if(bags)bags.title=room==='counter'?'Spill the slushie and check the coin':room==='parking'?'See how Lenny and Dale react to the coin':'See how the stockroom crew reacts to the coin';
}
// motion.js sets body[data-room] when a room is entered; follow it
new MutationObserver(()=>apply(document.body.dataset.room)).observe(document.body,{attributes:true,attributeFilter:['data-room']});
if(!document.body.dataset.room)document.body.dataset.room='counter';
apply(document.body.dataset.room);
})();
