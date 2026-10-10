// POST /api/run streams one engine run as Server-Sent Events.
//
// The browser posts { caseId, runId? }. We build the trace sink and the LLM
// client, load the case, then forward every EngineEvent the engine yields as its
// own SSE frame so the coverage matrix fills live. A heartbeat keeps the
// connection open through quiet stretches. When the generator ends we flush the
// trace and send a final `done` frame with the trace snapshot, then close. Any
// throw becomes a single `error` frame so the client never sees a dead stream.

import { runEngine } from "@/lib/engine";
import { getLlmClient } from "@/lib/llm/client";
import { createTrace } from "@/lib/trace";
import { loadCase, DEFAULT_CASE_ID } from "@/lib/fixtures";
import { encodeEvent, SSE_HEARTBEAT } from "@/lib/sse";

// Cache Components (next.config cacheComponents) removes `dynamic`, `revalidate`
// and `fetchCache`. `runtime` and `maxDuration` stay valid route config. This
// handler is dynamic by nature since it reads the request body then streams.
export const runtime = "nodejs";
export const maxDuration = 300;

const HEARTBEAT_MS = 15_000;
const MAX_CRITERIA = 12;

function errorMessage(err: unknown): string {
  if (err instanceof Error && err.message) return err.message;
  if (typeof err === "string" && err) return err;
  return "run failed";
}

export async function POST(request: Request): Promise<Response> {
  let caseId = DEFAULT_CASE_ID;
  let runId: string | undefined;
  try {
    const body: unknown = await request.json();
    if (body && typeof body === "object") {
      const b = body as Record<string, unknown>;
      if (typeof b.caseId === "string" && b.caseId.trim()) caseId = b.caseId.trim();
      if (typeof b.runId === "string" && b.runId.trim()) runId = b.runId.trim();
    }
  } catch {
    // No body or invalid JSON. Fall back to the default case.
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      let closed = false;
      const send = (frame: string) => {
        if (closed) return;
        try {
          controller.enqueue(encoder.encode(frame));
        } catch {
          closed = true;
        }
      };
      const heartbeat = setInterval(() => send(SSE_HEARTBEAT), HEARTBEAT_MS);

      const trace = createTrace(runId ? { runId, caseId } : { caseId });
      try {
        const llm = getLlmClient();
        const input = loadCase(caseId);
        for await (const event of runEngine(input, {
          llm,
          trace: trace.sink,
          maxCriteria: MAX_CRITERIA,
        })) {
          send(encodeEvent(event.type, event));
        }
        await trace.flush();
        send(
          encodeEvent("done", {
            runId: runId ?? null,
            // The committed trace contract surfaces spans only, no dashboard URL.
            // When the trace build adds one it rides here and the client links it.
            dashboardUrl: null,
            trace: trace.snapshot(),
          }),
        );
      } catch (err) {
        // Best effort flush so a partial run still records its spans.
        try {
          await trace.flush();
        } catch {
          // ignore a flush failure during error teardown
        }
        send(encodeEvent("error", { message: errorMessage(err) }));
      } finally {
        clearInterval(heartbeat);
        if (!closed) {
          try {
            controller.close();
          } catch {
            // already closed
          }
        }
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
