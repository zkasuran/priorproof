// One independent evidence pass for one criterion.
//
// The pass asks the injected LLM whether the chart supports this exact criterion
// and, if so, for a single verbatim quote from the chart. The model is never
// trusted: the returned quote is validated against the chart before found stays
// true. A quote that is not present verbatim (whitespace-collapsed matching is
// allowed) forces found=false, so a fabricated citation can never go green.

import type { ChartSpan, Criterion, EvidencePass, LlmClient } from "./types";

const SYSTEM_PASS_1 =
  "You are a prior-authorization reviewer. You read one payer policy criterion plus a patient chart, then decide whether the chart gives direct support for that single criterion. You never invent support. When the chart does not clearly support it you answer not found.";

const SYSTEM_PASS_2 =
  "You are a second independent clinical auditor. Working only from the patient chart, you decide whether the record by itself proves this one policy requirement. You do not assume facts the chart does not state. When the proof is absent you answer not found.";

/** Build the per-pass prompt. The pass number and criterion id are included so a
 *  deterministic test client can answer without a network call. */
function buildEvidencePrompt(
  criterion: Criterion,
  chart: string,
  pass: 1 | 2,
): string {
  return [
    `Independent pass ${pass} of 2.`,
    `Decide if the chart below supports this one criterion.`,
    `Criterion [${criterion.id}]: ${criterion.text}`,
    ``,
    `CHART:`,
    `<<<`,
    chart,
    `>>>`,
    ``,
    `Return only JSON of the form {"found": true, "quote": "<one span copied verbatim from the chart>", "reasoning": "<one or two sentences>"}.`,
    `Copy the quote exactly from the chart. Do not paraphrase. When nothing in the chart supports the criterion, set found to false with an empty quote.`,
  ].join("\n");
}

/** Collapse every run of whitespace to a single space, then trim. */
export function collapseWs(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

/** Parse a model response into a value without ever throwing. Tolerates code
 *  fences and leading or trailing prose by extracting the first JSON object or
 *  array it can find. Returns null when nothing parses. */
export function safeJson(raw: unknown): unknown {
  if (typeof raw !== "string") return null;
  let text = raw.trim();
  if (text.length === 0) return null;
  const fence = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fence && typeof fence[1] === "string") text = fence[1].trim();
  const direct = tryParse(text);
  if (direct !== undefined) return direct;
  const firstObj = text.indexOf("{");
  const lastObj = text.lastIndexOf("}");
  if (firstObj >= 0 && lastObj > firstObj) {
    const obj = tryParse(text.slice(firstObj, lastObj + 1));
    if (obj !== undefined) return obj;
  }
  const firstArr = text.indexOf("[");
  const lastArr = text.lastIndexOf("]");
  if (firstArr >= 0 && lastArr > firstArr) {
    const arr = tryParse(text.slice(firstArr, lastArr + 1));
    if (arr !== undefined) return arr;
  }
  return null;
}

function tryParse(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return undefined;
  }
}

function asRecord(value: unknown): Record<string, unknown> {
  if (value !== null && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return {};
}

function readBool(rec: Record<string, unknown>, key: string): boolean | undefined {
  const x = rec[key];
  return typeof x === "boolean" ? x : undefined;
}

function readString(rec: Record<string, unknown>, key: string): string | undefined {
  const x = rec[key];
  return typeof x === "string" ? x : undefined;
}

/** Build the whitespace-collapsed form of the chart plus an index map back to the
 *  original string. map[i] is the original index of collapsed character i. Each
 *  run of whitespace collapses to one space mapped to the run's first character. */
function collapseWithMap(chart: string): { norm: string; map: number[] } {
  let norm = "";
  const map: number[] = [];
  const n = chart.length;
  let i = 0;
  while (i < n) {
    const ch = chart.charAt(i);
    if (/\s/.test(ch)) {
      const runStart = i;
      while (i < n && /\s/.test(chart.charAt(i))) i++;
      norm += " ";
      map.push(runStart);
    } else {
      norm += ch;
      map.push(i);
      i++;
    }
  }
  return { norm, map };
}

/** Confirm a quote is really in the chart and return the verbatim chart span.
 *  First tries a plain substring. If that fails it tries a whitespace-collapsed
 *  match, then maps the match back to the exact chart slice so the returned
 *  quote is always a verbatim substring of the chart. Returns null when the
 *  quote is not present, which is how a hallucinated citation is rejected. */
export function findVerbatimSpan(chart: string, rawQuote: unknown): ChartSpan | null {
  if (typeof rawQuote !== "string") return null;
  const quote = rawQuote.trim();
  if (quote.length === 0) return null;

  const direct = chart.indexOf(quote);
  if (direct >= 0) return { quote, offset: direct };

  const needle = collapseWs(quote);
  if (needle.length === 0) return null;
  const { norm, map } = collapseWithMap(chart);
  const at = norm.indexOf(needle);
  if (at < 0) return null;
  const start = map[at];
  const lastNormIdx = at + needle.length - 1;
  const lastOrig = map[lastNormIdx];
  if (typeof start !== "number" || typeof lastOrig !== "number") return null;
  const end = lastOrig + 1;
  const slice = chart.slice(start, end);
  if (slice.length === 0 || chart.indexOf(slice) < 0) return null;
  return { quote: slice, offset: start };
}

/** Best-effort section header for a cited span. Scans backward for the nearest
 *  all-caps heading line. Optional and never throws. */
function sectionFor(chart: string, offset: number | undefined): string | undefined {
  if (typeof offset !== "number" || offset < 0) return undefined;
  const before = chart.slice(0, offset);
  const lines = before.split("\n");
  for (let i = lines.length - 1; i >= 0; i--) {
    const line = (lines[i] ?? "").trim();
    if (line.length >= 3 && /^[A-Z][A-Z /&-]+$/.test(line)) return line;
  }
  return undefined;
}

/** Run one independent evidence pass. Asks the LLM, then validates the quote
 *  against the chart. A quote that is not a verbatim chart span forces
 *  found=false so a fabricated citation never counts as support. */
export async function findEvidence(
  criterion: Criterion,
  chart: string,
  llm: LlmClient,
  pass: 1 | 2,
): Promise<EvidencePass> {
  const system = pass === 1 ? SYSTEM_PASS_1 : SYSTEM_PASS_2;
  const prompt = buildEvidencePrompt(criterion, chart, pass);
  // 1024 leaves room for a reasoning model's <think> block plus the JSON answer.
  const raw = await llm.complete({ system, prompt, json: true, maxTokens: 1024 });

  const rec = asRecord(safeJson(raw));
  const claimedFound = readBool(rec, "found") ?? readBool(rec, "supported") ?? false;
  const quoteRaw = readString(rec, "quote");
  const reasoning = readString(rec, "reasoning") ?? "";

  if (!claimedFound || quoteRaw === undefined || quoteRaw.trim().length === 0) {
    return {
      pass,
      found: false,
      reasoning: reasoning || `Pass ${pass} found no supporting span in the chart.`,
    };
  }

  const span = findVerbatimSpan(chart, quoteRaw);
  if (!span) {
    return {
      pass,
      found: false,
      reasoning: `Pass ${pass} rejected a quote that is not present verbatim in the chart. Treated as not found.`,
    };
  }

  const section = sectionFor(chart, span.offset);
  const cite: ChartSpan = section ? { ...span, section } : span;
  return {
    pass,
    found: true,
    cite,
    reasoning: reasoning || `Pass ${pass} cited a verbatim chart span supporting ${criterion.id}.`,
  };
}
