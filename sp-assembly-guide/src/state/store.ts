import { create } from "zustand";
import stepsDoc from "../content/steps.json";
import type { StepsDoc, Step, BuildId } from "../lib/types";
import type { PartId } from "../lib/parts";
import type { Unit } from "../lib/units";
import { loadUnit, saveUnit } from "../lib/units";
import { getItem, setItem } from "../lib/storage";
import { trackEvent } from "../lib/analytics";
import { capture } from "../lib/capture";
import type { ColorwayId } from "../three/theme";

export interface Registration {
  name: string;
  email: string;
  order: string;
  serial: string;
}
const REG_KEY = "sp-guide:registration";
function loadReg(): Registration {
  try {
    return { name: "", email: "", order: "", serial: "", ...JSON.parse(getItem(REG_KEY) || "{}") };
  } catch {
    return { name: "", email: "", order: "", serial: "" };
  }
}

const doc = stepsDoc as unknown as StepsDoc;

const DONE_KEY = "sp-guide:done-substeps";
const BUILD_KEY = "sp-guide:build";
const COLOR_KEY = "sp-guide:colorway";

function loadColor(): ColorwayId {
  return getItem(COLOR_KEY) === "summit" ? "summit" : "oswego";
}

function loadDone(): Record<string, boolean> {
  try {
    return JSON.parse(getItem(DONE_KEY) || "{}");
  } catch {
    return {};
  }
}

function loadBuild(): BuildId | null {
  const v = getItem(BUILD_KEY);
  return v === "shimano-105-mech" || v === "shimano-di2" || v === "sram-axs"
    ? v
    : null;
}

/** Stable key for a substep checkbox. */
export const substepKey = (stepId: string, idx: number) => `${stepId}:${idx}`;

interface GuideState {
  doc: StepsDoc;
  steps: Step[];
  /** -1 = landing screen; 0..n-1 = a step. */
  index: number;
  started: boolean;
  build: BuildId | null;
  colorway: ColorwayId;
  unit: Unit;
  registration: Registration;
  done: Record<string, boolean>;
  /** Set when the user manually orbits, so the camera rig stops auto-driving. */
  userControlling: boolean;
  /** Bumped to request a one-shot camera reset to the authored viewpoint. */
  resetViewNonce: number;
  /** Bumped to request a replay of the current step's explode animation. */
  replayNonce: number;
  /** Double-click-to-frame request: which part, and a nonce to trigger it. */
  framePartId: PartId | null;
  frameNonce: number;

  start: (build: BuildId) => void;
  goToLanding: () => void;
  next: () => void;
  prev: () => void;
  goTo: (index: number) => void;
  setUnit: (u: Unit) => void;
  setColorway: (c: ColorwayId) => void;
  setRegistration: (patch: Partial<Registration>) => void;
  toggleSubstep: (stepId: string, idx: number) => void;
  setUserControlling: (v: boolean) => void;
  resetView: () => void;
  replayExplode: () => void;
  requestFrame: (id: PartId) => void;

  currentStep: () => Step | null;
  remainingMinutes: () => number;
  stepProgress: (stepId: string) => { done: number; total: number };
}

export const useStore = create<GuideState>((set, get) => ({
  doc,
  steps: doc.steps,
  index: -1,
  started: false,
  build: loadBuild(),
  colorway: loadColor(),
  unit: loadUnit(),
  registration: loadReg(),
  done: loadDone(),
  userControlling: false,
  resetViewNonce: 0,
  replayNonce: 0,
  framePartId: null,
  frameNonce: 0,

  start: (build) => {
    setItem(BUILD_KEY, build);
    const reg = get().registration;
    capture("guide_start", { build });
    if (reg.email) {
      capture("registration", { build, ...reg });
    }
    set({ build, started: true, index: 0, userControlling: false });
  },

  goToLanding: () => set({ started: false, index: -1 }),

  next: () => {
    const { index, steps } = get();
    if (index < steps.length - 1) {
      const ni = index + 1;
      capture("step_view", { step: steps[ni].id, index: ni });
      set({ index: ni, userControlling: false });
    }
  },

  prev: () => {
    const { index, steps } = get();
    if (index > 0) {
      const ni = index - 1;
      capture("step_view", { step: steps[ni].id, index: ni });
      set({ index: ni, userControlling: false });
    }
  },

  goTo: (index) => {
    const { steps } = get();
    if (index >= 0 && index < steps.length) {
      capture("step_view", { step: steps[index].id, index });
      set({ index, userControlling: false });
    }
  },

  setUnit: (u) => {
    saveUnit(u);
    trackEvent("unit_toggle", { unit: u });
    set({ unit: u });
  },

  setColorway: (c) => {
    setItem(COLOR_KEY, c);
    trackEvent("colorway", { colorway: c });
    set({ colorway: c });
  },

  setRegistration: (patch) => {
    const registration = { ...get().registration, ...patch };
    setItem(REG_KEY, JSON.stringify(registration));
    set({ registration });
  },

  toggleSubstep: (stepId, idx) => {
    const key = substepKey(stepId, idx);
    const done = { ...get().done, [key]: !get().done[key] };
    setItem(DONE_KEY, JSON.stringify(done));
    set({ done });
  },

  setUserControlling: (v) => set({ userControlling: v }),
  resetView: () =>
    set((s) => ({ resetViewNonce: s.resetViewNonce + 1, userControlling: false })),
  replayExplode: () => set((s) => ({ replayNonce: s.replayNonce + 1 })),
  requestFrame: (id) =>
    set((s) => ({ framePartId: id, frameNonce: s.frameNonce + 1 })),

  currentStep: () => {
    const { index, steps } = get();
    return index >= 0 && index < steps.length ? steps[index] : null;
  },

  remainingMinutes: () => {
    const { index, steps } = get();
    if (index < 0) return steps.reduce((a, s) => a + s.durationMin, 0);
    return steps.slice(index).reduce((a, s) => a + s.durationMin, 0);
  },

  stepProgress: (stepId) => {
    const step = get().steps.find((s) => s.id === stepId);
    if (!step) return { done: 0, total: 0 };
    const total = step.substeps.length;
    let done = 0;
    for (let i = 0; i < total; i++) {
      if (get().done[substepKey(stepId, i)]) done++;
    }
    return { done, total };
  },
}));
