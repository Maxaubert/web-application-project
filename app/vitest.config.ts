import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

// Unit tests do not load the Vite plugin or pretend to run inside a Worker.
export default defineConfig({
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  test: {
    include: ["src/**/*.test.{ts,tsx}"],
    environment: "node",
    coverage: {
      provider: "v8",
      include: ["src/**/*.{ts,tsx}"],
      exclude: ["src/**/*.test.{ts,tsx}", "src/test/**"],
      reporter: ["text", "html", "json-summary"],
    },
  },
});
