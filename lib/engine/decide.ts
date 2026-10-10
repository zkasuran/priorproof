// Resolve one criterion from its two independent evidence passes.
//
// The product invariant lives here. A criterion is proven only when both passes
// found support, each carries a real cited span, with the two spans in
// agreement. The substring validation that proves a span is real already happened in
// findEvidence, so a found pass always carries a verbatim chart quote. Anything
// short of full agreement is a gap with a named reason and the one line that
// would fix it. There is deliberately no third verdict.

import type { ChartSpan, Criterion, CriterionResult, EvidencePass } from "./types";
import { collapseWs } from "./evidence";

/** Two spans agree when the text is identical, when one contains the other or
 *  when their chart offsets overlap. */
function spansAgree(a: ChartSpan, b: ChartSpan): boolean {
  const na = collapseWs(a.quote);
  const nb = collapseWs(b.quote);
  if (na.length === 0 || nb.length === 0) return false;
  if (na === nb) return true;
  if (na.includes(nb) || nb.includes(na)) return true;
  if (typeof a.offset === "number" && typeof b.offset === "number") {
    const aEnd = a.offset + a.quote.length;
    const bEnd = b.offset + b.quote.length;
    return a.offset < bEnd && b.offset < aEnd;
  }
  return false;
}

/** Pick the earlier span as the result citation, for a deterministic choice. */
function chooseCite(a: ChartSpan, b: ChartSpan): ChartSpan {
  const ao = typeof a.offset === "number" ? a.offset : Number.MAX_SAFE_INTEGER;
  const bo = typeof b.offset === "number" ? b.offset : Number.MAX_SAFE_INTEGER;
  return ao <= bo ? a : b;
}

function usable(pass: EvidencePass): ChartSpan | undefined {
  if (!pass.found) return undefined;
  const cite = pass.cite;
  if (!cite || typeof cite.quote !== "string" || cite.quote.trim().length === 0) {
    return undefined;
  }
  return cite;
}

function buildGapReason(
  criterion: Criterion,
  aOk: boolean,
  bOk: boolean,
): string {
  const req = criterion.text.trim();
  if (!aOk && !bOk) {
    return `No span in the chart supports this requirement: ${req}. Fix: add one explicit, dated chart entry that states it in the record so a verbatim quote can be cited.`;
  }
  if (aOk !== bOk) {
    return `Only one of the two independent passes found support for: ${req}. Fix: add one unambiguous chart line both passes can cite, since a single pass is not enough to prove it.`;
  }
  return `The two passes cited different spans that do not overlap for: ${req}. Fix: add one explicit chart line stating this requirement so both passes agree on the same quote.`;
}

function gapRationale(aOk: boolean, bOk: boolean): string {
  if (!aOk && !bOk) return "Gap. No supporting span was found in the chart.";
  if (aOk !== bOk) return "Gap. The two independent passes disagreed.";
  return "Gap. The two passes did not agree on one span.";
}

/** Resolve a criterion. Proven only on full agreement over a real cited span. */
export function decide(
  criterion: Criterion,
  passA: EvidencePass,
  passB: EvidencePass,
): CriterionResult {
  const passes: EvidencePass[] = [passA, passB];
  const aCite = usable(passA);
  const bCite = usable(passB);
  const aOk = aCite !== undefined;
  const bOk = bCite !== undefined;

  if (aCite && bCite && spansAgree(aCite, bCite)) {
    const cite = chooseCite(aCite, bCite);
    return {
      criterion,
      verdict: "proven",
      passes,
      cite,
      rationale: `Proven. Both independent passes cited an agreeing verbatim span in the chart: "${cite.quote}".`,
    };
  }

  return {
    criterion,
    verdict: "gap",
    passes,
    gapReason: buildGapReason(criterion, aOk, bOk),
    rationale: gapRationale(aOk, bOk),
  };
}
