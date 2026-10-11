import { defineConfig } from "vite";
import { redwood } from "rwsdk/vite";
import { cloudflare } from "@cloudflare/vite-plugin";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  environments: {
    ssr: {},
  },
  // Testrapporter skrives om mens dev-serveren kjører; uten dette viser Vite feilmelding om filer som
  // forsvant (#135).
  server: {
    watch: {
      ignored: ["**/playwright-report/**", "**/test-results/**", "**/coverage/**", "**/e2e/.auth/**"],
    },
  },
  plugins: [
    cloudflare({
      viteEnvironment: { name: "worker" },
    }),
    redwood(),
    tailwindcss(),
  ],
});
