// Annonsesiden velger knapp ut fra annonsen, brukeren og en eventuell pågående forespørsel (A til D i mockupen).
import { describe, expect, it } from "vitest";
import { bidState } from "./bid-state";

const listing = { type: "sale", status: "active", ownerId: "owner" } as const;
const mine = { id: "r1", status: "waiting_owner", price: 220, startDate: null, endDate: null } as const;
const period = { id: "r2", status: "waiting_owner", price: null, startDate: "2026-11-12", endDate: "2026-11-18" } as const;

describe("bidState", () => {
  it("A: andres aktive salgsannonse uten forespørsel gir can_bid", () => {
    expect(bidState(listing, "kari", undefined)).toEqual({ kind: "can_bid" });
  });

  it("B: et ventende bud gir has_bid med prisen, og det kan endres", () => {
    expect(bidState(listing, "kari", mine)).toEqual({ kind: "has_bid", requestId: "r1", price: 220, canChange: true });
  });

  it("B: etter et svar fra selgeren kan budet ikke endres her", () => {
    expect(bidState(listing, "kari", { ...mine, status: "waiting_requester" })).toMatchObject({ kind: "has_bid", canChange: false });
  });

  it("C: egen annonse gir own, også med et gammelt bud", () => {
    expect(bidState(listing, "owner", undefined)).toEqual({ kind: "own" });
    expect(bidState(listing, "owner", mine)).toEqual({ kind: "own" });
  });

  // Endret 24.10 (#229, AK-50): eieren får «Administrer» bare på en aktiv annonse; en solgt kan ikke endres.
  it("D: solgt gir sold for alle, også eieren", () => {
    expect(bidState({ ...listing, status: "sold" }, "kari", undefined)).toEqual({ kind: "sold" });
    expect(bidState({ ...listing, status: "sold" }, "owner", undefined)).toEqual({ kind: "sold" });
  });

  it("nedtatte annonser gir ingen knapp, uansett type", () => {
    for (const type of ["sale", "loan", "giveaway"] as const) {
      expect(bidState({ ...listing, type, status: "unpublished" }, "kari", undefined)).toEqual({ kind: "none" });
    }
  });

  it("lån og gis bort (#186): andres aktive annonse uten forespørsel gir can_request", () => {
    expect(bidState({ ...listing, type: "loan" }, "kari", undefined)).toEqual({ kind: "can_request" });
    expect(bidState({ ...listing, type: "giveaway" }, "kari", undefined)).toEqual({ kind: "can_request" });
  });

  it("lån og gis bort: en sendt forespørsel gir has_request med perioden, uten mulighet til å endre", () => {
    expect(bidState({ ...listing, type: "loan" }, "kari", period)).toEqual({
      kind: "has_request",
      requestId: "r2",
      startDate: "2026-11-12",
      endDate: "2026-11-18",
    });
    expect(bidState({ ...listing, type: "giveaway" }, "kari", { ...period, startDate: null, endDate: null })).toMatchObject({
      kind: "has_request",
      startDate: null,
    });
  });

  it("lån og gis bort: egen annonse gir own og en gis bort som er tatt gir sold", () => {
    expect(bidState({ ...listing, type: "loan" }, "owner", undefined)).toEqual({ kind: "own" });
    expect(bidState({ ...listing, type: "giveaway", status: "sold" }, "kari", undefined)).toEqual({ kind: "sold" });
  });
});
