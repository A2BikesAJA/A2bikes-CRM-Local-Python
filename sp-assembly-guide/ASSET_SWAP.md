# ASSET_SWAP — the CAD model and how to regenerate it

The app now loads the **real CAD model** from `src/assets/sp.glb`
(meshopt-compressed, ~2.2 MB) and wraps each contract-named node in the `<Part>`
system (highlight / ghost / hide / explode all work). If the GLB ever fails to
load, it falls back to the code-drawn parametric model.

## Current model & how it was made

`tools/make_assembly_glb.py` builds `src/assets/sp.glb` from the master Shapr3D
assembly (`sp_component.glb`). It:
- assigns a PBR material per mesh by name (matte-black production colorway),
- classifies every mesh into one of the 21 contract part groups,
- remaps into the guide coordinate convention (below) and bakes transforms,
- decimates heavy meshes, names each node `<id>__<n>`, exports GLB.

Then compress with meshopt (decodes offline, no CDN — important for the
single-file build):

```bash
python tools/make_assembly_glb.py sp_component.glb sp_raw.glb
npx --yes @gltf-transform/cli meshopt sp_raw.glb src/assets/sp.glb
npm run build
```

## Regenerating from new CAD

If A2 ships a new/cleaner CAD export, either (a) re-run the tool above after
updating the name→part classification in `make_assembly_glb.py`, or (b) export a
GLB whose node names already match the contract (`<id>` or `<id>__<n>`) and drop
it at `src/assets/sp.glb`. Then `npm run build`. No app code changes.

## The part-naming contract (NON-NEGOTIABLE)

Every selectable part must be a node in the GLB whose **name exactly matches**
one of these IDs (defined in `src/lib/parts.ts`):

```
frame, fork, front_wheel, rear_wheel, front_rotor, rear_rotor,
front_caliper, rear_caliper, seatpost, saddle, seatpost_binder,
cockpit_basebar, extensions, stem_topcap, thru_axle_front, thru_axle_rear,
pedal_left, pedal_right, crankset, rear_derailleur, chain
```

Notes:
- A node may be a group containing many meshes — name the **group/empty** with
  the contract ID; its children come along.
- Missing nodes are skipped gracefully (a partial export still loads), but any
  step that focuses/explodes a missing part will simply have nothing to animate.
- Extra nodes not in the list are ignored. Keep them out to save file size.

## Scale, origin & orientation conventions

The parametric model establishes the coordinate frame the steps.json cameras
and torque anchors are authored against. Match it:

- **Units:** metres. Wheelbase ≈ 1.0 m (front axle x ≈ +0.59, rear x ≈ −0.41).
- **Axes:** `+x` = nose / forward, `+y` = up, `+z` = drive (right) side.
- **Origin:** bottom-bracket centred near `(0, 0.27, 0)`; the wheel contact
  patch sits at `y = 0` (axle y ≈ 0.34, 700c radius ≈ 0.34). **Do not** bake a
  vertical offset — the floor/shadow plane is at y = 0.
- **Forward:** the bike faces +x. If your CAD faces a different axis, bake the
  rotation into the export.

If the real geometry's proportions differ, re-author the per-step
`camera` and `torque[].anchor` values in `steps.json` to suit — those are the
only things tied to exact coordinates.

## Compression (meet the < 8 MB budget)

Export glTF-binary, then compress with Draco or Meshopt via `gltf-transform`:

```bash
npm i -g @gltf-transform/cli

# Meshopt (recommended — fast decode, good ratio):
gltf-transform meshopt input.glb public/assets/sp.glb

# or Draco (smaller, slightly slower decode):
gltf-transform draco input.glb public/assets/sp.glb --quantize-position 14
```

drei's `useGLTF` decodes Draco/Meshopt automatically. Target ≤ 8 MB; decimate
heavy parts (chain, cassette) first if needed:

```bash
gltf-transform simplify input.glb tmp.glb --ratio 0.6 --error 0.001
gltf-transform meshopt tmp.glb public/assets/sp.glb
```

## Verify after swapping

1. `npm run build && npm run preview`
2. Step through all 9 steps — confirm each `focusParts` highlights, each
   `explode` part animates, and torque pins land on the right fasteners.
3. If a pin floats off a fastener, nudge that step's `torque[].anchor` in
   `steps.json` (model-space metres).
