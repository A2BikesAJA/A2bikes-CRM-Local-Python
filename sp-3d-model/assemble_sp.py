#!/usr/bin/env python3
"""Assemble the SP bike model from individual Shapr3D STEP exports.

Inputs (converted to GLB first via convert_to_glb.py or cascadio):
    rogue.glb   — frameset: frame, fork, storage boxes, hardware (KQS parts)
    wheels.glb  — carbon race wheels: spoked 60mm front + full disc rear,
                  exported in a Y-long coordinate frame, axles at z=0.321
    saddle.glb  — saddle, exported floating at z~0.96, nose toward -x after Rz(90)
    logo3d.glb  — 3D A2 logo badge, pre-positioned on the frame's left face

The frameset is the reference coordinate system: +x forward, +z up,
front axle at (0.586, 0, 0.075), rear at (-0.414, 0, 0.075), wheelbase 1.001 m.
The wheels file shares that scale; Rz(90) + translate mates both axles at once.
A provisional aero seatpost is generated to bridge frame and saddle until the
production A2SP post geometry is available.

Usage: python assemble_sp.py <input_dir> <output.glb>
"""

import sys
from pathlib import Path

import numpy as np
import trimesh

MAT = {
    "matte_black": dict(name="A2 Matte Black", baseColorFactor=[18, 18, 20, 255],
                        metallicFactor=0.05, roughnessFactor=0.85),
    "carbon": dict(name="Carbon Satin", baseColorFactor=[35, 35, 38, 255],
                   metallicFactor=0.3, roughnessFactor=0.5),
    "rubber": dict(name="Tire Rubber", baseColorFactor=[24, 24, 24, 255],
                   metallicFactor=0.0, roughnessFactor=0.95),
    "steel": dict(name="Dark Steel", baseColorFactor=[120, 120, 126, 255],
                  metallicFactor=0.9, roughnessFactor=0.35),
    "hardware": dict(name="Component Black", baseColorFactor=[30, 30, 32, 255],
                     metallicFactor=0.4, roughnessFactor=0.45),
    "saddle": dict(name="Saddle", baseColorFactor=[20, 20, 20, 255],
                   metallicFactor=0.0, roughnessFactor=0.9),
    # Brand: Pantone 430 C gray; switch to [235,28,45,255] for Pantone 185 red
    "logo": dict(name="A2 Logo Gray", baseColorFactor=[125, 133, 140, 255],
                 metallicFactor=0.6, roughnessFactor=0.35),
}

FRONT_AXLE = np.array([0.586, 0.075])
REAR_AXLE = np.array([-0.414, 0.075])


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


def Rz(deg):
    t = np.radians(deg)
    M = np.eye(4)
    M[:2, :2] = [[np.cos(t), -np.sin(t)], [np.sin(t), np.cos(t)]]
    return M


def Tr(x, y, z):
    M = np.eye(4)
    M[:3, 3] = [x, y, z]
    return M


def wheel_material(name, mesh):
    """Classify wheel sub-part by source part name and radius from its axle.

    Source library uses Russian part names: карбон = carbon (rim),
    резина = rubber (tire). CS-R9200 is the Dura-Ace cassette.
    """
    lowered = name.lower()
    if "резина" in lowered:
        return "rubber"
    if "карбон" in lowered:
        return "carbon"
    if "cs-" in lowered:
        return "steel"            # cassette
    V = np.asarray(mesh.vertices)
    c = V.mean(axis=0)
    axle = FRONT_AXLE if c[0] > 0 else REAR_AXLE
    r = np.linalg.norm(np.stack([V[:, 0] - axle[0], V[:, 2] - axle[1]], 1), axis=1)
    if r.min() > 0.30:
        return "rubber"           # tire fallback
    if r.max() > 0.28 and r.min() < 0.12:
        return "carbon"           # full disc spans hub to rim
    if 0.04 < r.min() and 0.065 < r.max() < 0.1:
        return "steel"            # brake rotor
    return "hardware"             # hub, axle, spokes, nipples


# SP geometry chart (size L): ST angle 78deg, BB drop 70mm, wheelbase 1005mm.
# BB lands at (-0.010, 0.005); measured seat tube axis runs from BB through
# the mast top at (-0.122, 0.44), slope dx/dz = -0.257 (~75.6deg actual mast).
BB = np.array([-0.010, 0.005])
SEAT_AXIS_DXDZ = -0.257
SADDLE_RAIL_POS = (-0.158, 0.712)  # ~720mm at 78deg effective from BB


def aero_seatpost():
    """Provisional aero post along the seat tube axis, with clamp head.

    Replace with the production A2SP-Richey geometry when available.
    """
    n = 40
    t = np.linspace(0, 2 * np.pi, n, endpoint=False)
    # airfoil-ish: 54mm chord, 27mm wide, slightly blunt nose
    px = 0.027 * np.cos(t) - 0.006 * np.cos(2 * t)
    py = 0.0135 * np.sin(t)
    z0, z1 = 0.40, 0.705
    cx = lambda z: -0.122 + SEAT_AXIS_DXDZ * (z - 0.44)
    rings = [np.column_stack([px + cx(z), py, np.full(n, z)]) for z in (z0, z1)]
    V = np.vstack(rings)
    F = []
    for i in range(n):
        j = (i + 1) % n
        F += [[i, j, n + i], [j, n + j, n + i]]
    top = len(V)
    V = np.vstack([V, [cx(z1), 0, z1]])
    F += [[n + i, n + (i + 1) % n, top] for i in range(n)]
    post = trimesh.Trimesh(vertices=V, faces=np.array(F))
    clamp = trimesh.creation.box(extents=[0.055, 0.034, 0.035])
    clamp.apply_translation([cx(z1) - 0.01, 0, z1 + 0.005])
    return trimesh.util.concatenate([post, clamp])


def build(indir: Path) -> trimesh.Scene:
    scene = trimesh.Scene()

    def add(name, mesh, mat):
        mesh.visual = trimesh.visual.TextureVisuals(
            material=trimesh.visual.material.PBRMaterial(**MAT[mat]))
        scene.add_geometry(mesh, geom_name=name)

    for k, m in positioned(indir / "rogue.glb"):
        mat = "hardware" if k.startswith("COMPOUND") and k != "COMPOUND_1" else "matte_black"
        add(f"frame/{k}", m, mat)

    Tw = Tr(0.266, 0, -0.246) @ Rz(90)
    for k, m in positioned(indir / "wheels.glb"):
        m.apply_transform(Tw)
        add(f"wheels/{k}", m, wheel_material(k, m))

    Ts = Rz(90)  # nose forward (+x)
    sparts = [(k, m) for k, m in positioned(indir / "saddle.glb")]
    smm = trimesh.util.concatenate([m.copy() for _, m in sparts])
    smm.apply_transform(Ts)
    b = smm.bounds
    Tp = Tr(SADDLE_RAIL_POS[0] - (b[0][0] + b[1][0]) / 2,
            -(b[0][1] + b[1][1]) / 2,
            SADDLE_RAIL_POS[1] - b[0][2])
    for k, m in sparts:
        m.apply_transform(Tp @ Ts)
        add(f"saddle/{k}", m, "saddle")

    for k, m in positioned(indir / "logo3d.glb"):
        add(f"logo/{k}", m, "logo")
        mr = m.copy()
        mr.vertices = np.asarray(mr.vertices) * [1, -1, 1]
        mr.invert()
        add(f"logo/{k}_mirrored", mr, "logo")

    add("seatpost/provisional", aero_seatpost(), "matte_black")
    return scene


if __name__ == "__main__":
    indir = Path(sys.argv[1]) if len(sys.argv) > 1 else Path(".")
    out = Path(sys.argv[2]) if len(sys.argv) > 2 else Path("sp_assembled.glb")
    scene = build(indir)
    scene.export(str(out))
    print(f"wrote {out} ({out.stat().st_size/1e6:.1f} MB, {len(scene.geometry)} parts)")
