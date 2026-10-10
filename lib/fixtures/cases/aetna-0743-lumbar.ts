// Aetna CPB 0743 lumbar laminotomy / microdiscectomy demo case.
//
// Policy criteria are quoted verbatim from the public bulletin (whitespace only
// normalised). Verify against the live policy before a submission run, since a
// payer can revise the wording:
//   https://www.aetna.com/cpb/medical/data/700_799/0743.html
//
// The chart satisfies eight of nine criteria. The one gap is C4c: the policy
// requires active in-person physical therapy for the full duration confirmed by
// PT notes or claims, and the chart documents only a self-directed home routine.

import type {
  CaseInput,
  CaseExpectation,
  Criterion,
  PolicyRef,
} from "@/lib/engine/types";
import { aetna0743Chart } from "./aetna-0743-chart";

const policy: PolicyRef = {
  name: "Aetna CPB 0743: Spinal Surgery (Laminectomy and Fusion), lumbar laminectomy for a herniated disc",
  payer: "Aetna",
  url: "https://www.aetna.com/cpb/medical/data/700_799/0743.html",
  retrieved: "2026-10-10",
};

const criteria: Criterion[] = [
  {
    id: "C1",
    group: "Primary",
    kind: "ruling-out",
    policySource: "CPB 0743, criterion 1",
    text: "All other reasonable sources of pain and/or neurological deficit have been ruled out, including but not limited to significant pathology at other spinal level(s) on the advanced imaging radiology report that is/are not part of the surgical request resulting in incomplete surgical planning",
  },
  {
    id: "C2",
    group: "Primary",
    kind: "clinical-findings",
    policySource: "CPB 0743, criterion 2",
    text: "Member has signs or symptoms of neural compression (radiculopathy, neurogenic extremity claudication, myelopathy) associated with the levels being treated",
  },
  {
    id: "C3",
    group: "Primary",
    kind: "imaging",
    policySource: "CPB 0743, criterion 3",
    text: "Advanced imaging studies (CT or MRI) indicate central/lateral recess or foraminal stenosis (graded as moderate, moderate to severe or severe; not mild or mild to moderate), or nerve root or spinal cord compression, at the level corresponding with the clinical findings",
  },
  {
    id: "C4a",
    group: "Conservative therapy",
    kind: "duration",
    policySource: "CPB 0743, criterion 4 + Footnote 1",
    text: "Member has failed at least 6 weeks of conservative therapy",
  },
  {
    id: "C4b",
    group: "Conservative therapy",
    kind: "recency",
    policySource: "CPB 0743, Footnote 1",
    text: "Conservative measures were recent (within the past year)",
  },
  {
    id: "C4c",
    group: "Conservative therapy",
    kind: "step-therapy",
    policySource: "CPB 0743, Footnote 1",
    text: "Active in-person physical therapy (not home or virtual) for the entire required duration, confirmed by the actual PT notes or by documentation in the member claims history",
  },
  {
    id: "C4d",
    group: "Conservative therapy",
    kind: "medication",
    policySource: "CPB 0743, Footnote 1",
    text: "Trial of medications (NSAIDs, acetaminophen, or tricyclic antidepressants)",
  },
  {
    id: "C4e",
    group: "Conservative therapy",
    kind: "education",
    policySource: "CPB 0743, Footnote 1",
    text: "Patient education provided",
  },
  {
    id: "C5",
    group: "Primary",
    kind: "function",
    policySource: "CPB 0743, criterion 5",
    text: "Member's activities of daily living are limited by symptoms of neural compression",
  },
];

export const aetna0743Case: CaseInput = {
  caseId: "aetna-0743-lumbar",
  service: "Right L5-S1 lumbar laminotomy with microdiscectomy (CPT 63030)",
  policy,
  criteria,
  chart: aetna0743Chart,
};

export const aetna0743Expectation: CaseExpectation = {
  caseId: "aetna-0743-lumbar",
  expected: {
    C1: { verdict: "proven", citeContains: "isolated to the right" },
    C2: { verdict: "proven", citeContains: "positive right straight-leg raise" },
    C3: { verdict: "proven", citeContains: "moderate-to-severe right lateral recess narrowing" },
    C4a: { verdict: "proven", citeContains: "past 10 weeks" },
    C4b: { verdict: "proven", citeContains: "July to September 2026" },
    C4c: { verdict: "gap", gapContains: "in-person physical therapy" },
    C4d: { verdict: "proven", citeContains: "naproxen 500 mg" },
    C4e: { verdict: "proven", citeContains: "written lumbar self-care education" },
    C5: { verdict: "proven", citeContains: "unable to work his delivery-driver shifts" },
  },
};
