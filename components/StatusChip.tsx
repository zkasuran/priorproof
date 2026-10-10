// A status pill. Colour is always reinforced by a glyph and a word, so the state
// is never carried by colour alone. The product invariant made visible: proven is
// the only green and it exists only when a span was cited.

export type ProofState = "proven" | "gap" | "pending";

const MAP: Record<ProofState, { cls: string; glyph: string; label: string }> = {
  proven: { cls: "chip chip--proven", glyph: "✓", label: "Proven" },
  gap: { cls: "chip chip--gap", glyph: "✕", label: "Gap" },
  pending: { cls: "chip chip--pending", glyph: "•", label: "Pending" },
};

export default function StatusChip({
  state,
  label,
}: {
  state: ProofState;
  label?: string;
}) {
  const m = MAP[state];
  return (
    <span className={m.cls}>
      <span className="ic" aria-hidden="true">
        {m.glyph}
      </span>
      {label ?? m.label}
    </span>
  );
}
