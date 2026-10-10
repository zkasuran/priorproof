import Link from "next/link";
import ProofGrid from "@/components/ProofGrid";
import {
  caseList,
  getCase,
  proofRows,
  counts,
  DEFAULT_CASE_ID,
} from "@/components/case-data";

export const metadata = { title: "Policy library" };

export default function PoliciesPage() {
  const cases = caseList();
  const rows = proofRows(DEFAULT_CASE_ID);
  const c = counts(DEFAULT_CASE_ID);

  return (
    <>
      <section className="container">
        <div className="pagehead">
          <span className="eyebrow">Policies</span>
          <h1>Policy library</h1>
          <p className="lead">
            Real public payer policies, decomposed into the criteria the engine
            checks. Each one links back to the source you can read yourself.
          </p>
        </div>
      </section>

      <section className="container section">
        {cases.length === 0 ? (
          <div className="banner">
            <span className="banner__dot" aria-hidden="true" />
            <span>No policies loaded yet. The library is empty.</span>
          </div>
        ) : (
          <div className="grid grid-2">
            {cases.map((cs) => {
              const policy = getCase(cs.caseId).policy;
              return (
                <article key={cs.caseId} className="card flow">
                  <span className="badge">{policy.payer}</span>
                  <h3>
                    <Link href={`/policies/${cs.caseId}`} className="link">
                      {policy.name}
                    </Link>
                  </h3>
                  <p className="muted small">{cs.service}</p>
                  <p className="small">
                    <strong>{cs.criteriaCount}</strong> criteria checked
                  </p>
                  <div className="btnrow">
                    <Link href={`/policies/${cs.caseId}`} className="btn btn--sm">
                      View criteria
                    </Link>
                    <a
                      className="btn btn--sm"
                      href={policy.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Public source
                    </a>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      <section className="container section" id="coverage">
        <div className="shead">
          <span className="eyebrow">Coverage map</span>
          <h2>
            {c.proven} of {c.total} proven on the demo chart.
          </h2>
          <p>
            How the current demo chart scores against the Aetna CPB 0743 criteria.
            Measured on synthetic data.
          </p>
        </div>
        <ProofGrid rows={rows} />
      </section>
    </>
  );
}
