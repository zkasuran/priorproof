import Link from "next/link";
import { notFound } from "next/navigation";
import StatusChip from "@/components/StatusChip";
import { getCase, criteriaView, counts } from "@/components/case-data";

const SLUG_RE = /^[a-z0-9-]{1,64}$/;

function safeCase(slug: string) {
  if (!SLUG_RE.test(slug)) return null;
  try {
    return getCase(slug);
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const input = safeCase(slug);
  return { title: input ? input.policy.payer + " policy" : "Policy" };
}

export default async function PolicyPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const input = safeCase(slug);
  if (!input) notFound();

  const rows = criteriaView(slug);
  const c = counts(slug);
  const groups: { name: string; items: typeof rows }[] = [];
  for (const r of rows) {
    const name = r.group ?? "Criteria";
    const g = groups.find((x) => x.name === name);
    if (g) g.items.push(r);
    else groups.push({ name, items: [r] });
  }

  return (
    <>
      <section className="container">
        <div className="pagehead">
          <span className="eyebrow">{input.policy.payer} policy</span>
          <h1>{input.policy.name}</h1>
          <p className="lead">{input.service}</p>
        </div>
      </section>

      <section className="container section">
        <dl className="facts">
          <div>
            <dt>Payer</dt>
            <dd>{input.policy.payer}</dd>
          </div>
          <div>
            <dt>Criteria</dt>
            <dd>
              {c.total} total, {c.proven} proven and {c.gap} gap on the demo chart
            </dd>
          </div>
          <div>
            <dt>Retrieved</dt>
            <dd>{input.policy.retrieved ?? "not recorded"}</dd>
          </div>
          <div>
            <dt>Source</dt>
            <dd>
              <a
                className="link"
                href={input.policy.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                Read the public policy
              </a>
            </dd>
          </div>
        </dl>
        <div className="banner mt16">
          <span className="banner__dot" aria-hidden="true" />
          <span>
            Verdicts shown are the labelled result on the synthetic demo chart.{" "}
            <strong>No PHI.</strong>
          </span>
        </div>
      </section>

      {groups.map((g) => (
        <section key={g.name} className="container section">
          <div className="shead">
            <h2>{g.name}</h2>
          </div>
          <div className="grid grid-2">
            {g.items.map((r) => (
              <article key={r.id} className="card flow">
                <div className="btnrow">
                  <span className="badge mono">{r.id}</span>
                  {r.kind ? <span className="badge">{r.kind}</span> : null}
                  <StatusChip state={r.state} />
                </div>
                <p className="small">{r.text}</p>
                <p className="micro muted">{r.policySource}</p>
              </article>
            ))}
          </div>
        </section>
      ))}

      <section className="container section">
        <div className="btnrow">
          <Link href="/policies" className="btn">
            Back to the library
          </Link>
          <Link href="/demo" className="btn btn--primary">
            Run the demo
          </Link>
        </div>
      </section>
    </>
  );
}
