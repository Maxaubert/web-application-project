// placeBid mot SQLite i minnet med appens migrasjoner. Hver avvisning sjekker at ingenting ble lagret,
// og at et gyldig bud lagres som riktig forespørsel og bud. Godkjent av Max 17.10.
import { beforeEach, describe, expect, it } from "vitest";
import { listing, offer, request, user } from "@/db/schema";
import type { Db } from "@/db/types";
import { createTestDb } from "@/test/test-db";
import { insertOwner, OWNER_ID, validListing } from "@/test/test-listings";
import { placeBid } from "./place-bid";
import { getActiveRequest } from "./queries";

const KARI = "kari";
let db: Db;

async function rowCounts() {
  return { requests: (await db.select().from(request)).length, offers: (await db.select().from(offer)).length };
}

beforeEach(async () => {
  db = createTestDb();
  await insertOwner(db);
  await db.insert(user).values({ id: KARI, name: "Kari Nordmann", email: "kari@hiof.no" });
  await db.insert(listing).values(validListing({ id: "calc", price: 250 }));
});

describe("placeBid, gyldig bud", () => {
  it("lagrer én forespørsel i waiting_owner og ett bud fra budgiveren, og annonsen er uendret", async () => {
    const result = await placeBid(db, { userId: KARI, listingId: "calc", price: "220" });

    expect(result).toEqual({ ok: true });
    const [req] = await db.select().from(request);
    expect(req).toMatchObject({ listingId: "calc", requesterId: KARI, status: "waiting_owner" });
    const [bid] = await db.select().from(offer);
    expect(bid).toMatchObject({ requestId: req.id, senderId: KARI, price: 220, startDate: null, endDate: null });
    expect((await db.select().from(listing))[0]).toMatchObject({ status: "active", price: 250 });
  });

  it("et nytt bud erstatter det gamle: fortsatt én forespørsel, to bud, og det nyeste gjelder", async () => {
    await placeBid(db, { userId: KARI, listingId: "calc", price: "220" });
    await placeBid(db, { userId: KARI, listingId: "calc", price: "230" });

    expect(await rowCounts()).toEqual({ requests: 1, offers: 2 });
    expect(await getActiveRequest(db, "calc", KARI)).toMatchObject({ price: 230, status: "waiting_owner" });
  });

  it("to studenter kan hver ha et bud på samme annonse", async () => {
    await db.insert(user).values({ id: "per", name: "Per Hansen", email: "per@hiof.no" });
    await placeBid(db, { userId: KARI, listingId: "calc", price: "220" });
    await placeBid(db, { userId: "per", listingId: "calc", price: "200" });

    expect(await rowCounts()).toEqual({ requests: 2, offers: 2 });
  });

  it("etter at forrige forespørsel er avslått, kan studenten by på nytt", async () => {
    await placeBid(db, { userId: KARI, listingId: "calc", price: "220" });
    await db.update(request).set({ status: "declined" });

    expect(await placeBid(db, { userId: KARI, listingId: "calc", price: "240" })).toEqual({ ok: true });
    expect(await rowCounts()).toEqual({ requests: 2, offers: 2 });
  });
});

describe("placeBid, avvisning endrer ingenting", () => {
  async function expectRejected(userId: string, listingId: string, price: string, expected: object) {
    const result = await placeBid(db, { userId, listingId, price });
    expect(result).toMatchObject({ ok: false, ...expected });
    expect(await rowCounts()).toEqual({ requests: 0, offers: 0 });
  }

  it("avviser eieren av annonsen", async () => {
    await expectRejected(OWNER_ID, "calc", "220", { error: "Du kan ikke by på din egen annonse" });
  });

  it("avviser en ukjent, nedtatt og solgt annonse med samme melding", async () => {
    await db.insert(listing).values([validListing({ id: "hidden", status: "unpublished" }), validListing({ id: "sold", status: "sold" })]);
    for (const id of ["finnes-ikke", "hidden", "sold"]) {
      await expectRejected(KARI, id, "220", { error: "Du kan ikke legge inn bud på denne annonsen" });
    }
  });

  it("avviser lån og gis bort", async () => {
    await db.insert(listing).values([validListing({ id: "loan", type: "loan" }), validListing({ id: "free", type: "giveaway", price: null })]);
    for (const id of ["loan", "free"]) {
      await expectRejected(KARI, id, "220", { error: "Du kan ikke legge inn bud på denne annonsen" });
    }
  });

  it.each([
    ["0", "Bud må være minst 1 kr"],
    ["", "Skriv et bud"],
    ["100001", "Bud kan være høyst 100 000 kr"],
    ["12.5", "Bud må være et helt tall, for eksempel 250"],
  ])("avviser budet «%s»", async (price, message) => {
    await expectRejected(KARI, "calc", price, { fieldErrors: { price: message } });
  });

  it("avviser et nytt bud når selgeren allerede har svart, og beholder det gamle", async () => {
    await placeBid(db, { userId: KARI, listingId: "calc", price: "220" });
    await db.update(request).set({ status: "waiting_requester" });

    const result = await placeBid(db, { userId: KARI, listingId: "calc", price: "230" });

    expect(result).toEqual({ ok: false, error: "Du har allerede en forespørsel på denne annonsen" });
    expect(await rowCounts()).toEqual({ requests: 1, offers: 1 });
    expect((await db.select().from(offer))[0].price).toBe(220);
  });

  it("avviser en bruker som ikke finnes, uten å lagre noe", async () => {
    await expect(placeBid(db, { userId: "finnes-ikke", listingId: "calc", price: "220" })).rejects.toThrow("FOREIGN KEY");
    expect(await rowCounts()).toEqual({ requests: 0, offers: 0 });
  });

  it("rydder bort forespørselen igjen hvis budet ikke kan lagres", async () => {
    // Databasen får feil først når budet skal inn, etter at forespørselen er lagret (D1 har ingen transaksjon).
    const failing = new Proxy(db, {
      get(target, prop) {
        if (prop === "insert") {
          return (table: Parameters<Db["insert"]>[0]) => {
            if (table === offer) throw new Error("disken er full");
            return target.insert(table);
          };
        }
        const value = Reflect.get(target, prop);
        return typeof value === "function" ? value.bind(target) : value;
      },
    }) as Db;

    await expect(placeBid(failing, { userId: KARI, listingId: "calc", price: "220" })).rejects.toThrow("disken er full");
    expect(await rowCounts()).toEqual({ requests: 0, offers: 0 });
  });
});
