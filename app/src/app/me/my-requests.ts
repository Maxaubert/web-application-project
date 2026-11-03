// Delingen av forespørslene på Min side (#193): mottatt (på mine annonser) og sendt (mine egne), med «din tur» først.
// Forespørsler viser bare pågående; alle avsluttede (fullført, avslått, trukket, utløpt, avbestilt) står i Historikk,
// fra begge roller, nyeste først (#220, Max 01.11).
import type { MyRequest } from "@/app/requests/find-requests";
import { activeStatuses } from "@/app/requests/request-status";
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

const newest = (a: MyRequest, b: MyRequest) => b.changedAt.getTime() - a.changedAt.getTime();

export function splitRequests(all: MyRequest[]): { received: MyRequest[]; sent: MyRequest[]; history: MyRequest[] } {
  const ongoing = all.filter((r) => activeStatuses.includes(r.status));
  return {
    received: ongoing.filter((r) => r.role === "owner").sort(byTurnThenNewest),
    sent: ongoing.filter((r) => r.role === "requester").sort(byTurnThenNewest),
    history: all.filter((r) => !activeStatuses.includes(r.status)).sort(newest),
  };
}
