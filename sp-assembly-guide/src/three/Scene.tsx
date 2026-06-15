import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { ContactShadows, Environment, Lightformer, AdaptiveDpr } from "@react-three/drei";
import { ACESFilmicToneMapping } from "three";
import { BikeModel } from "./BikeModel";
import { CameraRig } from "./CameraRig";
import { TorqueLabels } from "./TorqueLabels";
import { useStore } from "../state/store";
import { usePrefersReducedMotion } from "../hooks/useMediaQuery";

export function Scene() {
  const requestFrame = useStore((s) => s.requestFrame);
  const reduced = usePrefersReducedMotion();

  return (
    <Canvas
      shadows
      dpr={[1, 2]} // cap pixel ratio at 2
      gl={{ antialias: true, toneMapping: ACESFilmicToneMapping, powerPreference: "high-performance" }}
      camera={{ position: [2.3, 1.15, 2.5], fov: 40, near: 0.1, far: 100 }}
      // pause the render loop when nothing is animating to save battery/GPU
      frameloop={reduced ? "demand" : "always"}
    >
      <color attach="background" args={["#eef1f4"]} />
      <hemisphereLight intensity={0.55} groundColor="#d8dde3" color="#ffffff" />
      <directionalLight
        position={[3, 5, 2]}
        intensity={1.6}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.0002}
      />
      <directionalLight position={[-3, 2, -2]} intensity={0.5} />

      <Suspense fallback={null}>
        {/* Model space already places the wheel contact patch at y=0
            (axle y=0.34, wheel radius 0.34), so no vertical shift is needed —
            this keeps steps.json camera targets and torque anchors in sync. */}
        <BikeModel onFramed={requestFrame} />
        <ContactShadows
          position={[0, 0.001, 0]}
          opacity={0.45}
          scale={3}
          blur={2.4}
          far={1.2}
          resolution={512}
        />
        <TorqueLabels />
        {/* Procedural studio IBL — no external HDR fetch, fully offline. */}
        <Environment resolution={256} environmentIntensity={0.6}>
          <Lightformer intensity={2} position={[0, 3, 2]} scale={[6, 3, 1]} />
          <Lightformer intensity={1.1} position={[-3, 1, 1]} scale={[3, 4, 1]} />
          <Lightformer intensity={0.8} position={[3, 1, -1]} scale={[3, 4, 1]} />
        </Environment>
      </Suspense>

      <CameraRig />
      <AdaptiveDpr pixelated />
    </Canvas>
  );
}
