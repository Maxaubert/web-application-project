// Serverhandlingen createListing (FK-03, #131) mot SQLite i minnet med appens migrasjoner. Beviser både
// avvisning og uendret lagring ved ulovlig skriving, og at eieren alltid kommer fra økten. Godkjent av Max 11.10.
import { beforeEach, describe, expect, it, vi } from "vitest";
import { listing, user } from "@/db/schema";
import type { Db } from "@/db/types";
import { createTestDb } from "@/test/test-db";
import { createListing } from "./actions";

type Session = { isAuthenticated: boolean; userId?: string; needsSetup?: boolean };

// Den ekte databasen og forespørselen finnes bare i Cloudflare; testen setter dem selv.
const holder = vi.hoisted(() => ({ db: undefined as unknown as Db, session: {} as Session }));
vi.mock("@/db", () => ({
  get db() {
    return holder.db;
  },
}));
vi.mock("rwsdk/worker", () => ({ getRequestInfo: () => ({ ctx: { session: holder.session } }) }));

function formData(fields: Record<string, string>) {
  const data = new FormData();
  for (const [key, value] of Object.entries(fields)) data.append(key, value);
  return data;
}

const VALID = {
  title: "Skjerm 24 tommer",
  description: "HDMI-kabel følger med.",
  category: "electronics",
  type: "loan",
  condition: "used",
  price: "100",
};

beforeEach(async () => {
  holder.db = createTestDb();
  await holder.db.insert(user).values([
    { id: "kari", name: "Kari Nordmann", email: "kari@hiof.no", phone: "+4791234567" },
    { id: "ola", name: "Ola Nordmann", email: "ola@hiof.no", phone: "+4798765432" },
  ]);
  holder.session = { isAuthenticated: true, userId: "kari", needsSetup: false };
});

describe("createListing", () => {
  it("uten økt sendes brukeren til innlogging, og ingenting lagres", async () => {
    holder.session = { isAuthenticated: false };

    const result = await createListing({}, formData(VALID));

    expect(result).toBeInstanceOf(Response);
    expect((result as Response).headers.get("Location")).toBe("/login");
    expect(await holder.db.select().from(listing)).toHaveLength(0);
  });

  it("uten fullført kontooppsett sendes brukeren dit, og ingenting lagres", async () => {
    holder.session = { isAuthenticated: true, userId: "kari", needsSetup: true };

    const result = await createListing({}, formData(VALID));

    expect((result as Response).headers.get("Location")).toBe("/account-setup");
    expect(await holder.db.select().from(listing)).toHaveLength(0);
  });

  it("ugyldig skjema gir feilene og verdiene tilbake, og ingenting lagres", async () => {
    const result = await createListing({}, formData({ ...VALID, title: "", price: "100,-" }));

    expect(result).toMatchObject({
      fieldErrors: { title: "Skriv en tittel", price: "Pris må være et helt tall, for eksempel 250" },
      values: { description: "HDMI-kabel følger med.", price: "100,-" },
    });
    expect(await holder.db.select().from(listing)).toHaveLength(0);
  });

  it("gyldig skjema lagrer én aktiv annonse med eieren fra økten, selv om skjemaet sender en annen eier", async () => {
    const result = await createListing({}, formData({ ...VALID, ownerId: "ola", status: "sold" }));

    const rows = await holder.db.select().from(listing);
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({ ownerId: "kari", status: "active", type: "loan", price: 100, title: "Skjerm 24 tommer" });
    expect((result as Response).status).toBe(302);
    expect((result as Response).headers.get("Location")).toBe(`/listings/${rows[0].id}?publisert=1`);
  });
});
