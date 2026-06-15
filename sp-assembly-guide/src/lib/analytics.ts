// Stubbed event bus. v1 ships no analytics; this indirection lets GA4 (or any
// provider) be wired later by implementing `sink` without touching call sites.
export type TrackProps = Record<string, string | number | boolean | null>;

type Sink = (name: string, props?: TrackProps) => void;

let sink: Sink | null = null;

/** Wire a real analytics provider here later (e.g. window.gtag). */
export function setAnalyticsSink(fn: Sink) {
  sink = fn;
}

export function trackEvent(name: string, props: TrackProps = {}) {
  if (sink) {
    sink(name, props);
  } else if (import.meta.env.DEV) {
    // Visible only in development so authors can confirm events fire.
    // eslint-disable-next-line no-console
    console.debug("[trackEvent]", name, props);
  }
}
