#!/usr/bin/env python3
"""Photoreal turntable render of the SP using Blender (Cycles, CPU).

Studio setup: white seamless background, shadow-catcher floor, 3-point
area lighting. Renders N frames orbiting the bike, for a spin GIF/MP4.

Usage:
  python render_turntable.py <sp_final.glb> <out_dir> [n_frames] [size] [samples]
  (n_frames=1 renders a single hero frame for lighting checks)
"""

import math
import sys
from pathlib import Path

import bpy

GLB = sys.argv[1] if len(sys.argv) > 1 else "sp_final.glb"
OUT = Path(sys.argv[2] if len(sys.argv) > 2 else "frames")
N_FRAMES = int(sys.argv[3]) if len(sys.argv) > 3 else 36
SIZE = int(sys.argv[4]) if len(sys.argv) > 4 else 900
SAMPLES = int(sys.argv[5]) if len(sys.argv) > 5 else 48

OUT.mkdir(parents=True, exist_ok=True)

bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene
scene.render.engine = "CYCLES"
scene.cycles.samples = SAMPLES
scene.cycles.use_denoising = True
scene.cycles.device = "CPU"
scene.render.resolution_x = SIZE
scene.render.resolution_y = int(SIZE * 0.75)
scene.render.film_transparent = False
scene.view_settings.view_transform = "Filmic"
scene.view_settings.look = "Medium High Contrast"

bpy.ops.import_scene.gltf(filepath=GLB)

# matte paint: kill the broad clearcoat-like sheen glTF defaults give
for m in bpy.data.materials:
    bsdf = next((n for n in m.node_tree.nodes if n.type == "BSDF_PRINCIPLED"), None)
    if bsdf is None:
        continue
    if "Steel" not in m.name:
        bsdf.inputs["Specular IOR Level"].default_value = 0.15
    if "Matte" in m.name or "Decal" in m.name:
        bsdf.inputs["Roughness"].default_value = 0.65

# bounding box of imported objects (Blender is Z-up; glTF importer converts)
mins = [1e9] * 3
maxs = [-1e9] * 3
for ob in bpy.data.objects:
    if ob.type != "MESH":
        continue
    for corner in ob.bound_box:
        w = ob.matrix_world @ bpy.mathutils_vector(corner) if False else (
            ob.matrix_world @ __import__("mathutils").Vector(corner))
        for i in range(3):
            mins[i] = min(mins[i], w[i])
            maxs[i] = max(maxs[i], w[i])
cx, cy, cz = [(mins[i] + maxs[i]) / 2 for i in range(3)]
floor_z = mins[2]
diag = max(maxs[i] - mins[i] for i in range(3))

# group bike under a pivot for turntable rotation
pivot = bpy.data.objects.new("pivot", None)
scene.collection.objects.link(pivot)
pivot.location = (cx, cy, cz)
for ob in list(bpy.data.objects):
    if ob.type == "MESH" and ob.parent is None:
        ob.parent = pivot
        ob.matrix_parent_inverse = pivot.matrix_world.inverted()

# white world
world = bpy.data.worlds.new("studio")
world.use_nodes = True
world.node_tree.nodes["Background"].inputs[0].default_value = (1, 1, 1, 1)
world.node_tree.nodes["Background"].inputs[1].default_value = 0.12
scene.world = world

# shadow-catcher floor
bpy.ops.mesh.primitive_plane_add(size=diag * 8, location=(cx, cy, floor_z))
floor = bpy.context.object
floor.is_shadow_catcher = False
fm = bpy.data.materials.new("floor")
fm.use_nodes = True
fm.node_tree.nodes["Principled BSDF"].inputs["Base Color"].default_value = (0.92, 0.92, 0.92, 1)
fm.node_tree.nodes["Principled BSDF"].inputs["Roughness"].default_value = 0.9
floor.data.materials.append(fm)

def area_light(name, loc, rot, size, energy):
    light = bpy.data.lights.new(name, type="AREA")
    light.size = size
    light.energy = energy
    ob = bpy.data.objects.new(name, light)
    ob.location = loc
    ob.rotation_euler = rot
    scene.collection.objects.link(ob)

area_light("key", (cx + 1.2, cy - 2.2, cz + 1.8), (math.radians(50), 0, math.radians(25)), 3.0, 250)
area_light("fill", (cx - 2.0, cy - 1.5, cz + 0.8), (math.radians(70), 0, math.radians(-50)), 3.0, 90)
area_light("rim", (cx, cy + 2.5, cz + 1.5), (math.radians(-55), 0, math.radians(180)), 4.0, 220)

# camera: product-shot angle, slightly above axle height
cam = bpy.data.cameras.new("cam")
cam.lens = 60
cam_ob = bpy.data.objects.new("cam", cam)
scene.collection.objects.link(cam_ob)
scene.camera = cam_ob
dist = diag * 1.45
cam_ob.location = (cx, cy - dist, cz + diag * 0.18)
# aim at center
direction = (cx - cam_ob.location[0], cy - cam_ob.location[1], cz - cam_ob.location[2])
import mathutils
cam_ob.rotation_euler = mathutils.Vector(direction).to_track_quat("-Z", "Y").to_euler()

for i in range(N_FRAMES):
    pivot.rotation_euler[2] = math.radians(360.0 * i / max(N_FRAMES, 1))
    scene.render.filepath = str(OUT / f"frame_{i:03d}.png")
    bpy.ops.render.render(write_still=True)
    print(f"rendered {i+1}/{N_FRAMES}", flush=True)
print("done")
