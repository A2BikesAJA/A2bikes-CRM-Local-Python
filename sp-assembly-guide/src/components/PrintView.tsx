import { useStore } from "../state/store";

// A print-only, text-first rendering of the entire guide, generated from the
// same steps.json. Hidden on screen; shown only when printing (see @media
// print in index.css). Users get a PDF via their browser's "Save as PDF".
export function PrintView() {
  const doc = useStore((s) => s.doc);
  const build = useStore((s) => s.build);
  const buildLabel = doc.builds.find((b) => b.id === build)?.label;

  return (
    <div className="print-doc" aria-hidden="true">
      <header className="print-head">
        <h1>{doc.meta.product} — Home Assembly Guide</h1>
        {buildLabel && <p className="print-build">Build: {buildLabel}</p>}
        <p className="print-tools">
          <strong>Tools:</strong> {doc.toolsMaster.join(" · ")}
        </p>
      </header>

      {doc.steps.map((step, i) => {
        const conds = (step.conditional ?? []).filter(
          (c) => !build || c.builds.includes(build)
        );
        return (
          <section className="print-step" key={step.id}>
            <h2>
              {i + 1}. {step.title}
            </h2>
            <p className="print-summary">{step.summary}</p>

            {step.hazards?.map((h, j) => (
              <p className="print-hazard" key={j}>
                ⚠ {h}
              </p>
            ))}

            <ol className="print-substeps">
              {step.substeps.map((t, j) => (
                <li key={j}>
                  <span className="print-box">☐</span> {t}
                </li>
              ))}
            </ol>

            {conds.map((c, j) => (
              <div className="print-cond" key={j}>
                <strong>{c.heading}</strong>
                <ol>
                  {c.body.map((b, k) => (
                    <li key={k}>{b}</li>
                  ))}
                </ol>
              </div>
            ))}

            {step.torque.length > 0 && (
              <table className="print-torque">
                <thead>
                  <tr>
                    <th>Fastener</th>
                    <th>Torque</th>
                  </tr>
                </thead>
                <tbody>
                  {step.torque.map((t, j) => (
                    <tr key={j} className={t.critical ? "crit" : ""}>
                      <td>
                        {t.fastener}
                        {t.critical ? " (do not exceed)" : ""}
                      </td>
                      <td>
                        {t.nm
                          ? `${t.nm} N·m (${t.inlb} in-lb)`
                          : t.note ?? "see printed spec"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {step.tools.length > 0 && (
              <p className="print-line">
                <strong>Tools:</strong> {step.tools.join(", ")}
              </p>
            )}
            {step.warnings.map((w, j) => (
              <p className="print-line" key={j}>
                ▲ {w}
              </p>
            ))}
            {step.commonMistakes?.length ? (
              <p className="print-line">
                <strong>Avoid:</strong> {step.commonMistakes.join(" ")}
              </p>
            ) : null}
          </section>
        );
      })}

      <footer className="print-foot">
        <p>{doc.meta.torqueFooter}</p>
        <p>
          Support: {doc.meta.support.email} · {doc.meta.support.url}
        </p>
      </footer>
    </div>
  );
}
