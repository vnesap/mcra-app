import { fileURLToPath, URL } from "url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: [
      {
        find: "@",
        replacement: fileURLToPath(new URL("./src", import.meta.url)),
      },
    ],
  },
  test: {
    setupFiles: ["./src/__tests__/setup.ts"],
    environment: "jsdom",
    // The default forks pool sizes minThreads/maxThreads from the host CPU
    // count, which in constrained sandboxes can resolve to a conflicting
    // minThreads > maxThreads and abort the whole run before any test executes
    // ("options.minThreads and options.maxThreads must not conflict"). Pin the
    // pool to a single worker so the suite is runnable regardless of the host.
    pool: "forks",
    maxWorkers: 1,
    minWorkers: 1,
  },
});
