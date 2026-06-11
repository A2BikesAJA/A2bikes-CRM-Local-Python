# SP 3D Web Model Pipeline

Goal: a spinnable/flippable 3D model of The SP — matte black colorway with A2
logos — embeddable on the website / Shopify product page.

## Status

| Step | State |
|---|---|
| Conversion pipeline (STEP → GLB, matte black PBR) | ✅ Verified working (`convert_to_glb.py`) |
| Web viewer (spin/flip/zoom + mobile AR) | ✅ Ready (`viewer/index.html`, loads `sp_assembled.glb`) |
| Logo decal textures (from A2-001 brand kit) | ✅ Prepared (`assets/decals/`) |
| Frameset (frame, fork, storage boxes, hardware) | ✅ From Shapr3D STEP export |
| Wheels (60mm spoked front + full disc rear, tires, rotors, DA cassette) | ✅ Mated to dropouts (`assemble_sp.py`) |
| Saddle + 3D A2 logo badge (mirrored both sides) | ✅ Placed |
| Seatpost | ⚠️ Provisional generated aero post — replace with real A2SP geometry |
| Cockpit (TriMax base bar + extensions + SAGS stem) | ⏳ Need Shapr3D export |
| Crank/chainring, chain, derailleurs, brake calipers, pedals | ⏳ Need Shapr3D export or manufacturer CAD |

## Assembly

`assemble_sp.py` mates the separately exported Shapr3D STEP files into one
bike: the wheels export shares the frameset's scale, so a single Rz(90°) +
translation lands both axles on the dropouts (wheelbase 1.001 m). Saddle and
logo placement, material classification (incl. Russian part names from the
source component library: карбон = carbon rim, резина = tire rubber), and the
provisional seatpost live in that script. Output: `viewer/sp_assembled.glb`
(7.9 MB, 85 parts). Renders in `renders/`.

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
