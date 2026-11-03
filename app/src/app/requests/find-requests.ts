// Henting av forespørsler slik sidene og reglene trenger dem (#256, tidligere queries.ts). Dataene kommer fra repositoryet;
// her regnes statusen ut for 7-dagersfristen (#187) og den automatiske bekreftelsen etter 3 dager (#214), så alle sider
// viser det samme. En GET endrer aldri databasen; lagringen skjer i skrivefunksjonene.
import type { Listing, Offer, Request } from "@/db/schema";
import type { Db } from "@/db/types";
import { handoverEffective } from "./auto-confirm";
import { effectiveStatus } from "./request-expiry";
import type { RequestStatus } from "./request-status";
import { createRequestRepository } from "./repository";

// price: det siste budet. Salg har alltid pris, men kolonnen kan være tom for lån og gis bort.
// startDate og endDate: perioden i det siste forslaget, bare for lån (#186).
export type ActiveRequest = { id: string; status: RequestStatus; price: number | null; startDate: string | null; endDate: string | null };

// Studentens pågående forespørsel på en annonse, med siste bud, eller undefined. Et bud som har ligget ubesvart i 7 dager
// er utløpt og regnes ikke som pågående (#187).
export async function getActiveRequest(db: Db, listingId: string, requesterId: string, now = new Date()): Promise<ActiveRequest | undefined> {
  const row = await createRequestRepository(db).findActiveWithLastOffer(listingId, requesterId);
  if (!row || effectiveStatus(row.status, row.lastOfferAt, now) === "expired") return undefined;
  return { id: row.id, status: row.status, price: row.price, startDate: row.startDate, endDate: row.endDate };
}

export type RequestRole = "owner" | "requester";

// Én rad i listen på Min side (#193): forespørselen sett fra den innloggede.
// otherName: den andre parten (kjøperen for eieren, selgeren for kjøperen). price og changedAt kommer fra siste bud.
export type MyRequest = {
  id: string;
  status: RequestStatus;
  role: RequestRole;
  listing: Listing;
  coverKey: string | null;
  otherName: string;
  price: number | null;
  changedAt: Date;
};

// Alle forespørslene der brukeren er eier av annonsen eller har lagt inn forespørselen, med siste bud og forsidebilde.
// Rekkefølgen avgjøres av siden, ikke her.
export async function getRequestsForUser(db: Db, userId: string, now = new Date()): Promise<MyRequest[]> {
  const repository = createRequestRepository(db);
  const rows = await repository.findForUser(userId);
  // Senere bud overskriver tidligere, så mappet ender med det siste per forespørsel.
  const latest = new Map<string, Offer>((await repository.findOffersForUser(userId)).map((o) => [o.requestId, o]));

  return rows.map((row) => {
    const role: RequestRole = row.listing.ownerId === userId ? "owner" : "requester";
    const last = latest.get(row.request.id);
    const lastOfferAt = last?.createdAt ?? row.request.createdAt;
    // Sist endret: siste bud eller siste statusendring (avslag, aksept), det som er nyest. Fristen regnes bare fra budet.
    const changedAt = new Date(Math.max(lastOfferAt.getTime(), row.request.updatedAt.getTime()));
    return {
      id: row.request.id,
      status: effectiveStatus(handoverEffective(row.request, row.listing.type, now).status, lastOfferAt, now),
      role,
      listing: row.listing,
      coverKey: row.coverKey,
      otherName: role === "owner" ? row.requesterName : row.ownerName,
      price: last?.price ?? null,
      changedAt,
    };
  });
}

export type RequestDetails = {
  request: Request;
  listing: Listing;
  ownerName: string;
  requesterName: string;
  // Alle forslagene, det eldste først. Det siste er gjeldende.
  offers: Offer[];
  role: RequestRole;
};

// Forespørselen med annonsen, begge parters navn og alle forslagene, men bare for de to partene. For alle andre, og for
// en ukjent id, er svaret undefined (siden gir 404).
export async function getRequestForParty(db: Db, requestId: string, userId: string, now = new Date()): Promise<RequestDetails | undefined> {
  const repository = createRequestRepository(db);
  const row = await repository.findForParty(requestId, userId);
  if (!row) return undefined;

  const offers = await repository.findOffers(requestId);
  const lastOfferAt = offers[offers.length - 1]?.createdAt ?? row.request.createdAt;
  const handover = handoverEffective(row.request, row.listing.type, now);
  const found = { ...row.request, ...handover, status: effectiveStatus(handover.status, lastOfferAt, now) };
  return { ...row, request: found, offers, role: row.listing.ownerId === userId ? "owner" : "requester" };
}
