import Link from "next/link";
import ProofGrid from "@/components/ProofGrid";
import { proofRows, counts, DEFAULT_CASE_ID } from "@/components/case-data";

export const metadata = { title: "Validation" };

export default function ValidationPage() {
  const rows = proofRows(DEFAULT_CASE_ID);
  const c = counts(DEFAULT_CASE_ID);
  return (
    <>
      <section className="container">
        <div className="pagehead">
          <span className="eyebrow">Reports</span>
          <h1>Validation</h1>
          <p className="lead">
            The expected result is written down as a labelled oracle and the tests
            assert the engine matches it on every criterion.
          </p>
        </div>
      </section>

      <section className="container section">
        <div className="shead">
          <h2>The labelled oracle</h2>
          <p>
            For the demo case, each criterion has an expected verdict and the span
            or miss that justifies it. {c.proven} proven, {c.gap} gap. Synthetic
            data.
          </p>
        </div>
        <ProofGrid rows={rows} />
      </section>

      <section className="container section">
        <div className="shead">
          <h2>The adversarial test</h2>
          <p>
            The gap is not an accident of the chart. It is asserted.
          </p>
        </div>
        <div className="grid grid-2">
          <div className="card">
            <h3>Hold the red</h3>
            <p>
              A test feeds a chart with the in-person therapy evidence removed and
              asserts that criterion stays a gap. A green there would fail the
              suite.
            </p>
          </div>
          <div className="card">
            <h3>Prove the test can fail</h3>
            <p>
              We mutate the engine to green the gap and confirm the test turns red.
              A check that cannot fail is not a check.
            </p>
          </div>
        </div>
        <div className="banner mt16">
          <span className="banner__dot" aria-hidden="true" />
          <span>
            Oracle values are the labelled expectations in the fixtures, measured
            against the synthetic chart. They are not a clinical judgement.
          </span>
        </div>
        <div className="btnrow mt24">
          <Link href="/reports/methodology" className="btn">
            The method
          </Link>
          <Link href="/reports/limits" className="btn">
            Honesty and limits
          </Link>
        </div>
      </section>
    </>
  );
}
