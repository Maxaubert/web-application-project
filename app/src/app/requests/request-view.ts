// Tekstene på forespørselssiden (#192): banneret øverst og linjene i historikken. Rene funksjoner uten database,
// så rollene og statusene kan testes ett for ett.
import type { Offer } from "@/db/schema";
import type { RequestRole } from "./queries";
import type { RequestStatus } from "./request-status";

type Names = { ownerName: string; requesterName: string };

// yourTurn: banneret er mørkt når det er din tur å svare, og lyst når du venter eller forespørselen er avsluttet.
export type Banner = { text: string; yourTurn: boolean };

const finished: Partial<Record<RequestStatus, string>> = {
  accepted: "Avtalt",
  declined: "Avslått",
  withdrawn: "Trukket tilbake",
  expired: "Utløpt",
  cancelled: "Avbestilt",
  in_use: "I bruk",
  completed: "Fullført",
};

export function bannerFor(status: RequestStatus, role: RequestRole, { ownerName, requesterName }: Names): Banner {
  const other = role === "owner" ? requesterName : ownerName;
  if (status === "waiting_owner") {
    return role === "owner"
      ? { text: `Nytt bud fra ${requesterName}`, yourTurn: true }
      : { text: `Venter på svar fra ${other}`, yourTurn: false };
  }
  if (status === "waiting_requester") {
    return role === "owner"
      ? { text: `Venter på svar fra ${other}`, yourTurn: false }
      : { text: `Motforslag fra ${other}`, yourTurn: true };
  }
  return { text: finished[status] ?? status, yourTurn: false };
}

// Etiketten over budkortet: «Bud» fra forespørreren, «Motbud» fra eieren, og «Ditt …» når det er ditt eget.
export function offerLabel(offer: Pick<Offer, "senderId">, viewerId: string, requesterId: string): string {
  const base = offer.senderId === requesterId ? "bud" : "motbud";
  return offer.senderId === viewerId ? `Ditt ${base}` : base[0].toUpperCase() + base.slice(1);
}

const clock =new Intl.DateTimeFormat("nb-NO", {
  timeZone: "Europe/Oslo",
  day: "2-digit",
  month: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

// «17.10 kl. 03:12», alltid i norsk tid. Serveren går i UTC, så tidssonen må settes her.
export function formatWhen(date: Date): string {
  const part = (type: string) => clock.formatToParts(date).find((p) => p.type === type)?.value ?? "";
  return `${part("day")}.${part("month")} kl. ${part("hour")}:${part("minute")}`;
}

// En linje i historikken: «Du bød 230 kr» eller «Kari Hansen bød 230 kr». Forespørreren byr, eieren foreslår (motbud).
// Bare priser; perioder for lån kommer med #186.
export function historyLine(
  offer: Pick<Offer, "senderId" | "price" | "createdAt">,
  viewerId: string,
  requesterId: string,
  names: Names,
): string {
  const fromRequester = offer.senderId === requesterId;
  const who = offer.senderId === viewerId ? "Du" : fromRequester ? names.requesterName : names.ownerName;
  const amount = offer.price === null ? "" : ` ${offer.price.toLocaleString("nb-NO")} kr`;
  return `${formatWhen(offer.createdAt)} · ${who} ${fromRequester ? "bød" : "foreslo"}${amount}`;
}
