// Innlogget tilstand for nettlesertestene (#94) uten kode i appen: en testbruker, en økt og faste
// testannonser legges rett i den lokale databasen, og cookien signeres med den lokale hemmeligheten
// slik better-auth gjør. Appen ser en vanlig økt og sjekker den som ellers.
import { execSync } from "node:child_process";
import { createHmac, randomUUID } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";

export const AUTH_FILE = "e2e/.auth/user.json";
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
     DELETE FROM session WHERE user_id = 'e2e-user';
     INSERT INTO session (id, token, user_id, expires_at, created_at, updated_at)
       VALUES ('e2e-session', '${token}', 'e2e-user', ${now + SESSION_MS}, ${now}, ${now});
     INSERT OR REPLACE INTO listing (id, owner_id, type, title, description, category, condition, price, status)
       VALUES
         ('e2e-calc', 'e2e-user', 'sale', 'Kalkulator Casio fx-991', 'Lite brukt.', 'electronics', 'like_new', 250, 'active'),
         ('e2e-hammock', 'e2e-user', 'loan', 'Hengekøye', 'Til turen.', 'sports', 'used', 30, 'active');`,
  );
  execSync(`npx wrangler d1 execute DB --local --file ${SQL_FILE}`, { stdio: "ignore" });

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
