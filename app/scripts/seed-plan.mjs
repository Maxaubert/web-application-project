// Ren logikk for demoannonsene (#152): gjør seed-listings.json og bildemappene om til SQL og en liste over
// R2-objekter. Uten wrangler og filsystem, så den kan testes i Vitest. seed.mjs kjører resultatet.
import { createHash } from "node:crypto";

// Demobrukerne får adresser på et domene som aldri kan motta e-post (.invalid, RFC 2606). Innlogging krever
// hiof.no, så ingen kan logge inn som dem, og ingen ekte student får e-post eller konto ved et uhell.
export const DEMO_EMAIL_DOMAIN = "studentmarkedet.invalid";
export const BUCKET = "studentmarkedet-images";

// Samme tekst gir alltid samme UUID-formede ID, så skriptet kan kjøres flere ganger og bildeadressene
// passer formatet serve-image.ts godtar (36 tegn med hex og bindestrek).
export function stableId(text) {
  const hex = createHash("sha256").update(text).digest("hex");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`;
}

// Miniatyren ligger ved siden av originalen (#155). Samme regel som thumbKey i src/app/images/image-url.ts;
// seed-plan.test.mjs sjekker at de to gir likt.
export const thumbKey = (key) => key.replace(/\.(jpg|png|webp)$/, ".thumb.jpg");
const THUMB_SUFFIX = ".thumb.jpg";

const quote = (value) => (value === null ? "NULL" : typeof value === "number" ? String(value) : `'${String(value).replaceAll("'", "''")}'`);

// Sletter bare det demobrukerne eier. Bilderadene slettes først, så det ikke avhenger av at
// fremmednøklene håndheves.
function deleteStatements(users) {
  const ids = users.map((u) => quote(u.id)).join(", ");
  return [
    `DELETE FROM listing_image WHERE listing_id IN (SELECT id FROM listing WHERE owner_id IN (${ids}));`,
    `DELETE FROM listing WHERE owner_id IN (${ids});`,
    `DELETE FROM user WHERE id IN (${ids});`,
  ];
}

// images: bildefilene per annonse (slug → filnavn). Sorteres, så «01.jpg» blir forsidebildet. Høyst 10.
// «01.thumb.jpg» er miniatyren til «01.jpg»: den lastes opp ved siden av, men får ingen rad i databasen.
export function seedPlan(data, images) {
  const statements = deleteStatements(data.users);
  const objects = [];
  data.users.forEach((u, index) =>
    statements.push(
      `INSERT INTO user (id, name, email, email_verified) VALUES (${quote(u.id)}, ${quote(u.name)}, ${quote(`demo-${index + 1}@${DEMO_EMAIL_DOMAIN}`)}, 1);`,
    ),
  );
  for (const l of data.listings) {
    const id = stableId(`listing:${l.slug}`);
    statements.push(
      `INSERT INTO listing (id, owner_id, type, title, description, category, condition, price, status) VALUES (${[id, l.owner, l.type, l.title, l.description, l.category, l.condition, l.price, "active"].map(quote).join(", ")});`,
    );
    const all = images[l.slug] ?? [];
    const files = all.filter((file) => !file.endsWith(THUMB_SUFFIX)).sort().slice(0, 10);
    files.forEach((file, position) => {
      const key = `listings/${id}/${stableId(`image:${l.slug}/${file}`)}.jpg`;
      statements.push(`INSERT INTO listing_image (id, listing_id, key, position) VALUES (${[stableId(key), id, key, position].map(quote).join(", ")});`);
      objects.push({ key, file: `${l.slug}/${file}` });
      const thumbFile = file.replace(/\.jpg$/, THUMB_SUFFIX);
      if (all.includes(thumbFile)) objects.push({ key: thumbKey(key), file: `${l.slug}/${thumbFile}` });
    });
  }
  return { sql: statements.join("\n"), objects };
}

// Fjerner alle demodataene igjen: radene og de samme R2-nøklene som seedPlan lager.
export function removePlan(data, images) {
  return { sql: deleteStatements(data.users).join("\n"), keys: seedPlan(data, images).objects.map((o) => o.key) };
}
