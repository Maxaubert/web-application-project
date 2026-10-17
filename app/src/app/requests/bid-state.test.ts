// Annonsesiden velger knapp ut fra annonsen, brukeren og en eventuell pågående forespørsel (A til D i mockupen).
import { describe, expect, it } from "vitest";
import { bidState } from "./bid-state";

const listing = { type: "sale", status: "active", ownerId: "owner" } as const;
const mine = { id: "r1", status: "waiting_owner", price: 220 } as const;

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

  it("D: solgt gir sold for andre, men egen solgt annonse er fortsatt own", () => {
    expect(bidState({ ...listing, status: "sold" }, "kari", undefined)).toEqual({ kind: "sold" });
    expect(bidState({ ...listing, status: "sold" }, "owner", undefined)).toEqual({ kind: "own" });
  });

  it("lån, gis bort og nedtatte annonser gir ingen knapp", () => {
    expect(bidState({ ...listing, type: "loan" }, "kari", undefined)).toEqual({ kind: "none" });
    expect(bidState({ ...listing, type: "giveaway" }, "owner", undefined)).toEqual({ kind: "none" });
    expect(bidState({ ...listing, status: "unpublished" }, "kari", undefined)).toEqual({ kind: "none" });
  });
});
