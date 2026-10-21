// confirmReturn (FK-07, #214) mot SQLite i minnet: bare eieren, bare mens lånet er i bruk. Hver avvisning sjekker at
// ingenting i databasen ble endret.
import { eq } from "drizzle-orm";
import { beforeEach, describe, expect, it } from "vitest";
import { listing, offer, request, requestStatuses, user } from "@/db/schema";
import type { Db } from "@/db/types";
import { createTestDb } from "@/test/test-db";
import { insertOwner, OWNER_ID, validListing } from "@/test/test-listings";
import { getOccupiedPeriods } from "./occupied";
import { confirmReturn } from "./return";

const NOW = new Date("2026-11-25T12:00:00Z");
let db: Db;

beforeEach(async () => {
  db = createTestDb();
  await insertOwner(db);
  await db.insert(user).values([
    { id: "kari", name: "Kari Hansen", email: "kari@hiof.no" },
    { id: "per", name: "Per Olsen", email: "per@hiof.no" },
  ]);
  await db.insert(listing).values(validListing({ id: "tent", type: "loan", price: 60 }));
});

async function seed(status: (typeof requestStatuses)[number], flags: { ownerConfirmed?: boolean; requesterConfirmed?: boolean } = {}) {
  await db.delete(request);
  await db.insert(request).values({ id: "r1", listingId: "tent", requesterId: "kari", status, updatedAt: new Date("2026-11-10T12:00:00Z"), ...flags });
}
const rows = () => db.select().from(request);
const returned = (userId: string, requestId = "r1") => confirmReturn(db, { userId, requestId, now: NOW });

describe("confirmReturn", () => {
  it("eieren bekrefter retur: lånet er fullført, og tidspunktet lagres", async () => {
    await seed("in_use", { ownerConfirmed: true, requesterConfirmed: true });

    expect(await returned(OWNER_ID)).toEqual({ ok: true });

    expect((await rows())[0]).toMatchObject({ status: "completed", updatedAt: NOW });
  });

  it("låneren kan ikke bekrefte retur, og ingenting endres", async () => {
    await seed("in_use");
    const before = await rows();

    expect(await returned("kari")).toEqual({ ok: false, error: "Du kan ikke gjøre dette nå" });
    expect(await rows()).toEqual(before);
  });

  it("bare et lån i bruk kan leveres: alle andre statuser avvises uten å endre noe", async () => {
    for (const status of requestStatuses.filter((s) => s !== "in_use")) {
      await seed(status);
      const before = await rows();

      expect(await returned(OWNER_ID), status).toEqual({ ok: false, error: "Du kan ikke gjøre dette nå" });
      expect(await rows(), status).toEqual(before);
    }
  });

  it("andre gang er det ikke lenger noe å bekrefte", async () => {
    await seed("in_use");
    await returned(OWNER_ID);
    const before = await rows();

    expect(await returned(OWNER_ID)).toEqual({ ok: false, error: "Du kan ikke gjøre dette nå" });
    expect(await rows()).toEqual(before);
  });

  it("en tredjepart og en ukjent forespørsel får samme svar, og ingenting endres", async () => {
    await seed("in_use");
    const before = await rows();

    expect(await returned("per")).toEqual({ ok: false, error: "Forespørselen finnes ikke" });
    expect(await returned(OWNER_ID, "finnes-ikke")).toEqual({ ok: false, error: "Forespørselen finnes ikke" });
    expect(await rows()).toEqual(before);
  });

  it("et lån som ble i bruk av den automatiske bekreftelsen, kan leveres med en gang", async () => {
    await seed("accepted", { ownerConfirmed: false, requesterConfirmed: true });
    await db.update(request).set({ updatedAt: new Date("2026-11-20T12:00:00Z") }).where(eq(request.id, "r1"));

    expect(await returned(OWNER_ID)).toEqual({ ok: true });

    expect((await rows())[0]).toMatchObject({ status: "completed", ownerConfirmed: true, requesterConfirmed: true });
  });

  it("er ikke 3 dager gått med bare én bekreftelse, er lånet ikke i bruk og kan ikke leveres", async () => {
    await seed("accepted", { ownerConfirmed: false, requesterConfirmed: true });
    await db.update(request).set({ updatedAt: new Date("2026-11-24T12:00:00Z") }).where(eq(request.id, "r1"));

    expect(await returned(OWNER_ID)).toEqual({ ok: false, error: "Du kan ikke gjøre dette nå" });
    expect((await rows())[0].status).toBe("accepted");
  });

  it("perioden er ledig etterpå: et fullført lån holder den ikke opptatt", async () => {
    await seed("in_use");
    await db.update(request).set({ ownerConfirmed: true, requesterConfirmed: true });
    await db.insert(offer).values({ requestId: "r1", senderId: "kari", startDate: "2026-11-20", endDate: "2026-11-27" });
    expect(await getOccupiedPeriods(db, "tent")).toHaveLength(1);

    await returned(OWNER_ID);

    expect(await getOccupiedPeriods(db, "tent")).toHaveLength(0);
  });
});
