import Link from "next/link";
import CodeSample from "@/components/CodeSample";

export const metadata = { title: "Engine" };

const TYPES = `export type Verdict = "proven" | "gap";

export interface CriterionResult {
  criterion: Criterion;
  verdict: Verdict;
  passes: EvidencePass[];
  // Present if and only if proven: the span both passes agreed on.
  cite?: ChartSpan;
  // Present if and only if gap: what is missing and the one line that fixes it.
  gapReason?: string;
  rationale: string;
}`;

export default function EnginePage() {
  return (
    <>
      <section className="container">
        <div className="pagehead">
          <span className="eyebrow">Developers</span>
          <h1>The type contract</h1>
          <p className="lead">
            The invariant is not a convention, it is a type. Every module compiles
            against a shape where a green cannot exist without a span.
          </p>
        </div>
      </section>

      <section className="container section">
        <div className="shead">
          <h2>Two verdicts, a cite, a reason</h2>
          <p>
            A result is proven with a cited span or a gap with a reason. There is
            no field for an approval that skips the chart.
          </p>
        </div>
        <CodeSample label="lib/engine/types.ts" code={TYPES} />
      </section>

      <section className="container section">
        <div className="shead">
          <h2>What the shape guarantees</h2>
        </div>
        <div className="grid grid-3">
          <div className="card">
            <h3>No third verdict</h3>
            <p>Verdict is proven or gap. Nothing else type-checks.</p>
          </div>
          <div className="card">
            <h3>A cite rides every green</h3>
            <p>
              The span both passes agreed on travels on the result, so a reviewer
              can follow it.
            </p>
          </div>
          <div className="card">
            <h3>A reason rides every gap</h3>
            <p>
              A gap carries what is missing, so the output is a to-do, not a dead
              end.
            </p>
          </div>
        </div>
        <div className="btnrow mt24">
          <Link href="/developers/integration" className="btn">
            Call the engine
          </Link>
          <Link href="/reports/methodology" className="btn">
            The method behind it
          </Link>
        </div>
      </section>
    </>
  );
}
