// Databasereglene for request og offer avviser ugyldige data, også om koden har en feil. Hver test
// sjekker både at databasen sier nei og at ingenting ble lagret.
import { eq, sql } from "drizzle-orm";
import { describe, expect, it } from "vitest";
import { listing, offer, request, user } from "@/db/schema";
import { createTestDb } from "@/test/test-db";
import { insertOwner, validListing } from "@/test/test-listings";

const REQUESTER_ID = "requester-1";

async function setup() {
  const db = createTestDb();
  await insertOwner(db);
  await db.insert(user).values({ id: REQUESTER_ID, name: "Kari Nordmann", email: "kari@hiof.no" });
  const [created] = await db.insert(listing).values(validListing()).returning();
  const [req] = await db.insert(request).values({ listingId: created.id, requesterId: REQUESTER_ID }).returning();
  return { db, listingId: created.id, requestId: req.id };
}

describe("request-tabellen", () => {
  it("starter i waiting_owner uten bekreftelser", async () => {
    const { db, requestId } = await setup();
    const [row] = await db.select().from(request).where(eq(request.id, requestId));
    expect(row).toMatchObject({ status: "waiting_owner", ownerConfirmed: false, requesterConfirmed: false });
  });

  it("setter waiting_owner selv når en rad settes inn uten status", async () => {
    // Drizzle fyller ut standardverdien i koden, så denne går rett på SQL for å prøve selve tabellen.
    const { db, listingId } = await setup();
    await db.insert(user).values({ id: "requester-2", name: "Per Hansen", email: "per@hiof.no" });
    await db.run(sql`insert into request (id, listing_id, requester_id) values ('raw-1', ${listingId}, 'requester-2')`);
    const [row] = await db.select().from(request).where(eq(request.id, "raw-1"));
    expect(row.status).toBe("waiting_owner");
  });

  it("avviser en andre pågående forespørsel fra samme student på samme annonse", async () => {
    const { db, listingId } = await setup();
    for (const status of ["waiting_owner", "waiting_requester", "accepted", "in_use"] as const) {
      await db.update(request).set({ status }).where(eq(request.listingId, listingId));
      await expect(db.insert(request).values({ listingId, requesterId: REQUESTER_ID })).rejects.toThrow("UNIQUE");
    }
    expect(await db.select().from(request)).toHaveLength(1);
  });

  it("tillater en ny forespørsel når den forrige er avsluttet, og samme student på en annen annonse", async () => {
    const { db, listingId } = await setup();
    for (const status of ["declined", "withdrawn", "expired", "cancelled", "completed"] as const) {
      await db.update(request).set({ status }).where(eq(request.listingId, listingId));
      await db.insert(request).values({ listingId, requesterId: REQUESTER_ID, status: "waiting_owner" });
      await db.delete(request).where(eq(request.status, "waiting_owner"));
    }
    const [other] = await db.insert(listing).values(validListing()).returning();
    await db.insert(request).values({ listingId: other.id, requesterId: REQUESTER_ID });
    expect(await db.select().from(request)).toHaveLength(2);
  });

  it("avviser en ukjent status", async () => {
    const { db, listingId } = await setup();
    const bad = { listingId, requesterId: REQUESTER_ID, status: "pending" } as unknown as typeof request.$inferInsert;
    await expect(db.insert(request).values(bad)).rejects.toThrow("request_status_check");
    expect(await db.select().from(request)).toHaveLength(1);
  });

  it("avviser en forespørsler som ikke finnes som bruker eller annonse", async () => {
    const { db, listingId } = await setup();
    await expect(db.insert(request).values({ listingId, requesterId: "finnes-ikke" })).rejects.toThrow("FOREIGN KEY");
    await expect(db.insert(request).values({ listingId: "finnes-ikke", requesterId: REQUESTER_ID })).rejects.toThrow(
      "FOREIGN KEY",
    );
    expect(await db.select().from(request)).toHaveLength(1);
  });

  it("sletter forespørselen og budene når annonsen slettes", async () => {
    const { db, listingId, requestId } = await setup();
    await db.insert(offer).values({ requestId, senderId: REQUESTER_ID, price: 200 });

    await db.delete(listing).where(eq(listing.id, listingId));

    expect(await db.select().from(request)).toHaveLength(0);
    expect(await db.select().from(offer)).toHaveLength(0);
  });
});

describe("offer-tabellen", () => {
  async function expectRejected(invalid: Record<string, unknown>, rule: string) {
    const { db, requestId } = await setup();
    const values = { requestId, senderId: REQUESTER_ID, ...invalid } as typeof offer.$inferInsert;
    await expect(db.insert(offer).values(values)).rejects.toThrow(rule);
    expect(await db.select().from(offer)).toHaveLength(0);
  }

  it("godtar et bud, en periode og et forslag uten vilkår", async () => {
    const { db, requestId } = await setup();
    await db.insert(offer).values([
      { requestId, senderId: REQUESTER_ID, price: 0 },
      { requestId, senderId: REQUESTER_ID, startDate: "2026-11-01", endDate: "2026-11-07" },
      { requestId, senderId: REQUESTER_ID },
    ]);
    expect(await db.select().from(offer)).toHaveLength(3);
  });

  it("avviser en negativ pris", async () => {
    await expectRejected({ price: -1 }, "offer_price_check");
  });

  it("avviser en dato i feil format", async () => {
    await expectRejected({ startDate: "01.11.2026", endDate: "2026-11-07" }, "offer_dates_format_check");
    await expectRejected({ startDate: "2026-11-01", endDate: "7. nov" }, "offer_dates_format_check");
  });

  it("avviser bare fra-dato eller bare til-dato", async () => {
    await expectRejected({ startDate: "2026-11-01" }, "offer_dates_pair_check");
    await expectRejected({ endDate: "2026-11-07" }, "offer_dates_pair_check");
  });

  it("avviser til-dato før fra-dato", async () => {
    await expectRejected({ startDate: "2026-11-10", endDate: "2026-11-01" }, "offer_dates_order_check");
  });

  it("avviser en avsender som ikke finnes", async () => {
    await expectRejected({ senderId: "finnes-ikke" }, "FOREIGN KEY");
  });
});
