/* Register monitor: rotates live token stats, a candle chart, and flashes each new buy/sell. */
(()=>{
const TOKEN={mint:'2j5SaS7xy776qCBpyPQbZjyQSAtKiFgrwjfErthnW2ZM'};
const mon=document.querySelector('.regmon'),screen=mon&&mon.querySelector('.screen');if(!screen)return;
const tabs=[...mon.querySelectorAll('.mon-tabs button')];let view='live',lastAct=Date.now();
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
const GT='https://api.geckoterminal.com/api/v2/networks/solana/pools/';
let slides=[{a:'$SHIFT',b:'HOW TO BUY →'}],candles=[],pool=null,lastPair=null,recent=[],sym='TOKEN',i=0,timer=null;
const seen=new Set(),queue=[];let primed=false;
const usd=n=>n>=1e9?'$'+(n/1e9).toFixed(2)+'B':n>=1e6?'$'+(n/1e6).toFixed(2)+'M':n>=1e3?'$'+(n/1e3).toFixed(1)+'K':'$'+n.toFixed(0);
const price=p=>{const n=+p;if(!n)return '—';return '$'+(n>=1?n.toFixed(2):n>=.01?n.toFixed(4):n.toFixed(Math.min(12,2-Math.floor(Math.log10(n)))))};
const pct=v=>v==null?'—':(v>=0?'▲ +':'▼ ')+v.toFixed(1)+'%';
const compact=n=>n>=1e9?(n/1e9).toFixed(2)+'B':n>=1e6?(n/1e6).toFixed(2)+'M':n>=1e3?(n/1e3).toFixed(1)+'K':n.toFixed(0);
function build(p){lastPair=p;const t=p.baseToken,ca=TOKEN.mint.slice(0,4)+'…'+TOKEN.mint.slice(-4);sym=t.symbol.toUpperCase().slice(0,10);
 const s=[{a:'$'+sym,b:t.name.toUpperCase().slice(0,22)},
 {a:'PRICE '+price(p.priceUsd),b:'24H '+pct(p.priceChange?.h24)},
 {type:'chart'},
 {a:'MCAP '+usd(p.marketCap||p.fdv||0),b:'LIQ '+usd(p.liquidity?.usd||0)},
 {a:'VOL 24H '+usd(p.volume?.h24||0),b:(p.txns?.h24?.buys??0)+' BUYS / '+(p.txns?.h24?.sells??0)+' SELLS'},
 {a:'CA '+ca,b:'HOW TO BUY →'}];return s}
function reset(cls){screen.className='screen'+(cls?' '+cls:'');screen.replaceChildren()}
function restartFlash(){if(reduced)return;screen.classList.remove('tk-flash');void screen.offsetWidth;screen.classList.add('tk-flash')}
function drawChart(canvas){
 const r=canvas.getBoundingClientRect(),dpr=devicePixelRatio||1;canvas.width=Math.max(10,Math.round(r.width*dpr));canvas.height=Math.max(10,Math.round(r.height*dpr));
 const c=canvas.getContext('2d'),W=canvas.width,H=canvas.height,list=candles.slice(-28);if(!c||!list.length)return;
 const hi=Math.max(...list.map(k=>k[2])),lo=Math.min(...list.map(k=>k[3])),span=(hi-lo)||hi*.01||1;
 const y=v=>H-2*dpr-(v-lo)/span*(H-4*dpr),step=W/list.length,bw=Math.max(1,step*.6);
 c.lineWidth=Math.max(1,dpr);
 list.forEach((k,n)=>{const up=k[4]>=k[1],col=up?'#6afaab':'#ff6b5a',x=n*step+step/2;c.strokeStyle=c.fillStyle=col;c.beginPath();c.moveTo(x,y(k[2]));c.lineTo(x,y(k[3]));c.stroke();const top=y(Math.max(k[1],k[4])),bot=y(Math.min(k[1],k[4]));c.fillRect(x-bw/2,top,bw,Math.max(dpr,bot-top))});
}
function showSlide(){const s=slides[i%slides.length];i++;
 if(s.type==='chart'){if(candles.length<3)return showSlide();reset('tk-chart');const cv=document.createElement('canvas');cv.className='tk-canvas';cv.setAttribute('aria-hidden','true');const sm=document.createElement('small');const last=candles[candles.length-1],first=candles[0];sm.textContent='5M '+pct((last[4]-first[1])/first[1]*100);screen.className='screen tk-chart '+(last[4]>=first[1]?'tk-up':'tk-down');screen.append(cv,sm);restartFlash();drawChart(cv);return 4800}
 reset(/▲/.test(s.b)?'tk-up':/▼/.test(s.b)?'tk-down':'');const a=document.createElement('span');a.className='tk-main';a.textContent=s.a;const b=document.createElement('small');b.textContent=s.b;screen.append(a,b);restartFlash();return 2800}
function showTrade(t){reset(t.buy?'tk-buy':'tk-sell');const a=document.createElement('span');a.className='tk-main';a.textContent=(t.buy?'▲ BUY ':'▼ SELL ')+usd(t.usd);const b=document.createElement('small');b.textContent=compact(t.tokens)+' $'+sym;screen.append(a,b);restartFlash();return 1300}
function step(){clearTimeout(timer);let wait=1000;if(view==='live'&&!document.hidden){const t=queue.shift();wait=t?showTrade(t):showSlide()}timer=setTimeout(step,wait)}
const BIG_TRADE=500;
window.tokenMood=()=>{const c=lastPair&&lastPair.priceChange;const v=c&&(c.h24!=null?c.h24:c.h1);if(v==null)return null;return{dir:v>=0?'up':'down',pct:v,sym}};
function ingest(trades){
 recent=trades.slice().sort((a,b)=>b.ts-a.ts).slice(0,40);
 const fresh=trades.filter(t=>!seen.has(t.id));trades.forEach(t=>seen.add(t.id));
 if(!primed){primed=true;return}// first load = history, don't replay it
 fresh.sort((a,b)=>a.ts-b.ts);const big=fresh.filter(x=>x.usd>=BIG_TRADE).sort((a,b)=>b.usd-a.usd)[0];if(big)window.dispatchEvent(new CustomEvent('bigtrade',{detail:{buy:big.buy,usd:big.usd}}));queue.push(...fresh.slice(-10));if(queue.length>12)queue.splice(0,queue.length-12)}
function chartView(){if(candles.length<3){reset();screen.textContent='NO CHART YET';return}reset('tk-bigchart');const cv=document.createElement('canvas');cv.className='tk-canvas';cv.setAttribute('aria-label','5 minute candle chart');const sm=document.createElement('small');const last=candles[candles.length-1],first=candles[0];sm.textContent='$'+sym+' 5M '+pct((last[4]-first[1])/first[1]*100);screen.className='screen tk-bigchart '+(last[4]>=first[1]?'tk-up':'tk-down');screen.append(cv,sm);drawChart(cv)}
function tradesView(){reset('tk-list');if(!recent.length){screen.textContent='WAITING FOR TRADES…';return}const age=ts=>{const x=Math.max(0,Math.round((Date.now()-ts)/1000));return x<60?x+'s':Math.round(x/60)+'m'};recent.slice(0,8).forEach(t=>{const row=document.createElement('div');row.className='tk-row '+(t.buy?'b':'s');[[t.buy?'BUY':'SELL','span'],[usd(t.usd),'span'],[compact(t.tokens),'span'],[age(t.ts),'i']].forEach(([txt,tag])=>{const c=document.createElement(tag);c.textContent=txt;row.append(c)});screen.append(row)})}
function buyView(){reset('tk-buyview');const a=document.createElement('span');a.className='tk-main';a.textContent=lastPair?'$'+sym+' '+price(lastPair.priceUsd):'$'+sym;screen.append(a);
 const buy=document.createElement('a');buy.className='mon-btn';buy.textContent='BUY ON PUMP.FUN ↗';buy.href='https://pump.fun/coin/'+TOKEN.mint;buy.target='_blank';buy.rel='noopener noreferrer';
 const cp=document.createElement('button');cp.type='button';cp.className='mon-btn alt';cp.textContent='COPY CONTRACT';cp.onclick=async()=>{try{await navigator.clipboard.writeText(TOKEN.mint);cp.textContent='COPIED ✓'}catch(e){cp.textContent=TOKEN.mint.slice(0,8)+'…'}setTimeout(()=>cp.textContent='COPY CONTRACT',1800)};
 const full=document.createElement('button');full.type='button';full.className='mon-btn alt';full.textContent='FULL COIN PAGE →';full.onclick=()=>openCoin();screen.append(buy,cp,full)}
function renderView(){if(view==='chart')chartView();else if(view==='trades')tradesView();else if(view==='buy')buyView()}
function setView(v){view=v;lastAct=Date.now();tabs.forEach(b=>b.setAttribute('aria-selected',String(b.dataset.view===v)));if(v==='live'){i=0;step()}else renderView()}
tabs.forEach(b=>b.addEventListener('click',e=>{e.stopPropagation();setView(b.dataset.view)}));
['pointermove','pointerdown','focusin','keydown'].forEach(ev=>mon.addEventListener(ev,()=>{lastAct=Date.now()}));
setInterval(()=>{if(view!=='live'&&Date.now()-lastAct>25000&&!mon.matches(':hover,:focus-within'))setView('live')},1000);
async function loadMarket(){try{const r=await fetch('https://api.dexscreener.com/latest/dex/tokens/'+TOKEN.mint);if(!r.ok)throw 0;const d=await r.json();const pairs=(d.pairs||[]).filter(p=>p.chainId==='solana'&&p.baseToken?.address===TOKEN.mint).sort((a,b)=>(b.liquidity?.usd||0)-(a.liquidity?.usd||0));if(pairs[0]){pool=pairs[0].pairAddress;slides=build(pairs[0])}}catch(e){/* keep previous slides */}}
async function loadCandles(){if(!pool)return;try{const r=await fetch(GT+pool+'/ohlcv/minute?aggregate=5&limit=36');if(!r.ok)throw 0;const d=await r.json();candles=(d.data?.attributes?.ohlcv_list||[]).slice().sort((a,b)=>a[0]-b[0])}catch(e){}}
async function loadTrades(){if(!pool)return;try{const r=await fetch(GT+pool+'/trades');if(!r.ok)throw 0;const d=await r.json();ingest((d.data||[]).map(x=>{const a=x.attributes,buy=a.kind==='buy';return{id:a.tx_hash,ts:Date.parse(a.block_timestamp),buy,usd:+a.volume_in_usd||0,tokens:+(buy?a.to_token_amount:a.from_token_amount)||0}}))}catch(e){}}
async function loadAll(){try{const r=await fetch('/api/token');if(!r.ok)throw 0;const d=await r.json();if(!d.pair)throw 0;pool=d.pair.pairAddress;slides=build(d.pair);if(d.candles?.length)candles=d.candles.slice().sort((x,y)=>x[0]-y[0]);ingest(d.trades||[]);if(view!=='live')renderView();return true}catch(e){return false}}
(async()=>{
 // Deployed on Vercel: one cached /api/token call. Locally (static server) fall back to direct public APIs.
 if(await loadAll()){step();setInterval(loadAll,5000);return}
 await loadMarket();await Promise.all([loadCandles(),loadTrades()]);step();
 setInterval(loadMarket,30000);setInterval(loadCandles,60000);setInterval(loadTrades,10000)
})();


// Clicking the register opens our own coin page (pump.fun refuses to be framed, so we rebuild it from the same data).
const panel=document.querySelector('#panel'),content=document.querySelector('#panel-content');let live=null,logo=null;
const el=(tag,cls,text)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(text!=null)n.textContent=text;return n};
const ago=ts=>{const s=Math.max(0,Math.round((Date.now()-ts)/1000));return s<60?s+'s':s<3600?Math.round(s/60)+'m':Math.round(s/3600)+'h'};
function bigChart(cv){const dpr=devicePixelRatio||1,r=cv.getBoundingClientRect();cv.width=Math.round(r.width*dpr);cv.height=Math.round(r.height*dpr);const c=cv.getContext('2d'),W=cv.width,H=cv.height,list=candles.slice(-36);
 c.fillStyle='#0a1018';c.fillRect(0,0,W,H);if(!list.length){c.fillStyle='#a6a797';c.font=14*dpr+'px monospace';c.fillText('NO CANDLE DATA YET',16*dpr,H/2);return}
 const padR=62*dpr,padT=10*dpr,padB=18*dpr,cw=W-padR,ch=H-padT-padB,hi=Math.max(...list.map(k=>k[2])),lo=Math.min(...list.map(k=>k[3])),span=(hi-lo)||hi*.01||1,y=v=>padT+(hi-v)/span*ch,step=cw/list.length,bw=Math.max(2*dpr,step*.62);
 c.strokeStyle='#ffffff14';c.fillStyle='#a6a797';c.font=10*dpr+'px monospace';c.lineWidth=dpr;
 for(let g=0;g<=3;g++){const v=hi-span*g/3,yy=y(v);c.beginPath();c.moveTo(0,yy);c.lineTo(cw,yy);c.stroke();c.fillText(price(v).replace('$',''),cw+6*dpr,yy+3*dpr)}
 const vmax=Math.max(...list.map(k=>k[5]||0))||1;
 list.forEach((k,n)=>{const up=k[4]>=k[1],col=up?'#6afaab':'#ff6b5a',x=n*step+step/2;c.fillStyle=col+'33';const vh=(k[5]||0)/vmax*ch*.22;c.fillRect(x-bw/2,padT+ch-vh,bw,vh);c.strokeStyle=c.fillStyle=col;c.beginPath();c.moveTo(x,y(k[2]));c.lineTo(x,y(k[3]));c.stroke();const t=y(Math.max(k[1],k[4])),b=y(Math.min(k[1],k[4]));c.fillRect(x-bw/2,t,bw,Math.max(dpr,b-t))});
 const last=list[list.length-1][4],ly=y(last);c.setLineDash([4*dpr,4*dpr]);c.strokeStyle='#f3e3bb99';c.beginPath();c.moveTo(0,ly);c.lineTo(cw,ly);c.stroke();c.setLineDash([]);c.fillStyle='#f3e3bb';c.fillRect(cw,ly-8*dpr,padR,16*dpr);c.fillStyle='#151c25';c.font='bold '+10*dpr+'px monospace';c.fillText(price(last).replace('$',''),cw+6*dpr,ly+3.5*dpr)}
function render(){if(!lastPair)return;const p=lastPair,t=p.baseToken;content.replaceChildren();
 const head=el('div','tk-head');const info=p.info||{};if(info.imageUrl){if(!logo||logo.dataset.src!==info.imageUrl){logo=el('img','tk-logo');logo.dataset.src=info.imageUrl;logo.alt='';logo.referrerPolicy='no-referrer';logo.src=info.imageUrl}head.append(logo)}
 const ttl=el('div');ttl.append(el('span','eyebrow','REGISTER // LIVE FROM PUMP.FUN'),el('h1','tk-title',t.name+' · $'+t.symbol));head.append(ttl);content.append(head);
 const ch24=p.priceChange?.h24;const stats=el('div','tk-stats');
 [['PRICE',price(p.priceUsd)],['24H',pct(ch24)],['MCAP',usd(p.marketCap||p.fdv||0)],['LIQUIDITY',usd(p.liquidity?.usd||0)],['VOL 24H',usd(p.volume?.h24||0)],['BUYS / SELLS 24H',(p.txns?.h24?.buys??0)+' / '+(p.txns?.h24?.sells??0)]].forEach(([k,v])=>{const d=el('div','tk-stat');d.append(el('b',null,k),el('span',(k==='24H'?(ch24>=0?'tk-g':'tk-r'):''),v));stats.append(d)});content.append(stats);
 const cv=el('canvas','tk-big');cv.setAttribute('aria-label','5 minute candle chart');content.append(el('h2',null,'5M CHART'),cv);
 content.append(el('h2',null,'LIVE TRADES'));const list=el('div','tk-trades');(recent.length?recent.slice(0,14):[]).forEach(x=>{const row=el('div','tk-trade '+(x.buy?'tk-g':'tk-r'));row.append(el('span',null,x.buy?'BUY':'SELL'),el('span',null,usd(x.usd)),el('span',null,compact(x.tokens)+' $'+t.symbol),el('span','tk-age',ago(x.ts)));list.append(row)});if(!recent.length)list.append(el('p',null,'Waiting for trades…'));content.append(list);
 const act=el('div','tk-actions');const buy=el('a','action','BUY ON PUMP.FUN ↗');buy.href='https://pump.fun/coin/'+TOKEN.mint;buy.target='_blank';buy.rel='noopener noreferrer';
 const cp=el('button','action tk-copy','COPY CONTRACT');cp.type='button';cp.onclick=async()=>{try{await navigator.clipboard.writeText(TOKEN.mint);cp.textContent='COPIED ✓'}catch(e){cp.textContent=TOKEN.mint}setTimeout(()=>cp.textContent='COPY CONTRACT',2000)};act.append(buy,cp);
 (info.socials||[]).concat((info.websites||[]).map(w=>({type:w.label||'website',url:w.url}))).slice(0,4).forEach(l=>{try{const u=new URL(l.url);if(u.protocol!=='https:')return;const a=el('a','tk-link',String(l.type).toUpperCase()+' ↗');a.href=u.href;a.target='_blank';a.rel='noopener noreferrer';act.append(a)}catch(e){}});content.append(act);
 content.append(el('p','note','CA: '+TOKEN.mint+'. Not financial advice. Always verify the contract address before buying.'));
 requestAnimationFrame(()=>bigChart(cv))}
function openCoin(){panel.classList.add('wide','coin');render();if(!panel.open)panel.showModal();clearInterval(live);live=setInterval(()=>{if(panel.open&&panel.classList.contains('coin'))render();else clearInterval(live)},5000)}
panel.addEventListener('close',()=>{panel.classList.remove('wide','coin');clearInterval(live)});
const reg=document.querySelector('.register');if(reg)reg.addEventListener('click',openCoin);
})();
