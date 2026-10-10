// Trace sink. STUB: replaced by the trace build with a neatlogs dual-write.
// The real version emits spans to neatlogs when NEATLOGS_API_KEY is set and
// ALWAYS also records them to a local store so the UI renders the trace live
// with or without a key. This stub is a working no-op so the engine runs.
import type { TraceSink } from "@/lib/engine/types";

export interface TraceController {
  sink: TraceSink;
  flush(): Promise<void>;
  snapshot(): { spans: unknown[] };
}

export function createTrace(opts?: { runId?: string; caseId?: string }): TraceController {
  void opts;
  const sink: TraceSink = {
    async span(name, kind, attrs, fn) {
      void name;
      void kind;
      void attrs;
      return fn(() => {});
    },
    event() {},
  };
  return {
    sink,
    async flush() {},
    snapshot() {
      return { spans: [] };
    },
  };
}
