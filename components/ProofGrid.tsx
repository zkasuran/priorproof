import StatusChip, { type ProofState } from "./StatusChip";
import styles from "./ProofGrid.module.css";

export interface ProofRow {
  id: string;
  group?: string;
  text: string;
  state: ProofState;
  /** The cited span (proven) or the named gap (gap). */
  note: string;
}

/** A static, illustrative coverage matrix. The live run is the demo surface; this
    renders a known result so a marketing page can echo the invariant without a
    network call. */
export default function ProofGrid({ rows }: { rows: ProofRow[] }) {
  return (
    <div className={styles.grid}>
      {rows.map((r) => (
        <article key={r.id} className={styles.row} data-state={r.state}>
          <header className={styles.head}>
            <span className={`mono ${styles.id}`}>{r.id}</span>
            <StatusChip state={r.state} />
          </header>
          <p className={styles.text}>{r.text}</p>
          <p className={styles.note} data-state={r.state}>
            <span className={styles.noteLabel}>
              {r.state === "proven" ? "Cited span" : "Named gap"}
            </span>
            <span className={styles.noteBody}>{r.note}</span>
          </p>
        </article>
      ))}
    </div>
  );
}
