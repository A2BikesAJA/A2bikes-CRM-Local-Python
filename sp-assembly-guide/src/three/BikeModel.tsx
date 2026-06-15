import { Suspense, useEffect, useState } from "react";
import { useGLTF } from "@react-three/drei";
import { Object3D } from "three";
import { Part } from "./Part";
import { ParametricBike } from "./ParametricBike";
import { ErrorBoundary } from "./ErrorBoundary";
import { PART_IDS, type PartId } from "../lib/parts";

const GLB_URL = `${import.meta.env.BASE_URL}assets/sp.glb`;

interface Props {
  onFramed?: (id: PartId) => void;
}

/**
 * Phase 2 path: loads assets/sp.glb and wraps each contract-named node in a
 * <Part>. A node missing from the GLB is simply skipped, so a partial export
 * still works. See ASSET_SWAP.md for the naming/scale contract.
 */
function GLBBike({ onFramed }: Props) {
  const { scene } = useGLTF(GLB_URL);
  const nodes: Record<string, Object3D> = {};
  scene.traverse((o) => {
    if (o.name && (PART_IDS as readonly string[]).includes(o.name)) {
      nodes[o.name] = o;
    }
  });
  return (
    <group>
      {PART_IDS.map((id) =>
        nodes[id] ? (
          <Part key={id} id={id} onFramed={onFramed}>
            <primitive object={nodes[id]} />
          </Part>
        ) : null
      )}
    </group>
  );
}

/** Chooses GLB when present, otherwise the parametric model. */
export function BikeModel({ onFramed }: Props) {
  const [hasGlb, setHasGlb] = useState<boolean | null>(null);

  useEffect(() => {
    let alive = true;
    fetch(GLB_URL, { method: "HEAD" })
      .then((r) => alive && setHasGlb(r.ok && (r.headers.get("content-type")?.includes("gltf") ?? true)))
      .catch(() => alive && setHasGlb(false));
    return () => {
      alive = false;
    };
  }, []);

  if (!hasGlb) return <ParametricBike onFramed={onFramed} />;

  return (
    <ErrorBoundary fallback={<ParametricBike onFramed={onFramed} />}>
      <Suspense fallback={<ParametricBike onFramed={onFramed} />}>
        <GLBBike onFramed={onFramed} />
      </Suspense>
    </ErrorBoundary>
  );
}
