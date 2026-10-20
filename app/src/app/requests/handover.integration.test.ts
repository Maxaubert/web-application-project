// confirmHandover og cancelRequest (FK-08, #188) mot SQLite i minnet med appens migrasjoner. Hver avvisning sjekker at
// ingenting i databasen ble endret, og hver gyldig handling at riktig status, flagg og annonse ble lagret.
import { eq } from "drizzle-orm";
import { beforeEach, describe, expect, it } from "vitest";
import { listing, request, requestStatuses, user } from "@/db/schema";
import type { Db } from "@/db/types";
import { createTestDb } from "@/test/test-db";
import { insertOwner, OWNER_ID, validListing } from "@/test/test-listings";
import { cancelRequest, confirmHandover } from "./handover";
import { getOccupiedPeriods } from "./occupied";

const NOW = new Date("2026-10-20T12:00:00Z");
let db: Db;

beforeEach(async () => {
  db = createTestDb();
  await insertOwner(db);
  await db.insert(user).values([
    { id: "kari", name: "Kari Hansen", email: "kari@hiof.no" },
    { id: "per", name: "Per Olsen", email: "per@hiof.no" },
  ]);
  // En solgt og en gis bort-annonse er tatt ut av søket når forespørselen er avtalt; et lån ligger ute hele tiden.
  await db.insert(listing).values([
    validListing({ id: "calc", type: "sale", price: 250, status: "sold" }),
    validListing({ id: "lamp", type: "giveaway", price: null, status: "sold" }),
    validListing({ id: "tent", type: "loan", price: 60 }),
  ]);
});

type Seed = { status?: (typeof requestStatuses)[number]; ownerConfirmed?: boolean; requesterConfirmed?: boolean };

async function seedRequest(id: string, listingId: string, seed: Seed = {}) {
  await db.insert(request).values({ id, listingId, requesterId: "kari", status: "accepted", ...seed });
}

async function snapshot() {
  return { requests: await db.select().from(request), listings: await db.select().from(listing) };
}

async function row(id: string) {
  return (await db.select().from(request).where(eq(request.id, id)))[0];
}

async function listingStatus(id: string) {
  return (await db.select().from(listing).where(eq(listing.id, id)))[0].status;
}

const confirm = (userId: string, requestId = "r1") => confirmHandover(db, { userId, requestId, now: NOW });
const cancel = (userId: string, requestId = "r1") => cancelRequest(db, { userId, requestId, now: NOW });

describe("confirmHandover", () => {
  it("forespørreren bekrefter: bare hens flagg settes, og forespørselen er fortsatt avtalt", async () => {
    await seedRequest("r1", "calc");

    expect(await confirm("kari")).toEqual({ ok: true });

    expect(await row("r1")).toMatchObject({ status: "accepted", requesterConfirmed: true, ownerConfirmed: false, updatedAt: NOW });
  });

  it("eieren bekrefter: bare eierens flagg settes", async () => {
    await seedRequest("r1", "calc");

    expect(await confirm(OWNER_ID)).toEqual({ ok: true });

    expect(await row("r1")).toMatchObject({ status: "accepted", ownerConfirmed: true, requesterConfirmed: false });
  });

  it("når den andre også bekrefter, er et salg fullført og annonsen fortsatt solgt", async () => {
    await seedRequest("r1", "calc", { ownerConfirmed: true });

    expect(await confirm("kari")).toEqual({ ok: true });

    expect(await row("r1")).toMatchObject({ status: "completed", ownerConfirmed: true, requesterConfirmed: true });
    expect(await listingStatus("calc")).toBe("sold");
  });

  it("en gis bort er fullført når begge har bekreftet", async () => {
    await seedRequest("r1", "lamp", { requesterConfirmed: true });

    await confirm(OWNER_ID);

    expect((await row("r1")).status).toBe("completed");
  });

  it("et lån er i bruk, ikke fullført, når begge har bekreftet", async () => {
    await seedRequest("r1", "tent", { requesterConfirmed: true });

    await confirm(OWNER_ID);

    expect((await row("r1")).status).toBe("in_use");
  });

  it("samme part kan ikke bekrefte to ganger, og ingenting endres", async () => {
    await seedRequest("r1", "calc", { requesterConfirmed: true });
    const before = await snapshot();

    expect(await confirm("kari")).toEqual({ ok: false, error: "Du har allerede bekreftet overleveringen" });
    expect(await snapshot()).toEqual(before);
  });

  it("bare en avtalt forespørsel kan bekreftes: alle andre statuser avvises uten å endre noe", async () => {
    for (const status of requestStatuses.filter((s) => s !== "accepted")) {
      await db.delete(request);
      await seedRequest("r1", "calc", { status });
      const before = await snapshot();

      for (const userId of [OWNER_ID, "kari"]) {
        expect(await confirm(userId), `${status} ${userId}`).toEqual({ ok: false, error: "Du kan ikke gjøre dette nå" });
      }
      expect(await snapshot(), status).toEqual(before);
    }
  });

  it("en tredjepart og en ukjent forespørsel får samme svar, og ingenting endres", async () => {
    await seedRequest("r1", "calc");
    const before = await snapshot();

    expect(await confirm("per")).toEqual({ ok: false, error: "Forespørselen finnes ikke" });
    expect(await confirm("kari", "finnes-ikke")).toEqual({ ok: false, error: "Forespørselen finnes ikke" });
    expect(await snapshot()).toEqual(before);
  });

  it("to samtidige bekreftelser fra hver sin part ender som fullført, ikke som to halve", async () => {
    await seedRequest("r1", "calc");

    const results = await Promise.all([confirm(OWNER_ID), confirm("kari")]);

    expect(results).toEqual([{ ok: true }, { ok: true }]);
    expect(await row("r1")).toMatchObject({ status: "completed", ownerConfirmed: true, requesterConfirmed: true });
  });
});

describe("cancelRequest", () => {
  it("begge parter kan avbestille et salg, og annonsen legges ut igjen", async () => {
    for (const userId of [OWNER_ID, "kari"]) {
      await db.delete(request);
      await db.update(listing).set({ status: "sold" }).where(eq(listing.id, "calc"));
      await seedRequest("r1", "calc");

      expect(await cancel(userId), userId).toEqual({ ok: true });

      expect(await row("r1"), userId).toMatchObject({ status: "cancelled", updatedAt: NOW });
      expect(await listingStatus("calc"), userId).toBe("active");
    }
  });

  it("en gis bort legges også ut igjen", async () => {
    await seedRequest("r1", "lamp");

    await cancel("kari");

    expect(await listingStatus("lamp")).toBe("active");
  });

  it("et lån: avbestilt, annonsen var aldri borte, og perioden blir ledig", async () => {
    await seedRequest("r1", "tent");
    await db.update(listing).set({ updatedAt: new Date("2026-10-01T00:00:00Z") }).where(eq(listing.id, "tent"));
    const listingBefore = (await db.select().from(listing).where(eq(listing.id, "tent")))[0];

    expect(await cancel("kari")).toEqual({ ok: true });

    expect((await row("r1")).status).toBe("cancelled");
    expect((await db.select().from(listing).where(eq(listing.id, "tent")))[0]).toEqual(listingBefore);
    expect(await getOccupiedPeriods(db, "tent")).toEqual([]);
  });

  it("kan avbestilles selv om den ene parten allerede har bekreftet", async () => {
    await seedRequest("r1", "calc", { ownerConfirmed: true });

    expect(await cancel("kari")).toEqual({ ok: true });

    expect((await row("r1")).status).toBe("cancelled");
  });

  it("en annonse eieren har tatt ned, blir stående nede", async () => {
    await seedRequest("r1", "calc");
    await db.update(listing).set({ status: "unpublished" }).where(eq(listing.id, "calc"));

    await cancel(OWNER_ID);

    expect(await listingStatus("calc")).toBe("unpublished");
  });

  it("bare en avtalt forespørsel kan avbestilles: ventende, avsluttede og lån i bruk avvises uten å endre noe", async () => {
    for (const status of requestStatuses.filter((s) => s !== "accepted")) {
      await db.delete(request);
      await seedRequest("r1", "calc", { status });
      const before = await snapshot();

      for (const userId of [OWNER_ID, "kari"]) {
        expect(await cancel(userId), `${status} ${userId}`).toEqual({ ok: false, error: "Du kan ikke gjøre dette nå" });
      }
      expect(await snapshot(), status).toEqual(before);
    }
  });

  it("en tredjepart og en ukjent forespørsel får samme svar, og ingenting endres", async () => {
    await seedRequest("r1", "calc");
    const before = await snapshot();

    expect(await cancel("per")).toEqual({ ok: false, error: "Forespørselen finnes ikke" });
    expect(await cancel("kari", "finnes-ikke")).toEqual({ ok: false, error: "Forespørselen finnes ikke" });
    expect(await snapshot()).toEqual(before);
  });

  it("en bekreftelse etter avbestillingen avvises, og forespørselen forblir avbestilt", async () => {
    await seedRequest("r1", "calc");
    await cancel("kari");

    expect(await confirm(OWNER_ID)).toEqual({ ok: false, error: "Du kan ikke gjøre dette nå" });
    expect((await row("r1")).status).toBe("cancelled");
  });
});
