// View data derived from the fixtures. Imports the public policy and the labelled
// oracle (synthetic, no PHI) and shapes it for the marketing and reports pages.
// It reads the fixtures, it never edits them.

import {
  DEFAULT_CASE_ID,
  listCases,
  loadCase,
  loadExpectation,
} from "@/lib/fixtures";
import type { ProofRow } from "./ProofGrid";

export { DEFAULT_CASE_ID };

export function caseList() {
  return listCases();
}

export function getCase(caseId: string) {
  return loadCase(caseId);
}

/** One row per criterion with its labelled verdict and the span (or the miss). */
export function proofRows(caseId: string = DEFAULT_CASE_ID): ProofRow[] {
  const input = loadCase(caseId);
  const exp = loadExpectation(caseId);
  return input.criteria.map((c) => {
    const e = exp.expected[c.id];
    const state = e?.verdict ?? "pending";
    const note =
      state === "proven"
        ? e?.citeContains
          ? `“${e.citeContains}”`
          : "a span in the chart"
        : e?.gapContains
          ? `Required: ${e.gapContains}. No chart span supports it.`
          : "No chart span supports this criterion.";
    return { id: c.id, group: c.group, text: c.text, state, note };
  });
}

export function counts(caseId: string = DEFAULT_CASE_ID) {
  const rows = proofRows(caseId);
  return {
    total: rows.length,
    proven: rows.filter((r) => r.state === "proven").length,
    gap: rows.filter((r) => r.state === "gap").length,
  };
}

export interface CriterionView {
  id: string;
  group?: string;
  kind?: string;
  policySource: string;
  text: string;
  state: ProofRow["state"];
  note: string;
}

/** Full per-criterion view with the labelled verdict, grouped-ready. */
export function criteriaView(caseId: string = DEFAULT_CASE_ID): CriterionView[] {
  const input = loadCase(caseId);
  const rows = proofRows(caseId);
  const byId = new Map(rows.map((r) => [r.id, r]));
  return input.criteria.map((c) => {
    const r = byId.get(c.id);
    return {
      id: c.id,
      group: c.group,
      kind: c.kind,
      policySource: c.policySource,
      text: c.text,
      state: r?.state ?? "pending",
      note: r?.note ?? "",
    };
  });
}

/** Proven and gap lists shaped for the packet preview. */
export function packetData(caseId: string = DEFAULT_CASE_ID) {
  const input = loadCase(caseId);
  const exp = loadExpectation(caseId);
  const proven: { id: string; text: string }[] = [];
  const gaps: { id: string; text: string; fix: string }[] = [];
  for (const c of input.criteria) {
    const e = exp.expected[c.id];
    if (e?.verdict === "gap") {
      gaps.push({
        id: c.id,
        text: c.text,
        fix: e.gapContains
          ? `Add documentation of ${e.gapContains} (PT notes or member claims), then re-run.`
          : "Add the missing documentation to the chart, then re-run.",
      });
    } else {
      proven.push({ id: c.id, text: c.text });
    }
  }
  return { service: input.service, policyName: input.policy.name, proven, gaps };
}
