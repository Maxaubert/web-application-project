// getActiveRequest mot SQLite i minnet: finner studentens pågående forespørsel med siste bud.
import { beforeEach, describe, expect, it } from "vitest";
import { listing, listingImage, offer, request, requestStatuses, user } from "@/db/schema";
import type { Db } from "@/db/types";
import { createTestDb } from "@/test/test-db";
import { insertOwner, OWNER_ID, validListing } from "@/test/test-listings";
import { getActiveRequest, getRequestForParty, getRequestsForUser } from "./queries";

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

describe("getRequestsForUser", () => {
  const sameSecond = new Date(1_700_000_000_000);

  beforeEach(async () => {
    await db.insert(request).values([
      { id: "r1", listingId: "calc", requesterId: "kari" },
      { id: "r2", listingId: "lamp", requesterId: "per" },
    ]);
    await db.insert(offer).values([
      { requestId: "r1", senderId: "kari", price: 200, createdAt: sameSecond },
      { requestId: "r1", senderId: "kari", price: 230, createdAt: sameSecond },
      { requestId: "r2", senderId: "per", price: 90, createdAt: new Date(1_700_000_100_000) },
    ]);
  });

  it("eieren ser forespørslene på sine annonser, med kjøperen som motpart og siste bud", async () => {
    const mine = await getRequestsForUser(db, OWNER_ID);

    expect(mine.map((r) => r.id).sort()).toEqual(["r1", "r2"]);
    const r1 = mine.find((r) => r.id === "r1");
    expect(r1).toMatchObject({ role: "owner", otherName: "Kari Nordmann", status: "waiting_owner", price: 230 });
    expect(r1?.listing.id).toBe("calc");
    expect(r1?.changedAt).toEqual(sameSecond);
  });

  it("kjøperen ser bare sine egne forespørsler, med selgeren som motpart", async () => {
    const mine = await getRequestsForUser(db, "kari");

    expect(mine).toHaveLength(1);
    expect(mine[0]).toMatchObject({ id: "r1", role: "requester", otherName: "Ola Nordmann", price: 230 });
  });

  it("gir en tom liste for en bruker uten forespørsler og for en ukjent bruker", async () => {
    await db.insert(user).values({ id: "mia", name: "Mia Berg", email: "mia@hiof.no" });

    expect(await getRequestsForUser(db, "mia")).toEqual([]);
    expect(await getRequestsForUser(db, "finnes-ikke")).toEqual([]);
    expect(await getRequestsForUser(db, "")).toEqual([]);
  });

  it("tar med forespørsler i alle statuser, også avsluttede", async () => {
    await db.update(request).set({ status: "declined" });

    const mine = await getRequestsForUser(db, "kari");

    expect(mine.map((r) => r.status)).toEqual(["declined"]);
  });

  it("bruker forsidebildet, og gir null for en annonse uten bilde", async () => {
    await db.insert(listingImage).values([
      { listingId: "calc", key: "calc-1", position: 1 },
      { listingId: "calc", key: "calc-0", position: 0 },
    ]);

    const mine = await getRequestsForUser(db, OWNER_ID);

    expect(mine.find((r) => r.id === "r1")?.coverKey).toBe("calc-0");
    expect(mine.find((r) => r.id === "r2")?.coverKey).toBeNull();
    // Flere bilder skal ikke gi flere rader.
    expect(mine).toHaveLength(2);
  });

  it("henter bare navn fra brukerne, aldri telefon eller e-post", async () => {
    expect(JSON.stringify(await getRequestsForUser(db, "kari"))).not.toMatch(/@hiof\.no|\+47/);
  });
});