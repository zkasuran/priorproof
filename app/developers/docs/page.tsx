import Link from "next/link";
import CodeSample from "@/components/CodeSample";

export const metadata = { title: "Docs" };

const QUICKSTART = `pnpm install
pnpm dev        # http://localhost:3000

pnpm typecheck  # tsc --noEmit
pnpm lint
pnpm build`;

export default function DocsPage() {
  return (
    <>
      <section className="container">
        <div className="pagehead">
          <span className="eyebrow">Developers</span>
          <h1>Docs</h1>
          <p className="lead">
            Everything to run PriorProof locally and read how it is put together.
          </p>
        </div>
      </section>

      <section className="container section">
        <div className="shead">
          <h2>Run it locally</h2>
          <p>Node and pnpm, then the usual scripts.</p>
        </div>
        <CodeSample label="terminal" code={QUICKSTART} />
        <div className="banner mt16">
          <span className="banner__dot" aria-hidden="true" />
          <span>
            The trace writes to a local store with or without a provider key, so
            the demo always runs offline.
          </span>
        </div>
      </section>

      <section className="container section">
        <div className="shead">
          <h2>The stack</h2>
        </div>
        <div className="grid grid-3">
          <div className="card">
            <h3>Next 16, React 19</h3>
            <p>App Router, server components, a per-request nonce CSP.</p>
          </div>
          <div className="card">
            <h3>TypeScript, strict</h3>
            <p>The engine contract is pure types the whole app compiles against.</p>
          </div>
          <div className="card">
            <h3>Hand-authored CSS</h3>
            <p>A token system keyed on the theme, no utility framework.</p>
          </div>
        </div>
      </section>

      <section className="container section">
        <div className="shead">
          <h2>Read on</h2>
        </div>
        <div className="grid grid-4">
          <Link href="/developers/integration" className="card">
            <h3>Integration</h3>
            <p>Drive the engine from code.</p>
          </Link>
          <Link href="/developers/api" className="card">
            <h3>API</h3>
            <p>The streamed event protocol.</p>
          </Link>
          <Link href="/developers/engine" className="card">
            <h3>Engine</h3>
            <p>The shared type contract.</p>
          </Link>
          <Link href="/reports/methodology" className="card">
            <h3>Methodology</h3>
            <p>How the two passes work.</p>
          </Link>
        </div>
      </section>
    </>
  );
}
