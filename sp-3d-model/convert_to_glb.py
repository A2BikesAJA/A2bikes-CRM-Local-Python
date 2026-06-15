#!/usr/bin/env python3
"""Convert SP CAD geometry to a web-ready GLB with the A2 matte black colorway.

Usage:
    python convert_to_glb.py input.step [output.glb]
    python convert_to_glb.py input.obj  [output.glb]

Accepts STEP (.step/.stp) or mesh formats trimesh can read (.obj, .stl, .glb,
.gltf, .ply). STEP files are tessellated with OpenCascade via cascadio, then a
second pass assigns PBR materials per part based on node-name patterns below.

Requires: pip install cadquery-ocp cascadio trimesh pillow numpy
"""

import re
import sys
from pathlib import Path

import trimesh

# A2 brand colors (A2-001 ID Style Guide R1)
A2_RED = [235, 28, 45, 255]        # Pantone 185 C / #EB1C2D
A2_LIGHT_GRAY = [125, 133, 140, 255]  # Pantone 430 C / #7D858C

# Part-name pattern -> PBR material. First match wins; order matters.
# Extend this list as component meshes (wheels, drivetrain, cockpit) are added
# to the assembly — name the parts in CAD so they match these patterns.
MATERIALS = [
    (r"frame|fork|seat ?post|seatpost|stem|sags|chainstay|top ?tube|down ?tube",
     dict(name="A2 Matte Black", baseColorFactor=[18, 18, 20, 255],
          metallicFactor=0.05, roughnessFactor=0.85)),
    (r"tire|tyre|vittoria",
     dict(name="Tire Rubber", baseColorFactor=[28, 28, 28, 255],
          metallicFactor=0.0, roughnessFactor=0.95)),
    (r"rim|wheel|metron|zipp|team ?30|disc(?! ?brake)",
     dict(name="Rim", baseColorFactor=[35, 35, 38, 255],
          metallicFactor=0.3, roughnessFactor=0.5)),
    (r"chain|cassette|rotor|spoke|axle|bolt|skewer|crank|chainring",
     dict(name="Steel", baseColorFactor=[160, 160, 165, 255],
          metallicFactor=0.9, roughnessFactor=0.35)),
    (r"derailleur|brake|shifter|caliper|lever|pedal",
     dict(name="Component Black", baseColorFactor=[30, 30, 32, 255],
          metallicFactor=0.4, roughnessFactor=0.45)),
    (r"saddle|velo|pad|tape|grip",
     dict(name="Saddle", baseColorFactor=[22, 22, 22, 255],
          metallicFactor=0.0, roughnessFactor=0.9)),
]

DEFAULT_MATERIAL = dict(name="A2 Matte Black (default)",
                        baseColorFactor=[18, 18, 20, 255],
                        metallicFactor=0.05, roughnessFactor=0.85)


def material_for(name: str) -> trimesh.visual.material.PBRMaterial:
    lowered = (name or "").lower()
    for pattern, spec in MATERIALS:
        if re.search(pattern, lowered):
            return trimesh.visual.material.PBRMaterial(**spec)
    return trimesh.visual.material.PBRMaterial(**DEFAULT_MATERIAL)


def step_to_glb(step_path: Path, glb_path: Path) -> None:
    import cascadio
    cascadio.step_to_glb(str(step_path), str(glb_path),
                         tol_linear=0.05, tol_angular=0.3)


def main() -> None:
    if len(sys.argv) < 2:
        sys.exit(__doc__)
    src = Path(sys.argv[1])
    dst = Path(sys.argv[2]) if len(sys.argv) > 2 else src.with_suffix(".glb")

    if src.suffix.lower() in (".step", ".stp"):
        raw = dst.with_name(dst.stem + "_raw.glb")
        step_to_glb(src, raw)
        scene = trimesh.load(str(raw), force="scene")
    else:
        scene = trimesh.load(str(src), force="scene")

    for name, geom in scene.geometry.items():
        geom.visual.material = material_for(name)
        print(f"  {name}: {geom.visual.material.name}")

    scene.export(str(dst))
    size_mb = dst.stat().st_size / 1e6
    print(f"\nWrote {dst} ({size_mb:.1f} MB, {len(scene.geometry)} parts)")
    if size_mb > 15:
        print("Consider decimating or Draco-compressing before uploading "
              "(Shopify caps 3D models at 500 MB but pages load best <15 MB).")


if __name__ == "__main__":
    main()
