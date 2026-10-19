// getActiveRequest mot SQLite i minnet: finner studentens pågående forespørsel med siste bud.
import { eq } from "drizzle-orm";
import { beforeEach, describe, expect, it } from "vitest";
import { listing, listingImage, offer, request, requestStatuses, user } from "@/db/schema";
import type { Db } from "@/db/types";
import { createTestDb } from "@/test/test-db";
import { insertOwner, OWNER_ID, validListing } from "@/test/test-listings";
import { getActiveRequest, getRequestForParty, getRequestsForUser } from "./queries";

let db: Db;
// Litt etter budene som er lagret under (1 700 000 000 000 ms), så ingenting er utløpt med mindre testen sier det.
const NOW = new Date(1_700_003_600_000);
const DAY_MS = 86_400_000;

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
    expect(await getActiveRequest(db, "calc", "kari", NOW)).toBeUndefined();
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

    expect(await getActiveRequest(db, "calc", "kari", NOW)).toEqual({ id: "r1", status: "waiting_owner", price: 230 });
  });

  it("ser ikke andre studenters forespørsler eller andre annonser", async () => {
    await db.insert(request).values({ id: "r1", listingId: "calc", requesterId: "per" });
    await db.insert(offer).values({ requestId: "r1", senderId: "per", price: 200 });

    expect(await getActiveRequest(db, "calc", "kari", NOW)).toBeUndefined();
    expect(await getActiveRequest(db, "lamp", "per", NOW)).toBeUndefined();
  });

  it("finner pågående forespørsler og hopper over avsluttede, i hver status", async () => {
    await db.insert(request).values({ id: "r1", listingId: "calc", requesterId: "kari" });
    await db.insert(offer).values({ requestId: "r1", senderId: "kari", price: 200 });

    for (const status of requestStatuses) {
      await db.update(request).set({ status });
      const found = await getActiveRequest(db, "calc", "kari", NOW);
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
    const details = await getRequestForParty(db, "r1", OWNER_ID, NOW);

    expect(details).toMatchObject({ role: "owner", ownerName: "Ola Nordmann", requesterName: "Kari Nordmann" });
    expect(details?.request.id).toBe("r1");
    expect(details?.listing.id).toBe("calc");
    expect(details?.offers.map((o) => o.price)).toEqual([200, 230]);
  });

  it("gir forespørselen til den som la den inn, som forespørrer", async () => {
    expect((await getRequestForParty(db, "r1", "kari", NOW))?.role).toBe("requester");
  });

  it("gir undefined for alle andre og for en ukjent id", async () => {
    expect(await getRequestForParty(db, "r1", "per", NOW)).toBeUndefined();
    expect(await getRequestForParty(db, "finnes-ikke", "kari", NOW)).toBeUndefined();
    expect(await getRequestForParty(db, "r1", "", NOW)).toBeUndefined();
  });

  it("henter bare navn fra brukerne, aldri telefon eller e-post", async () => {
    const details = await getRequestForParty(db, "r1", "kari", NOW);

    expect(JSON.stringify(details)).not.toMatch(/@hiof\.no|\+47/);
  });
});

describe("getRequestsForUser", () => {
  const sameSecond = new Date(1_700_000_000_000);

  beforeEach(async () => {
    await db.insert(request).values([
      { id: "r1", listingId: "calc", requesterId: "kari", updatedAt: sameSecond },
      { id: "r2", listingId: "lamp", requesterId: "per", updatedAt: new Date(1_700_000_100_000) },
    ]);
    await db.insert(offer).values([
      { requestId: "r1", senderId: "kari", price: 200, createdAt: sameSecond },
      { requestId: "r1", senderId: "kari", price: 230, createdAt: sameSecond },
      { requestId: "r2", senderId: "per", price: 90, createdAt: new Date(1_700_000_100_000) },
    ]);
  });

  it("eieren ser forespørslene på sine annonser, med kjøperen som motpart og siste bud", async () => {
    const mine = await getRequestsForUser(db, OWNER_ID, NOW);

    expect(mine.map((r) => r.id).sort()).toEqual(["r1", "r2"]);
    const r1 = mine.find((r) => r.id === "r1");
    expect(r1).toMatchObject({ role: "owner", otherName: "Kari Nordmann", status: "waiting_owner", price: 230 });
    expect(r1?.listing.id).toBe("calc");
    expect(r1?.changedAt).toEqual(sameSecond);
  });

  it("kjøperen ser bare sine egne forespørsler, med selgeren som motpart", async () => {
    const mine = await getRequestsForUser(db, "kari", NOW);

    expect(mine).toHaveLength(1);
    expect(mine[0]).toMatchObject({ id: "r1", role: "requester", otherName: "Ola Nordmann", price: 230 });
  });

  it("gir en tom liste for en bruker uten forespørsler og for en ukjent bruker", async () => {
    await db.insert(user).values({ id: "mia", name: "Mia Berg", email: "mia@hiof.no" });

    expect(await getRequestsForUser(db, "mia", NOW)).toEqual([]);
    expect(await getRequestsForUser(db, "finnes-ikke", NOW)).toEqual([]);
    expect(await getRequestsForUser(db, "", NOW)).toEqual([]);
  });

  it("tar med forespørsler i alle statuser, også avsluttede", async () => {
    await db.update(request).set({ status: "declined" });

    const mine = await getRequestsForUser(db, "kari", NOW);

    expect(mine.map((r) => r.status)).toEqual(["declined"]);
  });

  it("bruker forsidebildet, og gir null for en annonse uten bilde", async () => {
    await db.insert(listingImage).values([
      { listingId: "calc", key: "calc-1", position: 1 },
      { listingId: "calc", key: "calc-0", position: 0 },
    ]);

    const mine = await getRequestsForUser(db, OWNER_ID, NOW);

    expect(mine.find((r) => r.id === "r1")?.coverKey).toBe("calc-0");
    expect(mine.find((r) => r.id === "r2")?.coverKey).toBeNull();
    // Flere bilder skal ikke gi flere rader.
    expect(mine).toHaveLength(2);
  });

  it("«Sist endret» er siste statusendring når den er nyere enn siste bud, ellers siste bud (#187)", async () => {
    const declinedAt = new Date(sameSecond.getTime() + 3_600_000);
    await db.update(request).set({ status: "declined", updatedAt: declinedAt }).where(eq(request.id, "r1"));
    // r2: forespørselen er eldre enn siste bud (et bud som erstattet et tidligere), så budet gjelder.
    await db.update(request).set({ updatedAt: new Date(1_600_000_000_000) }).where(eq(request.id, "r2"));

    const mine = await getRequestsForUser(db, OWNER_ID, NOW);

    expect(mine.find((r) => r.id === "r1")?.changedAt).toEqual(declinedAt);
    expect(mine.find((r) => r.id === "r2")?.changedAt).toEqual(new Date(1_700_000_100_000));
  });

  it("henter bare navn fra brukerne, aldri telefon eller e-post", async () => {
    expect(JSON.stringify(await getRequestsForUser(db, "kari", NOW))).not.toMatch(/@hiof\.no|\+47/);
  });
});

// 7-dagersfristen (#187): lesing regner ut at en forespørsel er utløpt, men skriver aldri til databasen.
describe("utløp ved lesing", () => {
  const BID_AT = new Date(1_700_000_000_000);
  const justBefore = new Date(BID_AT.getTime() + 7 * DAY_MS - 1000);
  const dueAt = new Date(BID_AT.getTime() + 7 * DAY_MS);

  beforeEach(async () => {
    await db.insert(request).values({ id: "r1", listingId: "calc", requesterId: "kari" });
    await db.insert(offer).values({ requestId: "r1", senderId: "kari", price: 200, createdAt: BID_AT });
  });

  it("getActiveRequest: ubesvart i 7 dager er ikke lenger pågående, ett sekund før er det", async () => {
    expect(await getActiveRequest(db, "calc", "kari", justBefore)).toMatchObject({ id: "r1", status: "waiting_owner" });
    expect(await getActiveRequest(db, "calc", "kari", dueAt)).toBeUndefined();
  });

  it("getRequestForParty og getRequestsForUser: statusen er utløpt etter 7 dager, og raden i databasen er uendret", async () => {
    expect((await getRequestForParty(db, "r1", "kari", justBefore))?.request.status).toBe("waiting_owner");
    expect((await getRequestForParty(db, "r1", "kari", dueAt))?.request.status).toBe("expired");
    expect((await getRequestsForUser(db, OWNER_ID, justBefore))[0].status).toBe("waiting_owner");
    expect((await getRequestsForUser(db, OWNER_ID, dueAt))[0].status).toBe("expired");
    expect((await db.select().from(request))[0].status).toBe("waiting_owner");
  });

  it("et motbud starter 7 nye dager, og en godtatt forespørsel utløper aldri", async () => {
    await db.insert(offer).values({ requestId: "r1", senderId: OWNER_ID, price: 240, createdAt: new Date(BID_AT.getTime() + 5 * DAY_MS) });
    await db.update(request).set({ status: "waiting_requester" });
    expect((await getRequestForParty(db, "r1", "kari", dueAt))?.request.status).toBe("waiting_requester");

    await db.update(request).set({ status: "accepted" });
    const later = new Date(BID_AT.getTime() + 60 * DAY_MS);
    expect((await getRequestForParty(db, "r1", "kari", later))?.request.status).toBe("accepted");
    expect((await getRequestsForUser(db, "kari", later))[0].status).toBe("accepted");
  });
});
