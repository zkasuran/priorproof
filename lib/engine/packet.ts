// Assemble the submission-ready packet from the resolved criteria.
//
// The decision is binary and conservative: any gap at all means action-needed.
// The cover letter leads with the gaps as an action list so the reader sees what
// to fix first, then lists each proven criterion with the span that proves it.

import type { CaseInput, CriterionResult, Packet } from "./types";

function buildCoverLetter(
  input: CaseInput,
  results: CriterionResult[],
  provenCount: number,
  gapCount: number,
  decision: "ready" | "action-needed",
): string {
  const lines: string[] = [];
  lines.push("PriorProof coverage summary");
  lines.push(`Service: ${input.service}`);
  lines.push(`Policy: ${input.policy.name} (${input.policy.payer})`);
  lines.push(
    `Decision: ${decision === "action-needed" ? "ACTION NEEDED before submission" : "READY to submit"}`,
  );
  lines.push(`Criteria proven: ${provenCount} of ${results.length}. Gaps: ${gapCount}.`);
  lines.push("");

  const gaps = results.filter((r) => r.verdict === "gap");
  lines.push("Action list (resolve each gap before submission):");
  if (gaps.length === 0) {
    lines.push("  None. Every criterion is proven against a cited span in the chart.");
  } else {
    gaps.forEach((r, idx) => {
      lines.push(`  ${idx + 1}. [${r.criterion.id}] ${r.gapReason ?? "Not supported by the chart."}`);
    });
  }
  lines.push("");

  const proven = results.filter((r) => r.verdict === "proven");
  lines.push("Proven criteria with citations:");
  if (proven.length === 0) {
    lines.push("  None yet.");
  } else {
    for (const r of proven) {
      const quote = r.cite ? r.cite.quote : "";
      const section = r.cite && r.cite.section ? ` (section: ${r.cite.section})` : "";
      lines.push(`  [${r.criterion.id}] ${r.criterion.text}`);
      lines.push(`      cited: "${quote}"${section}`);
    }
  }

  return lines.join("\n");
}

/** Build the packet. decision is action-needed whenever any criterion is a gap. */
export function assemble(input: CaseInput, results: CriterionResult[]): Packet {
  const provenCount = results.filter((r) => r.verdict === "proven").length;
  const gapCount = results.filter((r) => r.verdict === "gap").length;
  const decision: "ready" | "action-needed" = gapCount > 0 ? "action-needed" : "ready";
  const coverLetter = buildCoverLetter(input, results, provenCount, gapCount, decision);
  return {
    caseId: input.caseId,
    service: input.service,
    policy: input.policy,
    results,
    provenCount,
    gapCount,
    decision,
    coverLetter,
  };
}
