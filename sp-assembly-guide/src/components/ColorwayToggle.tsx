import { useStore } from "../state/store";
import { COLORWAYS } from "../three/theme";

export function ColorwayToggle() {
  const colorway = useStore((s) => s.colorway);
  const setColorway = useStore((s) => s.setColorway);
  return (
    <div className="seg" role="group" aria-label="Frame color">
      {Object.values(COLORWAYS).map((cw) => (
        <button
          key={cw.id}
          className={colorway === cw.id ? "active" : ""}
          aria-pressed={colorway === cw.id}
          onClick={() => setColorway(cw.id)}
          title={cw.label}
        >
          {cw.label}
        </button>
      ))}
    </div>
  );
}
