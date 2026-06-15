# A2 Bikes SP — Interactive 3D Assembly Guide

A customer-facing, single-page web app that walks an SP buyer through final
home assembly in interactive 3D: per-step camera moves, part highlighting,
insertion animations, and exact torque callouts. No backend — all content lives
in `src/content/steps.json` and it builds to static files for any host
(Shopify page embed via iframe, or standalone behind a QR code / order email).

## Run

```bash
npm install
npm run dev        # local dev at http://localhost:5173
npm run build      # static build to dist/
npm run preview    # serve the built output
npm run typecheck  # tsc --noEmit
```

## Stack

React + Vite + TypeScript · three.js via @react-three/fiber + drei ·
zustand (step/app state) · framer-motion (UI/bottom-sheet only; 3D motion is
R3F/drei). App JS is ~366 KB gzipped (budget < 1.5 MB).

## How it's organized

| Path | What |
|------|------|
| `src/content/steps.json` | **All content** — steps, substeps, torque, tools, camera, explode offsets, per-build blocks. Edit this to change the guide. |
| `src/lib/parts.ts` | The part-naming contract + insertion-axis hints. |
| `src/lib/types.ts` | Content schema types. |
| `src/state/store.ts` | zustand store — step engine, progress, units, colorway. |
| `src/three/` | 3D: `Scene`, `CameraRig`, `Part` (highlight/ghost/hide/explode), `ParametricBike`, `BikeModel` (GLB-or-parametric loader), `TorqueLabels`. |
| `src/components/` | UI: `Landing`, `StepPanel`, `NavBar`, `StepRail`, `BottomSheet`, toggles, footer. |
| `CONTENT_TODO.md` | Every placeholder A2 must confirm before shipping. |
| `ASSET_SWAP.md` | How to drop the real CAD GLB in for the parametric model. |

## Editing content (no code)

Open `src/content/steps.json`. Each step controls its own camera viewpoint,
which parts are focused/ghosted/hidden, how parts explode in, torque specs
(with optional 3D anchor), tools, warnings, hazards, common mistakes, and
per-build conditional blocks. Part IDs must come from `src/lib/parts.ts`.

## Two-phase 3D

- **Phase 1 (now):** a parametric SP drawn in code — schematic but correctly
  proportioned and placed, in Oswego Blue / Summit Grey.
- **Phase 2 (drop-in):** put a contract-named `sp.glb` in `public/assets/` and
  it loads automatically. See `ASSET_SWAP.md`.

## Guardrails honored

- No invented torque values — uncertain ones render as visible placeholders and
  are listed in `CONTENT_TODO.md`.
- The legacy 30–42 N·m axle-nut figure is never shown (thru-axle says "use the
  printed spec").
- Assembly only — no pricing/marketing.
- Analytics is a stubbed `trackEvent` bus (`src/lib/analytics.ts`) ready for GA4.

## Accessibility & performance

All instructional content is readable in the step panel without the 3D view
(3D is enhancement). Keyboard nav (←/→, R = reset view), `prefers-reduced-motion`
jump-cuts animations, pixel ratio capped at 2, AdaptiveDpr under load.

## Analytics (GA4)

Off by default. To enable, build with a measurement ID:

```bash
VITE_GA4_ID=G-XXXXXXXXXX npm run build
```

With no ID, no script loads and no events fire. When set, every `trackEvent`
(`guide_start`, `step_view`, `unit_toggle`, …) forwards to GA4 (`src/lib/ga4.ts`).

## Printable PDF

Two ways, both from the same `steps.json`:
- In the app: the **⎙ PDF** button (top bar) opens the browser print dialog with
  a clean, text-only document (`@media print` + `PrintView.tsx`) — "Save as PDF".
- Generate a file: `node tools/make_pdf.mjs A2-SP-Assembly-Guide.pdf`.

## Embedding on Shopify

Build, host `dist/` (any static host / the store's Files CDN), then embed:

```html
<iframe src="https://YOUR-HOST/sp-assembly-guide/" style="width:100%;height:90vh;border:0"
        title="A2 SP Assembly Guide" allow="accelerometer; xr-spatial-tracking"></iframe>
```
