import type { TraceStep } from "./CoverageMatrix";
import styles from "./TraceRail.module.css";

// The step rail. It mirrors the engine run: each phase lights as its events
// arrive, the current phase pulses, a failed run marks the phase it died on.
export default function TraceRail({ steps }: { steps: TraceStep[] }) {
  if (steps.length === 0) return null;

  return (
    <nav className={styles.rail} aria-label="Engine trace">
      <div className={styles.title}>Trace</div>
      {steps.map((step, i) => {
        const last = i === steps.length - 1;
        return (
          <div key={step.id} className={`${styles.step} ${styles[step.state]}`}>
            <div className={styles.marker}>
              <span className={styles.node} aria-hidden="true" />
              {last ? null : <span className={styles.connector} aria-hidden="true" />}
            </div>
            <div className={styles.body}>
              <div className={styles.label}>{step.label}</div>
              {step.detail ? <div className={styles.detail}>{step.detail}</div> : null}
            </div>
          </div>
        );
      })}
    </nav>
  );
}
