# Lenny’s Last Shift

Interactive cartoon convenience-store website featuring Lenny and Dale.

## Run locally

Serve the static site:

```sh
python3 -m http.server 8000 --directory dist
```

Open http://localhost:8000. No build or dependencies required.

## Included

- Layered counter scene with mouse parallax and character dialogue
- Register with buying instructions (token information is not announced)
- Slushie spill interaction and hot-dog reactions
- Parking-lot and stockroom reference scenes with clickable hotspots
- Lore, proposed roadmap, and PNG meme maker
- Mobile scene panning, keyboard controls, and reduced-motion support
- PNG artwork in `dist/assets`

Parking-lot and stockroom artwork is currently flattened. Character rigging and precise scene alignment remain work in progress.

## Hosting

Publish `dist` as the static output directory. The current preview is https://lennys-last-shift.swiftcomet.chatgpt.site.
