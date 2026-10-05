// Integrasjonstester for innlogging med engangskode. Kjører mot SQLite i minnet med appens
// migrasjoner (KI-kurset leksjon 8a); kodene fanges i stedet for å sendes. Godkjent av Max 05.10.
import { afterEach, describe, expect, it, vi } from "vitest";
import { loginCodeRequest, session, user, verification } from "@/db/schema";
import { createTestAuth } from "@/test/test-auth";

const EMAIL = "ola.nordmann@hiof.no";

function sessionCookie(headers: Headers): string {
  const setCookie = headers.get("set-cookie") ?? "";
  const match = setCookie.match(/better-auth\.session_token=[^;]+/);
  if (!match) throw new Error("Fant ingen øktcookie");
  return match[0];
}

async function signIn(t: ReturnType<typeof createTestAuth>, email = EMAIL) {
  await t.auth.api.sendVerificationOTP({ body: { email, type: "sign-in" } });
  const { headers, response } = await t.auth.api.signInEmailOTP({
    body: { email, otp: t.lastCode()! },
    returnHeaders: true,
  });
  return { cookie: sessionCookie(headers), user: response.user };
}

afterEach(() => {
  vi.useRealTimers();
});

describe("innlogging med engangskode", () => {
  it("avviser en adresse utenfor @hiof.no uten å sende kode (AK-30)", async () => {
    const t = createTestAuth();
    await expect(
      t.auth.api.sendVerificationOTP({ body: { email: "ola@gmail.com", type: "sign-in" } }),
    ).rejects.toThrow("Bruk HiØ-e-posten din");
    expect(t.sentCodes).toHaveLength(0);
    expect(await t.db.select().from(loginCodeRequest)).toHaveLength(0);
  });

  it("logger inn med riktig kode og lager en ny bruker uten telefon (AK-01)", async () => {
    const t = createTestAuth();
    const { cookie } = await signIn(t);

    expect(cookie).toMatch(/^better-auth\.session_token=/);
    const users = await t.db.select().from(user);
    expect(users).toHaveLength(1);
    expect(users[0].email).toBe(EMAIL);
    expect(users[0].phone).toBeNull();
  });

  it("gjør koden ugyldig etter tre feil forsøk", async () => {
    const t = createTestAuth();
    await t.auth.api.sendVerificationOTP({ body: { email: EMAIL, type: "sign-in" } });
    const code = t.lastCode()!;
    const wrong = code === "000000" ? "111111" : "000000";

    for (let attempt = 0; attempt < 3; attempt++) {
      await expect(t.auth.api.signInEmailOTP({ body: { email: EMAIL, otp: wrong } })).rejects.toThrow();
    }
    await expect(t.auth.api.signInEmailOTP({ body: { email: EMAIL, otp: code } })).rejects.toThrow();
    expect(await t.db.select().from(session)).toHaveLength(0);
  });

  it("avviser en kode som har utløpt etter fem minutter", async () => {
    vi.useFakeTimers({ toFake: ["Date"] });
    const t = createTestAuth();
    await t.auth.api.sendVerificationOTP({ body: { email: EMAIL, type: "sign-in" } });
    const code = t.lastCode()!;

    vi.setSystemTime(Date.now() + 5 * 60_000 + 1_000);
    await expect(t.auth.api.signInEmailOTP({ body: { email: EMAIL, otp: code } })).rejects.toThrow();
    expect(await t.db.select().from(session)).toHaveLength(0);
  });

  it("nekter ny kode innen ett minutt og sender ingen ny kode", async () => {
    const t = createTestAuth();
    await t.auth.api.sendVerificationOTP({ body: { email: EMAIL, type: "sign-in" } });
    await expect(
      t.auth.api.sendVerificationOTP({ body: { email: EMAIL, type: "sign-in" } }),
    ).rejects.toThrow("Vent ett minutt");

    expect(t.sentCodes).toHaveLength(1);
    expect(await t.db.select().from(loginCodeRequest)).toHaveLength(1);
  });

  it("tillater fem koder per time, nekter den sjette og åpner igjen etter en time", async () => {
    vi.useFakeTimers({ toFake: ["Date"] });
    const start = Date.now();
    const t = createTestAuth();
    const request = () => t.auth.api.sendVerificationOTP({ body: { email: EMAIL, type: "sign-in" } });

    for (let i = 0; i < 5; i++) {
      vi.setSystemTime(start + i * 61_000);
      await request();
    }
    vi.setSystemTime(start + 5 * 61_000);
    await expect(request()).rejects.toThrow("for mange koder");
    expect(t.sentCodes).toHaveLength(5);

    vi.setSystemTime(start + 60 * 60_000 + 5 * 61_000);
    await request();
    expect(t.sentCodes).toHaveLength(6);
  });

  it("lar ikke grensen for én adresse stenge en annen", async () => {
    const t = createTestAuth();
    await t.auth.api.sendVerificationOTP({ body: { email: EMAIL, type: "sign-in" } });
    await expect(
      t.auth.api.sendVerificationOTP({ body: { email: EMAIL, type: "sign-in" } }),
    ).rejects.toThrow();

    await t.auth.api.sendVerificationOTP({ body: { email: "kari@hiof.no", type: "sign-in" } });
    expect(t.sentCodes.map((c) => c.email)).toEqual([EMAIL, "kari@hiof.no"]);
  });

  it("avviser også direkte kall til better-auth sitt endepunkt med feil domene", async () => {
    const t = createTestAuth();
    const response = await t.auth.handler(
      new Request("http://localhost:5173/api/auth/email-otp/send-verification-otp", {
        method: "POST",
        headers: { "content-type": "application/json", origin: "http://localhost:5173" },
        body: JSON.stringify({ email: "ola@gmail.com", type: "sign-in" }),
      }),
    );

    expect(response.status).toBe(400);
    expect(t.sentCodes).toHaveLength(0);
  });

  it("avslutter økten på serveren ved utlogging", async () => {
    const t = createTestAuth();
    const { cookie } = await signIn(t);
    const headers = new Headers({ cookie });
    expect(await t.auth.api.getSession({ headers })).not.toBeNull();

    await t.auth.api.signOut({ headers });

    expect(await t.auth.api.getSession({ headers })).toBeNull();
    expect(await t.db.select().from(session)).toHaveLength(0);
  });

  it("gir en økt som varer i 30 dager", async () => {
    const t = createTestAuth();
    const before = Date.now();
    await signIn(t);

    const [row] = await t.db.select().from(session);
    // Max' valg 05.10 står som tall her, så en endret konstant oppdages.
    const thirtyDays = 30 * 24 * 60 * 60_000;
    const lifetime = row.expiresAt.getTime() - before;
    expect(lifetime).toBeGreaterThan(thirtyDays - 60_000);
    expect(lifetime).toBeLessThan(thirtyDays + 60_000);
  });

  it("lagrer ikke koden i klartekst i databasen", async () => {
    const t = createTestAuth();
    await t.auth.api.sendVerificationOTP({ body: { email: EMAIL, type: "sign-in" } });
    const code = t.lastCode()!;

    const rows = await t.db.select().from(verification);
    expect(rows).toHaveLength(1);
    expect(rows[0].value).not.toContain(code);
  });
});
