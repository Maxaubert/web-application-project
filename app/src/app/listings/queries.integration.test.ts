// Henting av annonser til forsiden, mot SQLite i minnet med appens migrasjoner. Godkjent av Max 07.10.
import { describe, expect, it } from "vitest";
import { listing, user } from "@/db/schema";
import { createTestDb } from "@/test/test-db";
import { insertOwner, OWNER_ID, validListing } from "@/test/test-listings";
import { getActiveListings, getListingWithOwner } from "./queries";

describe("getActiveListings", () => {
  it("returnerer bare aktive annonser", async () => {
    const db = createTestDb();
    await insertOwner(db);
    await db.insert(listing).values([
      validListing({ id: "active", status: "active" }),
      validListing({ id: "sold", status: "sold" }),
      validListing({ id: "unpublished", status: "unpublished" }),
    ]);

    const result = await getActiveListings(db);

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

    const result = await getActiveListings(db);

    expect(result.map((r) => r.listing.id)).toEqual(["newest", "middle", "oldest"]);
  });

  it("gir en tom liste når det ikke finnes annonser", async () => {
    const db = createTestDb();
    expect(await getActiveListings(db)).toEqual([]);
  });

  it("tar med eierens navn, men aldri telefon eller e-post", async () => {
    const db = createTestDb();
    await db.insert(user).values({ id: OWNER_ID, name: "Kari Nordmann", email: "kari@hiof.no", phone: "+4791234567" });
    await db.insert(listing).values(validListing({ id: "calc" }));

    const result = await getActiveListings(db);

    expect(result[0].ownerName).toBe("Kari Nordmann");
    const json = JSON.stringify(result);
    expect(json).not.toContain("kari@hiof.no");
    expect(json).not.toContain("+4791234567");
  });
});

// Filtrene kjøres i SQL (#102). Godkjent av Max 10.10.
describe("getActiveListings med filtre", () => {
  async function seed() {
    const db = createTestDb();
    await insertOwner(db);
    await db.insert(listing).values([
      validListing({ id: "book-sale", category: "books", type: "sale", condition: "new", price: 300 }),
      validListing({ id: "book-loan", category: "books", type: "loan", condition: "used", price: null }),
      validListing({ id: "bike-sale", category: "bikes", type: "sale", condition: "used", price: 1500 }),
      validListing({ id: "book-gift", category: "books", type: "giveaway", condition: "like_new", price: null }),
      validListing({ id: "book-sold", category: "books", type: "sale", condition: "new", price: 300, status: "sold" }),
    ]);
    return db;
  }
  async function ids(filters: Parameters<typeof getActiveListings>[1]) {
    const result = await getActiveListings(await seed(), filters);
    return result.map((r) => r.listing.id).sort();
  }

  it("filtrerer på kategori, og solgte annonser vises fortsatt ikke", async () => {
    expect(await ids({ category: "books" })).toEqual(["book-gift", "book-loan", "book-sale"]);
  });

  it("flere handelstyper eller tilstander gir annonser som har en av dem", async () => {
    expect(await ids({ type: ["loan", "giveaway"] })).toEqual(["book-gift", "book-loan"]);
    expect(await ids({ condition: ["new", "like_new"] })).toEqual(["book-gift", "book-sale"]);
  });

  it("pris fra og til tar med grensene, og tom pris regnes som 0 kr", async () => {
    expect(await ids({ minPrice: 300, maxPrice: 1500 })).toEqual(["bike-sale", "book-sale"]);
    expect(await ids({ maxPrice: 0 })).toEqual(["book-gift", "book-loan"]);
  });

  it("filtrene kombineres", async () => {
    expect(await ids({ category: "books", type: ["sale", "loan"], condition: ["used"] })).toEqual(["book-loan"]);
  });
});

describe("getListingWithOwner", () => {
  it("returnerer annonsen med eierens navn, men aldri telefon eller e-post", async () => {
    const db = createTestDb();
    await db.insert(user).values({ id: OWNER_ID, name: "Kari Nordmann", email: "kari@hiof.no", phone: "+4791234567" });
    await db.insert(listing).values(validListing({ id: "calc", title: "Kalkulator" }));

    const result = await getListingWithOwner(db, "calc");

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

    expect(await getListingWithOwner(db, "finnes-ikke")).toBeUndefined();
  });
});
