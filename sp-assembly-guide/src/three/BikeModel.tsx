import { Suspense } from "react";
import { useGLTF } from "@react-three/drei";
import { Object3D } from "three";
import { Part } from "./Part";
import { ParametricBike } from "./ParametricBike";
import { ErrorBoundary } from "./ErrorBoundary";
import { PART_IDS, type PartId } from "../lib/parts";
import GLB_URL from "../assets/sp.glb";

interface Props {
  onFramed?: (id: PartId) => void;
}

/**
 * Loads the CAD model (src/assets/sp.glb, meshopt-compressed) and wraps each
 * contract-named node in a <Part>. Nodes are named `<id>` or `<id>__<n>`, so a
 * part may be many meshes (e.g. front_wheel = rim + tire + hub). See
 * ASSET_SWAP.md for the naming/scale contract. Falls back to the parametric
 * model if the GLB ever fails to load.
 */
function GLBBike({ onFramed }: Props) {
  // useDraco=false: we ship meshopt, which decodes offline with no CDN fetch.
  const { scene } = useGLTF(GLB_URL, false);
  const groups: Record<string, Object3D[]> = {};
  scene.traverse((o) => {
    if (!(o as { isMesh?: boolean }).isMesh || !o.name) return;
    const id = o.name.split("__")[0];
    if ((PART_IDS as readonly string[]).includes(id)) {
      (groups[id] ||= []).push(o);
    }
  });
  return (
    <group>
      {PART_IDS.map((id) =>
        groups[id]?.length ? (
          <Part key={id} id={id} onFramed={onFramed}>
            {groups[id].map((o, i) => (
              <primitive key={i} object={o} />
            ))}
          </Part>
        ) : null
      )}
    </group>
  );
}

export function BikeModel({ onFramed }: Props) {
  return (
    <ErrorBoundary fallback={<ParametricBike onFramed={onFramed} />}>
      <Suspense fallback={<ParametricBike onFramed={onFramed} />}>
        <GLBBike onFramed={onFramed} />
      </Suspense>
    </ErrorBoundary>
  );
}

useGLTF.preload(GLB_URL, false);
