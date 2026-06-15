import { trackEvent, type TrackProps } from "./analytics";

// Single client-side capture entry point. Every meaningful action flows through
// here. It always fires a GA4 behavioral event (free, no PII needed), and — if
// a capture endpoint is configured (VITE_CAPTURE_URL, our serverless function)
// — also POSTs the full payload so it can fan out to Shopify / Klaviyo / Sheet.
// With no endpoint set, the app still works fully; it just doesn't phone home.

const ENDPOINT = import.meta.env.VITE_CAPTURE_URL;

export type CaptureType =
  | "guide_start"
  | "registration"
  | "step_view"
  | "step_complete"
  | "step_feedback"
  | "help_request"
  | "completed";

// session id so server-side rows can be grouped without a login
function sessionId(): string {
  const k = "sp-guide:sid";
  try {
    let v = sessionStorage.getItem(k);
    if (!v) {
      v = (crypto.randomUUID?.() ?? String(Date.now() + Math.random()));
      sessionStorage.setItem(k, v);
    }
    return v;
  } catch {
    return "anon";
  }
}

export function capture(type: CaptureType, payload: Record<string, unknown> = {}) {
  // GA4 wants flat scalar props
  const flat: TrackProps = {};
  for (const [k, v] of Object.entries(payload)) {
    if (v == null || typeof v === "object") continue;
    flat[k] = v as string | number | boolean;
  }
  trackEvent(type, flat);

  if (!ENDPOINT) return;
  const body = JSON.stringify({
    type,
    payload,
    sid: sessionId(),
    ts: new Date().toISOString(),
    href: typeof location !== "undefined" ? location.href : "",
  });
  try {
    // keepalive so it still sends if the user navigates away
    fetch(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      keepalive: true,
    }).catch(() => {});
  } catch {
    /* never block the UI on telemetry */
  }
}
