// Henting av annonser til forsiden, mot SQLite i minnet med appens migrasjoner. Godkjent av Max 07.10.
import { describe, expect, it } from "vitest";
import { listing } from "@/db/schema";
import { createTestDb } from "@/test/test-db";
import { insertOwner, validListing } from "@/test/test-listings";
import { getActiveListings } from "./queries";

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

    expect(result.map((l) => l.id)).toEqual(["active"]);
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

    expect(result.map((l) => l.id)).toEqual(["newest", "middle", "oldest"]);
  });

  it("gir en tom liste når det ikke finnes annonser", async () => {
    const db = createTestDb();
    expect(await getActiveListings(db)).toEqual([]);
  });
});
