import { useMemo } from "react";
import { DoubleSide } from "three";
import { Part } from "./Part";
import { makeAeroTube } from "./geometry";
import { COLORWAYS, FINISH } from "./theme";
import { useStore } from "../state/store";
import type { PartId } from "../lib/parts";

// ── Frame joint coordinates (model metres; x = nose-forward, y = up, z = drive)
const BB: [number, number, number] = [0, 0.27, 0];
const REAR_AXLE: [number, number, number] = [-0.41, 0.34, 0];
const FRONT_AXLE: [number, number, number] = [0.59, 0.34, 0];
const HT_TOP: [number, number, number] = [0.5, 0.62, 0];
const HT_BOT: [number, number, number] = [0.46, 0.42, 0];
const ST_TOP: [number, number, number] = [-0.06, 0.6, 0];
const WHEEL_R = 0.34;

interface Props {
  onFramed?: (id: PartId) => void;
}

export function ParametricBike({ onFramed }: Props) {
  const colorway = useStore((s) => s.colorway);
  const c = COLORWAYS[colorway];

  // Aero frame tubes (built once; recoloured via material props).
  const tubes = useMemo(
    () => ({
      down: makeAeroTube(BB, HT_BOT, 0.085, 0.04),
      top: makeAeroTube(ST_TOP, HT_TOP, 0.07, 0.032),
      seat: makeAeroTube(BB, ST_TOP, 0.075, 0.034),
      head: makeAeroTube(HT_BOT, HT_TOP, 0.07, 0.05),
      chainstayL: makeAeroTube([0, 0.27, 0.045], [-0.41, 0.34, 0.06], 0.05, 0.022),
      chainstayR: makeAeroTube([0, 0.27, -0.045], [-0.41, 0.34, -0.06], 0.05, 0.022),
      seatstayL: makeAeroTube(ST_TOP, [-0.41, 0.34, 0.06], 0.04, 0.02),
      seatstayR: makeAeroTube(ST_TOP, [-0.41, 0.34, -0.06], 0.04, 0.02),
    }),
    []
  );

  const forkTubes = useMemo(
    () => ({
      legL: makeAeroTube([0.47, 0.43, 0.05], [0.59, 0.34, 0.06], 0.05, 0.022),
      legR: makeAeroTube([0.47, 0.43, -0.05], [0.59, 0.34, -0.06], 0.05, 0.022),
      crown: makeAeroTube([0.47, 0.43, 0], [0.49, 0.5, 0], 0.06, 0.05),
    }),
    []
  );

  const seatpostGeo = useMemo(() => makeAeroTube(ST_TOP, [-0.1, 0.82, 0], 0.06, 0.026), []);

  const frameMat = { color: c.frame, roughness: 0.45, metalness: 0.1 };
  const accentMat = { color: c.frameAccent, roughness: 0.4, metalness: 0.15 };

  return (
    <group>
      {/* ── FRAME ─────────────────────────────────────────────── */}
      <Part id="frame" onFramed={onFramed}>
        {Object.entries(tubes).map(([k, geo]) => (
          <mesh key={k} geometry={geo} castShadow receiveShadow>
            <meshStandardMaterial {...frameMat} side={DoubleSide} />
          </mesh>
        ))}
        {/* bottom bracket shell */}
        <mesh position={BB} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.05, 0.05, 0.09, 24]} />
          <meshStandardMaterial {...accentMat} />
        </mesh>
      </Part>

      {/* ── FORK ──────────────────────────────────────────────── */}
      <Part id="fork" onFramed={onFramed}>
        {Object.entries(forkTubes).map(([k, geo]) => (
          <mesh key={k} geometry={geo} castShadow>
            <meshStandardMaterial {...frameMat} side={DoubleSide} />
          </mesh>
        ))}
      </Part>

      {/* ── WHEELS ────────────────────────────────────────────── */}
      <Part id="rear_wheel" onFramed={onFramed}>
        <DiscWheel center={REAR_AXLE} />
      </Part>
      <Part id="front_wheel" onFramed={onFramed}>
        <SpokedWheel center={FRONT_AXLE} />
      </Part>

      {/* ── ROTORS ────────────────────────────────────────────── */}
      <Part id="front_rotor" onFramed={onFramed}>
        <Rotor center={FRONT_AXLE} />
      </Part>
      <Part id="rear_rotor" onFramed={onFramed}>
        <Rotor center={REAR_AXLE} />
      </Part>

      {/* ── CALIPERS ──────────────────────────────────────────── */}
      <Part id="front_caliper" onFramed={onFramed}>
        <mesh position={[0.55, 0.5, 0.04]} castShadow>
          <boxGeometry args={[0.04, 0.07, 0.03]} />
          <meshStandardMaterial color={FINISH.darkMetal} metalness={0.6} roughness={0.35} />
        </mesh>
      </Part>
      <Part id="rear_caliper" onFramed={onFramed}>
        <mesh position={[-0.34, 0.46, 0.04]} castShadow>
          <boxGeometry args={[0.04, 0.07, 0.03]} />
          <meshStandardMaterial color={FINISH.darkMetal} metalness={0.6} roughness={0.35} />
        </mesh>
      </Part>

      {/* ── SEATPOST + SADDLE + BINDER ────────────────────────── */}
      <Part id="seatpost" onFramed={onFramed}>
        <mesh geometry={seatpostGeo} castShadow>
          <meshStandardMaterial color={FINISH.carbon} roughness={0.4} side={DoubleSide} />
        </mesh>
      </Part>
      <Part id="seatpost_binder" onFramed={onFramed}>
        <mesh position={[-0.07, 0.585, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.04, 0.04, 0.03, 20]} />
          <meshStandardMaterial color={FINISH.darkMetal} metalness={0.5} roughness={0.4} />
        </mesh>
      </Part>
      <Part id="saddle" onFramed={onFramed}>
        <group position={[-0.1, 0.84, 0]}>
          <mesh castShadow>
            <boxGeometry args={[0.26, 0.03, 0.13]} />
            <meshStandardMaterial color={FINISH.saddle} roughness={0.7} />
          </mesh>
          <mesh position={[0.06, 0.005, 0]} castShadow>
            <boxGeometry args={[0.14, 0.022, 0.05]} />
            <meshStandardMaterial color={FINISH.saddle} roughness={0.7} />
          </mesh>
        </group>
      </Part>

      {/* ── COCKPIT ───────────────────────────────────────────── */}
      <Part id="stem_topcap" onFramed={onFramed}>
        <group>
          <mesh position={[0.5, 0.66, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[0.022, 0.022, 0.12, 16]} />
            <meshStandardMaterial color={FINISH.darkMetal} metalness={0.6} roughness={0.35} />
          </mesh>
          <mesh position={[0.5, 0.64, 0]} castShadow>
            <cylinderGeometry args={[0.026, 0.026, 0.02, 16]} />
            <meshStandardMaterial color={FINISH.metal} metalness={0.7} roughness={0.3} />
          </mesh>
        </group>
      </Part>
      <Part id="cockpit_basebar" onFramed={onFramed}>
        <group>
          {/* base bar spanning laterally */}
          <mesh position={[0.55, 0.66, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
            <cylinderGeometry args={[0.018, 0.018, 0.42, 16]} />
            <meshStandardMaterial color={FINISH.carbon} roughness={0.4} />
          </mesh>
          {/* pursuit drops */}
          {[0.21, -0.21].map((z) => (
            <mesh key={z} position={[0.6, 0.62, z]} rotation={[0, 0, Math.PI / 2.6]} castShadow>
              <cylinderGeometry args={[0.016, 0.016, 0.12, 12]} />
              <meshStandardMaterial color={FINISH.bartape} roughness={0.6} />
            </mesh>
          ))}
        </group>
      </Part>
      <Part id="extensions" onFramed={onFramed}>
        <group>
          {[0.06, -0.06].map((z) => (
            <mesh key={z} position={[0.74, 0.7, z]} rotation={[0, 0, Math.PI / 2]} castShadow>
              <cylinderGeometry args={[0.013, 0.013, 0.34, 12]} />
              <meshStandardMaterial color={FINISH.carbon} roughness={0.4} />
            </mesh>
          ))}
          {/* arm pads */}
          {[0.06, -0.06].map((z) => (
            <mesh key={`p${z}`} position={[0.6, 0.71, z]} castShadow>
              <boxGeometry args={[0.09, 0.02, 0.07]} />
              <meshStandardMaterial color={FINISH.saddle} roughness={0.8} />
            </mesh>
          ))}
        </group>
      </Part>

      {/* ── DRIVETRAIN ────────────────────────────────────────── */}
      <Part id="crankset" onFramed={onFramed}>
        <group>
          {/* chainring */}
          <mesh position={[0, 0.27, 0.06]} rotation={[Math.PI / 2, 0, 0]} castShadow>
            <cylinderGeometry args={[0.11, 0.11, 0.004, 40]} />
            <meshStandardMaterial color={FINISH.metal} metalness={0.7} roughness={0.3} side={DoubleSide} />
          </mesh>
          {/* drive-side crank arm */}
          <mesh position={[0.02, 0.18, 0.075]} rotation={[0, 0, -0.5]} castShadow>
            <boxGeometry args={[0.03, 0.18, 0.015]} />
            <meshStandardMaterial color={FINISH.darkMetal} metalness={0.6} roughness={0.35} />
          </mesh>
          {/* non-drive crank arm */}
          <mesh position={[-0.02, 0.36, -0.075]} rotation={[0, 0, -0.5]} castShadow>
            <boxGeometry args={[0.03, 0.18, 0.015]} />
            <meshStandardMaterial color={FINISH.darkMetal} metalness={0.6} roughness={0.35} />
          </mesh>
        </group>
      </Part>
      <Part id="chain" onFramed={onFramed}>
        {/* schematic chain loop: chainring (0,0.27) to rear cog (-0.41,0.34) */}
        <group position={[0, 0, 0.06]}>
          <mesh position={[-0.205, 0.31, 0]} rotation={[0, 0, 0.07]} castShadow>
            <boxGeometry args={[0.41, 0.012, 0.01]} />
            <meshStandardMaterial color={FINISH.metal} metalness={0.6} roughness={0.4} />
          </mesh>
          <mesh position={[-0.205, 0.25, 0]} rotation={[0, 0, 0.02]} castShadow>
            <boxGeometry args={[0.41, 0.012, 0.01]} />
            <meshStandardMaterial color={FINISH.metal} metalness={0.6} roughness={0.4} />
          </mesh>
        </group>
      </Part>
      <Part id="rear_derailleur" onFramed={onFramed}>
        <group position={[-0.4, 0.24, 0.06]}>
          <mesh castShadow>
            <boxGeometry args={[0.05, 0.09, 0.03]} />
            <meshStandardMaterial color={FINISH.darkMetal} metalness={0.5} roughness={0.4} />
          </mesh>
          {[0.02, -0.05].map((y) => (
            <mesh key={y} position={[0.01, y - 0.06, 0.01]} rotation={[Math.PI / 2, 0, 0]} castShadow>
              <cylinderGeometry args={[0.02, 0.02, 0.008, 20]} />
              <meshStandardMaterial color={FINISH.carbon} roughness={0.5} />
            </mesh>
          ))}
        </group>
      </Part>

      {/* ── THRU-AXLES ────────────────────────────────────────── */}
      <Part id="thru_axle_front" onFramed={onFramed}>
        <mesh position={FRONT_AXLE} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.012, 0.012, 0.15, 16]} />
          <meshStandardMaterial color={FINISH.metal} metalness={0.8} roughness={0.25} />
        </mesh>
      </Part>
      <Part id="thru_axle_rear" onFramed={onFramed}>
        <mesh position={REAR_AXLE} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.012, 0.012, 0.15, 16]} />
          <meshStandardMaterial color={FINISH.metal} metalness={0.8} roughness={0.25} />
        </mesh>
      </Part>

      {/* ── PEDALS ────────────────────────────────────────────── */}
      <Part id="pedal_right" onFramed={onFramed}>
        <PedalMesh z={0.14} />
      </Part>
      <Part id="pedal_left" onFramed={onFramed}>
        <PedalMesh z={-0.14} />
      </Part>

      {/* ground contact shadow plane handled by Scene */}
    </group>
  );

  function SpokedWheel({ center }: { center: [number, number, number] }) {
    const spokes = Array.from({ length: 16 }, (_, i) => (i / 16) * Math.PI * 2);
    return (
      <group position={center} rotation={[0, 0, 0]}>
        {/* deep-section rim */}
        <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[WHEEL_R - 0.02, WHEEL_R - 0.02, 0.05, 48, 1, true]} />
          <meshStandardMaterial color={FINISH.carbon} roughness={0.35} metalness={0.2} side={DoubleSide} />
        </mesh>
        {/* tire */}
        <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
          <torusGeometry args={[WHEEL_R, 0.022, 16, 48]} />
          <meshStandardMaterial color={FINISH.tire} roughness={0.85} />
        </mesh>
        {/* hub */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.03, 0.03, 0.1, 20]} />
          <meshStandardMaterial color={FINISH.darkMetal} metalness={0.7} roughness={0.3} />
        </mesh>
        {spokes.map((a, i) => (
          <mesh key={i} rotation={[0, 0, a]} castShadow>
            <boxGeometry args={[0.004, (WHEEL_R - 0.04) * 2, 0.004]} />
            <meshStandardMaterial color={FINISH.metal} metalness={0.6} roughness={0.4} />
          </mesh>
        ))}
      </group>
    );
  }

  function DiscWheel({ center }: { center: [number, number, number] }) {
    return (
      <group position={center}>
        <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[WHEEL_R - 0.02, WHEEL_R - 0.02, 0.03, 48]} />
          <meshStandardMaterial color={FINISH.carbon} roughness={0.3} metalness={0.25} />
        </mesh>
        <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
          <torusGeometry args={[WHEEL_R, 0.022, 16, 48]} />
          <meshStandardMaterial color={FINISH.tire} roughness={0.85} />
        </mesh>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.03, 0.03, 0.1, 20]} />
          <meshStandardMaterial color={FINISH.darkMetal} metalness={0.7} roughness={0.3} />
        </mesh>
      </group>
    );
  }

  function Rotor({ center }: { center: [number, number, number] }) {
    return (
      <mesh position={[center[0], center[1], 0.045]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.085, 0.085, 0.003, 40]} />
        <meshStandardMaterial color={FINISH.rotor} metalness={0.85} roughness={0.25} side={DoubleSide} />
      </mesh>
    );
  }

  function PedalMesh({ z }: { z: number }) {
    const dir = z > 0 ? 1 : -1;
    return (
      <group>
        {/* spindle */}
        <mesh position={[0, 0.27, z * 0.6]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.008, 0.008, 0.12, 12]} />
          <meshStandardMaterial color={FINISH.metal} metalness={0.8} roughness={0.25} />
        </mesh>
        {/* pedal body */}
        <mesh position={[0.12 * dir, 0.18, z + 0.04 * dir]} castShadow>
          <boxGeometry args={[0.07, 0.02, 0.06]} />
          <meshStandardMaterial color={FINISH.darkMetal} metalness={0.5} roughness={0.4} />
        </mesh>
      </group>
    );
  }
}
