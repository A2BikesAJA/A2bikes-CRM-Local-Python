#!/usr/bin/env python3
"""Render one instructional image per step from the CAD model for the PDF.

For each step in steps.json: position the camera at the step's authored angle,
highlight the focus part(s), render with Blender/Cycles, project the action
arrow(s) into 2D, then composite arrows + a caption bar with PIL.

Run with the system python (has bpy + PIL + matplotlib):
    python tools/render_steps.py <sp_plain.glb> <out_dir>
Outputs <out_dir>/step_01.png ... step_09.png
"""
import json
import math
import os
import sys
import bpy
import mathutils
from bpy_extras.object_utils import world_to_camera_view
from PIL import Image, ImageDraw, ImageFont
import matplotlib

HERE = os.path.dirname(os.path.abspath(__file__))
GLB = sys.argv[1] if len(sys.argv) > 1 else "/tmp/sp3d/parts/sp_plain.glb"
OUT = sys.argv[2] if len(sys.argv) > 2 else os.path.join(HERE, "step-images")
os.makedirs(OUT, exist_ok=True)
STEPS = json.load(open(os.path.join(HERE, "../src/content/steps.json")))["steps"]

W, H = 1200, 820
ACCENT = (47, 109, 168)   # A2 blue
RED = (235, 28, 45)
INK = (20, 23, 27)

# focusPart id -> group prefix that actually exists in the model
FALLBACK = {
    "seatpost": "saddle", "pedal_left": "crankset", "pedal_right": "crankset",
    "extensions": "cockpit_basebar", "thru_axle_front": "front_wheel",
    "front_rotor": "front_wheel", "front_caliper": "front_wheel",
}
GROUPS = {"chain", "cockpit_basebar", "crankset", "fork", "frame", "front_wheel",
          "rear_caliper", "rear_derailleur", "rear_wheel", "saddle", "stem_topcap"}

TTF = matplotlib.get_data_path() + "/fonts/ttf/DejaVuSans.ttf"
TTF_B = matplotlib.get_data_path() + "/fonts/ttf/DejaVuSans-Bold.ttf"


def g2b(p):
    """glTF (x fwd, y up, z drive) -> Blender (x, -z, y)."""
    return mathutils.Vector((p[0], -p[2], p[1]))


# ── scene setup ───────────────────────────────────────────────────────────
bpy.ops.wm.read_factory_settings(use_empty=True)
sc = bpy.context.scene
sc.render.engine = "CYCLES"
sc.cycles.samples = 28
sc.cycles.use_denoising = True
sc.render.resolution_x = W
sc.render.resolution_y = H
sc.render.film_transparent = False
# Standard (not Filmic) so the matte black stays black instead of lifting to gray
sc.view_settings.view_transform = "Standard"
sc.view_settings.look = "None"

bpy.ops.import_scene.gltf(filepath=GLB)

# index mesh objects by group prefix; soften default sheen
group_objs = {}
for ob in bpy.data.objects:
    if ob.type != "MESH":
        continue
    grp = ob.name.split("__")[0]
    group_objs.setdefault(grp, []).append(ob)
    for slot in ob.material_slots:
        m = slot.material
        b = m and next((n for n in m.node_tree.nodes if n.type == "BSDF_PRINCIPLED"), None)
        if b and "Steel" not in m.name and "Drivetrain" not in m.name:
            try:
                b.inputs["Specular IOR Level"].default_value = 0.15
            except KeyError:
                pass

def set_emission(objs, color, strength):
    for ob in objs:
        for slot in ob.material_slots:
            m = slot.material
            b = m and next((n for n in m.node_tree.nodes if n.type == "BSDF_PRINCIPLED"), None)
            if not b:
                continue
            try:
                b.inputs["Emission Color"].default_value = (*color, 1)
                b.inputs["Emission Strength"].default_value = strength
            except KeyError:
                pass

# white studio world + lights
world = bpy.data.worlds.new("w")
world.use_nodes = True
world.node_tree.nodes["Background"].inputs[0].default_value = (1, 1, 1, 1)
world.node_tree.nodes["Background"].inputs[1].default_value = 0.55
sc.world = world
for loc, rot, e in [((1.2, -2.2, 1.8), (math.radians(52), 0, math.radians(20)), 45),
                    ((-2.0, -1.2, 1.2), (math.radians(64), 0, math.radians(-48)), 16),
                    ((0, 2.6, 1.6), (math.radians(-52), 0, math.radians(180)), 32)]:
    L = bpy.data.lights.new("l", type="AREA"); L.size = 3.2; L.energy = e
    o = bpy.data.objects.new("l", L); o.location = loc; o.rotation_euler = rot
    sc.collection.objects.link(o)

cam_data = bpy.data.cameras.new("cam")
cam = bpy.data.objects.new("cam", cam_data)
sc.collection.objects.link(cam); sc.camera = cam
cam_data.sensor_fit = "VERTICAL"

acc01 = tuple(c / 255 for c in ACCENT)
fontB = ImageFont.truetype(TTF_B, 34)
fontM = ImageFont.truetype(TTF, 26)
fontS = ImageFont.truetype(TTF, 22)


def project(p_gltf):
    co = world_to_camera_view(sc, cam, g2b(p_gltf))
    return (co.x * W, (1 - co.y) * H, co.z)


def draw_arrow(d, tail, tip, color):
    d.line([tail, tip], fill=color, width=7)
    ang = math.atan2(tip[1] - tail[1], tip[0] - tail[0])
    for s in (+1, -1):
        a = ang + math.pi - s * 0.5
        d.line([tip, (tip[0] + 26 * math.cos(a), tip[1] + 26 * math.sin(a))], fill=color, width=7)


for step in STEPS:
    n = step["order"]
    # (3D emission highlight removed — the 2D arrow + tight framing convey the
    #  action more reliably and keep the matte-black finish true.)

    # camera
    pos = step["camera"]["position"]; tgt = step["camera"]["target"]
    cam.location = g2b(pos)
    direction = g2b(tgt) - cam.location
    cam.rotation_euler = direction.to_track_quat("-Z", "Y").to_euler()
    cam_data.angle_y = math.radians(step["camera"]["fov"] + 10)
    bpy.context.view_layer.update()

    path = os.path.join(OUT, f"step_{n:02d}.png")
    sc.render.filepath = path
    bpy.ops.render.render(write_still=True)

    # composite arrows + caption with PIL
    img = Image.open(path).convert("RGB")
    d = ImageDraw.Draw(img)
    for ann in step.get("annotations", []):
        tipx, tipy, tz = project(ann["at"])
        tail_pt = [ann["at"][i] - ann["dir"][i] * 0.16 for i in range(3)]
        tlx, tly, _ = project(tail_pt)
        if tz > 0:  # in front of camera (tz is depth in metres, not normalized)
            col = RED if ann.get("emphasis") else ACCENT
            draw_arrow(d, (tlx, tly), (tipx, tipy), col)
            label = ann["label"]
            tw = d.textbbox((0, 0), label, font=fontS)[2]
            lx = min(max(tlx - tw / 2, 8), W - tw - 16)
            ly = max(tly - 40, 8)
            d.rectangle([lx - 8, ly - 4, lx + tw + 8, ly + 30], fill=col)
            d.text((lx, ly), label, font=fontS, fill=(255, 255, 255))

    # caption bar
    bar_h = 96
    d.rectangle([0, H - bar_h, W, H], fill=INK)
    d.text((28, H - bar_h + 14), f"Step {n}.  {step['title']}", font=fontB, fill=(255, 255, 255))
    sub = step["summary"]
    if len(sub) > 92:
        sub = sub[:89] + "…"
    d.text((28, H - bar_h + 56), sub, font=fontS, fill=(196, 204, 212))
    img.save(path)
    print("rendered", path)

print("done")
