// Tekstene på forespørselssiden (#192): banneret øverst og chipen i Min side. Rene funksjoner uten database,
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

// Chipen på raden i Min side (#193): hvis tur det er mens forespørselen venter, ellers statusen. Mørk når det er din tur.
export type Chip = { text: string; yourTurn: boolean };

export function chipFor(status: RequestStatus, role: RequestRole): Chip {
  if (status === "waiting_owner") {
    return role === "owner" ? { text: "Din tur", yourTurn: true } : { text: "Selgers tur", yourTurn: false };
  }
  if (status === "waiting_requester") {
    return role === "owner" ? { text: "Kjøpers tur", yourTurn: false } : { text: "Din tur", yourTurn: true };
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

// Meldingen som vises rett etter et svar (#203): siden åpnes med ?sendt=<markør>, satt av serverhandlingen. Markøren
// teller bare når den stemmer med det som faktisk er lagret, så en tastet adresse ikke viser en falsk melding.
export const noticeMarkers = { counter: "motbud", accept: "godtatt", decline: "avslatt" } as const;

export function noticeFor(
  marker: string | null,
  status: RequestStatus,
  latest: Pick<Offer, "senderId" | "price"> | undefined,
  viewerId: string,
): string | null {
  if (marker === noticeMarkers.counter) {
    const waiting = status === "waiting_owner" || status === "waiting_requester";
    if (!waiting || !latest || latest.senderId !== viewerId || latest.price === null) return null;
    return `Motbud sendt: ${latest.price.toLocaleString("nb-NO")} kr`;
  }
  if (marker === noticeMarkers.accept) return status === "accepted" ? "Du godtok budet" : null;
  if (marker === noticeMarkers.decline) return status === "declined" ? "Forespørselen er avslått" : null;
  return null;
}
