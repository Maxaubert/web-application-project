// handoverEffective (FK-08, AK-38, #214): når regnes den andre parten som bekreftet. Ren funksjon, så grensen på 3 dager,
// hver part og hver annonsetype kan prøves ett for ett.
import { describe, expect, it } from "vitest";
import { requestStatuses } from "@/db/schema";
import { AUTO_CONFIRM_DAYS, handoverEffective } from "./auto-confirm";

const FIRST = new Date("2026-10-20T12:00:00Z");
const DAY = 86_400_000;
const after = (ms: number) => new Date(FIRST.getTime() + ms);
const accepted = (flags: { ownerConfirmed: boolean; requesterConfirmed: boolean }) => ({ status: "accepted" as const, updatedAt: FIRST, ...flags });
const owner = accepted({ ownerConfirmed: true, requesterConfirmed: false });
const requester = accepted({ ownerConfirmed: false, requesterConfirmed: true });

describe("handoverEffective", () => {
  it("fristen er 3 dager", () => {
    expect(AUTO_CONFIRM_DAYS).toBe(3);
  });

  it("like før 3 dager er ingenting endret, og ved 3 dager er begge bekreftet", () => {
    expect(handoverEffective(owner, "sale", after(3 * DAY - 1))).toEqual({ status: "accepted", ownerConfirmed: true, requesterConfirmed: false });
    expect(handoverEffective(owner, "sale", after(3 * DAY))).toEqual({ status: "completed", ownerConfirmed: true, requesterConfirmed: true });
  });

  it("det gjelder uansett hvem som bekreftet først", () => {
    expect(handoverEffective(requester, "sale", after(4 * DAY))).toEqual({ status: "completed", ownerConfirmed: true, requesterConfirmed: true });
    expect(handoverEffective(owner, "sale", after(4 * DAY))).toEqual({ status: "completed", ownerConfirmed: true, requesterConfirmed: true });
  });

  it("salg og gis bort er fullført, et lån er i bruk", () => {
    expect(handoverEffective(owner, "sale", after(3 * DAY)).status).toBe("completed");
    expect(handoverEffective(owner, "giveaway", after(3 * DAY)).status).toBe("completed");
    expect(handoverEffective(owner, "loan", after(3 * DAY)).status).toBe("in_use");
  });

  it("ingen bekreftelser regnes aldri som bekreftet, uansett hvor lenge det er siden", () => {
    const none = accepted({ ownerConfirmed: false, requesterConfirmed: false });
    expect(handoverEffective(none, "sale", after(30 * DAY))).toEqual({ status: "accepted", ownerConfirmed: false, requesterConfirmed: false });
  });

  it("når begge har bekreftet, er det ingenting å regne ut", () => {
    const both = accepted({ ownerConfirmed: true, requesterConfirmed: true });
    expect(handoverEffective(both, "sale", after(30 * DAY))).toEqual({ status: "accepted", ownerConfirmed: true, requesterConfirmed: true });
  });

  it("bare en avtalt forespørsel regnes ut: alle andre statuser står som de er", () => {
    for (const status of requestStatuses.filter((s) => s !== "accepted")) {
      expect(handoverEffective({ ...owner, status }, "sale", after(30 * DAY)), status).toEqual({ status, ownerConfirmed: true, requesterConfirmed: false });
    }
  });
});
