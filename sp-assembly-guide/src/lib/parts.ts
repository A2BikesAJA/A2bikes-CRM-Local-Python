// ─────────────────────────────────────────────────────────────────────────
// PART-NAMING CONTRACT
//
// Every addressable part of the SP — whether drawn by the parametric model
// (Phase 1) or loaded from assets/sp.glb (Phase 2) — MUST be exposed under one
// of these exact IDs. The step engine references parts only by these IDs for
// highlight / ghost / hide / explode operations, so a future KQS CAD export
// drops in with zero code changes as long as its node names match this list.
//
// See ASSET_SWAP.md for the GLB export conventions.
// ─────────────────────────────────────────────────────────────────────────

export const PART_IDS = [
  "frame",
  "fork",
  "front_wheel",
  "rear_wheel",
  "front_rotor",
  "rear_rotor",
  "front_caliper",
  "rear_caliper",
  "seatpost",
  "saddle",
  "seatpost_binder",
  "cockpit_basebar",
  "extensions",
  "stem_topcap",
  "thru_axle_front",
  "thru_axle_rear",
  "pedal_left",
  "pedal_right",
  "crankset",
  "rear_derailleur",
  "chain",
] as const;

export type PartId = (typeof PART_IDS)[number];

export const isPartId = (s: string): s is PartId =>
  (PART_IDS as readonly string[]).includes(s);

// Insertion axis hint per part — the direction a part travels when it explodes
// out of / into its assembled position. Used by the explode controller as a
// fallback when a step does not author an explicit offset vector. Units: metres
// in the model's local space (x = nose-forward, y = up, z = drive-side).
export const INSERTION_AXIS: Record<PartId, [number, number, number]> = {
  frame: [0, 0, 0],
  fork: [0, -0.3, 0],
  front_wheel: [0.35, -0.1, 0],
  rear_wheel: [-0.35, -0.1, 0],
  front_rotor: [0, 0, 0.12],
  rear_rotor: [0, 0, 0.12],
  front_caliper: [0, 0.1, 0.08],
  rear_caliper: [0, 0.1, 0.08],
  seatpost: [0, 0.35, 0],
  saddle: [0, 0.18, 0],
  seatpost_binder: [0, 0.12, 0],
  cockpit_basebar: [0, 0.22, 0],
  extensions: [0.18, 0.1, 0],
  stem_topcap: [0, 0.2, 0],
  thru_axle_front: [0, 0, 0.3],
  thru_axle_rear: [0, 0, 0.3],
  pedal_left: [0, 0, -0.22],
  pedal_right: [0, 0, 0.22],
  crankset: [0, 0, 0.18],
  rear_derailleur: [-0.05, -0.18, 0.05],
  chain: [0, -0.1, 0],
};
