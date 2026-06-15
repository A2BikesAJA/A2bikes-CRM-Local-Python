import { useStore } from "../state/store";
import { capture } from "../lib/capture";

export function HelpFooter() {
  const support = useStore((s) => s.doc.meta.support);
  const step = useStore((s) => s.currentStep());
  const onHelp = () => capture("help_request", { step: step?.id ?? "landing" });
  return (
    <p className="help-footer">
      Stuck?{" "}
      <a href={`mailto:${support.email}`} onClick={onHelp}>
        {support.email}
      </a>
      {" · "}
      <a href={support.url} target="_blank" rel="noreferrer" onClick={onHelp}>
        Contact A2
      </a>
    </p>
  );
}
