import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";

export default tseslint.config(
  { ignores: ["dist/**", ".wrangler/**", "coverage/**", "playwright-report/**", "test-results/**", "worker-configuration.d.ts"] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  { languageOptions: { globals: { ...globals.browser, ...globals.node } } },
  {
    files: ["types/rw.d.ts"],
    // RedwoodSDK uses declaration merging to extend its request context.
    rules: { "@typescript-eslint/no-empty-object-type": ["error", { allowInterfaces: "always" }] },
  },
);
