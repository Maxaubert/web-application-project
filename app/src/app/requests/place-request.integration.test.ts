// placeRequest for lån og gis bort (#186a) og getOccupiedPeriods mot SQLite i minnet med appens migrasjoner.
// Hver avvisning sjekker at ingenting ble lagret. Plan godkjent av Max 20.10.
import { eq } from "drizzle-orm";
import { beforeEach, describe, expect, it } from "vitest";
import { listing, offer, request, user } from "@/db/schema";
import type { Db } from "@/db/types";
import { createTestDb } from "@/test/test-db";
import { insertOwner, OWNER_ID, validListing } from "@/test/test-listings";
import { getOccupiedPeriods } from "./occupied";
import { placeRequest } from "./place-request";

const KARI = "kari";
const WEEK = { startDate: "2026-11-12", endDate: "2026-11-18" };
let db: Db;

async function rowCounts() {
  return { requests: (await db.select().from(request)).length, offers: (await db.select().from(offer)).length };
}

// Et lån som eieren har godtatt (eller som er i bruk), med perioden som siste forslag.
async function seedLoan(id: string, status: "accepted" | "in_use" | "declined" | "waiting_owner", startDate: string, endDate: string) {
  await db.insert(user).values({ id: `u-${id}`, name: `Låner ${id}`, email: `${id}@hiof.no` });
  await db.insert(request).values({ id, listingId: "tent", requesterId: `u-${id}`, status });
  await db.insert(offer).values({ requestId: id, senderId: `u-${id}`, startDate, endDate });
}

beforeEach(async () => {
  db = createTestDb();
  await insertOwner(db);
  await db.insert(user).values({ id: KARI, name: "Kari Nordmann", email: "kari@hiof.no" });
  await db.insert(listing).values([
    validListing({ id: "tent", type: "loan", price: 60 }),
    validListing({ id: "lamp", type: "giveaway", price: null }),
  ]);
});

describe("placeRequest, lån", () => {
  it("lagrer én forespørsel og én periode fra brukeren i økten, uten pris", async () => {
    const result = await placeRequest(db, { userId: KARI, listingId: "tent", ...WEEK });

    expect(result).toEqual({ ok: true });
    const [req] = await db.select().from(request);
    expect(req).toMatchObject({ listingId: "tent", requesterId: KARI, status: "waiting_owner" });
    expect((await db.select().from(offer))[0]).toMatchObject({ requestId: req.id, senderId: KARI, price: null, ...WEEK });
    expect((await db.select().from(listing).where(eq(listing.id, "tent")))[0]).toMatchObject({ status: "active", price: 60 });
  });

  it("en periode som starter dagen etter et godtatt lån, er lov", async () => {
    await seedLoan("a", "accepted", "2026-11-05", "2026-11-11");

    expect(await placeRequest(db, { userId: KARI, listingId: "tent", ...WEEK })).toEqual({ ok: true });
  });

  it("en periode som overlapper et godtatt lån, avvises uten å lagre noe", async () => {
    await seedLoan("a", "accepted", "2026-11-05", "2026-11-12");
    const before = await rowCounts();

    const result = await placeRequest(db, { userId: KARI, listingId: "tent", ...WEEK });

    expect(result).toEqual({ ok: false, error: "Perioden overlapper en opptatt periode" });
    expect(await rowCounts()).toEqual(before);
  });

  it("et lån i bruk er også opptatt", async () => {
    await seedLoan("a", "in_use", "2026-11-01", "2026-11-30");

    expect(await placeRequest(db, { userId: KARI, listingId: "tent", ...WEEK })).toMatchObject({ ok: false });
  });

  it("forespørsler som ikke er godtatt, blokkerer ikke perioden", async () => {
    await seedLoan("a", "waiting_owner", "2026-11-01", "2026-11-30");
    await seedLoan("b", "declined", "2026-11-01", "2026-11-30");

    expect(await placeRequest(db, { userId: KARI, listingId: "tent", ...WEEK })).toEqual({ ok: true });
  });

  it("avviser en periode på 6 dager og lagrer ingenting", async () => {
    const result = await placeRequest(db, { userId: KARI, listingId: "tent", startDate: "2026-11-12", endDate: "2026-11-17" });

    expect(result).toEqual({ ok: false, fieldErrors: { endDate: "Lånet må vare minst én uke" } });
    expect(await rowCounts()).toEqual({ requests: 0, offers: 0 });
  });

  it("avviser en pris sendt med et lån, og lagrer ingenting", async () => {
    const result = await placeRequest(db, { userId: KARI, listingId: "tent", price: "100", ...WEEK });

    expect(result).toMatchObject({ ok: false, fieldErrors: { price: expect.any(String) } });
    expect(await rowCounts()).toEqual({ requests: 0, offers: 0 });
  });

  it("avviser en ny forespørsel mens en ventende finnes, og beholder den gamle", async () => {
    await placeRequest(db, { userId: KARI, listingId: "tent", ...WEEK });

    const result = await placeRequest(db, { userId: KARI, listingId: "tent", startDate: "2026-12-01", endDate: "2026-12-08" });

    expect(result).toEqual({ ok: false, error: "Du har allerede en forespørsel på denne annonsen" });
    expect(await rowCounts()).toEqual({ requests: 1, offers: 1 });
    expect((await db.select().from(offer))[0]).toMatchObject(WEEK);
  });

  it("avviser eieren, og en ukjent, nedtatt og solgt annonse, uten å lagre noe", async () => {
    await db.insert(listing).values([
      validListing({ id: "hidden", type: "loan", status: "unpublished" }),
      validListing({ id: "sold", type: "loan", status: "sold" }),
    ]);

    expect(await placeRequest(db, { userId: OWNER_ID, listingId: "tent", ...WEEK })).toEqual({
      ok: false,
      error: "Du kan ikke sende forespørsel på din egen annonse",
    });
    for (const id of ["finnes-ikke", "hidden", "sold"]) {
      expect(await placeRequest(db, { userId: KARI, listingId: id, ...WEEK })).toMatchObject({ ok: false });
    }
    expect(await rowCounts()).toEqual({ requests: 0, offers: 0 });
  });
});

describe("placeRequest, gis bort", () => {
  it("lagrer én forespørsel med ett forslag uten pris og datoer", async () => {
    expect(await placeRequest(db, { userId: KARI, listingId: "lamp" })).toEqual({ ok: true });

    expect((await db.select().from(request))[0]).toMatchObject({ listingId: "lamp", requesterId: KARI, status: "waiting_owner" });
    expect((await db.select().from(offer))[0]).toMatchObject({ senderId: KARI, price: null, startDate: null, endDate: null });
  });

  it("avviser datoer og pris, og lagrer ingenting", async () => {
    const withDates = await placeRequest(db, { userId: KARI, listingId: "lamp", ...WEEK });
    const withPrice = await placeRequest(db, { userId: KARI, listingId: "lamp", price: "50" });

    expect(withDates).toMatchObject({ ok: false, fieldErrors: { startDate: expect.any(String), endDate: expect.any(String) } });
    expect(withPrice).toMatchObject({ ok: false, fieldErrors: { price: expect.any(String) } });
    expect(await rowCounts()).toEqual({ requests: 0, offers: 0 });
  });

  it("avviser en ny forespørsel mens en ventende finnes", async () => {
    await placeRequest(db, { userId: KARI, listingId: "lamp" });

    expect(await placeRequest(db, { userId: KARI, listingId: "lamp" })).toEqual({
      ok: false,
      error: "Du har allerede en forespørsel på denne annonsen",
    });
    expect(await rowCounts()).toEqual({ requests: 1, offers: 1 });
  });

  it("etter at forrige forespørsel er avslått, kan studenten spørre på nytt", async () => {
    await placeRequest(db, { userId: KARI, listingId: "lamp" });
    await db.update(request).set({ status: "declined" });

    expect(await placeRequest(db, { userId: KARI, listingId: "lamp" })).toEqual({ ok: true });
    expect(await rowCounts()).toEqual({ requests: 2, offers: 2 });
  });
});

describe("getOccupiedPeriods", () => {
  it("returnerer bare godtatte og pågående lån, sortert på startdato", async () => {
    await seedLoan("late", "accepted", "2026-12-01", "2026-12-08");
    await seedLoan("early", "in_use", "2026-11-01", "2026-11-08");
    await seedLoan("no", "declined", "2026-10-01", "2026-10-08");
    await seedLoan("wait", "waiting_owner", "2026-10-10", "2026-10-18");

    expect(await getOccupiedPeriods(db, "tent")).toEqual([
      { startDate: "2026-11-01", endDate: "2026-11-08" },
      { startDate: "2026-12-01", endDate: "2026-12-08" },
    ]);
  });

  it("bruker siste forslag når et motforslag har endret perioden", async () => {
    await seedLoan("a", "accepted", "2026-11-01", "2026-11-08");
    await db.insert(offer).values({ requestId: "a", senderId: OWNER_ID, startDate: "2026-11-03", endDate: "2026-11-10" });

    expect(await getOccupiedPeriods(db, "tent")).toEqual([{ startDate: "2026-11-03", endDate: "2026-11-10" }]);
  });

  it("ser ikke lån på andre annonser", async () => {
    await db.insert(listing).values(validListing({ id: "other", type: "loan", price: 40 }));
    await db.insert(user).values({ id: "x", name: "X", email: "x@hiof.no" });
    await db.insert(request).values({ id: "rx", listingId: "other", requesterId: "x", status: "accepted" });
    await db.insert(offer).values({ requestId: "rx", senderId: "x", startDate: "2026-11-01", endDate: "2026-11-08" });

    expect(await getOccupiedPeriods(db, "tent")).toEqual([]);
  });
});
