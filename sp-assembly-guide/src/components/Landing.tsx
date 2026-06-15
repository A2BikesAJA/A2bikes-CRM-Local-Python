import { useState } from "react";
import { useStore } from "../state/store";
import { ColorwayToggle } from "./ColorwayToggle";
import { HelpFooter } from "./Footer";
import { persistenceMode } from "../lib/storage";
import type { BuildId } from "../lib/types";

export function Landing() {
  const doc = useStore((s) => s.doc);
  const start = useStore((s) => s.start);
  const savedBuild = useStore((s) => s.build);
  const [build, setBuild] = useState<BuildId | null>(savedBuild);

  return (
    <div className="landing" role="dialog" aria-label="Start assembly">
      <div className="landing__card">
        <span className="eyebrow">{doc.meta.product}</span>
        <h1>Home Assembly Guide</h1>
        <p className="lead">
          Your SP arrives about 90% assembled. This interactive guide walks you
          through the final steps — with the exact torque values, in 3D. Set it
          on a bench or prop your phone by the workstand and follow along.
        </p>

        <div className="field-label">Select your build</div>
        <div className="choice-grid">
          {doc.builds.map((b) => (
            <button
              key={b.id}
              className={`choice ${build === b.id ? "selected" : ""}`}
              onClick={() => setBuild(b.id)}
              aria-pressed={build === b.id}
            >
              {b.label}
              <small>
                {b.id === "shimano-105-mech"
                  ? "Mechanical shifting — cable-actuated."
                  : "Electronic shifting — includes battery check."}
              </small>
            </button>
          ))}
        </div>

        <div className="field-label">Frame color</div>
        <ColorwayToggle />

        <div className="field-label">Tools you'll need</div>
        <ul className="tools-list">
          {doc.toolsMaster.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>

        <button
          className="btn btn--primary"
          disabled={!build}
          onClick={() => build && start(build)}
        >
          {build ? "Start assembly →" : "Select a build to start"}
        </button>

        {persistenceMode === "memory" && (
          <p className="persist-note">
            Note: progress won't be saved across reloads in this embedded view.
          </p>
        )}

        <div style={{ marginTop: 16 }}>
          <HelpFooter />
        </div>
      </div>
    </div>
  );
}
