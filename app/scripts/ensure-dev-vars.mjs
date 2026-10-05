// Lager app/.dev.vars med en tilfeldig BETTER_AUTH_SECRET hvis filen mangler.
// Filen er Git-ignorert; hver maskin (og CI) får sin egen hemmelighet.
import { existsSync, writeFileSync } from "node:fs";
import { randomBytes } from "node:crypto";

const path = new URL("../.dev.vars", import.meta.url);
if (!existsSync(path)) {
  writeFileSync(
    path,
    [
      `BETTER_AUTH_SECRET=${randomBytes(32).toString("hex")}`,
      "# Skriver innloggingskoder til terminalen i stedet for å sende e-post (issue #46).",
      "LOGIN_CODE_DELIVERY=log",
      "",
    ].join("\n"),
  );
  console.log("Laget app/.dev.vars med ny lokal hemmelighet.");
}
