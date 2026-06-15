import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import { Group, Vector3, Quaternion } from "three";
import { useStore } from "../state/store";
import { usePrefersReducedMotion } from "../hooks/useMediaQuery";
import type { Annotation } from "../lib/types";

const UP = new Vector3(0, 1, 0);
const RED = "#eb1c2d";
const GRAY = "#1e4d78";
const LEN = 0.17; // arrow length
const HEAD = 0.06; // head length

/** A single animated red action arrow: shaft + cone head, with a label. */
function Arrow({ ann }: { ann: Annotation }) {
  const ref = useRef<Group>(null);
  const reduced = usePrefersReducedMotion();
  const { quat, tip, dir, color } = useMemo(() => {
    const d = new Vector3(...ann.dir).normalize();
    return {
      dir: d,
      quat: new Quaternion().setFromUnitVectors(UP, d),
      tip: new Vector3(...ann.at),
      color: ann.emphasis ? RED : GRAY,
    };
  }, [ann]);

  // bob along the action direction to draw the eye toward the spot
  useFrame(() => {
    if (!ref.current) return;
    const bob = reduced ? 0 : Math.sin(performance.now() / 400) * 0.025;
    ref.current.position.copy(tip).addScaledVector(dir, bob);
  });

  // shaft+head are built pointing along +y, with the TIP at local origin
  return (
    <group ref={ref} quaternion={quat}>
      {/* shaft: from -LEN to -HEAD along y */}
      <mesh position={[0, -(HEAD + (LEN - HEAD) / 2), 0]}>
        <cylinderGeometry args={[0.012, 0.012, LEN - HEAD, 12]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.4} roughness={0.5} />
      </mesh>
      {/* head: cone tip at origin pointing +y */}
      <mesh position={[0, -HEAD / 2, 0]}>
        <coneGeometry args={[0.032, HEAD, 16]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} roughness={0.5} />
      </mesh>
      <Html position={[0, -(LEN + 0.02), 0]} center distanceFactor={1.5} zIndexRange={[30, 0]} style={{ pointerEvents: "none" }}>
        <div className={`action-pin ${ann.emphasis ? "is-emph" : ""}`}>{ann.label}</div>
      </Html>
    </group>
  );
}

export function Arrows() {
  const step = useStore((s) => s.currentStep());
  if (!step?.annotations?.length) return null;
  return (
    <>
      {step.annotations.map((a, i) => (
        <Arrow key={`${step.id}-${i}`} ann={a} />
      ))}
    </>
  );
}
