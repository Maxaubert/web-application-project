// Delingen av forespørslene på Min side (#193): mottatt (på mine annonser) og sendt (mine egne), med «din tur» først.
import type { MyRequest } from "@/app/requests/queries";
import { chipFor } from "@/app/requests/request-view";

export type Show = "received" | "sent";

// ?show=sent viser Sendt; alt annet, også en ukjent verdi, gir Mottatt.
export function parseShow(value: string | null): Show {
  return value === "sent" ? "sent" : "received";
}

// Først de der det er din tur, så nyeste endring øverst. Like tider beholder rekkefølgen fra databasen.
function byTurnThenNewest(a: MyRequest, b: MyRequest): number {
  const turn = Number(chipFor(b.status, b.role).yourTurn) - Number(chipFor(a.status, a.role).yourTurn);
  return turn !== 0 ? turn : b.changedAt.getTime() - a.changedAt.getTime();
}

export function splitRequests(all: MyRequest[]): { received: MyRequest[]; sent: MyRequest[] } {
  return {
    received: all.filter((r) => r.role === "owner").sort(byTurnThenNewest),
    sent: all.filter((r) => r.role === "requester").sort(byTurnThenNewest),
  };
}
