import Link from "next/link";
import PacketPreview from "@/components/PacketPreview";
import { packetData, counts, DEFAULT_CASE_ID } from "@/components/case-data";

export const metadata = { title: "The packet" };

export default function PacketPage() {
  const data = packetData(DEFAULT_CASE_ID);
  const c = counts(DEFAULT_CASE_ID);
  return (
    <>
      <section className="container">
        <div className="pagehead">
          <span className="eyebrow">Product</span>
          <h1>The submission packet</h1>
          <p className="lead">
            One document a reviewer can act on: what is proven, what is missing,
            and the single line that closes each gap.
          </p>
        </div>
      </section>

      <section className="container section">
        <div className="shead">
          <h2>Ready or action needed. Never a maybe.</h2>
          <p>
            A packet is marked action needed the moment any criterion is a gap, so
            nothing goes out half-supported. Below is the shape of the packet on
            the synthetic demo case.
          </p>
        </div>
        <PacketPreview
          service={data.service}
          policyName={data.policyName}
          provenCount={c.proven}
          gapCount={c.gap}
          proven={data.proven}
          gaps={data.gaps}
        />
      </section>

      <section className="container section">
        <div className="shead">
          <h2>What the packet carries</h2>
        </div>
        <div className="grid grid-3">
          <div className="card">
            <h3>The decision</h3>
            <p>Ready when every criterion is proven, action needed otherwise.</p>
          </div>
          <div className="card">
            <h3>The proven list</h3>
            <p>Each criterion beside the chart span that supports it.</p>
          </div>
          <div className="card">
            <h3>The gap list</h3>
            <p>What is required, what is missing and how to close it.</p>
          </div>
        </div>
        <div className="btnrow mt24">
          <Link href="/product/matrix" className="btn">
            Back to the matrix
          </Link>
          <Link href="/product/refusal" className="btn">
            Why it refuses
          </Link>
        </div>
      </section>
    </>
  );
}
