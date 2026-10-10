// Renders source as plain text nodes. React escapes &, < and > for us, so nothing
// in the sample is ever parsed as HTML. No dangerouslySetInnerHTML anywhere.

export default function CodeSample({
  label,
  code,
  note,
}: {
  label: string;
  code: string;
  note?: string;
}) {
  return (
    <div className="codepanel">
      <div className="codepanel__bar">
        <span className="mono">{label}</span>
        {note ? <span>{note}</span> : null}
      </div>
      <pre className="codepanel__body">
        <code>{code}</code>
      </pre>
    </div>
  );
}
