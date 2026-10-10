"use client";

import { useCallback, useRef, useState } from "react";
import type {
  Criterion,
  EngineEvent,
  EvidencePass,
  ChartSpan,
  Packet,
  PolicyRef,
} from "@/lib/engine/types";
import { createSseDecoder } from "@/lib/sse";
import CriterionRow from "./CriterionRow";
import styles from "./CoverageMatrix.module.css";

// Shared run-state model. The demo page, TraceRail and PacketView all read these
// types, so they live here beside the hook that produces them.

export type RunStatus = "idle" | "running" | "done" | "error";

export interface RowState {
  criterion: Criterion;
  status: "pending" | "resolving" | "proven" | "gap";
  passes: EvidencePass[];
  cite?: ChartSpan;
  gapReason?: string;
  rationale?: string;
}

export interface TraceStep {
  id: string;
  label: string;
  detail?: string;
  state: "pending" | "active" | "done" | "error";
}

export interface RunState {
  status: RunStatus;
  caseId?: string;
  service?: string;
  policy?: PolicyRef;
  rows: RowState[];
  steps: TraceStep[];
  packet?: Packet;
  total: number;
  resolved: number;
  proven: number;
  gaps: number;
  elapsedMs: number;
  errorMessage?: string;
  dashboardUrl?: string | null;
  runId?: string;
}

const IDLE_TIMEOUT_MS = 45_000;
const MAX_ROWS = 24;

function errorMessage(err: unknown): string {
  if (err instanceof Error && err.message) return err.message;
  if (typeof err === "string" && err) return err;
  return "The run failed before it could finish.";
}

function makeRunId(): string {
  try {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
      return crypto.randomUUID();
    }
  } catch {
    // fall through to the cheap id
  }
  return `run-${Math.random().toString(36).slice(2, 10)}`;
}

function idleState(): RunState {
  return {
    status: "idle",
    rows: [],
    steps: [],
    total: 0,
    resolved: 0,
    proven: 0,
    gaps: 0,
    elapsedMs: 0,
    dashboardUrl: null,
  };
}

const STEP_DEFS: { id: string; label: string }[] = [
  { id: "load", label: "Policy and chart loaded" },
  { id: "parse", label: "Criteria parsed" },
  { id: "evidence", label: "Two independent evidence passes" },
  { id: "packet", label: "Prior-auth packet assembled" },
  { id: "trace", label: "Trace recorded" },
];

// Recompute the derived counts and the trace rail from the rows and the status,
// so every update keeps them in step with one source of truth.
function derive(s: RunState): RunState {
  const proven = s.rows.filter((r) => r.status === "proven").length;
  const gaps = s.rows.filter((r) => r.status === "gap").length;
  const resolved = proven + gaps;
  const total = s.total || s.rows.length;

  const done: Record<string, boolean> = {
    load: Boolean(s.service),
    parse: total > 0,
    evidence: total > 0 && resolved === total,
    packet: Boolean(s.packet),
    trace: s.status === "done",
  };

  const steps: TraceStep[] = STEP_DEFS.map((def) => {
    let detail: string | undefined;
    if (def.id === "parse" && total > 0) detail = `${total} criteria`;
    if (def.id === "evidence" && total > 0) detail = `${resolved} of ${total} resolved`;
    return { id: def.id, label: def.label, detail, state: done[def.id] ? "done" : "pending" };
  });

  if (s.status === "running") {
    const next = steps.find((st) => st.state === "pending");
    if (next) next.state = "active";
  } else if (s.status === "error") {
    const next = steps.find((st) => st.state === "pending");
    if (next) next.state = "error";
  }

  return { ...s, proven, gaps, resolved, total, steps };
}

function runningState(caseId: string, runId: string): RunState {
  return derive({
    status: "running",
    caseId,
    runId,
    rows: [],
    steps: [],
    total: 0,
    resolved: 0,
    proven: 0,
    gaps: 0,
    elapsedMs: 0,
    dashboardUrl: null,
  });
}

function applyEngineEvent(prev: RunState, ev: EngineEvent): RunState {
  switch (ev.type) {
    case "run_start":
      return derive({ ...prev, caseId: ev.caseId, service: ev.service, policy: ev.policy });
    case "criteria_parsed": {
      const rows: RowState[] = ev.criteria.slice(0, MAX_ROWS).map((c) => ({
        criterion: c,
        status: "pending",
        passes: [],
      }));
      return derive({ ...prev, rows, total: rows.length });
    }
    case "criterion_start":
      return derive({
        ...prev,
        rows: prev.rows.map((r) =>
          r.criterion.id === ev.id && r.status === "pending" ? { ...r, status: "resolving" } : r,
        ),
      });
    case "evidence":
      return derive({
        ...prev,
        rows: prev.rows.map((r) => {
          if (r.criterion.id !== ev.id) return r;
          const passes: EvidencePass[] = [
            ...r.passes.filter((p) => p.pass !== ev.pass),
            { pass: ev.pass, found: ev.found, cite: ev.cite, reasoning: ev.reasoning },
          ].sort((a, b) => a.pass - b.pass);
          return { ...r, status: r.status === "pending" ? "resolving" : r.status, passes };
        }),
      });
    case "criterion_resolved":
      return derive({
        ...prev,
        rows: prev.rows.map((r) =>
          r.criterion.id === ev.result.criterion.id
            ? {
                criterion: r.criterion,
                status: ev.result.verdict,
                passes: ev.result.passes,
                cite: ev.result.cite,
                gapReason: ev.result.gapReason,
                rationale: ev.result.rationale,
              }
            : r,
        ),
      });
    case "packet_ready":
      return derive({ ...prev, packet: ev.packet });
    case "run_error":
      return derive({ ...prev, status: "error", errorMessage: ev.message });
    default:
      return prev;
  }
}

export function useRun(): { run: RunState; start: (caseId: string) => void; cancel: () => void } {
  const [run, setRun] = useState<RunState>(idleState);
  const abortRef = useRef<AbortController | null>(null);
  const idleRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startedAtRef = useRef<number>(0);

  const clearTimers = useCallback(() => {
    if (idleRef.current) {
      clearTimeout(idleRef.current);
      idleRef.current = null;
    }
    if (tickRef.current) {
      clearInterval(tickRef.current);
      tickRef.current = null;
    }
  }, []);

  const fail = useCallback(
    (message: string) => {
      clearTimers();
      setRun((prev) => derive({ ...prev, status: "error", errorMessage: message }));
    },
    [clearTimers],
  );

  const cancel = useCallback(() => {
    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
    }
    clearTimers();
  }, [clearTimers]);

  const start = useCallback(
    (caseId: string) => {
      // Drop any run already in flight before starting a new one.
      if (abortRef.current) abortRef.current.abort();
      clearTimers();

      const controller = new AbortController();
      abortRef.current = controller;
      const runId = makeRunId();
      startedAtRef.current = performance.now();
      setRun(runningState(caseId, runId));

      tickRef.current = setInterval(() => {
        setRun((prev) =>
          prev.status === "running"
            ? { ...prev, elapsedMs: Math.round(performance.now() - startedAtRef.current) }
            : prev,
        );
      }, 120);

      const resetIdle = () => {
        if (idleRef.current) clearTimeout(idleRef.current);
        idleRef.current = setTimeout(() => {
          controller.abort();
          fail("The stream went quiet. The engine may be busy or unreachable.");
        }, IDLE_TIMEOUT_MS);
      };

      const finalElapsed = () => Math.round(performance.now() - startedAtRef.current);

      const handleFrame = (event: string, data: unknown) => {
        if (event === "error") {
          const message =
            data && typeof data === "object" && typeof (data as { message?: unknown }).message === "string"
              ? (data as { message: string }).message
              : "The engine returned an error.";
          fail(message);
          return;
        }
        if (event === "done") {
          clearTimers();
          const d = (data ?? {}) as { dashboardUrl?: string | null; runId?: string | null };
          setRun((prev) =>
            prev.status === "error"
              ? prev
              : derive({
                  ...prev,
                  status: "done",
                  elapsedMs: finalElapsed(),
                  dashboardUrl: d.dashboardUrl ?? null,
                  runId: d.runId ?? prev.runId,
                }),
          );
          return;
        }
        const ev = data as EngineEvent | null;
        if (!ev || typeof ev !== "object" || typeof ev.type !== "string") return;
        if (ev.type === "run_error") {
          fail(ev.message || "The engine refused the run.");
          return;
        }
        setRun((prev) => (prev.status === "error" ? prev : applyEngineEvent(prev, ev)));
      };

      const pump = async () => {
        resetIdle();
        try {
          const res = await fetch("/api/run", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ caseId, runId }),
            signal: controller.signal,
          });
          if (!res.ok || !res.body) {
            throw new Error(`The run request failed with status ${res.status}.`);
          }
          const reader = res.body.getReader();
          const decoder = createSseDecoder();
          const td = new TextDecoder();
          for (;;) {
            const { value, done } = await reader.read();
            if (done) break;
            resetIdle();
            for (const frame of decoder.push(td.decode(value, { stream: true }))) {
              let parsed: unknown = null;
              try {
                parsed = frame.data ? JSON.parse(frame.data) : null;
              } catch {
                parsed = null;
              }
              handleFrame(frame.event, parsed);
            }
          }
          clearTimers();
          // The route always closes with a `done` frame. If the stream ends while
          // still running, settle it rather than leave the UI spinning.
          setRun((prev) =>
            prev.status === "running"
              ? derive({ ...prev, status: "done", elapsedMs: finalElapsed() })
              : prev,
          );
        } catch (err) {
          if (controller.signal.aborted) return; // our own abort, already handled
          fail(errorMessage(err));
        } finally {
          clearTimers();
        }
      };

      void pump();
    },
    [clearTimers, fail],
  );

  return { run, start, cancel };
}

export default function CoverageMatrix({
  run,
  onRetry,
}: {
  run: RunState;
  onRetry: () => void;
}) {
  if (run.status === "error") {
    return (
      <div className={styles.panel} role="alert">
        <span className={styles.panelTitle}>The engine run failed</span>
        <span className={styles.panelMessage}>
          {run.errorMessage ?? "Something interrupted the run."}
        </span>
        <button type="button" className={styles.retry} onClick={onRetry}>
          Try again
        </button>
      </div>
    );
  }

  if (run.status === "idle") {
    return (
      <div className={styles.empty}>
        Pick a policy and run it. Each criterion fills in as the engine proves it against the chart
        or returns it as a named gap.
      </div>
    );
  }

  if (run.rows.length === 0) {
    return (
      <div className={styles.loading} aria-live="polite" aria-label="Reading the policy">
        <div className={styles.loadingRow} />
        <div className={styles.loadingRow} />
        <div className={styles.loadingRow} />
      </div>
    );
  }

  return (
    <div className={styles.matrix} aria-live="polite">
      {run.rows.map((row) => (
        <CriterionRow key={row.criterion.id} row={row} />
      ))}
    </div>
  );
}




