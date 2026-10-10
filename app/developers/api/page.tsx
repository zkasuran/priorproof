import Link from "next/link";
import CodeSample from "@/components/CodeSample";

export const metadata = { title: "API" };

const SEQUENCE = `event: run_start
data: {"caseId":"aetna-0743-lumbar","service":"..."}

event: criteria_parsed
data: {"criteria":[{"id":"C1","text":"..."}, ...]}

event: evidence
data: {"id":"C1","pass":1,"found":true,"cite":{"quote":"..."}}

event: criterion_resolved
data: {"result":{"criterion":{"id":"C1"},"verdict":"proven","cite":{"quote":"..."}}}

event: packet_ready
data: {"packet":{"provenCount":8,"gapCount":1,"decision":"action-needed"}}`;

const EVENTS: { name: string; desc: string }[] = [
  { name: "run_start", desc: "The run began, with the case and policy reference." },
  { name: "criteria_parsed", desc: "The policy split into its criteria." },
  { name: "criterion_start", desc: "Work began on one criterion." },
  { name: "evidence", desc: "One pass reported found or not-found, with its span." },
  { name: "criterion_resolved", desc: "The criterion settled as proven or gap." },
  { name: "packet_ready", desc: "The assembled packet, with the counts and decision." },
  { name: "run_error", desc: "The run failed, with a message. No silent pass." },
];

export default function ApiPage() {
  return (
    <>
      <section className="container">
        <div className="pagehead">
          <span className="eyebrow">Developers</span>
          <h1>The event protocol</h1>
          <p className="lead">
            A run is a stream of typed events. The run route emits them as
            Server-Sent Events so the coverage matrix can fill in live.
          </p>
        </div>
      </section>

      <section className="container section">
        <div className="shead">
          <h2>Seven event types</h2>
          <p>Every event in the stream is one of these. The shapes are fixed by the type contract.</p>
        </div>
        <dl className="facts">
          {EVENTS.map((e) => (
            <div key={e.name}>
              <dt className="mono">{e.name}</dt>
              <dd>{e.desc}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="container section">
        <div className="shead">
          <h2>A run, as it streams</h2>
          <p>An illustrative sequence. Field values are trimmed for readability.</p>
        </div>
        <CodeSample label="GET the run route (text/event-stream)" code={SEQUENCE} />
        <div className="btnrow mt24">
          <Link href="/developers/engine" className="btn">
            The type contract
          </Link>
          <Link href="/developers/integration" className="btn">
            Call it from code
          </Link>
        </div>
      </section>
    </>
  );
}
