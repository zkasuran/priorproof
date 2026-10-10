import type { RowState } from "./CoverageMatrix";
import styles from "./CriterionRow.module.css";

const VERDICT_LABEL: Record<RowState["status"], string> = {
  pending: "Queued",
  resolving: "Checking",
  proven: "Proven",
  gap: "Gap",
};

const VERDICT_CLASS: Record<RowState["status"], string> = {
  pending: styles.verdictPending,
  resolving: styles.verdictResolving,
  proven: styles.verdictProven,
  gap: styles.verdictGap,
};

function curlyQuote(text: string): string {
  return `“${text}”`;
}

function PassChip({
  n,
  found,
  reasoning,
  arrived,
}: {
  n: 1 | 2;
  found?: boolean;
  reasoning?: string;
  arrived: boolean;
}) {
  if (!arrived) {
    return (
      <span className={`${styles.pass} ${styles.passWaiting}`}>
        <span className={styles.passLabel}>Pass {n}</span>
        <span>waiting</span>
      </span>
    );
  }
  const cls = found ? styles.passFound : styles.passMissing;
  return (
    <span className={`${styles.pass} ${cls}`} title={reasoning ?? ""}>
      <span className={styles.passLabel}>Pass {n}</span>
      <span>{found ? "found" : "not found"}</span>
    </span>
  );
}

export default function CriterionRow({ row }: { row: RowState }) {
  const { criterion, status, passes, cite, gapReason, rationale } = row;
  const pass1 = passes.find((p) => p.pass === 1);
  const pass2 = passes.find((p) => p.pass === 2);
  const showPasses = status !== "pending";

  return (
    <article className={`${styles.row} ${styles[status]}`} aria-busy={status === "resolving"}>
      <div className={styles.header}>
        <span className={styles.id}>{criterion.id}</span>
        {criterion.group ? <span className={styles.group}>{criterion.group}</span> : null}
        <span className={`${styles.verdict} ${VERDICT_CLASS[status]}`}>
          <span className={styles.dot} aria-hidden="true" />
          {VERDICT_LABEL[status]}
        </span>
      </div>

      <p className={styles.text}>{criterion.text}</p>

      {showPasses ? (
        <div className={styles.passes}>
          <PassChip n={1} found={pass1?.found} reasoning={pass1?.reasoning} arrived={Boolean(pass1)} />
          <PassChip n={2} found={pass2?.found} reasoning={pass2?.reasoning} arrived={Boolean(pass2)} />
        </div>
      ) : (
        <div className={styles.skeleton} aria-hidden="true" />
      )}

      {status === "proven" && cite ? (
        <div className={styles.cite}>
          {cite.section ? <span className={styles.citeSection}>{cite.section}</span> : null}
          {curlyQuote(cite.quote)}
        </div>
      ) : null}

      {status === "gap" ? (
        <div className={styles.gapBox}>
          <span className={styles.refused}>Refused to green</span>
          <span className={styles.gapReason}>
            {gapReason ?? "No chart span supports this criterion."}
          </span>
        </div>
      ) : null}

      {rationale && status !== "pending" ? (
        <p className={styles.rationale}>{rationale}</p>
      ) : null}
    </article>
  );
}
