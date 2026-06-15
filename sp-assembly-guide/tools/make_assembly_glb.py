#!/usr/bin/env python3
"""Produce a contract-named, web-optimized sp.glb for the assembly guide.

Source: the master Shapr3D assembly (sp_component.glb, ~160 nodes). This:
  1. assigns each mesh a PBR material by its part name (matte-black colorway),
  2. classifies each mesh into one of the 21 contract part groups,
  3. bakes node transforms and remaps into the guide's coordinate convention
     (x = nose-forward, y = up, z = drive side; BB ~ (0,0.27,0); contact y=0),
  4. decimates heavy meshes to fit the < 8 MB budget,
  5. exports each mesh node named `<contract_id>__<n>` so BikeModel groups them.

Usage: python make_assembly_glb.py <sp_component.glb> <out sp.glb>
"""
import os
import re
import sys
import numpy as np
import trimesh
from trimesh.visual.material import PBRMaterial
from PIL import Image

LOGO_PNG = os.path.join(os.path.dirname(os.path.abspath(__file__)), "a2_logo.png")

try:
    import fast_simplification
except ImportError:
    fast_simplification = None

SRC = sys.argv[1] if len(sys.argv) > 1 else "sp_component.glb"
OUT = sys.argv[2] if len(sys.argv) > 2 else "sp.glb"

# ── materials (sRGB 0-255) ───────────────────────────────────────────────
MATS = {
    "matte_black": PBRMaterial(baseColorFactor=[20, 20, 22, 255], metallicFactor=0.1, roughnessFactor=0.6),
    "carbon": PBRMaterial(baseColorFactor=[40, 40, 45, 255], metallicFactor=0.3, roughnessFactor=0.4),
    "tire": PBRMaterial(baseColorFactor=[24, 24, 24, 255], metallicFactor=0.0, roughnessFactor=0.92),
    "metal": PBRMaterial(baseColorFactor=[150, 150, 156, 255], metallicFactor=0.9, roughnessFactor=0.3),
    "rotor": PBRMaterial(baseColorFactor=[186, 190, 195, 255], metallicFactor=0.85, roughnessFactor=0.25),
    "saddle": PBRMaterial(baseColorFactor=[18, 18, 18, 255], metallicFactor=0.0, roughnessFactor=0.85),
    "dark": PBRMaterial(baseColorFactor=[42, 42, 46, 255], metallicFactor=0.5, roughnessFactor=0.4),
}

NUM_RE = re.compile(r"^\d+(_\d+)*$")

# component-space axle anchors (from inspection): front cy<0, rear cy>0
FRONT_AXLE_C = np.array([0.07, -0.30, 0.32])
REAR_AXLE_C = np.array([0.07, 0.67, 0.32])


def material_for(name):
    n = name.lower()
    if "резина" in n:
        return "tire"
    if "карбон" in n or "aero disc" in n:
        return "carbon"
    if any(s in n for s in ("cs-r9200", "lockring", "chain ", "dt competition", "nipple", "t47")):
        return "metal"
    if any(s in n for s in ("rd-r9250", "spring", "dura acr", "st-r9180")):
        return "dark"
    return "matte_black"


def group_for(name, c):
    """c = component-space center (cx lateral, cy length[front<0], cz up)."""
    n = name.lower()
    front = c[1] < 0.18
    if "резина" in n or "карбон" in n or "dt competition" in n or "nipple" in n:
        return "front_wheel" if front else "rear_wheel"
    if "aero disc" in n:
        return "rear_wheel"
    if "cs-r9200" in n or "lockring" in n:
        return "rear_wheel"
    if "chain " in n:
        return "chain"
    if "rd-r9250" in n or n.startswith("spring"):
        return "rear_derailleur"
    if "t47" in n:
        return "crankset"
    if "tt handlebar" in n or "st-r9180" in n:
        return "cockpit_basebar"
    if "kqs 4577" in n:
        return "stem_topcap"
    if "kqs 3749" in n:
        return "fork"
    if "dura acr brake caliper" in n:
        return "front_caliper" if front else "rear_caliper"
    if NUM_RE.match(name.strip()):
        return "crankset"
    if c[2] > 0.9:
        return "saddle"
    # near an axle but unnamed → that wheel's hub/rotor/caliper cluster
    df = np.linalg.norm((c - FRONT_AXLE_C)[1:])
    dr = np.linalg.norm((c - REAR_AXLE_C)[1:])
    if df < 0.16:
        return "front_wheel"
    if dr < 0.16:
        return "rear_wheel"
    return "frame"


def to_guide(verts):
    """Component coords -> guide coords (x fwd, y up, z drive).

    Note the z term is negated: this mirrors the bike laterally so the drive
    side (chainrings / cassette / derailleur) faces the default +z camera, which
    is the standard drive-side product view. Mirroring flips triangle winding,
    so callers must reverse face order (see main()).
    """
    cx, cy, cz = verts[:, 0], verts[:, 1], verts[:, 2]
    return np.column_stack([-cy + 0.27, cz + 0.02, -(cx - 0.07)])


# We ship the model meshopt-compressed (decodes offline, no CDN). Because
# meshopt compresses ~4x, we keep ALL visible parts at full resolution — the
# frame especially, since decimating it produced shard artifacts. Only the two
# massive, visually-forgiving meshes (chain links, cassette) are reduced, and we
# recompute normals afterward so they still shade correctly.
DECIMATE_NAMES = ("chain ", "cs-r9200")
DECIMATE_CAP = 18000


def keep_for(name, nv, grp):
    n = name.lower()
    if any(s in n for s in DECIMATE_NAMES) and nv > DECIMATE_CAP:
        return DECIMATE_CAP / nv
    return 1.0


def decimate(mesh, keep):
    if fast_simplification is None or keep >= 1.0 or len(mesh.faces) < 1500:
        return mesh
    v, f = fast_simplification.simplify(
        np.asarray(mesh.vertices, np.float32),
        np.asarray(mesh.faces, np.int64),
        target_reduction=1.0 - keep,
    )
    out = trimesh.Trimesh(vertices=v, faces=f, process=False)
    out.fix_normals()  # recompute so decimated faces shade correctly
    return out


def add_logo_decals(out, frame_pts, counts):
    """Add the A2 logo as a flush decal quad on each side of the down tube.

    The quad is placed on the sampled frame surface (not floating) and textured
    with the logo PNG (transparent background → only the logo shows over the
    matte frame). Grouped under `frame__logo*` so it highlights with the frame.
    """
    logo = Image.open(LOGO_PNG).convert("RGBA")
    aspect = logo.width / logo.height
    W = 0.20
    H = W / aspect

    # down-tube region (guide coords): upper-forward run from BB to head tube
    box = frame_pts[
        (frame_pts[:, 0] > 0.08) & (frame_pts[:, 0] < 0.40) &
        (frame_pts[:, 1] > 0.30) & (frame_pts[:, 1] < 0.48)
    ]
    if len(box) < 20:
        center = np.array([0.24, 0.38])
        zsurf = 0.05
    else:
        center = box[:, :2].mean(0)
        zsurf = float(np.percentile(np.abs(box[:, 2]), 88))

    t = np.array([0.93, 0.37, 0.0])  # down-tube axis (up-forward)
    for side in (1, -1):
        n = np.array([0.0, 0.0, float(side)])
        hdir = np.cross(n, t)
        hdir /= np.linalg.norm(hdir)
        c = np.array([center[0], center[1], side * (zsurf + 0.004)])
        quad = np.array([
            c - t * (W / 2) - hdir * (H / 2),
            c + t * (W / 2) - hdir * (H / 2),
            c + t * (W / 2) + hdir * (H / 2),
            c - t * (W / 2) + hdir * (H / 2),
        ])
        faces = np.array([[0, 1, 2], [0, 2, 3]])
        # mirror U on the non-drive side so the logo reads correctly from outside
        uv = (np.array([[0, 0], [1, 0], [1, 1], [0, 1]], float) if side > 0
              else np.array([[1, 0], [0, 0], [0, 1], [1, 1]], float))
        m = trimesh.Trimesh(vertices=quad, faces=faces, process=False)
        mat = PBRMaterial(name="A2 Logo", baseColorTexture=logo, alphaMode="BLEND",
                          metallicFactor=0.0, roughnessFactor=0.5, doubleSided=True)
        m.visual = trimesh.visual.TextureVisuals(uv=uv, material=mat)
        idx = counts.get("frame", 0)
        counts["frame"] = idx + 1
        out.add_geometry(m, geom_name=f"frame__{idx}", node_name=f"frame__{idx}")


def main():
    src = trimesh.load(SRC, force="scene")
    out = trimesh.Scene()
    counts, vtotal = {}, 0
    frame_pts = []
    for name, geo in src.geometry.items():
        if not isinstance(geo, trimesh.Trimesh):
            continue
        T, _ = src.graph.get(src.graph.geometry_nodes[name][0])
        m = geo.copy()
        m.apply_transform(T)
        c = m.bounds.mean(0)
        grp = group_for(name, c)
        m = decimate(m, keep_for(name, len(m.vertices), grp))
        m.vertices = to_guide(np.asarray(m.vertices))
        m.faces = np.fliplr(m.faces)  # restore winding after the lateral mirror
        m.visual = trimesh.visual.TextureVisuals(material=MATS[material_for(name)])
        if grp == "frame":
            frame_pts.append(np.asarray(m.vertices))
        idx = counts.get(grp, 0)
        counts[grp] = idx + 1
        out.add_geometry(m, geom_name=f"{grp}__{idx}", node_name=f"{grp}__{idx}")
        vtotal += len(m.vertices)

    # Logo decal intentionally NOT applied to the assembly-guide model: a flat
    # decal quad floated/showed its background in WebGL. The instructional model
    # ships clean matte black; the website spinner keeps its baked-in logo.
    _ = frame_pts  # collected but unused here
    print("group counts:", dict(sorted(counts.items())))
    print("total vertices:", vtotal)
    data = out.export(file_type="glb")
    with open(OUT, "wb") as fh:
        fh.write(data)
    print(f"wrote {OUT} ({len(data)/1e6:.1f} MB)")


if __name__ == "__main__":
    main()
