// Serverhandlingen sendBid (FK-04) mot SQLite i minnet. Beviser at brukeren alltid kommer fra økten, at uinnloggede
// og brukere uten kontooppsett sendes videre uten å lagre noe, og at feil kommer tilbake til skjemaet.
import { beforeEach, describe, expect, it, vi } from "vitest";
import { listing, offer, request, user } from "@/db/schema";
import type { Db } from "@/db/types";
import { createTestDb } from "@/test/test-db";
import { insertOwner, OWNER_ID, validListing } from "@/test/test-listings";
import { respondToRequest, sendBid, sendRequest } from "./actions";

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

// sendRequest (#186): lån og gis bort. Brukeren kommer fra økten, aldri fra skjemaet.
describe("sendRequest", () => {
  beforeEach(async () => {
    await holder.db.insert(listing).values([validListing({ id: "tent", type: "loan", price: 60 }), validListing({ id: "lamp", type: "giveaway", price: null })]);
  });

  it("lagrer perioden for brukeren i økten og sender tilbake til annonsen", async () => {
    const result = await sendRequest({}, form({ listingId: "tent", startDate: "2026-11-12", endDate: "2026-11-18", userId: OWNER_ID, requesterId: OWNER_ID }));

    expect((result as Response).headers.get("Location")).toBe("/listings/tent");
    expect((await holder.db.select().from(request))[0]).toMatchObject({ requesterId: "kari", listingId: "tent" });
    expect((await holder.db.select().from(offer))[0]).toMatchObject({ senderId: "kari", startDate: "2026-11-12", endDate: "2026-11-18" });
  });

  it("gis bort lagres uten datoer", async () => {
    const result = await sendRequest({}, form({ listingId: "lamp" }));

    expect((result as Response).headers.get("Location")).toBe("/listings/lamp");
    expect((await holder.db.select().from(offer))[0]).toMatchObject({ startDate: null, endDate: null, price: null });
  });

  it("sender en uinnlogget til /login og en bruker uten kontooppsett til /account-setup uten å lagre", async () => {
    holder.session = { isAuthenticated: false };
    const loggedOut = await sendRequest({}, form({ listingId: "lamp" }));
    holder.session = { isAuthenticated: true, userId: "kari", needsSetup: true };
    const noSetup = await sendRequest({}, form({ listingId: "lamp" }));

    expect((loggedOut as Response).headers.get("Location")).toBe("/login");
    expect((noSetup as Response).headers.get("Location")).toBe("/account-setup");
    expect(await counts()).toEqual({ requests: 0, offers: 0 });
  });

  it("gir feilen og datoene tilbake til skjemaet, og lagrer ingenting", async () => {
    const result = await sendRequest({}, form({ listingId: "tent", startDate: "2026-11-12", endDate: "2026-11-14" }));

    expect(result).toEqual({
      error: undefined,
      fieldErrors: { endDate: "Lånet må vare minst én uke" },
      values: { startDate: "2026-11-12", endDate: "2026-11-14" },
    });
    expect(await counts()).toEqual({ requests: 0, offers: 0 });
  });
});

// respondToRequest (#187): samme mønster som sendBid. Brukeren kommer alltid fra økten, aldri fra skjemaet.
describe("respondToRequest", () => {
  beforeEach(async () => {
    await holder.db.insert(request).values({ id: "r1", listingId: "calc", requesterId: "kari" });
    await holder.db.insert(offer).values({ id: "o1", requestId: "r1", senderId: "kari", price: 220 });
    holder.session = { isAuthenticated: true, userId: OWNER_ID, needsSetup: false };
  });

  async function status() {
    return (await holder.db.select().from(request))[0].status;
  }

  it("godtar for brukeren i økten og sender tilbake til forespørselssiden", async () => {
    const result = await respondToRequest({}, form({ requestId: "r1", offerId: "o1", intent: "accept" }));

    expect((result as Response).headers.get("Location")).toBe("/requests/r1?sendt=godtatt");
    expect(await status()).toBe("accepted");
  });

  it("et motbud lagres med prisen fra skjemaet og avsenderen fra økten", async () => {
    await respondToRequest({}, form({ requestId: "r1", offerId: "o1", intent: "counter", price: "240", senderId: "kari" }));

    const offers = await holder.db.select().from(offer);
    expect(offers[1]).toMatchObject({ senderId: OWNER_ID, price: 240 });
    expect(await status()).toBe("waiting_requester");
  });

  it("et motbud sender tilbake med markøren «motbud»", async () => {
    const result = await respondToRequest({}, form({ requestId: "r1", offerId: "o1", intent: "counter", price: "240" }));

    expect((result as Response).headers.get("Location")).toBe("/requests/r1?sendt=motbud");
  });

  it("avslag fra selgeren gir markøren «avslatt»", async () => {
    const result = await respondToRequest({}, form({ requestId: "r1", offerId: "o1", intent: "decline" }));

    expect((result as Response).headers.get("Location")).toBe("/requests/r1?sendt=avslatt");
  });

  describe("lån (#208)", () => {
    beforeEach(async () => {
      await holder.db.insert(listing).values(validListing({ id: "tent", type: "loan", price: 60 }));
      await holder.db.insert(request).values({ id: "rl", listingId: "tent", requesterId: "kari" });
      await holder.db.insert(offer).values({ id: "ol", requestId: "rl", senderId: "kari", startDate: "2026-11-12", endDate: "2026-11-19" });
    });

    it("et lånemotbud lagrer perioden fra skjemaet med avsenderen fra økten og sender tilbake med «motbud»", async () => {
      const result = await respondToRequest(
        {},
        form({ requestId: "rl", offerId: "ol", intent: "counter", startDate: "2026-11-14", endDate: "2026-11-21", senderId: "kari" }),
      );

      expect((result as Response).headers.get("Location")).toBe("/requests/rl?sendt=motbud");
      const offers = await holder.db.select().from(offer);
      expect(offers[offers.length - 1]).toMatchObject({ senderId: OWNER_ID, startDate: "2026-11-14", endDate: "2026-11-21", price: null });
    });

    it("gir feilen og datoene tilbake til skjemaet, og lagrer ingenting", async () => {
      const before = await counts();

      const result = await respondToRequest({}, form({ requestId: "rl", offerId: "ol", intent: "counter", startDate: "2026-11-14", endDate: "2026-11-16" }));

      expect(result).toEqual({
        error: undefined,
        fieldErrors: { endDate: "Lånet må vare minst én uke" },
        values: { price: "", startDate: "2026-11-14", endDate: "2026-11-16" },
      });
      expect(await counts()).toEqual(before);
    });
  });

  it("kjøperen i økten kan ikke svare på sitt eget bud, selv om skjemaet påstår noe annet", async () => {
    holder.session = { isAuthenticated: true, userId: "kari", needsSetup: false };

    const result = await respondToRequest({}, form({ requestId: "r1", offerId: "o1", intent: "accept", userId: OWNER_ID, role: "owner" }));

    expect(result).toMatchObject({ error: "Du kan ikke svare på denne forespørselen nå" });
    expect(await status()).toBe("waiting_owner");
  });

  it("sender en uinnlogget til /login og en bruker uten kontooppsett til /account-setup, uten å endre noe", async () => {
    holder.session = { isAuthenticated: false };
    const loggedOut = await respondToRequest({}, form({ requestId: "r1", offerId: "o1", intent: "accept" }));
    holder.session = { isAuthenticated: true, userId: OWNER_ID, needsSetup: true };
    const noSetup = await respondToRequest({}, form({ requestId: "r1", offerId: "o1", intent: "accept" }));

    expect((loggedOut as Response).headers.get("Location")).toBe("/login");
    expect((noSetup as Response).headers.get("Location")).toBe("/account-setup");
    expect(await status()).toBe("waiting_owner");
  });

  it("gir feilen og prisen tilbake til skjemaet, og lagrer ingenting", async () => {
    const result = await respondToRequest({}, form({ requestId: "r1", offerId: "o1", intent: "counter", price: "0" }));

    expect(result).toEqual({
      error: undefined,
      fieldErrors: { price: "Bud må være minst 1 kr" },
      values: { price: "0", startDate: "", endDate: "" },
    });
    expect(await counts()).toEqual({ requests: 1, offers: 1 });
    expect(await status()).toBe("waiting_owner");
  });

  it("mangler feltene, avvises det uten å endre noe", async () => {
    const result = await respondToRequest({}, form({}));

    expect(result).toMatchObject({ error: "Ukjent handling" });
    expect(await status()).toBe("waiting_owner");
  });
});
