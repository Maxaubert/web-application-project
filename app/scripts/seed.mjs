// Demoannonsene (#152): legger annonsene i seed-listings.json og bildene i seed-images/<annonse>/ inn i D1 og R2.
//   node scripts/seed.mjs            lokalt (npm run db:seed:local)
//   node scripts/seed.mjs --remote   live, bare etter Max' ja til den konkrete kjøringen
//   node scripts/seed.mjs --remove   fjerner demodataene igjen (sammen med --remote for live)
// Rører bare rader som demobrukerne eier, så ekte annonser blir aldri slettet.
import { exec as execCallback, execSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { promisify } from "node:util";
import { BUCKET, removePlan, seedPlan } from "./seed-plan.mjs";

const exec = promisify(execCallback);
const IMAGE_DIR = "scripts/seed-images";
const where = process.argv.includes("--remote") ? "--remote" : "--local";
const remove = process.argv.includes("--remove");

const data = JSON.parse(readFileSync("scripts/seed-listings.json", "utf8"));
const images = Object.fromEntries(
  data.listings.map((l) => {
    const dir = `${IMAGE_DIR}/${l.slug}`;
    return [l.slug, existsSync(dir) ? readdirSync(dir).filter((f) => f.endsWith(".jpg")) : []];
  }),
);

// Hvert bilde er ett wrangler-kall. Mot skyen åtte om gangen; lokalt ett og ett, fordi den lokale R2-lagringen
// gir feil ved samtidige skrivinger. Kommandoene bygges bare av nøkler vi lager selv (hex) og filnavn fra repoet.
async function inParallel(items, run, limit = where === "--remote" ? 8 : 1) {
  const queue = [...items];
  await Promise.all(Array.from({ length: limit }, async () => { while (queue.length) await run(queue.shift()); }));
}

function runSql(sql) {
  mkdirSync(".wrangler", { recursive: true });
  writeFileSync(".wrangler/seed.sql", sql);
  execSync(`npx wrangler d1 execute DB ${where} --file .wrangler/seed.sql`, { stdio: "ignore" });
}

if (remove) {
  const { sql, keys } = removePlan(data, images);
  runSql(sql);
  await inParallel(keys, (key) => exec(`npx wrangler r2 object delete "${BUCKET}/${key}" ${where}`));
  console.log(`Fjernet demodataene (${where}): ${keys.length} bilder.`);
} else {
  const { sql, objects } = seedPlan(data, images);
  await inParallel(objects, ({ key, file }) =>
    exec(`npx wrangler r2 object put "${BUCKET}/${key}" ${where} --file "${IMAGE_DIR}/${file}" --content-type image/jpeg`),
  );
  runSql(sql);
  console.log(`${data.listings.length} demoannonser og ${objects.length} bilder lagt inn (${where}).`);
}
