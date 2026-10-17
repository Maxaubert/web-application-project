// Tilstandsmaskinen skal tillate nøyaktig overgangene i kravspesifikasjonen og avvise alt annet.
// Listen under er fasiten; testen prøver alle kombinasjoner av status, handling og part.
import { describe, expect, it } from "vitest";
import { requestStatuses } from "@/db/schema";
import { nextStatus, statusAfterHandover, type Actor, type RequestAction, type RequestStatus } from "./request-status";

const actions: RequestAction[] = ["counter", "accept", "decline", "withdraw", "cancel", "expire", "confirm_return"];
const actors: Actor[] = ["owner", "requester", "system"];

// [status, handling, part, ny status]
const allowed: [RequestStatus, RequestAction, Actor, RequestStatus][] = [
  ["waiting_owner", "counter", "owner", "waiting_requester"],
  ["waiting_requester", "counter", "requester", "waiting_owner"],
  ["waiting_owner", "accept", "owner", "accepted"],
  ["waiting_requester", "accept", "requester", "accepted"],
  ["waiting_owner", "decline", "owner", "declined"],
  ["waiting_requester", "decline", "requester", "declined"],
  ["waiting_owner", "withdraw", "requester", "withdrawn"],
  ["waiting_requester", "withdraw", "requester", "withdrawn"],
  ["accepted", "cancel", "owner", "cancelled"],
  ["accepted", "cancel", "requester", "cancelled"],
  ["waiting_owner", "expire", "system", "expired"],
  ["waiting_requester", "expire", "system", "expired"],
  ["in_use", "confirm_return", "owner", "completed"],
];

describe("nextStatus", () => {
  it.each(allowed)("%s + %s av %s gir %s", (status, action, actor, expected) => {
    expect(nextStatus(status, action, actor)).toBe(expected);
  });

  it("avviser alle andre kombinasjoner av status, handling og part", () => {
    const rejected: string[] = [];
    for (const status of requestStatuses) {
      for (const action of actions) {
        for (const actor of actors) {
          const isAllowed = allowed.some(([s, a, p]) => s === status && a === action && p === actor);
          if (!isAllowed && nextStatus(status, action, actor) !== null) rejected.push(`${status}/${action}/${actor}`);
        }
      }
    }
    expect(rejected).toEqual([]);
  });

  it("lar ingen svare i en ferdig forespørsel", () => {
    for (const status of ["declined", "withdrawn", "expired", "cancelled", "completed"] as const) {
      for (const action of actions) {
        for (const actor of actors) expect(nextStatus(status, action, actor)).toBeNull();
      }
    }
  });

  it("lar ingen avbestille midt i et lån", () => {
    expect(nextStatus("in_use", "cancel", "owner")).toBeNull();
    expect(nextStatus("in_use", "cancel", "requester")).toBeNull();
  });
});

describe("statusAfterHandover", () => {
  it("venter til begge har bekreftet", () => {
    expect(statusAfterHandover("sale", true, false)).toBe("accepted");
    expect(statusAfterHandover("sale", false, true)).toBe("accepted");
    expect(statusAfterHandover("loan", false, false)).toBe("accepted");
  });

  it("fullfører salg og gis bort når begge har bekreftet", () => {
    expect(statusAfterHandover("sale", true, true)).toBe("completed");
    expect(statusAfterHandover("giveaway", true, true)).toBe("completed");
  });

  it("setter et lån i bruk når begge har bekreftet", () => {
    expect(statusAfterHandover("loan", true, true)).toBe("in_use");
  });
});
