// OpenAI adapter for the engine's LlmClient contract. Server-only.
//
// The API key is read in client.ts and passed in here, never from this module
// and never from a NEXT_PUBLIC var. This file holds no secret of its own and
// logs nothing. On any failure it surfaces a short message with the provider
// and the HTTP status, never the key or the raw request.
import OpenAI from "openai";
import type { LlmClient } from "@/lib/engine/types";

const DEFAULT_MODEL = "gpt-4o-mini";
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
    return new Error(`openai request timed out after ${TIMEOUT_MS}ms`);
  }
  if (callerSignal?.aborted) {
    return err instanceof Error ? err : new Error("openai request aborted");
  }
  const status = (err as { status?: unknown })?.status;
  if (typeof status === "number") {
    return new Error(`openai API error (status ${status})`);
  }
  const detail = err instanceof Error ? err.message : "unknown error";
  return new Error(`openai API error: ${detail}`);
}

/** Build an LlmClient backed by the OpenAI chat completions API, or any
 * OpenAI-compatible endpoint via OPENAI_BASE_URL (for example MiniMax). */
export function createOpenAiClient(apiKey: string): LlmClient {
  const model = process.env.OPENAI_MODEL || DEFAULT_MODEL;
  const baseURL = process.env.OPENAI_BASE_URL || undefined;
  const client = new OpenAI({ apiKey, baseURL });

  return {
    provider: "openai",
    model,
    async complete(args) {
      // json_object mode requires the word JSON in the input, so name it in the
      // system message. This also keeps the instruction visible to the model.
      const system = args.json
        ? `${args.system}\n\nRespond with a single valid JSON object and nothing else.`
        : args.system;

      let completion;
      try {
        completion = await withTimeout(args.signal, TIMEOUT_MS, (merged) =>
          client.chat.completions.create(
            {
              model,
              messages: [
                { role: "system", content: system },
                { role: "user", content: args.prompt },
              ],
              // OpenAI's field is max_completion_tokens; OpenAI-compatible
              // endpoints such as MiniMax expect the classic max_tokens.
              max_completion_tokens: baseURL ? undefined : args.maxTokens,
              max_tokens: baseURL ? args.maxTokens : undefined,
              // Native json_object mode is an OpenAI feature. On a custom
              // OpenAI-compatible endpoint, rely on the JSON instruction in the
              // system message plus the tolerant parser in evidence.ts instead.
              response_format:
                args.json && !baseURL
                  ? { type: "json_object" as const }
                  : undefined,
            },
            { signal: merged },
          ),
        );
      } catch (err) {
        throw cleanError(err, args.signal);
      }

      let content = completion.choices[0]?.message?.content;
      if (content == null) {
        throw new Error("openai returned an empty response");
      }
      // Reasoning providers (for example MiniMax M-series via OPENAI_BASE_URL)
      // prefix the answer with a <think>...</think> block. Keep only what
      // follows the last closing tag so the engine parses the answer, not the
      // model's scratch work.
      const close = content.lastIndexOf("</think>");
      if (close >= 0) content = content.slice(close + "</think>".length);
      return content.trim();
    },
  };
}
