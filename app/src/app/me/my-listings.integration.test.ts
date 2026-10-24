// Mine annonser (#229, AK-48) mot SQLite i minnet. Godkjent av Max 24.10.
import { beforeEach, describe, expect, it } from "vitest";
import { listing, offer, request, user } from "@/db/schema";
import type { Db } from "@/db/types";
import { createTestDb } from "@/test/test-db";
import { insertOwner, OWNER_ID, validListing } from "@/test/test-listings";
import { getMyListings } from "./my-listings";

const NOW = new Date("2026-10-24T12:00:00Z");
let db: Db;

beforeEach(async () => {
  db = createTestDb();
  await insertOwner(db);
  await db.insert(user).values([
    { id: "kari", name: "Kari Hansen", email: "kari@hiof.no" },
    { id: "per", name: "Per Olsen", email: "per@hiof.no" },
  ]);
});

describe("getMyListings", () => {
  // Endret 24.10 (#229, AK-48): bare aktive annonser; solgte hører til Historikk, og slettede er borte. Godkjent av Max 24.10.
  it("gir bare egne aktive annonser, med ventende forespørsler (utløpte teller ikke) og utlånt til", async () => {
    await db.insert(listing).values([
      validListing({ id: "calc", createdAt: new Date("2026-10-20T10:00:00Z") }),
      validListing({ id: "sold", status: "sold", createdAt: new Date("2026-10-19T10:00:00Z") }),
      validListing({ id: "down", status: "unpublished", createdAt: new Date("2026-10-18T10:00:00Z") }),
      validListing({ id: "drill", type: "loan", price: null, createdAt: new Date("2026-10-17T10:00:00Z") }),
      validListing({ id: "theirs", ownerId: "kari" }),
    ]);
    await db.insert(request).values([
      { id: "fresh", listingId: "calc", requesterId: "kari", status: "waiting_owner", createdAt: new Date("2026-10-23T10:00:00Z") },
      { id: "old", listingId: "calc", requesterId: "per", status: "waiting_owner", createdAt: new Date("2026-10-10T10:00:00Z") },
      { id: "loan", listingId: "drill", requesterId: "per", status: "in_use" },
    ]);
    await db.insert(offer).values([
      { requestId: "fresh", senderId: "kari", price: 200, createdAt: new Date("2026-10-23T10:00:00Z") },
      { requestId: "old", senderId: "per", price: 180, createdAt: new Date("2026-10-10T10:00:00Z") },
      { requestId: "loan", senderId: "per", startDate: "2026-10-20", endDate: "2026-10-30" },
    ]);

    const mine = await getMyListings(db, OWNER_ID, NOW);

    expect(mine.map((row) => [row.listing.id, row.pending, row.loanedUntil])).toEqual([
      ["calc", 1, null],
      ["drill", 0, "2026-10-30"],
    ]);
  });
});
