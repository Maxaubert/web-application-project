// «Ta ned» (#229, AK-46, AK-47) mot SQLite i minnet med appens migrasjoner. Godkjent av Max 24.10.
import { eq } from "drizzle-orm";
import { beforeEach, describe, expect, it } from "vitest";
import { listing, request, user } from "@/db/schema";
import type { Db } from "@/db/types";
import { createTestDb } from "@/test/test-db";
import { insertOwner, OWNER_ID, validListing } from "@/test/test-listings";
import { getActiveListings } from "./queries";
import { unpublishListing } from "./unpublish";

let db: Db;

beforeEach(async () => {
  db = createTestDb();
  await insertOwner(db);
  await db.insert(user).values([
    { id: "kari", name: "Kari Hansen", email: "kari@hiof.no" },
    { id: "per", name: "Per Olsen", email: "per@hiof.no" },
    { id: "liv", name: "Liv Berg", email: "liv@hiof.no" },
  ]);
  await db.insert(listing).values(validListing({ id: "calc" }));
});

const statusOf = async (id: string) => (await db.select({ status: listing.status }).from(listing).where(eq(listing.id, id)))[0]?.status;
const requestStatus = async (id: string) => (await db.select({ status: request.status }).from(request).where(eq(request.id, id)))[0]?.status;

describe("unpublishListing", () => {
  it("tar eierens aktive annonse ut av søket", async () => {
    expect(await unpublishListing(db, { userId: OWNER_ID, listingId: "calc" })).toEqual({ ok: true });
    expect(await statusOf("calc")).toBe("unpublished");
    expect((await getActiveListings(db)).map((row) => row.listing.id)).not.toContain("calc");
  });

  it("avviser en annen brukers forsøk uten å endre noe (TK-03)", async () => {
    expect((await unpublishListing(db, { userId: "kari", listingId: "calc" })).ok).toBe(false);
    expect(await statusOf("calc")).toBe("active");
  });

  it("avviser en solgt eller allerede nedtatt annonse uten å endre noe", async () => {
    await db.insert(listing).values([validListing({ id: "sold", status: "sold" }), validListing({ id: "down", status: "unpublished" })]);
    expect((await unpublishListing(db, { userId: OWNER_ID, listingId: "sold" })).ok).toBe(false);
    expect((await unpublishListing(db, { userId: OWNER_ID, listingId: "down" })).ok).toBe(false);
    expect(await statusOf("sold")).toBe("sold");
    expect(await statusOf("down")).toBe("unpublished");
  });

  it("avslår ventende forespørsler, men lar godtatte avtaler og lån i bruk være (AK-47)", async () => {
    await db.insert(listing).values(validListing({ id: "drill", type: "loan", price: null }));
    await db.insert(request).values([
      { id: "w1", listingId: "calc", requesterId: "kari", status: "waiting_owner" },
      { id: "w2", listingId: "calc", requesterId: "per", status: "waiting_requester" },
      { id: "a1", listingId: "calc", requesterId: "liv", status: "accepted" },
      { id: "u1", listingId: "drill", requesterId: "kari", status: "in_use" },
      { id: "w3", listingId: "drill", requesterId: "per", status: "waiting_owner" },
    ]);

    await unpublishListing(db, { userId: OWNER_ID, listingId: "calc" });
    await unpublishListing(db, { userId: OWNER_ID, listingId: "drill" });

    expect(await requestStatus("w1")).toBe("declined");
    expect(await requestStatus("w2")).toBe("declined");
    expect(await requestStatus("w3")).toBe("declined");
    expect(await requestStatus("a1")).toBe("accepted");
    expect(await requestStatus("u1")).toBe("in_use");
  });
});
