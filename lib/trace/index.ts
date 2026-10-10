// Trace sink: dual-write to an in-memory store and, when keyed, to neatlogs.
//
// Every span and event is ALWAYS recorded in a local store, so the UI can render
// the trace with or without a key. When NEATLOGS_API_KEY is set we also open a
// matching neatlogs span around the awaited fn. Any neatlogs failure is caught
// and swallowed so a tracing problem can never break a run.
//
// Real neatlogs 1.1.26 exports used (read from the installed .d.ts):
//   init(options?)       -> Promise<void>    process-wide SDK setup
//   trace(options, fn)   -> Promise<T>       opens an OTel span, runs fn inside
//                                            it with the live span, ends it after
//   flush()              -> Promise<boolean> drains the batched exporter
//   log(template, opts?) -> void             a log step on the active trace
// 1.1.26 exports no trace/dashboard URL builder (ingest endpoint only), so
// dashboardUrl stays undefined.

import { AsyncLocalStorage } from "node:async_hooks";
import type { TraceSink } from "@/lib/engine/types";
import type { TraceSpanKind } from "neatlogs";

type NeatlogsModule = typeof import("neatlogs");

type AttrValue = string | number | boolean;

type Outcome<T> = { ok: true; value: T } | { ok: false; error: unknown };

export type SpanStatus = "pending" | "ok" | "error";

export interface LocalSpan {
  id: string;
  parentId?: string;
  name: string;
  /** The engine's own kind string, kept verbatim for the UI. */
  kind: string;
  attrs: Record<string, unknown>;
  startedAt: number;
  endedAt?: number;
  status: SpanStatus;
  ok?: boolean;
  err?: string;
}

export interface LocalEvent {
  id: string;
  spanId?: string;
  name: string;
  attrs: Record<string, unknown>;
  at: number;
}

export interface TraceSnapshot {
  runId: string;
  caseId?: string;
  spans: LocalSpan[];
  events: LocalEvent[];
}

export interface TraceController {
  sink: TraceSink;
  flush(): Promise<void>;
  snapshot(): TraceSnapshot;
  /** Set only when neatlogs exposes a trace link. 1.1.26 does not, so undefined. */
  dashboardUrl?: string;
}

// --- process-wide neatlogs state -------------------------------------------

const WORKFLOW_NAME = "priorproof";

// Tracks the active local span id across async boundaries, so a nested span gets
// an accurate parentId even when two passes run at once.
const spanContext = new AsyncLocalStorage<string>();

let spanSeq = 0;
let eventSeq = 0;
let traceSeq = 0;

// neatlogs is initialised at most once per process. initPromise is the guard:
// null until the first keyed span, then the shared init result.
let initPromise: Promise<NeatlogsModule | null> | null = null;
let neatlogs: NeatlogsModule | null = null;
let neatlogsReady = false;

function hasApiKey(): boolean {
  return (
    typeof process !== "undefined" &&
    typeof process.env.NEATLOGS_API_KEY === "string" &&
    process.env.NEATLOGS_API_KEY.length > 0
  );
}

function isNodeServer(): boolean {
  return (
    typeof process !== "undefined" &&
    !!process.versions?.node &&
    process.env.NEXT_RUNTIME !== "edge"
  );
}

function ensureNeatlogs(): Promise<NeatlogsModule | null> {
  if (initPromise) return initPromise;
  initPromise = (async () => {
    if (!hasApiKey() || !isNodeServer()) return null;
    try {
      const mod = await import("neatlogs");
      await mod.init({
        apiKey: process.env.NEATLOGS_API_KEY,
        workflowName: WORKFLOW_NAME,
        tags: [WORKFLOW_NAME],
        captureLogs: true,
      });
      neatlogs = mod;
      neatlogsReady = true;
      return mod;
    } catch {
      // SDK missing or init failed: fall back to local only, never throw.
      return null;
    }
  })();
  return initPromise;
}

// The engine's kind is a free string. Map it onto a valid neatlogs span kind for
// the remote span, defaulting to CHAIN, while the local span keeps it verbatim.
const KIND_MAP: Record<string, TraceSpanKind> = {
  workflow: "WORKFLOW",
  agent: "AGENT",
  chain: "CHAIN",
  tool: "TOOL",
  retriever: "RETRIEVER",
  retrieval: "RETRIEVER",
  embedding: "EMBEDDING",
  mcp_tool: "MCP_TOOL",
  guardrail: "GUARDRAIL",
  evaluator: "EVALUATOR",
  eval: "EVALUATOR",
  llm: "LLM",
  reranker: "RERANKER",
  vector_store: "VECTOR_STORE",
};

function mapKind(kind: string): TraceSpanKind {
  return KIND_MAP[kind.toLowerCase()] ?? "CHAIN";
}

// OTel attributes accept only string, number, boolean or arrays of those. Keep
// primitives, JSON-encode the rest so a rich attr never throws on export.
function toAttr(value: unknown): AttrValue {
  if (
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  ) {
    return value;
  }
  if (value === null || value === undefined) return String(value);
  try {
    return JSON.stringify(value) ?? String(value);
  } catch {
    return String(value);
  }
}

function safeAttrs(attrs: Record<string, unknown>): Record<string, AttrValue> {
  const out: Record<string, AttrValue> = {};
  for (const [k, v] of Object.entries(attrs)) out[k] = toAttr(v);
  return out;
}

// Mark the neatlogs span failed without importing @opentelemetry/api for its
// status enum. 2 is OTel SpanStatusCode.ERROR.
function markSpanError(span: unknown, error: unknown): void {
  const s = span as unknown as {
    recordException?: (e: unknown) => void;
    setStatus?: (status: { code: number; message?: string }) => void;
  };
  const message = error instanceof Error ? error.message : String(error);
  try {
    s.recordException?.(error instanceof Error ? error : new Error(message));
  } catch {
    // ignore: error reporting must not break the run
  }
  try {
    s.setStatus?.({ code: 2, message });
  } catch {
    // ignore: error reporting must not break the run
  }
}

// --- the controller ---------------------------------------------------------

export function createTrace(opts?: {
  runId?: string;
  caseId?: string;
}): TraceController {
  const runId =
    opts?.runId ?? `run_${Date.now().toString(36)}_${(++traceSeq).toString(36)}`;
  const caseId = opts?.caseId;
  const spans: LocalSpan[] = [];
  const events: LocalEvent[] = [];

  // Stamped on every neatlogs span so a keyed trace carries the same run and
  // case ids the local store holds.
  const baseAttrs: Record<string, AttrValue> = { "priorproof.run_id": runId };
  if (caseId) baseAttrs["priorproof.case_id"] = caseId;

  const sink: TraceSink = {
    async span<T>(
      name: string,
      kind: string,
      attrs: Record<string, unknown>,
      fn: (set: (k: string, v: unknown) => void) => Promise<T>,
    ): Promise<T> {
      const parentId = spanContext.getStore();
      const local: LocalSpan = {
        id: `sp_${(++spanSeq).toString(36)}`,
        parentId,
        name,
        kind,
        attrs: { ...attrs },
        startedAt: Date.now(),
        status: "pending",
      };
      spans.push(local);

      const finishOk = () => {
        local.endedAt = Date.now();
        local.status = "ok";
        local.ok = true;
      };
      const finishErr = (error: unknown) => {
        local.endedAt = Date.now();
        local.status = "error";
        local.ok = false;
        local.err = error instanceof Error ? error.message : String(error);
      };

      // Run the body inside this span's async context so a nested span sees it
      // as the parent.
      return spanContext.run(local.id, async () => {
        let captured: Outcome<T> | undefined;
        if (hasApiKey()) {
          const mod = await ensureNeatlogs();
          if (mod) {
            try {
              await mod.trace<Outcome<T>>(
                {
                  name,
                  kind: mapKind(kind),
                  sessionId: runId,
                  attributes: { ...baseAttrs, ...safeAttrs(attrs) },
                },
                async (nlSpan) => {
                  const set = (k: string, v: unknown) => {
                    local.attrs[k] = v;
                    try {
                      nlSpan.setAttribute(k, toAttr(v));
                    } catch {
                      // an attribute write must never break the run
                    }
                  };
                  try {
                    const value = await fn(set);
                    const out: Outcome<T> = { ok: true, value };
                    captured = out;
                    return out;
                  } catch (error) {
                    markSpanError(nlSpan, error);
                    const out: Outcome<T> = { ok: false, error };
                    captured = out;
                    return out;
                  }
                },
              );
            } catch {
              // neatlogs infra error. If fn ran, captured holds the outcome and
              // we use it below; if not, captured is undefined and we run local.
            }
          }
        }
        if (!captured) {
          // Local only: unkeyed, SDK absent, or neatlogs failed before fn ran.
          const set = (k: string, v: unknown) => {
            local.attrs[k] = v;
          };
          try {
            const value = await fn(set);
            finishOk();
            return value;
          } catch (error) {
            finishErr(error);
            throw error;
          }
        }

        if (captured.ok) {
          finishOk();
          return captured.value;
        }
        finishErr(captured.error);
        throw captured.error;
      });
    },

    event(name: string, attrs: Record<string, unknown>): void {
      const spanId = spanContext.getStore();
      events.push({
        id: `ev_${(++eventSeq).toString(36)}`,
        spanId,
        name,
        attrs: { ...attrs },
        at: Date.now(),
      });
      // Mirror to neatlogs only when the SDK is already live. event is sync, so
      // we never await init here.
      if (neatlogsReady && neatlogs) {
        try {
          neatlogs.log(name, { ...attrs });
        } catch {
          // best effort: a log failure must not affect the run
        }
      }
    },
  };

  return {
    sink,
    async flush(): Promise<void> {
      if (!hasApiKey()) return; // no-op if unkeyed
      const mod = initPromise ? await initPromise : neatlogs;
      if (!mod) return; // nothing was initialised, nothing to flush
      try {
        await mod.flush();
      } catch {
        // a flush failure must not break the response
      }
    },
    snapshot(): TraceSnapshot {
      return {
        runId,
        caseId,
        spans: spans.map((s) => ({ ...s, attrs: { ...s.attrs } })),
        events: events.map((e) => ({ ...e, attrs: { ...e.attrs } })),
      };
    },
    // dashboardUrl intentionally omitted: neatlogs 1.1.26 exposes no trace link.
  };
}
