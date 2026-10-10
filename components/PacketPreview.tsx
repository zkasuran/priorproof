import StatusChip from "./StatusChip";
import styles from "./PacketPreview.module.css";

export interface PacketPreviewProps {
  service: string;
  policyName: string;
  provenCount: number;
  gapCount: number;
  proven: { id: string; text: string }[];
  gaps: { id: string; text: string; fix: string }[];
}

/** An illustrative render of the submission packet the agent assembles. The real
    packet comes off a live run; this shows its shape on the demo case. */
export default function PacketPreview({
  service,
  policyName,
  provenCount,
  gapCount,
  proven,
  gaps,
}: PacketPreviewProps) {
  const actionNeeded = gapCount > 0;
  return (
    <div className={styles.doc}>
      <header className={styles.head}>
        <div>
          <p className="eyebrow">Prior-auth packet (illustrative)</p>
          <h3 className={styles.service}>{service}</h3>
          <p className={styles.policy}>{policyName}</p>
        </div>
        <StatusChip
          state={actionNeeded ? "pending" : "proven"}
          label={actionNeeded ? "Action needed" : "Ready"}
        />
      </header>

      <div className={styles.stats}>
        <div>
          <span className={`statNum statNum--proven`}>{provenCount}</span>
          <span className={styles.statLabel}>proven, each cited</span>
        </div>
        <div>
          <span className={`statNum statNum--gap`}>{gapCount}</span>
          <span className={styles.statLabel}>named gap</span>
        </div>
        <div>
          <span className="statNum">0</span>
          <span className={styles.statLabel}>ungrounded greens</span>
        </div>
      </div>

      {gaps.length > 0 && (
        <section className={styles.block}>
          <p className={styles.blockTitle} data-state="gap">
            What is blocking approval
          </p>
          {gaps.map((g) => (
            <div key={g.id} className={styles.gap}>
              <p className={styles.gapText}>
                <span className="mono">{g.id}</span> {g.text}
              </p>
              <p className={styles.fix}>
                <span className={styles.fixLabel}>Fix</span> {g.fix}
              </p>
            </div>
          ))}
        </section>
      )}

      <section className={styles.block}>
        <p className={styles.blockTitle} data-state="proven">
          Proven against the chart
        </p>
        <ul className={styles.provenList}>
          {proven.map((p) => (
            <li key={p.id}>
              <span className="mono">{p.id}</span> {p.text}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
