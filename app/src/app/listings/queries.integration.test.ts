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
