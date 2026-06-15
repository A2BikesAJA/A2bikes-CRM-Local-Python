import { useRef, useMemo, type ReactNode } from "react";
import { useFrame } from "@react-three/fiber";
import { Group, Mesh, MeshStandardMaterial, Color, Vector3 } from "three";
import { useStore } from "../state/store";
import { INSERTION_AXIS, type PartId } from "../lib/parts";
import { usePrefersReducedMotion } from "../hooks/useMediaQuery";

const HIGHLIGHT = new Color("#3b82f6"); // A2 Oswego-blue family accent
const tmp = new Vector3();
const EASE = (t: number) => 1 - Math.pow(1 - t, 3); // easeOutCubic

interface PartProps {
  id: PartId;
  children: ReactNode;
  /** When the model uses double-clicking to frame a part. */
  onFramed?: (id: PartId) => void;
}

/**
 * Wraps any sub-tree as an addressable part. Reads the active step from the
 * store and drives four behaviours every frame:
 *   - explode: animate from the step's offset (or insertion-axis fallback) to
 *     the seated position so the part visibly "drops in".
 *   - hidden: scale to zero (kept in tree so it can re-appear).
 *   - ghost: fade non-relevant parts to ~35% opacity.
 *   - focus: emissive highlight with a gentle pulse.
 */
export function Part({ id, children, onFramed }: PartProps) {
  const groupRef = useRef<Group>(null);
  const reduced = usePrefersReducedMotion();

  // Per-instance animation progress for the insertion move (0 → 1 seated).
  const anim = useRef({ t: 1, lastStep: -2, lastReplay: -1 });
  // Cache discovered meshes + their base materials so ghost/highlight restore.
  const cache = useRef<
    { mesh: Mesh; mat: MeshStandardMaterial; baseOpacity: number; baseEmissive: Color; baseEmissiveIntensity: number }[]
  >([]);

  useMemo(() => {
    // invalidate mesh cache when children identity changes
    cache.current = [];
  }, [children]);

  useFrame((_, delta) => {
    const g = groupRef.current;
    if (!g) return;

    const { index, steps, replayNonce } = useStore.getState();
    const step = index >= 0 ? steps[index] : null;

    const focus = !!step && step.focusParts.includes(id);
    const hidden = !!step && step.hiddenParts.includes(id);
    const relevant = !step || step.parts.includes(id) || step.focusParts.includes(id);
    const ghost = !!step && !relevant && !hidden;

    // ── explode / insertion animation ──────────────────────────────────
    const offset =
      (step?.explode?.[id] as [number, number, number] | undefined) ??
      (focus ? INSERTION_AXIS[id] : undefined);

    // reset animation when the step or replay request changes
    if (anim.current.lastStep !== index || anim.current.lastReplay !== replayNonce) {
      anim.current.lastStep = index;
      anim.current.lastReplay = replayNonce;
      anim.current.t = offset && !reduced ? 0 : 1;
    }
    if (offset) {
      if (anim.current.t < 1) {
        anim.current.t = Math.min(1, anim.current.t + delta / 1.2);
      }
      const e = EASE(anim.current.t);
      g.position.set(
        offset[0] * (1 - e),
        offset[1] * (1 - e),
        offset[2] * (1 - e)
      );
    } else {
      g.position.lerp(tmp.set(0, 0, 0), 0.2);
    }

    // ── hidden ─────────────────────────────────────────────────────────
    const targetScale = hidden ? 0.0001 : 1;
    g.scale.lerp(tmp.set(targetScale, targetScale, targetScale), 0.25);
    g.visible = g.scale.x > 0.01;

    // ── material effects (ghost + highlight) ────────────────────────────
    if (cache.current.length === 0) {
      g.traverse((o) => {
        const m = o as Mesh;
        if (m.isMesh && m.material) {
          const mat = m.material as MeshStandardMaterial;
          cache.current.push({
            mesh: m,
            mat,
            baseOpacity: mat.opacity,
            baseEmissive: mat.emissive.clone(),
            baseEmissiveIntensity: mat.emissiveIntensity ?? 1,
          });
        }
      });
    }

    const pulse = focus ? 0.35 + 0.25 * Math.sin(performance.now() / 320) : 0;
    for (const c of cache.current) {
      const targetOpacity = ghost ? 0.35 : c.baseOpacity;
      c.mat.transparent = ghost || c.baseOpacity < 1;
      c.mat.opacity += (targetOpacity - c.mat.opacity) * 0.2;
      c.mat.depthWrite = !ghost;
      if (focus) {
        c.mat.emissive.copy(HIGHLIGHT);
        c.mat.emissiveIntensity = pulse;
      } else {
        c.mat.emissive.copy(c.baseEmissive);
        c.mat.emissiveIntensity = c.baseEmissiveIntensity;
      }
    }
  });

  return (
    <group
      ref={groupRef}
      name={id}
      onDoubleClick={(e) => {
        e.stopPropagation();
        onFramed?.(id);
      }}
    >
      {children}
    </group>
  );
}
