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
import re
import sys
import numpy as np
import trimesh
from trimesh.visual.material import PBRMaterial

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


def main():
    src = trimesh.load(SRC, force="scene")
    out = trimesh.Scene()
    counts, vtotal = {}, 0
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
        idx = counts.get(grp, 0)
        counts[grp] = idx + 1
        out.add_geometry(m, geom_name=f"{grp}__{idx}", node_name=f"{grp}__{idx}")
        vtotal += len(m.vertices)
    print("group counts:", dict(sorted(counts.items())))
    print("total vertices:", vtotal)
    data = out.export(file_type="glb")
    with open(OUT, "wb") as fh:
        fh.write(data)
    print(f"wrote {OUT} ({len(data)/1e6:.1f} MB)")


if __name__ == "__main__":
    main()
