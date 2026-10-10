"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import styles from "./HeroDemo.module.css";

// A canned illustration of a run. No network, no engine: it steps a fixed
// rheumatoid-arthritis policy so a first-time visitor sees the shape of the
// product in the hero. Six criteria prove against the chart, the seventh stays
// red because the second DMARD trial is not in the record. Honest about being a
// sample. It renders the final frame at once under reduced motion.

interface HeroRow {
  id: string;
  label: string;
  cite?: string;
  gap?: string;
}

const ROWS: HeroRow[] = [
  { id: "RA1", label: "Confirmed moderate to severe rheumatoid arthritis", cite: "meets 2010 ACR and EULAR criteria, score 7 of 10" },
  { id: "RA2", label: "Disease activity above target (DAS28 over 3.2)", cite: "DAS28-CRP 5.1 at the most recent visit" },
  { id: "RA3", label: "Seropositive or raised inflammatory markers", cite: "anti-CCP positive, CRP 2.4 mg/dL" },
  { id: "RA4", label: "Methotrexate trial at an adequate dose", cite: "methotrexate 20 mg weekly for 4 months" },
  { id: "RA5", label: "Inadequate response documented", cite: "swollen joint count unchanged after 4 months" },
  { id: "RA6", label: "Negative TB screen before a biologic", cite: "QuantiFERON-TB negative this year" },
  {
    id: "RA7",
    label: "Step therapy: two conventional DMARDs, 3 months each",
    gap: "One DMARD documented. Second trial not found.",
  },
];

const STEP_MS = 200;

export default function HeroDemo() {
  const [resolved, setResolved] = useState(0);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearTimers = useCallback(() => {
    for (const t of timers.current) clearTimeout(t);
    timers.current = [];
  }, []);

  const run = useCallback(() => {
    clearTimers();
    const reduceMotion =
      typeof window !== "undefined" &&
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) {
      setResolved(ROWS.length);
      return;
    }
    setResolved(0);
    for (let i = 1; i <= ROWS.length; i++) {
      timers.current.push(setTimeout(() => setResolved(i), i * STEP_MS));
    }
  }, [clearTimers]);

  useEffect(() => {
    // Kick the sample off on the next tick rather than setting state synchronously
    // in the effect body. Reduced-motion users land on the final frame at once.
    const kickoff = setTimeout(run, 0);
    return () => {
      clearTimeout(kickoff);
      clearTimers();
    };
  }, [run, clearTimers]);

  const done = resolved >= ROWS.length;

  return (
    <div className={styles.hero} aria-label="Sample coverage matrix">
      <div className={styles.head}>
        <span className={styles.badge}>Sample run</span>
        <span className={styles.note}>Canned illustration. No live engine call.</span>
      </div>

      <div className={styles.list} aria-live="polite">
        {ROWS.map((row, i) => {
          const isResolved = i < resolved;
          const kind = !isResolved ? "pending" : row.gap ? "gap" : "proven";
          const cls =
            kind === "proven" ? styles.proven : kind === "gap" ? styles.gap : "";
          return (
            <div key={row.id} className={`${styles.row} ${cls}`}>
              <span className={styles.dot} aria-hidden="true" />
              <span className={styles.label}>{row.label}</span>
              {kind === "proven" && row.cite ? (
                <span className={styles.chip}>{`“${row.cite}”`}</span>
              ) : null}
              {kind === "gap" ? <span className={styles.refused}>Refused to green</span> : null}
              {kind === "gap" && row.gap ? (
                <span className={styles.gapLine}>{row.gap}</span>
              ) : null}
            </div>
          );
        })}
      </div>

      <div className={styles.footer}>
        <span className={styles.summary}>
          {done ? "6 proven. 1 gap. Packet ready. One action needed." : "Proving criteria..."}
        </span>
        <button type="button" className={styles.replay} onClick={run}>
          Replay
        </button>
      </div>
    </div>
  );
}
