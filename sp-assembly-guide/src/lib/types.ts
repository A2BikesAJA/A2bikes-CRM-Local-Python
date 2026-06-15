import type { PartId } from "./parts";

export type Vec3 = [number, number, number];

export interface TorqueSpec {
  fastener: string;
  /** N·m range as a display string, e.g. "5–6". Null = no number to show. */
  nm: string | null;
  /** in-lb range as a display string, e.g. "44–53". Null = no number. */
  inlb: string | null;
  /** Carbon / safety-critical fasteners get the red DO-NOT-EXCEED treatment. */
  critical?: boolean;
  /** Optional note rendered under the value (e.g. "see printed spec"). */
  note?: string;
  /** Optional 3D anchor in model space for the floating callout label. */
  anchor?: Vec3;
}

/** A directional arrow drawn in 3D to show what to do at a spot on the bike. */
export interface Annotation {
  /** Arrowhead tip position in model space (the spot the action happens). */
  at: Vec3;
  /** Direction the action moves (unit-ish); the arrow points along it. */
  dir: Vec3;
  /** Short imperative label, e.g. "Slide in", "Thread in", "Tighten". */
  label: string;
  /** Optional emphasis (reverse-thread, carbon, etc.) → red treatment. */
  emphasis?: boolean;
}

/** Build-specific content shown only when the matching build is selected. */
export type BuildId = "shimano-105-mech" | "shimano-di2" | "sram-axs";

export interface ConditionalBlock {
  builds: BuildId[];
  heading: string;
  body: string[];
}

export interface Step {
  id: string;
  order: number;
  title: string;
  summary: string;
  substeps: string[];
  parts: PartId[];
  focusParts: PartId[];
  hiddenParts: PartId[];
  /** Per-part explode offset in model metres; falls back to INSERTION_AXIS. */
  explode: Partial<Record<PartId, Vec3>>;
  camera: { position: Vec3; target: Vec3; fov: number };
  annotations?: Annotation[];
  torque: TorqueSpec[];
  tools: string[];
  warnings: string[];
  /** First-class hazard callouts rendered with maximum visual weight. */
  hazards?: string[];
  commonMistakes?: string[];
  conditional?: ConditionalBlock[];
  durationMin: number;
  videoTimestamp: number | null;
}

export interface StepsDoc {
  meta: {
    product: string;
    torqueFooter: string;
    support: { email: string; url: string };
  };
  builds: { id: BuildId; label: string }[];
  toolsMaster: string[];
  steps: Step[];
}
