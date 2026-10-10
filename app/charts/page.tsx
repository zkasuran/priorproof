import Link from "next/link";
import CodeSample from "@/components/CodeSample";
import { getCase, DEFAULT_CASE_ID } from "@/components/case-data";

export const metadata = { title: "Synthetic charts" };

export default function ChartsPage() {
  const input = getCase(DEFAULT_CASE_ID);
  return (
    <>
      <section className="container">
        <div className="pagehead">
          <span className="eyebrow">Policies</span>
          <h1>Synthetic charts</h1>
          <p className="lead">
            Every patient record the product reads is fictional. No PHI touches
            PriorProof, in the demo or anywhere else.
          </p>
        </div>
      </section>

      <section className="container section">
        <div className="banner">
          <span className="banner__dot" aria-hidden="true" />
          <span>
            <strong>Synthetic.</strong> Fictional patient, provider, facility and
            dates. Written to satisfy most criteria and leave exactly one gap.
          </span>
        </div>
        <div className="mt16">
          <CodeSample
            label={`${input.caseId} chart`}
            note="synthetic, no PHI"
            code={input.chart}
          />
        </div>
      </section>

      <section className="container section">
        <div className="shead">
          <h2>Why the chart is synthetic</h2>
        </div>
        <div className="grid grid-3">
          <div className="card">
            <h3>No PHI by design</h3>
            <p>
              A demo that reads real records is a liability. This one cannot, so
              there is nothing to leak.
            </p>
          </div>
          <div className="card">
            <h3>One honest gap</h3>
            <p>
              The chart is built to prove eight criteria and miss one, so the
              refusal is visible rather than hypothetical.
            </p>
          </div>
          <div className="card">
            <h3>Swap in your own</h3>
            <p>
              The engine takes any policy and chart pair. The fixture is a starting
              point, not a limit.
            </p>
          </div>
        </div>
        <div className="btnrow mt24">
          <Link href="/policies" className="btn">
            See the policy
          </Link>
          <Link href="/demo" className="btn btn--primary">
            Run the demo
          </Link>
        </div>
      </section>
    </>
  );
}
