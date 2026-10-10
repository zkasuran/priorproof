// Parse a case into the ordered criteria the engine resolves.
//
// Two entry points. parseCriteria is what the engine calls: a fixture arrives
// already decomposed into criteria, so it uses them as given. parseCriteriaFromPolicy
// is the general path for raw policy text with no criteria supplied; it asks the
// LLM to split the text into ordered Criterion objects and validates the shape
// without ever throwing on junk model output.

import type { CaseInput, Criterion, LlmClient } from "./types";
import { safeJson } from "./evidence";

/** Return the ordered criteria for a case. When the case is pre-parsed (every
 *  fixture is) its criteria are used as given. An empty list yields an empty
 *  result, since a CaseInput carries no raw policy text to parse here. */
export async function parseCriteria(
  input: CaseInput,
  llm: LlmClient,
): Promise<Criterion[]> {
  void llm;
  if (Array.isArray(input.criteria) && input.criteria.length > 0) {
    return input.criteria.map((c) => ({ ...c }));
  }
  return [];
}

function toRecordArray(value: unknown): Record<string, unknown>[] {
  const arr = Array.isArray(value)
    ? value
    : value !== null && typeof value === "object" && Array.isArray((value as Record<string, unknown>).criteria)
      ? ((value as Record<string, unknown>).criteria as unknown[])
      : [];
  const out: Record<string, unknown>[] = [];
  for (const item of arr) {
    if (item !== null && typeof item === "object" && !Array.isArray(item)) {
      out.push(item as Record<string, unknown>);
    }
  }
  return out;
}

function str(rec: Record<string, unknown>, key: string): string | undefined {
  const x = rec[key];
  return typeof x === "string" && x.trim().length > 0 ? x : undefined;
}

/** Split raw policy text into ordered criteria using the LLM. Used only when a
 *  case supplies no criteria. Never throws: a model error or garbled output
 *  yields an empty list rather than a crash. */
export async function parseCriteriaFromPolicy(
  policyText: string,
  llm: LlmClient,
): Promise<Criterion[]> {
  if (typeof policyText !== "string" || policyText.trim().length === 0) return [];

  const system =
    "You convert a payer medical-necessity policy into an ordered list of atomic criteria. Each criterion is one testable requirement. Keep the policy wording. Do not merge two requirements into one.";
  const prompt = [
    `POLICY TEXT:`,
    `<<<`,
    policyText,
    `>>>`,
    ``,
    `Return only JSON of the form {"criteria":[{"text":"<policy wording>","group":"<optional>","kind":"<optional>","policySource":"<optional>"}]}.`,
    `Keep the original order. One requirement per entry.`,
  ].join("\n");

  let raw: string;
  try {
    raw = await llm.complete({ system, prompt, json: true, maxTokens: 2000 });
  } catch {
    return [];
  }

  const items = toRecordArray(safeJson(raw));
  const out: Criterion[] = [];
  for (const item of items) {
    const text = typeof item.text === "string" ? item.text.trim() : "";
    if (text.length === 0) continue;
    const criterion: Criterion = {
      id: str(item, "id") ?? `C${out.length + 1}`,
      text,
      policySource: str(item, "policySource") ?? "parsed from policy text",
    };
    const group = str(item, "group");
    if (group) criterion.group = group;
    const kind = str(item, "kind");
    if (kind) criterion.kind = kind;
    out.push(criterion);
  }
  return out;
}
