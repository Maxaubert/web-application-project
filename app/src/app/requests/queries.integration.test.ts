// getActiveRequest mot SQLite i minnet: finner studentens pågående forespørsel med siste bud.
import { beforeEach, describe, expect, it } from "vitest";
import { listing, offer, request, requestStatuses, user } from "@/db/schema";
import type { Db } from "@/db/types";
import { createTestDb } from "@/test/test-db";
import { insertOwner, OWNER_ID, validListing } from "@/test/test-listings";
import { getActiveRequest, getRequestForParty } from "./queries";

let db: Db;

beforeEach(async () => {
  db = createTestDb();
  await insertOwner(db);
  await db.insert(user).values([
    { id: "kari", name: "Kari Nordmann", email: "kari@hiof.no" },
    { id: "per", name: "Per Hansen", email: "per@hiof.no" },
  ]);
  await db.insert(listing).values([validListing({ id: "calc" }), validListing({ id: "lamp" })]);
});

describe("getActiveRequest", () => {
  it("gir undefined når studenten ikke har noen forespørsel", async () => {
    expect(await getActiveRequest(db, "calc", "kari")).toBeUndefined();
  });

  it("gir forespørselen med siste bud, også når budene er lagret i samme sekund", async () => {
    await db.insert(request).values({ id: "r1", listingId: "calc", requesterId: "kari" });
    // Samme created_at på alle tre; nyeste bud skal likevel velges, så rekkefølgen kommer fra rowid.
    const sameSecond = new Date(1_700_000_000_000);
    await db.insert(offer).values([
      { requestId: "r1", senderId: "kari", price: 200, createdAt: sameSecond },
      { requestId: "r1", senderId: "kari", price: 210, createdAt: sameSecond },
      { requestId: "r1", senderId: "kari", price: 230, createdAt: sameSecond },
    ]);

    expect(await getActiveRequest(db, "calc", "kari")).toEqual({ id: "r1", status: "waiting_owner", price: 230 });
  });

  it("ser ikke andre studenters forespørsler eller andre annonser", async () => {
    await db.insert(request).values({ id: "r1", listingId: "calc", requesterId: "per" });
    await db.insert(offer).values({ requestId: "r1", senderId: "per", price: 200 });

    expect(await getActiveRequest(db, "calc", "kari")).toBeUndefined();
    expect(await getActiveRequest(db, "lamp", "per")).toBeUndefined();
  });

  it("finner pågående forespørsler og hopper over avsluttede, i hver status", async () => {
    await db.insert(request).values({ id: "r1", listingId: "calc", requesterId: "kari" });
    await db.insert(offer).values({ requestId: "r1", senderId: "kari", price: 200 });

    for (const status of requestStatuses) {
      await db.update(request).set({ status });
      const found = await getActiveRequest(db, "calc", "kari");
      if (["waiting_owner", "waiting_requester", "accepted", "in_use"].includes(status)) expect(found?.status).toBe(status);
      else expect(found, status).toBeUndefined();
    }
  });
});

describe("getRequestForParty", () => {
  beforeEach(async () => {
    await db.insert(request).values({ id: "r1", listingId: "calc", requesterId: "kari" });
    const sameSecond = new Date(1_700_000_000_000);
    await db.insert(offer).values([
      { requestId: "r1", senderId: "kari", price: 200, createdAt: sameSecond },
      { requestId: "r1", senderId: "kari", price: 230, createdAt: sameSecond },
    ]);
  });

  it("gir forespørselen til eieren, med navn, roller og forslagene i rekkefølge", async () => {
    const details = await getRequestForParty(db, "r1", OWNER_ID);

    expect(details).toMatchObject({ role: "owner", ownerName: "Ola Nordmann", requesterName: "Kari Nordmann" });
    expect(details?.request.id).toBe("r1");
    expect(details?.listing.id).toBe("calc");
    expect(details?.offers.map((o) => o.price)).toEqual([200, 230]);
  });

  it("gir forespørselen til den som la den inn, som forespørrer", async () => {
    expect((await getRequestForParty(db, "r1", "kari"))?.role).toBe("requester");
  });

  it("gir undefined for alle andre og for en ukjent id", async () => {
    expect(await getRequestForParty(db, "r1", "per")).toBeUndefined();
    expect(await getRequestForParty(db, "finnes-ikke", "kari")).toBeUndefined();
    expect(await getRequestForParty(db, "r1", "")).toBeUndefined();
  });

  it("henter bare navn fra brukerne, aldri telefon eller e-post", async () => {
    const details = await getRequestForParty(db, "r1", "kari");

    expect(JSON.stringify(details)).not.toMatch(/@hiof\.no|\+47/);
  });
});