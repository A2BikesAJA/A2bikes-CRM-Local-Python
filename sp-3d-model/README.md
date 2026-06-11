# SP 3D Web Model Pipeline

Goal: a spinnable/flippable 3D model of The SP — matte black colorway with A2
logos — embeddable on the website / Shopify product page.

## Status

| Step | State |
|---|---|
| Conversion pipeline (STEP → GLB, matte black PBR) | ✅ Verified working (`convert_to_glb.py`) |
| Web viewer (spin/flip/zoom + mobile AR) | ✅ Ready (`viewer/index.html`, open locally to test with `sample.glb`) |
| Logo decal textures (from A2-001 brand kit) | ✅ Prepared (`assets/decals/`) |
| Frameset geometry | ⚠️ Blocked — see below |
| Component models (wheels, drivetrain, cockpit) | ⏳ Pending source files |

## The geometry blocker

The supplied `KQS_4015_v1.x_t` is a **Parasolid** transmit file (exported from
Onshape, Parasolid v33). Parasolid is Siemens' proprietary kernel format — no
open-source tool can read it; only software licensing the Parasolid kernel
(Onshape, SolidWorks, NX, Shapr3D) can.

**Fix is a 30-second re-export** from the same Onshape document:
right-click the tab → **Export** → format **STEP** (AP242 or AP214) — or even
better, **GLTF**, which skips conversion entirely. Either format drops
straight into this pipeline.

The old SP product page embedded a Shapr3D web viewer
(`collaborate.shapr3d.com/v/FrVULlErVUnIQvSBbTjN5`), so a fuller SP assembly
may already exist in Shapr3D — Shapr3D exports STEP/OBJ/USDZ directly and may
include components beyond the frameset.

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
