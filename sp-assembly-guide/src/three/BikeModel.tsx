import { Suspense, useMemo } from "react";
import { useGLTF } from "@react-three/drei";
import { Object3D, Mesh } from "three";
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

  // Bake each matched mesh's WORLD transform into its local transform before we
  // reparent it with <primitive> (which uses .add() and would otherwise drop
  // the ancestor transforms the exporter put on the scene root, sending parts
  // off-camera). After baking, each mesh is world-correct under an origin Part.
  const groups = useMemo(() => {
    const out: Record<string, Object3D[]> = {};
    scene.updateMatrixWorld(true);
    scene.traverse((o) => {
      const m = o as Mesh;
      if (!m.isMesh || !o.name) return;
      const id = o.name.split("__")[0];
      if (!(PART_IDS as readonly string[]).includes(id)) return;
      if (!o.userData.__baked) {
        o.userData.__baked = true;
        o.matrix.copy(o.matrixWorld);
        o.matrix.decompose(o.position, o.quaternion, o.scale);
        o.matrixAutoUpdate = true;
      }
      (out[id] ||= []).push(o);
    });
    return out;
  }, [scene]);

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
