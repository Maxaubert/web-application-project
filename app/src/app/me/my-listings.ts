// Mine annonser på Min side (FK-11, #229): egne aktive annonser med det statuslinjen trenger. Solgte hører til Historikk,
// og slettede (nedtatte) er borte (Max 24.10, AK-48). Dataene hentes gjennom repositoryet (#256); her regnes statuslinjen ut.
import type { Listing } from "@/db/schema";
import type { Db } from "@/db/types";
import { handoverEffective } from "@/app/requests/auto-confirm";
import { effectiveStatus } from "@/app/requests/request-expiry";
import { createMeRepository } from "./repository";

// pending: ventende forespørsler som ikke er utløpt. loanedUntil: siste dag i et lån i bruk (YYYY-MM-DD), ellers null.
export type MyListing = { listing: Listing; coverKey: string | null; pending: number; loanedUntil: string | null };

export async function getMyListings(db: Db, userId: string, now = new Date()): Promise<MyListing[]> {
  const repository = createMeRepository(db);
  const rows = await repository.findOwnActiveListings(userId);
  const requests = await repository.findRequestsOnOwnListings(userId);
  const offers = await repository.findOffersOnOwnListings(userId);
  // Senere forslag overskriver tidligere, så mappet ender med det siste per forespørsel.
  const latest = new Map(offers.map((o) => [o.requestId, o]));

  return rows.map(({ listing: ad, coverKey }) => {
    let pending = 0;
    let loanedUntil: string | null = null;
    for (const r of requests.filter((r) => r.listingId === ad.id)) {
      const last = latest.get(r.id);
      const status = effectiveStatus(handoverEffective(r, ad.type, now).status, last?.createdAt ?? r.createdAt, now);
      if (status === "waiting_owner" || status === "waiting_requester") pending++;
      if (status === "in_use") loanedUntil = last?.endDate ?? null;
    }
    return { listing: ad, coverKey, pending, loanedUntil };
  });
}
