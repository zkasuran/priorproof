import Link from "next/link";

export const metadata = { title: "Methodology" };

export default function MethodologyPage() {
  return (
    <>
      <section className="container">
        <div className="pagehead">
          <span className="eyebrow">Reports</span>
          <h1>Methodology</h1>
          <p className="lead">
            How a criterion earns a green. Two independent passes, one shared span,
            and no verdict in between.
          </p>
        </div>
      </section>

      <section className="container section">
        <div className="shead">
          <h2>Four steps per case</h2>
          <p>The engine parses once, then checks every criterion twice.</p>
        </div>
        <div className="grid grid-2">
          <div className="card">
            <h3>1. Parse the policy</h3>
            <p>
              Split the payer policy into discrete criteria, each with its own id
              and source line.
            </p>
          </div>
          <div className="card">
            <h3>2. Policy to record</h3>
            <p>
              Take each criterion and search the chart for a span that meets it.
              Record the quote.
            </p>
          </div>
          <div className="card">
            <h3>3. Record to policy</h3>
            <p>
              Read the chart independently and check the span back against the
              criterion it claims to satisfy.
            </p>
          </div>
          <div className="card">
            <h3>4. Resolve</h3>
            <p>
              Green only when both passes agree on the same span. Otherwise the row
              is a gap.
            </p>
          </div>
        </div>
      </section>

      <section className="container section">
        <div className="shead">
          <h2>Why two directions</h2>
          <p>
            A single pass can talk itself into a weak match. Checking from both
            sides means a green survives being read against the policy and against
            the record, not just one of them.
          </p>
        </div>
        <ul className="plist">
          <li>
            Agreement is on the span, not the verdict. Both passes must land on the
            same quote, so a green is traceable to one piece of text.
          </li>
          <li>
            Both passes are kept on the result for the audit trail, including the
            reasoning for a not-found.
          </li>
          <li>
            A disagreement is never split down the middle. It is a gap and the gap
            names what is missing.
          </li>
        </ul>
        <div className="btnrow mt24">
          <Link href="/developers/engine" className="btn">
            The type contract
          </Link>
          <Link href="/reports/validation" className="btn btn--primary">
            See the validation
          </Link>
        </div>
      </section>
    </>
  );
}
