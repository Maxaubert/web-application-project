// Lagring av utløpet (#187) mot SQLite i minnet: expireIfDue flytter bare en forespørsel som er for gammel, og
// bare én gang. expireOverdueRequest rydder bort studentens utløpte forespørsel før et nytt bud.
import { beforeEach, describe, expect, it } from "vitest";
import { listing, offer, request, user } from "@/db/schema";
import type { Db } from "@/db/types";
import { createTestDb } from "@/test/test-db";
import { insertOwner, OWNER_ID, validListing } from "@/test/test-listings";
import { expireIfDue, expireOverdueRequest } from "./request-expiry";

const DAY_MS = 86_400_000;
const BID_AT = new Date("2026-10-10T12:00:00Z");
const OPEN = new Date(BID_AT.getTime() + 7 * DAY_MS - 1000);
const DUE = new Date(BID_AT.getTime() + 7 * DAY_MS);
let db: Db;

async function statusOf(id: string) {
  return (await db.select().from(request)).find((r) => r.id === id);
}

beforeEach(async () => {
  db = createTestDb();
  await insertOwner(db);
  await db.insert(user).values({ id: "kari", name: "Kari Hansen", email: "kari@hiof.no" });
  await db.insert(listing).values([validListing({ id: "calc" }), validListing({ id: "lamp" })]);
  await db.insert(request).values({ id: "r1", listingId: "calc", requesterId: "kari" });
  await db.insert(offer).values({ requestId: "r1", senderId: "kari", price: 200, createdAt: BID_AT });
});

describe("expireIfDue", () => {
  it("lagrer utløpet etter 7 dager, med tidspunktet, og sier at den gjorde det", async () => {
    expect(await expireIfDue(db, "r1", DUE)).toBe(true);

    expect(await statusOf("r1")).toMatchObject({ status: "expired", updatedAt: DUE });
  });

  it("rører ikke en forespørsel som fortsatt er åpen", async () => {
    expect(await expireIfDue(db, "r1", OPEN)).toBe(false);

    expect((await statusOf("r1"))?.status).toBe("waiting_owner");
  });

  it("regner fra det siste forslaget, ikke det første", async () => {
    await db.insert(offer).values({ requestId: "r1", senderId: OWNER_ID, price: 240, createdAt: new Date(BID_AT.getTime() + 6 * DAY_MS) });
    await db.update(request).set({ status: "waiting_requester" });

    expect(await expireIfDue(db, "r1", DUE)).toBe(false);
    expect((await statusOf("r1"))?.status).toBe("waiting_requester");
  });

  it("endrer ikke avsluttede eller godtatte forespørsler", async () => {
    for (const status of ["accepted", "declined", "in_use", "completed"] as const) {
      await db.update(request).set({ status });
      expect(await expireIfDue(db, "r1", DUE), status).toBe(false);
      expect((await statusOf("r1"))?.status).toBe(status);
    }
  });

  it("gjør ingenting for en ukjent forespørsel, og lagrer utløpet bare én gang", async () => {
    expect(await expireIfDue(db, "finnes-ikke", DUE)).toBe(false);

    expect(await expireIfDue(db, "r1", DUE)).toBe(true);
    expect(await expireIfDue(db, "r1", DUE)).toBe(false);
  });
});

describe("expireOverdueRequest", () => {
  it("lagrer utløpet for studentens forespørsel på annonsen, men ikke for andre annonser eller studenter", async () => {
    await db.insert(user).values({ id: "per", name: "Per Olsen", email: "per@hiof.no" });
    await db.insert(request).values([
      { id: "r2", listingId: "lamp", requesterId: "kari" },
      { id: "r3", listingId: "calc", requesterId: "per" },
    ]);
    await db.insert(offer).values([
      { requestId: "r2", senderId: "kari", price: 90, createdAt: BID_AT },
      { requestId: "r3", senderId: "per", price: 80, createdAt: BID_AT },
    ]);

    await expireOverdueRequest(db, "calc", "kari", DUE);

    expect((await statusOf("r1"))?.status).toBe("expired");
    expect((await statusOf("r2"))?.status).toBe("waiting_owner");
    expect((await statusOf("r3"))?.status).toBe("waiting_owner");
  });

  it("gjør ingenting når forespørselen ikke er for gammel", async () => {
    await expireOverdueRequest(db, "calc", "kari", OPEN);

    expect((await statusOf("r1"))?.status).toBe("waiting_owner");
  });
});
