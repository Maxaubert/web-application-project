// respondToOffer for lån og gis bort (#208) mot SQLite i minnet: motforslag med ny periode, godkjenning som gjør
// perioden opptatt og avslår de som overlapper, og vakten mot dobbeltbooking. Plan godkjent av Max 20.10.
import { beforeEach, describe, expect, it } from "vitest";
import { listing, offer, request, user } from "@/db/schema";
import type { Db } from "@/db/types";
import { createTestDb } from "@/test/test-db";
import { insertOwner, OWNER_ID, validListing } from "@/test/test-listings";
import { respondToOffer } from "./respond";

const NOW = new Date("2026-10-20T12:00:00Z");
const ASKED_AT = new Date("2026-10-19T12:00:00Z");
let db: Db;

async function snapshot() {
  return { requests: await db.select().from(request), offers: await db.select().from(offer), listings: await db.select().from(listing) };
}

// En forespørsel på annonsen med en gitt status og periode. Hver får sin egen student (én aktiv per student).
async function seedRequest(id: string, status: "waiting_owner" | "waiting_requester" | "accepted" | "in_use" | "declined", startDate: string, endDate: string) {
  await db.insert(user).values({ id: `u-${id}`, name: `Låner ${id}`, email: `${id}@hiof.no` });
  await db.insert(request).values({ id, listingId: "tent", requesterId: `u-${id}`, status });
  await db.insert(offer).values({ id: `o-${id}`, requestId: id, senderId: `u-${id}`, startDate, endDate, createdAt: ASKED_AT });
}

function respond(userId: string, requestId: string, action: string, extra: { startDate?: string; endDate?: string; price?: string } = {}) {
  return respondToOffer(db, { userId, requestId, offerId: `o-${requestId}`, action, now: NOW, ...extra });
}

async function statusOf(id: string) {
  return (await db.select().from(request).all()).find((r) => r.id === id)?.status;
}

beforeEach(async () => {
  db = createTestDb();
  await insertOwner(db);
  await db.insert(listing).values([
    validListing({ id: "tent", type: "loan", price: 60 }),
    validListing({ id: "lamp", type: "giveaway", price: null }),
  ]);
});

describe("motforslag på lån", () => {
  it("lagrer en ny periode fra den som svarer, uten pris, og flytter turen til motparten", async () => {
    await seedRequest("r1", "waiting_owner", "2026-11-12", "2026-11-19");

    const result = await respond(OWNER_ID, "r1", "counter", { startDate: "2026-11-14", endDate: "2026-11-21" });

    expect(result).toEqual({ ok: true });
    const { requests, offers } = await snapshot();
    expect(requests[0]).toMatchObject({ status: "waiting_requester", updatedAt: NOW });
    expect(offers).toHaveLength(2);
    expect(offers[1]).toMatchObject({ requestId: "r1", senderId: OWNER_ID, price: null, startDate: "2026-11-14", endDate: "2026-11-21" });
  });

  it("avviser en periode under 7 dager og lagrer ingenting", async () => {
    await seedRequest("r1", "waiting_owner", "2026-11-12", "2026-11-19");
    const before = await snapshot();

    const result = await respond(OWNER_ID, "r1", "counter", { startDate: "2026-11-14", endDate: "2026-11-17" });

    expect(result).toEqual({ ok: false, fieldErrors: { endDate: "Lånet må vare minst én uke" } });
    expect(await snapshot()).toEqual(before);
  });

  it("avviser en pris sendt med et lånemotbud", async () => {
    await seedRequest("r1", "waiting_owner", "2026-11-12", "2026-11-19");
    const before = await snapshot();

    const result = await respond(OWNER_ID, "r1", "counter", { price: "100", startDate: "2026-11-14", endDate: "2026-11-21" });

    expect(result).toMatchObject({ ok: false, fieldErrors: { price: expect.any(String) } });
    expect(await snapshot()).toEqual(before);
  });

  it("avviser en periode som overlapper et godtatt lån, og lagrer ingenting", async () => {
    await seedRequest("r1", "waiting_owner", "2026-11-12", "2026-11-19");
    await seedRequest("r2", "accepted", "2026-11-20", "2026-11-27");
    const before = await snapshot();

    const result = await respond(OWNER_ID, "r1", "counter", { startDate: "2026-11-24", endDate: "2026-12-01" });

    expect(result).toEqual({ ok: false, error: "Perioden overlapper en opptatt periode" });
    expect(await snapshot()).toEqual(before);
  });

  it("kjøperen kan svare på et motforslag med et nytt", async () => {
    await seedRequest("r1", "waiting_requester", "2026-11-14", "2026-11-21");

    const result = await respond("u-r1", "r1", "counter", { startDate: "2026-11-15", endDate: "2026-11-22" });

    expect(result).toEqual({ ok: true });
    expect(await statusOf("r1")).toBe("waiting_owner");
  });

  it("en gis bort kan ikke få motbud", async () => {
    await db.insert(user).values({ id: "kari", name: "Kari", email: "k@hiof.no" });
    await db.insert(request).values({ id: "g1", listingId: "lamp", requesterId: "kari" });
    await db.insert(offer).values({ id: "o-g1", requestId: "g1", senderId: "kari", createdAt: ASKED_AT });
    const before = await snapshot();

    const result = await respond(OWNER_ID, "g1", "counter", { price: "10" });

    expect(result).toEqual({ ok: false, error: "Du kan ikke sende motbud på en gis bort" });
    expect(await snapshot()).toEqual(before);
  });
});

describe("godta et lån", () => {
  it("forespørselen er avtalt, og annonsen ligger fortsatt ute", async () => {
    await seedRequest("r1", "waiting_owner", "2026-11-12", "2026-11-19");

    expect(await respond(OWNER_ID, "r1", "accept")).toEqual({ ok: true });

    expect(await statusOf("r1")).toBe("accepted");
    expect((await snapshot()).listings.find((l) => l.id === "tent")?.status).toBe("active");
  });

  it("ventende forespørsler som overlapper perioden, avslås, uansett hvem som har tur", async () => {
    await seedRequest("r1", "waiting_owner", "2026-11-12", "2026-11-19");
    await seedRequest("r2", "waiting_owner", "2026-11-18", "2026-11-25");
    await seedRequest("r3", "waiting_requester", "2026-11-01", "2026-11-12");

    await respond(OWNER_ID, "r1", "accept");

    expect(await statusOf("r2")).toBe("declined");
    expect(await statusOf("r3")).toBe("declined");
  });

  it("ventende forespørsler på andre perioder røres ikke, og heller ikke avsluttede", async () => {
    await seedRequest("r1", "waiting_owner", "2026-11-12", "2026-11-19");
    await seedRequest("r2", "waiting_owner", "2026-11-20", "2026-11-27");
    await seedRequest("r3", "declined", "2026-11-12", "2026-11-19");
    const declinedAt = (await snapshot()).requests.find((r) => r.id === "r3")?.updatedAt;

    await respond(OWNER_ID, "r1", "accept");

    expect(await statusOf("r2")).toBe("waiting_owner");
    const r3 = (await snapshot()).requests.find((r) => r.id === "r3");
    expect(r3).toMatchObject({ status: "declined", updatedAt: declinedAt });
  });

  it("forespørsler på andre annonser røres ikke", async () => {
    await seedRequest("r1", "waiting_owner", "2026-11-12", "2026-11-19");
    await db.insert(user).values({ id: "kari", name: "Kari", email: "k@hiof.no" });
    await db.insert(listing).values(validListing({ id: "tent2", type: "loan", price: 60 }));
    await db.insert(request).values({ id: "x1", listingId: "tent2", requesterId: "kari" });
    await db.insert(offer).values({ id: "o-x1", requestId: "x1", senderId: "kari", startDate: "2026-11-12", endDate: "2026-11-19" });

    await respond(OWNER_ID, "r1", "accept");

    expect(await statusOf("x1")).toBe("waiting_owner");
  });

  it("avviser en periode som overlapper et godtatt lån, og endrer ingenting", async () => {
    await seedRequest("r1", "waiting_owner", "2026-11-12", "2026-11-19");
    await seedRequest("r2", "accepted", "2026-11-19", "2026-11-26");
    const before = await snapshot();

    const result = await respond(OWNER_ID, "r1", "accept");

    expect(result).toEqual({ ok: false, error: "Perioden overlapper en opptatt periode" });
    expect(await snapshot()).toEqual(before);
  });

  it("et lån i bruk er også opptatt", async () => {
    await seedRequest("r1", "waiting_owner", "2026-11-12", "2026-11-19");
    await seedRequest("r2", "in_use", "2026-11-10", "2026-11-13");

    expect(await respond(OWNER_ID, "r1", "accept")).toMatchObject({ ok: false, error: "Perioden overlapper en opptatt periode" });
  });

  it("kjøperen kan godta et motforslag, og da gjelder motforslagets periode", async () => {
    await seedRequest("r1", "waiting_requester", "2026-11-14", "2026-11-21");
    await seedRequest("r2", "waiting_owner", "2026-11-20", "2026-11-27");

    expect(await respond("u-r1", "r1", "accept")).toEqual({ ok: true });

    expect(await statusOf("r1")).toBe("accepted");
    expect(await statusOf("r2")).toBe("declined");
  });

  it("to samtidige aksepter på perioder som overlapper, ender aldri med at begge er godtatt", async () => {
    await seedRequest("r1", "waiting_owner", "2026-11-12", "2026-11-19");
    await seedRequest("r2", "waiting_owner", "2026-11-15", "2026-11-22");

    const results = await Promise.all([respond(OWNER_ID, "r1", "accept"), respond(OWNER_ID, "r2", "accept")]);

    const accepted = [await statusOf("r1"), await statusOf("r2")].filter((status) => status === "accepted");
    expect(accepted.length).toBeLessThanOrEqual(1);
    expect(results.filter((result) => result.ok).length).toBe(accepted.length);
  });
});

describe("godta en gis bort", () => {
  it("tar annonsen ut av søket som for salg, og avslår de andre", async () => {
    await db.insert(user).values([
      { id: "kari", name: "Kari", email: "k@hiof.no" },
      { id: "per", name: "Per", email: "p@hiof.no" },
    ]);
    await db.insert(request).values([
      { id: "g1", listingId: "lamp", requesterId: "kari" },
      { id: "g2", listingId: "lamp", requesterId: "per" },
    ]);
    await db.insert(offer).values([
      { id: "o-g1", requestId: "g1", senderId: "kari", createdAt: ASKED_AT },
      { id: "o-g2", requestId: "g2", senderId: "per", createdAt: ASKED_AT },
    ]);

    expect(await respond(OWNER_ID, "g1", "accept")).toEqual({ ok: true });

    expect(await statusOf("g1")).toBe("accepted");
    expect(await statusOf("g2")).toBe("declined");
    expect((await snapshot()).listings.find((l) => l.id === "lamp")?.status).toBe("sold");
  });
});
