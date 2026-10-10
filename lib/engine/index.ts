// Engine entry point. STUB: replaced by the engine build.
// Re-exports the contract so consumers can import from "@/lib/engine".
export * from "./types";
import type { CaseInput, EngineDeps, EngineEvent } from "./types";

// The real engine parses the policy into criteria, runs two independent evidence
// passes per criterion, and yields events as each resolves. This stub keeps the
// type contract so the UI and route compile while the engine build fills it in.
// It yields a loud error rather than a silent pass.
export async function* runEngine(
  input: CaseInput,
  deps: EngineDeps,
): AsyncGenerator<EngineEvent> {
  void input;
  void deps;
  yield { type: "run_error", message: "engine not implemented (stub)" };
}
