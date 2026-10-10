// Provider-agnostic LLM client. STUB: replaced by the LLM build.
// Reads server-only env (OPENAI_API_KEY, optional ANTHROPIC_API_KEY), never a
// NEXT_PUBLIC var, and is only ever imported from server code.
import type { LlmClient } from "@/lib/engine/types";

export function getLlmClient(): LlmClient {
  return {
    provider: "stub",
    model: "stub",
    async complete() {
      throw new Error("llm client not implemented (stub)");
    },
  };
}
