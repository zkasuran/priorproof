import Link from "next/link";
import { counts, caseList, DEFAULT_CASE_ID } from "@/components/case-data";

export const metadata = { title: "Metrics" };

export default function MetricsPage() {
  const c = counts(DEFAULT_CASE_ID);
  const cases = caseList().length;
  return (
    <>
      <section className="container">
        <div className="pagehead">
          <span className="eyebrow">Reports</span>
          <h1>Metrics</h1>
          <p className="lead">
            Numbers measured on the synthetic demo case, labelled as measured.
            Where a figure is not earned yet, this page says so instead of
            inventing one.
          </p>
        </div>
      </section>

      <section className="container section">
        <div className="shead">
          <h2>The number that matters.</h2>
          <p>
            Across the demo run, no criterion turned green without a cited span.
            That is the whole product in one figure.
          </p>
        </div>
        <div className="stat">
          <span className="statNum statNum--proven">0</span>
          <p className="statLabel">ungrounded greens</p>
          <p className="statNote">
            every proven criterion points at a span in the chart
          </p>
        </div>
      </section>

      <section className="container section">
        <div className="shead">
          <h2>Measured on the demo case</h2>
          <p>Aetna CPB 0743, synthetic chart.</p>
        </div>
        <div className="grid grid-4">
          <div className="stat">
            <span className="statNum">{c.total}</span>
            <p className="statLabel">criteria evaluated</p>
          </div>
          <div className="stat">
            <span className="statNum statNum--proven">{c.proven}</span>
            <p className="statLabel">proven with a cite</p>
          </div>
          <div className="stat">
            <span className="statNum statNum--gap">{c.gap}</span>
            <p className="statLabel">named gap</p>
          </div>
          <div className="stat">
            <span className="statNum">{cases}</span>
            <p className="statLabel">case in the library</p>
          </div>
        </div>
      </section>

      <section className="container section">
        <div className="shead">
          <h2>Not yet measured</h2>
          <p>These need more than one case before a number means anything.</p>
        </div>
        <dl className="facts">
          <div>
            <dt>Precision and recall</dt>
            <dd>
              Placeholder, not yet measured. One case cannot support an accuracy
              rate. Added once the library grows.
            </dd>
          </div>
          <div>
            <dt>Cross-payer coverage</dt>
            <dd>
              Placeholder, not yet measured. The library holds a single payer
              today.
            </dd>
          </div>
          <div>
            <dt>Reviewer time saved</dt>
            <dd>Placeholder, not yet measured. Needs a human study to claim.</dd>
          </div>
        </dl>
        <div className="btnrow mt24">
          <Link href="/reports/validation" className="btn">
            How it is checked
          </Link>
          <Link href="/reports/limits" className="btn">
            Honesty and limits
          </Link>
        </div>
      </section>
    </>
  );
}
