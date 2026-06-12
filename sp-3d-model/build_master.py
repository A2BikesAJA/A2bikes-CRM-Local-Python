#!/usr/bin/env python3
"""Build the final SP web model from the master Shapr3D assembly.

`SP Component.step` (converted to sp_component.glb) is the complete bike —
frame, fork, TT cockpit, saddle, seatpost, Dura-Ace drivetrain, wheels,
tires, calipers — all positioned. This script:
  1. classifies materials per part name (matte black colorway),
  2. rotates the bike to +x forward / +z up for the viewer,
  3. places the 3D A2 logo badge on both sides,
  4. decimates heavy meshes (chain, cassette, disc) for web delivery,
  5. exports a single GLB.

Usage: python build_master.py <dir with sp_component.glb + logo3d.glb> <out.glb>
"""

import re
import sys
from pathlib import Path

import numpy as np
import trimesh

try:
    import fast_simplification
except ImportError:
    fast_simplification = None

MAT = {
    "matte_black": dict(name="A2 Matte Black", baseColorFactor=[18, 18, 20, 255],
                        metallicFactor=0.05, roughnessFactor=0.85),
    "carbon": dict(name="Carbon Satin", baseColorFactor=[35, 35, 38, 255],
                   metallicFactor=0.3, roughnessFactor=0.5),
    "rubber": dict(name="Tire Rubber", baseColorFactor=[24, 24, 24, 255],
                   metallicFactor=0.0, roughnessFactor=0.95),
    "steel": dict(name="Drivetrain Steel", baseColorFactor=[135, 135, 140, 255],
                  metallicFactor=0.9, roughnessFactor=0.35),
    "hardware": dict(name="Component Black", baseColorFactor=[30, 30, 32, 255],
                     metallicFactor=0.4, roughnessFactor=0.45),
    "foam": dict(name="Pad/Saddle", baseColorFactor=[20, 20, 20, 255],
                 metallicFactor=0.0, roughnessFactor=0.9),
    "logo": dict(name="A2 Logo Gray", baseColorFactor=[125, 133, 140, 255],
                 metallicFactor=0.6, roughnessFactor=0.35),
}

# pattern -> (material, decimation keep-ratio)
RULES = [
    (r"резина", ("rubber", 1.0)),          # tires
    (r"карбон|aero disc", ("carbon", 1.0)),  # thin surfaces: do not decimate
    (r"chain |cs-|lockring", ("steel", 0.25)),
    (r"^(tt handlebar|kqs|compound_2|compound_3)", ("matte_black", 0.6)),
    (r"rd-|st-|brake caliper|t47|spring|fork adapter|iso |деталь",
     ("hardware", 0.5)),
    (r"^(\d+)(_|$)", ("hardware", 0.5)),    # crank arms, pedals, axles
    (r"nipple|dt competition", ("hardware", 1.0)),
]
DEFAULT = ("hardware", 0.6)
# Big unnamed COMPOUND near the bars = armrest pads; frame pieces handled above
FOAM_PARTS = {"COMPOUND"}


def classify(name):
    lowered = name.lower()
    if name.split("_")[0] in FOAM_PARTS and name in ("COMPOUND", "COMPOUND_1"):
        return ("foam", 0.6)
    for pat, spec in RULES:
        if re.search(pat, lowered):
            return spec
    return DEFAULT


def decimate(mesh, keep):
    if fast_simplification is None or keep >= 1.0 or len(mesh.faces) < 2000:
        return mesh
    v, f = fast_simplification.simplify(
        np.asarray(mesh.vertices, dtype=np.float32),
        np.asarray(mesh.faces, dtype=np.int64),
        target_reduction=1.0 - keep)
    return trimesh.Trimesh(vertices=v, faces=f, process=False)


def Rz(deg):
    t = np.radians(deg)
    M = np.eye(4)
    M[:2, :2] = [[np.cos(t), -np.sin(t)], [np.sin(t), np.cos(t)]]
    return M


def Tr(x, y, z):
    M = np.eye(4)
    M[:3, 3] = [x, y, z]
    return M


def positioned(path):
    s = trimesh.load(str(path), force="scene")
    out = []
    for k, v in s.geometry.items():
        if not isinstance(v, trimesh.Trimesh):
            continue
        T, _ = s.graph.get(s.graph.geometry_nodes[k][0])
        m = v.copy()
        m.apply_transform(T)
        out.append((k, m))
    return out


def build(indir: Path) -> trimesh.Scene:
    scene = trimesh.Scene()
    # master assembly is y-forward(-) — rotate so the bike faces +x
    R = Rz(90)

    def add(name, mesh, mat):
        mesh.visual = trimesh.visual.TextureVisuals(
            material=trimesh.visual.material.PBRMaterial(**MAT[mat]))
        scene.add_geometry(mesh, geom_name=name)

    nv_in = nv_out = 0
    for k, m in positioned(indir / "sp_component.glb"):
        mat, keep = classify(k)
        nv_in += len(m.vertices)
        m = decimate(m, keep)
        nv_out += len(m.vertices)
        m.apply_transform(R)
        add(k, m, mat)
    print(f"decimation: {nv_in} -> {nv_out} vertices")

    # 3D logo badge: exported on the size L frameset's head tube; this master
    # is the size M frame, so place it manually on the down tube / head tube
    # junction (badge is already x-forward oriented like the rotated master).
    # Source center: (0.351, -0.021, 0.4385) -> upper down tube of the M frame
    # (badge clears the front tire arc in side view there).
    Tlogo = Tr(0.105 - 0.351, -0.027 - (-0.021), 0.495 - 0.4385)
    for k, m in positioned(indir / "logo3d.glb"):
        m.apply_transform(Tlogo)
        add(f"logo/{k}", m, "logo")
        mr = m.copy()
        mr.vertices = np.asarray(mr.vertices) * [1, -1, 1]
        mr.invert()
        add(f"logo/{k}_mirrored", mr, "logo")
    return scene


if __name__ == "__main__":
    indir = Path(sys.argv[1]) if len(sys.argv) > 1 else Path(".")
    out = Path(sys.argv[2]) if len(sys.argv) > 2 else Path("sp_final.glb")
    scene = build(indir)
    scene.export(str(out))
    print(f"wrote {out} ({out.stat().st_size/1e6:.1f} MB, {len(scene.geometry)} parts)")
