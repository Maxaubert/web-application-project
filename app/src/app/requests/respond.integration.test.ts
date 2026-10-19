// respondToOffer (FK-05 til FK-07, #187) mot SQLite i minnet med appens migrasjoner. Hver avvisning sjekker at
// ingenting i databasen ble endret, og hvert gyldig svar at riktig status og forslag ble lagret.
import { eq } from "drizzle-orm";
import { beforeEach, describe, expect, it } from "vitest";
import { listing, offer, request, requestStatuses, user } from "@/db/schema";
import type { Db } from "@/db/types";
import { createTestDb } from "@/test/test-db";
import { insertOwner, OWNER_ID, validListing } from "@/test/test-listings";
import { respondToOffer } from "./respond";

const DAY_MS = 86_400_000;
const BID_AT = new Date("2026-10-17T12:00:00Z");
const NOW = new Date("2026-10-18T12:00:00Z");
let db: Db;

const O1 = "o1";

async function snapshot() {
  return { requests: await db.select().from(request), offers: await db.select().from(offer), listings: await db.select().from(listing) };
}

async function respond(userId: string, action: string, extra: { price?: string; offerId?: string; requestId?: string; now?: Date } = {}) {
  return respondToOffer(db, { userId, requestId: extra.requestId ?? "r1", offerId: extra.offerId ?? O1, action, price: extra.price, now: extra.now ?? NOW });
}

async function expectRejected(userId: string, action: string, expected: object, extra: Parameters<typeof respond>[2] = {}) {
  const before = await snapshot();
  expect(await respond(userId, action, extra)).toMatchObject({ ok: false, ...expected });
  expect(await snapshot()).toEqual(before);
}

async function latestOfferId() {
  const all = await db.select().from(offer);
  return all[all.length - 1].id;
}

beforeEach(async () => {
  db = createTestDb();
  await insertOwner(db);
  await db.insert(user).values([
    { id: "kari", name: "Kari Hansen", email: "kari@hiof.no" },
    { id: "per", name: "Per Olsen", email: "per@hiof.no" },
  ]);
  await db.insert(listing).values(validListing({ id: "calc", price: 250 }));
  await db.insert(request).values({ id: "r1", listingId: "calc", requesterId: "kari" });
  await db.insert(offer).values({ id: O1, requestId: "r1", senderId: "kari", price: 220, createdAt: BID_AT });
});

describe("respondToOffer, gyldige svar", () => {
  it("selgeren godtar budet: forespørselen er avtalt, tidspunktet er satt, og ingen nye forslag lagres", async () => {
    expect(await respond(OWNER_ID, "accept")).toEqual({ ok: true });

    const { requests, offers } = await snapshot();
    expect(requests[0]).toMatchObject({ status: "accepted", updatedAt: NOW });
    expect(offers).toHaveLength(1);
  });

  it("selgeren avslår budet", async () => {
    expect(await respond(OWNER_ID, "decline")).toEqual({ ok: true });

    expect((await snapshot()).requests[0]).toMatchObject({ status: "declined", updatedAt: NOW });
  });

  it("selgeren sender et motbud: nytt forslag fra selgeren, og nå er det kjøperens tur", async () => {
    expect(await respond(OWNER_ID, "counter", { price: "240" })).toEqual({ ok: true });

    const { requests, offers } = await snapshot();
    expect(requests[0]).toMatchObject({ status: "waiting_requester", updatedAt: NOW });
    expect(offers).toHaveLength(2);
    expect(offers[1]).toMatchObject({ requestId: "r1", senderId: OWNER_ID, price: 240 });
  });

  it("kjøperen godtar motbudet", async () => {
    await respond(OWNER_ID, "counter", { price: "240" });

    expect(await respond("kari", "accept", { offerId: await latestOfferId() })).toEqual({ ok: true });
    expect((await snapshot()).requests[0].status).toBe("accepted");
  });

  it("kjøperen kan avslå motbudet, eller svare med et nytt bud som gir selgeren tur igjen", async () => {
    await respond(OWNER_ID, "counter", { price: "240" });
    expect(await respond("kari", "counter", { price: "230", offerId: await latestOfferId() })).toEqual({ ok: true });

    const { requests, offers } = await snapshot();
    expect(requests[0].status).toBe("waiting_owner");
    expect(offers.map((o) => [o.senderId, o.price])).toEqual([["kari", 220], [OWNER_ID, 240], ["kari", 230]]);

    expect(await respond(OWNER_ID, "decline", { offerId: await latestOfferId() })).toEqual({ ok: true });
    expect((await snapshot()).requests[0].status).toBe("declined");
  });

  it("ett sekund før fristen kan det fortsatt besvares", async () => {
    const result = await respond(OWNER_ID, "accept", { now: new Date(BID_AT.getTime() + 7 * DAY_MS - 1000) });

    expect(result).toEqual({ ok: true });
  });
});

describe("respondToOffer, avvisning endrer ingenting", () => {
  it("avviser kjøperen mens selgeren har tur, og selgeren mens kjøperen har tur", async () => {
    for (const action of ["accept", "decline", "counter"]) {
      await expectRejected("kari", action, { error: "Du kan ikke svare på denne forespørselen nå" }, { price: "240" });
    }
    await db.update(request).set({ status: "waiting_requester" });
    for (const action of ["accept", "decline", "counter"]) {
      await expectRejected(OWNER_ID, action, { error: "Du kan ikke svare på denne forespørselen nå" }, { price: "240" });
    }
  });

  it("avviser alle på en avsluttet eller pågående avtale", async () => {
    for (const status of requestStatuses.filter((s) => !s.startsWith("waiting") && s !== "expired")) {
      await db.update(request).set({ status });
      for (const userId of [OWNER_ID, "kari"]) {
        await expectRejected(userId, "accept", { error: "Du kan ikke svare på denne forespørselen nå" });
      }
    }
  });

  it("avviser en tredjepart og en ukjent forespørsel med samme melding", async () => {
    await expectRejected("per", "accept", { error: "Forespørselen finnes ikke" });
    await expectRejected(OWNER_ID, "accept", { error: "Forespørselen finnes ikke" }, { requestId: "finnes-ikke" });
    await expectRejected("", "accept", { error: "Forespørselen finnes ikke" });
  });

  it("avviser en ukjent handling", async () => {
    for (const action of ["", "withdraw", "cancel", "ACCEPT", "expire"]) {
      await expectRejected(OWNER_ID, action, { error: "Ukjent handling" });
    }
  });

  it("avviser et gammelt forslag: kjøperen byttet bud mens selgeren hadde siden åpen", async () => {
    await db.insert(offer).values({ id: "o2", requestId: "r1", senderId: "kari", price: 200, createdAt: new Date(BID_AT.getTime() + 1000) });

    await expectRejected(OWNER_ID, "accept", { error: "Forslaget er endret. Last siden på nytt." });
    await expectRejected(OWNER_ID, "accept", { error: "Forslaget er endret. Last siden på nytt." }, { offerId: "finnes-ikke" });
    await expectRejected(OWNER_ID, "accept", { error: "Forslaget er endret. Last siden på nytt." }, { offerId: "" });
    expect(await respond(OWNER_ID, "accept", { offerId: "o2" })).toEqual({ ok: true });
  });

  it.each([
    ["0", "Bud må være minst 1 kr"],
    ["", "Skriv et bud"],
    ["100001", "Bud kan være høyst 100 000 kr"],
    ["12.5", "Bud må være et helt tall, for eksempel 250"],
  ])("avviser motbudet «%s», og lagrer ikke noe forslag", async (price, message) => {
    await expectRejected(OWNER_ID, "counter", { fieldErrors: { price: message } }, { price });
  });

  it("godta og avslå bryr seg ikke om en pris som følger med", async () => {
    expect(await respond(OWNER_ID, "accept", { price: "999" })).toEqual({ ok: true });
    expect((await snapshot()).offers).toHaveLength(1);
  });
});

describe("respondToOffer, aksept tar annonsen ut av søket (#201)", () => {
  beforeEach(async () => {
    await db.insert(user).values([
      { id: "mia", name: "Mia Berg", email: "mia@hiof.no" },
      { id: "ola2", name: "Ola Dahl", email: "ola2@hiof.no" },
    ]);
    await db.insert(request).values([
      { id: "r2", listingId: "calc", requesterId: "per" },
      { id: "r3", listingId: "calc", requesterId: "mia", status: "waiting_requester" },
      { id: "r4", listingId: "calc", requesterId: "ola2", status: "withdrawn" },
    ]);
    await db.insert(offer).values([
      { id: "p1", requestId: "r2", senderId: "per", price: 240, createdAt: BID_AT },
      { id: "m1", requestId: "r3", senderId: "mia", price: 230, createdAt: BID_AT },
      { id: "m2", requestId: "r3", senderId: OWNER_ID, price: 245, createdAt: BID_AT },
      { id: "l1", requestId: "r4", senderId: "ola2", price: 100, createdAt: BID_AT },
    ]);
    await db.insert(listing).values(validListing({ id: "lamp" }));
    await db.insert(request).values({ id: "r5", listingId: "lamp", requesterId: "per" });
    await db.insert(offer).values({ id: "x1", requestId: "r5", senderId: "per", price: 90, createdAt: BID_AT });
  });

  async function statuses() {
    return Object.fromEntries((await db.select().from(request)).map((r) => [r.id, r.status]));
  }
  async function listingStatus(id = "calc") {
    return (await db.select().from(listing)).find((l) => l.id === id)?.status;
  }

  it("et godtatt salg setter annonsen til solgt og avslår de andre som venter, på begge sider", async () => {
    expect(await respond(OWNER_ID, "accept")).toEqual({ ok: true });

    expect(await listingStatus()).toBe("sold");
    expect((await db.select().from(listing)).find((l) => l.id === "calc")?.updatedAt).toEqual(NOW);
    expect(await statuses()).toEqual({ r1: "accepted", r2: "declined", r3: "declined", r4: "withdrawn", r5: "waiting_owner" });
    const declined = (await db.select().from(request)).filter((r) => r.status === "declined");
    expect(declined.map((r) => r.updatedAt)).toEqual([NOW, NOW]);
  });

  it("kjøperen som godtar et motbud tar også annonsen", async () => {
    expect(await respond("mia", "accept", { requestId: "r3", offerId: "m2" })).toEqual({ ok: true });

    expect(await listingStatus()).toBe("sold");
    expect(await statuses()).toMatchObject({ r1: "declined", r2: "declined", r3: "accepted" });
  });

  it("en godtatt gis bort tar annonsen på samme måte", async () => {
    await db.update(listing).set({ type: "giveaway", price: null }).where(eq(listing.id, "calc"));

    expect(await respond(OWNER_ID, "accept")).toEqual({ ok: true });

    expect(await listingStatus()).toBe("sold");
    expect((await statuses()).r2).toBe("declined");
  });

  it("et godtatt lån lar annonsen ligge og de andre vente", async () => {
    await db.update(listing).set({ type: "loan" }).where(eq(listing.id, "calc"));

    expect(await respond(OWNER_ID, "accept")).toEqual({ ok: true });

    expect(await listingStatus()).toBe("active");
    expect(await statuses()).toMatchObject({ r1: "accepted", r2: "waiting_owner", r3: "waiting_requester" });
  });

  it("avslag og motbud rører verken annonsen eller de andre", async () => {
    await respond(OWNER_ID, "counter", { price: "240" });
    await db.update(request).set({ status: "waiting_owner" }).where(eq(request.id, "r1"));
    await respond(OWNER_ID, "decline", { offerId: await latestOfferId() });

    expect(await listingStatus()).toBe("active");
    expect(await statuses()).toMatchObject({ r2: "waiting_owner", r3: "waiting_requester" });
  });

  it("avviser aksept når annonsen alt er solgt, nedtatt eller tatt av et annet bud, uten å endre noe", async () => {
    for (const status of ["sold", "unpublished"] as const) {
      await db.update(listing).set({ status }).where(eq(listing.id, "calc"));
      await expectRejected(OWNER_ID, "accept", { error: "Annonsen er ikke lenger tilgjengelig" });
    }
    expect(await listingStatus()).toBe("unpublished");
  });

  it("andre annonser påvirkes ikke", async () => {
    await respond(OWNER_ID, "accept");

    expect(await listingStatus("lamp")).toBe("active");
    expect((await statuses()).r5).toBe("waiting_owner");
  });

  it("to aksepter på samme annonse samtidig: bare ett bud blir godtatt, og annonsen er solgt", async () => {
    const results = await Promise.all([
      respond(OWNER_ID, "accept"),
      respond(OWNER_ID, "accept", { requestId: "r2", offerId: "p1" }),
    ]);

    expect(results.filter((r) => r.ok)).toHaveLength(1);
    const all = Object.values(await statuses());
    expect(all.filter((s) => s === "accepted")).toHaveLength(1);
    expect(await listingStatus()).toBe("sold");
  });

  it("taper aksepten et samtidig avslag, gis annonsen tilbake og ingen andre avslås", async () => {
    const results = await Promise.all([respond(OWNER_ID, "accept"), respond(OWNER_ID, "decline")]);

    expect(results.filter((r) => r.ok)).toHaveLength(1);
    expect(await listingStatus()).toBe(results[0].ok ? "sold" : "active");
    expect(await statuses()).toMatchObject({ r2: results[0].ok ? "declined" : "waiting_owner", r3: results[0].ok ? "declined" : "waiting_requester" });
  });
});
describe("respondToOffer, fristen på 7 dager", () => {
  it("avviser et svar etter 7 dager med «utløpt», og lagrer at forespørselen er utløpt", async () => {
    const result = await respond(OWNER_ID, "accept", { now: new Date(BID_AT.getTime() + 7 * DAY_MS) });

    expect(result).toEqual({ ok: false, error: "Forespørselen er utløpt" });
    expect((await snapshot()).requests[0]).toMatchObject({ status: "expired" });
  });

  it("en forespørsel som allerede er lagret som utløpt, gir samme svar", async () => {
    await db.update(request).set({ status: "expired" });

    await expectRejected(OWNER_ID, "accept", { error: "Forespørselen er utløpt" });
  });

  it("kjøperen får samme svar på et gammelt motbud", async () => {
    await db.insert(offer).values({ id: "o2", requestId: "r1", senderId: OWNER_ID, price: 240, createdAt: BID_AT });
    await db.update(request).set({ status: "waiting_requester" });

    const result = await respond("kari", "accept", { offerId: "o2", now: new Date(BID_AT.getTime() + 8 * DAY_MS) });

    expect(result).toEqual({ ok: false, error: "Forespørselen er utløpt" });
  });
});

describe("respondToOffer, samtidige svar", () => {
  it("to svar samtidig: bare ett vinner, og det andre endrer ingenting", async () => {
    const results = await Promise.all([respond(OWNER_ID, "accept"), respond(OWNER_ID, "decline")]);

    // Hvem som kommer først, avhenger av hvor mange spørringer hvert svar bruker; bare én av dem kan lykkes.
    expect(results.filter((r) => r.ok)).toHaveLength(1);
    expect(results.filter((r) => !r.ok)[0]).toMatchObject({ error: "Forslaget er endret. Last siden på nytt." });
    expect((await snapshot()).requests[0].status).toBe(results[0].ok ? "accepted" : "declined");
  });

  it("taper et motbud mot et samtidig svar, fjernes forslaget igjen", async () => {
    const results = await Promise.all([respond(OWNER_ID, "decline"), respond(OWNER_ID, "counter", { price: "240" })]);

    expect(results.map((r) => r.ok)).toEqual([true, false]);
    const { requests, offers } = await snapshot();
    expect(requests[0].status).toBe("declined");
    expect(offers).toHaveLength(1);
  });
});
