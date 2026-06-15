import { useStore } from "../state/store";

export function HelpFooter() {
  const support = useStore((s) => s.doc.meta.support);
  return (
    <p className="help-footer">
      Stuck?{" "}
      <a href={`mailto:${support.email}`}>{support.email}</a>
      {" · "}
      <a href={support.url} target="_blank" rel="noreferrer">
        Contact A2
      </a>
    </p>
  );
}
