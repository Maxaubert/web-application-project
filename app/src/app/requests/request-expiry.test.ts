// Fristen på 7 dager (FK-08, AK-39, #187): når en ventende forespørsel regnes som utløpt. Rene funksjoner uten database.
import { describe, expect, it } from "vitest";
import { requestStatuses } from "@/db/schema";
import { EXPIRY_DAYS, effectiveStatus } from "./request-expiry";

const DAY_MS = 86_400_000;
const lastOffer = new Date("2026-10-10T12:00:00Z");
const after = (ms: number) => new Date(lastOffer.getTime() + ms);

describe("effectiveStatus", () => {
  it("fristen er 7 dager", () => {
    expect(EXPIRY_DAYS).toBe(7);
  });

  it("en ventende forespørsel er åpen like før 7 dager og utløpt ved 7 dager, i begge ventestatuser", () => {
    for (const status of ["waiting_owner", "waiting_requester"] as const) {
      expect(effectiveStatus(status, lastOffer, after(7 * DAY_MS - 1))).toBe(status);
      expect(effectiveStatus(status, lastOffer, after(7 * DAY_MS))).toBe("expired");
      expect(effectiveStatus(status, lastOffer, after(30 * DAY_MS))).toBe("expired");
    }
  });

  it("en ny forespørsel er åpen", () => {
    expect(effectiveStatus("waiting_owner", lastOffer, lastOffer)).toBe("waiting_owner");
  });

  it("alle andre statuser er uendret, uansett hvor gammelt det er", () => {
    for (const status of requestStatuses.filter((s) => !s.startsWith("waiting"))) {
      expect(effectiveStatus(status, lastOffer, after(60 * DAY_MS)), status).toBe(status);
    }
  });
});
