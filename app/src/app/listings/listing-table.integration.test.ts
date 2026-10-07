// Databasereglene for annonsetabellen avviser ugyldige data, også om koden har en feil.
// Hver test sjekker både at databasen sier nei og at ingenting ble lagret. Godkjent av Max 07.10.
import { eq } from "drizzle-orm";
import { describe, expect, it } from "vitest";
import { listing, user } from "@/db/schema";
import { createTestDb } from "@/test/test-db";
import { insertOwner, OWNER_ID, validListing } from "@/test/test-listings";

// Verdiene er ugyldige med vilje. TypeScript ville stoppet dem, så vi omgår typene for å vise
// at databasen stopper det selv om koden ikke gjør det.
async function expectRejected(invalid: Record<string, unknown>, rule: string) {
  const db = createTestDb();
  await insertOwner(db);
  const values = { ...validListing(), ...invalid } as ReturnType<typeof validListing>;

  await expect(db.insert(listing).values(values)).rejects.toThrow(rule);
  expect(await db.select().from(listing)).toHaveLength(0);
}

describe("annonsetabellen", () => {
  it("avviser en ukjent handelstype", async () => {
    await expectRejected({ type: "rent" }, "listing_type_check");
  });

  it("avviser en ukjent kategori", async () => {
    await expectRejected({ category: "cars" }, "listing_category_check");
  });

  it("avviser en negativ pris", async () => {
    await expectRejected({ price: -1 }, "listing_price_check");
  });

  it("avviser en eier som ikke finnes", async () => {
    await expectRejected({ ownerId: "finnes-ikke" }, "FOREIGN KEY");
  });

  it("sletter brukerens annonser når brukeren slettes", async () => {
    const db = createTestDb();
    await insertOwner(db);
    await insertOwner(db, "other-owner");
    await db.insert(listing).values([validListing(), validListing({ ownerId: "other-owner" })]);

    await db.delete(user).where(eq(user.id, OWNER_ID));

    const remaining = await db.select().from(listing);
    expect(remaining.map((l) => l.ownerId)).toEqual(["other-owner"]);
  });
});
