import { useStore } from "../state/store";
import { StepRail } from "./StepRail";
import { HelpFooter } from "./Footer";

export function NavBar() {
  const index = useStore((s) => s.index);
  const steps = useStore((s) => s.steps);
  const next = useStore((s) => s.next);
  const prev = useStore((s) => s.prev);
  const remaining = useStore((s) => s.remainingMinutes());

  const pct = ((index + 1) / steps.length) * 100;

  return (
    <div className="panel__nav">
      <StepRail />
      <div className="progress">
        <span>
          Step {index + 1} of {steps.length}
        </span>
        <span>~{remaining} min remaining</span>
      </div>
      <div
        className="progress__bar"
        role="progressbar"
        aria-valuenow={index + 1}
        aria-valuemin={1}
        aria-valuemax={steps.length}
      >
        <div className="progress__fill" style={{ width: `${pct}%` }} />
      </div>
      <div className="nav-buttons">
        <button className="btn" onClick={prev} disabled={index <= 0}>
          ← Back
        </button>
        <button
          className="btn btn--primary"
          onClick={next}
          disabled={index >= steps.length - 1}
        >
          Next →
        </button>
      </div>
      <HelpFooter />
    </div>
  );
}
