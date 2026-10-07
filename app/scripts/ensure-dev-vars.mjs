// Lager app/.dev.vars med en tilfeldig BETTER_AUTH_SECRET hvis filen mangler, og legger til
// nøkler som mangler (tomme), så de genererte typene blir like på alle maskiner og i CI.
// Filen er Git-ignorert; hver maskin får sin egen hemmelighet. Eksisterende verdier røres ikke.
import { appendFileSync, existsSync, readFileSync, writeFileSync } from "node:fs";
import { randomBytes } from "node:crypto";

const path = new URL("../.dev.vars", import.meta.url);
if (!existsSync(path)) {
  writeFileSync(
    path,
    [
      `BETTER_AUTH_SECRET=${randomBytes(32).toString("hex")}`,
      "# log: koden skrives i terminalen. resend: ekte e-post (krever RESEND_API_KEY).",
      "LOGIN_CODE_DELIVERY=log",
      "",
    ].join("\n"),
  );
  console.log("Laget app/.dev.vars med ny lokal hemmelighet.");
}

const present = new Set(
  readFileSync(path, "utf8")
    .split(/\r?\n/)
    .map((line) => line.split("=")[0].trim()),
);
const missing = ["RESEND_API_KEY"].filter((key) => !present.has(key));
if (missing.length) {
  const text = readFileSync(path, "utf8");
  const prefix = text.endsWith("\n") || text === "" ? "" : "\n";
  appendFileSync(path, prefix + missing.map((key) => `${key}=`).join("\n") + "\n");
  console.log(`La til tomme nøkler i app/.dev.vars: ${missing.join(", ")}.`);
}
