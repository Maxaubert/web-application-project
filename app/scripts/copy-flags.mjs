// Kopierer de runde flaggene fra circle-flags (MIT, HatScripts) til public/flags/, så appen
// serverer dem selv. Mappen er Git-ignorert og lages på nytt før dev og build.
import { cpSync, existsSync, mkdirSync } from "node:fs";

const from = new URL("../node_modules/circle-flags/flags/", import.meta.url);
const to = new URL("../public/flags/", import.meta.url);
if (!existsSync(new URL("no.svg", to))) {
  mkdirSync(to, { recursive: true });
  cpSync(from, to, { recursive: true, dereference: true });
  console.log("Kopierte flagg til public/flags/.");
}
