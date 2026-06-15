import { useState } from "react";
import { useStore, substepKey } from "../state/store";
import { TorqueCard } from "./TorqueCard";
import { UnitToggle } from "./UnitToggle";
import { capture } from "../lib/capture";

export function StepPanel() {
  const step = useStore((s) => s.currentStep());
  const build = useStore((s) => s.build);
  const done = useStore((s) => s.done);
  const toggle = useStore((s) => s.toggleSubstep);
  const torqueFooter = useStore((s) => s.doc.meta.torqueFooter);
  const index = useStore((s) => s.index);
  const total = useStore((s) => s.steps.length);
  const [feedback, setFeedback] = useState<Record<string, "up" | "down">>({});

  if (!step) return null;

  const sentFeedback = feedback[step.id];
  const isLast = index === total - 1;

  const conditional = (step.conditional ?? []).filter(
    (c) => build && c.builds.includes(build)
  );

  return (
    <div className="panel__scroll" aria-live="polite">
      <span className="eyebrow">
        Step {index + 1} of {total}
      </span>
      <h2 className="step-title">{step.title}</h2>
      <p className="step-summary">{step.summary}</p>

      {/* Hazards — highest visual priority */}
      {step.hazards?.map((h, i) => (
        <div className="hazard" key={i} role="alert">
          <span className="hazard__icon" aria-hidden>
            ⚠
          </span>
          <span>{h}</span>
        </div>
      ))}

      {/* Substeps as a checklist */}
      <div className="section-h">Steps</div>
      {step.substeps.map((text, i) => {
        const key = substepKey(step.id, i);
        const checked = !!done[key];
        return (
          <label key={i} className={`substep ${checked ? "done" : ""}`}>
            <input
              type="checkbox"
              checked={checked}
              onChange={() => toggle(step.id, i)}
              aria-label={`Mark complete: ${text}`}
            />
            <span>{text}</span>
          </label>
        );
      })}

      {/* Conditional build content */}
      {conditional.map((c, i) => (
        <div className="build-block" key={i}>
          <h4>{c.heading}</h4>
          <ol>
            {c.body.map((b, j) => (
              <li key={j}>{b}</li>
            ))}
          </ol>
        </div>
      ))}

      {/* Torque */}
      {step.torque.length > 0 && (
        <>
          <div
            className="section-h"
            style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
          >
            <span>Torque</span>
            <UnitToggle />
          </div>
          {step.torque.map((t, i) => (
            <TorqueCard key={i} spec={t} />
          ))}
          <p className="torque-footer">{torqueFooter}</p>
        </>
      )}

      {/* Tools */}
      {step.tools.length > 0 && (
        <>
          <div className="section-h">Tools for this step</div>
          <div className="tools-strip">
            {step.tools.map((t) => (
              <span className="tool-chip" key={t}>
                {t}
              </span>
            ))}
          </div>
        </>
      )}

      {/* Warnings */}
      {step.warnings.map((w, i) => (
        <div className="warning" key={i}>
          {w}
        </div>
      ))}

      {/* Common mistakes */}
      {step.commonMistakes && step.commonMistakes.length > 0 && (
        <details className="disclose">
          <summary>Common mistakes</summary>
          <ul>
            {step.commonMistakes.map((m, i) => (
              <li key={i}>{m}</li>
            ))}
          </ul>
        </details>
      )}

      {/* Per-step feedback */}
      <div className="feedback">
        {sentFeedback ? (
          <span className="feedback__thanks">Thanks for the feedback ✓</span>
        ) : (
          <>
            <span className="feedback__q">Was this step clear?</span>
            <button
              className="feedback__btn"
              aria-label="Yes, this step was clear"
              onClick={() => {
                setFeedback((f) => ({ ...f, [step.id]: "up" }));
                capture("step_feedback", { step: step.id, helpful: true });
              }}
            >
              👍
            </button>
            <button
              className="feedback__btn"
              aria-label="No, this step was not clear"
              onClick={() => {
                setFeedback((f) => ({ ...f, [step.id]: "down" }));
                capture("step_feedback", { step: step.id, helpful: false });
              }}
            >
              👎
            </button>
          </>
        )}
      </div>

      {isLast && (
        <button
          className="btn btn--primary finish-btn"
          onClick={() => capture("completed", { build })}
        >
          ✓ Mark assembly complete
        </button>
      )}
    </div>
  );
}
