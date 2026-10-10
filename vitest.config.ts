import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";

const root = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  test: {
    include: ["__tests__/**/*.test.ts", "lib/**/*.test.ts"],
    environment: "node",
  },
  resolve: {
    alias: { "@": root },
  },
});
