import { useEffect, useRef } from "react";
import { useThree, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { Vector3, PerspectiveCamera, Box3 } from "three";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import { useStore } from "../state/store";
import { usePrefersReducedMotion } from "../hooks/useMediaQuery";

const EASE = (t: number) => 1 - Math.pow(1 - t, 3);
const DURATION = 1.2; // seconds

export function CameraRig() {
  const controls = useRef<OrbitControlsImpl>(null);
  const { camera, scene } = useThree();
  const reduced = usePrefersReducedMotion();

  const drive = useRef({
    active: false,
    t: 0,
    fromPos: new Vector3(),
    toPos: new Vector3(),
    fromTgt: new Vector3(),
    toTgt: new Vector3(),
    fromFov: 45,
    toFov: 45,
  });

  const startDrive = (pos: Vector3, tgt: Vector3, fov: number) => {
    const d = drive.current;
    d.fromPos.copy(camera.position);
    d.fromTgt.copy(controls.current ? controls.current.target : new Vector3());
    d.fromFov = (camera as PerspectiveCamera).fov;
    d.toPos.copy(pos);
    d.toTgt.copy(tgt);
    d.toFov = fov;
    d.t = reduced ? 1 : 0;
    d.active = true;
  };

  const driveToStep = () => {
    const step = useStore.getState().currentStep();
    if (!step) return;
    startDrive(
      new Vector3(...step.camera.position),
      new Vector3(...step.camera.target),
      step.camera.fov
    );
  };

  // initial + on step change + on reset-view request
  useEffect(driveToStep, []); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    const unsub = useStore.subscribe((s, prev) => {
      if (s.index !== prev.index || s.resetViewNonce !== prev.resetViewNonce) {
        driveToStep();
      }
      if (s.frameNonce !== prev.frameNonce && s.framePartId) {
        const node = scene.getObjectByName(s.framePartId);
        if (node) {
          const box = new Box3().setFromObject(node);
          const center = box.getCenter(new Vector3());
          const size = box.getSize(new Vector3()).length() || 0.4;
          const dist = Math.max(0.9, size * 2.4);
          const dir = new Vector3(0.7, 0.45, 1).normalize();
          startDrive(
            center.clone().addScaledVector(dir, dist),
            center,
            42
          );
        }
      }
    });
    return unsub;
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useFrame((_, delta) => {
    const d = drive.current;
    const c = controls.current;
    if (!c) return;
    if (d.active && !useStore.getState().userControlling) {
      d.t = Math.min(1, d.t + delta / DURATION);
      const e = EASE(d.t);
      camera.position.lerpVectors(d.fromPos, d.toPos, e);
      c.target.lerpVectors(d.fromTgt, d.toTgt, e);
      const cam = camera as PerspectiveCamera;
      cam.fov = d.fromFov + (d.toFov - d.fromFov) * e;
      cam.updateProjectionMatrix();
      if (d.t >= 1) d.active = false;
    }
    c.update();
  });

  return (
    <OrbitControls
      ref={controls}
      makeDefault
      enableDamping
      dampingFactor={0.08}
      minDistance={0.6}
      maxDistance={4.5}
      // keep the bike in view; limit how low the camera can go under the floor
      maxPolarAngle={Math.PI * 0.92}
      onStart={() => useStore.getState().setUserControlling(true)}
    />
  );
}
