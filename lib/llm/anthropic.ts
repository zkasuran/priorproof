// Anthropic adapter for the engine's LlmClient contract. Server-only.
//
// The API key is read in client.ts and passed in here, never from this module
// and never from a NEXT_PUBLIC var. This file holds no secret of its own and
// logs nothing. On any failure it surfaces a short message with the provider
// and the HTTP status, never the key or the raw request.
import Anthropic from "@anthropic-ai/sdk";
import type { LlmClient } from "@/lib/engine/types";

const DEFAULT_MODEL = "claude-haiku-4-5";
const DEFAULT_MAX_TOKENS = 4096;
const TIMEOUT_MS = 30_000;

/** Thrown by withTimeout when our own deadline fires, so the catch can tell a
 * timeout apart from a caller cancel or a real API error. */
class TimeoutError extends Error {}

/**
 * Run `fn` with a signal that aborts on either the caller's signal or a local
 * deadline, whichever comes first. The timer is always cleared and the caller
 * listener always removed, so no handle leaks on success or failure.
 */
async function withTimeout<T>(
  signal: AbortSignal | undefined,
  timeoutMs: number,
  fn: (merged: AbortSignal) => Promise<T>,
): Promise<T> {
  const controller = new AbortController();
  let timedOut = false;
  const onAbort = () => controller.abort();
  if (signal) {
    if (signal.aborted) controller.abort();
    else signal.addEventListener("abort", onAbort, { once: true });
  }
  const timer: ReturnType<typeof setTimeout> = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, timeoutMs);
  try {
    return await fn(controller.signal);
  } catch (err) {
    if (timedOut) throw new TimeoutError();
    throw err;
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener("abort", onAbort);
  }
}

/** Turn any thrown value into a clean Error that carries no secret. */
function cleanError(err: unknown, callerSignal: AbortSignal | undefined): Error {
  if (err instanceof TimeoutError) {
    return new Error(`anthropic request timed out after ${TIMEOUT_MS}ms`);
  }
  if (callerSignal?.aborted) {
    return err instanceof Error ? err : new Error("anthropic request aborted");
  }
  const status = (err as { status?: unknown })?.status;
  if (typeof status === "number") {
    return new Error(`anthropic API error (status ${status})`);
  }
  const detail = err instanceof Error ? err.message : "unknown error";
  return new Error(`anthropic API error: ${detail}`);
}

/**
 * Pull the JSON value out of a text reply. Anthropic has no native JSON mode, so
 * the model is asked for JSON in the system message and may still wrap it in a
 * code fence or a line of prose. This strips a fence, then slices to the
 * outermost braces or brackets. If nothing JSON-shaped is found the trimmed text
 * is returned so the parse error upstream shows the real content.
 */
function extractJson(text: string): string {
  let s = text.trim();
  const fence = s.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
  if (fence) s = fence[1].trim();
  const starts = [s.indexOf("{"), s.indexOf("[")].filter((i) => i >= 0);
  if (starts.length === 0) return s;
  const start = Math.min(...starts);
  const end = Math.max(s.lastIndexOf("}"), s.lastIndexOf("]"));
  return end > start ? s.slice(start, end + 1).trim() : s;
}

/** Build an LlmClient backed by the Anthropic Messages API. */
export function createAnthropicClient(apiKey: string): LlmClient {
  const model = process.env.ANTHROPIC_MODEL || DEFAULT_MODEL;
  const client = new Anthropic({ apiKey });

  return {
    provider: "anthropic",
    model,
    async complete(args) {
      const system = args.json
        ? `${args.system}\n\nRespond with a single valid JSON object and nothing else. No prose, no code fence.`
        : args.system;

      let message;
      try {
        message = await withTimeout(args.signal, TIMEOUT_MS, (merged) =>
          client.messages.create(
            {
              model,
              max_tokens: args.maxTokens ?? DEFAULT_MAX_TOKENS,
              system,
              messages: [{ role: "user", content: args.prompt }],
            },
            { signal: merged },
          ),
        );
      } catch (err) {
        throw cleanError(err, args.signal);
      }

      let text = "";
      for (const block of message.content) {
        if (block.type === "text") text += block.text;
      }
      if (text.length === 0) {
        throw new Error("anthropic returned an empty response");
      }
      return args.json ? extractJson(text) : text;
    },
  };
}
