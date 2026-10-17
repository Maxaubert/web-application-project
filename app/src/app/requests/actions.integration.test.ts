// Serverhandlingen sendBid (FK-04) mot SQLite i minnet. Beviser at brukeren alltid kommer fra økten, at uinnloggede
// og brukere uten kontooppsett sendes videre uten å lagre noe, og at feil kommer tilbake til skjemaet.
import { beforeEach, describe, expect, it, vi } from "vitest";
import { listing, offer, request, user } from "@/db/schema";
import type { Db } from "@/db/types";
import { createTestDb } from "@/test/test-db";
import { insertOwner, validListing } from "@/test/test-listings";
import { sendBid } from "./actions";

type Session = { isAuthenticated: boolean; userId?: string; needsSetup?: boolean };

const holder = vi.hoisted(() => ({ db: undefined as unknown as Db, session: {} as Session }));
vi.mock("@/db", () => ({
  get db() {
    return holder.db;
  },
}));
vi.mock("rwsdk/worker", () => ({ getRequestInfo: () => ({ ctx: { session: holder.session } }) }));

function form(fields: Record<string, string>) {
  const data = new FormData();
  for (const [key, value] of Object.entries(fields)) data.append(key, value);
  return data;
}

async function counts() {
  return { requests: (await holder.db.select().from(request)).length, offers: (await holder.db.select().from(offer)).length };
}

beforeEach(async () => {
  holder.db = createTestDb();
  await insertOwner(holder.db);
  await holder.db.insert(user).values({ id: "kari", name: "Kari Nordmann", email: "kari@hiof.no", phone: "+4791234567" });
  await holder.db.insert(listing).values(validListing({ id: "calc" }));
  holder.session = { isAuthenticated: true, userId: "kari", needsSetup: false };
});

describe("sendBid", () => {
  it("lagrer budet for brukeren i økten og sender tilbake til annonsen", async () => {
    // Skjemaet prøver å sende en annen bruker; det skal ignoreres.
    const result = await sendBid({}, form({ listingId: "calc", price: "220", userId: "owner-1", requesterId: "owner-1" }));

    expect(result).toBeInstanceOf(Response);
    expect((result as Response).headers.get("Location")).toBe("/listings/calc");
    const [req] = await holder.db.select().from(request);
    expect(req.requesterId).toBe("kari");
    expect((await holder.db.select().from(offer))[0]).toMatchObject({ senderId: "kari", price: 220 });
  });

  it("sender en uinnlogget til /login uten å lagre", async () => {
    holder.session = { isAuthenticated: false };

    const result = await sendBid({}, form({ listingId: "calc", price: "220" }));

    expect((result as Response).headers.get("Location")).toBe("/login");
    expect(await counts()).toEqual({ requests: 0, offers: 0 });
  });

  it("sender en bruker uten kontooppsett til /account-setup uten å lagre", async () => {
    holder.session = { isAuthenticated: true, userId: "kari", needsSetup: true };

    const result = await sendBid({}, form({ listingId: "calc", price: "220" }));

    expect((result as Response).headers.get("Location")).toBe("/account-setup");
    expect(await counts()).toEqual({ requests: 0, offers: 0 });
  });

  it("gir feilen og det som ble skrevet tilbake til skjemaet, og lagrer ingenting", async () => {
    const result = await sendBid({}, form({ listingId: "calc", price: "0" }));

    expect(result).toEqual({ error: undefined, fieldErrors: { price: "Bud må være minst 1 kr" }, values: { price: "0" } });
    expect(await counts()).toEqual({ requests: 0, offers: 0 });
  });

  it("avviser eieren med en feilmelding og lagrer ingenting", async () => {
    holder.session = { isAuthenticated: true, userId: "owner-1", needsSetup: false };

    const result = await sendBid({}, form({ listingId: "calc", price: "220" }));

    expect(result).toMatchObject({ error: "Du kan ikke by på din egen annonse" });
    expect(await counts()).toEqual({ requests: 0, offers: 0 });
  });
});
