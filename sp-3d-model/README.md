# SP 3D Web Model Pipeline

Goal: a spinnable/flippable 3D model of The SP — matte black colorway with A2
logos — embeddable on the website / Shopify product page.

## Status

| Step | State |
|---|---|
| Complete bike model (size M): frame, fork, cockpit, seatpost, saddle, Dura-Ace drivetrain, wheels, calipers | ✅ `viewer/sp_final.glb` (12 MB, 162 parts) built by `build_master.py` |
| Matte black colorway + material classification | ✅ Per A2-001 style guide |
| 3D A2 logo badge on the down tube (both sides) | ✅ Placed (gray; swap to red/white in `MAT["logo"]`) |
| Web viewer (spin/flip/zoom + mobile AR) | ✅ `viewer/index.html` |
| Logo decal textures (from A2-001 brand kit) | ✅ `assets/decals/` |

## Pipeline

The master source is `SP Component.step` — a complete Shapr3D assembly of the
size M SP (geometry confirmed against the SP geometry chart: 972 mm wheelbase,
78° ST, 70 mm BB drop). Build:

```bash
pip install cadquery-ocp cascadio trimesh fast-simplification pillow numpy
python convert_to_glb.py "SP Component.step" sp_component.glb   # tessellate
python build_master.py <dir> viewer/sp_final.glb                # materials, logo, decimation
```

`build_master.py` classifies materials per part name (Russian/Chinese factory
part names: карбон = carbon, резина = tire rubber, 立管/座管 = seat tube/post),
decimates heavy meshes (chain 153k verts → ~38k; thin surfaces like the rear
disc are exempt), rotates the bike +x forward, and places the 3D logo badge.

`assemble_sp.py` is the earlier piecewise path (frameset + wheels + saddle as
separate exports) — kept for reference; superseded by the master assembly.

Source files live in Drive: "design files for Claude" (large ones split into
5 MB `.part.*` chunks — reassemble with `cat name.part.* > name`). Also there:
`Dura Ace Tri Group.step` (standalone groupset) and `Size S SP 2.zip` (size S
frame/fork/seatpost OBJs) — unused, available if a size S variant is wanted.

Note: the original `KQS_4015_v1.x_t` Parasolid file is unreadable outside
licensed CAD kernels — the Shapr3D STEP exports replaced it.

## Component plan (to match the production SP)

Spec from the SP product page (SP 1.1 base build):

- Wheels: Vision Team 30 Aluminum (options: Zipp 303s, Metron 55/81/disc)
- Tires: Vittoria Rubino/RosaCorsa 25 mm
- Crank: Vision Omega EXO; cassette MicroShift 11-28; KMC chain
- Derailleurs: Shimano 105 R7000
- Brakes: TRP Spyre mechanical disc, Tektro rotors
- Shifters: MicroShift BS-A11 bar-end
- Cockpit: Vision TriMax Aero alloy base bar + A2 SAGS stem
- Saddle: Velo

Component geometry sources, best-first: (1) full assembly export from
Onshape/Shapr3D if it exists; (2) manufacturer CAD (FSA/Vision and Shimano
publish models; GrabCAD has TRP/Zipp/KMC parts); (3) purchased stock models
(TurboSquid/CGTrader) for anything left.

## Colorway & logos

From the A2-001 ID Style Guide: red = Pantone 185 C `#EB1C2D`, light gray =
Pantone 430 C `#7D858C`. On the matte black frame use the full-color primary
logo (gray A + red 2) or the one-color reversed (white) version — both
brand-approved on dark backgrounds. Trimmed alpha-channel decal textures are
in `assets/decals/`.

Matte black PBR target: baseColor `#121214`, metallic ≈ 0.05, roughness ≈ 0.85.

## Usage

```bash
pip install cadquery-ocp cascadio trimesh pillow numpy
python convert_to_glb.py SP_frameset.step sp.glb
# open viewer/index.html?src=../sp.glb  (or replace sample.glb)
```

## Publishing

- **Shopify (recommended):** product page → Media → upload the `.glb`.
  Shopify renders it with a built-in 360° viewer plus AR on mobile — no
  custom code or apps needed.
- **Anywhere else:** host the `.glb` and embed `viewer/index.html` (Google
  `<model-viewer>`, works in all modern browsers).
