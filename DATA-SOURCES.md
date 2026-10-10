<!-- SPDX-License-Identifier: LicenseRef-zkasuran-SAND-1.0 -->
# Data sources and their grants

Every external input to PriorProof, with the clause it is used under. A source whose
grant cannot be quoted is flagged, not quietly used.

## 1. Aetna CPB 0743 (payer medical-necessity policy)

- **What:** the criteria of Aetna Clinical Policy Bulletin 0743, used as public
  reference text to decompose into medical-necessity criteria for the demo case.
- **Where:** https://www.aetna.com/cpb/medical/data/700_799/0743.html , quoted in
  `lib/fixtures/cases/aetna-0743-lumbar.ts`.
- **Grant:** FLAGGED. Aetna publishes its Clinical Policy Bulletins to the public web
  at the URL above. Aetna does not offer an open-content or reuse licence for them, so
  there is no permissive grant to quote. PriorProof links to the live bulletin, quotes
  short criterion excerpts as factual reference with attribution. It does not mirror
  or redistribute the full policy. The use rests on short-excerpt quotation of
  publicly posted factual policy with attribution, not on a licence from Aetna.
- **Obligation we meet:** attribution to Aetna with a live link, a pinned retrieval
  date in the fixture and no full-text copy. Payer policy changes, so the wording is
  re-checked against the live bulletin before a submission run.

## 2. Synthetic patient chart

- **What:** the fictional clinical note the demo runs against.
- **Where:** `lib/fixtures/cases/aetna-0743-chart.ts`.
- **Grant:** ours, full rights. Authored by zkasuran for PriorProof. The patient,
  provider, facility, dates and member id are invented. It contains no PHI and no
  third-party text, so no outside rights attach. It is covered by this repository's
  `LICENSE` (SAND-1.0).

## 3. Mandatory stack (neatlogs, Entire, cfo.ai)

- **neatlogs (npm package `neatlogs`, pinned 1.1.26):** licence **MIT** (from the
  package's own `package.json`). MIT grants, in its own words, permission "to deal in
  the Software without restriction, including without limitation the rights to use,
  copy, modify, merge, publish, distribute". We consume it as a pinned dependency and
  keep its MIT licence and copyright notice. The hosted neatlogs service is used under
  its own terms of service with our account key, which is read server-side only.
- **Entire (dev-time coding-session and checkpoint service):** FLAGGED, used under the
  service's terms of service through our account, not under an open licence. No Entire
  code ships in this repository. The submission links a build checkpoint. We do not
  redistribute Entire. Its terms of service are not reproduced here.
- **cfo.ai (business and financial service):** FLAGGED, used under the service's terms
  of service through our account, not under an open licence. No cfo.ai code or dataset
  ships in this repository. Only figures we compute are used, with the source named.
  Its terms of service are not reproduced here.

## 4. npm dependencies

Each dependency keeps its own upstream licence. We consume them as pinned dependencies
and do not relicense them. The repository `LICENSE` covers our own source only, which
its Definitions section states ("Files authored by others ... keep the licence their
own author gave them"). Direct dependencies and their licences, read from each
package's own metadata:

| Package | Version | Licence |
|---|---|---|
| next | 16.4.0 | MIT |
| react | 19.3.0 | MIT |
| react-dom | 19.3.0 | MIT |
| openai | 7.31.0 | Apache-2.0 |
| @anthropic-ai/sdk | 0.132.1 | MIT |
| neatlogs | 1.1.26 | MIT |
| zod | 4.6.5 | MIT |
| eslint (dev) | ^9 | MIT |
| typescript (dev) | ^5 | Apache-2.0 |
| vitest (dev) | 5.0.3 | MIT |
| fast-check (dev) | 4.10.2 | MIT |
| tsx (dev) | 4.23.15 | MIT |

Apache-2.0 (openai, typescript) requires the licence and notices to travel with any
redistribution. We do not redistribute these packages; they are installed from the
registry and locked in `pnpm-lock.yaml`.

## 5. Starter template assets

- **What:** the placeholder SVGs and icon from the create-next-app scaffold
  (`public/next.svg`, `public/vercel.svg`, `public/file.svg`, `public/globe.svg`,
  `public/window.svg`, `app/favicon.ico`).
- **Grant:** the create-next-app template ships under the Next.js **MIT** licence. The
  Next.js and Vercel wordmarks within those SVGs are Vercel's marks. These are
  placeholders and should be replaced with PriorProof's own assets before submission.
- **Flag:** branded wordmarks are not ours. Replace rather than rebrand.

## 6. LLM outputs at runtime

- **What:** the OpenAI or Anthropic hosted model called by `lib/llm/client.ts` at
  runtime to read the chart and draft rationales.
- **Grant:** generated per call under the provider's API terms, through our own API
  key. No provider dataset or model weight ships in this repository. Keys are
  server-side env only. Outputs are the product's own working text.

## Flagged (no quotable open-licence grant)

- **Aetna CPB 0743** (section 1): public policy text, no open licence, used by
  short-excerpt quotation with attribution and a link, full text not mirrored.
- **Entire** and **cfo.ai** (section 3): used under each service's terms of service
  through our account, not under an open licence. No code of theirs ships here.
