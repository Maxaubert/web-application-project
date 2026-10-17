// Innlogget tilstand for nettlesertestene (#94) uten kode i appen: en testbruker, en økt og faste
// testannonser legges rett i den lokale databasen, og cookien signeres med den lokale hemmeligheten
// slik better-auth gjør. Appen ser en vanlig økt og sjekker den som ellers.
import { execSync } from "node:child_process";
import { createHmac, randomUUID } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { E2E_STATE } from "./state";

export const AUTH_FILE = "e2e/.auth/user.json";
// Testbilder i den lokale R2-emuleringen, så bildeadressen kan testes mot ekte lagring (#138). De hører til
// testannonsen «Skrivebordslampe», som viser bildene på kortet og annonsesiden (#150).
export const TEST_LISTING_ID = "e2e00000-0000-4000-8000-000000000001";
// Annonse med seks bilderader uten filer i R2, så miniatyrraden på mobil må rulles (#156).
export const TEST_GALLERY_ID = "e2e00000-0000-4000-8000-000000000010";
export const TEST_IMAGE_PATH = `/images/listings/${TEST_LISTING_ID}/e2e00000-0000-4000-8000-000000000002.jpg`;
const SECOND_IMAGE_PATH = `/images/listings/${TEST_LISTING_ID}/e2e00000-0000-4000-8000-000000000003.jpg`;
// Bare det første bildet har miniatyr i R2 (#155). Det andre har ingen, så testene også dekker at originalen sendes i stedet.
export const THUMB_IMAGE_PATH = TEST_IMAGE_PATH.replace(/\.jpg$/, ".thumb.jpg");
export const NO_THUMB_PATH = SECOND_IMAGE_PATH.replace(/\.jpg$/, ".thumb.jpg");
const SQL_FILE = "e2e/.auth/setup.sql";
const SESSION_MS = 60 * 60 * 1000;

function localSecret(): string {
  execSync("node scripts/ensure-dev-vars.mjs");
  const line = readFileSync(".dev.vars", "utf8")
    .split(/\r?\n/)
    .find((l) => l.startsWith("BETTER_AUTH_SECRET="));
  if (!line) throw new Error("BETTER_AUTH_SECRET mangler i .dev.vars.");
  return line.slice("BETTER_AUTH_SECRET=".length).trim();
}

export default function globalSetup() {
  const token = randomUUID().replaceAll("-", "");
  const now = Date.now();
  mkdirSync("e2e/.auth", { recursive: true });
  writeFileSync(
    SQL_FILE,
    `INSERT OR IGNORE INTO user (id, name, email, email_verified, phone)
       VALUES ('e2e-user', 'E2E Testesen', 'e2e@hiof.no', 1, '+4790000000');
     INSERT OR IGNORE INTO user (id, name, email, email_verified, phone)
       VALUES ('e2e-seller', 'E2E Selger', 'e2e-seller@hiof.no', 1, '+4790000001');
     DELETE FROM request WHERE requester_id = 'e2e-user';
     DELETE FROM session WHERE user_id = 'e2e-user';
     INSERT INTO session (id, token, user_id, expires_at, created_at, updated_at)
       VALUES ('e2e-session', '${token}', 'e2e-user', ${now + SESSION_MS}, ${now}, ${now});
     INSERT OR REPLACE INTO listing (id, owner_id, type, title, description, category, condition, price, status)
       VALUES
         ('e2e-calc', 'e2e-user', 'sale', 'Kalkulator Casio fx-991', 'Lite brukt.', 'electronics', 'like_new', 250, 'active'),
         ('e2e-hammock', 'e2e-user', 'loan', 'Hengekøye', 'Til turen.', 'sports', 'used', 30, 'active'),
         ('${TEST_LISTING_ID}', 'e2e-user', 'sale', 'Skrivebordslampe', 'Med LED-pære.', 'furniture', 'used', 120, 'active'),
         ('${TEST_GALLERY_ID}', 'e2e-user', 'sale', 'Galleritest', 'Seks bilder.', 'furniture', 'used', 10, 'active'),
         ('e2e-bid', 'e2e-seller', 'sale', 'Budtest', 'Til budtestene.', 'books', 'used', 250, 'active'),
         ('e2e-bid-error', 'e2e-seller', 'sale', 'Budfeil', 'Til budtestene.', 'books', 'used', 250, 'active');
     DELETE FROM listing_image WHERE listing_id IN ('${TEST_LISTING_ID}', '${TEST_GALLERY_ID}');
     INSERT INTO listing_image (id, listing_id, key, position)
       VALUES
${[1, 2, 3, 4, 5, 6].map((n) => `         ('e2e-gallery-${n}', '${TEST_GALLERY_ID}', 'listings/${TEST_GALLERY_ID}/e2e00000-0000-4000-8000-0000000001${n}0.jpg', ${n - 1})`).join(",\n")};
     INSERT INTO listing_image (id, listing_id, key, position)
       VALUES
         ('e2e-image-1', '${TEST_LISTING_ID}', '${TEST_IMAGE_PATH.replace("/images/", "")}', 0),
         ('e2e-image-2', '${TEST_LISTING_ID}', '${SECOND_IMAGE_PATH.replace("/images/", "")}', 1);`,
  );
  // Testene har egen lagring (#154): tabellene lages her, og testdataene legges i den, ikke i dev-databasen.
  execSync(`npx wrangler d1 migrations apply DB --local --persist-to ${E2E_STATE}`, { stdio: "ignore" });
  execSync(`npx wrangler d1 execute DB --local --persist-to ${E2E_STATE} --file ${SQL_FILE}`, { stdio: "ignore" });
  for (const [path, file] of [
    [TEST_IMAGE_PATH, "test.jpg"],
    [THUMB_IMAGE_PATH, "test.thumb.jpg"],
    [SECOND_IMAGE_PATH, "test.jpg"],
  ]) {
    const imageKey = path.replace("/images/", "");
    execSync(`npx wrangler r2 object put studentmarkedet-images/${imageKey} --local --persist-to ${E2E_STATE} --file e2e/fixtures/${file} --content-type image/jpeg`, {
      stdio: "ignore",
    });
  }

  // Samme format som better-call: token.base64(HMAC-SHA256(hemmelighet, token)), URL-kodet.
  const signature = createHmac("sha256", localSecret()).update(token).digest("base64");
  const cookie = {
    name: "better-auth.session_token",
    value: encodeURIComponent(`${token}.${signature}`),
    domain: "127.0.0.1",
    path: "/",
    expires: Math.floor((now + SESSION_MS) / 1000),
    httpOnly: true,
    secure: false,
    sameSite: "Lax" as const,
  };
  writeFileSync(AUTH_FILE, JSON.stringify({ cookies: [cookie], origins: [] }, null, 2));
}
