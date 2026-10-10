import Link from "next/link";
import ProofGrid from "@/components/ProofGrid";
import { proofRows, counts, DEFAULT_CASE_ID } from "@/components/case-data";

export const metadata = { title: "Coverage matrix" };

export default function MatrixPage() {
  const rows = proofRows(DEFAULT_CASE_ID);
  const c = counts(DEFAULT_CASE_ID);
  return (
    <>
      <section className="container">
        <div className="pagehead">
          <span className="eyebrow">Product</span>
          <h1>The coverage matrix</h1>
          <p className="lead">
            Every medical-necessity criterion resolved to one of two states:
            proven against a cited span or a named gap. Nothing sits in between.
          </p>
        </div>
      </section>

      <section className="container section">
        <div className="shead">
          <h2>
            {c.proven} proven, {c.gap} gap, on the Aetna CPB 0743 demo case.
          </h2>
          <p>
            Each row carries the exact span that earned a green or the exact thing
            the chart is missing. This view is the labelled result on the synthetic
            demo chart.
          </p>
        </div>
        <ProofGrid rows={rows} />
      </section>

      <section className="container section">
        <div className="shead">
          <h2>How to read a row</h2>
        </div>
        <div className="grid grid-3">
          <div className="card">
            <h3>The criterion</h3>
            <p>The payer policy wording, kept verbatim with its id.</p>
          </div>
          <div className="card">
            <h3>The verdict</h3>
            <p>
              Proven or gap, carried by a word and a glyph, never by colour alone.
            </p>
          </div>
          <div className="card">
            <h3>The evidence</h3>
            <p>
              The cited span for a green or what is required and missing for a
              gap.
            </p>
          </div>
        </div>
        <div className="btnrow mt24">
          <Link href="/demo" className="btn btn--primary">
            Run the demo
          </Link>
          <Link href="/product/packet" className="btn">
            See the packet
          </Link>
        </div>
      </section>
    </>
  );
}
