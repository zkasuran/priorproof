// Engine entry point. Streams the prove-or-refuse run as EngineEvent values.
//
// runEngine is an async generator so the API route can stream each event and the
// UI can fill the coverage matrix live. The flow: parse the criteria, then for
// each one run two independent evidence passes with Promise.all and resolve them
// with decide, then assemble the packet. Every criterion's work is wrapped in a
// trace span when a sink is injected. Any thrown error becomes a single
// run_error event and stops the run. Junk model output is handled as a gap, not
// an error, so the generator never panics on bad model text.

import type {
  CaseInput,
  CriterionResult,
  EngineDeps,
  EngineEvent,
  EvidencePass,
} from "./types";
import { parseCriteria } from "./parse";
import { findEvidence } from "./evidence";
import { decide } from "./decide";
import { assemble } from "./packet";

export * from "./types";
export { parseCriteria, parseCriteriaFromPolicy } from "./parse";
export { findEvidence, findVerbatimSpan, collapseWs, safeJson } from "./evidence";
export { decide } from "./decide";
export { assemble } from "./packet";

/** Run fn inside a trace span when a sink is set, otherwise run it plain. */
async function withSpan<T>(
  deps: EngineDeps,
  name: string,
  kind: string,
  attrs: Record<string, unknown>,
  fn: (set: (k: string, v: unknown) => void) => Promise<T>,
): Promise<T> {
  if (deps.trace) return deps.trace.span(name, kind, attrs, fn);
  return fn(() => {});
}

export async function* runEngine(
  input: CaseInput,
  deps: EngineDeps,
): AsyncGenerator<EngineEvent> {
  try {
    yield { type: "run_start", caseId: input.caseId, service: input.service, policy: input.policy };
    deps.trace?.event("run_start", { caseId: input.caseId, service: input.service });

    const parsed = await withSpan(deps, "parse", "parse", { caseId: input.caseId }, async (set) => {
      const list = await parseCriteria(input, deps.llm);
      set("count", list.length);
      return list;
    });

    const criteria =
      typeof deps.maxCriteria === "number"
        ? parsed.slice(0, Math.max(0, deps.maxCriteria))
        : parsed;

    yield { type: "criteria_parsed", criteria };

    const results: CriterionResult[] = [];
    for (const criterion of criteria) {
      yield { type: "criterion_start", id: criterion.id };

      const [passA, passB] = await withSpan(
        deps,
        `evidence:${criterion.id}`,
        "evidence",
        { id: criterion.id },
        async (set) => {
          const pair = await Promise.all<EvidencePass>([
            findEvidence(criterion, input.chart, deps.llm, 1),
            findEvidence(criterion, input.chart, deps.llm, 2),
          ]);
          set("found1", pair[0].found);
          set("found2", pair[1].found);
          return pair;
        },
      );

      yield { type: "evidence", id: criterion.id, pass: 1, found: passA.found, cite: passA.cite, reasoning: passA.reasoning };
      yield { type: "evidence", id: criterion.id, pass: 2, found: passB.found, cite: passB.cite, reasoning: passB.reasoning };

      const result = await withSpan(
        deps,
        `decide:${criterion.id}`,
        "decide",
        { id: criterion.id },
        async (set) => {
          const r = decide(criterion, passA, passB);
          set("verdict", r.verdict);
          return r;
        },
      );

      results.push(result);
      yield { type: "criterion_resolved", result };
    }

    const packet = await withSpan(deps, "packet", "packet", { caseId: input.caseId }, async (set) => {
      const p = assemble(input, results);
      set("proven", p.provenCount);
      set("gap", p.gapCount);
      return p;
    });

    deps.trace?.event("packet_ready", { decision: packet.decision, proven: packet.provenCount, gap: packet.gapCount });
    yield { type: "packet_ready", packet };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    yield { type: "run_error", message };
    return;
  }
}
