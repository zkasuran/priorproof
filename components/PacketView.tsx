import type { CriterionResult, Packet } from "@/lib/engine/types";
import styles from "./PacketView.module.css";

// The assembled packet. Gaps lead as an action list because they are what blocks
// a submit. Proven criteria follow, each shown with the chart span that carried
// it. Every value is rendered as a React text node, so the browser escapes it:
// there is no dangerouslySetInnerHTML anywhere here.

function curlyQuote(text: string): string {
  return `“${text}”`;
}

export default function PacketView({ packet }: { packet: Packet }) {
  const gaps: CriterionResult[] = packet.results.filter((r) => r.verdict === "gap");
  const proven: CriterionResult[] = packet.results.filter((r) => r.verdict === "proven");
  const ready = packet.decision === "ready";

  return (
    <section className={styles.packet} aria-label="Prior-authorization packet">
      <div className={styles.head}>
        <span
          className={`${styles.decision} ${ready ? styles.ready : styles.actionNeeded}`}
        >
          {ready ? "Ready to submit" : "Action needed"}
        </span>
        <span className={styles.service}>{packet.service}</span>
        <span className={styles.policy}>
          {packet.policy.payer}
          {" · "}
          <a href={packet.policy.url} target="_blank" rel="noreferrer">
            {packet.policy.name}
          </a>
          {" · "}
          {packet.provenCount} proven, {packet.gapCount} {packet.gapCount === 1 ? "gap" : "gaps"}
        </span>
      </div>

      {gaps.length > 0 ? (
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Actions needed before submit</h3>
          <ul className={styles.actions}>
            {gaps.map((g) => (
              <li key={g.criterion.id} className={styles.action}>
                <div className={styles.actionHead}>
                  <span className={styles.actionId}>{g.criterion.id}</span>
                </div>
                <span className={styles.actionText}>{g.criterion.text}</span>
                <span className={styles.actionFix}>
                  {g.gapReason ?? "No chart span supports this criterion."}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {proven.length > 0 ? (
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Proven against the chart</h3>
          <ul className={styles.proven}>
            {proven.map((p) => (
              <li key={p.criterion.id} className={styles.provenItem}>
                <div className={styles.provenHead}>
                  <span className={styles.provenId}>{p.criterion.id}</span>
                  <span className={styles.provenText}>{p.criterion.text}</span>
                </div>
                {p.cite ? (
                  <span className={styles.provenCite}>
                    {p.cite.section ? `${p.cite.section}: ` : ""}
                    {curlyQuote(p.cite.quote)}
                  </span>
                ) : null}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Cover letter</h3>
        <div className={styles.letter}>{packet.coverLetter}</div>
      </div>
    </section>
  );
}
