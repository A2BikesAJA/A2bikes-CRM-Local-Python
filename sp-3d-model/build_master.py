#!/usr/bin/env python3
"""Build the final SP web model from the master Shapr3D assembly.

`SP Component.step` (converted to sp_component.glb) is the complete bike —
frame, fork, TT cockpit, saddle, seatpost, Dura-Ace drivetrain, wheels,
tires, calipers — all positioned. This script:
  1. classifies materials per part name (matte black colorway),
  2. rotates the bike to +x forward / +z up for the viewer,
  3. bakes the A2 logo as a decal texture onto the down tube (both sides,
     correct reading direction on each),
  4. decimates heavy meshes and merges vertices for smooth shading,
  5. exports a single GLB with vertex normals.

Usage: python build_master.py <dir with sp_component.glb + decal png> <out.glb>
"""

import re
import sys
from pathlib import Path

import numpy as np
import trimesh
from PIL import Image

try:
    import fast_simplification
except ImportError:
    fast_simplification = None

BASE_BLACK = (20, 20, 22)

MAT = {
    "matte_black": dict(name="A2 Matte Black", baseColorFactor=[20, 20, 22, 255],
                        metallicFactor=0.1, roughnessFactor=0.6),
    "carbon": dict(name="Carbon Satin", baseColorFactor=[38, 38, 42, 255],
                   metallicFactor=0.35, roughnessFactor=0.4),
    "rubber": dict(name="Tire Rubber", baseColorFactor=[26, 26, 26, 255],
                   metallicFactor=0.0, roughnessFactor=0.92),
    "steel": dict(name="Drivetrain Steel", baseColorFactor=[140, 140, 145, 255],
                  metallicFactor=0.95, roughnessFactor=0.3),
    "hardware": dict(name="Component Black", baseColorFactor=[32, 32, 35, 255],
                     metallicFactor=0.5, roughnessFactor=0.4),
    "foam": dict(name="Pad/Saddle", baseColorFactor=[22, 22, 22, 255],
                 metallicFactor=0.0, roughnessFactor=0.88),
}

# pattern -> (material, decimation keep-ratio)
RULES = [
    (r"резина", ("rubber", 1.0)),            # tires
    (r"карбон|aero disc", ("carbon", 1.0)),  # thin surfaces: do not decimate
    (r"chain |cs-|lockring", ("steel", 0.35)),
    (r"^(tt handlebar|kqs|compound_2$|compound_3$)", ("matte_black", 0.9)),
    (r"rd-|st-|brake caliper|t47|spring|fork adapter|iso |деталь",
     ("hardware", 0.6)),
    (r"^(\d+)(_|$)", ("hardware", 0.6)),     # crank arms, pedals, axles
    (r"nipple|dt competition", ("hardware", 1.0)),
]
DEFAULT = ("hardware", 0.7)
FOAM_PARTS = ("COMPOUND", "COMPOUND_1")     # armrest pads near the bars

FRAME_PART = "COMPOUND_3"                   # painted frame body (gets decal)
DECAL_PNG = "a2_primary_fullcolor.png"  # gray A + red 2, per production bike photos
TEX = 1024
# texture window in final coords (covers the frame body, uniform scale)
WIN_X0, WIN_Z0, WIN_SIDE = -0.71, 0.21, 0.92
# decal on the down tube: world center, width, rise angle of the tube
# (tube side-skin measured from COMPOUND_3: z = 0.54 + 0.87*x, depth ~75mm)
DECAL_CX, DECAL_CZ, DECAL_W, DECAL_ANGLE = -0.05, 0.50, 0.16, 41.0


def classify(name):
    lowered = name.lower()
    if name in FOAM_PARTS:
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


def decal_texture(indir: Path, side: str) -> Image.Image:
    """Matte-black texture with the white A2 logo stamped on the down tube.

    `side` is 'right' (+y, drive side) or 'left'. The left texture is laid
    out in mirrored u so the logo reads correctly seen from outside.
    """
    tex = Image.new("RGB", (TEX, TEX), BASE_BLACK)
    logo = Image.open(indir / DECAL_PNG).convert("RGBA")
    w_px = int(DECAL_W / WIN_SIDE * TEX)
    h_px = int(w_px * logo.height / logo.width)
    logo = logo.resize((w_px, h_px), Image.LANCZOS)
    angle = DECAL_ANGLE if side == "right" else -DECAL_ANGLE
    logo = logo.rotate(angle, expand=True, resample=Image.BICUBIC)
    ul = (DECAL_CX - WIN_X0) / WIN_SIDE
    if side == "left":
        ul = 1.0 - ul
    vc = 1.0 - (DECAL_CZ - WIN_Z0) / WIN_SIDE
    cx, cy = int(ul * TEX), int(vc * TEX)
    tex.paste(logo, (cx - logo.width // 2, cy - logo.height // 2), logo)
    return tex


def frame_with_decal(scene, mesh, indir: Path):
    """Split the frame by side, planar-UV each half, bake the logo decal."""
    cent_y = mesh.triangles_center[:, 1]
    for side, mask in (("right", cent_y >= 0), ("left", cent_y < 0)):
        sub = mesh.submesh([np.nonzero(mask)[0]], append=True)
        V = np.asarray(sub.vertices)
        ul = (V[:, 0] - WIN_X0) / WIN_SIDE
        if side == "left":
            ul = 1.0 - ul
        vv = 1.0 - (V[:, 2] - WIN_Z0) / WIN_SIDE
        uv = np.column_stack([ul, vv])
        mat = trimesh.visual.material.PBRMaterial(
            name=f"A2 Matte Black Decal {side}",
            baseColorTexture=decal_texture(indir, side),
            metallicFactor=0.1, roughnessFactor=0.6)
        sub.visual = trimesh.visual.TextureVisuals(uv=uv, material=mat)
        scene.add_geometry(sub, geom_name=f"{FRAME_PART}_{side}")


def build(indir: Path) -> trimesh.Scene:
    scene = trimesh.Scene()
    R = Rz(90)  # master assembly is y-forward(-): rotate so the bike faces +x

    def add(name, mesh, mat):
        mesh.visual = trimesh.visual.TextureVisuals(
            material=trimesh.visual.material.PBRMaterial(**MAT[mat]))
        scene.add_geometry(mesh, geom_name=name)

    nv_in = nv_out = 0
    for k, m in positioned(indir / "sp_component.glb"):
        mat, keep = classify(k)
        nv_in += len(m.vertices)
        m = decimate(m, keep)
        m.merge_vertices()        # weld for smooth vertex normals
        nv_out += len(m.vertices)
        m.apply_transform(R)
        if k == FRAME_PART:
            frame_with_decal(scene, m, indir)
        else:
            add(k, m, mat)
    print(f"decimation: {nv_in} -> {nv_out} vertices")
    return scene


if __name__ == "__main__":
    indir = Path(sys.argv[1]) if len(sys.argv) > 1 else Path(".")
    out = Path(sys.argv[2]) if len(sys.argv) > 2 else Path("sp_final.glb")
    scene = build(indir)
    scene.export(str(out), include_normals=True)
    print(f"wrote {out} ({out.stat().st_size/1e6:.1f} MB, {len(scene.geometry)} parts)")
