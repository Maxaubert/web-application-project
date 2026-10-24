// Mine annonser på Min side (FK-11, #229): egne aktive annonser med det statuslinjen trenger. Solgte hører til Historikk,
// og slettede (nedtatte) er borte (Max 24.10, AK-48). Tar databasen som argument, så testene kan bruke SQLite i minnet.
import { and, asc, desc, eq, sql } from "drizzle-orm";
import { listing, listingImage, offer, request, type Listing } from "@/db/schema";
import type { Db } from "@/db/types";
import { handoverEffective } from "@/app/requests/auto-confirm";
import { effectiveStatus } from "@/app/requests/request-expiry";

// pending: ventende forespørsler som ikke er utløpt. loanedUntil: siste dag i et lån i bruk (YYYY-MM-DD), ellers null.
export type MyListing = { listing: Listing; coverKey: string | null; pending: number; loanedUntil: string | null };

export async function getMyListings(db: Db, userId: string, now = new Date()): Promise<MyListing[]> {
  const rows = await db
    .select({ listing, coverKey: listingImage.key })
    .from(listing)
    .leftJoin(listingImage, and(eq(listingImage.listingId, listing.id), eq(listingImage.position, 0)))
    .where(and(eq(listing.ownerId, userId), eq(listing.status, "active")))
    .orderBy(desc(listing.createdAt));

  // Forespørsler og forslag hentes med en join på eieren, ikke med en liste av id-er: D1 godtar høyst 100 parametere per
  // spørring, så inArray feiler for en bruker med mange annonser (funnet av nettlesertesten 24.10).
  const requests = (
    await db.select({ request }).from(request).innerJoin(listing, eq(request.listingId, listing.id)).where(eq(listing.ownerId, userId))
  ).map((row) => row.request);
  const offers = (
    await db
      .select({ offer })
      .from(offer)
      .innerJoin(request, eq(offer.requestId, request.id))
      .innerJoin(listing, eq(request.listingId, listing.id))
      .where(eq(listing.ownerId, userId))
      .orderBy(asc(sql`${offer}.rowid`))
  ).map((row) => row.offer);
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
