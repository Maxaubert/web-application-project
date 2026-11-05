// Annonse-repositoryet (#256), mot SQLite i minnet med appens migrasjoner. Godkjent av Max 07.10.
import { describe, expect, it } from "vitest";
import { listing, listingImage, user } from "@/db/schema";
import { createTestDb } from "@/test/test-db";
import { insertOwner, OWNER_ID, validListing } from "@/test/test-listings";
import { createListingRepository } from "./repository";

describe("findActive", () => {
  it("returnerer bare aktive annonser", async () => {
    const db = createTestDb();
    await insertOwner(db);
    await db.insert(listing).values([
      validListing({ id: "active", status: "active" }),
      validListing({ id: "sold", status: "sold" }),
      validListing({ id: "unpublished", status: "unpublished" }),
    ]);

    const result = await createListingRepository(db).findActive();

    expect(result.map((r) => r.listing.id)).toEqual(["active"]);
  });

  it("sorterer nyeste først", async () => {
    const db = createTestDb();
    await insertOwner(db);
    await db.insert(listing).values([
      validListing({ id: "middle", createdAt: new Date("2026-10-02") }),
      validListing({ id: "newest", createdAt: new Date("2026-10-03") }),
      validListing({ id: "oldest", createdAt: new Date("2026-10-01") }),
    ]);

    const result = await createListingRepository(db).findActive();

    expect(result.map((r) => r.listing.id)).toEqual(["newest", "middle", "oldest"]);
  });

  it("gir en tom liste når det ikke finnes annonser", async () => {
    const db = createTestDb();
    expect(await createListingRepository(db).findActive()).toEqual([]);
  });

  it("tar med eierens navn, men aldri telefon eller e-post", async () => {
    const db = createTestDb();
    await db.insert(user).values({ id: OWNER_ID, name: "Kari Nordmann", email: "kari@hiof.no", phone: "+4791234567" });
    await db.insert(listing).values(validListing({ id: "calc" }));

    const result = await createListingRepository(db).findActive();

    expect(result[0].ownerName).toBe("Kari Nordmann");
    const json = JSON.stringify(result);
    expect(json).not.toContain("kari@hiof.no");
    expect(json).not.toContain("+4791234567");
  });
});

// Bilder (#150). Godkjent av Max 11.10.
describe("bilder", () => {
  it("findActive gir forsidebildet (posisjon 0), null uten bilder, og én rad per annonse", async () => {
    const db = createTestDb();
    await insertOwner(db);
    await db.insert(listing).values([validListing({ id: "with", createdAt: new Date("2026-10-02") }), validListing({ id: "without", createdAt: new Date("2026-10-01") })]);
    await db.insert(listingImage).values([
      { listingId: "with", key: "listings/with/2.jpg", position: 1 },
      { listingId: "with", key: "listings/with/1.jpg", position: 0 },
    ]);

    const result = await createListingRepository(db).findActive();

    expect(result.map((r) => [r.listing.id, r.coverKey])).toEqual([
      ["with", "listings/with/1.jpg"],
      ["without", null],
    ]);
  });

  it("findImages gir alle bildene i rekkefølge og bare for den annonsen", async () => {
    const db = createTestDb();
    await insertOwner(db);
    await db.insert(listing).values([validListing({ id: "a" }), validListing({ id: "b" })]);
    await db.insert(listingImage).values([
      { listingId: "a", key: "listings/a/b.jpg", position: 2 },
      { listingId: "a", key: "listings/a/z.jpg", position: 0 },
      { listingId: "b", key: "listings/b/1.jpg", position: 0 },
      { listingId: "a", key: "listings/a/m.jpg", position: 1 },
    ]);

    expect(await createListingRepository(db).findImages("a")).toEqual(["listings/a/z.jpg", "listings/a/m.jpg", "listings/a/b.jpg"]);
    expect(await createListingRepository(db).findImages("c")).toEqual([]);
  });
});

describe("findWithOwner", () => {
  it("returnerer annonsen med eierens navn, men aldri telefon eller e-post", async () => {
    const db = createTestDb();
    await db.insert(user).values({ id: OWNER_ID, name: "Kari Nordmann", email: "kari@hiof.no", phone: "+4791234567" });
    await db.insert(listing).values(validListing({ id: "calc", title: "Kalkulator" }));

    const result = await createListingRepository(db).findWithOwner("calc");

    expect(result?.listing.title).toBe("Kalkulator");
    expect(result?.ownerName).toBe("Kari Nordmann");
    const json = JSON.stringify(result);
    expect(json).not.toContain("kari@hiof.no");
    expect(json).not.toContain("+4791234567");
  });

  it("gir ingenting for en id som ikke finnes", async () => {
    const db = createTestDb();
    await insertOwner(db);
    await db.insert(listing).values(validListing({ id: "calc" }));

    expect(await createListingRepository(db).findWithOwner("finnes-ikke")).toBeUndefined();
  });
});

// Skrivingen i repositoryet (#256): bare eierens egen, aktive annonse kan endres eller tas ned. Godkjent av Max 03.11.
describe("createListingRepository, skriving", () => {
  it("lager annonsen med bildene i rekkefølge, og bare eieren kan endre og ta den ned", async () => {
    const db = createTestDb();
    await insertOwner(db);
    const repository = createListingRepository(db);
    const now = new Date("2026-11-03T12:00:00Z");

    await repository.create({ ...validListing(), id: "ny" }, ["listings/ny/b.jpg", "listings/ny/a.jpg"]);
    expect(await repository.findImages("ny")).toEqual(["listings/ny/b.jpg", "listings/ny/a.jpg"]);

    const fields = { title: "Ny tittel", description: "Beskrivelse", category: "electronics", condition: "used", price: 100 } as const;
    expect(await repository.updateOwnActive("ny", "noen-andre", fields, now)).toBe(false);
    expect(await repository.updateOwnActive("ny", OWNER_ID, fields, now)).toBe(true);
    expect((await repository.findWithOwner("ny"))?.listing.title).toBe("Ny tittel");

    expect(await repository.takeDownOwnActive("ny", "noen-andre", now)).toBe(false);
    expect(await repository.takeDownOwnActive("ny", OWNER_ID, now)).toBe(true);
    expect(await repository.findActive()).toEqual([]);
  });
});
