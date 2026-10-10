// Provider-agnostic LLM client factory. Server-only.
//
// This is the one place the provider API keys are read, straight from the server
// process environment. They are never read in a client component and never from a
// NEXT_PUBLIC var, so a key cannot reach the browser bundle. The engine takes an
// LlmClient by injection and never touches env itself.
//
// Selection: Anthropic wins when ANTHROPIC_API_KEY is set, otherwise OpenAI when
// OPENAI_API_KEY is set, otherwise a clear error naming what to set.
import type { LlmClient } from "@/lib/engine/types";
import { createAnthropicClient } from "./anthropic";
import { createOpenAiClient } from "./openai";

export function getLlmClient(): LlmClient {
  const anthropicKey = process.env.ANTHROPIC_API_KEY;
  if (anthropicKey) {
    return createAnthropicClient(anthropicKey);
  }

  const openaiKey = process.env.OPENAI_API_KEY;
  if (openaiKey) {
    return createOpenAiClient(openaiKey);
  }

  throw new Error(
    "No LLM provider configured. Set ANTHROPIC_API_KEY or OPENAI_API_KEY in the server environment.",
  );
}
