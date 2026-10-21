// Automatisk bekreftelse (FK-08, AK-38, #214) mot SQLite i minnet: lesing regner ut uten å skrive, og hver skrivehandling
// lagrer det før den svarer. Klokken regnes fra updatedAt, som en bekreftelse setter.
import { eq } from "drizzle-orm";
import { beforeEach, describe, expect, it } from "vitest";
import { listing, request, user } from "@/db/schema";
import type { Db } from "@/db/types";
import { createTestDb } from "@/test/test-db";
import { insertOwner, OWNER_ID, validListing } from "@/test/test-listings";
import { settleHandover } from "./auto-confirm";
import { getContactForParty } from "./contact";
import { cancelRequest, confirmHandover } from "./handover";
import { getRequestForParty } from "./queries";

const CONFIRMED_AT = new Date("2026-10-20T12:00:00Z");
const DAY = 86_400_000;
const AT_3_DAYS = new Date(CONFIRMED_AT.getTime() + 3 * DAY);
const BEFORE_3_DAYS = new Date(CONFIRMED_AT.getTime() + 3 * DAY - 1000);
let db: Db;

beforeEach(async () => {
  db = createTestDb();
  await insertOwner(db);
  await db.insert(user).values([
    { id: "kari", name: "Kari Hansen", email: "kari@hiof.no", phone: "+4790000002" },
    { id: "per", name: "Per Olsen", email: "per@hiof.no" },
  ]);
  await db.insert(listing).values([
    validListing({ id: "calc", type: "sale", price: 250, status: "sold" }),
    validListing({ id: "tent", type: "loan", price: 60 }),
  ]);
});

// Eieren bekreftet 20.10 kl. 12:00, forespørreren har ikke bekreftet.
async function seed(id: string, listingId: string, flags = { ownerConfirmed: true, requesterConfirmed: false }) {
  await db.insert(request).values({ id, listingId, requesterId: "kari", status: "accepted", updatedAt: CONFIRMED_AT, ...flags });
}
const row = async (id: string) => (await db.select().from(request).where(eq(request.id, id)))[0];

describe("lesing etter 3 dager", () => {
  it("viser forespørselen som fullført (salg) eller i bruk (lån) for begge parter, uten å skrive noe", async () => {
    await seed("r1", "calc");
    await seed("r2", "tent");

    for (const userId of [OWNER_ID, "kari"]) {
      expect((await getRequestForParty(db, "r1", userId, AT_3_DAYS))?.request).toMatchObject({ status: "completed", ownerConfirmed: true, requesterConfirmed: true });
      expect((await getRequestForParty(db, "r2", userId, AT_3_DAYS))?.request.status).toBe("in_use");
    }
    expect(await row("r1")).toMatchObject({ status: "accepted", requesterConfirmed: false });
    expect(await row("r2")).toMatchObject({ status: "accepted", requesterConfirmed: false });
  });

  it("like før 3 dager er den fortsatt avtalt, og den andre har ikke bekreftet", async () => {
    await seed("r1", "calc");

    expect((await getRequestForParty(db, "r1", "kari", BEFORE_3_DAYS))?.request).toMatchObject({ status: "accepted", requesterConfirmed: false });
  });

  it("kontaktinfo deles fortsatt etter den automatiske bekreftelsen", async () => {
    await seed("r1", "calc");

    expect(await getContactForParty(db, "r1", OWNER_ID, AT_3_DAYS)).toMatchObject({ email: "kari@hiof.no" });
  });
});

describe("settleHandover", () => {
  it("lagrer status og begge flagg ved 3 dager, og gir sant", async () => {
    await seed("r1", "calc");

    expect(await settleHandover(db, "r1", AT_3_DAYS)).toBe(true);

    expect(await row("r1")).toMatchObject({ status: "completed", ownerConfirmed: true, requesterConfirmed: true, updatedAt: AT_3_DAYS });
  });

  it("et lån blir i bruk", async () => {
    await seed("r1", "tent", { ownerConfirmed: false, requesterConfirmed: true });

    expect(await settleHandover(db, "r1", AT_3_DAYS)).toBe(true);

    expect(await row("r1")).toMatchObject({ status: "in_use", ownerConfirmed: true, requesterConfirmed: true });
  });

  it("før 3 dager, uten noen bekreftelse og for en ukjent forespørsel gjør den ingenting og gir usant", async () => {
    await seed("r1", "calc");
    await seed("r2", "tent", { ownerConfirmed: false, requesterConfirmed: false });
    const before = await db.select().from(request);

    expect(await settleHandover(db, "r1", BEFORE_3_DAYS)).toBe(false);
    expect(await settleHandover(db, "r2", new Date(CONFIRMED_AT.getTime() + 30 * DAY))).toBe(false);
    expect(await settleHandover(db, "finnes-ikke", AT_3_DAYS)).toBe(false);
    expect(await db.select().from(request)).toEqual(before);
  });

  it("andre gang er det ingenting å gjøre", async () => {
    await seed("r1", "calc");
    await settleHandover(db, "r1", AT_3_DAYS);

    expect(await settleHandover(db, "r1", new Date(AT_3_DAYS.getTime() + DAY))).toBe(false);
    expect((await row("r1")).updatedAt).toEqual(AT_3_DAYS);
  });

  it("har den andre bekreftet selv, er det ingenting å lagre: statusen står, og svaret er usant", async () => {
    await seed("r1", "calc");
    await db.update(request).set({ requesterConfirmed: true }).where(eq(request.id, "r1"));

    expect(await settleHandover(db, "r1", AT_3_DAYS)).toBe(false);
    expect((await row("r1")).status).toBe("accepted");
  });
});

describe("skrivehandlingene etter 3 dager", () => {
  it("den som ikke har bekreftet, får «Du kan ikke gjøre dette nå», og avtalen er lagret som fullført", async () => {
    await seed("r1", "calc");

    expect(await confirmHandover(db, { userId: "kari", requestId: "r1", now: AT_3_DAYS })).toEqual({ ok: false, error: "Du kan ikke gjøre dette nå" });
    expect(await row("r1")).toMatchObject({ status: "completed", requesterConfirmed: true });
  });

  it("avbestilling er ikke lenger mulig: avvist, avtalen lagret som fullført, og annonsen forblir solgt", async () => {
    await seed("r1", "calc");

    for (const userId of [OWNER_ID, "kari"]) {
      expect(await cancelRequest(db, { userId, requestId: "r1", now: AT_3_DAYS }), userId).toEqual({ ok: false, error: "Du kan ikke gjøre dette nå" });
    }
    expect((await row("r1")).status).toBe("completed");
    expect((await db.select().from(listing).where(eq(listing.id, "calc")))[0].status).toBe("sold");
  });

  it("like før 3 dager kan den andre fortsatt bekrefte, og begge kan avbestille", async () => {
    await seed("r1", "calc");
    await seed("r2", "tent");

    expect(await confirmHandover(db, { userId: "kari", requestId: "r1", now: BEFORE_3_DAYS })).toEqual({ ok: true });
    expect(await row("r1")).toMatchObject({ status: "completed" });
    expect(await cancelRequest(db, { userId: "kari", requestId: "r2", now: BEFORE_3_DAYS })).toEqual({ ok: true });
    expect((await row("r2")).status).toBe("cancelled");
  });

  it("en tredjepart får ikke avtalen lagret: samme svar som for en ukjent forespørsel, og ingenting endres", async () => {
    await seed("r1", "calc");

    expect(await confirmHandover(db, { userId: "per", requestId: "r1", now: AT_3_DAYS })).toEqual({ ok: false, error: "Forespørselen finnes ikke" });
    expect(await cancelRequest(db, { userId: "per", requestId: "r1", now: AT_3_DAYS })).toEqual({ ok: false, error: "Forespørselen finnes ikke" });
    expect(await row("r1")).toMatchObject({ status: "accepted", requesterConfirmed: false });
  });
});
