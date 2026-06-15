import { useStore } from "../state/store";

export function StepRail() {
  const steps = useStore((s) => s.steps);
  const index = useStore((s) => s.index);
  const goTo = useStore((s) => s.goTo);
  const stepProgress = useStore((s) => s.stepProgress);

  return (
    <div className="rail" role="tablist" aria-label="Assembly steps">
      {steps.map((s, i) => {
        const { done, total } = stepProgress(s.id);
        const complete = total > 0 && done === total;
        return (
          <button
            key={s.id}
            role="tab"
            aria-selected={i === index}
            aria-label={`Step ${i + 1}: ${s.title}`}
            className={`rail__item ${i === index ? "active" : ""} ${
              complete ? "complete" : ""
            }`}
            onClick={() => goTo(i)}
          >
            {i + 1}
          </button>
        );
      })}
    </div>
  );
}
