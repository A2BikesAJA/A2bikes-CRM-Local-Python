import { useEffect } from "react";
import { Scene } from "./three/Scene";
import { Landing } from "./components/Landing";
import { StepPanel } from "./components/StepPanel";
import { NavBar } from "./components/NavBar";
import { BottomSheet } from "./components/BottomSheet";
import { UnitToggle } from "./components/UnitToggle";
import { useStore } from "./state/store";
import { useIsDesktop } from "./hooks/useMediaQuery";

export function App() {
  const started = useStore((s) => s.started);
  const next = useStore((s) => s.next);
  const prev = useStore((s) => s.prev);
  const resetView = useStore((s) => s.resetView);
  const replayExplode = useStore((s) => s.replayExplode);
  const goToLanding = useStore((s) => s.goToLanding);
  const isDesktop = useIsDesktop();

  // Keyboard navigation
  useEffect(() => {
    if (!started) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;
      if (e.key === "ArrowRight") next();
      else if (e.key === "ArrowLeft") prev();
      else if (e.key.toLowerCase() === "r") resetView();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [started, next, prev, resetView]);

  const panelContent = (
    <>
      <StepPanel />
      <NavBar />
    </>
  );

  return (
    <div className="app">
      <header className="app__topbar">
        <span className="brand">
          A<sup>2</sup> BIKES — SP
        </span>
        <span className="topbar__spacer" />
        {started && (
          <>
            <UnitToggle />
            <button
              className="icon-btn"
              onClick={goToLanding}
              aria-label="Back to start"
            >
              Restart
            </button>
          </>
        )}
      </header>

      <div className="layout">
        <div className="canvas-wrap">
          <Scene />
          {started && (
            <div className="canvas-tools">
              <button
                className="icon-btn"
                onClick={resetView}
                aria-label="Reset camera to step view"
                title="Reset view (R)"
              >
                ⟳ View
              </button>
              <button
                className="icon-btn"
                onClick={replayExplode}
                aria-label="Replay the assembly animation"
                title="Replay animation"
              >
                ▶ Replay
              </button>
            </div>
          )}
        </div>

        {started &&
          (isDesktop ? (
            <aside className="panel">{panelContent}</aside>
          ) : (
            <BottomSheet>{panelContent}</BottomSheet>
          ))}
      </div>

      {!started && <Landing />}
    </div>
  );
}
