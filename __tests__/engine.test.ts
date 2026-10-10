// Engine tests. A fake deterministic LlmClient stands in for the model, so there
// is no network. The fake answers from the prompt alone (it reads the criterion
// id and the pass number the engine writes into every prompt), which keeps each
// run reproducible. The invariant under test: a criterion goes proven only when a
// real chart span supports it, cited by at least one of two independent passes.

import { describe, it, expect } from "vitest";
import fc from "fast-check";
import { runEngine } from "@/lib/engine";
import { findEvidence } from "@/lib/engine/evidence";
import { decide } from "@/lib/engine/decide";
import { parseCriteria, parseCriteriaFromPolicy } from "@/lib/engine/parse";
import {
  aetna0743Case,
  aetna0743Expectation,
} from "@/lib/fixtures/cases/aetna-0743-lumbar";
import type {
  CaseInput,
  Criterion,
  CriterionResult,
  EngineEvent,
  LlmClient,
  Packet,
} from "@/lib/engine/types";

/** Wrap a reply function as an LlmClient. Object replies are JSON-stringified so
 *  they land as valid JSON for the engine to parse. */
function fakeLlm(reply: (prompt: string) => unknown): LlmClient {
  return {
    provider: "fake",
    model: "deterministic",
    async complete(args) {
      const out = reply(args.prompt);
      return typeof out === "string" ? out : JSON.stringify(out);
    },
  };
}

function idFromPrompt(prompt: string): string {
  const m = prompt.match(/\[([A-Za-z0-9]+)\]/);
  return m ? m[1] : "";
}

function passFromPrompt(prompt: string): number {
  const m = prompt.match(/pass (\d) of 2/);
  return m ? Number(m[1]) : 0;
}

async function drain(input: CaseInput, llm: LlmClient): Promise<EngineEvent[]> {
  const events: EngineEvent[] = [];
  for await (const e of runEngine(input, { llm })) events.push(e);
  return events;
}

function resultsById(events: EngineEvent[]): Record<string, CriterionResult> {
  const map: Record<string, CriterionResult> = {};
  for (const e of events) {
    if (e.type === "criterion_resolved") map[e.result.criterion.id] = e.result;
  }
  return map;
}

function packetOf(events: EngineEvent[]): Packet | undefined {
  for (const e of events) if (e.type === "packet_ready") return e.packet;
  return undefined;
}

describe("invariant pass over the aetna-0743 case", () => {
  it("proves the eight supported criteria, leaves C4c a gap, then matches the fixture oracle", async () => {
    const supporting = fakeLlm((prompt) => {
      const id = idFromPrompt(prompt);
      const exp = aetna0743Expectation.expected[id];
      if (exp && exp.verdict === "proven" && exp.citeContains) {
        return { found: true, quote: exp.citeContains, reasoning: `chart supports ${id}` };
      }
      return { found: false, quote: "", reasoning: `no support for ${id}` };
    });

    const events = await drain(aetna0743Case, supporting);
    const map = resultsById(events);
    const packet = packetOf(events);

    expect(packet).toBeDefined();
    if (!packet) throw new Error("no packet");
    expect(packet.provenCount).toBe(8);
    expect(packet.gapCount).toBe(1);
    expect(packet.decision).toBe("action-needed");

    for (const [id, exp] of Object.entries(aetna0743Expectation.expected)) {
      const r = map[id];
      expect(r).toBeDefined();
      expect(r.verdict).toBe(exp.verdict);
      if (exp.verdict === "proven" && exp.citeContains) {
        expect(r.cite).toBeDefined();
        const quote = r.cite ? r.cite.quote : "";
        expect(quote).toContain(exp.citeContains);
        expect(aetna0743Case.chart.includes(quote)).toBe(true);
      }
      if (exp.verdict === "gap" && exp.gapContains) {
        expect(r.gapReason ?? "").toContain(exp.gapContains);
      }
    }

    expect(map["C4c"].verdict).toBe("gap");
  });
});

describe("prove the check can fail (substring-validation gate)", () => {
  const hallucinated = "patient completed active in-person physical therapy twice weekly";
  const realC4cQuote = "a self-directed daily stretching";

  it("rejects a C4c citation that is not in the chart, so C4c stays a gap", async () => {
    expect(aetna0743Case.chart.includes(hallucinated)).toBe(false);

    const liar = fakeLlm((prompt) => {
      const id = idFromPrompt(prompt);
      if (id === "C4c") return { found: true, quote: hallucinated, reasoning: "claims PT" };
      return { found: false, quote: "", reasoning: "n/a" };
    });

    const map = resultsById(await drain(aetna0743Case, liar));
    const c4c = map["C4c"];
    expect(c4c.verdict).toBe("gap");
    for (const pass of c4c.passes) expect(pass.found).toBe(false);
  });

  it("flips to proven when C4c cites a real chart span, so the test is not always red", async () => {
    expect(aetna0743Case.chart.includes(realC4cQuote)).toBe(true);

    const honest = fakeLlm((prompt) => {
      const id = idFromPrompt(prompt);
      if (id === "C4c") return { found: true, quote: realC4cQuote, reasoning: "home routine span" };
      return { found: false, quote: "", reasoning: "n/a" };
    });

    const map = resultsById(await drain(aetna0743Case, honest));
    const c4c = map["C4c"];
    expect(c4c.verdict).toBe("proven");
    expect(c4c.cite).toBeDefined();
    const quote = c4c.cite ? c4c.cite.quote : "";
    expect(quote).toContain("self-directed");
    expect(aetna0743Case.chart.includes(quote)).toBe(true);
  });
});

describe("two independent passes, OR over verbatim-validated reads", () => {
  it("proves a criterion when one pass cites a verbatim span and the other does not", async () => {
    const c1 = aetna0743Case.criteria[0];
    const chart = aetna0743Case.chart;
    const byPass = fakeLlm((prompt) => {
      const p = passFromPrompt(prompt);
      if (p === 1) return { found: true, quote: "isolated to the right", reasoning: "pass 1 found" };
      return { found: false, quote: "", reasoning: "pass 2 not found" };
    });

    const a = await findEvidence(c1, chart, byPass, 1);
    const b = await findEvidence(c1, chart, byPass, 2);
    expect(a.found).toBe(true);
    expect(b.found).toBe(false);

    const r = decide(c1, a, b);
    expect(r.verdict).toBe("proven");
    expect(r.cite).toBeDefined();
    const quote = r.cite ? r.cite.quote : "";
    expect(chart.includes(quote)).toBe(true);
  });

  it("is a gap when neither pass cites a verbatim span", async () => {
    const c1 = aetna0743Case.criteria[0];
    const chart = aetna0743Case.chart;
    const none = fakeLlm(() => ({ found: false, quote: "", reasoning: "nothing" }));
    const a = await findEvidence(c1, chart, none, 1);
    const b = await findEvidence(c1, chart, none, 2);
    const r = decide(c1, a, b);
    expect(r.verdict).toBe("gap");
    expect(r.gapReason ?? "").toContain("Neither independent pass");
  });
});

describe("property: a proven cite is always a verbatim chart substring", () => {
  it("never greens a criterion whose cite is not in the chart", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ maxLength: 160 }),
        fc.array(
          fc.record({ id: fc.string({ minLength: 1, maxLength: 6 }), text: fc.string({ maxLength: 40 }) }),
          { maxLength: 5 },
        ),
        fc.array(fc.boolean(), { minLength: 1, maxLength: 8 }),
        async (chart, rawCriteria, decisions) => {
          const criteria: Criterion[] = rawCriteria.map((c, i) => ({
            id: c.id || `C${i + 1}`,
            text: c.text,
            policySource: "prop",
          }));

          let call = 0;
          const llm = fakeLlm(() => {
            const useReal = decisions[call % decisions.length];
            call++;
            if (useReal && chart.length > 0) {
              return { found: true, quote: chart.slice(0, Math.min(chart.length, 12)), reasoning: "r" };
            }
            // Longer than the chart, so it can never be a substring of it.
            return { found: true, quote: chart + chart + "ZZZ_NOT_IN_CHART", reasoning: "r" };
          });

          const input: CaseInput = {
            caseId: "prop",
            service: "svc",
            policy: { name: "p", payer: "x", url: "https://example.test" },
            criteria,
            chart,
          };

          const events = await drain(input, llm);
          for (const e of events) {
            if (e.type === "criterion_resolved" && e.result.verdict === "proven") {
              expect(e.result.cite).toBeDefined();
              const quote = e.result.cite ? e.result.cite.quote : "";
              expect(chart.includes(quote)).toBe(true);
            }
          }
        },
      ),
      { numRuns: 250 },
    );
  });
});

describe("robustness to garbled model output", () => {
  it("turns empty or non-JSON output into gaps and never throws or errors", async () => {
    const garbled = fakeLlm(() => "this is not valid json {{{ ]][");
    const events = await drain(aetna0743Case, garbled);

    expect(events.some((e) => e.type === "run_error")).toBe(false);
    const packet = packetOf(events);
    expect(packet).toBeDefined();
    if (!packet) throw new Error("no packet");
    expect(packet.provenCount).toBe(0);
    expect(packet.decision).toBe("action-needed");

    const map = resultsById(events);
    for (const id of Object.keys(aetna0743Expectation.expected)) {
      expect(map[id].verdict).toBe("gap");
    }
  });

  it("treats an empty string response as not found", async () => {
    const empty = fakeLlm(() => "");
    const map = resultsById(await drain(aetna0743Case, empty));
    for (const id of Object.keys(aetna0743Expectation.expected)) {
      expect(map[id].verdict).toBe("gap");
    }
  });
});

describe("criteria parsing", () => {
  const neverCalled: LlmClient = {
    provider: "fake",
    model: "x",
    async complete() {
      throw new Error("llm should not be called when criteria are supplied");
    },
  };

  it("uses the supplied criteria as given without calling the model", async () => {
    const out = await parseCriteria(aetna0743Case, neverCalled);
    expect(out).toHaveLength(aetna0743Case.criteria.length);
    expect(out.map((c) => c.id)).toEqual(aetna0743Case.criteria.map((c) => c.id));
  });

  it("returns an empty list on garbled policy output and never throws", async () => {
    const out = await parseCriteriaFromPolicy("some policy text", fakeLlm(() => "not json"));
    expect(out).toEqual([]);
  });

  it("splits a valid JSON list into ordered criteria", async () => {
    const llm = fakeLlm(() => ({
      criteria: [{ text: "First requirement" }, { text: "Second requirement", kind: "imaging" }],
    }));
    const out = await parseCriteriaFromPolicy("raw policy", llm);
    expect(out).toHaveLength(2);
    expect(out[0].id).toBe("C1");
    expect(out[1].id).toBe("C2");
    expect(out[1].kind).toBe("imaging");
  });
});

