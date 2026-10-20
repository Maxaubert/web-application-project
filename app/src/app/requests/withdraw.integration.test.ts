// withdrawRequest (FK-04, #188) mot SQLite i minnet: bare forespørreren, bare mens forespørselen venter.
import { beforeEach, describe, expect, it } from "vitest";
import { listing, offer, request, requestStatuses, user } from "@/db/schema";
import type { Db } from "@/db/types";
import { createTestDb } from "@/test/test-db";
import { insertOwner, OWNER_ID, validListing } from "@/test/test-listings";
import { withdrawRequest } from "./withdraw";

const NOW = new Date("2026-10-20T12:00:00Z");
let db: Db;

beforeEach(async () => {
  db = createTestDb();
  await insertOwner(db);
  await db.insert(user).values([
    { id: "kari", name: "Kari Hansen", email: "kari@hiof.no" },
    { id: "per", name: "Per Olsen", email: "per@hiof.no" },
  ]);
  await db.insert(listing).values(validListing({ id: "calc", price: 250 }));
});

async function seedRequest(status: (typeof requestStatuses)[number], offerAt = new Date("2026-10-19T12:00:00Z")) {
  await db.delete(request);
  await db.insert(request).values({ id: "r1", listingId: "calc", requesterId: "kari", status });
  await db.insert(offer).values({ requestId: "r1", senderId: "kari", price: 220, createdAt: offerAt });
}

async function snapshot() {
  return { requests: await db.select().from(request), offers: await db.select().from(offer), listings: await db.select().from(listing) };
}

const withdraw = (userId: string, requestId = "r1") => withdrawRequest(db, { userId, requestId, now: NOW });

describe("withdrawRequest", () => {
  it("forespørreren trekker tilbake uansett hvem som har tur", async () => {
    for (const status of ["waiting_owner", "waiting_requester"] as const) {
      await seedRequest(status);

      expect(await withdraw("kari"), status).toEqual({ ok: true });

      expect((await db.select().from(request))[0], status).toMatchObject({ status: "withdrawn", updatedAt: NOW });
    }
  });

  it("eieren kan ikke trekke tilbake, og ingenting endres", async () => {
    await seedRequest("waiting_owner");
    const before = await snapshot();

    expect(await withdraw(OWNER_ID)).toEqual({ ok: false, error: "Du kan ikke gjøre dette nå" });
    expect(await snapshot()).toEqual(before);
  });

  it("bare en ventende forespørsel kan trekkes tilbake: avtalt og avsluttede avvises uten å endre noe", async () => {
    for (const status of requestStatuses.filter((s) => s !== "waiting_owner" && s !== "waiting_requester" && s !== "expired")) {
      await seedRequest(status);
      const before = await snapshot();

      expect(await withdraw("kari"), status).toEqual({ ok: false, error: "Du kan ikke gjøre dette nå" });
      expect(await snapshot(), status).toEqual(before);
    }
  });

  it("en forespørsel som har ventet i 7 dager, er utløpt: avvises, og utløpet lagres", async () => {
    await seedRequest("waiting_owner", new Date("2026-10-12T12:00:00Z"));

    expect(await withdraw("kari")).toEqual({ ok: false, error: "Forespørselen er utløpt" });
    expect((await db.select().from(request))[0].status).toBe("expired");
  });

  it("en tredjepart og en ukjent forespørsel får samme svar, og ingenting endres", async () => {
    await seedRequest("waiting_owner");
    const before = await snapshot();

    expect(await withdraw("per")).toEqual({ ok: false, error: "Forespørselen finnes ikke" });
    expect(await withdraw("kari", "finnes-ikke")).toEqual({ ok: false, error: "Forespørselen finnes ikke" });
    expect(await snapshot()).toEqual(before);
  });

  it("etter tilbaketrekkingen kan forespørreren be om annonsen på nytt", async () => {
    await seedRequest("waiting_owner");
    await withdraw("kari");

    await db.insert(request).values({ id: "r2", listingId: "calc", requesterId: "kari" });

    expect((await db.select().from(request)).map((r) => r.status)).toEqual(["withdrawn", "waiting_owner"]);
  });
});
