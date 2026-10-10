import Link from "next/link";
import { getCase, DEFAULT_CASE_ID } from "@/components/case-data";

export const metadata = { title: "Honesty and limits" };

export default function LimitsPage() {
  const policy = getCase(DEFAULT_CASE_ID).policy;
  return (
    <>
      <section className="container">
        <div className="pagehead">
          <span className="eyebrow">Reports</span>
          <h1>Honesty and limits</h1>
          <p className="lead">
            PriorProof decides whether a chart supports a policy criterion. It does
            not decide whether care is appropriate. Here is where the line sits.
          </p>
        </div>
      </section>

      <section className="container section">
        <div className="shead">
          <h2>What this is not</h2>
        </div>
        <div className="grid grid-3">
          <div className="card">
            <h3>Not a clinical decision</h3>
            <p>
              It checks documentation against policy wording. It does not judge the
              medicine and it is not medical advice.
            </p>
          </div>
          <div className="card">
            <h3>Not a payer ruling</h3>
            <p>
              A proven packet is well-documented, not pre-approved. The payer still
              decides.
            </p>
          </div>
          <div className="card">
            <h3>Not a PHI system</h3>
            <p>
              The demo reads synthetic charts only. Running real records is out of
              scope here.
            </p>
          </div>
        </div>
      </section>

      <section className="container section">
        <div className="shead">
          <h2>What to keep in mind</h2>
        </div>
        <ul className="plist">
          <li>
            A policy is only as current as the day it was read. The demo policy was
            retrieved on <strong>{policy.retrieved ?? "an unrecorded date"}</strong>,
            and payers revise wording.
          </li>
          <li>
            The chart is synthetic. Numbers on this site are measured on that one
            case, never generalised to a claimed accuracy.
          </li>
          <li>
            The library holds a single case today. Treat it as a demonstration of
            the method, not a benchmark.
          </li>
          <li>
            A human reviews and submits. The cited span is there so a person can
            check the engine, not take it on faith.
          </li>
        </ul>
        <div className="banner mt16">
          <span className="banner__dot" aria-hidden="true" />
          <span>
            The guardrail is the citation. If a reviewer cannot follow a green back
            to a span in the chart, that green should not stand.
          </span>
        </div>
        <div className="btnrow mt24">
          <Link href="/reports/metrics" className="btn">
            Back to metrics
          </Link>
          <Link href="/demo" className="btn btn--primary">
            Run the demo
          </Link>
        </div>
      </section>
    </>
  );
}
