import type { TorqueSpec } from "../lib/types";
import { useStore } from "../state/store";

export function TorqueCard({ spec }: { spec: TorqueSpec }) {
  const unit = useStore((s) => s.unit);
  const value =
    unit === "nm"
      ? spec.nm
        ? `${spec.nm} N·m`
        : null
      : spec.inlb
      ? `${spec.inlb} in-lb`
      : null;

  return (
    <div className={`torque-card ${spec.critical ? "is-critical" : ""}`}>
      <div className="torque-card__row">
        <span className="torque-card__fastener">{spec.fastener}</span>
        <span className="torque-card__value">{value ?? "—"}</span>
      </div>
      {spec.note && <div className="torque-card__note">{spec.note}</div>}
      {spec.critical && value && (
        <span className="torque-card__donotexceed">DO NOT EXCEED</span>
      )}
    </div>
  );
}
