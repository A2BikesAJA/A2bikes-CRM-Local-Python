import { Html } from "@react-three/drei";
import { useStore } from "../state/store";

/** Floating 3D torque callouts anchored at each fastener for the active step. */
export function TorqueLabels() {
  const step = useStore((s) => s.currentStep());
  const unit = useStore((s) => s.unit);
  if (!step) return null;

  return (
    <>
      {step.torque
        .filter((t) => t.anchor)
        .map((t, i) => {
          const value =
            unit === "nm"
              ? t.nm
                ? `${t.nm} N·m`
                : null
              : t.inlb
              ? `${t.inlb} in-lb`
              : null;
          return (
            <Html
              key={i}
              position={t.anchor!}
              center
              distanceFactor={1.6}
              occlude={false}
              zIndexRange={[20, 0]}
              style={{ pointerEvents: "none" }}
            >
              <div className={`torque-pin ${t.critical ? "is-critical" : ""}`}>
                <span className="torque-pin__fastener">{t.fastener}</span>
                <span className="torque-pin__value">
                  {value ?? t.note ?? "See printed spec"}
                </span>
                {t.critical && value && (
                  <span className="torque-pin__warn">DO NOT EXCEED</span>
                )}
              </div>
            </Html>
          );
        })}
    </>
  );
}
