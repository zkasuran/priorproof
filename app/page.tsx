import Link from "next/link";
import HeroDemo from "@/components/HeroDemo";
import { counts, DEFAULT_CASE_ID } from "@/components/case-data";
import styles from "./page.module.css";

export default function Home() {
  const c = counts(DEFAULT_CASE_ID);
  return (
    <>
      <section className={`container ${styles.hero}`}>
        <div className={styles.heroGrid}>
          <div className={styles.copy}>
            <span className="eyebrow">Prior authorization, proven</span>
            <h1>Prove every prior-auth criterion or return it as a named gap.</h1>
            <p className={styles.sub}>
              PriorProof reads a payer policy against a patient chart and greens a
              criterion only when a real span in the chart backs it.
            </p>
            <div className={`btnrow ${styles.cta}`}>
              <Link href="/demo" className="btn btn--primary">
                Run the demo
              </Link>
              <Link href="/product/matrix" className="btn">
                See the coverage matrix
              </Link>
            </div>
            <p className={`trust ${styles.heroTrust}`}>
              No PHI.<span className="dot" aria-hidden="true" />Real public
              policies.<span className="dot" aria-hidden="true" />Synthetic charts
              only.
            </p>
          </div>
          <div className={styles.demoCol}>
            <HeroDemo />
          </div>
        </div>
      </section>

      <section className="container section">
        <div className="shead">
          <span className="eyebrow">The invariant</span>
          <h2>A green row always points at the words that earned it.</h2>
          <p>
            Two independent passes read the chart. A green always carries the
            verbatim span one of them cited. Anything the chart cannot support
            comes back red, named, with the one line that would fix it.
          </p>
        </div>
        <div className="grid grid-3">
          <div className="card">
            <h3>Two reads, one cited span</h3>
            <p>
              Policy to record and record to policy. A criterion is proven only
              when a pass can cite the exact span that proves it.
            </p>
          </div>
          <div className="card">
            <h3>Cite or refuse</h3>
            <p>
              There is no third approved verdict. If no span supports it, the row
              stays red. The engine never greens what it cannot cite.
            </p>
          </div>
          <div className="card">
            <h3>Gaps you can act on</h3>
            <p>
              Each gap names what is missing and the document that closes it, so a
              submission goes out complete or not at all.
            </p>
          </div>
        </div>
      </section>

      <section className="container section">
        <div className="shead">
          <span className="eyebrow">On the demo case</span>
          <h2>Aetna CPB 0743, nine criteria, one honest gap.</h2>
          <p>
            Measured on the synthetic demo chart. The counts below are the labelled
            result, not a projection.
          </p>
        </div>
        <div className="grid grid-3">
          <div className="stat">
            <span className="statNum statNum--proven">{c.proven}</span>
            <p className="statLabel">proven, each with a cited span</p>
            <p className="statNote">of {c.total} criteria</p>
          </div>
          <div className="stat">
            <span className="statNum statNum--gap">{c.gap}</span>
            <p className="statLabel">named gap, returned red</p>
            <p className="statNote">active in-person physical therapy</p>
          </div>
          <div className="stat">
            <span className="statNum">0</span>
            <p className="statLabel">ungrounded greens</p>
            <p className="statNote">every proven row cites the chart</p>
          </div>
        </div>
        <div className={`btnrow mt24`}>
          <Link href="/product/packet" className="btn">
            See the packet
          </Link>
          <Link href="/reports/validation" className="btn">
            Read the validation
          </Link>
        </div>
      </section>

      <section className="container section">
        <div className="shead">
          <span className="eyebrow">Built to be checked</span>
          <h2>Nothing here asks for your trust on faith.</h2>
          <p>
            The policy is public, the chart is synthetic and the method is written
            down. Follow any claim back to its source.
          </p>
        </div>
        <div className="grid grid-4">
          <Link href="/policies" className="card">
            <h3>Policy library</h3>
            <p>The real public payer policy, with its source link.</p>
          </Link>
          <Link href="/charts" className="card">
            <h3>Synthetic charts</h3>
            <p>The no-PHI patient record the demo reads.</p>
          </Link>
          <Link href="/reports/methodology" className="card">
            <h3>Methodology</h3>
            <p>How the two passes reach agreement.</p>
          </Link>
          <Link href="/reports/limits" className="card">
            <h3>Honesty and limits</h3>
            <p>What this is and what it is not.</p>
          </Link>
        </div>
      </section>
    </>
  );
}
