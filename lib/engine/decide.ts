// Resolve one criterion from its two independent evidence passes.
//
// The honesty guarantee lives here: a criterion is `proven` only when a pass
// carries a real cited span. findEvidence has already validated that any
// found pass holds a verbatim chart quote. So every green points at words that
// are literally in the chart. There is deliberately no third verdict.
//
// Two independent passes read the chart. A criterion is proven when at least one
// pass can cite a verbatim span that satisfies it; the rationale records whether
// one or both passes landed, so the second read is visible, not decorative. When
// neither pass can cite a span, the criterion is returned as a named gap. This OR
// over two verbatim-validated reads is deliberate: requiring both passes to agree
// on the same span flaked genuinely supported criteria to false gaps, while the
// per-pass verbatim check, not the agreement, is what guards against a fabricated
// citation.

import type { ChartSpan, Criterion, CriterionResult, EvidencePass } from "./types";
import { collapseWs } from "./evidence";

const MAX = Number.MAX_SAFE_INTEGER;

/** Two spans agree when the text is identical, one contains the other or their
 *  chart offsets overlap. Used only to word the rationale, never to gate. */
function spansAgree(a: ChartSpan, b: ChartSpan): boolean {
  const na = collapseWs(a.quote);
  const nb = collapseWs(b.quote);
  if (na.length === 0 || nb.length === 0) return false;
  if (na === nb || na.includes(nb) || nb.includes(na)) return true;  if (typeof a.offset === "number" && typeof b.offset === "number") {
    return a.offset < b.offset + b.quote.length && b.offset < a.offset + a.quote.length;
  }
  return false;
}

/** The cited span a pass carries, else undefined when it found nothing usable. */
function usable(pass: EvidencePass): ChartSpan | undefined {
  if (!pass.found) return undefined;
  const cite = pass.cite;
  if (!cite || typeof cite.quote !== "string" || cite.quote.trim().length === 0) {
    return undefined;
  }
  return cite;
}

/** Earliest span by chart offset, for a deterministic citation choice. */
function earliest(spans: ChartSpan[]): ChartSpan {
  return spans.reduce((best, c) => {
    const bo = typeof best.offset === "number" ? best.offset : MAX;
    const co = typeof c.offset === "number" ? c.offset : MAX;
    return co < bo ? c : best;
  });
}

/** Resolve a criterion. Proven when at least one pass cites a verbatim span. */
export function decide(
  criterion: Criterion,
  passA: EvidencePass,
  passB: EvidencePass,
): CriterionResult {
  const passes: EvidencePass[] = [passA, passB];
  const aCite = usable(passA);
  const bCite = usable(passB);
  const found = [aCite, bCite].filter((c): c is ChartSpan => c !== undefined);

  if (found.length > 0) {
    const cite = earliest(found);
    let rationale: string;
    if (aCite && bCite) {
      rationale = spansAgree(aCite, bCite)
        ? `Proven. Both independent passes cited an agreeing verbatim span in the chart: "${cite.quote}".`
        : `Proven. Both independent passes cited a verbatim span in the chart; the cited quote is "${cite.quote}".`;
    } else {
      rationale = `Proven on a single cited span: one independent pass cited a verbatim quote in the chart, "${cite.quote}". The other pass did not.`;
    }
    return { criterion, verdict: "proven", passes, cite, rationale };
  }

  const req = criterion.text.trim();
  return {
    criterion,
    verdict: "gap",
    passes,
    gapReason: `Neither independent pass could cite a verbatim span in the chart that satisfies: ${req}. Fix: add one explicit, dated chart entry that states this in the record so a verbatim quote can be cited.`,
    rationale: "Gap. No independent pass could cite a verbatim span that satisfies this requirement.",
  };
}
