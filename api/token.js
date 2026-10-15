// Vercel serverless function: one cached call returns everything the register monitor needs.
// Set TOKEN_MINT in the Vercel project env to change the coin; defaults to the test token.
const DEFAULT_MINT='2j5SaS7xy776qCBpyPQbZjyQSAtKiFgrwjfErthnW2ZM';
const UA='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36';
const SOLANA_CHAIN='solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp';
const GT='https://api.geckoterminal.com/api/v2/networks/solana/pools/';

async function getJSON(url){
  const r=await fetch(url,{headers:{accept:'application/json','user-agent':UA}});
  if(!r.ok)throw new Error(url+' -> '+r.status);
  return r.json();
}

// pump.fun's own endpoints (undocumented, see the pumpfunapi project) are live to the second;
// GeckoTerminal is the lagging fallback if they block us or change shape.
async function pumpTrades(mint){
  const d=await getJSON('https://swap-api.pump.fun/v2/coins/'+mint+'/trades?limit=60');
  return d.trades.map(t=>({id:t.tx,ts:Date.parse(t.timestamp),buy:t.type==='buy',usd:+t.amountUsd||0,tokens:+t.baseAmount||0}));
}
async function pumpCandles(mint){
  const d=await getJSON('https://frontend-api-v3.pump.fun/candles/'+encodeURIComponent(SOLANA_CHAIN)+'/'+mint+'?res=5m');
  return d.candles.slice(-36).map(k=>[Math.floor(+k.openTimeMs/1000),+k.open,+k.high,+k.low,+k.close,+k.volumeUsd]);
}
async function geckoTrades(pool){
  const d=await getJSON(GT+pool+'/trades');
  return (d.data||[]).slice(0,60).map(t=>{const a=t.attributes,buy=a.kind==='buy';return{id:a.tx_hash,ts:Date.parse(a.block_timestamp),buy,usd:+a.volume_in_usd||0,tokens:+(buy?a.to_token_amount:a.from_token_amount)||0}});
}
async function geckoCandles(pool){
  const d=await getJSON(GT+pool+'/ohlcv/minute?aggregate=5&limit=36');
  return ((d.data&&d.data.attributes&&d.data.attributes.ohlcv_list)||[]).slice().sort((a,b)=>a[0]-b[0]);
}

module.exports=async(req,res)=>{
  const mint=process.env.TOKEN_MINT||DEFAULT_MINT;
  if(!/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(mint))return res.status(500).json({error:'bad TOKEN_MINT'});
  try{
    const dex=await getJSON('https://api.dexscreener.com/latest/dex/tokens/'+mint);
    const pair=(dex.pairs||[])
      .filter(p=>p.chainId==='solana'&&p.baseToken&&p.baseToken.address===mint)
      .sort((a,b)=>((b.liquidity&&b.liquidity.usd)||0)-((a.liquidity&&a.liquidity.usd)||0))[0];
    if(!pair)return res.status(404).json({error:'no pair found',mint});
    const [candles,trades]=await Promise.all([
      pumpCandles(mint).catch(()=>geckoCandles(pair.pairAddress)).catch(()=>[]),
      pumpTrades(mint).catch(()=>geckoTrades(pair.pairAddress)).catch(()=>[])
    ]);
    res.setHeader('Cache-Control','s-maxage=3, stale-while-revalidate=10');
    res.status(200).json({mint,pair,candles,trades});
  }catch(e){
    res.status(502).json({error:'upstream failed'});
  }
};
