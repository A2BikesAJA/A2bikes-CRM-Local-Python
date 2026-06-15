export type Unit = "nm" | "inlb";

const KEY = "sp-guide:unit";

export function loadUnit(): Unit {
  try {
    const v = localStorage.getItem(KEY);
    return v === "inlb" ? "inlb" : "nm";
  } catch {
    return "nm";
  }
}

export function saveUnit(u: Unit) {
  try {
    localStorage.setItem(KEY, u);
  } catch {
    /* in-memory only (e.g. sandboxed iframe) */
  }
}
