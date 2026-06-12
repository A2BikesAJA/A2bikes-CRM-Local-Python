#!/usr/bin/env python3
"""Apply the A2 down tube decal inside Blender — WYSIWYG pipeline.

Placement, preview render, and GLB export all share one Blender scene, so the
verification renders show exactly what the exported file contains. Run on a
GLB built with `build_master.py ... --no-decal`.

Steps: import -> split frame side faces into decal materials -> planar UVs ->
render checks (drive side, non-drive side, front 3/4) -> export GLB ->
re-import the exported file and render again as round-trip proof.

Usage: python blender_decal.py <in_nodecal.glb> <out.glb> <decal.png> <outdir>
"""

import math
import sys
from pathlib import Path

import bpy
import mathutils
from PIL import Image

IN_GLB = sys.argv[1]
OUT_GLB = sys.argv[2]
DECAL_PNG = sys.argv[3]
OUTDIR = Path(sys.argv[4] if len(sys.argv) > 4 else ".")
OUTDIR.mkdir(parents=True, exist_ok=True)

FRAME_OBJ = "COMPOUND_3"
# Blender coords after glTF import: x = nose, z = up, y = lateral.
# Production placement (SP Red Black photo): upper down tube, below storage.
# Measured tube line: z = 0.54 + 0.87*x ; side skin |normal.y| > 0.35.
CX, CZ, W, ANGLE = 0.035, 0.567, 0.16, 41.0
CENTER_Y = 0.07
WIN_X0, WIN_Z0, WIN_SIDE = -0.71, 0.21, 0.92
TEX = 1024
# Per-side u direction and stamp rotation; +1 keeps u = x-direction.
# Determined by the render checks below: drive side is +y.
SIDE_CFG = {"right": {"flip_u": True, "angle": -ANGLE},
            "left": {"flip_u": False, "angle": ANGLE}}


def make_texture(side):
    tex = Image.new("RGB", (TEX, TEX), (20, 20, 22))
    logo = Image.open(DECAL_PNG).convert("RGBA")
    w_px = int(W / WIN_SIDE * TEX)
    logo = logo.resize((w_px, int(w_px * logo.height / logo.width)), Image.LANCZOS)
    logo = logo.rotate(SIDE_CFG[side]["angle"], expand=True, resample=Image.BICUBIC)
    ul = (CX - WIN_X0) / WIN_SIDE
    if SIDE_CFG[side]["flip_u"]:
        ul = 1.0 - ul
    vc = 1.0 - (CZ - WIN_Z0) / WIN_SIDE   # PIL row from top
    px, py = int(ul * TEX), int(vc * TEX)
    tex.paste(logo, (px - logo.width // 2, py - logo.height // 2), logo)
    path = str(OUTDIR / f"decal_{side}.png")
    tex.save(path)
    img = bpy.data.images.load(path)
    return img


def decal_material(side, base_mat):
    mat = base_mat.copy()
    mat.name = f"A2 Matte Black Decal {side}"
    nt = mat.node_tree
    bsdf = next(n for n in nt.nodes if n.type == "BSDF_PRINCIPLED")
    teximg = nt.nodes.new("ShaderNodeTexImage")
    teximg.image = make_texture(side)
    nt.links.new(teximg.outputs["Color"], bsdf.inputs["Base Color"])
    return mat


def apply_decals():
    ob = bpy.data.objects[FRAME_OBJ]
    me = ob.data
    # glTF import leaves mesh data in Y-up local space with the Z-up fix on
    # the object transform — work in world space for selection and UVs.
    bpy.context.view_layer.update()
    M = ob.matrix_world
    R = M.to_3x3()
    base_mat = ob.material_slots[0].material
    me.materials.append(decal_material("right", base_mat))   # slot 1
    me.materials.append(decal_material("left", base_mat))    # slot 2
    uv = me.uv_layers.new(name="decal") if not me.uv_layers else me.uv_layers[0]
    me.uv_layers.active = uv
    for poly in me.polygons:
        n = R @ poly.normal
        c = M @ poly.center
        if n.y > 0.35 and c.y >= CENTER_Y:
            side = "right"
            poly.material_index = 1
        elif n.y < -0.35 and c.y < CENTER_Y:
            side = "left"
            poly.material_index = 2
        else:
            continue
        flip = SIDE_CFG[side]["flip_u"]
        for li in poly.loop_indices:
            v = M @ me.vertices[me.loops[li].vertex_index].co
            u = (v.x - WIN_X0) / WIN_SIDE
            if flip:
                u = 1.0 - u
            # Blender image V runs bottom-up; PIL rows top-down -> matches
            uv.data[li].uv = (u, (v.z - WIN_Z0) / WIN_SIDE)


def studio_and_render(tag):
    sc = bpy.context.scene
    sc.render.engine = "CYCLES"
    sc.cycles.samples = 32
    sc.cycles.use_denoising = True
    sc.render.resolution_x = 900
    sc.render.resolution_y = 600
    world = bpy.data.worlds.new("w")
    world.use_nodes = True
    world.node_tree.nodes["Background"].inputs[0].default_value = (1, 1, 1, 1)
    world.node_tree.nodes["Background"].inputs[1].default_value = 0.35
    sc.world = world
    for m in bpy.data.materials:
        b = next((n for n in m.node_tree.nodes if n.type == "BSDF_PRINCIPLED"), None)
        if b and "Steel" not in m.name:
            b.inputs["Specular IOR Level"].default_value = 0.15
    for loc, rot in [((0.5, -2.5, 2.0), (math.radians(50), 0, 0)),
                     ((0.5, 2.5, 2.0), (math.radians(-50), 0, math.radians(180)))]:
        light = bpy.data.lights.new("l", type="AREA")
        light.size = 3
        light.energy = 300
        lo = bpy.data.objects.new("l", light)
        lo.location = loc
        lo.rotation_euler = rot
        sc.collection.objects.link(lo)
    cam = bpy.data.cameras.new("c")
    cam.lens = 50
    co = bpy.data.objects.new("c", cam)
    sc.collection.objects.link(co)
    sc.camera = co
    for name, loc in [("driveside", (0, -2.1, 0.75)), ("nondrive", (0, 2.1, 0.75)),
                      ("front34", (1.6, -1.3, 0.8))]:
        co.location = loc
        d = mathutils.Vector((0, 0, 0.5)) - mathutils.Vector(loc)
        co.rotation_euler = d.to_track_quat("-Z", "Y").to_euler()
        sc.render.filepath = str(OUTDIR / f"{tag}_{name}.png")
        bpy.ops.render.render(write_still=True)


bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=IN_GLB)
apply_decals()
studio_and_render("preview")
bpy.ops.export_scene.gltf(filepath=OUT_GLB, export_format="GLB")
print("exported", OUT_GLB)

# round-trip proof: render the exported file itself
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=OUT_GLB)
studio_and_render("roundtrip")
print("done")
