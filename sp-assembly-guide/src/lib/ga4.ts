import { setAnalyticsSink } from "./analytics";

// GA4 is wired but OFF unless a measurement ID is provided at build time via
// VITE_GA4_ID (e.g. `VITE_GA4_ID=G-XXXXXXXXXX npm run build`). With no ID, no
// script loads and no events fire — privacy-safe default. When set, every
// trackEvent() call (step_view, guide_start, unit_toggle, …) forwards to GA4.

type GtagWindow = Window & {
  dataLayer?: unknown[];
  gtag?: (...args: unknown[]) => void;
};

export function initAnalytics() {
  const id = import.meta.env.VITE_GA4_ID;
  if (!id) return;

  const s = document.createElement("script");
  s.async = true;
  s.src = `https://www.googletagmanager.com/gtag/js?id=${id}`;
  document.head.appendChild(s);

  const w = window as GtagWindow;
  w.dataLayer = w.dataLayer || [];
  const gtag = (...args: unknown[]) => {
    w.dataLayer!.push(args);
  };
  w.gtag = gtag;
  gtag("js", new Date());
  gtag("config", id, { anonymize_ip: true });

  setAnalyticsSink((name, props) => gtag("event", name, props ?? {}));
}
