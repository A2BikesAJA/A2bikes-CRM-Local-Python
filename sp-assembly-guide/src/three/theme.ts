// Frame colorways. Oswego Blue is the default; Summit Grey is the alternate.
// (Hex values are brand-approximate placeholders — swap for exact A2 PMS values
//  when confirmed; listed in CONTENT_TODO.md.)
export type ColorwayId = "oswego" | "summit";

export interface Colorway {
  id: ColorwayId;
  label: string;
  frame: string;
  frameAccent: string;
}

export const COLORWAYS: Record<ColorwayId, Colorway> = {
  oswego: {
    id: "oswego",
    label: "Oswego Blue",
    frame: "#1e4d78",
    frameAccent: "#2f6da8",
  },
  summit: {
    id: "summit",
    label: "Summit Grey",
    frame: "#5b6168",
    frameAccent: "#767d85",
  },
};

// Shared component finishes (not colorway-dependent).
export const FINISH = {
  carbon: "#26282c",
  tire: "#1a1a1a",
  rubberAccent: "#3a3a3a",
  metal: "#9aa0a6",
  darkMetal: "#3c3f44",
  rotor: "#b8bdc2",
  saddle: "#141414",
  bartape: "#16181b",
};
