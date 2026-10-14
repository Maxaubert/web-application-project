// Legger Max' bilder fra scripts/seed-images/ på testannonsene i den lokale databasen og R2-emuleringen (#150).
// Kjøres av `npm run db:seed:local` etter seed-local.sql, aldri mot skyen. Filnavnet bestemmer annonsen og
// rekkefølgen: «matematikk.jpg» er forsidebildet, «matematikk-2.jpg» det neste. Bare JPEG, PNG og WebP.
import { execSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, readdirSync, writeFileSync } from "node:fs";

const DIR = "scripts/seed-images";
const LISTINGS = {
  matematikk: "5eed0000-0000-4000-8000-000000000001",
  kontorstol: "5eed0000-0000-4000-8000-000000000002",
  kalkulator: "5eed0000-0000-4000-8000-000000000003",
  vinterjakke: "5eed0000-0000-4000-8000-000000000004",
};
const TYPES = { jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png", webp: "image/webp" };

// Samme filnavn gir samme nøkkel hver gang, så skriptet kan kjøres flere ganger. Formatet må passe
// serve-image.ts: <36 tegn med hex og bindestrek>.<jpg|png|webp>.
function fileId(name) {
  const hex = createHash("sha256").update(name).digest("hex");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`;
}

if (!existsSync(DIR)) {
  console.log(`Ingen ${DIR}/, testannonsene får plassholderen.`);
  process.exit(0);
}

const rows = [];
for (const file of readdirSync(DIR).sort()) {
  const match = /^([a-z]+)(?:-(\d+))?\.(jpe?g|png|webp)$/i.exec(file);
  const listingId = match && LISTINGS[match[1].toLowerCase()];
  if (!listingId) {
    console.warn(`Hopper over ${file}: navnet må være ${Object.keys(LISTINGS).join(", ")} (+ -2, -3 …) og .jpg, .png eller .webp.`);
    continue;
  }
  const ext = match[3].toLowerCase() === "jpeg" ? "jpg" : match[3].toLowerCase();
  const key = `listings/${listingId}/${fileId(file)}.${ext}`;
  execSync(`npx wrangler r2 object put "studentmarkedet-images/${key}" --local --file "${DIR}/${file}" --content-type ${TYPES[ext]}`, { stdio: "ignore" });
  rows.push({ listingId, key, order: Number(match[2] ?? 1) });
}

// Posisjon 0, 1, 2 … per annonse etter nummeret i filnavnet.
const sql = [`DELETE FROM listing_image WHERE listing_id IN (${Object.values(LISTINGS).map((id) => `'${id}'`).join(", ")});`];
for (const listingId of Object.values(LISTINGS)) {
  rows
    .filter((row) => row.listingId === listingId)
    .sort((a, b) => a.order - b.order)
    .slice(0, 10)
    .forEach((row, position) => sql.push(`INSERT INTO listing_image (id, listing_id, key, position) VALUES ('${fileId(row.key)}', '${listingId}', '${row.key}', ${position});`));
}
writeFileSync(".wrangler/seed-images.sql", sql.join("\n"));
execSync("npx wrangler d1 execute DB --local --file .wrangler/seed-images.sql", { stdio: "ignore" });
console.log(`${rows.length} bilder lagt på testannonsene.`);
