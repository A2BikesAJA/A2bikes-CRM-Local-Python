// Storage abstraction. This app ships as a standalone hosted page where
// localStorage is available and desirable (progress persists across sessions).
// But if it is ever embedded in a sandboxed context where localStorage throws
// or is disabled, we transparently fall back to an in-memory map so the app
// never crashes — progress simply won't survive a reload there.
//
// Force in-memory regardless by setting VITE_DISABLE_PERSISTENCE=true.

const memory = new Map<string, string>();

const persistenceDisabled =
  import.meta.env.VITE_DISABLE_PERSISTENCE === "true";

let available = false;
if (!persistenceDisabled) {
  try {
    const k = "__sp_probe__";
    localStorage.setItem(k, "1");
    localStorage.removeItem(k);
    available = true;
  } catch {
    available = false;
  }
}

export const persistenceMode: "local" | "memory" = available
  ? "local"
  : "memory";

export function getItem(key: string): string | null {
  if (available) {
    try {
      return localStorage.getItem(key);
    } catch {
      /* fall through */
    }
  }
  return memory.has(key) ? (memory.get(key) as string) : null;
}

export function setItem(key: string, value: string) {
  if (available) {
    try {
      localStorage.setItem(key, value);
      return;
    } catch {
      /* fall through */
    }
  }
  memory.set(key, value);
}
