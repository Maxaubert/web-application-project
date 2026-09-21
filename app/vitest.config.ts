import { defineConfig } from "vitest/config";

// Unit tests do not load the Vite plugin or pretend to run inside a Worker.
export default defineConfig({
  test: {
    include: ["src/**/*.test.{ts,tsx}"],
    environment: "node",
    coverage: {
      provider: "v8",
      include: ["src/**/*.{ts,tsx}"],
      exclude: ["src/**/*.test.{ts,tsx}"],
      reporter: ["text", "html", "json-summary"],
    },
  },
});
