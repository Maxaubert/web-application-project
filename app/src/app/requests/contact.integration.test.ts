// getContactForParty (FK-08, #188) mot SQLite i minnet: den andre partens telefon og e-post vises bare for de to partene,
// og bare så lenge avtalen står. Dette er eneste vei til kontaktinfo, så hver status og hver rolle prøves.
import { eq } from "drizzle-orm";
import { beforeEach, describe, expect, it } from "vitest";
import { listing, request, requestStatuses, user } from "@/db/schema";
import type { Db } from "@/db/types";
import { createTestDb } from "@/test/test-db";
import { insertOwner, OWNER_ID, validListing } from "@/test/test-listings";
import { getContactForParty } from "./contact";

const NOW = new Date("2026-10-20T12:00:00Z");
let db: Db;

beforeEach(async () => {
  db = createTestDb();
  await insertOwner(db);
  await db.update(user).set({ phone: "+4790000001" }).where(eq(user.id, OWNER_ID));
  await db.insert(user).values([
    { id: "kari", name: "Kari Hansen", email: "kari@hiof.no", phone: "+4790000002" },
    { id: "per", name: "Per Olsen", email: "per@hiof.no", phone: "+4790000003" },
  ]);
  await db.insert(listing).values(validListing({ id: "calc", price: 250 }));
});

async function seedRequest(status: (typeof requestStatuses)[number]) {
  await db.delete(request);
  await db.insert(request).values({ id: "r1", listingId: "calc", requesterId: "kari", status });
}

describe("getContactForParty", () => {
  it("eieren får forespørrerens kontaktinfo, og forespørreren eierens, når avtalen står", async () => {
    for (const status of ["accepted", "in_use", "completed"] as const) {
      await seedRequest(status);

      expect(await getContactForParty(db, "r1", OWNER_ID, NOW), status).toEqual({ name: "Kari Hansen", email: "kari@hiof.no", phone: "+4790000002" });
      expect(await getContactForParty(db, "r1", "kari", NOW), status).toEqual({ name: "Ola Nordmann", email: `${OWNER_ID}@hiof.no`, phone: "+4790000001" });
    }
  });

  it("ingen kontaktinfo før aksept, og ikke etter avslag, tilbaketrekking, utløp eller avbestilling, for noen av partene", async () => {
    for (const status of requestStatuses.filter((s) => !["accepted", "in_use", "completed"].includes(s))) {
      await seedRequest(status);

      for (const userId of [OWNER_ID, "kari"]) expect(await getContactForParty(db, "r1", userId, NOW), `${status} ${userId}`).toBeUndefined();
    }
  });

  it("en tredjepart og en ukjent forespørsel får ingenting, selv når avtalen står", async () => {
    await seedRequest("accepted");

    expect(await getContactForParty(db, "r1", "per", NOW)).toBeUndefined();
    expect(await getContactForParty(db, "finnes-ikke", "kari", NOW)).toBeUndefined();
  });

  it("en part uten telefon gir phone: null, ikke en feil", async () => {
    await seedRequest("accepted");
    await db.update(user).set({ phone: null }).where(eq(user.id, "kari"));

    expect(await getContactForParty(db, "r1", OWNER_ID, NOW)).toMatchObject({ name: "Kari Hansen", phone: null });
  });
});
