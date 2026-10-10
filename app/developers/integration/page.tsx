import Link from "next/link";
import CodeSample from "@/components/CodeSample";

export const metadata = { title: "Integration" };

const SNIPPET = `import { runEngine } from "@/lib/engine";
import { getLlmClient } from "@/lib/llm/client";
import { createTrace } from "@/lib/trace";
import { loadCase } from "@/lib/fixtures";

const input = loadCase("aetna-0743-lumbar");
const trace = createTrace({ caseId: input.caseId });

for await (const event of runEngine(input, {
  llm: getLlmClient(),
  trace: trace.sink,
})) {
  if (event.type === "criterion_resolved") {
    const { criterion, verdict, cite } = event.result;
    console.log(criterion.id, verdict, cite?.quote ?? "no span");
  }
}

await trace.flush();`;

export default function IntegrationPage() {
  return (
    <>
      <section className="container">
        <div className="pagehead">
          <span className="eyebrow">Developers</span>
          <h1>Integration</h1>
          <p className="lead">
            The engine is an async generator. Hand it a case and its dependencies,
            then read events as each criterion resolves.
          </p>
        </div>
      </section>

      <section className="container section">
        <div className="shead">
          <h2>Run a case in a dozen lines</h2>
          <p>
            Dependencies are injected, so the engine never reads an env var or
            touches the network itself.
          </p>
        </div>
        <CodeSample label="run-a-case.ts" code={SNIPPET} />
      </section>

      <section className="container section">
        <div className="shead">
          <h2>Three seams</h2>
        </div>
        <div className="grid grid-3">
          <div className="card">
            <h3>Inject the model</h3>
            <p>
              Pass any client that satisfies the LlmClient interface. The engine is
              provider-agnostic.
            </p>
          </div>
          <div className="card">
            <h3>Inject the trace</h3>
            <p>
              Give it a trace sink and every span is recorded. Leave it out and the
              run still works.
            </p>
          </div>
          <div className="card">
            <h3>Stream the events</h3>
            <p>
              Consume the generator directly on the server or forward the events
              to the browser.
            </p>
          </div>
        </div>
        <div className="btnrow mt24">
          <Link href="/developers/api" className="btn">
            The event protocol
          </Link>
          <Link href="/developers/engine" className="btn">
            The type contract
          </Link>
        </div>
      </section>
    </>
  );
}
