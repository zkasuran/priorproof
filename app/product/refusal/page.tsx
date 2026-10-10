import Link from "next/link";
import CodeSample from "@/components/CodeSample";

export const metadata = { title: "Refusal by design" };

const VERDICT = `/** Prove-or-refuse. There is deliberately no third "approved" verdict. */
export type Verdict = "proven" | "gap";`;

export default function RefusalPage() {
  return (
    <>
      <section className="container">
        <div className="pagehead">
          <span className="eyebrow">Product</span>
          <h1>Refusal by design</h1>
          <p className="lead">
            The product is defined by what it refuses to do. It will not green a
            criterion it cannot cite, even when the rest of the chart looks strong.
          </p>
        </div>
      </section>

      <section className="container section">
        <div className="shead">
          <h2>Two verdicts, by construction.</h2>
          <p>
            The type that every result compiles against has no approved state. A
            criterion is proven or it is a gap. There is nowhere for a hopeful
            green to live.
          </p>
        </div>
        <CodeSample label="lib/engine/types.ts" code={VERDICT} note="verbatim" />
      </section>

      <section className="container section">
        <div className="shead">
          <h2>How a green is earned</h2>
        </div>
        <div className="grid grid-3">
          <div className="card">
            <h3>Pass one</h3>
            <p>Read the policy, then look for the span in the chart that meets it.</p>
          </div>
          <div className="card">
            <h3>Pass two</h3>
            <p>
              Read the chart independently, then check it back against the policy.
            </p>
          </div>
          <div className="card">
            <h3>Agreement</h3>
            <p>
              Only when both passes land on the same span does the row turn green.
              Disagreement is a gap.
            </p>
          </div>
        </div>
      </section>

      <section className="container section">
        <div className="shead">
          <h2>Proven to fail safe</h2>
          <p>
            An adversarial test feeds a chart with one requirement removed and
            asserts the row stays red. We mutate the engine to confirm the test can
            fail, so a passing test means the refusal is real, not an accident.
          </p>
        </div>
        <div className="banner">
          <span className="banner__dot" aria-hidden="true" />
          <span>
            A check that cannot fail proves nothing. The refusal path is tested the
            same way the proof path is.
          </span>
        </div>
        <div className="btnrow mt24">
          <Link href="/reports/validation" className="btn btn--primary">
            See the validation
          </Link>
          <Link href="/reports/methodology" className="btn">
            Read the methodology
          </Link>
        </div>
      </section>
    </>
  );
}
