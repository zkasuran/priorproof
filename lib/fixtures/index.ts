// Fixture loader. The policy + synthetic chart cases live under ./cases.
// Everything here is public policy text plus synthetic (no-PHI) charts.

import type { CaseInput, CaseExpectation } from "@/lib/engine/types";
import { aetna0743Case, aetna0743Expectation } from "./cases/aetna-0743-lumbar";

export interface CaseEntry {
  input: CaseInput;
  expectation: CaseExpectation;
}

const CASES: Record<string, CaseEntry> = {
  [aetna0743Case.caseId]: {
    input: aetna0743Case,
    expectation: aetna0743Expectation,
  },
};

export const DEFAULT_CASE_ID = aetna0743Case.caseId;

export function listCases(): {
  caseId: string;
  service: string;
  policy: string;
  criteriaCount: number;
}[] {
  return Object.values(CASES).map((c) => ({
    caseId: c.input.caseId,
    service: c.input.service,
    policy: c.input.policy.name,
    criteriaCount: c.input.criteria.length,
  }));
}

export function loadCase(caseId: string): CaseInput {
  const entry = CASES[caseId];
  if (!entry) throw new Error(`unknown case: ${caseId}`);
  return entry.input;
}

export function loadExpectation(caseId: string): CaseExpectation {
  const entry = CASES[caseId];
  if (!entry) throw new Error(`unknown case: ${caseId}`);
  return entry.expectation;
}
