import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

// Unit tests do not load the Vite plugin or pretend to run inside a Worker.
export default defineConfig({
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  test: {
    include: ["src/**/*.test.{ts,tsx}", "scripts/**/*.test.mjs"],
    environment: "node",
    coverage: {
      provider: "v8",
      include: ["src/**/*.{ts,tsx}"],
      exclude: ["src/**/*.test.{ts,tsx}", "src/test/**"],
      reporter: ["text", "html", "json-summary"],
      // Kurskravet T07 er minst 50 % dekning (#274). Under terskelen feiler test:coverage, og dermed CI.
      thresholds: { lines: 50, statements: 50, branches: 50, functions: 50 },
    },
  },
});
