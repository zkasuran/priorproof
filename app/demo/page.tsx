"use client";

// The live demo surface. Cache Components (next.config cacheComponents) removes
// the `dynamic` route segment config, so there is no `force-dynamic` export here.
// This page is a Client Component: it reads nothing at request time on the server
// and does all its work in the browser against the streaming /api/run route, so it
// prerenders as a static shell and then runs fully client-side.

import { useState } from "react";
import { listCases, DEFAULT_CASE_ID } from "@/lib/fixtures";
import CoverageMatrix, { useRun } from "@/components/CoverageMatrix";
import TraceRail from "@/components/TraceRail";
import PacketView from "@/components/PacketView";
import styles from "./page.module.css";

export default function DemoPage() {
  const cases = listCases();
  const [caseId, setCaseId] = useState<string>(DEFAULT_CASE_ID);
  const [showPacket, setShowPacket] = useState(false);
  const { run, start } = useRun();

  const running = run.status === "running";
  const started = run.status !== "idle";
  const elapsedSeconds = (run.elapsedMs / 1000).toFixed(1);

  const onRun = () => {
    setShowPacket(false);
    start(caseId);
  };

  return (
    <main className={styles.wrap}>
      <header className={styles.header}>
        <span className={styles.synthetic}>Synthetic data, no PHI</span>
        <h1 className={styles.title}>PriorProof live demo</h1>
        <p className={styles.subtitle}>
          Pick a payer policy and run it against a synthetic chart. Each criterion turns green only
          when a verbatim chart span proves it. Everything else stays a named gap.
        </p>
      </header>

      <section className={styles.controls}>
        <div className={styles.field}>
          <label className={styles.fieldLabel} htmlFor="case">
            Policy
          </label>
          <select
            id="case"
            className={styles.select}
            value={caseId}
            disabled={running}
            onChange={(e) => setCaseId(e.target.value)}
          >
            {cases.map((c) => (
              <option key={c.caseId} value={c.caseId}>
                {c.policy} ({c.criteriaCount} criteria)
              </option>
            ))}
          </select>
          <span className={styles.hint}>The default case loads a chart with a built-in gap.</span>
        </div>
        <button type="button" className={styles.run} onClick={onRun} disabled={running}>
          {running ? "Running..." : "Run"}
        </button>
      </section>

      {started ? (
        <section className={styles.outcome} aria-label="Run outcome">
          <div className={styles.stat}>
            <span className={`${styles.statNum} ${styles.statProven}`}>{run.proven}</span>
            <span className={styles.statLabel}>Proven</span>
          </div>
          <div className={styles.stat}>
            <span className={`${styles.statNum} ${styles.statGap}`}>{run.gaps}</span>
            <span className={styles.statLabel}>Gaps</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statNum}>
              {run.resolved}/{run.total || "?"}
            </span>
            <span className={styles.statLabel}>Resolved</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statNum}>{elapsedSeconds}s</span>
            <span className={styles.statLabel}>Elapsed</span>
          </div>
        </section>
      ) : null}

      <div className={styles.layout}>
        <TraceRail steps={run.steps} />
        <CoverageMatrix run={run} onRetry={onRun} />
      </div>

      {started ? (
        <section className={styles.actions}>
          <button
            type="button"
            className={styles.build}
            disabled={!run.packet}
            onClick={() => setShowPacket(true)}
          >
            {run.packet ? "Build packet" : "Packet assembles after the run"}
          </button>
          <span className={styles.trace}>
            {run.dashboardUrl ? (
              <a href={run.dashboardUrl} target="_blank" rel="noreferrer">
                View trace
              </a>
            ) : run.runId ? (
              <span>Trace {run.runId}</span>
            ) : null}
          </span>
        </section>
      ) : null}

      {showPacket && run.packet ? <PacketView packet={run.packet} /> : null}
    </main>
  );
}
