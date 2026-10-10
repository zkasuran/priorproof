// PriorProof engine contract.
//
// This file is the shared contract every other module compiles against. It is
// pure types: no runtime, no `next/*`, no `process.env`. The engine is an async
// generator that yields EngineEvent values as it works, so the API route can
// stream them and the UI can fill the coverage matrix live.
//
// The one invariant the whole product rests on: a criterion is `proven` only when
// a real span in the chart supports it and both independent passes agree on that
// span. Anything the chart cannot support is a `gap`, never a hopeful green.

/** A single medical-necessity criterion parsed from the payer policy. */
export interface Criterion {
  /** Stable id, e.g. "C1", "C4c". */
  id: string;
  /** The exact policy wording for this criterion. */
  text: string;
  /** Optional group label, e.g. "Conservative therapy". */
  group?: string;
  /** Where in the policy this came from (section or footnote). */
  policySource: string;
  /** Rough type tag for display and validation, e.g. "imaging", "step-therapy". */
  kind?: string;
}

/** Prove-or-refuse. There is deliberately no third "approved" verdict. */
export type Verdict = "proven" | "gap";

/** A cited span in the chart, so a green row always points at real text. */
export interface ChartSpan {
  /** The exact chart text quoted. */
  quote: string;
  /** Optional section the quote came from, e.g. "IMAGING". */
  section?: string;
  /** Optional character offset of the quote in the chart, for highlighting. */
  offset?: number;
}

/** One independent pass over the chart for one criterion. */
export interface EvidencePass {
  pass: 1 | 2;
  found: boolean;
  /** The span this pass believes supports the criterion, if any. */
  cite?: ChartSpan;
  /** Why this pass concluded found or not-found. */
  reasoning: string;
}

/** The resolved decision for one criterion. */
export interface CriterionResult {
  criterion: Criterion;
  verdict: Verdict;
  /** Both independent passes, kept for the audit trail. */
  passes: EvidencePass[];
  /** Present if and only if proven: the span both passes agreed on. */
  cite?: ChartSpan;
  /** Present if and only if gap: what is missing and the one line that fixes it. */
  gapReason?: string;
  rationale: string;
}

/** A pointer to the public policy the criteria came from. */
export interface PolicyRef {
  name: string;
  payer: string;
  url: string;
  retrieved?: string;
}

/** The submission-ready packet the agent assembles. */
export interface Packet {
  caseId: string;
  service: string;
  policy: PolicyRef;
  results: CriterionResult[];
  provenCount: number;
  gapCount: number;
  /** "action-needed" whenever any criterion is a gap. */
  decision: "ready" | "action-needed";
  coverLetter: string;
}

/** The input case: a policy decomposed into criteria plus the chart text. */
export interface CaseInput {
  caseId: string;
  service: string;
  policy: PolicyRef;
  criteria: Criterion[];
  chart: string;
}

/** Expected labels for the validation and test oracle, per fixture. */
export interface CaseExpectation {
  caseId: string;
  expected: Record<
    string,
    { verdict: Verdict; citeContains?: string; gapContains?: string }
  >;
}

/** Streaming events the engine yields, consumed by the SSE route and the UI. */
export type EngineEvent =
  | { type: "run_start"; caseId: string; service: string; policy: PolicyRef }
  | { type: "criteria_parsed"; criteria: Criterion[] }
  | { type: "criterion_start"; id: string }
  | {
      type: "evidence";
      id: string;
      pass: 1 | 2;
      found: boolean;
      cite?: ChartSpan;
      reasoning: string;
    }
  | { type: "criterion_resolved"; result: CriterionResult }
  | { type: "packet_ready"; packet: Packet }
  | { type: "run_error"; message: string };

/** The LLM client the engine depends on. Injected, so the engine never reads env. */
export interface LlmClient {
  readonly provider: string;
  readonly model: string;
  complete(args: {
    system: string;
    prompt: string;
    json?: boolean;
    maxTokens?: number;
    signal?: AbortSignal;
  }): Promise<string>;
}

/** The trace sink the engine writes spans to (neatlogs plus a local store). Injected. */
export interface TraceSink {
  span<T>(
    name: string,
    kind: string,
    attrs: Record<string, unknown>,
    fn: (set: (k: string, v: unknown) => void) => Promise<T>,
  ): Promise<T>;
  event(name: string, attrs: Record<string, unknown>): void;
}

/** Dependencies injected into the engine run. */
export interface EngineDeps {
  llm: LlmClient;
  trace?: TraceSink;
  /** Cap criteria for a bounded demo run. */
  maxCriteria?: number;
}
