# Lenny’s Last Shift

Interactive cartoon convenience-store website featuring Lenny and Dale.

## Run locally

```sh
python3 -m http.server 8000 --directory dist
```

Open http://localhost:8000. No build or dependencies required. Locally the register monitor reads DexScreener/GeckoTerminal directly; on Vercel it uses the cached `/api/token` function (live pump.fun data).

## Deploy on Vercel

`vercel.json` serves `dist/` and Vercel picks up `api/token.js` as a serverless function. Optional env var: `TOKEN_MINT` (defaults to the test token).

## Register monitor

The cash-register screen is a small interactive page (LIVE / CHART / TRADES / BUY tabs). New buys and sells flash on it, hovering magnifies it, and clicking the register opens the full coin page. Token data comes from `api/token.js` (pump.fun first, DexScreener/GeckoTerminal as fallback).

## Scene animation

- Counter: character idle/reaction motion, neon and phone glow, steam, slushie spill, service bell, receipt printing.
- Parking lot: separate source-art car and Dale planes over a clean background, stereo suspension bounce with optional synthesized bass, horn/headlight reaction, dumpster eyes, moths and exhaust.
- Stockroom: separate character planes, fan speed controls, flying notes, drifting dust, bulb and CRT effects.
- Destination-specific room transitions, motion toggle, reduced-motion support, and pausing off-screen animations.

Source artwork is clipped with CSS polygons. Scene edges and timing still need browser visual review. These are character reaction motions, not lip-synced dialogue or a full skeletal rig.

## Content

Lore, proposed roadmap, how-to-buy placeholder, community placeholder, and downloadable PNG caption maker. Token network, contract address and official links have not been announced.

Live preview: https://lennys-last-shift.swiftcomet.chatgpt.site
