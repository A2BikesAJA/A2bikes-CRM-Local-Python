import { BufferGeometry, Float32BufferAttribute, Vector3 } from "three";

type V3 = [number, number, number];

/**
 * Lofted aero-tube geometry between two points. The cross-section is a teardrop
 * (round leading edge, pointed trailing edge) whose CHORD lies in the bike's
 * sagittal plane and whose THICKNESS faces laterally — i.e. a real aero tube,
 * not a round one. Built explicitly so the airfoil orientation is controlled
 * (quaternion alignment would leave the roll undefined).
 */
export function makeAeroTube(
  from: V3,
  to: V3,
  chord = 0.07,
  thick = 0.03,
  seg = 24
): BufferGeometry {
  const a = new Vector3(...from);
  const b = new Vector3(...to);
  const dir = new Vector3().subVectors(b, a);
  const len = dir.length();
  dir.normalize();

  // lateral = bike Z; if the tube runs nearly lateral, fall back to up.
  let lateral = new Vector3(0, 0, 1);
  if (Math.abs(dir.dot(lateral)) > 0.95) lateral = new Vector3(0, 1, 0);
  // chord direction lies in the plane spanned by dir and (perp to lateral)
  const chordDir = new Vector3().crossVectors(dir, lateral).normalize();
  const thickDir = new Vector3().crossVectors(chordDir, dir).normalize();

  // teardrop profile in (chord, thick) param space, u in [0,1]
  const profile: [number, number][] = [];
  for (let i = 0; i < seg; i++) {
    const t = (i / seg) * Math.PI * 2;
    // round nose at +chord, point at -chord
    const c = Math.cos(t);
    const s = Math.sin(t);
    const cx = 0.5 * (c >= 0 ? c : c * 0.6); // fuller nose, tapered tail
    const ty = s * 0.5 * (0.55 + 0.45 * Math.max(0, c)); // thin toward tail
    profile.push([cx * chord, ty * thick]);
  }

  const verts: number[] = [];
  const idx: number[] = [];
  const ringAt = (center: Vector3) => {
    const base = verts.length / 3;
    for (const [pc, pt] of profile) {
      const p = new Vector3()
        .copy(center)
        .addScaledVector(chordDir, pc)
        .addScaledVector(thickDir, pt);
      verts.push(p.x, p.y, p.z);
    }
    return base;
  };

  const r0 = ringAt(a);
  const r1 = ringAt(b.copy(a).addScaledVector(dir, len));
  // wall
  for (let i = 0; i < seg; i++) {
    const j = (i + 1) % seg;
    idx.push(r0 + i, r0 + j, r1 + i);
    idx.push(r0 + j, r1 + j, r1 + i);
  }
  // caps (fan)
  const cap = (ringBase: number, center: Vector3, flip: boolean) => {
    const ci = verts.length / 3;
    verts.push(center.x, center.y, center.z);
    for (let i = 0; i < seg; i++) {
      const j = (i + 1) % seg;
      if (flip) idx.push(ci, ringBase + j, ringBase + i);
      else idx.push(ci, ringBase + i, ringBase + j);
    }
  };
  cap(r0, new Vector3(...from), true);
  cap(r1, new Vector3(...to), false);

  const g = new BufferGeometry();
  g.setAttribute("position", new Float32BufferAttribute(verts, 3));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}

export const v = (x: number, y: number, z: number): V3 => [x, y, z];
