import { useStore } from "../state/store";

export function UnitToggle() {
  const unit = useStore((s) => s.unit);
  const setUnit = useStore((s) => s.setUnit);
  return (
    <div className="seg" role="group" aria-label="Torque units">
      <button
        className={unit === "nm" ? "active" : ""}
        aria-pressed={unit === "nm"}
        onClick={() => setUnit("nm")}
      >
        N·m
      </button>
      <button
        className={unit === "inlb" ? "active" : ""}
        aria-pressed={unit === "inlb"}
        onClick={() => setUnit("inlb")}
      >
        in-lb
      </button>
    </div>
  );
}
